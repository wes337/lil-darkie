import { useState } from "react";
import FinalImage, { Hotspot } from "./final-image";
import { NOTE, RIDDLE } from "./game-content.mjs";
import styles from "@/styles/puzzle-views.module.scss";

// Set these to the supplied release files; never substitute a different album.
const DOWNLOADS = {
  prjct: process.env.NEXT_PUBLIC_RED_ALBUM_URL || "",
  xtra: process.env.NEXT_PUBLIC_RED_BONUS_URL || "",
};

export function DoorView({ onTarget }) {
  return (
    <>
      <FinalImage name="door" />
      <Hotspot target="peephole" label="Look through the peephole" rect={[44, 25, 12, 14]} onInspect={onTarget} />
      <Hotspot target="doorknob" label="Turn the doorknob" rect={[57, 44, 14, 20]} onInspect={onTarget} />
      <Hotspot target="door-frame" label="Feel along the top of the doorframe" rect={[29, 3, 44, 11]} onInspect={onTarget} />
      <Hotspot target="door-crack" label="Look beneath the door" rect={[30, 85, 44, 9]} onInspect={onTarget} />
    </>
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
    setDigits((current) => digit === "back" ? current.slice(0, -1) : `${current}${digit}`.slice(0, 6));
  }
  return (
    <form className={styles.keypad} onSubmit={submit} aria-label="Safe keypad">
      <FinalImage name="keypad" />
      <div className={styles.code} aria-hidden="true">
        {unlocked && !digits ? "OPEN" : digits.padEnd(6, "_")}
      </div>
      <input
        className={styles.codeInput}
        aria-label="Six digit safe code"
        inputMode="numeric"
        autoComplete="off"
        maxLength={6}
        value={digits}
        onChange={(event) => setDigits(event.target.value.replace(/\D/g, "").slice(0, 6))}
      />
      <div className={styles.keys}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0", "enter"].map((digit) => (
          <button
            key={digit}
            type={digit === "enter" ? "submit" : "button"}
            data-game-sound="keypad-button"
            aria-label={digit === "back" ? "Delete digit" : digit === "enter" ? "Enter code" : digit}
            onClick={digit === "enter" ? undefined : () => press(digit)}
          />
        ))}
      </div>
    </form>
  );
}

export function ComputerScreen({ progress, selected, onTarget, onNavigate, onSound, document = false }) {
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
    <>
      <FinalImage name={progress.usbInserted ? "computer-on" : "computer-off"} className={styles.monitor} />
      <div className={styles.computerScreen} data-powered={progress.usbInserted}>
        {document && <div className={styles.screenHeader}>psswrd</div>}
        {document ? (
          <pre className={styles.document} tabIndex={0} aria-label="Password riddle">{RIDDLE}</pre>
        ) : !progress.usbInserted ? (
          <button className={styles.login} onClick={() => onTarget("locked-screen")}>insert login key</button>
        ) : (
          <div className={styles.files}>
            <button className={styles.file} onClick={() => selected ? onTarget("psswrd") : onNavigate("password-document")}>
              <span className={styles.documentIcon} aria-hidden="true">≡</span>
              <span>psswrd</span>
            </button>
            {["prjct", ...(progress.cdInserted ? ["xtra"] : [])].map((id) => (
              <a key={id} className={styles.file} href={DOWNLOADS[id] || "#"} download onClick={(event) => download(event, id)}>
                <span className={styles.folderIcon} aria-hidden="true" />
                <span>{id}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function NoteView() {
  return <FinalImage name="note" alt={NOTE} />;
}

export function PeepholeView({ onTarget }) {
  return (
    <button className={styles.outdoors} aria-label="Look outside" onClick={() => onTarget("outdoors")}>
      <FinalImage name="outside" alt="A sunny field beyond the room." />
    </button>
  );
}
