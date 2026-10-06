"use client";
import { useState } from "react";
import CreateForm from "@/components/admin/create";
import CollectionField from "@/components/admin/collection-field";
import { DEFAULT_AUTHOR, type Post } from "@/lib/cms/schema";

// New posts start as drafts, so nothing shows on the site until the post is
// marked published in its editor.
export default function NewPost() {
  const [collection, setCollection] = useState("writings");

  return (
    <CreateForm<Post>
      heading="New post"
      kind="posts"
      titleLabel="Title"
      build={(title, slug) => ({
        slug,
        title: title || undefined,
        author: DEFAULT_AUTHOR,
        date: new Date().toISOString(),
        collection,
        body: "",
        published: false,
      })}
    >
      <CollectionField value={collection} onChange={setCollection} />
    </CreateForm>
  );
}
