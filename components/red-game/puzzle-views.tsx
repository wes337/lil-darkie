import { useState, type SubmitEvent } from "react";
import FinalImage, { Hotspot } from "./final-image";
import { NOTE, RIDDLE } from "./game-content";
import type { ItemId, Progress } from "./game-model";
import type { DownloadId } from "@/lib/signed-downloads";
import styles from "@/styles/puzzle-views.module.scss";

// The reward files on the computer, by the signed download each one opens.
// Never substitute a different album.
const DOWNLOADS = [
  { file: "prjct", download: "red-album" },
  { file: "xtra", download: "red-bonus-track" },
] satisfies { file: string; download: DownloadId }[];

type OnTarget = (target: string) => void;

export function DoorView({ onTarget }: { onTarget: OnTarget }) {
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

export function KeypadView({
  onSubmit,
  onItemUse,
  selected,
  unlocked,
}: {
  onSubmit: (code: string) => void;
  onItemUse: OnTarget;
  selected: ItemId | null;
  unlocked: boolean;
}) {
  const [digits, setDigits] = useState("");
  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selected) {
      onItemUse("safe-keypad");
      return;
    }
    onSubmit(digits);
    setDigits("");
  }
  function press(digit: string) {
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

export function ComputerScreen({
  progress,
  selected,
  onTarget,
  onNavigate,
  onSound,
  onDownload,
  document = false,
}: {
  progress: Progress;
  selected: ItemId | null;
  onTarget: OnTarget;
  onNavigate: (view: string) => void;
  onSound: (id: string) => void;
  onDownload: (id: DownloadId) => void;
  document?: boolean;
}) {
  function download(file: string, id: DownloadId) {
    if (selected) {
      onTarget(file);
      return;
    }
    onSound("computer-click-download");
    onDownload(id);
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
            {DOWNLOADS.filter(({ file }) => file === "prjct" || progress.cdInserted).map(({ file, download: id }) => (
              <button key={file} className={styles.file} onClick={() => download(file, id)}>
                <span className={styles.folderIcon} aria-hidden="true" />
                <span>{file}</span>
              </button>
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

export function PeepholeView({ onTarget }: { onTarget: OnTarget }) {
  return (
    <button className={styles.outdoors} aria-label="Look outside" onClick={() => onTarget("outdoors")}>
      <FinalImage name="outside" alt="A sunny field beyond the room." />
    </button>
  );
}
