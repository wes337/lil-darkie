"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import useStore from "@/app/store";
import RoomScene from "./room-scene";
import PropCloseup from "./prop-closeup";
import useGame from "./use-game";
import GameDialog from "./game-dialog";
import Inventory from "./inventory";
import GameSequence from "./game-sequence";
import { ROOMS } from "./rooms";
import { GAME_CDN, artSources } from "./art";
import { dialogImage } from "./final-art";
import type { TopicId } from "./game-model";
import FinalImage from "./final-image";
import { MUSIC_VOLUME, SOUND_EFFECT_VOLUME, playSound } from "./audio";
import styles from "@/styles/red-game.module.scss";

const ROOM_FADE_MS = 240;
const START_FADE_OUT_MS = 450;
const START_HOLD_MS = 100;
const START_FADE_IN_MS = 650;
const MUSIC_TRACKS = [
  `${GAME_CDN}/music/escape-room-1-4f8ace32b060.mp3`,
  `${GAME_CDN}/music/escape-room-2-7a61ff94c3cd.mp3`,
] as const;
const NAVIGATION_TARGETS = [
  "desk",
  "door-front",
  "safe-front",
  "safe-keypad",
  "computer-monitor",
  "desk-note",
  "peephole",
];
const SPARKLE_SOUNDS = [
  "Sparkle_C_1 (99Sounds)",
  "Sparkle_C_2 (99Sounds)",
  "Sparkle_G_1 (99Sounds)",
  "Sparkle_G_2 (99Sounds)",
];
const EXTRA_SOUNDS = {
  "usb-in": "mp3",
  "cd-in": "mp3",
  "computer-activate": "mp3",
  "computer-nav": "mp3",
  "computer-beep": "mp3",
  "computer-click": "mp3",
  "computer-click-download": "mp3",
  "computer-click-back": "mp3",
  success: "mp3",
  "click-no": "mp3",
  "item-inv-2": "mp3",
  "click-soft": "mp3",
  "item-mystery-3": "mp3",
  "item-mystery-4": "mp3",
  "click-glass": "mp3",
  text: "mp3",
  "bear-repaired": "mp3",
  "door-open": "mp3",
  "computer-hum": "mp3",
  ...Object.fromEntries(SPARKLE_SOUNDS.map((id) => [id, "mp3"])),
};

export type StartScreenProps = {
  onStart: () => void;
  disabled: boolean;
  failed: boolean;
};

// The page supplies the landing layout; the game owns readiness, audio and fades.
// `onExit` runs from the ending's EXIT button; the page remounts the game to reset it.
export default function RedGame({
  onExit,
  renderStart,
}: {
  onExit: () => void;
  renderStart: (props: StartScreenProps) => ReactNode;
}) {
  const { gameStarted, setGameStarted, setNavOpen } = useStore();
  const game = useGame();
  const { deselect, selected, dialog, sequence } = game;
  const [roomIndex, setRoomIndex] = useState(0);
  const [loadedRooms, setLoadedRooms] = useState<Record<string, boolean>>({});
  const [transition, setTransition] = useState<
    "idle" | "out" | "in" | "start-out" | "start-in"
  >("idle");
  const [inspectionHistory, setInspectionHistory] = useState<string[]>([]);
  const moving = transition !== "idle";
  const starting = transition === "start-out" || transition === "start-in";
  const blocked = moving || Boolean(game.dialog) || Boolean(game.sequence);
  const transitionActionRef = useRef<(() => void) | null>(null);
  const gameRef = useRef<HTMLElement>(null);
  const rightArrowRef = useRef<HTMLButtonElement>(null);
  const inspectionBackRef = useRef<HTMLButtonElement>(null);
  const inspectionOriginRef = useRef<Element | null>(null);
  const detectionSoundRef = useRef<HTMLAudioElement>(null);
  const movementSoundRef = useRef<HTMLAudioElement>(null);
  const keypadButtonSoundRef = useRef<HTMLAudioElement>(null);
  const doorLockedSoundRef = useRef<HTMLAudioElement>(null);
  const doorBottomSoundRef = useRef<HTMLAudioElement>(null);
  const doorHoleSoundRef = useRef<HTMLAudioElement>(null);
  const textCloseSoundRef = useRef<HTMLAudioElement>(null);
  const itemMysterySoundRef = useRef<HTMLAudioElement>(null);
  const giantSoundRef = useRef<HTMLAudioElement>(null);
  const holeSoundRef = useRef<HTMLAudioElement>(null);
  const holeReminderSoundRef = useRef<HTMLAudioElement>(null);
  const answerTwoSoundRef = useRef<HTMLAudioElement>(null);
  const figureSoundRef = useRef<HTMLAudioElement>(null);
  const plantSoundRef = useRef<HTMLAudioElement>(null);
  const threadSoundRef = useRef<HTMLAudioElement>(null);
  const noteSoundRef = useRef<HTMLAudioElement>(null);
  const stoolSoundRef = useRef<HTMLAudioElement>(null);
  const safeOpenSoundRef = useRef<HTMLAudioElement>(null);
  const lampOnSoundRef = useRef<HTMLAudioElement>(null);
  const lampOffSoundRef = useRef<HTMLAudioElement>(null);
  const zapSoundRef = useRef<HTMLAudioElement>(null);
  const wallLightSoundRef = useRef<HTMLAudioElement>(null);
  const extraSounds = useRef<Record<string, HTMLAudioElement | null>>({});
  const humRef = useRef<HTMLAudioElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const musicTrack = useRef<0 | 1>(0);
  const nextMusicRef = useRef<HTMLAudioElement>(null);
  const [preloadSecondTrack, setPreloadSecondTrack] = useState(false);
  const playCue = useCallback((id: string | undefined) => {
    if (id === "sparkle") {
      SPARKLE_SOUNDS.forEach((soundId) =>
        extraSounds.current[soundId]?.pause(),
      );
      id = SPARKLE_SOUNDS[Math.floor(Math.random() * SPARKLE_SOUNDS.length)];
    }
    playSound(
      id === "item-mystery"
        ? itemMysterySoundRef.current
        : id === undefined
          ? null
          : extraSounds.current[id],
    );
  }, []);
  const focusAfterMove = useRef<Element | null>(null);
  const focusOnStart = useRef(false);
  // roomIndex only ever holds a valid index (see `turn` and `finishSequence`).
  const room = ROOMS[roomIndex]!;
  const ready = ROOMS.every(({ id }) => loadedRooms[id] === true);
  const failed = Object.values(loadedRooms).some((loaded) => loaded === false);

  const onRoomReady = useCallback((id: string, loaded: boolean) => {
    setLoadedRooms((previous) => ({ ...previous, [id]: loaded }));
  }, []);

  const inspecting = inspectionHistory.length > 0;
  const dialogCloseup = dialogImage(dialog?.sourceTarget, game.progress);
  const currentView = inspectionHistory.at(-1);
  const humming =
    gameStarted &&
    game.progress.usbInserted &&
    !sequence &&
    currentView !== undefined &&
    ["desk", "computer-monitor", "password-document"].includes(currentView);
  // Pause in background tabs and stop when this game instance ends.
  useEffect(() => {
    // The <audio> elements are always rendered, so their refs are set before effects run.
    const music = musicRef.current!;
    const nextMusic = nextMusicRef.current!;
    if (!gameStarted) return;
    const update = () => {
      if (document.hidden) music.pause();
      else music.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
      music.pause();
      nextMusic.removeAttribute("src");
      nextMusic.load();
    };
  }, [gameStarted]);

  useEffect(() => {
    const hum = humRef.current!;
    if (!humming) return;
    playSound(hum, SOUND_EFFECT_VOLUME * 0.3);
    return () => {
      hum.pause();
      hum.currentTime = 0;
    };
  }, [humming]);
  // The tower's one-shot hum is only for its text box.
  useEffect(() => {
    const towerHum = extraSounds.current["computer-hum"];
    if (dialog || !towerHum) return;
    towerHum.pause();
    towerHum.currentTime = 0;
  }, [dialog]);

  function inspect(id: string) {
    if (moving || inspectionHistory.at(-1) === id) return;
    if (["door-front", "safe-keypad", "desk"].includes(id))
      playSound(movementSoundRef.current);
    if (id === "peephole") playSound(doorHoleSoundRef.current);
    if (id === "desk-note") playSound(noteSoundRef.current);
    if (id === "computer-monitor") playCue("computer-nav");
    if (id === "password-document") playCue("computer-click");
    if (!inspecting) inspectionOriginRef.current = document.activeElement;
    transitionActionRef.current = () =>
      setInspectionHistory([...inspectionHistory, id]);
    setTransition("out");
  }

  function target(id: string) {
    if (blocked) return;
    if (
      NAVIGATION_TARGETS.includes(id) &&
      (!game.selected || ["desk", "door-front", "safe-front"].includes(id))
    ) {
      inspect(id);
      return;
    }
    if (dialogImage(id, game.progress)) {
      focusAfterMove.current = document.activeElement;
      transitionActionRef.current = () => interactWithProp(id);
      setTransition("out");
      return;
    }
    interactWithProp(id);
  }

  function interactWithProp(id: string) {
    const result = game.act(id);
    if (result?.sound !== "item-mystery") playCue(result?.sound);
    if (result?.sound === "usb-in") playCue("computer-activate");
    if (result?.sound === "door-locked") playSound(doorLockedSoundRef.current);
    if (result?.sound === "door-bottom") playSound(doorBottomSoundRef.current);
    if (result?.sound === "item-mystery")
      playSound(itemMysterySoundRef.current);
    if (result?.sound === "peaking-guy") playSound(giantSoundRef.current);
    if (result?.sound === "item-mystery-2") playSound(holeSoundRef.current);
    if (result?.sound === "item-mystery-5")
      playSound(holeReminderSoundRef.current);
    if (result?.sound === "you") playSound(figureSoundRef.current);
    if (result?.sound === "plant-2") playSound(plantSoundRef.current);
    if (result?.sound === "plant-1") playSound(threadSoundRef.current);
    if (result?.sound === "detection-click-2") playSound(stoolSoundRef.current);
    if (result?.sound === "safe-open") playSound(safeOpenSoundRef.current);
    if (result?.sound === "lamp-on" || result?.sound === "lamp-off") {
      lampOnSoundRef.current?.pause();
      lampOffSoundRef.current?.pause();
      playSound(
        result.sound === "lamp-on"
          ? lampOnSoundRef.current
          : lampOffSoundRef.current,
      );
    }
    if (result?.sound === "zap-1") playSound(zapSoundRef.current);
    if (result?.sound === "zap-2") playSound(wallLightSoundRef.current);
    if (result?.view) inspect(result.view);
  }

  const backFromInspection = useCallback(() => {
    if (blocked || !inspectionHistory.length) return;
    if (
      ["computer-monitor", "password-document"].includes(
        // Non-empty: checked above.
        inspectionHistory.at(-1)!,
      )
    )
      playCue("computer-click-back");
    else playSound(movementSoundRef.current);
    transitionActionRef.current = () =>
      setInspectionHistory(inspectionHistory.slice(0, -1));
    focusAfterMove.current = inspectionOriginRef.current;
    setTransition("out");
  }, [blocked, inspectionHistory, playCue]);

  useEffect(() => {
    if (!gameStarted || moving || dialog || sequence || (!selected && !inspecting))
      return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (selected) {
          playCue("click-soft");
          deselect();
        } else if (inspecting) backFromInspection();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    gameStarted,
    moving,
    inspecting,
    backFromInspection,
    dialog,
    sequence,
    selected,
    deselect,
    playCue,
  ]);

  useEffect(() => {
    if (transition === "idle") return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Change artwork and layout only once the curtain is fully dark.
    const duration = transition === "start-out"
      ? START_FADE_OUT_MS + 50
      : transition === "start-in"
        ? START_HOLD_MS + START_FADE_IN_MS
        : transition === "out" ? ROOM_FADE_MS + 40 : 650;
    const timer = window.setTimeout(
      () => {
        if (transition === "start-out") {
          setGameStarted(true);
          setTransition("start-in");
        } else if (transition === "out") {
          const action = transitionActionRef.current;
          transitionActionRef.current = null;
          action?.();
          setTransition("in");
        } else {
          setTransition("idle");
        }
      },
      reduceMotion ? 0 : duration,
    );
    return () => window.clearTimeout(timer);
  }, [transition, setGameStarted]);

  useEffect(() => {
    if (gameStarted && !moving && !game.dialog && !game.sequence) {
      const target = inspecting
        ? inspectionBackRef.current
        : focusOnStart.current
          ? rightArrowRef.current
          : focusAfterMove.current;
      if (target instanceof HTMLElement) target.focus({ preventScroll: true });
      focusOnStart.current = false;
      focusAfterMove.current = null;
    }
  }, [gameStarted, moving, inspecting, game.dialog, game.sequence]);

  function startGame() {
    if (!ready || moving) return;
    // Start from the click, before effects run, to unlock audio on mobile Safari.
    playSound(musicRef.current, MUSIC_VOLUME);
    playSound(movementSoundRef.current);
    focusOnStart.current = true;
    setNavOpen(false);
    setTransition("start-out");
  }

  function turn(direction: number, button: HTMLButtonElement) {
    if (blocked) return;
    focusAfterMove.current = button;
    transitionActionRef.current = () => {
      setRoomIndex((roomIndex + direction + ROOMS.length) % ROOMS.length);
      setInspectionHistory([]);
    };
    setTransition("out");
  }

  function finishSequence() {
    if (game.sequence?.type === "ending") {
      onExit();
      return;
    }
    if (game.sequence?.type === "repair") {
      setRoomIndex(3);
      setInspectionHistory([]);
      focusAfterMove.current = rightArrowRef.current;
    }
    game.finishSequence();
  }

  function answerTopic(topic: TopicId | "help") {
    if (game.dialog?.kind !== "conversation") return;
    answerTwoSoundRef.current?.pause();
    playSound(
      topic === "help"
        ? itemMysterySoundRef.current
        : answerTwoSoundRef.current,
    );
    game.talk(topic);
  }

  function closeDialog() {
    if (!game.dialog || moving) return;
    playSound(textCloseSoundRef.current);
    if (dialogCloseup) {
      transitionActionRef.current = game.closeDialog;
      setTransition("out");
      return;
    }
    game.closeDialog();
  }

  function playClickSound(event: MouseEvent<HTMLElement>) {
    if (!gameStarted || blocked) return;
    const element = event.target;
    if (!(element instanceof Element)) return;
    let sound;
    if (element.closest('[data-game-sound="move"]')) {
      sound = movementSoundRef.current;
    } else if (element.closest('[data-game-sound="keypad-button"]')) {
      sound = keypadButtonSoundRef.current;
    } else if (
      !element.closest(
        "button, a, input, textarea, select, summary, dialog, aside",
      )
    ) {
      sound = detectionSoundRef.current;
    }
    playSound(sound);
  }

  return (
    <section
      ref={gameRef}
      className={styles.game}
      aria-label="Red Game"
      onContextMenu={(event) => {
        if (gameStarted) event.preventDefault();
      }}
      onClick={playClickSound}
      data-transition={transition}
      data-playing={gameStarted}
      data-holding-item={Boolean(game.selected)}
      data-dialog-source={dialog?.art?.roomProp}
      // CSSProperties has no custom properties, hence the cast.
      style={{ "--room-fade-duration": `${ROOM_FADE_MS}ms` } as CSSProperties}
    >
      <audio
        ref={musicRef}
        src={MUSIC_TRACKS[0]}
        preload="metadata"
        onTimeUpdate={(event) => {
          // Short sessions only need track 1; let the browser load track 2 after a minute.
          if (!preloadSecondTrack && event.currentTarget.currentTime >= 60) {
            setPreloadSecondTrack(true);
          }
        }}
        onEnded={(event) => {
          musicTrack.current = musicTrack.current === 0 ? 1 : 0;
          // Reuse the audio element unlocked by the start click on mobile Safari.
          event.currentTarget.src = MUSIC_TRACKS[musicTrack.current];
          if (!document.hidden) playSound(event.currentTarget, MUSIC_VOLUME);
        }}
        hidden
      />
      <audio
        ref={nextMusicRef}
        src={preloadSecondTrack ? MUSIC_TRACKS[1] : undefined}
        preload="auto"
        hidden
      />
      <audio
        ref={detectionSoundRef}
        src={`${GAME_CDN}/sounds/detection-click-1.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={movementSoundRef}
        src={`${GAME_CDN}/sounds/move-2.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={keypadButtonSoundRef}
        src={`${GAME_CDN}/sounds/keypad-button.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={doorLockedSoundRef}
        src={`${GAME_CDN}/sounds/door-locked.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={doorBottomSoundRef}
        src={`${GAME_CDN}/sounds/door-bottom.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={doorHoleSoundRef}
        src={`${GAME_CDN}/sounds/door-hole.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={textCloseSoundRef}
        src={`${GAME_CDN}/sounds/click-close.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={itemMysterySoundRef}
        src={`${GAME_CDN}/sounds/item-mystery.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={giantSoundRef}
        src={`${GAME_CDN}/sounds/peaking-guy.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={holeSoundRef}
        src={`${GAME_CDN}/sounds/item-mystery-2.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={holeReminderSoundRef}
        src={`${GAME_CDN}/sounds/item-mystery-5.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={answerTwoSoundRef}
        src={`${GAME_CDN}/sounds/answer-2.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={figureSoundRef}
        src={`${GAME_CDN}/sounds/you.mp3?v=2`}
        preload="auto"
        hidden
      />
      <audio
        ref={plantSoundRef}
        src={`${GAME_CDN}/sounds/plant-2.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={threadSoundRef}
        src={`${GAME_CDN}/sounds/plant-1.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={noteSoundRef}
        src={`${GAME_CDN}/sounds/note.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={stoolSoundRef}
        src={`${GAME_CDN}/sounds/detection-click-2.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={safeOpenSoundRef}
        src={`${GAME_CDN}/sounds/safe-open.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={lampOnSoundRef}
        src={`${GAME_CDN}/sounds/lamp-on.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={lampOffSoundRef}
        src={`${GAME_CDN}/sounds/lamp-off.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={zapSoundRef}
        src={`${GAME_CDN}/sounds/zap-1.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={wallLightSoundRef}
        src={`${GAME_CDN}/sounds/zap-2.mp3`}
        preload="auto"
        hidden
      />
      <audio
        ref={humRef}
        src={`${GAME_CDN}/sounds/computer-hum.mp3`}
        preload="auto"
        loop
        hidden
      />
      {Object.entries(EXTRA_SOUNDS).map(([id, extension]) => (
        <audio
          key={id}
          ref={(element) => {
            extraSounds.current[id] = element;
          }}
          src={`${GAME_CDN}/sounds/${id}.${extension}`}
          preload="auto"
          hidden
        />
      ))}
      {/* Decode game views in advance, but only reveal them after Play. */}
      {ROOMS.map((view) => (
        <div
          key={view.id}
          className={styles.view}
          data-active={gameStarted && view.id === room.id && !inspecting}
          aria-hidden={!gameStarted || view.id !== room.id || inspecting}
          inert={blocked || view.id !== room.id || inspecting || !gameStarted}
        >
          <RoomScene
            room={view}
            active={gameStarted && view.id === room.id && !inspecting}
            playing={gameStarted}
            moving={blocked}
            onReady={onRoomReady}
            onInspect={target}
            progress={game.progress}
          />
        </div>
      ))}
      {inspecting && (
        <PropCloseup
          history={inspectionHistory}
          room={room}
          moving={blocked}
          backRef={inspectionBackRef}
          onInspect={target}
          onNavigate={inspect}
          onBack={backFromInspection}
          game={game}
          onSound={playCue}
          onSubmitCode={(code) => playCue(game.submitCode(code)?.sound)}
        />
      )}
      {dialogCloseup && <FinalImage name={dialogCloseup} className={styles.detailScene} />}
      <div className={styles.curtain} aria-hidden="true" />
      {/* Stay above the website header and outside the game's changing square bounds. */}
      {starting && createPortal(
        <div
          className={styles.startCurtain}
          data-phase={transition}
          aria-hidden="true"
          style={{
            "--start-out": `${START_FADE_OUT_MS}ms`,
            "--start-hold": `${START_HOLD_MS}ms`,
            "--start-in": `${START_FADE_IN_MS}ms`,
          } as CSSProperties}
        />,
        document.body,
      )}

      {!gameStarted ? (
        renderStart({ onStart: startGame, disabled: !ready || moving, failed })
      ) : (
        <>
          <p className={styles.srOnly} role="status">
            {!inspecting && room.name}
          </p>
          {!inspecting && !dialogCloseup && (
            <nav
              className={styles.navigation}
              aria-label="Room views"
              aria-busy={moving}
            >
              <button
                className={`${styles.arrow} ${styles.left}`}
                aria-label="Turn left"
                data-game-sound="move"
                onClick={(event) => turn(-1, event.currentTarget)}
                disabled={blocked}
              >
                <img
                  {...artSources(`${GAME_CDN}/navigation/arrow-left.webp`)}
                  alt=""
                  width={1254}
                  height={1254}
                  draggable={false}
                />
              </button>
              <button
                ref={rightArrowRef}
                className={`${styles.arrow} ${styles.right}`}
                aria-label="Turn right"
                data-game-sound="move"
                onClick={(event) => turn(1, event.currentTarget)}
                disabled={blocked}
              >
                <img
                  {...artSources(
                    `${GAME_CDN}/navigation/arrow-right.webp`,
                  )}
                  alt=""
                  width={1254}
                  height={1254}
                  draggable={false}
                />
              </button>
              {room.id === "computer" && (
                <button
                  className={`${styles.arrow} ${styles.up}`}
                  aria-label="Look at the sky"
                  data-game-sound="move"
                  onClick={() => target("sky")}
                  disabled={blocked}
                >
                  <img
                    {...artSources(`${GAME_CDN}/navigation/arrow-up.webp`)}
                    alt=""
                    width={1254}
                    height={1254}
                    draggable={false}
                  />
                </button>
              )}
            </nav>
          )}
          <Inventory game={game} disabled={blocked} onSound={playCue} />
          {/* Native modal dialogs sit above the curtain, so open after the reveal. */}
          {game.dialog && !moving && (
            <GameDialog
              game={game}
              onClose={closeDialog}
              onTalk={answerTopic}
              onSound={playCue}
            />
          )}
          {game.sequence && (
            <GameSequence
              type={game.sequence.type}
              onFinish={finishSequence}
              onSound={playCue}
            />
          )}
        </>
      )}
    </section>
  );
}
