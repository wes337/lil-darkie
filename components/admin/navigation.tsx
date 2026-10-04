"use client";
import { useState } from "react";
import type { Page, Site } from "@/lib/cms/schema";
import Dialog from "./dialog";
import { Issues } from "./editor";
import { Field, MoveButtons, RemoveButton, TextField, replaceAt } from "./fields";
import type { RecordState } from "./use-record";

type NavLink = Site["nav"][number];
type LinkField = "nav" | "homeButtons";

// Routes that exist in code, offered next to the CMS pages when picking where
// a nav link goes.
const BUILT_IN = [
  { href: "/", label: "Home (the game)" },
  { href: "/sampler", label: "Sampler" },
];

// The form for one nav link. The destination is picked from the site's pages,
// or typed in when it's an outside URL.
function LinkDialog({
  initial,
  pages,
  issues,
  onSave,
  onClose,
}: {
  initial: NavLink;
  pages: Page[];
  issues: string[];
  onSave: (link: NavLink) => void;
  onClose: () => void;
}) {
  const [link, setLink] = useState(initial);
  const destinations = [
    ...BUILT_IN,
    ...pages.map((page) => ({ href: `/${page.slug}`, label: page.title })),
  ];
  const known = destinations.some((destination) => destination.href === link.href);

  return (
    <Dialog title="Edit link" onClose={onClose} small>
      <TextField label="Label" value={link.label} onChange={(label) => setLink({ ...link, label })} />
      <Field label="Goes to">
        <select
          value={known ? link.href : "custom"}
          onChange={(event) =>
            setLink({ ...link, href: event.target.value === "custom" ? "https://" : event.target.value })
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
      {!known && <TextField label="URL" value={link.href} onChange={(href) => setLink({ ...link, href })} />}
      <Issues issues={issues} />
      <div className="row">
        <button type="button" className="primary" onClick={() => onSave(link)}>
          Save
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Dialog>
  );
}

// One of the site's ordered link lists: the menu (`nav`) or the home page
// buttons. Every change here (add, edit, reorder, remove) saves the site
// record and is live at once.
export default function LinkList({
  record,
  field,
  pages,
}: {
  record: RecordState<Site>;
  field: LinkField;
  pages: Page[];
}) {
  // Index of the link being edited, or "new" while adding one.
  const [editing, setEditing] = useState<number | "new">();
  const site = record.doc;
  if (!site) return null;

  const links: NavLink[] = site[field] ?? [];
  const saveLinks = (next: NavLink[]) => record.save({ ...site, [field]: next });

  async function saveLink(link: NavLink) {
    if (editing === undefined) return;
    const next = editing === "new" ? [...links, link] : replaceAt(links, editing, link);
    if (await saveLinks(next)) setEditing(undefined);
  }

  return (
    <>
      <div className="nav-links">
        {links.map((link, i) => (
          <div key={`${link.label}-${i}`}>
            <span className="row-controls">
              <MoveButtons items={links} index={i} onChange={saveLinks} />
            </span>
            <strong>{link.label}</strong>
            <small>{link.href}</small>
            <span className="spacer" />
            <span className="row-controls">
              <button type="button" onClick={() => setEditing(i)}>
                Edit
              </button>
              <RemoveButton items={links} index={i} onChange={saveLinks} />
            </span>
          </div>
        ))}
      </div>
      <p>
        <button type="button" onClick={() => setEditing("new")}>
          {field === "nav" ? "Add link" : "Add button"}
        </button>
      </p>
      {editing !== undefined && (
        <LinkDialog
          initial={editing === "new" ? { label: "", href: "/" } : (links[editing] ?? { label: "", href: "/" })}
          pages={pages}
          issues={record.state.issues}
          onSave={saveLink}
          onClose={() => setEditing(undefined)}
        />
      )}
    </>
  );
}
