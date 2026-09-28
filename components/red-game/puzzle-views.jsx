import { useState } from "react";
import { Prop } from "./room-props";
import { artSources } from "./art";
import { NOTE, RIDDLE } from "./game-content.mjs";
import styles from "@/styles/puzzle-views.module.scss";

// Set these to the supplied release files; never substitute a different album.
const DOWNLOADS = {
  prjct: process.env.NEXT_PUBLIC_RED_ALBUM_URL || "",
  xtra: process.env.NEXT_PUBLIC_RED_BONUS_URL || "",
};

export function DoorView({ onTarget }) {
  return (
    <div className={styles.door}>
      <Prop asset="door-floor-light" className={styles.doorLight} />
      <Prop asset="door-front" />
      <button
        className={styles.peephole}
        aria-label="Look through the peephole"
        onClick={() => onTarget("peephole")}
      />
      <button
        className={styles.knob}
        aria-label="Turn the doorknob"
        onClick={() => onTarget("doorknob")}
      />
      <button
        className={styles.frame}
        aria-label="Feel along the top of the doorframe"
        onClick={() => onTarget("door-frame")}
      />
      <button
        className={styles.crack}
        aria-label="Look beneath the door"
        onClick={() => onTarget("door-crack")}
      />
    </div>
  );
}

export function KeypadView({ onSubmit, onItemUse, selected, unlocked }) {
  const [digits, setDigits] = useState("");
  function submit(event) {
    event.preventDefault();
    if (selected) {
      onItemUse("safe-keypad");
      return;
    }
    onSubmit(digits);
    setDigits("");
  }
  function press(digit) {
    if (selected) {
      onItemUse("safe-keypad");
      return;
    }
    setDigits((current) =>
      digit === "back"
        ? current.slice(0, -1)
        : `${current}${digit}`.slice(0, 6),
    );
  }
  return (
    <form className={styles.keypad} onSubmit={submit} aria-label="Safe keypad">
      <Prop asset="safe-keypad" />
      {/* Slots show typed digits over the remaining underscores; the transparent input on top takes keyboard entry. */}
      <div className={styles.code} aria-hidden="true">
        {unlocked && !digits
          ? "OPEN"
          : Array.from({ length: 6 }, (_, index) => (
              <span key={index} data-filled={index < digits.length}>
                {digits[index] ?? "_"}
              </span>
            ))}
      </div>
      <input
        className={styles.codeInput}
        aria-label="Six digit safe code"
        inputMode="numeric"
        autoComplete="off"
        maxLength={6}
        value={digits}
        onChange={(event) =>
          setDigits(event.target.value.replace(/\D/g, "").slice(0, 6))
        }
      />
      <div className={styles.keys}>
        {[
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "back",
          "0",
          "enter",
        ].map((digit) => (
          <button
            key={digit}
            type={digit === "enter" ? "submit" : "button"}
            data-game-sound="keypad-button"
            aria-label={
              digit === "back"
                ? "Delete digit"
                : digit === "enter"
                  ? "Enter code"
                  : digit
            }
            onClick={digit === "enter" ? undefined : () => press(digit)}
          >
            {digit === "back" ? "←" : digit === "enter" ? "✓" : digit}
          </button>
        ))}
      </div>
    </form>
  );
}

export function ComputerScreen({
  progress,
  selected,
  onTarget,
  onNavigate,
  onSound,
  document = false,
}) {
  function download(event, id) {
    if (selected) {
      event.preventDefault();
      onTarget(id);
      return;
    }
    onSound("computer-click-download");
    if (!DOWNLOADS[id]) event.preventDefault();
  }
  return (
    <div className={styles.computerScreen}>
      {document && <div className={styles.screenHeader}>psswrd</div>}
      {document ? (
        <pre className={styles.document}>{RIDDLE}</pre>
      ) : !progress.usbInserted ? (
        <button
          className={styles.login}
          onClick={() => onTarget("locked-screen")}
        >
          insert login key
        </button>
      ) : (
        <div className={styles.files}>
          <button
            className={styles.file}
            onClick={() =>
              selected ? onTarget("psswrd") : onNavigate("password-document")
            }
          >
            <span className={styles.documentIcon} aria-hidden="true">
              ≡
            </span>
            <span>psswrd</span>
          </button>
          {["prjct", ...(progress.cdInserted ? ["xtra"] : [])].map((id) => (
            <a
              key={id}
              className={styles.file}
              href={DOWNLOADS[id] || "#"}
              download
              onClick={(event) => download(event, id)}
            >
              <span className={styles.folderIcon} aria-hidden="true" />
              <span>{id}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function NoteView() {
  return (
    <article className={styles.note} aria-label="Desk note">
      <p>{NOTE}</p>
    </article>
  );
}

export function PeepholeView({ onTarget }) {
  return (
    <button
      className={styles.outdoors}
      aria-label="Look outside"
      onClick={() => onTarget("outdoors")}
    >
      <img
        {...artSources("/images/red-game/outdoors/field.webp")}
        alt="A sunny grassy field, clouds and a lone tree on a distant hill."
        draggable={false}
      />
    </button>
  );
}
