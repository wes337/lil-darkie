"use client";
import { ThemeFields } from "@/components/admin/block-editor";
import Editor from "@/components/admin/editor";
import { TextField } from "@/components/admin/fields";
import { useRecord } from "@/components/admin/use-record";
import { PageShell } from "@/components/cms/page-view";
import { resolveTheme } from "@/lib/cms/render";
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
      tabs={{
        Edit: (
          <>
            <TextField label="Copyright" value={site.copyright} onChange={(copyright) => set({ copyright })} />
            <ThemeFields
              theme={site.theme}
              inherited={resolveTheme()}
              onChange={(theme) => set({ theme })}
            />
          </>
        ),
      }}
      preview={
        <PageShell site={site}>
          <div className={styles.panel}>
            <h1 className={styles.heading}>Heading</h1>
            <p>
              Text <a href="#">Link</a>
            </p>
            <p>
              <a className={styles.button} href="#">
                Button
              </a>
            </p>
          </div>
        </PageShell>
      }
    />
  );
}
