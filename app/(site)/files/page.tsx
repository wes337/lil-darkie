import type { Metadata } from "next";
import Icon from "@/components/admin/icon";
import { PageShell } from "@/components/cms/page-view";
import { getSite } from "@/lib/cms/content";
import { fileIcon, formatBytes, formatModified } from "@/lib/cms/render";
import styles from "@/styles/cms.module.scss";

export const metadata: Metadata = { title: "Lil Darkie Files" };

// The downloads from the site record, in the order the admin set, drawn
// like a server's directory listing. Unlike the other pages this one has
// no blocks.
export default async function FilesPage() {
  const site = await getSite();
  const files = site.files ?? [];

  return (
    <PageShell site={site}>
      <div className={styles.index}>
        <h1 className={styles.heading}>Files</h1>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Last modified</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Icon name="folder" />
                <a href="/">Parent Directory</a>
              </td>
              <td></td>
              <td>-</td>
            </tr>
            {files.map((file) => (
              <tr key={file.url}>
                <td>
                  <Icon name={fileIcon(file.label, file.url)} />
                  <a href={file.url} target="_blank" rel="noreferrer">
                    {file.label}
                  </a>
                </td>
                <td>{file.date ? formatModified(file.date) : ""}</td>
                <td>{file.size !== undefined ? formatBytes(file.size) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
