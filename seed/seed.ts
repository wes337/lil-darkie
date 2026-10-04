// Fills Redis with the content the site had before it became editable.
//
//   node --env-file=.env.local seed/seed.ts <namespace> [--force]
//
// Namespace is `dev` or `prod`. Records that already exist are left alone so
// a rerun can't wipe the manager's edits. `--force` overwrites them.
import { readFileSync } from "node:fs";
import { createStore, redis } from "../lib/cms/store.ts";
import type { Block, Page, Post, Site } from "../lib/cms/schema.ts";

const CDN_URL = "https://w-img.b-cdn.net/lil-darkie";
const read = (file: string) =>
  readFileSync(new URL(file, import.meta.url), "utf8");

const [namespace, flag] = process.argv.slice(2);
if (namespace !== "dev" && namespace !== "prod") {
  throw new Error("Usage: seed.ts <dev|prod> [--force]");
}
const force = flag === "--force";
const store = createStore(namespace);

const numbered = (count: number, path: (n: number) => string) =>
  Array.from({ length: count }, (_, i) => path(i + 1));

const site: Site = {
  nav: [
    { label: "Merch", href: "https://www.smalldarkone.com", topBar: true, icon: "gun" },
    { label: "Comics", href: "/comics", topBar: true, icon: "grave" },
    { label: "Gallery", href: "/gallery" },
    { label: "Sampler", href: "/sampler", topBar: true, icon: "skull" },
    { label: "Posters", href: "/posters" },
    { label: "Writings", href: "/blog" },
    { label: "The Lost Songs", href: "/the-lost-songs" },
  ],
  social: [
    { platform: "spotify", href: "https://open.spotify.com/artist/62F9BiUmjqeXbBztCwiX1U" },
    { platform: "soundcloud", href: "https://soundcloud.com/lildvrkie" },
    { platform: "youtube", href: "https://www.youtube.com/channel/UCy1PnulzEixUtsR-w-Pgd4w" },
  ],
  copyright: "Copyright © 2026 Lil Darkie® All Rights Reserved",
  theme: {},
};

const heading = (text: string): Block => ({ id: "title", type: "heading", level: 1, text, style: { align: "center" } });

const pages: Page[] = [
  {
    slug: "comics",
    title: "Comics",
    theme: { backgroundColor: "#ffffff", textColor: "#000000" },
    blocks: [
      heading("Comics"),
      { id: "comics", type: "slideshow", images: [`${CDN_URL}/comics/0.jpeg`, `${CDN_URL}/comics/1.jpeg`] },
    ],
  },
  {
    slug: "gallery",
    title: "Gallery",
    theme: {},
    blocks: [
      heading("Tour Photos"),
      {
        id: "photos",
        type: "slideshow",
        images: numbered(24, (n) => `/images/gallery/${n}.${n < 10 ? "png" : "webp"}`),
      },
    ],
  },
  {
    slug: "posters",
    title: "Posters",
    theme: {},
    blocks: [
      heading("Posters"),
      { id: "posters", type: "slideshow", images: numbered(13, (n) => `/images/posters/${n}.webp`) },
    ],
  },
  {
    slug: "blog",
    title: "Writings",
    theme: { backgroundColor: "#efbf75", textColor: "#000000", accentColor: "#e00910" },
    blocks: [{ id: "feed", type: "posts", collection: "writings" }],
  },
  {
    slug: "the-lost-songs",
    title: "The Lost Songs",
    theme: {},
    blocks: [
      { id: "cover", type: "image", src: `${CDN_URL}/lost-songs/album.jpg`, alt: "Lost Songs album cover" },
      heading("Lost Songs"),
      { id: "out-now", type: "text", markdown: "Out now on all platforms", style: { align: "center" } },
      {
        id: "spotify",
        type: "button",
        label: "Listen on Spotify",
        href: "https://open.spotify.com/album/0dbZCuF9B22PA9d0ZJnhaT",
        style: { align: "center" },
      },
      { id: "notes", type: "text", markdown: read("./lost-songs.md") },
      { id: "player", type: "embed", url: "https://api.soundcloud.com/playlists/1508540197" },
    ],
  },
];

// The old blog stored HTML using only these tags.
function htmlToMarkdown(html: string): string {
  let item = 0;
  return html
    .replace(/<ol>/g, () => ((item = 0), ""))
    .replace(/<li>/g, () => `${++item}. `)
    .replace(/<\/li>/g, "\n")
    .replace(/<\/?i>/g, "*")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/p>|<\/ol>/g, "\n\n")
    .replace(/<p>/g, "")
    .trim();
}

// The old titles were placeholders that the page never showed, so posts are
// seeded without one.
const posts: Post[] = (
  JSON.parse(read("./blog.json")) as { date: string; content: string }[]
).map((entry) => {
  const date = new Date(`${entry.date} UTC`).toISOString().slice(0, 10);
  return {
    slug: date,
    date,
    collection: "writings",
    body: htmlToMarkdown(entry.content),
    published: true,
  };
});

async function seed(kind: "site" | "page" | "post", slug: string, doc: unknown) {
  if (!force && (await store.get(kind, slug))) {
    console.log(`skip  ${kind} ${slug} (exists)`);
    return;
  }
  await store.save(kind, slug, doc);
  console.log(`saved ${kind} ${slug}`);
}

await seed("site", "site", site);
for (const page of pages) await seed("page", page.slug, page);
for (const post of posts) await seed("post", post.slug, post);
(await redis()).destroy();
