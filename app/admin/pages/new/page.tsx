"use client";
import CreateForm from "@/components/admin/create";
import type { Page } from "@/lib/cms/schema";

export default function NewPage() {
  return (
    <CreateForm<Page>
      heading="New page"
      kind="pages"
      titleLabel="Title"
      build={(title, slug) => ({ slug, title: title || slug, theme: {}, blocks: [] })}
    />
  );
}
