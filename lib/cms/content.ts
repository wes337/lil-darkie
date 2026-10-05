import { unstable_cache } from "next/cache";
import { DEFAULT_ICON } from "./schema.ts";
import { store } from "./store.ts";

// Cached reads for the public site. Visitors hit this cache, not Redis.
// Every save calls `revalidateTag(CMS_TAG)`, which drops all of it.
export const CMS_TAG = "cms";
const cached = { tags: [CMS_TAG] };

export const getSite = unstable_cache(() => store.getSite(), ["cms-site"], cached);

// The browser tab icon for the site and the admin: the one set in Settings,
// or the built-in favicon. A custom one also serves as the home screen icon
// on phones.
export async function siteIcons() {
  const { icon } = await getSite();
  return icon ? { icon, apple: icon } : { icon: DEFAULT_ICON };
}

export const getPage =unstable_cache(
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
