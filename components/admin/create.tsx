"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { Issues } from "./editor";
import { TextField } from "./fields";
import Icon from "./icon";

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// The "new page" and "new post" screens. Asks for a title and a slug, creates
// the record and opens its editor. The slug follows the title until it's
// edited by hand. `children` are any extra fields the record needs.
export default function CreateForm<T>({
  heading,
  kind,
  titleLabel,
  build,
  children,
}: {
  heading: string;
  kind: "pages" | "posts";
  titleLabel: string;
  // Makes the record to save from what was typed.
  build: (title: string, slug: string) => T;
  children?: ReactNode;
}) {
  const [title, setTitle] = useState("");
  const [typedSlug, setTypedSlug] = useState<string>();
  const [issues, setIssues] = useState<string[]>([]);
  // Typed by hand it wins; cleared, it goes back to following the title.
  const slug = typedSlug === undefined ? slugify(title) : slugify(typedSlug);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const path = `/api/${kind}/${slug}`;
    if (!slug) return setIssues(["Give it a slug."]);
    // /admin/<kind>/new is this screen.
    if (slug === "new") return setIssues(['The slug can\'t be "new".']);
    if ((await fetch(path)).ok) return setIssues(["That slug is already taken."]);

    const response = await fetch(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(build(title, slug)),
    });
    if (response.ok) return window.location.assign(`/admin/${kind}/${slug}`);
    const body = await response.json().catch(() => ({}));
    setIssues(body.issues ?? [body.error ?? "Couldn't create it."]);
  }

  return (
    <main className="view narrow">
      <a href={`/admin/${kind}`}>← Back</a>
      <h1>
        <Icon name={kind === "pages" ? "page" : "newspaper"} size={32} />
        {heading}
      </h1>
      <form onSubmit={submit}>
        <TextField label={titleLabel} value={title} onChange={setTitle} />
        <TextField
          label="Slug"
          value={typedSlug ?? slug}
          // Kept loose while typing so a dash can be entered; cleaned on use.
          onChange={(value) =>
            setTypedSlug(value === "" ? undefined : value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))
          }
        />
        {children}
        <Issues issues={issues} />
        <div className="row">
          <button className="primary">Create</button>
          <a className="button dismiss" href={`/admin/${kind}`}>
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}
