import React, { useContext, useEffect, useCallback, memo } from "react";
import useStore from "@/app/store";
import { config } from "../constants/config";
import { Context } from "../hooks/useStore";
import "./note.scss";

const Note = ({
  trackID,
  stepID,
  isNoteOn,
  isNoteOnCurrentStep,
  play,
  color,
}) => {
  const { toggleNote } = useContext(Context);
  const {
    playedKick,
    playedKickAlt,
    playedSnare,
    playedOpenHat,
    playedClosedHat,
    playedGrowl,
    playedPigSqueal,
    playedHuh,
    playedYuh,
    playedLaugh,
    playedWood,
  } = useStore();

  const triggerNotePlayed = useCallback(
    (trackId) => {
      const trackName = config.trackList[trackId].title.toLowerCase();
      console.log(trackName);
      switch (trackName) {
        case "kick":
          playedKick(true);
          setTimeout(() => playedKick(false), 250);
          break;
        case "kick 2":
          playedKickAlt(true);
          setTimeout(() => playedKickAlt(false), 250);
          break;
        case "snare":
          playedSnare(true);
          setTimeout(() => playedSnare(false), 250);
          break;
        case "open hat":
          playedOpenHat(true);
          setTimeout(() => playedOpenHat(false), 250);
          break;
        case "closed hat":
          playedClosedHat(true);
          setTimeout(() => playedClosedHat(false), 250);
          break;
        case "growl":
          playedGrowl(true);
          setTimeout(() => playedGrowl(false), 250);
          break;
        case "pig squeal":
          playedPigSqueal(true);
          setTimeout(() => playedPigSqueal(false), 250);
          break;
        case "huh":
          playedHuh(true);
          setTimeout(() => playedHuh(false), 250);
          break;
        case "yuh":
          playedYuh(true);
          setTimeout(() => playedYuh(false), 250);
          break;
        case "laugh":
          playedLaugh(true);
          setTimeout(() => playedLaugh(false), 500);
          break;
        case "wood block":
          playedWood(true);
          setTimeout(() => playedWood(false), 250);
          break;
        default:
          break;
      }
    },
    [
      playedKick,
      playedKickAlt,
      playedSnare,
      playedOpenHat,
      playedClosedHat,
      playedGrowl,
      playedPigSqueal,
      playedHuh,
      playedYuh,
      playedLaugh,
      playedWood,
    ]
  );

  useEffect(() => {
    if (isNoteOn && isNoteOnCurrentStep) {
      play();
      triggerNotePlayed(trackID);
    }
  }, [isNoteOn, isNoteOnCurrentStep, play, trackID, triggerNotePlayed]);

  const noteClicked = (e) => {
    e.target.classList.toggle("on");
    toggleNote({ trackID, stepID });
    play();
    triggerNotePlayed(trackID);
  };

  return (
    <div
      className={`note${isNoteOn ? " on" : ""}${
        isNoteOn && isNoteOnCurrentStep ? " playing" : ""
      } ${color}`}
      onClick={noteClicked}
    />
  );
};

export default memo(Note);
