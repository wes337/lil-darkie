import { createHash, createHmac } from "node:crypto";

// Big uploads for the /files page. They go straight from the browser to
// Bunny's S3-compatible storage, so Vercel's request size limit never sees
// them. This module signs the URLs the browser uses; `components/admin/
// upload.ts` does the uploading. The storage zone is shared with other
// projects, so this site keeps to its own folder.
const ZONE = "wes-s3";
const REGION = "ny";
const HOST = `${REGION}-s3.storage.bunnycdn.com`;
const CDN_URL = "https://w-s3.b-cdn.net";
const FOLDER = "lil-darkie/files";

// A file is sent in parts of this size, each on its own signed URL.
export const PART_SIZE = 8 * 1024 * 1024;
// Bunny takes at most 10,000 parts per upload.
export const MAX_UPLOAD_BYTES = PART_SIZE * 10_000;

// Every URL for one upload is signed up front, so they have to outlast the
// whole upload. A slow connection can take a while over 485 MB.
const UPLOAD_LIFETIME_SECONDS = 6 * 60 * 60;

type Presign = {
  method: string;
  key: string;
  query?: Record<string, string>;
  expires?: number;
  now?: Date;
};

// What the browser needs to upload one file: a signed URL per part, one to
// finish with and one to give up with, plus where the file will be served.
export type Upload = {
  url: string;
  partSize: number;
  parts: string[];
  complete: string;
  abort: string;
};

const password = () => {
  const key = process.env.BUNNY_S3_PASSWORD;
  if (!key) throw new Error("BUNNY_S3_PASSWORD is not set");
  return key;
};

// RFC 3986 encoding, which is what SigV4 canonicalisation wants.
const encode = (value: string) =>
  encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const hmac = (key: Buffer | string, value: string) => createHmac("sha256", key).update(value).digest();

// Signs one request to the storage zone the way AWS Signature Version 4
// puts it in a query string: only the host is signed, the body is not, so
// the browser can send any headers and content it likes.
export function presign(
  { method, key, query = {}, expires = UPLOAD_LIFETIME_SECONDS, now = new Date() }: Presign,
  secret = password(),
): string {
  const amzDate = now.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const date = amzDate.slice(0, 8);
  const scope = `${date}/${REGION}/s3/aws4_request`;
  const path = `/${[ZONE, ...key.split("/")].map(encode).join("/")}`;
  const params: Record<string, string> = {
    ...query,
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${ZONE}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expires),
    "X-Amz-SignedHeaders": "host",
  };
  const canonicalQuery = Object.keys(params)
    .sort()
    .map((name) => `${encode(name)}=${encode(params[name] ?? "")}`)
    .join("&");
  const canonicalRequest = [method, path, canonicalQuery, `host:${HOST}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonicalRequest)].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secret}`, date), REGION), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  return `https://${HOST}${path}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

// Starts a multipart upload for a file under a unique name and signs
// everything the browser needs to finish it. The content type is fixed here,
// so the CDN serves the file with it.
export async function createUpload(name: string, size: number, type: string): Promise<Upload> {
  const safeName = name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const key = `${FOLDER}/${Date.now().toString(36)}-${safeName}`;
  const response = await fetch(presign({ method: "POST", key, query: { uploads: "" } }), {
    method: "POST",
    headers: { "Content-Type": type || "application/octet-stream" },
  });
  if (!response.ok) throw new Error(`Bunny multipart create failed (${response.status})`);
  const uploadId = /<UploadId>(.*?)<\/UploadId>/.exec(await response.text())?.[1];
  if (!uploadId) throw new Error("Bunny multipart create returned no UploadId");
  const count = Math.max(1, Math.ceil(size / PART_SIZE));
  return {
    url: `${CDN_URL}/${key}`,
    partSize: PART_SIZE,
    parts: Array.from({ length: count }, (_, i) =>
      presign({ method: "PUT", key, query: { partNumber: String(i + 1), uploadId } }),
    ),
    complete: presign({ method: "POST", key, query: { uploadId } }),
    abort: presign({ method: "DELETE", key, query: { uploadId } }),
  };
}
