import type { CSSProperties } from "react";
import { FONTS, type BlockStyle, type Site, type Theme } from "./schema.ts";

// Pure helpers shared by the public pages and the editor preview.

const BASE_THEME = {
  backgroundColor: "#000000",
  textColor: "#ffffff",
  accentColor: "#f6c601",
  font: "martian-mono",
  backgroundFocus: "center",
} satisfies Theme;

// Page theme over site theme over the built-in defaults, as CSS variables for
// the page wrapper.
export function themeStyle(site: Site, theme: Theme = {}): CSSProperties {
  const merged = { ...BASE_THEME };
  for (const layer of [site.theme, theme]) {
    for (const [key, value] of Object.entries(layer)) {
      if (value !== undefined && value !== "") Object.assign(merged, { [key]: value });
    }
  }
  const { backgroundImage } = { ...site.theme, ...theme };
  return {
    "--cms-bg": merged.backgroundColor,
    "--cms-text": merged.textColor,
    "--cms-accent": merged.accentColor,
    "--cms-font": FONTS[merged.font],
    ...(backgroundImage && {
      backgroundImage: `url("${backgroundImage}")`,
      backgroundPosition: merged.backgroundFocus,
    }),
  } as CSSProperties;
}

export function blockStyleCss(style: BlockStyle = {}): CSSProperties {
  return {
    color: style.textColor,
    // Headings follow the block's text color when it has one.
    ...(style.textColor && { "--cms-heading": style.textColor }),
    backgroundColor: style.backgroundColor,
    textAlign: style.align,
    ...(style.backgroundImage && {
      backgroundImage: `url("${style.backgroundImage}")`,
    }),
  };
}

// Turns a normal Spotify, SoundCloud or YouTube link into its player URL.
// Anything else is used as the iframe source unchanged.
export function embedSource(link: string): { src: string; height?: number } {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return { src: link };
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    return { src: `https://www.youtube.com/embed${url.pathname}` };
  }
  if (host === "youtube.com" && url.searchParams.has("v")) {
    return { src: `https://www.youtube.com/embed/${url.searchParams.get("v")}` };
  }
  if (host === "open.spotify.com" && !url.pathname.startsWith("/embed")) {
    return { src: `https://open.spotify.com/embed${url.pathname}`, height: 352 };
  }
  if (host === "soundcloud.com" || host === "api.soundcloud.com") {
    const player = new URL("https://w.soundcloud.com/player/");
    player.searchParams.set("url", link);
    player.searchParams.set("visual", "true");
    return { src: player.toString(), height: 300 };
  }
  return { src: link };
}

// "2026-04-16" becomes "April 16, 2026".
export function formatPostDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(date));
}
