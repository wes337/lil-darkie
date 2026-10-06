import { NextResponse } from "next/server";
import { z } from "zod";
import { pageSchema, postSchema, siteSchema } from "@/lib/cms/schema";

// The exact shape of every record, for agents that want more than the guide
// in lib/cms/for-agents.md.
export const GET = () =>
  NextResponse.json({
    site: z.toJSONSchema(siteSchema),
    page: z.toJSONSchema(pageSchema),
    post: z.toJSONSchema(postSchema),
  });
