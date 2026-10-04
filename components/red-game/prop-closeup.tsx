"use client";

import { artSources } from "./art";
import FinalImage, { Hotspot } from "./final-image";
import type { RefObject } from "react";
import { roomImage, safeImage, type Rect } from "./final-art";
import type { Room } from "./rooms";
import type { Game } from "./use-game";
import { ComputerScreen, DoorView, KeypadView, NoteView, PeepholeView } from "./puzzle-views";
import styles from "@/styles/prop-closeup.module.scss";

const TITLES: Record<string, string> = {
  desk: "Computer desk",
  "safe-front": "Safe",
  "safe-interior": "Inside the safe",
  "computer-monitor": "Computer screen",
  "password-document": "Password document",
  peephole: "View outside",
  "safe-keypad": "Safe keypad close-up",
  "door-front": "Doorway",
  "desk-note": "Desk note",
};

export default function PropCloseup({
  history, room, moving, backRef, onInspect, onNavigate, onBack, game, onSound, onSubmitCode,
}: {
  history: string[];
  room: Room;
  moving: boolean;
  backRef: RefObject<HTMLButtonElement | null>;
  onInspect: (target: string) => void;
  onNavigate: (view: string) => void;
  onBack: () => void;
  game: Game;
  onSound: (id: string) => void;
  onSubmitCode: (code: string) => void;
}) {
  // Only rendered while inspecting, so the history is never empty.
  const view = history.at(-1)!;
  const progress = game.progress;
  const hotspot = (target: string, label: string, rect: Rect) => (
    <Hotspot target={target} label={label} rect={rect} onInspect={onInspect} disabled={moving} />
  );

  return (
    <fieldset className={styles.view} aria-label={TITLES[view] || "Close-up"} aria-busy={moving} disabled={moving} inert={moving}>
      <div className={styles.canvas} data-view={view}>
        {view === "desk" && (
          <>
            <FinalImage name={roomImage("computer", progress)} className={styles.desk} />
            {hotspot("computer-monitor", "Inspect computer screen", [12, 43, 36, 28])}
            {hotspot("computer-tower", "Inspect computer tower", [49, 47, 14, 25])}
            {hotspot("desk-lamp-on", "Inspect desk lamp", [76, 38, 17, 36])}
            {hotspot("desk-note", "Read the note", [65, 51, 12, 23])}
            {!["threaded", "used"].includes(progress.sewing) &&
              hotspot("thread-spool", "Inspect sewing thread", [75, 66, 14, 15])}
          </>
        )}
        {view === "door-front" && <DoorView onTarget={onInspect} />}
        {view === "safe-front" && (
          <>
            <FinalImage name={progress.safeUnlocked ? "safe-unlocked" : "safe-locked"} />
            {hotspot("safe-handle", "Turn safe handle", [7, 38, 41, 34])}
            {hotspot("safe-keypad", "Inspect the keypad", [60, 35, 25, 36])}
          </>
        )}
        {view === "safe-keypad" && (
          <KeypadView onSubmit={onSubmitCode} selected={game.selected} onItemUse={onInspect} unlocked={progress.safeUnlocked} />
        )}
        {view === "safe-interior" && (
          <>
            <FinalImage name={safeImage(progress)} />
            {!progress.keyTaken && hotspot("key", "Pick up the key", [57, 38, 20, 15])}
            {!progress.cdTaken && hotspot("cd", "Pick up the CD", [12, 60, 28, 16])}
          </>
        )}
        {["computer-monitor", "password-document"].includes(view) && (
          <ComputerScreen progress={progress} selected={game.selected} onTarget={onInspect} onNavigate={onNavigate} onSound={onSound} document={view === "password-document"} />
        )}
        {view === "desk-note" && <NoteView />}
        {view === "peephole" && <PeepholeView onTarget={onInspect} />}
      </div>
      <button
        ref={backRef}
        className={styles.back}
        aria-label={history.length > 1 ? "Back to previous view" : `Back to ${room.name}`}
        onClick={onBack}
        disabled={moving}
      >
        <img {...artSources("/images/red-game/navigation/arrow-left.webp")} width={1254} height={1254} alt="" draggable={false} />
      </button>
    </fieldset>
  );
}
