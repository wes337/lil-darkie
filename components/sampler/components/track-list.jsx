import React, { useContext, memo } from "react";
import { Context } from "../hooks/useStore";
import { soundFiles } from "../constants/config";
import Track from "./track";

const TrackList = ({ currentStepID }) => {
  const {
    sequence: { trackList, noteCount },
  } = useContext(Context);
  const content = trackList.map((track, trackID) => {
    const { title, onNotes, soundFile, color } = track;
    const soundFilePath = soundFiles[soundFile];

    return (
      <Track
        key={title}
        color={color}
        trackID={+trackID}
        currentStepID={currentStepID}
        title={title}
        noteCount={noteCount}
        onNotes={onNotes}
        soundFilePath={soundFilePath}
      />
    );
  });

  return <div className="track-list">{content}</div>;
};

export default memo(TrackList);
