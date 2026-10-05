import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_LANDING_BUTTONS, DEFAULT_SITE, describeIssues, pageSchema, postSchema, siteSchema } from "./schema.ts";

const page = {
  slug: "comics",
  title: "Comics",
  theme: { backgroundColor: "#ffffff" },
  blocks: [
    { id: "a", type: "heading", level: 1, text: "Comics" },
    { id: "b", type: "slideshow", images: ["/images/1.png", "https://cdn.example/2.png"] },
    { id: "c", type: "text", markdown: "Hi", style: { align: "center" } },
  ],
};

test("accepts a valid page", () => {
  assert.deepEqual(pageSchema.parse(page), page);
});

test("landing layouts preserve their separate lists and accept older site records", () => {
  assert.deepEqual(siteSchema.parse(DEFAULT_SITE), DEFAULT_SITE);
  const site = {
    ...DEFAULT_SITE,
    homeButtons: [{ label: "Tickets", href: "/tour", textColor: "#ffffff" }],
    landingButtons: DEFAULT_LANDING_BUTTONS,
  };
  for (const landingLayout of ["simple", "painting"]) {
    const input = { ...site, landingLayout };
    assert.deepEqual(siteSchema.parse(input), input);
  }
  assert.deepEqual(siteSchema.parse({ ...site, landingButtons: [] }).landingButtons, []);
});

test("landing actions and link destinations are validated separately", () => {
  for (const button of [
    { type: "link", label: "Missing URL" },
    { type: "link", label: "Unsafe", href: "javascript:alert(1)" },
    { type: "game", label: "Play", href: "/tour" },
    { type: "menu", label: "" },
    { type: "unknown", label: "Unknown" },
  ]) {
    assert.equal(siteSchema.safeParse({ ...DEFAULT_SITE, landingButtons: [button] }).success, false);
  }
});

test("uploaded fonts need a unique, CSS-safe name and a font file URL", () => {
  const comic = { name: "Comic Neue", url: "https://cdn.example/cms/abc-comic-neue.woff2" };
  const withFonts = (fonts: unknown[]) => siteSchema.safeParse({ ...DEFAULT_SITE, fonts }).success;
  assert.equal(withFonts([comic, { name: "Other", url: "/fonts/other.ttf" }]), true);
  assert.equal(withFonts([comic, comic]), false);
  assert.equal(withFonts([{ ...comic, name: "arial" }]), false);
  assert.equal(withFonts([{ ...comic, name: 'x"; color: red' }]), false);
  assert.equal(withFonts([{ ...comic, url: "https://cdn.example/a.png" }]), false);
  assert.equal(withFonts([{ ...comic, url: 'https://cdn.example/a").woff2' }]), false);
  // A page can name an uploaded font.
  assert.equal(pageSchema.safeParse({ ...page, theme: { font: comic.name } }).success, true);
});

test("rejects reserved and malformed page slugs", () => {
  for (const slug of ["admin", "api", "sampler", "posts", "Has Spaces", "a/b", ""]) {
    assert.equal(pageSchema.safeParse({ ...page, slug }).success, false, slug);
  }
});

test("reports each problem in a bad page with its location", () => {
  const result = pageSchema.safeParse({
    ...page,
    theme: { backgroundColor: "red" },
    blocks: [
      { id: "a", type: "heading", level: 7, text: "Too deep" },
      { id: "b", type: "carousel" },
      { id: "c", type: "text", markdown: "Hi", extra: true },
    ],
  });
  assert.equal(result.success, false);
  const issues = describeIssues(result.error!).join("\n");
  assert.match(issues, /theme\.backgroundColor: Use a hex color/);
  assert.match(issues, /blocks\.0\.level/);
  assert.match(issues, /blocks\.1\.type/);
  assert.match(issues, /blocks\.2: .*extra/);
});

test("rejects script and data URLs in links and images", () => {
  for (const href of ["javascript:alert(1)", "data:text/html,x", "comics"]) {
    const block = { id: "a", type: "button", label: "Go", href };
    assert.equal(pageSchema.safeParse({ ...page, blocks: [block] }).success, false, href);
  }
});

test("a box groups other blocks but not another box", () => {
  const text = { id: "t", type: "text", markdown: "Hi" };
  const withBox = (blocks: unknown[]) =>
    pageSchema.safeParse({ ...page, blocks: [{ id: "b", type: "box", blocks }] }).success;
  assert.equal(withBox([text, { id: "h", type: "heading", level: 2, text: "Hi" }]), true);
  assert.equal(withBox([]), true);
  assert.equal(withBox([{ id: "inner", type: "box", blocks: [text] }]), false);
});

test("tour shows need a real date, a city and a venue", () => {
  const show = { date: "2026-10-17", city: "San Francisco, CA", venue: "Neck of the Woods" };
  const withShows = (shows: unknown[]) =>
    pageSchema.safeParse({ ...page, blocks: [{ id: "a", type: "tour", shows }] }).success;
  assert.equal(withShows([show, { ...show, soldOut: true, opener: "AFOURTEEN" }]), true);
  assert.equal(withShows([{ ...show, date: "17 October 2026" }]), false);
  assert.equal(withShows([{ ...show, city: "" }]), false);
  assert.equal(withShows([{ ...show, ticketLink: "not a url" }]), false);
});

test("posts need an author and a real date, and may omit the title", () => {
  const post = { slug: "hello", author: "Lil Darkie", date: "2026-04-16T22:12:00.000Z", collection: "writings", body: "", published: false };
  assert.equal(postSchema.safeParse(post).success, true);
  assert.equal(postSchema.safeParse({ ...post, date: "2026-04-16" }).success, true);
  assert.equal(postSchema.safeParse({ ...post, author: "" }).success, false);
  assert.equal(postSchema.safeParse({ ...post, date: "April 16, 2026" }).success, false);
  assert.equal(postSchema.safeParse({ ...post, date: "2026-02-30" }).success, false);
});
