import React, { memo } from "react";
import useSound from "../hooks/useSound";
import Note from "./note";
import "./track.scss";

const Track = ({
  trackID,
  currentStepID,
  title,
  noteCount,
  onNotes,
  color,
  soundFilePath,
}) => {
  const [play] = useSound(soundFilePath);

  const notes = [...Array(noteCount)].map((el, i) => {
    const isNoteOn = onNotes.indexOf(i) !== -1;
    const isNoteOnCurrentStep = currentStepID === i;
    const stepID = i;

    return (
      <Note
        key={i}
        trackID={trackID}
        stepID={stepID}
        isNoteOn={isNoteOn}
        isNoteOnCurrentStep={isNoteOnCurrentStep}
        play={play}
        color={color}
      />
    );
  });

  return (
    <div className={`track ${color}`}>
      <header className="track_title">{title}</header>
      <main className="track_notes">{notes}</main>
    </div>
  );
};

export default memo(Track);
