export type EditorState<T> = {
  doc: T | undefined;
  baseline: string | undefined;
  exists: boolean;
  saving: boolean;
  saved: boolean;
  issues: string[];
};

type Action<T> =
  | { type: "load"; doc: T; exists: boolean }
  | { type: "edit"; doc: T }
  | { type: "saving" }
  | { type: "saved"; submitted: T | undefined; doc: T }
  | { type: "error"; issues: string[] };

export function emptyEditor<T>(): EditorState<T> {
  return { doc: undefined, baseline: undefined, exists: false, saving: false, saved: false, issues: [] };
}

export function hasChanges<T>(state: EditorState<T>): boolean {
  return JSON.stringify(state.doc) !== state.baseline;
}

// A completed save updates the baseline, but must not replace newer edits.
export function editorReducer<T>(state: EditorState<T>, action: Action<T>): EditorState<T> {
  switch (action.type) {
    case "load":
      return { ...emptyEditor<T>(), doc: action.doc, baseline: JSON.stringify(action.doc), exists: action.exists };
    case "edit":
      return { ...state, doc: action.doc, saved: false };
    case "saving":
      return { ...state, saving: true, saved: false, issues: [] };
    case "saved": {
      const doc = state.doc === action.submitted ? action.doc : state.doc;
      const baseline = JSON.stringify(action.doc);
      return { ...state, doc, baseline, exists: true, saving: false, saved: JSON.stringify(doc) === baseline, issues: [] };
    }
    case "error":
      return { ...state, saving: false, saved: false, issues: action.issues };
  }
}
