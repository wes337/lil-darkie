"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useStore from "@/app/store";
import RoomScene from "./room-scene";
import PropCloseup from "./prop-closeup";
import useGame from './use-game';
import GameDialog from './game-dialog';
import Inventory from './inventory';
import GameSequence from './game-sequence';
import { ROOMS } from "./rooms";
import styles from "@/styles/red-game.module.scss";

const ROOM_FADE_MS = 240;
const NAVIGATION_TARGETS = ['desk', 'door-front', 'safe-keypad', 'computer-monitor', 'desk-note', 'peephole'];
const SPARKLE_SOUNDS = ['Sparkle_C_1 (99Sounds)', 'Sparkle_C_2 (99Sounds)', 'Sparkle_G_1 (99Sounds)', 'Sparkle_G_2 (99Sounds)'];
const EXTRA_SOUNDS = {
  'usb-in': 'mp3', 'cd-in': 'mp3', 'computer-activate': 'mp3',
  'computer-nav': 'mp3', 'computer-beep': 'mp3', 'computer-click': 'mp3',
  'computer-click-download': 'mp3', 'computer-click-back': 'mp3',
  success: 'mp3', 'click-no': 'mp3', 'item-inv-2': 'mp3', 'click-soft': 'mp3',
  'item-mystery-3': 'mp3', 'item-mystery-4': 'mp3', 'click-glass': 'mp3',
  text: 'mp3', 'bear-repaired': 'mp3', 'door-open': 'mp3', 'computer-hum': 'mp3',
  ...Object.fromEntries(SPARKLE_SOUNDS.map((id) => [id, 'mp3'])),
};

function playSound(sound) {
  if (!sound) return;
  sound.currentTime = 0;
  // A blocked or failed sound should never interrupt gameplay.
  sound.play().catch(() => {});
}

// `onExit` runs when the player clicks END after the ending; the page remounts the game to reset it.
export default function RedGame({ onExit }) {
  const { gameStarted, setGameStarted, setNavOpen } = useStore();
  const game = useGame();
  const { deselect, selected, dialog, sequence } = game;
  const [roomIndex, setRoomIndex] = useState(0);
  const [loadedRooms, setLoadedRooms] = useState({});
  const [transition, setTransition] = useState("idle");
  const [inspectionHistory, setInspectionHistory] = useState([]);
  const moving = transition !== "idle";
  const blocked = moving || Boolean(game.dialog) || Boolean(game.sequence);
  const nextViewRef = useRef({ roomIndex: 0, inspectionHistory: [] });
  const rightArrowRef = useRef(null);
  const inspectionBackRef = useRef(null);
  const inspectionOriginRef = useRef(null);
  const detectionSoundRef = useRef(null);
  const movementSoundRef = useRef(null);
  const keypadButtonSoundRef = useRef(null);
  const doorLockedSoundRef = useRef(null);
  const doorBottomSoundRef = useRef(null);
  const doorHoleSoundRef = useRef(null);
  const textCloseSoundRef = useRef(null);
  const itemMysterySoundRef = useRef(null);
  const giantSoundRef = useRef(null);
  const holeSoundRef = useRef(null);
  const holeReminderSoundRef = useRef(null);
  const answerTwoSoundRef = useRef(null);
  const figureSoundRef = useRef(null);
  const plantSoundRef = useRef(null);
  const threadSoundRef = useRef(null);
  const noteSoundRef = useRef(null);
  const stoolSoundRef = useRef(null);
  const safeOpenSoundRef = useRef(null);
  const lampOnSoundRef = useRef(null);
  const lampOffSoundRef = useRef(null);
  const zapSoundRef = useRef(null);
  const wallLightSoundRef = useRef(null);
  const extraSounds = useRef({});
  const humRef = useRef(null);
  const playCue = useCallback((id) => {
    if (id === 'sparkle') {
      SPARKLE_SOUNDS.forEach((soundId) => extraSounds.current[soundId]?.pause());
      id = SPARKLE_SOUNDS[Math.floor(Math.random() * SPARKLE_SOUNDS.length)];
    }
    playSound(id === 'item-mystery' ? itemMysterySoundRef.current : extraSounds.current[id]);
  }, []);
  const focusAfterMove = useRef(null);
  const focusOnStart = useRef(false);
  const room = ROOMS[roomIndex];
  const ready = ROOMS.every(({ id }) => loadedRooms[id] === true);
  const failed = Object.values(loadedRooms).some((loaded) => loaded === false);

  const onRoomReady = useCallback((id, loaded) => {
    setLoadedRooms((previous) => ({ ...previous, [id]: loaded }));
  }, []);

  const inspecting = inspectionHistory.length > 0;
  const dialogCloseup = dialog?.sourceTarget === 'mouse-hole';
  const currentView = inspectionHistory.at(-1);
  const humming = gameStarted && game.progress.usbInserted && !sequence &&
    ['desk', 'computer-monitor', 'password-document'].includes(currentView);
  useEffect(() => {
    const hum = humRef.current;
    if (!humming) return;
    hum.volume = 0.3;
    playSound(hum);
    return () => { hum.pause(); hum.currentTime = 0; };
  }, [humming]);
  // The tower's one-shot hum is only for its text box.
  useEffect(() => {
    const towerHum = extraSounds.current['computer-hum'];
    if (dialog || !towerHum) return;
    towerHum.pause();
    towerHum.currentTime = 0;
  }, [dialog]);

  function inspect(id) {
    if (moving || inspectionHistory.at(-1) === id) return;
    if (['door-front', 'safe-keypad', 'desk'].includes(id)) playSound(movementSoundRef.current);
    if (id === 'peephole') playSound(doorHoleSoundRef.current);
    if (id === 'desk-note') playSound(noteSoundRef.current);
    if (id === 'computer-monitor') playCue('computer-nav');
    if (id === 'password-document') playCue('computer-click');
    if (!inspecting) inspectionOriginRef.current = document.activeElement;
    nextViewRef.current = { roomIndex, inspectionHistory: [...inspectionHistory, id] };
    setTransition("out");
  }

  function target(id) {
    if (blocked) return;
    if (NAVIGATION_TARGETS.includes(id) && (!game.selected || ['desk', 'door-front'].includes(id))) {
      inspect(id);
      return;
    }
    const result = game.act(id);
    if (result?.sound !== 'item-mystery') playCue(result?.sound);
    if (result?.sound === 'usb-in') playCue('computer-activate');
    if (result?.sound === 'door-locked') playSound(doorLockedSoundRef.current);
    if (result?.sound === 'door-bottom') playSound(doorBottomSoundRef.current);
    if (result?.sound === 'item-mystery') playSound(itemMysterySoundRef.current);
    if (result?.sound === 'peaking-guy') playSound(giantSoundRef.current);
    if (result?.sound === 'item-mystery-2') playSound(holeSoundRef.current);
    if (result?.sound === 'item-mystery-5') playSound(holeReminderSoundRef.current);
    if (result?.sound === 'you') playSound(figureSoundRef.current);
    if (result?.sound === 'plant-2') playSound(plantSoundRef.current);
    if (result?.sound === 'plant-1') playSound(threadSoundRef.current);
    if (result?.sound === 'detection-click-2') playSound(stoolSoundRef.current);
    if (result?.sound === 'safe-open') playSound(safeOpenSoundRef.current);
    if (result?.sound === 'lamp-on' || result?.sound === 'lamp-off') {
      lampOnSoundRef.current?.pause();
      lampOffSoundRef.current?.pause();
      playSound(result.sound === 'lamp-on' ? lampOnSoundRef.current : lampOffSoundRef.current);
    }
    if (result?.sound === 'zap-1') playSound(zapSoundRef.current);
    if (result?.sound === 'zap-2') playSound(wallLightSoundRef.current);
    if (result?.view) inspect(result.view);
  }

  const backFromInspection = useCallback(() => {
    if (blocked || !inspectionHistory.length) return;
    if (['computer-monitor', 'password-document'].includes(inspectionHistory.at(-1))) playCue('computer-click-back');
    else playSound(movementSoundRef.current);
    nextViewRef.current = { roomIndex, inspectionHistory: inspectionHistory.slice(0, -1) };
    focusAfterMove.current = inspectionOriginRef.current;
    setTransition("out");
  }, [blocked, roomIndex, inspectionHistory, playCue]);

  useEffect(() => {
    if (!gameStarted || dialog || sequence || (!selected && !inspecting)) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (selected) { playCue('click-soft'); deselect(); }
        else if (inspecting) backFromInspection();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameStarted, inspecting, backFromInspection, dialog, sequence, selected, deselect, playCue]);

  useEffect(() => {
    if (transition === "idle") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Hold at black for one frame before replacing the view underneath the curtain.
    const duration = transition === "out" ? ROOM_FADE_MS + 40 : 650;
    const timer = window.setTimeout(() => {
      if (transition === "out") {
        setRoomIndex(nextViewRef.current.roomIndex);
        setInspectionHistory(nextViewRef.current.inspectionHistory);
        setTransition("in");
      } else {
        setTransition("idle");
      }
    }, reduceMotion ? 0 : duration);
    return () => window.clearTimeout(timer);
  }, [transition]);

  useEffect(() => {
    if (gameStarted && !moving && !game.dialog && !game.sequence) {
      const target = inspecting ? inspectionBackRef.current : focusOnStart.current ? rightArrowRef.current : focusAfterMove.current;
      target?.focus({ preventScroll: true });
      focusOnStart.current = false;
      focusAfterMove.current = null;
    }
  }, [gameStarted, moving, inspecting, game.dialog, game.sequence]);

  function startGame() {
    if (!ready) return;
    playSound(movementSoundRef.current);
    focusOnStart.current = true;
    setNavOpen(false);
    setTransition("starting");
    setGameStarted(true);
  }

  function turn(direction, button) {
    if (blocked) return;
    focusAfterMove.current = button;
    nextViewRef.current = {
      roomIndex: (roomIndex + direction + ROOMS.length) % ROOMS.length,
      inspectionHistory: [],
    };
    setTransition("out");
  }

  function finishSequence() {
    if (game.sequence?.type === 'ending') { onExit(); return; }
    if (game.sequence?.type === 'repair') {
      setRoomIndex(3);
      setInspectionHistory([]);
      focusAfterMove.current = rightArrowRef.current;
    }
    game.finishSequence();
  }

  function answerTopic(topic) {
    if (game.dialog?.kind !== 'conversation') return;
    answerTwoSoundRef.current?.pause();
    playSound(topic === 'help' ? itemMysterySoundRef.current : answerTwoSoundRef.current);
    game.talk(topic);
  }

  function closeDialog() {
    if (!game.dialog) return;
    playSound(textCloseSoundRef.current);
    game.closeDialog();
  }

  function playClickSound(event) {
    if (!gameStarted || blocked) return;
    const element = event.target;
    let sound;
    if (element.closest('[data-game-sound="move"]')) {
      sound = movementSoundRef.current;
    } else if (element.closest('[data-game-sound="keypad-button"]')) {
      sound = keypadButtonSoundRef.current;
    } else if (!element.closest('button, a, input, textarea, select, summary, dialog, aside')) {
      sound = detectionSoundRef.current;
    }
    playSound(sound);
  }

  return (
    <section
      className={styles.game}
      aria-label="Red Game"
      onContextMenu={(event) => event.preventDefault()}
      onClick={playClickSound}
      data-transition={transition}
      data-holding-item={Boolean(game.selected)}
      data-dialog-source={dialog?.art?.roomProp}
      style={{ "--room-fade-duration": `${ROOM_FADE_MS}ms` }}
    >
      <audio ref={detectionSoundRef} src="/red-game/sounds/detection-click-1.mp3" preload="auto" hidden />
      <audio ref={movementSoundRef} src="/red-game/sounds/move-2.mp3" preload="auto" hidden />
      <audio ref={keypadButtonSoundRef} src="/red-game/sounds/keypad-button.mp3" preload="auto" hidden />
      <audio ref={doorLockedSoundRef} src="/red-game/sounds/door-locked.mp3" preload="auto" hidden />
      <audio ref={doorBottomSoundRef} src="/red-game/sounds/door-bottom.mp3" preload="auto" hidden />
      <audio ref={doorHoleSoundRef} src="/red-game/sounds/door-hole.mp3" preload="auto" hidden />
      <audio ref={textCloseSoundRef} src="/red-game/sounds/click-close.mp3" preload="auto" hidden />
      <audio ref={itemMysterySoundRef} src="/red-game/sounds/item-mystery.mp3" preload="auto" hidden />
      <audio ref={giantSoundRef} src="/red-game/sounds/peaking-guy.mp3" preload="auto" hidden />
      <audio ref={holeSoundRef} src="/red-game/sounds/item-mystery-2.mp3" preload="auto" hidden />
      <audio ref={holeReminderSoundRef} src="/red-game/sounds/item-mystery-5.mp3" preload="auto" hidden />
      <audio ref={answerTwoSoundRef} src="/red-game/sounds/answer-2.mp3" preload="auto" hidden />
      <audio ref={figureSoundRef} src="/red-game/sounds/you.mp3?v=2" preload="auto" hidden />
      <audio ref={plantSoundRef} src="/red-game/sounds/plant-2.mp3" preload="auto" hidden />
      <audio ref={threadSoundRef} src="/red-game/sounds/plant-1.mp3" preload="auto" hidden />
      <audio ref={noteSoundRef} src="/red-game/sounds/note.mp3" preload="auto" hidden />
      <audio ref={stoolSoundRef} src="/red-game/sounds/detection-click-2.mp3" preload="auto" hidden />
      <audio ref={safeOpenSoundRef} src="/red-game/sounds/safe-open.mp3" preload="auto" hidden />
      <audio ref={lampOnSoundRef} src="/red-game/sounds/lamp-on.mp3" preload="auto" hidden />
      <audio ref={lampOffSoundRef} src="/red-game/sounds/lamp-off.mp3" preload="auto" hidden />
      <audio ref={zapSoundRef} src="/red-game/sounds/zap-1.mp3" preload="auto" hidden />
      <audio ref={wallLightSoundRef} src="/red-game/sounds/zap-2.mp3" preload="auto" hidden />
      <audio ref={humRef} src="/red-game/sounds/computer-hum.mp3" preload="auto" loop hidden />
      {Object.entries(EXTRA_SOUNDS).map(([id, extension]) => <audio key={id}
        ref={(element) => { extraSounds.current[id] = element; }}
        src={`/red-game/sounds/${id}.${extension}`} preload="auto" hidden />)}
      {/* Keep decoded layers mounted so every turn is immediate. */}
      {ROOMS.map((view) => (
        <div
          key={view.id}
          className={styles.view}
          data-active={view.id === room.id && !inspecting}
          aria-hidden={view.id !== room.id || inspecting}
          inert={blocked || view.id !== room.id || inspecting || !gameStarted}
        >
          <RoomScene
            room={view}
            active={view.id === room.id && !inspecting}
            playing={gameStarted}
            moving={blocked}
            onReady={onRoomReady}
            onInspect={target}
            progress={game.progress}
          />
        </div>
      ))}
      {(inspecting || dialogCloseup) && <PropCloseup
        history={dialogCloseup ? ['mouse-hole'] : inspectionHistory}
        hideBack={dialogCloseup}
        room={room}
        moving={blocked}
        backRef={inspectionBackRef}
        onInspect={target}
        onNavigate={inspect}
        onBack={backFromInspection}
        game={game}
        onSound={playCue}
        onSubmitCode={(code) => playCue(game.submitCode(code)?.sound)}
      />}
      <div className={styles.curtain} aria-hidden="true" />

      {!gameStarted ? (
        <div className={styles.start}>
          <button className={styles.play} onClick={startGame} disabled={!ready}>
            <img
              className={styles.playYellow}
              src="/images/red-game/buttons/paint-yellow.png"
              alt=""
              width={2172}
              height={724}
              draggable={false}
            />
            <img
              className={styles.playRed}
              src="/images/red-game/buttons/paint-red.png"
              alt=""
              width={2172}
              height={724}
              draggable={false}
            />
            <span>Play the Game</span>
          </button>
          {failed && <p role="alert">The room artwork couldn’t load. Please refresh to try again.</p>}
        </div>
      ) : (
        <>
          <p className={styles.srOnly} role="status">{!inspecting && room.name}</p>
          {!inspecting && !dialogCloseup && <nav className={styles.navigation} aria-label="Room views" aria-busy={moving}>
            <button
              className={`${styles.arrow} ${styles.left}`}
              aria-label="Turn left"
              data-game-sound="move"
              onClick={(event) => turn(-1, event.currentTarget)}
              disabled={blocked}
            >
              <img src="/images/red-game/navigation/arrow-left.png" alt="" width={1254} height={1254} draggable={false} />
            </button>
            <button
              ref={rightArrowRef}
              className={`${styles.arrow} ${styles.right}`}
              aria-label="Turn right"
              data-game-sound="move"
              onClick={(event) => turn(1, event.currentTarget)}
              disabled={blocked}
            >
              <img src="/images/red-game/navigation/arrow-right.png" alt="" width={1254} height={1254} draggable={false} />
            </button>
            {room.id === "computer" && (
              <button
                className={`${styles.arrow} ${styles.up}`}
                aria-label="Look at the sky"
                data-game-sound="move"
                onClick={() => target('sky')}
                disabled={blocked}
              >
                <img src="/images/red-game/navigation/arrow-up.png" alt="" width={1254} height={1254} draggable={false} />
              </button>
            )}
          </nav>}
          <Inventory game={game} disabled={blocked} onSound={playCue} />
          {game.dialog && <GameDialog game={game} onClose={closeDialog} onTalk={answerTopic} onSound={playCue} />}
          {game.sequence && <GameSequence type={game.sequence.type} onFinish={finishSequence} onSound={playCue} />}
        </>
      )}
    </section>
  );
}
