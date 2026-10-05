"use client";
import { Issues } from "@/components/admin/editor";
import LinkList from "@/components/admin/navigation";
import { useFetched, useRecord } from "@/components/admin/use-record";
import { DEFAULT_SITE, siteSchema, type Page, type Site } from "@/lib/cms/schema";
import Icon from "@/components/admin/icon";

export default function NavigationView() {
  const record = useRecord<Site>("/api/site", siteSchema, () => DEFAULT_SITE);
  const pages = useFetched<Page[]>("/api/pages") ?? [];

  return (
    <main className="view">
      <header className="row">
        <h1>
          <Icon name="sitemap" size={32} />
          Navigation
        </h1>
      </header>
      <Issues issues={record.state.issues} />
      <LinkList record={record} field="nav" pages={pages} />
    </main>
  );
}
