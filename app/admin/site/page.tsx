"use client";
import { ThemeFields } from "@/components/admin/block-editor";
import Editor from "@/components/admin/editor";
import { Field, RowControls, TextField, replaceAt } from "@/components/admin/fields";
import { useRecord } from "@/components/admin/use-record";
import { PageShell } from "@/components/cms/page-view";
import styles from "@/styles/cms.module.scss";
import {
  DEFAULT_SITE,
  SOCIAL_PLATFORMS,
  siteSchema,
  type Site,
} from "@/lib/cms/schema";

export default function SiteEditor() {
  const record = useRecord<Site>("/api/site", siteSchema, () => DEFAULT_SITE);
  const site = record.doc;
  if (!site) return <p>Loading...</p>;

  const set = (changes: Partial<Site>) => record.setDoc({ ...site, ...changes });

  return (
    <Editor
      title="Site settings"
      record={record}
      form={
        <>
          <h2>Social links</h2>
          {site.social.map((social, i) => (
            <fieldset key={i}>
              <legend>
                {social.platform}
                <RowControls items={site.social} index={i} onChange={(next) => set({ social: next })} />
              </legend>
              <Field label="Platform">
                <select
                  value={social.platform}
                  onChange={(event) =>
                    set({
                      social: replaceAt(site.social, i, {
                        ...social,
                        platform: event.target.value as typeof social.platform,
                      }),
                    })
                  }
                >
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <option key={platform}>{platform}</option>
                  ))}
                </select>
              </Field>
              <TextField
                label="URL"
                value={social.href}
                onChange={(href) => set({ social: replaceAt(site.social, i, { ...social, href }) })}
              />
            </fieldset>
          ))}
          <button
            type="button"
            onClick={() => set({ social: [...site.social, { platform: "spotify", href: "https://" }] })}
          >
            Add social link
          </button>

          <TextField label="Copyright line" value={site.copyright} onChange={(copyright) => set({ copyright })} />
          <p>Pages use this theme unless they set their own.</p>
          <ThemeFields theme={site.theme} onChange={(theme) => set({ theme })} />
        </>
      }
      preview={
        <PageShell site={site}>
          <section className={styles.block}>
            <div className={styles["block-inner"]}>
              <h1 className={styles.heading}>Heading</h1>
              <p>
                This is how text looks on a page that doesn&apos;t set its own
                theme. <a href="#">Links look like this.</a>
              </p>
            </div>
          </section>
        </PageShell>
      }
    />
  );
}
