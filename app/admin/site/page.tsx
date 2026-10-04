"use client";
import { ThemeFields } from "@/components/admin/block-editor";
import Editor from "@/components/admin/editor";
import { Field, RowControls, SelectField, TextField, replaceAt } from "@/components/admin/fields";
import { useFetched, useRecord } from "@/components/admin/use-record";
import { PageShell } from "@/components/cms/page-view";
import {
  DEFAULT_SITE,
  SOCIAL_PLATFORMS,
  TOP_BAR_ICONS,
  siteSchema,
  type Page,
  type Site,
} from "@/lib/cms/schema";

type NavLink = Site["nav"][number];

// Routes that exist in code, offered next to the CMS pages when picking where
// a nav link goes.
const BUILT_IN = [
  { href: "/", label: "Home (the game)" },
  { href: "/sampler", label: "Sampler" },
];

// One nav link. The destination is picked from the site's pages, or typed in
// when it's an outside URL.
function NavRow({
  link,
  destinations,
  onChange,
}: {
  link: NavLink;
  destinations: { href: string; label: string }[];
  onChange: (link: NavLink) => void;
}) {
  const known = destinations.some((destination) => destination.href === link.href);

  return (
    <>
      <TextField label="Label" value={link.label} onChange={(label) => onChange({ ...link, label })} />
      <Field label="Goes to">
        <select
          value={known ? link.href : "custom"}
          onChange={(event) =>
            onChange({ ...link, href: event.target.value === "custom" ? "https://" : event.target.value })
          }
        >
          {destinations.map((destination) => (
            <option key={destination.href} value={destination.href}>
              {destination.label}
            </option>
          ))}
          <option value="custom">Another website...</option>
        </select>
      </Field>
      {!known && <TextField label="URL" value={link.href} onChange={(href) => onChange({ ...link, href })} />}
      <label className="check">
        <input
          type="checkbox"
          checked={link.topBar ?? false}
          onChange={(event) => onChange({ ...link, topBar: event.target.checked })}
        />
        Also show in the top bar (up to 3)
      </label>
      {link.topBar && (
        <SelectField
          label="Top bar icon"
          value={link.icon}
          options={TOP_BAR_ICONS}
          onChange={(icon) => onChange({ ...link, icon })}
        />
      )}
    </>
  );
}

export default function SiteEditor() {
  const record = useRecord<Site>("/api/site", siteSchema, () => DEFAULT_SITE);
  const pages = useFetched<Page[]>("/api/pages") ?? [];
  const site = record.doc;
  if (!site) return <p>Loading...</p>;

  const destinations = [
    ...BUILT_IN,
    ...pages.map((page) => ({ href: `/${page.slug}`, label: page.title })),
  ];
  const set = (changes: Partial<Site>) => record.setDoc({ ...site, ...changes });

  return (
    <Editor
      title="Menu and site settings"
      record={record}
      form={
        <>
          <h2>Menu links</h2>
          {site.nav.map((link, i) => (
            <fieldset key={i}>
              <legend>
                {link.label || "Link"}
                <RowControls items={site.nav} index={i} onChange={(nav) => set({ nav })} />
              </legend>
              <NavRow
                link={link}
                destinations={destinations}
                onChange={(next) => set({ nav: replaceAt(site.nav, i, next) })}
              />
            </fieldset>
          ))}
          <button type="button" onClick={() => set({ nav: [...site.nav, { label: "New link", href: "/" }] })}>
            Add link
          </button>

          <h2>Social links</h2>
          {site.social.map((social, i) => (
            <fieldset key={i}>
              <legend>
                {social.platform}
                <RowControls items={site.social} index={i} onChange={(next) => set({ social: next })} />
              </legend>
              <Field label="Platform">
                <select
                  value={social.platform}
                  onChange={(event) =>
                    set({
                      social: replaceAt(site.social, i, {
                        ...social,
                        platform: event.target.value as typeof social.platform,
                      }),
                    })
                  }
                >
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <option key={platform}>{platform}</option>
                  ))}
                </select>
              </Field>
              <TextField
                label="URL"
                value={social.href}
                onChange={(href) => set({ social: replaceAt(site.social, i, { ...social, href }) })}
              />
            </fieldset>
          ))}
          <button
            type="button"
            onClick={() => set({ social: [...site.social, { platform: "spotify", href: "https://" }] })}
          >
            Add social link
          </button>

          <h2>Everything else</h2>
          <TextField label="Copyright line" value={site.copyright} onChange={(copyright) => set({ copyright })} />
          <p>Pages use this theme unless they set their own.</p>
          <ThemeFields theme={site.theme} onChange={(theme) => set({ theme })} />
        </>
      }
      preview={
        <PageShell site={site}>
          <ul className="nav-preview">
            {site.nav.map((link, i) => (
              <li key={i}>
                {link.label} → {link.href}
                {link.topBar && " (top bar)"}
              </li>
            ))}
          </ul>
        </PageShell>
      }
    />
  );
}
