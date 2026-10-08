import type { Metadata } from "next";
import { PageShell } from "@/components/cms/page-view";
import { getSite } from "@/lib/cms/content";
import { formatBytes } from "@/lib/cms/render";
import styles from "@/styles/cms.module.scss";

export const metadata: Metadata = { title: "Lil Darkie Files" };

// The downloads from the site record, in the order the admin set. Unlike
// the other pages this one has no blocks: it's a list and nothing else.
export default async function FilesPage() {
  const site = await getSite();
  const files = site.files ?? [];

  return (
    <PageShell site={site}>
      <div className={styles.panel}>
        <h1 className={styles.heading}>Files</h1>
        {files.length === 0 ? (
          <p>No files yet.</p>
        ) : (
          <ul className={styles.files}>
            {files.map((file) => (
              <li key={file.url}>
                <a href={file.url} target="_blank" rel="noreferrer">
                  {file.label}
                </a>
                {file.size !== undefined && <span>{formatBytes(file.size)}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
