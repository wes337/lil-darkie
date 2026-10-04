import { NextResponse, type NextRequest } from "next/server";
import { SESSION_SECONDS } from "@/lib/preview-access";
import { unauthorized } from "@/lib/cms/api";
import {
  ADMIN_COOKIE,
  MIN_PASSWORD_LENGTH,
  createAdminSession,
  isAdmin,
  isAdminPassword,
  setAdminPassword,
} from "@/lib/cms/auth";

// Changes the admin password. Takes `{ current, next }`. The caller must be
// logged in and must also know the current password. Every other session is
// logged out; this one gets a fresh cookie so it stays in.
export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!(await isAdminPassword(body?.current))) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
  }
  if (typeof body?.next !== "string" || body.next.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 },
    );
  }

  await setAdminPassword(body.next);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, await createAdminSession(), {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return response;
}
