import { unstable_cache } from "next/cache";
import { store } from "./store.ts";

// Cached reads for the public site. Visitors hit this cache, not Redis.
// Every save calls `revalidateTag(CMS_TAG)`, which drops all of it.
export const CMS_TAG = "cms";
const cached = { tags: [CMS_TAG] };

export const getSite = unstable_cache(() => store.getSite(), ["cms-site"], cached);

export const getPage = unstable_cache(
  (slug: string) => store.get("page", slug),
  ["cms-page"],
  cached,
);

// Published posts only, newest first.
export const getPosts = unstable_cache(
  async () =>
    (await store.list("post"))
      .filter((post) => post.published)
      .sort((a, b) => b.date.localeCompare(a.date)),
  ["cms-posts"],
  cached,
);
