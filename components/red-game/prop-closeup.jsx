"use client";

import { Desk, Prop, SafeInterior } from "./room-props";
import assets from "./prop-assets.json";
import { ComputerScreen, DoorView, KeypadView, NoteView, PeepholeView } from './puzzle-views';
import styles from "@/styles/prop-closeup.module.scss";

const TITLES = {
  desk: "Computer desk",
  'mouse-hole': 'Hole in the wall',
  "safe-interior": "Inside the safe",
  "computer-monitor": "Computer screen",
  "password-document": "Password document",
  peephole: "View outside",
  'safe-keypad': 'Safe keypad close-up',
  "door-front": "Doorway",
  "desk-note": "anagram: way to do the proof! PS: don't poke yourself PPS: buy wd40 for hinges",
};

export default function PropCloseup({ history, room, moving, backRef, onInspect, onNavigate, onBack, game, onSound, onSubmitCode, hideBack = false }) {
  const view = history.at(-1);
  const title = TITLES[view] || "Close-up";
  const special = ['computer-monitor', 'password-document', 'desk-note', 'peephole'].includes(view);

  const layoutAsset = assets[view === "safe-interior" ? "safe-interior-empty" : view === 'mouse-hole' ? 'mouse-hole-closeup' : view];
  // The assembled desk is square; the empty table's image is much wider.
  const ratio = view !== "desk" && layoutAsset
    ? (layoutAsset.bounds[2] - layoutAsset.bounds[0] + 1) / (layoutAsset.bounds[3] - layoutAsset.bounds[1] + 1)
    : 1;

  return (
    <fieldset className={styles.view} aria-label={title} aria-busy={moving} disabled={moving} inert={moving}>
      <div className={styles.canvas} data-view={view}>
        <img className={styles.wall} src={`/images/red-game/${room.assets}/room.png`} width={1254} height={1254} alt="" draggable={false} />
        {!special && <div className={styles.content}>
          <div className={styles.subject} style={{ "--asset-ratio": ratio }}>
            {view === "desk" && <Desk onInspect={onInspect} large progress={game.progress} />}
            {view === 'mouse-hole' && <Prop asset="mouse-hole-closeup" large />}
            {view === "safe-interior" && <SafeInterior onInspect={onInspect} progress={game.progress} />}
            {view === 'door-front' && <DoorView onTarget={onInspect} />}
            {view === 'safe-keypad' && <KeypadView onSubmit={onSubmitCode} selected={game.selected} onItemUse={onInspect} unlocked={game.progress.safeUnlocked} />}
          </div>
        </div>}
        {['computer-monitor', 'password-document'].includes(view) && <ComputerScreen progress={game.progress} selected={game.selected} onTarget={onInspect} onNavigate={onNavigate} onSound={onSound} document={view === 'password-document'} />}
        {view === 'desk-note' && <NoteView />}
        {view === 'peephole' && <PeepholeView onTarget={onInspect} />}
      </div>
      {!hideBack && <button ref={backRef} className={styles.back} aria-label={history.length > 1 ? "Back to previous view" : `Back to ${room.name}`} onClick={onBack} disabled={moving}>
        <img src="/images/red-game/navigation/arrow-left.png" width={1254} height={1254} alt="" draggable={false} />
      </button>}
    </fieldset>
  );
}
