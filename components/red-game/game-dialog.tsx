import { useEffect, useRef, useState } from "react";
import { TOPICS } from "./game-content";
import type { TopicId } from "./game-model";
import type { Game } from "./use-game";
import { Prop } from "./room-props";
import { GAME_CDN, artSources } from "./art";
import styles from "@/styles/game-ui.module.scss";

export default function GameDialog({
  game,
  onClose,
  onTalk,
  onSound,
}: {
  game: Game;
  onClose: () => void;
  onTalk: (topic: TopicId | "help") => void;
  onSound: (id: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const answerRef = useRef<HTMLParagraphElement>(null);
  const [page, setPage] = useState(0);
  const [activeTopic, setActiveTopic] = useState<TopicId | "help" | null>(null);
  // Picked once per open so the backdrop art doesn't wobble between pages.
  const [artTilt] = useState(() => Math.random() * 6 - 3);
  // Only mounted while a dialog is open.
  const dialog = game.dialog!;
  useEffect(() => {
    // The <dialog> is always rendered, so its ref is set before effects run.
    const element = ref.current!;
    const origin = document.activeElement;
    element.showModal();
    // showModal focuses the close button, which mobile Safari rings even after a tap.
    // Start on the message instead; the ring still shows when the button is tabbed to.
    answerRef.current?.focus({ preventScroll: true });
    return () => {
      element.close();
      if (
        origin instanceof HTMLElement &&
        origin.isConnected &&
        !origin.closest("[inert]")
      )
        origin.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    setPage(0);
  }, [dialog]);
  useEffect(() => {
    if (activeTopic) answerRef.current?.focus({ preventScroll: true });
  }, [activeTopic]);
  const messages = dialog.messages || [];
  const lastPage = page >= messages.length - 1;
  // Chosen by the store (see `dialogArt` in use-game.ts).
  const art =
    dialog.art && page >= dialog.art.fromPage ? dialog.art.asset : null;
  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label={
        dialog.kind === "conversation"
          ? "A voice in the hole"
          : "Red Game message"
      }
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") event.stopPropagation();
      }}
    >
      {art && (
        <div className={styles.dialogArt} style={{ rotate: `${artTilt}deg` }}>
          <Prop asset={art} />
        </div>
      )}
      <button
        className={styles.close}
        aria-label="Close text box"
        onClick={onClose}
      >
        <img
          {...artSources(`${GAME_CDN}/navigation/close-x.webp`)}
          alt=""
          width={1254}
          height={1254}
          draggable={false}
        />
      </button>
      <div className={styles.dialogBody}>
        {messages.length > 0 && (
          <p ref={answerRef} tabIndex={-1} aria-live="polite">
            {messages[Math.min(page, messages.length - 1)]}
          </p>
        )}
        {!lastPage && (
          <button
            className={styles.textButton}
            onClick={() => {
              onSound(dialog.pageSounds?.[page + 1] || "text");
              setPage(page + 1);
            }}
          >
            Continue
          </button>
        )}
        {dialog.kind === "conversation" && (
          <div className={styles.choices}>
            {/* Object.entries widens the keys to string; they are exactly the topic ids. */}
            {(Object.entries(TOPICS) as [TopicId, (typeof TOPICS)[TopicId]][])
              .filter(([id]) => id !== activeTopic)
              .map(([id, topic]) => (
                <button
                  key={id}
                  className={styles.textButton}
                  data-topic={id}
                  data-visited={game.progress.topics.includes(id)}
                  onClick={() => {
                    setActiveTopic(id);
                    onTalk(id);
                  }}
                >
                  {topic.label}
                </button>
              ))}
            {game.progress.topics.length === 3 && (
              <button
                className={styles.textButton}
                onClick={() => {
                  setActiveTopic("help");
                  onTalk("help");
                }}
              >
                Can you help me?
              </button>
            )}
          </div>
        )}
      </div>
    </dialog>
  );
}
