"use client";
import { use } from "react";
import Editor from "@/components/admin/editor";
import { Field, OptionalTextField, TextField } from "@/components/admin/fields";
import { useFetched, useRecord } from "@/components/admin/use-record";
import { PageShell, PostView } from "@/components/cms/page-view";
import { DEFAULT_SITE, postSchema, type Post, type Site } from "@/lib/cms/schema";
import styles from "@/styles/cms.module.scss";

export default function PostEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const record = useRecord<Post>(`/api/posts/${slug}`, postSchema, () => ({
    slug,
    date: new Date().toISOString().slice(0, 10),
    collection: "writings",
    body: "",
    published: false,
  }));
  const site = useFetched<Site>("/api/site") ?? DEFAULT_SITE;
  const posts = useFetched<Post[]>("/api/posts") ?? [];
  const post = record.doc;
  if (!post) return <p>Loading...</p>;

  const collections = [...new Set(posts.map((other) => other.collection))];

  return (
    <Editor
      title={post.title ?? slug}
      record={record}
      viewHref={post.published ? `/posts/${slug}` : undefined}
      deletable
      form={
        <>
          <OptionalTextField
            label="Title (optional)"
            value={post.title}
            onChange={(title) => record.setDoc({ ...post, title })}
          />
          <Field label="Date">
            <input
              type="date"
              value={post.date}
              onChange={(event) => record.setDoc({ ...post, date: event.target.value })}
            />
          </Field>
          <TextField
            label="Collection (pages show posts by collection)"
            value={post.collection}
            list="collections"
            onChange={(collection) => record.setDoc({ ...post, collection })}
          />
          <datalist id="collections">
            {collections.map((collection) => (
              <option key={collection} value={collection} />
            ))}
          </datalist>
          <label className="check">
            <input
              type="checkbox"
              checked={post.published}
              onChange={(event) => record.setDoc({ ...post, published: event.target.checked })}
            />
            Published. Unticked posts are drafts only you can see.
          </label>
          <TextField
            label="Body (Markdown)"
            rows={20}
            value={post.body}
            onChange={(body) => record.setDoc({ ...post, body })}
          />
        </>
      }
      preview={
        <PageShell site={site}>
          <section className={styles.block}>
            <div className={styles["block-inner"]}>
              <PostView post={post} />
            </div>
          </section>
        </PageShell>
      }
    />
  );
}
