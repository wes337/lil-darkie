import type { NextRequest } from "next/server";
import { createSession, matches, validSession } from "../preview-access.mjs";

export const ADMIN_COOKIE = "admin-session";

// With no ADMIN_PASSWORD set, nobody is an admin and every save is refused.
const password = () => process.env.ADMIN_PASSWORD ?? "";

export function isAdminPassword(submitted: unknown): boolean {
  return (
    password() !== "" &&
    typeof submitted === "string" &&
    matches(submitted, password())
  );
}

export function createAdminSession(): string {
  return createSession(password(), ADMIN_COOKIE);
}

export function isAdminSession(token: string | undefined): boolean {
  return password() !== "" && validSession(token, password(), ADMIN_COOKIE);
}

// API callers send `Authorization: Bearer <password>`. The admin UI relies on
// the session cookie set by /api/login.
export function isAdmin(request: NextRequest): boolean {
  const bearer = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  return (
    isAdminPassword(bearer) ||
    isAdminSession(request.cookies.get(ADMIN_COOKIE)?.value)
  );
}
