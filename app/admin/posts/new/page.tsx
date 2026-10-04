"use client";
import { useState } from "react";
import CreateForm from "@/components/admin/create";
import { TextField } from "@/components/admin/fields";
import { useFetched } from "@/components/admin/use-record";
import type { Post } from "@/lib/cms/schema";

// New posts start as drafts, so nothing shows on the site until the post is
// marked published in its editor.
export default function NewPost() {
  const posts = useFetched<Post[]>("/api/posts") ?? [];
  const [collection, setCollection] = useState("writings");
  const collections = [...new Set(posts.map((post) => post.collection))];

  return (
    <CreateForm<Post>
      heading="New post"
      kind="posts"
      urlPrefix="/posts/"
      titleLabel="Title"
      build={(title, slug) => ({
        slug,
        title: title || undefined,
        date: new Date().toISOString().slice(0, 10),
        collection,
        body: "",
        published: false,
      })}
    >
      <TextField
        label="Collection"
        value={collection}
        list="collections"
        onChange={setCollection}
      />
      <datalist id="collections">
        {collections.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </CreateForm>
  );
}
