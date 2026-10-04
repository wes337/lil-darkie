import { z } from "zod";

// The one schema for everything the admin can edit. The API validates saves
// against it, the editor gets its types from it, and /api/schema publishes it.

export const FONTS = {
  "martian-mono": '"Martian Mono", monospace',
  "sf-fedora": '"SF Fedora", sans-serif',
  "sf-fedora-titles": '"SF Fedora Titles Italic", sans-serif',
  "simple-letter": '"Simple Letter", sans-serif',
} as const;

export const TOP_BAR_ICONS = ["gun", "skull", "grave", "knife"] as const;
export const SOCIAL_PLATFORMS = ["spotify", "apple", "soundcloud", "youtube"] as const;

// Routes owned by code or by Next.js. A page can't take these slugs.
export const RESERVED_SLUGS = [
  "admin",
  "api",
  "posts",
  "sampler",
  "images",
  "sounds",
  "fonts",
  "red-game",
];

const slug = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes")
  .max(80);

const color = z
  .string()
  .regex(/^#([0-9a-f]{6}|[0-9a-f]{8})$/i, "Use a hex color like #e00910");

const url = z
  .string()
  .regex(/^(\/|https?:\/\/|mailto:)/, "Use a site path like /comics or a full URL");

const font = z.enum(Object.keys(FONTS) as [keyof typeof FONTS]);

// Optional overrides every block accepts.
const blockStyle = z.strictObject({
  textColor: color.optional(),
  backgroundColor: color.optional(),
  backgroundImage: url.optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  width: z.enum(["narrow", "full"]).optional(),
});

const base = { id: z.string().min(1), style: blockStyle.optional() };

export const blockSchema = z.discriminatedUnion("type", [
  z.strictObject({
    ...base,
    type: z.literal("heading"),
    text: z.string(),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    font: font.optional(),
  }),
  z.strictObject({ ...base, type: z.literal("text"), markdown: z.string() }),
  z.strictObject({
    ...base,
    type: z.literal("image"),
    src: url,
    alt: z.string().optional(),
    caption: z.string().optional(),
    href: url.optional(),
  }),
  z.strictObject({ ...base, type: z.literal("slideshow"), images: z.array(url) }),
  // A Spotify, SoundCloud or YouTube link. The site turns it into a player.
  z.strictObject({
    ...base,
    type: z.literal("embed"),
    url: z.url(),
    height: z.number().int().min(80).max(1200).optional(),
  }),
  z.strictObject({
    ...base,
    type: z.literal("button"),
    label: z.string().min(1),
    href: url,
  }),
  z.strictObject({
    ...base,
    type: z.literal("spacer"),
    size: z.enum(["sm", "md", "lg"]),
  }),
  // A feed of published posts from one collection, newest first.
  z.strictObject({
    ...base,
    type: z.literal("posts"),
    collection: slug,
    limit: z.number().int().min(1).optional(),
  }),
  z.strictObject({ ...base, type: z.literal("html"), html: z.string() }),
]);

const themeSchema = z.strictObject({
  backgroundColor: color.optional(),
  backgroundImage: url.optional(),
  // Which part of the background image stays visible when it's cropped.
  backgroundFocus: z.enum(["center", "top", "bottom", "left", "right"]).optional(),
  textColor: color.optional(),
  accentColor: color.optional(),
  font: font.optional(),
});

export const pageSchema = z.strictObject({
  slug: slug.refine((value) => !RESERVED_SLUGS.includes(value), "This slug is reserved"),
  title: z.string().min(1),
  theme: themeSchema,
  blocks: z.array(blockSchema),
});

export const postSchema = z.strictObject({
  slug,
  title: z.string().optional(),
  date: z.iso.date(),
  collection: slug,
  body: z.string(),
  published: z.boolean(),
});

const navLink = z.strictObject({
  label: z.string().min(1),
  href: url,
  topBar: z.boolean().optional(),
  icon: z.enum(TOP_BAR_ICONS).optional(),
});

export const siteSchema = z.strictObject({
  nav: z
    .array(navLink)
    .refine(
      (links) => links.filter((link) => link.topBar).length <= 3,
      "At most 3 links fit in the top bar",
    ),
  // Extra buttons on the landing page, under "Play the Game".
  homeButtons: z
    .array(z.strictObject({ label: z.string().min(1), href: url }))
    .optional(),
  social: z.array(
    z.strictObject({ platform: z.enum(SOCIAL_PLATFORMS), href: z.url() }),
  ),
  copyright: z.string(),
  // Defaults that every page inherits unless its own theme overrides them.
  theme: themeSchema,
});

export type Block = z.infer<typeof blockSchema>;
export type BlockStyle = z.infer<typeof blockStyle>;
export type Theme = z.infer<typeof themeSchema>;
export type Page = z.infer<typeof pageSchema>;
export type Post = z.infer<typeof postSchema>;
export type Site = z.infer<typeof siteSchema>;

export const SCHEMAS = { site: siteSchema, page: pageSchema, post: postSchema };
export type Kind = keyof typeof SCHEMAS;
export type Doc<K extends Kind> = z.infer<(typeof SCHEMAS)[K]>;

// Used until the first save of the site record.
export const DEFAULT_SITE: Site = {
  nav: [],
  social: [],
  copyright: "Copyright © 2026 Lil Darkie® All Rights Reserved",
  theme: {},
};

// Turns a zod failure into one readable line per problem, for API errors and
// the editor.
export function describeIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}
