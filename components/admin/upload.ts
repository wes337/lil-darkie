import type { Upload } from "@/lib/cms/s3";

// How many parts are in flight at once.
const PARALLEL = 3;

// Sends a file straight from the browser to storage, in parts, and resolves
// to where it's served from. `onProgress` gets the fraction done as each
// part lands. A failed part is tried once more; a failed upload is abandoned
// so storage doesn't keep its parts.
export async function uploadFile(
  file: File,
  onProgress: (fraction: number) => void,
): Promise<{ url: string; size: number }> {
  const started = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, size: file.size, type: file.type }),
  });
  if (!started.ok) {
    const body: { error?: string } = await started.json().catch(() => ({}));
    throw new Error(body.error ?? `Upload failed (${started.status})`);
  }
  const upload: Upload = await started.json();
  const etags: string[] = [];
  let done = 0;

  try {
    await inParallel(upload.parts, PARALLEL, async (url, i) => {
      const part = file.slice(i * upload.partSize, (i + 1) * upload.partSize);
      etags[i] = await putPart(url, part);
      done += part.size;
      onProgress(done / file.size);
    });
    const parts = etags
      .map((etag, i) => `<Part><PartNumber>${i + 1}</PartNumber><ETag>${etag}</ETag></Part>`)
      .join("");
    const completed = await fetch(upload.complete, {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: `<CompleteMultipartUpload>${parts}</CompleteMultipartUpload>`,
    });
    if (!completed.ok) throw new Error(`Couldn't finish the upload (${completed.status})`);
  } catch (error) {
    fetch(upload.abort, { method: "DELETE" }).catch(() => {});
    throw error;
  }
  return { url: upload.url, size: file.size };
}

// Resolves to the part's ETag, which the complete step needs.
async function putPart(url: string, part: Blob, attempt = 1): Promise<string> {
  try {
    const response = await fetch(url, { method: "PUT", body: part });
    const etag = response.headers.get("etag");
    if (!response.ok || !etag) throw new Error(`Part upload failed (${response.status})`);
    return etag;
  } catch (error) {
    if (attempt >= 2) throw error;
    return putPart(url, part, attempt + 1);
  }
}

// Runs `work` over every item with at most `limit` going at once.
async function inParallel<T>(
  items: T[],
  limit: number,
  work: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      await work(items[i]!, i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}
