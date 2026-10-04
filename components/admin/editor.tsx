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
      setProblems(["This isn't valid JSON yet."]);
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
            {i === 0 && " (live)"}
          </span>
          <button
            type="button"
            onClick={() => {
              record.setDoc(version.data as T);
              onLoad();
            }}
          >
            Load into editor
          </button>
        </li>
      ))}
    </ul>
  );
}

function Issues({ issues }: { issues: string[] }) {
  if (issues.length === 0) return null;
  return (
    <ul className="issues" role="alert">
      {issues.map((issue) => (
        <li key={issue}>{issue}</li>
      ))}
    </ul>
  );
}

const TABS = ["Edit", "JSON", "History"] as const;

// The frame around every editor: title, Save, the Edit / JSON / History tabs
// on the left and a live preview on the right.
export default function Editor<T>({
  title,
  record,
  viewHref,
  deletable = false,
  form,
  preview,
}: {
  title: string;
  record: RecordState<T>;
  // Where the saved record can be seen on the public site.
  viewHref?: string;
  deletable?: boolean;
  form: ReactNode;
  preview: ReactNode;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Edit");
  const { state } = record;

  async function remove() {
    if (!confirm(`Delete "${title}"? This takes it off the site.`)) return;
    await fetch(record.path, { method: "DELETE" });
    router.push("/admin");
  }

  return (
    <div className="editor">
      <header className="editor-header">
        <Link href="/admin">← All content</Link>
        <h1>{title}</h1>
        {!record.exists && <span className="badge">not saved yet</span>}
        <span className="spacer" />
        {state.saved && <span className="saved">Saved. It&apos;s live.</span>}
        {viewHref && record.exists && (
          <a href={viewHref} target="_blank">
            View
          </a>
        )}
        {deletable && record.exists && (
          <button type="button" className="danger" onClick={remove}>
            Delete
          </button>
        )}
        <button type="button" className="primary" disabled={state.saving} onClick={record.save}>
          {state.saving ? "Saving..." : "Save"}
        </button>
      </header>
      <Issues issues={state.issues} />
      <div className="editor-body">
        <div className="editor-form">
          <div className="tabs">
            {TABS.map((name) => (
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
          {tab === "Edit" && form}
          {tab === "JSON" && <JsonEditor record={record} />}
          {tab === "History" && <History record={record} onLoad={() => setTab("Edit")} />}
        </div>
        <div className="editor-preview">{preview}</div>
      </div>
    </div>
  );
}
