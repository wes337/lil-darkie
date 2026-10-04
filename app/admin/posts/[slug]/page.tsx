"use client";
import { use } from "react";
import CollectionField from "@/components/admin/collection-field";
import Editor from "@/components/admin/editor";
import { Field, OptionalTextField, TextField } from "@/components/admin/fields";
import RichEditor from "@/components/admin/rich-editor";
import { useRecord } from "@/components/admin/use-record";
import { DEFAULT_AUTHOR, postSchema, type Post } from "@/lib/cms/schema";

// What a datetime-local input shows for a stored post time, in the editor's
// own time zone. Old posts that only have a day show midnight.
function toLocalInput(date: string): string {
  if (!date.includes("T")) return `${date}T00:00`;
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 16);
}

export default function PostEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const record = useRecord<Post>(`/api/posts/${slug}`, postSchema, () => ({
    slug,
    author: DEFAULT_AUTHOR,
    date: new Date().toISOString(),
    collection: "writings",
    body: "",
    published: false,
  }));
  const post = record.doc;
  if (!post) return <p>Loading...</p>;

  return (
    <Editor
      title={post.title ?? slug}
      record={record}
      backHref="/admin/posts"
      viewHref={post.published ? `/posts/${slug}` : undefined}
      deletable
      tabs={{
        Edit: (
          <>
            <OptionalTextField
              label="Title"
              value={post.title}
              onChange={(title) => record.setDoc({ ...post, title })}
            />
            <div className="field">
              <span>Content</span>
              <RichEditor html={post.body} onChange={(body) => record.setDoc({ ...post, body })} />
            </div>
            <TextField
              label="Author"
              value={post.author}
              onChange={(author) => record.setDoc({ ...post, author })}
            />
            <Field label="Posted">
              <input
                type="datetime-local"
                value={toLocalInput(post.date)}
                onChange={(event) => {
                  const posted = new Date(event.target.value);
                  if (!Number.isNaN(posted.getTime())) {
                    record.setDoc({ ...post, date: posted.toISOString() });
                  }
                }}
              />
            </Field>
            <CollectionField
              value={post.collection}
              onChange={(collection) => record.setDoc({ ...post, collection })}
            />
            <label className="check">
              <input
                type="checkbox"
                checked={post.published}
                onChange={(event) => record.setDoc({ ...post, published: event.target.checked })}
              />
              Published
            </label>
          </>
        ),
      }}
    />
  );
}
