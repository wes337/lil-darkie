import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageView from "@/components/cms/page-view";
import { getPage, getPosts, getSite } from "@/lib/cms/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage((await params).slug);
  return page ? { title: `Lil Darkie ${page.title}` } : {};
}

// Every page the admin creates is served from here.
export default async function CmsPage({ params }: Props) {
  const [page, site, posts] = await Promise.all([
    getPage((await params).slug),
    getSite(),
    getPosts(),
  ]);
  if (!page) notFound();

  return <PageView page={page} site={site} posts={posts} />;
}
