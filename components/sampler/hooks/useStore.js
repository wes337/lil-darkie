import React, { useReducer, createContext } from "react";
import { config, sequenceList } from "../constants/config";

const Context = createContext({
  sequence: {},
  toggleNote: () => {},
});

const appReducer = (state, action) => {
  switch (action.type) {
    case "SET_ON_NOTES":
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
    default:
      return state;
  }
};

const Provider = ({ children }) => {
  const [sequence, dispatch] = useReducer(appReducer, { ...config });

  const toggleNote = ({ trackID, stepID }) => {
    let newOnNotes;
    const onNotes = sequence.trackList[trackID].onNotes;

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

  return (
    <Context.Provider value={{ sequence, toggleNote }}>
      {children}
    </Context.Provider>
  );
};

export { Provider, Context };
