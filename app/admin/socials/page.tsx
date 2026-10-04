"use client";
import { useState } from "react";
import Dialog from "@/components/admin/dialog";
import { Issues } from "@/components/admin/editor";
import { Field, MoveButtons, RemoveButton, TextField, replaceAt } from "@/components/admin/fields";
import { useRecord } from "@/components/admin/use-record";
import { DEFAULT_SITE, SOCIAL_PLATFORMS, siteSchema, type Site } from "@/lib/cms/schema";

type Social = Site["social"][number];

function SocialDialog({
  initial,
  issues,
  onSave,
  onClose,
}: {
  initial: Social;
  issues: string[];
  onSave: (social: Social) => void;
  onClose: () => void;
}) {
  const [social, setSocial] = useState(initial);

  return (
    <Dialog title="Edit social" onClose={onClose} small>
      <Field label="Platform">
        <select
          value={social.platform}
          onChange={(event) => {
            const platform = SOCIAL_PLATFORMS.find((name) => name === event.target.value);
            if (platform) setSocial({ ...social, platform });
          }}
        >
          {SOCIAL_PLATFORMS.map((platform) => (
            <option key={platform}>{platform}</option>
          ))}
        </select>
      </Field>
      <TextField label="URL" value={social.href} onChange={(href) => setSocial({ ...social, href })} />
      <Issues issues={issues} />
      <div className="row">
        <button type="button" className="primary" onClick={() => onSave(social)}>
          Save
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Dialog>
  );
}

// The social icons in the menu header, in order. Like the nav links, every
// change saves the site record at once.
export default function SocialsView() {
  const record = useRecord<Site>("/api/site", siteSchema, () => DEFAULT_SITE);
  // Index of the social being edited, or "new" while adding one.
  const [editing, setEditing] = useState<number | "new">();
  const site = record.doc;
  if (!site) return null;

  const blank: Social = { platform: "spotify", href: "https://" };
  const saveSocials = (social: Social[]) => record.save({ ...site, social });

  async function saveSocial(social: Social) {
    if (!site || editing === undefined) return;
    const next = editing === "new" ? [...site.social, social] : replaceAt(site.social, editing, social);
    if (await saveSocials(next)) setEditing(undefined);
  }

  return (
    <main className="view">
      <header className="row">
        <h1>Socials</h1>
      </header>
      <div className="nav-links">
        {site.social.map((social, i) => (
          <div key={`${social.platform}-${i}`}>
            <span className="row-controls">
              <MoveButtons items={site.social} index={i} onChange={saveSocials} />
            </span>
            <strong>{social.platform}</strong>
            <small>{social.href}</small>
            <span className="spacer" />
            <span className="row-controls">
              <button type="button" onClick={() => setEditing(i)}>
                Edit
              </button>
              <RemoveButton items={site.social} index={i} onChange={saveSocials} />
            </span>
          </div>
        ))}
      </div>
      <p>
        <button type="button" onClick={() => setEditing("new")}>
          Add social
        </button>
      </p>
      {editing !== undefined && (
        <SocialDialog
          initial={editing === "new" ? blank : (site.social[editing] ?? blank)}
          issues={record.state.issues}
          onSave={saveSocial}
          onClose={() => setEditing(undefined)}
        />
      )}
    </main>
  );
}
