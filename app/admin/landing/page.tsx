"use client";
import { Issues } from "@/components/admin/editor";
import Icon from "@/components/admin/icon";
import LandingButtons from "@/components/admin/landing-buttons";
import { useFetched, useRecord } from "@/components/admin/use-record";
import { DEFAULT_SITE, siteSchema, type Page, type Site } from "@/lib/cms/schema";

export default function LandingView() {
  const record = useRecord<Site>("/api/site", siteSchema, () => DEFAULT_SITE);
  const pages = useFetched<Page[]>("/api/pages") ?? [];
  if (!record.doc) return <p>Loading...</p>;

  return (
    <main className="view">
      <header className="row">
        <h1>
          <Icon name="house" size={32} />
          Landing
        </h1>
        <span className="spacer" />
        {record.state.saved && <span className="saved">Saved</span>}
        <a className="button" href="/" target="_blank" rel="noreferrer">
          <Icon name="world_go" />
          View
        </a>
      </header>
      <Issues issues={record.state.issues} />
      <LandingButtons record={record} pages={pages} />
    </main>
  );
}
