import assert from "node:assert/strict";
import test from "node:test";
import { describeIssues, pageSchema, postSchema } from "./schema.ts";

const page = {
  slug: "comics",
  title: "Comics",
  theme: { backgroundColor: "#ffffff" },
  blocks: [
    { id: "a", type: "heading", level: 1, text: "Comics" },
    { id: "b", type: "slideshow", images: ["/images/1.png", "https://cdn.example/2.png"] },
    { id: "c", type: "text", markdown: "Hi", style: { align: "center", width: "full" } },
  ],
};

test("accepts a valid page", () => {
  assert.deepEqual(pageSchema.parse(page), page);
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

test("posts need an author and a real date, and may omit the title", () => {
  const post = { slug: "hello", author: "Lil Darkie", date: "2026-04-16T22:12:00.000Z", collection: "writings", body: "", published: false };
  assert.equal(postSchema.safeParse(post).success, true);
  assert.equal(postSchema.safeParse({ ...post, date: "2026-04-16" }).success, true);
  assert.equal(postSchema.safeParse({ ...post, author: "" }).success, false);
  assert.equal(postSchema.safeParse({ ...post, date: "April 16, 2026" }).success, false);
  assert.equal(postSchema.safeParse({ ...post, date: "2026-02-30" }).success, false);
});
