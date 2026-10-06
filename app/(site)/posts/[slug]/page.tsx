import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell, PostView } from "@/components/cms/page-view";
import { getPosts, getSite } from "@/lib/cms/content";
import { formatPosted } from "@/lib/cms/render";
import styles from "@/styles/cms.module.scss";

type Props = { params: Promise<{ slug: string }> };

const findPost = async ({ params }: Props) => {
  const { slug } = await params;
  return (await getPosts()).find((post) => post.slug === slug);
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const post = await findPost(props);
  return post
    ? { title: `Lil Darkie ${post.title ?? formatPosted(post.date)}` }
    : {};
}

// The permalink for one published post, drawn with the site theme.
export default async function PostPage(props: Props) {
  const [post, site] = await Promise.all([findPost(props), getSite()]);
  if (!post) notFound();

  return (
    <PageShell site={site}>
      <div className={styles.panel}>
        <PostView post={post} />
      </div>
    </PageShell>
  );
}
