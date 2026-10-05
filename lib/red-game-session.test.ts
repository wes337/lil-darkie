import assert from "node:assert/strict";
import test from "node:test";
import { createSession, readSession, SESSION_LIFETIME_SECONDS } from "./red-game-session.ts";

const start = Date.UTC(2026, 9, 5, 12);
const later = (seconds: number) => start + seconds * 1000;

test("a session reads back until it expires", () => {
  const token = createSession("secret", start);
  const session = readSession(token, "secret", later(90));
  assert.equal(session?.startedAt, start / 1000);
  assert.ok(readSession(token, "secret", later(SESSION_LIFETIME_SECONDS)));
  assert.equal(readSession(token, "secret", later(SESSION_LIFETIME_SECONDS + 1)), null);
});

test("a session that wasn't signed here is refused", () => {
  const token = createSession("secret", start);
  const [id, startedAt, signature] = token.split(".");
  assert.equal(readSession(token, "other-secret", start), null);
  // An earlier start time would get past the minimum solve time.
  assert.equal(readSession(`${id}.${Number(startedAt) - 600}.${signature}`, "secret", start), null);
  assert.equal(readSession(`${id}.${startedAt}`, "secret", start), null);
  assert.equal(readSession("", "secret", start), null);
});
