"use client";
import { useState } from "react";
import { BUTTON_SIZES, type HomeButton, type Page, type Site } from "@/lib/cms/schema";
import Dialog from "./dialog";
import { Issues } from "./editor";
import {
  ColorField,
  Field,
  MoveButtons,
  RemoveButton,
  SelectField,
  TextField,
  replaceAt,
} from "./fields";
import Icon from "./icon";
import type { RecordState } from "./use-record";

// Landing buttons are nav links with a few extra, optional looks. One form
// edits both; the looks only show for buttons.
type NavLink = HomeButton;
type LinkField = "nav" | "homeButtons";

type Destination = { href: string; label: string };

// Where a link in each list can go: the site's pages plus the routes that
// exist in code. A landing page button never points back at the landing page.
function destinationsFor(field: LinkField, pages: Page[]): Destination[] {
  return [
    ...(field === "nav" ? [{ href: "/", label: "Home" }] : []),
    { href: "/sampler", label: "Sampler" },
    ...pages.map((page) => ({ href: `/${page.slug}`, label: page.title })),
  ];
}

// The form for one nav link. The destination is picked from the site's pages,
// or typed in when it's an outside URL.
function LinkDialog({
  initial,
  destinations,
  looks,
  issues,
  onSave,
  onClose,
}: {
  initial: NavLink;
  destinations: Destination[];
  // Whether to offer colors and size.
  looks: boolean;
  issues: string[];
  onSave: (link: NavLink) => void;
  onClose: () => void;
}) {
  const [link, setLink] = useState(initial);
  const known = destinations.some((destination) => destination.href === link.href);

  return (
    <Dialog title={looks ? "Edit button" : "Edit link"} onClose={onClose} small>
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
      {looks && (
        <>
          <ColorField
            label="Text color"
            value={link.textColor}
            onChange={(textColor) => setLink({ ...link, textColor })}
          />
          {link.backgroundColor !== "transparent" && (
            <ColorField
              label="Background color"
              value={link.backgroundColor}
              onChange={(backgroundColor) => setLink({ ...link, backgroundColor })}
            />
          )}
          <label className="check">
            <input
              type="checkbox"
              checked={link.backgroundColor === "transparent"}
              onChange={(event) =>
                setLink({ ...link, backgroundColor: event.target.checked ? "transparent" : undefined })
              }
            />
            Transparent background
          </label>
          <SelectField
            label="Size"
            value={link.size}
            options={BUTTON_SIZES}
            onChange={(size) => setLink({ ...link, size })}
          />
        </>
      )}
      <Issues issues={issues} />
      <div className="row">
        <button type="button" className="primary" onClick={() => onSave(link)}>
          <Icon name="diskette" />
          Save
        </button>
        <button type="button" className="dismiss" onClick={onClose}>
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
  const destinations = destinationsFor(field, pages);
  const blank: NavLink = { label: "", href: destinations[0]?.href ?? "https://" };
  const saveLinks = (next: NavLink[]) => record.save({ ...site, [field]: next });

  async function saveLink(link: NavLink) {
    if (editing === undefined) return;
    const next = editing === "new" ? [...links, link] : replaceAt(links, editing, link);
    if (await saveLinks(next)) setEditing(undefined);
  }

  return (
    <>
      {links.length > 0 && (
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
                <button type="button" className="bare" onClick={() => setEditing(i)} aria-label="Edit">
                  <Icon name="pencil" />
                </button>
                <RemoveButton items={links} index={i} onChange={saveLinks} name={link.label} />
              </span>
            </div>
          ))}
        </div>
      )}
      <p>
        <button type="button" onClick={() => setEditing("new")}>
          <Icon name="plus" />
          {field === "nav" ? "Add link" : "Add button"}
        </button>
      </p>
      {editing !== undefined && (
        <LinkDialog
          initial={editing === "new" ? blank : (links[editing] ?? blank)}
          destinations={destinations}
          looks={field === "homeButtons"}
          issues={record.state.issues}
          onSave={saveLink}
          onClose={() => setEditing(undefined)}
        />
      )}
    </>
  );
}
