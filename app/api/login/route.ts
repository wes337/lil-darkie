import { NextResponse, type NextRequest } from "next/server";
import { SESSION_SECONDS } from "@/lib/preview-access.mjs";
import { ADMIN_COOKIE, createAdminSession, isAdminPassword } from "@/lib/cms/auth";

// Trades the admin password for the session cookie the admin UI uses.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!isAdminPassword(body?.password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createAdminSession(), {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
