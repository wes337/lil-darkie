import { randomBytes, scryptSync } from "node:crypto";
import type { NextRequest } from "next/server";
import { createSession, matches, validSession } from "../preview-access.ts";
import { DEFAULT_NAMESPACE, redis } from "./store.ts";

export const ADMIN_COOKIE = "admin-session";
export const MIN_PASSWORD_LENGTH = 8;

// A password changed in the admin is kept as a salted hash, never as itself.
export function hashPassword(password: string, salt = randomBytes(16).toString("hex")): string {
  return `scrypt:${salt}:${scryptSync(password, salt, 32).toString("hex")}`;
}

function matchesHash(password: string, stored: string): boolean {
  const salt = stored.split(":")[1];
  return salt !== undefined && matches(hashPassword(password, salt), stored);
}

// The admin checks, given a way to load the stored password hash. When there
// is a hash, it is the only password. When there is none, the ADMIN_PASSWORD
// env var is. With neither, nobody is an admin and every save is refused.
//
// Sessions are signed with whichever secret is in force, so changing the
// password logs out every existing session.
export function createAuth(loadHash: () => Promise<string | null>) {
  async function secret() {
    const hash = await loadHash();
    const fallback = process.env.ADMIN_PASSWORD ?? "";
    return hash
      ? { key: hash, check: (password: string) => matchesHash(password, hash) }
      : { key: fallback, check: (password: string) => fallback !== "" && matches(password, fallback) };
  }

  async function isAdminPassword(submitted: unknown): Promise<boolean> {
    return typeof submitted === "string" && submitted !== "" && (await secret()).check(submitted);
  }

  async function createAdminSession(): Promise<string> {
    return createSession((await secret()).key, ADMIN_COOKIE);
  }

  async function isAdminSession(token: string | undefined): Promise<boolean> {
    const { key } = await secret();
    return key !== "" && validSession(token, key, ADMIN_COOKIE);
  }

  // API callers send `Authorization: Bearer <password>`. The admin UI relies
  // on the session cookie set by /api/login.
  async function isAdmin(request: NextRequest): Promise<boolean> {
    const bearer = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
    return (
      (await isAdminPassword(bearer)) ||
      (await isAdminSession(request.cookies.get(ADMIN_COOKIE)?.value))
    );
  }

  return { isAdminPassword, createAdminSession, isAdminSession, isAdmin };
}

// Each environment has its own password, like the rest of its data.
export const PASSWORD_KEY = `${DEFAULT_NAMESPACE}:admin-password`;

// The hash is read on every admin request, so each server instance keeps it
// for a few seconds. After a change, other instances catch up within that.
const CACHE_MS = 5000;
let cached: { hash: string | null; at: number } | undefined;

async function storedHash(): Promise<string | null> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.hash;
  const hash = await (await redis()).get(PASSWORD_KEY);
  cached = { hash, at: Date.now() };
  return hash;
}

export async function setAdminPassword(password: string): Promise<void> {
  const hash = hashPassword(password);
  await (await redis()).set(PASSWORD_KEY, hash);
  cached = { hash, at: Date.now() };
}

export const { isAdminPassword, createAdminSession, isAdminSession, isAdmin } =
  createAuth(storedHash);
