"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Issues } from "./editor";
import { TextField } from "./fields";

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// The "new page" and "new post" screens. Asks for a title and a URL, creates
// the record and opens its editor. The URL follows the title until it's
// edited by hand. `children` are any extra fields the record needs.
export default function CreateForm<T>({
  heading,
  kind,
  urlPrefix,
  titleLabel,
  build,
  children,
}: {
  heading: string;
  kind: "pages" | "posts";
  // Shown before the slug so the full address is clear.
  urlPrefix: string;
  titleLabel: string;
  // Makes the record to save from what was typed.
  build: (title: string, slug: string) => T;
  children?: ReactNode;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [typedSlug, setTypedSlug] = useState<string>();
  const [issues, setIssues] = useState<string[]>([]);
  const slug = typedSlug ?? slugify(title);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const path = `/api/${kind}/${slug}`;
    if (!slug) return setIssues(["Give it a URL."]);
    // /admin/<kind>/new is this screen.
    if (slug === "new") return setIssues(['The URL can\'t be "new".']);
    if ((await fetch(path)).ok) return setIssues(["That URL is already taken."]);

    const response = await fetch(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(build(title, slug)),
    });
    if (response.ok) return router.push(`/admin/${kind}/${slug}`);
    const body = await response.json().catch(() => ({}));
    setIssues(body.issues ?? [body.error ?? "Couldn't create it."]);
  }

  return (
    <main className="view narrow">
      <Link href={`/admin/${kind}`}>← Back</Link>
      <h1>{heading}</h1>
      <form onSubmit={submit}>
        <TextField label={titleLabel} value={title} onChange={setTitle} />
        <TextField
          label={`URL: ${urlPrefix}${slug || "..."}`}
          value={slug}
          onChange={(value) => setTypedSlug(slugify(value))}
        />
        {children}
        <Issues issues={issues} />
        <div className="row">
          <button className="primary">Create</button>
          <Link className="button dismiss" href={`/admin/${kind}`}>
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
