"use client";
import React, { useState, useEffect } from "react";
import { isMobileSizedScreen } from "@/app/utils";
import ToolBar from "./components/toolbar";
import TrackList from "./components/track-list";
import PlayHead from "./components/play-head";
import { Provider } from "./hooks/useStore";
import useTimer from "./hooks/useTimer";
import useStyles from "./hooks/useStyles";
import "./sampler.scss";

function Sampler() {
  const baseBPMPerOneSecond = 60;
  const [noteCount, setNoteCount] = useState(16);
  const stepsPerBar = noteCount / 2;
  const beatsPerBar = stepsPerBar / 2;
  const barsPerSequence = 2;
  const totalSteps = stepsPerBar * barsPerSequence;
  const totalBeats = beatsPerBar * barsPerSequence;

  // The toolbar input stores whatever was typed, so BPM becomes a string.
  const [BPM, setBPM] = useState<number | string>(80);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pastLapsedTime, setPastLapse] = useState(0);
  const [currentStepID, setCurrentStep] = useState<number | null>(null);
  const [getNotesAreaWidthInPixels] = useStyles(totalSteps);

  const notesAreaWidthInPixels = getNotesAreaWidthInPixels(totalSteps);
  const timePerSequence = (baseBPMPerOneSecond / Number(BPM)) * 1000 * totalBeats;
  const timePerStep = timePerSequence / totalSteps;
  const isSequencePlaying = startTime !== null;
  const playerTime = useTimer(isSequencePlaying);
  const lapsedTime = isSequencePlaying
    ? Math.max(0, (playerTime ?? 0) - startTime)
    : 0;
  const totalLapsedTime = pastLapsedTime + lapsedTime;

  useEffect(() => {
    if (isSequencePlaying) {
      setCurrentStep(Math.floor(totalLapsedTime / timePerStep) % totalSteps);
    } else {
      setCurrentStep(null);
    }
  }, [isSequencePlaying, timePerStep, totalLapsedTime, totalSteps]);

  useEffect(() => {
    const onResize = () => {
      const count = isMobileSizedScreen() ? 8 : 16;
      setNoteCount(count);
    };

    onResize();

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const toolBarProps = {
    setStartTime,
    setPastLapse,
    setBPM,
    isSequencePlaying,
    startTime,
    BPM,
  };

  const playHeadProps = {
    notesAreaWidthInPixels,
    timePerSequence,
    totalLapsedTime,
  };

  const trackListProps = {
    currentStepID,
    noteCount,
  };

  return (
    <Provider>
      <main className="sampler">
        <header className="header">
          <ToolBar {...toolBarProps} />
        </header>
        <div className="content">
          <PlayHead {...playHeadProps} />
          <TrackList {...trackListProps} />
        </div>
      </main>
    </Provider>
  );
}

export default Sampler;
