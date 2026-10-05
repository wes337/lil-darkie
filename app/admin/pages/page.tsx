"use client";
import Link from "next/link";
import { useFetched } from "@/components/admin/use-record";
import type { Page } from "@/lib/cms/schema";
import Icon from "@/components/admin/icon";

export default function PagesView() {
  const pages = useFetched<Page[]>("/api/pages");

  return (
    <main className="view">
      <header className="row">
        <h1>
          <Icon name="page" size={32} />
          Pages
        </h1>
        <span className="spacer" />
        <Link className="button primary" href="/admin/pages/new">
          New page
        </Link>
      </header>
      {pages && pages.length > 0 && (
        <ul className="list">
          {pages
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((page) => (
              <li key={page.slug}>
                <Link href={`/admin/pages/${page.slug}`}>{page.title}</Link>
                <small>/{page.slug}</small>
              </li>
            ))}
        </ul>
      )}
      {pages?.length === 0 && <p>No pages yet.</p>}
    </main>
  );
}
