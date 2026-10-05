"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import { describeIssues } from "@/lib/cms/schema";
import type { Version } from "@/lib/cms/store";
import Dialog, { ConfirmDelete } from "./dialog";
import Icon from "./icon";
import { useFetched, type RecordState } from "./use-record";

// A text box holding the record as JSON, for pasting to and from an AI
// assistant. Valid edits flow into the editor at once; invalid ones show
// what is wrong and leave the record as it was.
function JsonEditor<T>({ record }: { record: RecordState<T> }) {
  const [text, setText] = useState(() => JSON.stringify(record.doc, null, 2));
  const [problems, setProblems] = useState<string[]>([]);

  function onChange(next: string) {
    setText(next);
    let parsed: unknown;
    try {
      parsed = JSON.parse(next);
    } catch {
      setProblems(["Invalid JSON"]);
      return;
    }
    const result = (record.schema as z.ZodType<T>).safeParse(parsed);
    setProblems(result.success ? [] : describeIssues(result.error));
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

// The frame around every editor: title, Save, the form on the left and a
// live preview on the right. Each editor supplies its own form tabs, shown
// as toggles when there is more than one. JSON and History open in dialogs.
export default function Editor<T>({
  title,
  icon,
  record,
  backHref,
  viewHref,
  deletable = false,
  tabs,
  preview,
}: {
  title: string;
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
  const { state } = record;

  async function remove() {
    await fetch(record.path, { method: "DELETE" });
    router.push(backHref ?? "/admin");
  }

  return (
    <div className="editor">
      <header className="editor-header">
        {backHref && (
          <Link className="button" href={backHref}>
            Back
          </Link>
        )}
        <h1>
          <Icon name={icon} size={32} />
          {title}
        </h1>
        <span className="spacer" />
        {state.saved && <span className="saved">Saved</span>}
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
          <button type="button" className="danger" onClick={() => setDeleting(true)}>
            Delete
          </button>
        )}
        <button type="button" className="primary" disabled={state.saving} onClick={() => record.save()}>
          <Icon name="diskette" />
          {state.saving ? "Saving..." : "Save"}
        </button>
      </header>
      <Issues issues={state.issues} />
      <div className="editor-body" data-preview={preview !== undefined}>
        <div className="editor-form">{tab !== undefined && tabs[tab]}</div>
        {preview !== undefined && <div className="editor-preview">{preview}</div>}
      </div>
      {deleting && (
        <ConfirmDelete name={title} onYes={remove} onNo={() => setDeleting(false)} />
      )}
      {dialog && (
        <Dialog title={dialog} onClose={() => setDialog(undefined)} small={dialog === "History"}>
          {dialog === "JSON" ? (
            <JsonEditor record={record} />
          ) : (
            <History record={record} onLoad={() => setDialog(undefined)} />
          )}
        </Dialog>
      )}
    </div>
  );
}
