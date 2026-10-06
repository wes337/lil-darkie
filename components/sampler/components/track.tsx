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
}: {
  trackID: number;
  currentStepID: number | null;
  title: string;
  noteCount: number;
  onNotes: number[];
  color: string;
  soundFilePath: string;
}) => {
  const [play] = useSound(soundFilePath);

  const notes = Array.from({ length: noteCount }, (el, i) => {
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
