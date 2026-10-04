import { NextResponse, type NextRequest } from "next/server";
import { unauthorized } from "@/lib/cms/api";
import { isAdmin } from "@/lib/cms/auth";
import { listMedia, uploadMedia } from "@/lib/cms/bunny";

// Lists uploaded files, newest first.
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return unauthorized();
  return NextResponse.json(await listMedia());
}

// Takes a multipart form with one `file` field and returns its public URL.
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return unauthorized();
  const file = (await request.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Send a multipart form with a `file` field" },
      { status: 400 },
    );
  }
  return NextResponse.json(await uploadMedia(file));
}
