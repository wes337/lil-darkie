"use client";
import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import { describeIssues } from "@/lib/cms/schema";
import type { Version } from "@/lib/cms/store";
import Dialog, { Confirm, ConfirmDelete } from "./dialog";
import Icon from "./icon";
import { useFetched, type RecordState } from "./use-record";
import { useUnsavedChanges } from "./use-unsaved-changes";

// A text box holding the record as JSON, for pasting to and from an AI
// assistant. Valid edits flow into the editor at once; invalid ones show
// what is wrong and leave the record as it was.
function JsonEditor<T>({ record, onInvalid }: { record: RecordState<T>; onInvalid: (invalid: boolean) => void }) {
  const [text, setText] = useState(() => JSON.stringify(record.doc, null, 2));
  const [problems, setProblems] = useState<string[]>([]);
  useUnsavedChanges(problems.length > 0);

  function onChange(next: string) {
    setText(next);
    let parsed: unknown;
    try {
      parsed = JSON.parse(next);
    } catch {
      setProblems(["Invalid JSON"]);
      onInvalid(true);
      return;
    }
    const result = (record.schema as z.ZodType<T>).safeParse(parsed);
    setProblems(result.success ? [] : describeIssues(result.error));
    onInvalid(!result.success);
    if (result.success) record.setDoc(result.data);
  }

  return (
    <>
      <textarea
        className="json"
        value={text}
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
      />
      <Issues issues={problems} />
    </>
  );
}

// The last saves of this record. Loading one puts it in the editor; nothing
// goes live until Save is pressed.
function History<T>({ record, onLoad }: { record: RecordState<T>; onLoad: () => void }) {
  const versions = useFetched<Version<never>[]>(`${record.path}/versions`);
  if (!versions) return <p>Loading...</p>;
  if (versions.length === 0) return <p>No saved versions yet.</p>;

  return (
    <ul className="history">
      {versions.map((version, i) => (
        <li key={version.savedAt}>
          <span>
            {new Date(version.savedAt).toLocaleString()}
            {i === 0 && " (current)"}
          </span>
          <button
            type="button"
            onClick={() => {
              record.setDoc(version.data as T);
              onLoad();
            }}
          >
            Restore
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Issues({ issues }: { issues: string[] }) {
  if (issues.length === 0) return null;
  return (
    <ul className="issues" role="alert">
      {issues.map((issue) => (
        <li key={issue}>{issue}</li>
      ))}
    </ul>
  );
}

export function SaveStatus({ dirty, saving, saved }: { dirty: boolean; saving: boolean; saved: boolean }) {
  return (
    <span role="status" className={saved && !dirty ? "saved" : undefined}>
      {saving ? "Saving…" : dirty ? "Unsaved changes" : saved ? "Saved" : ""}
    </span>
  );
}

// The frame around every editor: title, Save, the form on the left and a
// live preview on the right. Each editor supplies its own form tabs, shown
// as toggles when there is more than one. JSON and History open in dialogs.
export default function Editor<T>({
  title,
  onTitleChange,
  icon,
  record,
  backHref,
  viewHref,
  deletable = false,
  tabs,
  preview,
}: {
  title: string;
  // Applies an inline title edit to the draft; the main Save persists it.
  onTitleChange?: (title: string) => void;
  // The FatCow icon of the section this record belongs to.
  icon: string;
  record: RecordState<T>;
  // The list this record belongs to. Omitted for the site settings.
  backHref?: string;
  // Where the saved record can be seen on the public site.
  viewHref?: string;
  deletable?: boolean;
  // The form, split into named tabs in the order given.
  tabs: Record<string, ReactNode>;
  // Left out for editors that already show the content as it will look.
  preview?: ReactNode;
}) {
  const router = useRouter();
  const names = Object.keys(tabs);
  const [tab, setTab] = useState(names[0]);
  const [dialog, setDialog] = useState<"JSON" | "History">();
  const [deleting, setDeleting] = useState(false);
  const [deleteIssues, setDeleteIssues] = useState<string[]>([]);
  const [invalidJson, setInvalidJson] = useState(false);
  const [discardJson, setDiscardJson] = useState(false);
  const [titleDraft, setTitleDraft] = useState<string>();
  const editTitleButton = useRef<HTMLButtonElement>(null);
  const titleChanged = titleDraft !== undefined && titleDraft !== title;
  useUnsavedChanges(titleChanged);
  const { state } = record;

  function finishTitleEdit(apply: boolean) {
    if (apply) {
      const next = titleDraft?.trim();
      if (!next) return;
      onTitleChange?.(next);
    }
    setTitleDraft(undefined);
    requestAnimationFrame(() => editTitleButton.current?.focus());
  }

  async function remove() {
    try {
      const response = await fetch(record.path, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      router.push(backHref ?? "/admin");
    } catch {
      setDeleting(false);
      setDeleteIssues(["Couldn't delete this record. Your edits are still here. Try again."]);
    }
  }

  function closeDialog() {
    if (invalidJson) {
      setDiscardJson(true);
      return;
    }
    setDialog(undefined);
  }

  function discardJsonEdits() {
    setDiscardJson(false);
    setInvalidJson(false);
    setDialog(undefined);
  }

  return (
    <div className="editor">
      <header className="editor-header">
        {backHref && (
          <a className="button" href={backHref} aria-label="Back" title="Back">
            <Icon name="arrow_left" size={32} />
          </a>
        )}
        {onTitleChange ? (
          <div className="editor-title">
            <Icon name={icon} size={32} />
            {titleDraft === undefined ? (
              <>
                <h1>{title}</h1>
                <button
                  ref={editTitleButton}
                  type="button"
                  className="bare"
                  aria-label="Edit title"
                  title="Edit title"
                  onClick={() => setTitleDraft(title)}
                >
                  <Icon name="pencil" />
                </button>
              </>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  finishTitleEdit(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    finishTitleEdit(false);
                  }
                }}
              >
                <input
                  type="text"
                  aria-label="Title"
                  value={titleDraft}
                  required
                  autoFocus
                  onFocus={(event) => event.currentTarget.select()}
                  onChange={(event) => setTitleDraft(event.target.value)}
                />
                <button type="submit" className="bare" aria-label="Apply title" title="Apply title" disabled={!titleDraft.trim()}>
                  <Icon name="tick" />
                </button>
                <button type="button" className="bare" aria-label="Cancel title edit" title="Cancel title edit" onClick={() => finishTitleEdit(false)}>
                  <Icon name="cross" />
                </button>
              </form>
            )}
          </div>
        ) : (
          <h1>
            <Icon name={icon} size={32} />
            {title}
          </h1>
        )}
        <span className="spacer" />
        <SaveStatus dirty={record.dirty || titleChanged} saving={state.saving} saved={state.saved} />
        <div className="tabs">
          {names.length > 1 &&
            names.map((name) => (
              <button
                type="button"
                key={name}
                aria-pressed={tab === name}
                onClick={() => setTab(name)}
              >
                {name}
              </button>
            ))}
          <button type="button" onClick={() => setDialog("JSON")}>
            JSON
          </button>
          <button type="button" onClick={() => setDialog("History")}>
            History
          </button>
        </div>
        <span className="divider" />
        {viewHref && record.exists && (
          <a className="button" href={viewHref} target="_blank">
            <Icon name="world_go" />
            View
          </a>
        )}
        {deletable && record.exists && (
          <button type="button" className="danger" disabled={state.saving} onClick={() => setDeleting(true)}>
            Delete
          </button>
        )}
        <button type="button" className="primary" disabled={state.saving || deleting || titleDraft !== undefined} onClick={() => record.save()}>
          <Icon name="diskette" />
          Save
        </button>
      </header>
      <Issues issues={[...state.issues, ...deleteIssues]} />
      <div className="editor-body" data-preview={preview !== undefined}>
        <div className="editor-form">{tab !== undefined && tabs[tab]}</div>
        {preview !== undefined && <div className="editor-preview">{preview}</div>}
      </div>
      {deleting && (
        <ConfirmDelete name={title} onYes={remove} onNo={() => setDeleting(false)} />
      )}
      {dialog && (
        <Dialog title={dialog} onClose={closeDialog} small={dialog === "History"}>
          {dialog === "JSON" ? (
            <JsonEditor record={record} onInvalid={setInvalidJson} />
          ) : (
            <History record={record} onLoad={() => setDialog(undefined)} />
          )}
        </Dialog>
      )}
      {discardJson && (
        <Confirm title="Discard JSON edits" onYes={discardJsonEdits} onNo={() => setDiscardJson(false)}>
          This JSON has errors. Discard your unfinished JSON edits and close it?
        </Confirm>
      )}
    </div>
  );
}
