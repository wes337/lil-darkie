"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import { describeIssues } from "@/lib/cms/schema";
import type { Version } from "@/lib/cms/store";
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

// The frame around every editor: title, Save, a row of tabs on the left and
// a live preview on the right. Each editor supplies its own form tabs; JSON
// and History are added after them.
export default function Editor<T>({
  title,
  record,
  backHref,
  viewHref,
  deletable = false,
  tabs,
  preview,
}: {
  title: string;
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
  const names = [...Object.keys(tabs), "JSON", "History"];
  const [tab, setTab] = useState(names[0]);
  const { state } = record;

  async function remove() {
    if (!confirm(`Delete "${title}"? This takes it off the site.`)) return;
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
        <h1>{title}</h1>
        <div className="tabs">
          {names.map((name) => (
            <button
              type="button"
              key={name}
              aria-pressed={tab === name}
              onClick={() => setTab(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <span className="spacer" />
        {state.saved && <span className="saved">Saved</span>}
        {viewHref && record.exists && (
          <a className="button" href={viewHref} target="_blank">
            View
          </a>
        )}
        {deletable && record.exists && (
          <button type="button" className="danger" onClick={remove}>
            Delete
          </button>
        )}
        <button type="button" className="primary" disabled={state.saving} onClick={() => record.save()}>
          {state.saving ? "Saving..." : "Save"}
        </button>
      </header>
      <Issues issues={state.issues} />
      <div className="editor-body" data-preview={preview !== undefined}>
        <div className="editor-form">
          {tab === "JSON" && <JsonEditor record={record} />}
          {tab === "History" && <History record={record} onLoad={() => setTab(names[0])} />}
          {tab !== undefined && tabs[tab]}
        </div>
        {preview !== undefined && <div className="editor-preview">{preview}</div>}
      </div>
    </div>
  );
}
