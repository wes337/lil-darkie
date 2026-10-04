"use client";
import { useEffect, useState } from "react";
import type { MediaFile } from "@/lib/cms/bunny";

// Vercel rejects request bodies over 4.5 MB before they reach the upload route.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const isImage = (url: string) => /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(url);

// The upload button and the grid of everything uploaded so far. With `onPick`
// a click chooses a file; without it a click copies the file's URL.
export function MediaLibrary({ onPick }: { onPick?: (url: string) => void }) {
  const [files, setFiles] = useState<MediaFile[]>();
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/media")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then(setFiles)
      .catch(() => setMessage("Couldn't load the media library."));
  }, []);

  async function upload(file: File) {
    if (file.size > MAX_UPLOAD_BYTES) {
      setMessage("That file is over 4 MB. Shrink it and try again.");
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
    const uploaded: MediaFile = await response.json();
    setFiles((current) => [uploaded, ...(current ?? [])]);
    setMessage("");
    onPick?.(uploaded.url);
  }

  function choose(url: string) {
    if (onPick) return onPick(url);
    navigator.clipboard.writeText(url);
    setMessage(`Copied ${url}`);
  }

  return (
    <div className="media">
      <div className="row">
        <input
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) upload(file);
            event.target.value = "";
          }}
        />
        <span>{message}</span>
      </div>
      {files?.length === 0 && <p>Nothing uploaded yet.</p>}
      <div className="media-grid">
        {files?.map((file) => (
          <button type="button" key={file.name} onClick={() => choose(file.url)}>
            {isImage(file.url) ? <img src={file.url} alt="" loading="lazy" /> : <span>FILE</span>}
            <small>{file.name}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MediaDialog({
  onPick,
  onClose,
}: {
  onPick: (url: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={(event) => event.stopPropagation()}>
        <div className="row">
          <h2>Choose a file</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <MediaLibrary onPick={onPick} />
      </div>
    </div>
  );
}
