import { NextResponse } from "next/server";
import { endSession } from "@/lib/red-game-proof";
import { createSession, sessionSecret } from "@/lib/red-game-session";
import { fromThisSite } from "@/lib/same-site";

const forbidden = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });

// Starts a red game session. The game calls this when it starts and sends
// the token back when it asks for a download.
export async function POST(request: Request) {
  if (!fromThisSite(request)) return forbidden();
  return NextResponse.json({ session: createSession(sessionSecret()) });
}

// Ends a session when the player exits. The game doesn't wait for this or
// look at the answer, and a token that is missing or expired is fine.
export async function DELETE(request: Request) {
  if (!fromThisSite(request)) return forbidden();
  const body: { session?: unknown } | null = await request.json().catch(() => null);
  if (typeof body?.session === "string") await endSession(body.session);
  return NextResponse.json({ ended: true });
}
