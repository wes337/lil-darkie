"use client";
import { useEffect, useState } from "react";
import type { z } from "zod";
import { describeIssues } from "@/lib/cms/schema";

// Loads a JSON resource once. Undefined until it arrives.
export function useFetched<T>(path: string): T | undefined {
  const [data, setData] = useState<T>();
  useEffect(() => {
    fetch(path)
      .then((response) => (response.ok ? response.json() : undefined))
      .then(setData);
  }, [path]);
  return data;
}

export type SaveState = { saving: boolean; saved: boolean; issues: string[] };

// Editing state for one record behind an API path. Loads it (or starts from
// `blank` when it doesn't exist yet), validates against the schema before
// saving, and reports API errors as a list of readable problems.
export function useRecord<T>(path: string, schema: z.ZodType<T>, blank: () => T) {
  const [doc, setDoc] = useState<T>();
  const [exists, setExists] = useState(false);
  const [state, setState] = useState<SaveState>({ saving: false, saved: false, issues: [] });

  useEffect(() => {
    fetch(path).then(async (response) => {
      setExists(response.ok);
      setDoc(response.ok ? await response.json() : blank());
    });
    // `blank` only matters for the first load of a path.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  // Saves the edited record, or `next` when a change should go live at once.
  // Resolves to whether the save went through.
  async function save(next: T | undefined = doc): Promise<boolean> {
    const parsed = schema.safeParse(next);
    if (!parsed.success) {
      setState({ saving: false, saved: false, issues: describeIssues(parsed.error) });
      return false;
    }
    setState({ saving: true, saved: false, issues: [] });
    const response = await fetch(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (response.ok) {
      setExists(true);
      setDoc(parsed.data);
      setState({ saving: false, saved: true, issues: [] });
      return true;
    }
    const body = await response.json().catch(() => ({}));
    setState({
      saving: false,
      saved: false,
      issues: body.issues ?? [body.error ?? `Save failed (${response.status})`],
    });
    return false;
  }

  return {
    path,
    schema,
    doc,
    exists,
    state,
    save,
    // Any edit clears the "Saved" note.
    setDoc(next: T) {
      setDoc(next);
      setState((current) => ({ ...current, saved: false }));
    },
  };
}

export type RecordState<T> = ReturnType<typeof useRecord<T>>;
