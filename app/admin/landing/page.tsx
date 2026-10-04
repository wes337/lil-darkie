"use client";
import { Issues } from "@/components/admin/editor";
import LinkList from "@/components/admin/navigation";
import { useFetched, useRecord } from "@/components/admin/use-record";
import { DEFAULT_SITE, siteSchema, type Page, type Site } from "@/lib/cms/schema";

export default function LandingView() {
  const record = useRecord<Site>("/api/site", siteSchema, () => DEFAULT_SITE);
  const pages = useFetched<Page[]>("/api/pages") ?? [];

  return (
    <main className="view">
      <header className="row">
        <h1>Landing</h1>
      </header>
      <p>
        The buttons on the home page, shown in order under &quot;Play the
        Game&quot;. Changes here are live at once.
      </p>
      <Issues issues={record.state.issues} />
      <LinkList record={record} field="homeButtons" pages={pages} />
    </main>
  );
}
