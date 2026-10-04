"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFetched } from "@/components/admin/use-record";
import { formatPostDate } from "@/lib/cms/render";
import type { Page, Post } from "@/lib/cms/schema";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Asks for a name and opens the editor for a record with that slug. Nothing
// is created until the editor saves.
function NewForm({ kind, placeholder }: { kind: "pages" | "posts"; placeholder: string }) {
  const router = useRouter();
  const [name, setName] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const slug = slugify(name);
    if (slug) router.push(`/admin/${kind}/${slug}`);
  }

  return (
    <form className="row" onSubmit={submit}>
      <input
        type="text"
        value={name}
        placeholder={placeholder}
        onChange={(event) => setName(event.target.value)}
      />
      <button>New</button>
      {name && <small>URL: /{kind === "posts" ? "posts/" : ""}{slugify(name)}</small>}
    </form>
  );
}

export default function AdminHome() {
  const router = useRouter();
  const pages = useFetched<Page[]>("/api/pages");
  const posts = useFetched<Post[]>("/api/posts");

  async function logOut() {
    await fetch("/api/login", { method: "DELETE" });
    router.refresh();
  }

  return (
    <main className="dashboard">
      <header className="row">
        <h1>Lil Darkie admin</h1>
        <span className="spacer" />
        <Link href="/admin/site">Menu and site settings</Link>
        <Link href="/admin/media">Media</Link>
        <button type="button" onClick={logOut}>
          Log out
        </button>
      </header>

      <section>
        <h2>Pages</h2>
        <ul>
          {pages
            ?.sort((a, b) => a.title.localeCompare(b.title))
            .map((page) => (
              <li key={page.slug}>
                <Link href={`/admin/pages/${page.slug}`}>{page.title}</Link>
                <small>/{page.slug}</small>
              </li>
            ))}
        </ul>
        <NewForm kind="pages" placeholder="New page name" />
      </section>

      <section>
        <h2>Posts</h2>
        <ul>
          {posts
            ?.sort((a, b) => b.date.localeCompare(a.date))
            .map((post) => (
              <li key={post.slug}>
                <Link href={`/admin/posts/${post.slug}`}>
                  {post.title ?? formatPostDate(post.date)}
                </Link>
                <small>
                  {post.collection} · {formatPostDate(post.date)}
                </small>
                {!post.published && <span className="badge">draft</span>}
              </li>
            ))}
        </ul>
        <NewForm kind="posts" placeholder="New post name" />
      </section>
    </main>
  );
}
