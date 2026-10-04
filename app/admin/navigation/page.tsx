"use client";
import Navigation from "@/components/admin/navigation";
import { useFetched } from "@/components/admin/use-record";
import type { Page } from "@/lib/cms/schema";

export default function NavigationView() {
  const pages = useFetched<Page[]>("/api/pages") ?? [];

  return (
    <main className="view">
      <header className="row">
        <h1>Navigation</h1>
      </header>
      <p>The links in the site menu, in order. Changes here are live at once.</p>
      <Navigation pages={pages} />
    </main>
  );
}
