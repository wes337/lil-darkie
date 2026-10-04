"use client";

import { useEffect, useRef, useState } from "react";
import { artSources } from "./art";
import styles from "@/styles/landing-scene.module.scss";

const ART_PATH = "/images/red-game/main-room/";

// The website keeps the original layered painting; gameplay uses the Final renders.
export default function LandingScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // The scene <div> is always rendered, so its ref is set before effects run.
    const images = [...sceneRef.current!.querySelectorAll("img")];
    Promise.allSettled(images.map((image) => image.decode())).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current!;
    const motion = window.matchMedia(
      "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)",
    );
    const move = (event: PointerEvent) => {
      if (!motion.matches || event.pointerType !== "mouse") return;
      scene.style.setProperty("--parallax-x", ((event.clientX / window.innerWidth) * 2 - 1).toFixed(3));
      scene.style.setProperty("--parallax-y", ((event.clientY / window.innerHeight) * 2 - 1).toFixed(3));
    };
    const update = () => {
      scene.dataset.parallax = motion.matches ? "on" : "off";
      scene.style.removeProperty("--parallax-x");
      scene.style.removeProperty("--parallax-y");
    };
    update();
    window.addEventListener("pointermove", move);
    motion.addEventListener("change", update);
    return () => {
      window.removeEventListener("pointermove", move);
      motion.removeEventListener("change", update);
    };
  }, []);

  return (
    <div className={styles.backdrop}>
      <div
        ref={sceneRef}
        className={styles.scene}
        data-ready={ready}
        role="img"
        aria-label="A painting of a red room under a starry sky, with a giant peeking over the wall and a many-armed figure inside."
      >
        <img className={styles.stars} {...artSources(`${ART_PATH}stars.webp`)} alt="" width={1254} height={1254} draggable={false} />
        <div className={styles.giantBack}>
          <img {...artSources(`${ART_PATH}peeking-giant.webp`)} alt="" width={1254} height={1254} draggable={false} />
        </div>
        <img className={styles.room} {...artSources(`${ART_PATH}room.webp`)} alt="" width={1254} height={1254} fetchPriority="high" draggable={false} />
        {/* A second cutout puts the hand in front of the wall. */}
        <div className={styles.giantHand} aria-hidden="true">
          <img {...artSources(`${ART_PATH}peeking-giant.webp`)} alt="" width={1254} height={1254} draggable={false} />
        </div>
        <div className={styles.figure}>
          <img {...artSources(`${ART_PATH}room-figure.webp`)} alt="" width={1254} height={1254} draggable={false} />
        </div>
      </div>
    </div>
  );
}
