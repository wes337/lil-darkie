"use client";

import { useEffect, useRef } from "react";
import FinalImage, { Hotspot } from "./final-image";
import { FINAL_ART, ROOM_TARGETS, roomImage } from "./final-art.mjs";
import styles from "@/styles/room-scene.module.scss";

export default function RoomScene({ room, active, playing, moving, onReady, onInspect, progress }) {
  const video = useRef(null);
  const image = useRef(null);
  const imageName = roomImage(room.id, progress);
  useEffect(() => {
    let cancelled = false;
    image.current.decode().then(
      () => { if (!cancelled) onReady(room.id, true); },
      () => { if (!cancelled) onReady(room.id, false); },
    );
    return () => { cancelled = true; };
  }, [imageName, room.id, onReady]);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (active && !document.hidden && !motion.matches) element.play().catch(() => {});
      else element.pause();
    };
    update();
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      element.pause();
      motion.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [active]);

  return (
    <div className={styles.scene} data-room={room.id} role="group" aria-label={room.description}>
      <FinalImage
        ref={image}
        name={imageName}
        fetchPriority={room.id === "main" ? "high" : "auto"}
      />
      {room.id === "main" && (
        <video ref={video} className={styles.idle} src={`${FINAL_ART}room-idle.mp4`} muted loop playsInline preload="none" aria-hidden="true" />
      )}
      {ROOM_TARGETS[room.id]
        .filter(([target]) => target !== "bear-ripped" || progress.bear !== "collected")
        .map(([target, label, ...rect]) => (
          <Hotspot key={target} target={target} label={label} rect={rect} onInspect={onInspect} disabled={!active || !playing || moving} />
        ))}
    </div>
  );
}
