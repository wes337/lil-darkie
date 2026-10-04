import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { isAdmin } from "./auth.ts";
import { CMS_TAG } from "./content.ts";
import { describeIssues, type Kind } from "./schema.ts";
import { store } from "./store.ts";

type SlugContext = { params: Promise<{ slug: string }> };

export const unauthorized = () =>
  NextResponse.json(
    { error: "Send the admin password as `Authorization: Bearer <password>`." },
    { status: 401 },
  );
const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });

// Validates and stores a record, then drops the public cache so the change is
// live on the next request. Invalid input gets a 400 listing each problem.
async function save(kind: Kind, slug: string, request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }
  try {
    const input = kind === "site" ? body : { ...(body as object), slug };
    const saved = await store.save(kind, slug, input);
    revalidateTag(CMS_TAG, { expire: 0 });
    return NextResponse.json(saved);
  } catch (error) {
    if (!(error instanceof ZodError)) throw error;
    return NextResponse.json(
      { error: `Invalid ${kind}`, issues: describeIssues(error) },
      { status: 400 },
    );
  }
}

// Drafts are the only records the public can't read.
const hidden = (doc: object, request: NextRequest) =>
  "published" in doc && !doc.published && !isAdmin(request);

// GET, PUT and DELETE for one page or post, addressed by slug.
export function docRoutes(kind: "page" | "post") {
  return {
    async GET(request: NextRequest, { params }: SlugContext) {
      const doc = await store.get(kind, (await params).slug);
      return !doc || hidden(doc, request) ? notFound() : NextResponse.json(doc);
    },
    async PUT(request: NextRequest, { params }: SlugContext) {
      if (!isAdmin(request)) return unauthorized();
      return save(kind, (await params).slug, request);
    },
    async DELETE(request: NextRequest, { params }: SlugContext) {
      if (!isAdmin(request)) return unauthorized();
      const removed = await store.remove(kind, (await params).slug);
      revalidateTag(CMS_TAG, { expire: 0 });
      return removed ? NextResponse.json({ deleted: true }) : notFound();
    },
  };
}

// GET for all pages or posts. Posts can be narrowed with `?collection=`.
export function listRoute(kind: "page" | "post") {
  return async function GET(request: NextRequest) {
    const collection = request.nextUrl.searchParams.get("collection");
    const docs = (await store.list(kind)).filter(
      (doc) =>
        !hidden(doc, request) &&
        (!collection || !("collection" in doc) || doc.collection === collection),
    );
    return NextResponse.json(docs);
  };
}

// GET for the last saved versions of a record, newest first. Admin only.
export function versionsRoute(kind: "page" | "post") {
  return async function GET(request: NextRequest, { params }: SlugContext) {
    if (!isAdmin(request)) return unauthorized();
    return NextResponse.json(await store.versions(kind, (await params).slug));
  };
}

export const siteRoutes = {
  GET: async () => NextResponse.json(await store.getSite()),
  async PUT(request: NextRequest) {
    if (!isAdmin(request)) return unauthorized();
    return save("site", "site", request);
  },
  async versions(request: NextRequest) {
    if (!isAdmin(request)) return unauthorized();
    return NextResponse.json(await store.versions("site", "site"));
  },
};
