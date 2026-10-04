"use client";
import { Issues } from "@/components/admin/editor";
import LinkList from "@/components/admin/navigation";
import { useFetched, useRecord } from "@/components/admin/use-record";
import { DEFAULT_SITE, siteSchema, type Page, type Site } from "@/lib/cms/schema";

export default function NavigationView() {
  const record = useRecord<Site>("/api/site", siteSchema, () => DEFAULT_SITE);
  const pages = useFetched<Page[]>("/api/pages") ?? [];

  return (
    <main className="view">
      <header className="row">
        <h1>Navigation</h1>
      </header>
      <p>Changes here are live at once.</p>
      <Issues issues={record.state.issues} />

      <h2>Menu</h2>
      <p>The links in the site menu, in order.</p>
      <LinkList record={record} field="nav" pages={pages} />

      <h2>Home page buttons</h2>
      <p>Extra buttons on the home page, shown under &quot;Play the Game&quot;.</p>
      <LinkList record={record} field="homeButtons" pages={pages} />
    </main>
  );
}
