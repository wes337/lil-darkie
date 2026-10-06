import { NextResponse } from "next/server";
import { fromThisSite } from "@/lib/same-site";
import { downloadUrl, isDownloadId, refusal } from "@/lib/signed-downloads";

// Returns a freshly signed link for one of the site's signed downloads.
// It is a POST that only this site's pages may make, so there is no URL to
// pass around: a pasted link is a GET from somewhere else. The JSON body is
// the proof for the download's own check. A refusal is a 403 whose `error`
// says why.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isDownloadId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!fromThisSite(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const proof: unknown = await request.json().catch(() => null);
  const error = await refusal(id, proof);
  if (error) return NextResponse.json({ error }, { status: 403 });
  return NextResponse.json({ url: downloadUrl(id) });
}
