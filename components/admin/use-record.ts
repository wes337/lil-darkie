"use client";
import { useEffect, useReducer, useRef, useState } from "react";
import type { z } from "zod";
import { describeIssues } from "@/lib/cms/schema";
import { editorReducer, emptyEditor, hasChanges } from "@/lib/cms/editor-state";
import { useUnsavedChanges } from "./use-unsaved-changes";

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

// Editing state for one record behind an API path. Loads it (or starts from
// `blank` when it doesn't exist yet), validates against the schema before
// saving, and reports API errors as a list of readable problems.
export function useRecord<T>(path: string, schema: z.ZodType<T>, blank: () => T) {
  const [state, dispatch] = useReducer(editorReducer<T>, undefined, emptyEditor<T>);
  const inFlight = useRef(false);
  const dirty = hasChanges(state);
  useUnsavedChanges(dirty || state.saving);

  useEffect(() => {
    let active = true;
    fetch(path).then(async (response) => {
      if (!response.ok && response.status !== 404) throw new Error("Load failed");
      const doc: T = response.ok ? await response.json() : blank();
      if (active) dispatch({ type: "load", doc, exists: response.ok });
    }).catch(() => {
      if (active) dispatch({ type: "error", issues: ["Couldn't load this record. Reload the page to try again."] });
    });
    return () => { active = false; };
    // `blank` only matters for the first load of a path.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  // Saves the edited record, or `next` when a change should go live at once.
  // Resolves to whether the save went through.
  async function save(next: T | undefined = state.doc): Promise<boolean> {
    if (inFlight.current || next === undefined) return false;
    const parsed = schema.safeParse(next);
    if (!parsed.success) {
      dispatch({ type: "error", issues: describeIssues(parsed.error) });
      return false;
    }
    inFlight.current = true;
    dispatch({ type: "saving" });
    try {
      const response = await fetch(path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (response.ok) {
        dispatch({ type: "saved", submitted: state.doc, doc: parsed.data });
        return true;
      }
      const body = await response.json().catch(() => ({}));
      dispatch({ type: "error", issues: body.issues ?? [body.error ?? `Save failed (${response.status}). Try Save again.`] });
    } catch {
      dispatch({ type: "error", issues: ["Couldn't save. Your edits are still here. Check your connection and try Save again."] });
    } finally {
      inFlight.current = false;
    }
    return false;
  }

  return {
    path,
    schema,
    doc: state.doc,
    exists: state.exists,
    dirty,
    state,
    save,
    // Any edit clears the "Saved" note.
    setDoc(next: T) {
      dispatch({ type: "edit", doc: next });
    },
  };
}

export type RecordState<T> = ReturnType<typeof useRecord<T>>;
