import { useEffect, useRef, useState } from "react";
import { playSound } from "./audio";
import type { Game } from "./use-game";
import styles from "@/styles/game-sequence.module.scss";
import { GAME_CDN } from "./art";

const CAN_SKIP_ANIMATION = process.env.NODE_ENV === "development";
const ENDING_SOUNDS = {
  4: "Starrynight_C_1 (99Sounds).mp3",
  5: "Starrynight_C_5 (99Sounds).mp3",
  6: "Starrynight_G_5 (99Sounds).mp3",
};

export default function GameSequence({
  type,
  onFinish,
  onSound,
}: {
  type: NonNullable<Game["sequence"]>["type"];
  onFinish: () => void;
  onSound: (id: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const doorSoundPlayed = useRef(false);
  const returnButton = useRef<HTMLButtonElement>(null);
  const endingSounds = useRef<Record<string, HTMLAudioElement | null>>({});
  const finish = useRef(onFinish);
  finish.current = onFinish;

  useEffect(() => {
    // The root <section> is always rendered.
    root.current!.focus({ preventScroll: true });
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  useEffect(() => {
    if (type !== "repair") return;
    // A missing or stalled image must not keep the inventory award locked.
    const timer = window.setTimeout(() => setReady(true), 3000);
    return () => window.clearTimeout(timer);
  }, [type]);

  useEffect(() => {
    if (type !== "repair" || !ready) return;
    onSound("bear-repaired");
    const timer = window.setTimeout(() => finish.current(), 1800);
    return () => window.clearTimeout(timer);
  }, [type, ready, onSound]);

  useEffect(() => {
    if (type !== "ending" || step !== 0 || reducedMotion === null) return;
    if (reducedMotion) {
      setStep(4);
      return;
    }

    let cancelled = false;
    const showTitles = () => {
      if (!cancelled) setStep((current) => Math.max(current, 4));
    };
    // The <video> is rendered whenever motion is allowed at step 0, which is the case here.
    video.current!.play().catch(showTitles);
    // The film lasts about ten seconds. Continue if playback stalls entirely.
    const timer = window.setTimeout(showTitles, 30000);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [type, step, reducedMotion]);

  useEffect(() => {
    if (type !== "ending" || step < 4 || step >= 6) return;
    const timer = window.setTimeout(() => setStep(step + 1), 3700);
    return () => window.clearTimeout(timer);
  }, [type, step]);

  useEffect(() => {
    if (step === 6) returnButton.current?.focus({ preventScroll: true });
  }, [step]);

  useEffect(() => {
    if (type !== "ending") return;
    const sound = endingSounds.current[step];
    if (!sound) return;
    playSound(sound);
    return () => sound.pause();
  }, [type, step]);

  return (
    <section
      ref={root}
      className={styles.sequence}
      data-type={type}
      data-step={step}
      tabIndex={-1}
      aria-label={type === "repair" ? "Mending Bambi" : "Leaving the room"}
      onKeyDown={
        CAN_SKIP_ANIMATION
          ? (event) => {
              if (event.key === "Escape" && type === "ending") {
                event.stopPropagation();
                setStep(6);
              }
            }
          : undefined
      }
    >
      {type === "repair" ? (
        <img
          className={styles.scene}
          src={`${GAME_CDN}/final/sink-teddy.webp`}
          alt="Bambi sits upright with his belly mended."
          draggable={false}
          onLoad={() => setReady(true)}
          onError={() => setReady(true)}
        />
      ) : (
        <>
          {Object.entries(ENDING_SOUNDS).map(([soundStep, filename]) => (
            <audio
              key={soundStep}
              ref={(element) => {
                endingSounds.current[soundStep] = element;
              }}
              src={`${GAME_CDN}/sounds/${filename}`}
              preload="auto"
              hidden
            />
          ))}
          <img
            className={styles.scene}
            src={`${GAME_CDN}/final/ending-end.webp`}
            aria-hidden={step < 4}
            alt={
              step === 6
                ? "The field and sky turn red."
                : "A bright field beneath a blue sky."
            }
            draggable={false}
          />
          {step === 0 && (
            <img
              className={styles.scene}
              src={`${GAME_CDN}/final/ending-start.webp`}
              alt="The door opens onto a bright field."
              draggable={false}
            />
          )}
          {reducedMotion === false && step === 0 && (
            <video
              ref={video}
              className={styles.scene}
              src={`${GAME_CDN}/final/ending.mp4`}
              poster={`${GAME_CDN}/final/ending-start.webp`}
              muted
              playsInline
              preload="auto"
              aria-label="The door opens and you step outside into the field."
              onPlay={() => {
                if (doorSoundPlayed.current) return;
                doorSoundPlayed.current = true;
                onSound("door-open");
              }}
              onEnded={() => setStep((current) => Math.max(current, 4))}
              onError={() => setStep((current) => Math.max(current, 4))}
            />
          )}
          <div className={styles.shade} />
          <p className={styles.endingText} aria-live="polite" key={step}>
            {step === 4
              ? "YOU ARE FREE"
              : step === 5
                ? "YOU ALWAYS HAVE BEEN"
                : step >= 6
                  ? "red"
                  : ""}
          </p>
          {step < 6 && CAN_SKIP_ANIMATION && (
            <button className={styles.skip} onClick={() => setStep(6)}>
              Skip animation
            </button>
          )}
          {step >= 6 && (
            <button
              ref={returnButton}
              className={styles.return}
              onClick={onFinish}
            >
              EXIT
            </button>
          )}
        </>
      )}
    </section>
  );
}
