import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

// A red game session: a random id and the time the game started, signed so
// only the server can make one. Nothing is stored for it. The game gets one
// when it starts and sends it back to ask for a download.

// A playthrough is well under an hour; this leaves room to wander off.
export const SESSION_LIFETIME_SECONDS = 3 * 60 * 60;

export type Session = { id: string; startedAt: number };

const sign = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

// The token for a game starting now: "<id>.<unix seconds>.<signature>".
export function createSession(secret: string, now = Date.now()): string {
  const payload = `${randomUUID()}.${Math.floor(now / 1000)}`;
  return `${payload}.${sign(payload, secret)}`;
}

// The session inside a token, or null when the token wasn't signed here or
// the game started more than SESSION_LIFETIME_SECONDS ago.
export function readSession(token: string, secret: string, now = Date.now()): Session | null {
  const [id, startedAt, signature, ...rest] = token.split(".");
  if (!id || !startedAt || !signature || rest.length > 0) return null;
  const expected = Buffer.from(sign(`${id}.${startedAt}`, secret));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  const session = { id, startedAt: Number(startedAt) };
  const age = Math.floor(now / 1000) - session.startedAt;
  return age >= 0 && age <= SESSION_LIFETIME_SECONDS ? session : null;
}

export function sessionSecret(): string {
  const secret = process.env.RED_GAME_SESSION_SECRET;
  if (!secret) throw new Error("RED_GAME_SESSION_SECRET is not set");
  return secret;
}
