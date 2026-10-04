"use client";
import { use } from "react";
import BlockEditor, { ThemeFields } from "@/components/admin/block-editor";
import Editor from "@/components/admin/editor";
import { TextField } from "@/components/admin/fields";
import { useFetched, useRecord } from "@/components/admin/use-record";
import PageView from "@/components/cms/page-view";
import { resolveTheme } from "@/lib/cms/render";
import { DEFAULT_SITE, pageSchema, type Page, type Post, type Site } from "@/lib/cms/schema";

export default function PageEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const record = useRecord<Page>(`/api/pages/${slug}`, pageSchema, () => ({
    slug,
    title: slug,
    theme: {},
    blocks: [],
  }));
  const site = useFetched<Site>("/api/site") ?? DEFAULT_SITE;
  const posts = useFetched<Post[]>("/api/posts") ?? [];
  const page = record.doc;
  if (!page) return <p>Loading...</p>;

  const collections = [...new Set(posts.map((post) => post.collection))];

  return (
    <Editor
      title={page.title}
      record={record}
      backHref="/admin/pages"
      viewHref={`/${slug}`}
      deletable
      tabs={{
        Content: (
          <>
            <TextField
              label="Title"
              value={page.title}
              onChange={(title) => record.setDoc({ ...page, title })}
            />
            <BlockEditor blocks={page.blocks} onChange={(blocks) => record.setDoc({ ...page, blocks })} />
            <datalist id="collections">
              {collections.map((collection) => (
                <option key={collection} value={collection} />
              ))}
            </datalist>
          </>
        ),
        Theme: (
          <ThemeFields
            theme={page.theme}
            inherited={resolveTheme(site.theme)}
            onChange={(theme) => record.setDoc({ ...page, theme })}
          />
        ),
      }}
      preview={
        <PageView
          page={page}
          site={site}
          posts={posts
            .filter((post) => post.published)
            .sort((a, b) => b.date.localeCompare(a.date))}
        />
      }
    />
  );
}
