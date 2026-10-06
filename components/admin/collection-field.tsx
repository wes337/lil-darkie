"use client";
import { useState } from "react";
import type { Post } from "@/lib/cms/schema";
import { slugify } from "./create";
import Dialog from "./dialog";
import { Field, TextField } from "./fields";
import { useFetched } from "./use-record";

const NEW = "__new__";

// Picks a post collection. Collections aren't stored anywhere of their own:
// one exists as soon as a post uses it. So the dropdown lists the collections
// of existing posts, and its last entry opens a dialog to name a new one.
export default function CollectionField({
  value,
  onChange,
}: {
  value: string;
  onChange: (collection: string) => void;
}) {
  const posts = useFetched<Post[]>("/api/posts") ?? [];
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");
  // The current value is listed even before any saved post uses it.
  const collections = [...new Set([...posts.map((post) => post.collection), value])]
    .filter(Boolean)
    .sort();

  function create() {
    const collection = slugify(name);
    if (!collection) return;
    onChange(collection);
    setNaming(false);
    setName("");
  }

  return (
    <>
      <Field label="Collection">
        <select
          value={value}
          onChange={(event) =>
            event.target.value === NEW ? setNaming(true) : onChange(event.target.value)
          }
        >
          {collections.map((collection) => (
            <option key={collection}>{collection}</option>
          ))}
          <option value={NEW}>New collection...</option>
        </select>
      </Field>
      {naming && (
        <Dialog title="New collection" onClose={() => setNaming(false)} small>
          <TextField label="Name" value={name} onChange={setName} />
          <div className="row">
            <button type="button" className="primary" onClick={create}>
              Create
            </button>
            <button type="button" className="dismiss" onClick={() => setNaming(false)}>
              Cancel
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
