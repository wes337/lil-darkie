import React, { useContext, useState, memo } from "react";
import Image from "next/image";
import { ASSETS } from "@/app/assets";
import { Context } from "../hooks/useStore";
import "./toolbar.scss";

const ToolBar = ({
  setStartTime,
  setPastLapse,
  setBPM,
  isSequencePlaying,
  startTime,
  BPM,
}) => {
  const {
    clearNotes,
    loadNotes,
    sequence: { trackList },
  } = useContext(Context);
  const [saveString, setSaveString] = useState("");
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [error, setError] = useState(false);

  const canSave = !!trackList.find((track) => track.onNotes.length > 0);

  function togglePlayback() {
    if (isSequencePlaying) {
      setPastLapse((l) => l + performance.now() - startTime);
      setStartTime(null);
    } else {
      setStartTime(performance.now());
    }
  }

  function stopPlayback() {
    setPastLapse(0);
    setStartTime(null);
  }

  function updateBPM(event) {
    setBPM(event.target.value);
  }

  function save() {
    if (!canSave) {
      return;
    }

    hideSamplerFace();
    setSaveString(btoa(JSON.stringify(trackList)));
  }

  function copy() {
    const textArea = document.getElementById("save-string");

    if (!textArea) {
      return;
    }

    textArea.select();
    textArea.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(textArea.value);
    setSaveString("");
    unhideSamplerFace();
  }

  function hideSamplerFace() {
    const samplerFace = document.querySelector(".sampler-face");
    samplerFace?.classList.add("hide");
  }

  function unhideSamplerFace() {
    const samplerFace = document.querySelector(".sampler-face");
    samplerFace?.classList.remove("hide");
  }

  function load() {
    try {
      setError(false);
      const textArea = document.getElementById("load-string");

      if (!textArea) {
        return;
      }

      const loadString = textArea.value?.trim?.();

      if (!loadString || loadString.length === 0) {
        return;
      }

      const settings = JSON.parse(atob(loadString));

      if (!settings || !Array.isArray(settings) || settings.length !== 11) {
        setError(true);
        return;
      }

      loadNotes(settings);
      setShowLoadModal(false);
      unhideSamplerFace();
    } catch {
      setError(true);
    }
  }

  return (
    <>
      <nav className="toolbar">
        <button
          className="form_element button_stop"
          onClick={stopPlayback}
          aria-label="Stop"
        >
          <svg width="14" height="14" viewBox="0 0 14 14">
            <rect
              className="button_icon_path"
              x="2"
              y="2"
              width="10"
              height="10"
            />
          </svg>
        </button>
        <button
          className="form_element button_play_pause"
          onClick={togglePlayback}
          aria-label="Play / Pause"
        >
          <svg width="14" height="14" viewBox="8 8 20 20">
            {isSequencePlaying && (
              <path
                className="button_icon_path"
                id="pause-icon"
                data-state="playing"
                d="M11,10 L17,10 17,26 11,26 M20,10 L26,10 26,26 20,26"
              />
            )}
            {!isSequencePlaying && (
              <path
                className="button_icon_path"
                id="play-icon"
                data-state="paused"
                d="M11,10 L18,13.74 18,22.28 11,26 M18,13.74 L26,18 26,18 18,22.28"
              />
            )}
          </svg>
        </button>
        <input
          className="form_element input_bpm"
          id="bpm"
          type="text"
          value={BPM}
          onChange={updateBPM}
        />
        <label className="label_bpm" htmlFor="bpm">
          BPM
        </label>
        <div className="right-buttons">
          <button onClick={save} disabled={!canSave}>
            Save
          </button>
          <button
            onClick={() => {
              setShowLoadModal(true);
              hideSamplerFace();
            }}
          >
            Load
          </button>
          <button onClick={clearNotes}>Clear</button>
        </div>
      </nav>
      {saveString && (
        <div className="modal">
          <div className="inner">
            <div className="header">Save</div>
            <div className="instructions">
              Copy this code and load it later on to replay your song.
            </div>
            <textarea
              id="save-string"
              type="text"
              readOnly
              value={saveString}
            />
            <button onClick={copy}>Copy</button>
            <button
              className="close"
              onClick={() => {
                setSaveString("");
                unhideSamplerFace();
              }}
            >
              <Image
                src={ASSETS.closeIcon}
                alt="Close"
                width={24}
                height={24}
              />
            </button>
          </div>
        </div>
      )}
      {showLoadModal && (
        <div className="modal">
          <div className="inner">
            <div className="header">Load</div>
            <div className="instructions">
              Paste or enter a save code to load a song.
            </div>
            <textarea id="load-string" type="text" />
            <button onClick={load}>Load</button>
            <button
              className="close"
              onClick={() => {
                setShowLoadModal(false);
                unhideSamplerFace();
              }}
            >
              <Image
                src={ASSETS.closeIcon}
                alt="Close"
                width={24}
                height={24}
              />
            </button>
            {error && (
              <div className="error">Failed to load notes from code...</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default memo(ToolBar);
