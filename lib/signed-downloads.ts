import { createHmac } from "node:crypto";
import { solvedGame } from "./red-game-proof.ts";

// Files that only download through a signed link. They sit in a Bunny storage
// zone whose pull zone has token authentication on: a plain request is
// refused, and a signed link stops working once it expires. The zone is
// shared with other projects, so this site keeps to its own folder.
//
// To add a file, upload it under FOLDER in the `w-sig` storage zone, add it
// to DOWNLOADS, and POST to /api/downloads/<id> from a page to get its link.
// A download can name a check that has to pass before its link is signed.
const SIGNED_CDN_URL = "https://w-sig.b-cdn.net";
const FOLDER = "lil-darkie";

// Long enough to finish, or pause and resume, a 485 MB download.
const LINK_LIFETIME_SECONDS = 60 * 60;

// Decides whether a request may have a download, from the JSON it sent as
// proof. Resolves to a short reason for refusing, or null to allow.
type Check = (proof: unknown, id: string) => Promise<string | null>;
type Download = { path: string; allow?: Check };

// Each download's path inside FOLDER, and its check if it has one. A
// download without a check is signed for any page on this site.
export const DOWNLOADS = {
  "red-album": { path: "red-game/red (the album).zip", allow: solvedGame("usbInserted") },
  "red-bonus-track": { path: "red-game/red (bonus track).zip", allow: solvedGame("cdInserted") },
} satisfies Record<string, Download>;

export type DownloadId = keyof typeof DOWNLOADS;

export const isDownloadId = (id: string): id is DownloadId => Object.hasOwn(DOWNLOADS, id);

// The same list with the check optional on every entry.
const downloads: Record<DownloadId, Download> = DOWNLOADS;

// Signs a pull zone URL the way Bunny's token authentication expects: an
// HMAC-SHA256 of the URL's path and its expiry time (unix seconds), keyed
// with the zone's token authentication key. Bunny hashes the decoded path,
// so "red (the album).zip" is signed with its spaces, not as "%20".
export function signUrl(url: string, expires: number, key: string): string {
  const { origin, pathname } = new URL(url);
  const digest = createHmac("sha256", key)
    .update(decodeURIComponent(pathname))
    .update(String(expires))
    .digest("base64url");
  return `${origin}${pathname}?token=HS256-${digest}&expires=${expires}`;
}

// Why this request can't have the download, or null when it can.
export async function refusal(id: DownloadId, proof: unknown): Promise<string | null> {
  return (await downloads[id].allow?.(proof, id)) ?? null;
}

// A link to one download that works for the next hour.
export function downloadUrl(id: DownloadId, now = Date.now()): string {
  const key = process.env.BUNNY_URL_TOKEN_AUTH_KEY;
  if (!key) throw new Error("BUNNY_URL_TOKEN_AUTH_KEY is not set");
  const expires = Math.floor(now / 1000) + LINK_LIFETIME_SECONDS;
  return signUrl(`${SIGNED_CDN_URL}/${FOLDER}/${downloads[id].path}`, expires, key);
}
