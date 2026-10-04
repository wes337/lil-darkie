"use client";
import { useState, type ReactNode } from "react";
import { MediaDialog, isImage } from "./media";

// Form inputs for the editors. Optional values use `undefined` for "not set",
// so clearing an input removes the field from the saved record.

const orUndefined = (value: string) => (value === "" ? undefined : value);

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  rows,
  placeholder,
  list,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  // Set for a multi-line box.
  rows?: number;
  placeholder?: string;
  // Id of a datalist with suggestions.
  list?: string;
}) {
  return (
    <Field label={label}>
      {rows ? (
        <textarea
          rows={rows}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          type="text"
          value={value ?? ""}
          placeholder={placeholder}
          list={list}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </Field>
  );
}

export function OptionalTextField(
  props: Omit<Parameters<typeof TextField>[0], "onChange"> & {
    onChange: (value: string | undefined) => void;
  },
) {
  return <TextField {...props} onChange={(value) => props.onChange(orUndefined(value))} />;
}

export function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string | undefined;
  // The color in use while nothing is set. Shown in the swatch and as the
  // placeholder.
  fallback?: string;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <Field label={label}>
      <span className="row">
        <input
          type="color"
          value={(value ?? fallback)?.slice(0, 7) ?? "#000000"}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          type="text"
          value={value ?? ""}
          placeholder={fallback ?? "default"}
          onChange={(event) => onChange(orUndefined(event.target.value))}
        />
      </span>
    </Field>
  );
}

// A dropdown whose first entry clears the value.
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | undefined;
  options: readonly T[];
  onChange: (value: T | undefined) => void;
}) {
  return (
    <Field label={label}>
      <select
        value={value ?? ""}
        onChange={(event) =>
          onChange(options.find((option) => option === event.target.value))
        }
      >
        <option value="">default</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </Field>
  );
}

// A URL box with a button that opens the media library to pick or upload.
export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const [picking, setPicking] = useState(false);
  return (
    <>
      <Field label={label}>
        <span className="row">
          {value && isImage(value) && <img className="thumb" src={value} alt="" />}
          <input
            type="text"
            value={value ?? ""}
            onChange={(event) => onChange(orUndefined(event.target.value))}
          />
          <button type="button" onClick={() => setPicking(true)}>
            Choose
          </button>
        </span>
      </Field>
      {/* Outside the label so clicks in the dialog don't focus the input. */}
      {picking && (
        <MediaDialog
          onClose={() => setPicking(false)}
          onPick={(url) => {
            onChange(url);
            setPicking(false);
          }}
        />
      )}
    </>
  );
}

type RowProps<T> = { items: T[]; index: number; onChange: (items: T[]) => void };

// Up and down buttons for one row of an ordered list.
export function MoveButtons<T>({ items, index, onChange }: RowProps<T>) {
  const move = (to: number) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    if (item !== undefined) next.splice(to, 0, item);
    onChange(next);
  };
  return (
    <>
      <button type="button" disabled={index === 0} onClick={() => move(index - 1)} aria-label="Move up">
        ↑
      </button>
      <button
        type="button"
        disabled={index === items.length - 1}
        onClick={() => move(index + 1)}
        aria-label="Move down"
      >
        ↓
      </button>
    </>
  );
}

export function RemoveButton<T>({ items, index, onChange }: RowProps<T>) {
  return (
    <button
      type="button"
      onClick={() => onChange(items.filter((_, i) => i !== index))}
      aria-label="Remove"
    >
      ✕
    </button>
  );
}

// Up, down and remove buttons together.
export function RowControls<T>(props: RowProps<T>) {
  return (
    <span className="row-controls">
      <MoveButtons {...props} />
      <RemoveButton {...props} />
    </span>
  );
}

// Replaces one item of a list, for `onChange` handlers.
export function replaceAt<T>(items: T[], index: number, item: T): T[] {
  return items.map((current, i) => (i === index ? item : current));
}
