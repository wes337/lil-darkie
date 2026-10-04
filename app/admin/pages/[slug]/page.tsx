"use client";
import { use, useState } from "react";
import BlockEditor, { ThemeFields } from "@/components/admin/block-editor";
import Editor from "@/components/admin/editor";
import { TextField } from "@/components/admin/fields";
import { useFetched, useRecord } from "@/components/admin/use-record";
import PageView from "@/components/cms/page-view";
import { resolveTheme } from "@/lib/cms/render";
import { DEFAULT_SITE, pageSchema, type Page, type Post, type Site } from "@/lib/cms/schema";

// The two halves of a page's form, picked under its title.
const SECTIONS = ["Content", "Theme"] as const;

export default function PageEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [section, setSection] = useState<(typeof SECTIONS)[number]>("Content");
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

  return (
    <Editor
      title={page.title}
      record={record}
      backHref="/admin/pages"
      viewHref={`/${slug}`}
      deletable
      tabs={{
        Edit: (
          <>
            <TextField
              label="Title"
              value={page.title}
              onChange={(title) => record.setDoc({ ...page, title })}
            />
            <div className="tabs">
              {SECTIONS.map((name) => (
                <button
                  type="button"
                  key={name}
                  aria-pressed={section === name}
                  onClick={() => setSection(name)}
                >
                  {name}
                </button>
              ))}
            </div>
            {section === "Content" ? (
              <BlockEditor blocks={page.blocks} onChange={(blocks) => record.setDoc({ ...page, blocks })} />
            ) : (
              <ThemeFields
                theme={page.theme}
                inherited={resolveTheme(site.theme)}
                onChange={(theme) => record.setDoc({ ...page, theme })}
              />
            )}
          </>
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
