import type { ReactNode } from "react";
import { marked } from "marked";
import { FONTS, type ContentBlock, type Page, type Post, type Site, type Theme } from "@/lib/cms/schema";
import {
  blockStyleCss,
  embedSource,
  formatPosted,
  formatShowDate,
  upcomingShows,
  themeStyle,
} from "@/lib/cms/render";
import Slideshow from "./slideshow";
import styles from "@/styles/cms.module.scss";

function Markdown({ source }: { source: string }) {
  const html = marked.parse(source, { async: false, breaks: true });
  return <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />;
}

// One post as it appears in a feed and on its own page.
export function PostView({ post }: { post: Post }) {
  return (
    <article className={styles.post}>
      {post.title && <h2>{post.title}</h2>}
      <div className={styles.prose} dangerouslySetInnerHTML={{ __html: post.body }} />
      <footer>
        Posted by <strong>{post.author}</strong> on{" "}
        <a href={`/posts/${post.slug}`}>{formatPosted(post.date)}</a>
      </footer>
    </article>
  );
}

function BlockContent({ block, posts }: { block: ContentBlock; posts: Post[] }) {
  switch (block.type) {
    case "heading": {
      const Tag = `h${block.level}` as const;
      return (
        <Tag
          className={styles.heading}
          style={block.font && { fontFamily: FONTS[block.font] }}
        >
          {block.text}
        </Tag>
      );
    }
    case "text":
      return <Markdown source={block.markdown} />;
    case "image": {
      const image = <img src={block.src} alt={block.alt ?? ""} />;
      return (
        <figure className={styles.image}>
          {block.href ? <a href={block.href}>{image}</a> : image}
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    }
    case "slideshow":
      return <Slideshow images={block.images} />;
    case "embed": {
      const { src, height } = embedSource(block.url);
      return (
        <iframe
          className={styles.embed}
          src={src}
          title="Embedded player"
          style={{ height: block.height ?? height }}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      );
    }
    case "button":
      return (
        <a className={styles.button} href={block.href}>
          {block.label}
        </a>
      );
    case "spacer":
      return <div className={styles.spacer} data-size={block.size} />;
    case "posts":
      return (
        <div className={styles.posts}>
          {posts
            .filter((post) => post.collection === block.collection)
            .slice(0, block.limit)
            .map((post) => (
              <PostView key={post.slug} post={post} />
            ))}
        </div>
      );
    case "html":
      return <div dangerouslySetInnerHTML={{ __html: block.html }} />;
    case "tour": {
      const shows = upcomingShows(block.shows);
      if (shows.length === 0) return <p>No upcoming shows.</p>;
      return (
        <ul className={styles.tour}>
          {shows.map((show) => (
            <li key={`${show.date}-${show.venue}`}>
              <time dateTime={show.date}>{formatShowDate(show.date)}</time>
              <div>
                <strong>{show.city}</strong>
                <span>{show.venue}</span>
                {show.opener && <span>with {show.opener}</span>}
              </div>
              {show.soldOut ? (
                <em>Sold out</em>
              ) : (
                show.ticketLink && (
                  <a className={styles.button} href={show.ticketLink} target="_blank">
                    Tickets
                  </a>
                )
              )}
            </li>
          ))}
        </ul>
      );
    }
  }
}

// One block with its own style overrides applied.
function BlockSection({ block, posts }: { block: ContentBlock; posts: Post[] }) {
  return (
    <section
      className={styles.block}
      data-filled={Boolean(block.style?.backgroundColor || block.style?.backgroundImage)}
      style={blockStyleCss(block.style)}
    >
      <BlockContent block={block} posts={posts} />
    </section>
  );
}

// The themed wrapper shared by pages and single posts.
export function PageShell({
  site,
  theme,
  children,
}: {
  site: Site;
  theme?: Theme;
  children: ReactNode;
}) {
  return (
    <main className={styles.page} style={themeStyle(site, theme)}>
      <div className={styles.content}>{children}</div>
      <footer className={styles.footer}>{site.copyright}</footer>
    </main>
  );
}

// Draws a page from its record. The editor preview uses it too, so it takes
// everything it needs as props. `posts` are the published posts, newest first.
export default function PageView({
  page,
  site,
  posts,
}: {
  page: Page;
  site: Site;
  posts: Post[];
}) {
  return (
    <PageShell site={site} theme={page.theme}>
      {page.blocks.map((block) =>
        block.type === "box" ? (
          <div key={block.id} className={styles.panel} style={blockStyleCss(block.style)}>
            {block.blocks.map((child) => (
              <BlockSection key={child.id} block={child} posts={posts} />
            ))}
          </div>
        ) : (
          <BlockSection key={block.id} block={block} posts={posts} />
        ),
      )}
    </PageShell>
  );
}
