"use client";
import { ThemeFields } from "@/components/admin/block-editor";
import Editor from "@/components/admin/editor";
import { TextField } from "@/components/admin/fields";
import { useRecord } from "@/components/admin/use-record";
import { PageShell } from "@/components/cms/page-view";
import styles from "@/styles/cms.module.scss";
import { DEFAULT_SITE, siteSchema, type Site } from "@/lib/cms/schema";

export default function SiteEditor() {
  const record = useRecord<Site>("/api/site", siteSchema, () => DEFAULT_SITE);
  const site = record.doc;
  if (!site) return <p>Loading...</p>;

  const set = (changes: Partial<Site>) => record.setDoc({ ...site, ...changes });

  return (
    <Editor
      title="Settings"
      record={record}
      form={
        <>
          <TextField label="Copyright" value={site.copyright} onChange={(copyright) => set({ copyright })} />
          <ThemeFields theme={site.theme} onChange={(theme) => set({ theme })} />
        </>
      }
      preview={
        <PageShell site={site}>
          <h1 className={styles.heading}>Heading</h1>
          <p>
            Text <a href="#">Link</a>
          </p>
        </PageShell>
      }
    />
  );
}
