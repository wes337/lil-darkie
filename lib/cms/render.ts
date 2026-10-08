import type { CSSProperties } from "react";
import {
  FONTS,
  type BlockStyle,
  type Show,
  type Site,
  type Slide,
  type Theme,
  type UploadedFont,
} from "./schema.ts";

// Pure helpers shared by the public pages and the editor preview.

// What a page looks like when neither it nor the site theme says otherwise.
export const BASE_THEME = {
  backgroundColor: "#0a0a0a",
  backgroundFocus: "center",
  panelColor: "#181818",
  textColor: "#e4e4e7",
  headingColor: "#e4e4e7",
  linkColor: "#ff1010",
  linkHoverColor: "#ff6b6b",
  buttonColor: "#1c1c1c",
  buttonTextColor: "#ff1010",
  font: "martian-mono",
} satisfies Theme;

const BUILT_IN_FONTS = new Map<string, string>(Object.entries(FONTS));

// The CSS font stack for a font setting: a built-in key or the name of an
// uploaded font.
export function fontFamily(font: string): string {
  return BUILT_IN_FONTS.get(font) ?? `"${font}", sans-serif`;
}

// The @font-face rules that load the site's uploaded fonts. The schema keeps
// names and URLs free of anything that could break out of the CSS.
export function fontFaces(fonts: UploadedFont[] = []): string {
  return fonts
    .map(
      ({ name, url }) =>
        `@font-face{font-family:"${name}";src:url("${url}");font-display:swap}`,
    )
    .join("");
}

// Page theme over site theme over the built-in defaults. Unset and empty
// values fall through to the layer below.
export function resolveTheme(...layers: Theme[]): Theme & typeof BASE_THEME {
  const merged: Theme & typeof BASE_THEME = { ...BASE_THEME };
  for (const layer of layers) {
    for (const [key, value] of Object.entries(layer)) {
      if (value !== undefined && value !== "") Object.assign(merged, { [key]: value });
    }
  }
  return merged;
}

// The resolved theme as CSS variables for the page wrapper. Colors nobody
// set are left out so the stylesheet's own defaults apply, such as the
// panel's gradient and headings following the text color.
export function themeStyle(site: Site, theme: Theme = {}): CSSProperties {
  const merged = resolveTheme(site.theme, theme);
  const chosen = { ...site.theme, ...theme };
  const optional = (name: string, value: string | undefined) =>
    value ? { [name]: value } : {};

  return {
    "--cms-bg": merged.backgroundColor,
    "--cms-text": merged.textColor,
    "--cms-link": merged.linkColor,
    "--cms-link-hover": merged.linkHoverColor,
    "--cms-font": fontFamily(merged.font),
    ...optional(
      "--cms-panel-image",
      chosen.panelColor && `linear-gradient(${chosen.panelColor}, ${chosen.panelColor})`,
    ),
    ...optional("--cms-heading", chosen.headingColor),
    ...optional("--cms-button-bg", chosen.buttonColor),
    ...optional("--cms-button-text", chosen.buttonTextColor),
    ...(merged.backgroundImage && {
      backgroundImage: `url("${merged.backgroundImage}")`,
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

// A slideshow image in one shape, whichever way it was saved.
export function slideParts(slide: Slide): { src: string; caption?: string } {
  return typeof slide === "string" ? { src: slide } : slide;
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

const DAY_MS = 24 * 60 * 60 * 1000;

// The shows still worth listing, soonest first. Dates have no time zone, so
// a show stays up until two days after its date starts in UTC. That keeps an
// evening show on the US west coast listed until it's over.
export function upcomingShows(shows: Show[], now = Date.now()): Show[] {
  return shows
    .filter((show) => new Date(show.date).getTime() + 2 * DAY_MS > now)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// "2026-10-17" becomes "Sat, Oct 17, 2026".
export function formatShowDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

// Post times are shown in the artist's time zone wherever the page renders.
const POST_TIME_ZONE = "America/Los_Angeles";

// "2026-04-16T22:12:00Z" becomes "04/16/26 @ 3:12 p.m.". A post that only
// has a day ("2026-04-16") becomes "04/16/26".
export function formatPosted(date: string): string {
  const dayOnly = !date.includes("T");
  const parts = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: dayOnly ? "UTC" : POST_TIME_ZONE,
      ...options,
    }).formatToParts(new Date(date));
  const day = parts({ month: "2-digit", day: "2-digit", year: "2-digit" })
    .map(({ value }) => value)
    .join("");
  if (dayOnly) return day;

  const time = parts({ hour: "numeric", minute: "2-digit", hour12: true })
    .map(({ type, value }) =>
      type === "dayPeriod" ? (value === "AM" ? "a.m." : "p.m.") : value,
    )
    .join("");
  return `${day} @ ${time}`;
}

// The FatCow icon for a file, by its extension. Anything unknown is a plain
// page, like a server's directory listing.
const FILE_ICONS: Record<string, string> = {
  zip: "page_white_zip",
  rar: "page_white_zip",
  "7z": "page_white_zip",
  gz: "page_white_zip",
  tar: "page_white_zip",
  pdf: "page_white_acrobat",
  png: "page_white_picture",
  jpg: "page_white_picture",
  jpeg: "page_white_picture",
  gif: "page_white_picture",
  webp: "page_white_picture",
  svg: "page_white_picture",
  avif: "page_white_picture",
  mp3: "music",
  wav: "music",
  flac: "music",
  m4a: "music",
  aiff: "music",
  ogg: "music",
  mp4: "film",
  mov: "film",
  webm: "film",
  mkv: "film",
  txt: "page_white_text",
  md: "page_white_text",
  doc: "page_white_word",
  docx: "page_white_word",
  xls: "page_white_excel",
  xlsx: "page_white_excel",
  csv: "page_white_excel",
  ppt: "page_white_powerpoint",
  pptx: "page_white_powerpoint",
};

// "red (the album).zip" picks the zip icon. Looks at the label first, then
// the URL, so a link listed under a plain name still gets its file's icon.
export function fileIcon(label: string, url: string): string {
  for (const name of [label, url]) {
    const extension = /\.([a-z0-9]+)$/i.exec(name)?.[1]?.toLowerCase();
    const icon = extension && FILE_ICONS[extension];
    if (icon) return icon;
  }
  return "page_white";
}

// "2026-10-08T21:50:00Z" becomes "2026-10-08 14:50", in the artist's time
// zone, the way a server's directory listing writes it.
export function formatModified(date: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: POST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(date));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")}`;
}

// Bytes as "485 MB", "3.2 MB" or "900 KB". Under a kilobyte it's the bytes.
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"] as const;
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value < 10 ? value.toFixed(1).replace(/\.0$/, "") : Math.round(value)} ${units[unit]}`;
}
