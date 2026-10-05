"use client";
import { createContext, useContext, useState } from "react";
import type { MediaFile } from "@/lib/cms/bunny";
import { FONTS, type Site, type UploadedFont } from "@/lib/cms/schema";
import Dialog from "./dialog";
import { Field, TextField } from "./fields";
import { MAX_UPLOAD_BYTES } from "./media";

// The site's uploaded fonts, for every font dropdown under an editor. The
// dialog saves changes to the site record itself, then calls `onChange` so
// the editor's copy of the list keeps up.
export const FontsContext = createContext<{
  fonts: UploadedFont[];
  onChange: (fonts: UploadedFont[]) => void;
}>({ fonts: [], onChange: () => {} });

const BUILT_IN = Object.keys(FONTS);

// "Comic-Neue_Bold.woff2" becomes "Comic Neue Bold".
const nameFromFile = (file: File) =>
  file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim();

// Changes the font list on the saved site record, leaving the rest of it as
// it is. Resolves to the new list. Throws with the API's reasons on failure.
async function saveFonts(change: (fonts: UploadedFont[]) => UploadedFont[]) {
  const site: Site = await (await fetch("/api/site")).json();
  const fonts = change(site.fonts ?? []);
  const response = await fetch("/api/site", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...site, fonts }),
  });
  if (!response.ok) {
    const body: { issues?: string[] } = await response.json().catch(() => ({}));
    throw new Error(body.issues?.join(", ") ?? `Save failed (${response.status})`);
  }
  return fonts;
}

// Uploads a font file under a name, and lists the uploaded fonts so they can
// be removed. Both take effect at once.
function FontsDialog({ onClose }: { onClose: () => void }) {
  const { fonts, onChange } = useContext(FontsContext);
  const [file, setFile] = useState<File>();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  // Resolves to whether the change was saved.
  async function apply(change: (fonts: UploadedFont[]) => UploadedFont[]) {
    try {
      onChange(await saveFonts(change));
      setMessage("");
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
      return false;
    }
  }

  async function upload() {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setMessage("File is over 4 MB");
      return;
    }
    setMessage("Uploading...");
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/media", { method: "POST", body });
    if (!response.ok) {
      setMessage("Upload failed.");
      return;
    }
    const { url }: MediaFile = await response.json();
    if (await apply((current) => [...current, { name: name.trim(), url }])) {
      setFile(undefined);
      setName("");
    }
  }

  return (
    <Dialog title="Upload a font" onClose={onClose} small>
      <Field label="File">
        {/* The key clears the chosen file after each upload. */}
        <input
          key={fonts.length}
          type="file"
          accept=".woff2,.woff,.ttf,.otf"
          onChange={(event) => {
            const chosen = event.target.files?.[0];
            setFile(chosen);
            if (chosen) setName(nameFromFile(chosen));
          }}
        />
      </Field>
      <TextField label="Name" value={name} onChange={setName} />
      <div className="row">
        <button
          type="button"
          className="primary"
          disabled={!file || !name.trim()}
          onClick={upload}
        >
          Upload
        </button>
        <span>{message}</span>
      </div>
      {fonts.length > 0 && (
        <div className="nav-links">
          {fonts.map((font) => (
            <div key={font.name}>
              <strong>{font.name}</strong>
              <span className="spacer" />
              <button
                type="button"
                aria-label="Remove"
                onClick={() => apply((current) => current.filter((item) => item.name !== font.name))}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </Dialog>
  );
}

// A dropdown of the built-in and uploaded fonts, whose first entry clears the
// value, with a button that opens the font upload dialog.
export function FontField({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (font: string | undefined) => void;
}) {
  const { fonts } = useContext(FontsContext);
  const [uploading, setUploading] = useState(false);
  const known = [...BUILT_IN, ...fonts.map((font) => font.name)];
  // A font that was removed after being picked stays listed until changed.
  const options = value && !known.includes(value) ? [...known, value] : known;

  return (
    <>
      <Field label="Font">
        <span className="row">
          <select
            className="spacer"
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value || undefined)}
          >
            <option value="">default</option>
            {options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <button type="button" onClick={() => setUploading(true)}>
            Upload
          </button>
        </span>
      </Field>
      {/* Outside the label so clicks in the dialog don't focus the dropdown. */}
      {uploading && <FontsDialog onClose={() => setUploading(false)} />}
    </>
  );
}
