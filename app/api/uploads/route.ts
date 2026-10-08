import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { unauthorized } from "@/lib/cms/api";
import { isAdmin } from "@/lib/cms/auth";
import { MAX_UPLOAD_BYTES, createUpload } from "@/lib/cms/s3";
import { describeIssues } from "@/lib/cms/schema";

const request = z.object({
  name: z.string().min(1).max(200),
  size: z.number().int().min(1).max(MAX_UPLOAD_BYTES),
  type: z.string().max(100).optional(),
});

// Starts a big upload. Takes the file's name, size and type and returns the
// signed URLs the browser sends the file to; the file itself never passes
// through here. Admin only.
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return unauthorized();
  const parsed = request.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid upload", issues: describeIssues(parsed.error) },
      { status: 400 },
    );
  }
  const { name, size, type } = parsed.data;
  return NextResponse.json(await createUpload(name, size, type ?? ""));
}
