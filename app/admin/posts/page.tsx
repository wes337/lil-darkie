"use client";
import Link from "next/link";
import { useFetched } from "@/components/admin/use-record";
import { formatPostDate } from "@/lib/cms/render";
import type { Post } from "@/lib/cms/schema";

export default function PostsView() {
  const posts = useFetched<Post[]>("/api/posts");

  return (
    <main className="view">
      <header className="row">
        <h1>Posts</h1>
        <span className="spacer" />
        <Link className="button primary" href="/admin/posts/new">
          New post
        </Link>
      </header>
      <ul className="list">
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
      {posts?.length === 0 && <p>No posts yet.</p>}
    </main>
  );
}
