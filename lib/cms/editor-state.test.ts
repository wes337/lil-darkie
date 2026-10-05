import assert from "node:assert/strict";
import test from "node:test";
import { editorReducer, emptyEditor, hasChanges } from "./editor-state.ts";

const original = { title: "Comics", blocks: [{ text: "Original heading" }] };
const edited = { ...original, blocks: [{ text: "Edited heading" }] };
const loaded = () => editorReducer(emptyEditor<typeof original>(), { type: "load", doc: original, exists: true });

test("nested edits are dirty, but restoring the saved values clears the warning", () => {
  assert.equal(hasChanges(emptyEditor()), false);
  assert.equal(hasChanges(loaded()), false);
  const changed = editorReducer(loaded(), { type: "edit", doc: edited });
  assert.equal(hasChanges(changed), true);
  const restored = editorReducer(changed, { type: "edit", doc: structuredClone(original) });
  assert.equal(hasChanges(restored), false);
});

test("successful save clears dirty state and becomes the next baseline", () => {
  const changed = editorReducer(loaded(), { type: "edit", doc: edited });
  const saving = editorReducer(changed, { type: "saving" });
  const saved = editorReducer(saving, { type: "saved", submitted: edited, doc: structuredClone(edited) });
  assert.equal(hasChanges(saved), false);
  assert.equal(saved.saved, true);
  assert.equal(saved.saving, false);
  assert.equal(hasChanges(editorReducer(saved, { type: "edit", doc: original })), true);
});

test("an edit during a slow save stays in the form and remains unsaved", () => {
  const changing = editorReducer(loaded(), { type: "edit", doc: edited });
  const saving = editorReducer(changing, { type: "saving" });
  const newer = { ...edited, title: "New title" };
  const stillEditing = editorReducer(saving, { type: "edit", doc: newer });
  const saved = editorReducer(stillEditing, { type: "saved", submitted: edited, doc: structuredClone(edited) });
  assert.equal(saved.doc, newer);
  assert.equal(hasChanges(saved), true);
  assert.equal(saved.saved, false);
  assert.equal(saved.saving, false);
});

test("reverting during a save still warns when the server now has different values", () => {
  const saving = editorReducer(editorReducer(loaded(), { type: "edit", doc: edited }), { type: "saving" });
  const reverted = editorReducer(saving, { type: "edit", doc: original });
  const saved = editorReducer(reverted, { type: "saved", submitted: edited, doc: edited });
  assert.equal(saved.doc, original);
  assert.equal(hasChanges(saved), true);
});

test("a failed save keeps edits and permits retry", () => {
  const saving = editorReducer(editorReducer(loaded(), { type: "edit", doc: edited }), { type: "saving" });
  const failed = editorReducer(saving, { type: "error", issues: ["Connection lost"] });
  assert.equal(failed.doc, edited);
  assert.equal(hasChanges(failed), true);
  assert.equal(failed.saving, false);
  assert.equal(failed.saved, false);
  const retry = editorReducer(failed, { type: "saving" });
  assert.deepEqual(retry.issues, []);
  assert.equal(editorReducer(retry, { type: "saved", submitted: edited, doc: edited }).saved, true);
});

test("immediate-save dialogs only insert a new item after success, so retry cannot duplicate it", () => {
  const saving = editorReducer(loaded(), { type: "saving" });
  const failed = editorReducer(saving, { type: "error", issues: ["Connection lost"] });
  assert.equal(failed.doc, original);
  const saved = editorReducer(failed, { type: "saved", submitted: original, doc: edited });
  assert.equal(saved.doc, edited);
  assert.equal(hasChanges(saved), false);
});
