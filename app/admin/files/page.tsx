"use client";
import { useState } from "react";
import Dialog from "@/components/admin/dialog";
import { Issues } from "@/components/admin/editor";
import { MoveButtons, RemoveButton, TextField, replaceAt } from "@/components/admin/fields";
import Icon from "@/components/admin/icon";
import { uploadFile } from "@/components/admin/upload";
import { useRecord } from "@/components/admin/use-record";
import { useUnsavedChanges } from "@/components/admin/use-unsaved-changes";
import { fileIcon, formatBytes } from "@/lib/cms/render";
import { DEFAULT_SITE, siteSchema, type Site, type SiteFile } from "@/lib/cms/schema";

function FileDialog({
  initial,
  issues,
  onSave,
  onClose,
}: {
  initial: SiteFile;
  issues: string[];
  onSave: (file: SiteFile) => void;
  onClose: () => void;
}) {
  const [file, setFile] = useState(initial);
  return (
    <Dialog title={initial.label ? "Edit file" : "Add link"} onClose={onClose} small>
      <TextField label="Label" value={file.label} onChange={(label) => setFile({ ...file, label })} />
      <TextField label="URL" value={file.url} onChange={(url) => setFile({ ...file, url })} />
      <Issues issues={issues} />
      <div className="row">
        <button type="button" className="primary" onClick={() => onSave(file)}>
          <Icon name="diskette" />
          Save
        </button>
        <button type="button" className="dismiss" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Dialog>
  );
}

// The downloads listed on /files, in order. Every change saves at once. An
// upload goes straight to storage and is listed under its file name; a file
// hosted elsewhere is added as a link.
export default function FilesView() {
  const record = useRecord<Site>("/api/site", siteSchema, () => DEFAULT_SITE);
  const [editing, setEditing] = useState<number | "new">();
  const [uploading, setUploading] = useState(false);
  // The upload's progress, or why the last one failed.
  const [message, setMessage] = useState("");
  // Leaving mid-upload would throw the upload away.
  useUnsavedChanges(uploading);
  const site = record.doc;
  if (!site) return <p>Loading...</p>;

  const files = site.files ?? [];
  const saveFiles = (next: SiteFile[]) => record.save({ ...site, files: next });

  async function upload(file: File) {
    setUploading(true);
    setMessage("0%");
    try {
      const { url, size } = await uploadFile(file, (fraction) =>
        setMessage(`${Math.round(fraction * 100)}%`),
      );
      await saveFiles([...files, { label: file.name, url, size, date: new Date().toISOString() }]);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function saveFile(file: SiteFile) {
    if (editing === undefined || record.state.saving) return;
    const next = editing === "new" ? [...files, file] : replaceAt(files, editing, file);
    if (await saveFiles(next)) setEditing(undefined);
  }

  return (
    <main className="view">
      <header className="row">
        <h1>
          <Icon name="folder" size={32} />
          Files
        </h1>
        <span className="spacer" />
        {record.state.saved && <span className="saved">Saved</span>}
        <a className="button" href="/files" target="_blank" rel="noreferrer">
          <Icon name="world_go" />
          View
        </a>
      </header>
      <Issues issues={record.state.issues} />
      <fieldset disabled={record.state.saving || uploading}>
        {files.length > 0 && (
          <div className="nav-links">
            {files.map((file, i) => (
              <div key={`${file.url}-${i}`}>
                <span className="row-controls">
                  <MoveButtons items={files} index={i} onChange={saveFiles} />
                </span>
                <Icon name={fileIcon(file.label, file.url)} />
                <strong>{file.label}</strong>
                <small>
                  {file.url}
                  {file.size !== undefined && ` (${formatBytes(file.size)})`}
                </small>
                <span className="spacer" />
                <span className="row-controls">
                  <button type="button" className="bare" onClick={() => setEditing(i)} aria-label="Edit">
                    <Icon name="pencil" />
                  </button>
                  <RemoveButton items={files} index={i} onChange={saveFiles} name={file.label} />
                </span>
              </div>
            ))}
          </div>
        )}
        {files.length === 0 && <p>No files yet.</p>}
        <p className="row">
          <label className="button">
            <Icon name="page_white_put" />
            Upload
            <input
              type="file"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) upload(file);
                event.target.value = "";
              }}
            />
          </label>
          <button type="button" onClick={() => setEditing("new")}>
            <Icon name="link" />
            Add link
          </button>
          {message && <span role="status">{message}</span>}
        </p>
      </fieldset>
      {editing !== undefined && (
        <FileDialog
          initial={editing === "new" ? { label: "", url: "https://" } : (files[editing] ?? { label: "", url: "" })}
          issues={record.state.issues}
          onSave={saveFile}
          onClose={() => {
            if (!record.state.saving) setEditing(undefined);
          }}
        />
      )}
    </main>
  );
}
