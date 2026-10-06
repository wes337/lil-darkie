import React, { useReducer, createContext, type ReactNode } from "react";
import { config, type Sequence, type Track } from "../constants/config";

type NotePosition = { trackID: number; stepID: number };

type Action =
  | { type: "SET_ON_NOTES"; trackID: number; value: number[] }
  | { type: "CLEAR_NOTES" }
  | { type: "LOAD"; value: Track[] };

// Placeholder value; every consumer renders inside Provider.
const Context = createContext({
  sequence: config,
  toggleNote: (note: NotePosition) => {},
  clearNotes: () => {},
  loadNotes: (trackList: Track[]) => {},
});

const appReducer = (state: Sequence, action: Action): Sequence => {
  switch (action.type) {
    case "SET_ON_NOTES": {
      let newTrackList = state.trackList.map((track, trackID) => {
        if (action.trackID === trackID) {
          return {
            ...track,
            onNotes: action.value,
          };
        } else {
          return track;
        }
      });
      return {
        ...state,
        trackList: newTrackList,
      };
    }
    case "CLEAR_NOTES": {
      return {
        ...state,
        trackList: state.trackList.map((trackList) => ({
          ...trackList,
          onNotes: [],
        })),
      };
    }
    case "LOAD": {
      return {
        ...state,
        trackList: action.value,
      };
    }
    default: {
      return state;
    }
  }
};

const Provider = ({ children }: { children: ReactNode }) => {
  const [sequence, dispatch] = useReducer(appReducer, { ...config });

  const toggleNote = ({ trackID, stepID }: NotePosition) => {
    let newOnNotes;
    const onNotes = sequence.trackList[trackID]?.onNotes;

    if (!onNotes) {
      return;
    }

    if (onNotes.indexOf(stepID) === -1) {
      newOnNotes = [...onNotes, stepID];
    } else {
      newOnNotes = onNotes.filter((col) => col !== stepID);
    }
    dispatch({
      type: "SET_ON_NOTES",
      value: newOnNotes,
      trackID,
    });
  };

  const clearNotes = () => {
    dispatch({
      type: "CLEAR_NOTES",
    });
  };

  const loadNotes = (trackList: Track[]) => {
    dispatch({
      type: "LOAD",
      value: trackList,
    });
  };

  return (
    <Context.Provider value={{ sequence, toggleNote, clearNotes, loadNotes }}>
      {children}
    </Context.Provider>
  );
};

export { Provider, Context };
