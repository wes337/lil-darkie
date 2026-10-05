"use client";
import Link from "next/link";
import { useFetched } from "@/components/admin/use-record";
import { formatPosted } from "@/lib/cms/render";
import type { Post } from "@/lib/cms/schema";
import Icon from "@/components/admin/icon";

// Posts under a heading per collection, newest first within each.
export default function PostsView() {
  const posts = useFetched<Post[]>("/api/posts");
  const collections = Object.entries(
    Object.groupBy(posts ?? [], (post) => post.collection),
  ).sort(([a], [b]) => a.localeCompare(b));

  return (
    <main className="view">
      <header className="row">
        <h1>
          <Icon name="newspaper" size={32} />
          Posts
        </h1>
        <span className="spacer" />
        <Link className="button primary" href="/admin/posts/new">
          New post
        </Link>
      </header>
      {collections.map(([collection, group = []]) => (
        <section key={collection}>
          <h2>{collection}</h2>
          <ul className="list">
            {group
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((post) => (
                <li key={post.slug}>
                  <Link href={`/admin/posts/${post.slug}`}>
                    {post.title ?? formatPosted(post.date)}
                  </Link>
                  {post.title && <small>{formatPosted(post.date)}</small>}
                  <small>{post.author}</small>
                  {!post.published && <span className="badge">draft</span>}
                </li>
              ))}
          </ul>
        </section>
      ))}
      {posts?.length === 0 && <p>No posts yet.</p>}
    </main>
  );
}
