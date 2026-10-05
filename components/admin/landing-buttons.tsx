"use client";
import { useState } from "react";
import {
  DEFAULT_LANDING_BUTTONS,
  type LandingButton,
  type Page,
  type Site,
} from "@/lib/cms/schema";
import Dialog from "./dialog";
import { Issues } from "./editor";
import Icon from "./icon";
import { Field, MoveButtons, RemoveButton, TextField, replaceAt } from "./fields";
import type { RecordState } from "./use-record";

type Destination = { href: string; label: string };

function ButtonDialog({
  initial,
  destinations,
  issues,
  onSave,
  onClose,
}: {
  initial: LandingButton;
  destinations: Destination[];
  issues: string[];
  onSave: (button: LandingButton) => void;
  onClose: () => void;
}) {
  const [button, setButton] = useState(initial);
  const known = button.type === "link" && destinations.some(({ href }) => href === button.href);

  return (
    <Dialog title="Edit button" onClose={onClose} small>
      <TextField
        label="Label"
        value={button.label}
        onChange={(label) => setButton({ ...button, label })}
      />
      <Field label="Action">
        <select
          value={button.type}
          onChange={(event) => {
            const type = event.target.value;
            if (type === "game" || type === "menu") {
              setButton({ type, label: button.label });
            } else if (type === "link") {
              setButton({ type, label: button.label, href: destinations[0]?.href ?? "https://" });
            }
          }}
        >
          <option value="link">Open a link</option>
          <option value="game">Start the red game</option>
          <option value="menu">Open the menu</option>
        </select>
      </Field>
      {button.type === "link" && (
        <>
          <Field label="Goes to">
            <select
              value={known ? button.href : "custom"}
              onChange={(event) => setButton({
                ...button,
                href: event.target.value === "custom" ? "https://" : event.target.value,
              })}
            >
              {destinations.map(({ href, label }) => (
                <option key={href} value={href}>{label}</option>
              ))}
              <option value="custom">Another URL...</option>
            </select>
          </Field>
          {!known && (
            <TextField
              label="URL"
              value={button.href}
              onChange={(href) => setButton({ ...button, href })}
            />
          )}
          <label className="check">
            <input
              type="checkbox"
              checked={button.newTab ?? false}
              onChange={(event) => setButton({ ...button, newTab: event.target.checked || undefined })}
            />
            Opens in new tab
          </label>
        </>
      )}
      <Issues issues={issues} />
      <div className="row">
        <button type="button" className="primary" onClick={() => onSave(button)}>
          <Icon name="diskette" />
          Save
        </button>
        <button type="button" className="dismiss" onClick={onClose}>Cancel</button>
      </div>
    </Dialog>
  );
}

// The simple landing's ordered actions. Painting buttons are stored separately.
export default function LandingButtons({
  record,
  pages,
}: {
  record: RecordState<Site>;
  pages: Page[];
}) {
  const [editing, setEditing] = useState<number | "new">();
  const site = record.doc;
  if (!site) return null;

  const buttons = site.landingButtons ?? DEFAULT_LANDING_BUTTONS;
  const destinations = [
    { href: "/sampler", label: "Sampler" },
    ...pages.map((page) => ({ href: `/${page.slug}`, label: page.title })),
  ];
  const blank: LandingButton = { type: "link", label: "", href: destinations[0]?.href ?? "https://" };
  const saveButtons = (landingButtons: LandingButton[]) => record.save({ ...site, landingButtons });

  async function saveButton(button: LandingButton) {
    if (editing === undefined || record.state.saving) return;
    const next = editing === "new" ? [...buttons, button] : replaceAt(buttons, editing, button);
    if (await saveButtons(next)) setEditing(undefined);
  }

  return (
    <fieldset disabled={record.state.saving}>
      <legend>Buttons</legend>
      {buttons.length > 0 && (
        <div className="nav-links">
          {buttons.map((button, i) => (
            <div key={`${button.label}-${i}`}>
              <span className="row-controls">
                <MoveButtons items={buttons} index={i} onChange={saveButtons} />
              </span>
              <strong>{button.label}</strong>
              <small>{button.type === "link" ? button.href : button.type === "game" ? "Start the red game" : "Open the menu"}</small>
              <span className="spacer" />
              <span className="row-controls">
                <button type="button" className="bare" onClick={() => setEditing(i)} aria-label="Edit">
                  <Icon name="pencil" />
                </button>
                <RemoveButton items={buttons} index={i} onChange={saveButtons} name={button.label} />
              </span>
            </div>
          ))}
        </div>
      )}
      <p>
        <button type="button" onClick={() => setEditing("new")}>
          <Icon name="plus" />
          Add button
        </button>
      </p>
      {editing !== undefined && (
        <ButtonDialog
          initial={editing === "new" ? blank : (buttons[editing] ?? blank)}
          destinations={destinations}
          issues={record.state.issues}
          onSave={saveButton}
          onClose={() => {
            if (!record.state.saving) setEditing(undefined);
          }}
        />
      )}
    </fieldset>
  );
}
