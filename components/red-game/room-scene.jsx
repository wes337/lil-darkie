"use client";

import { useEffect, useRef, useState } from "react";
import RoomProps from "./room-props";
import { randomizeHoverTilt } from './hover-motion';
import styles from "@/styles/room-scene.module.scss";

export default function RoomScene({ room, active, playing, moving, onReady, onInspect, progress }) {
  const assetPath = `/images/red-game/${room.assets}`;
  const isMain = room.id === "main";
  const sceneRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const images = [...sceneRef.current.querySelectorAll("img")];

    // Decode every layer before exposing the view, so turns never reveal partial artwork.
    Promise.allSettled(images.map((image) => image.decode())).then(() => {
      if (!cancelled) {
        setReady(true);
        onReady(room.id, images.every((image) => image.naturalWidth > 0));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [room, onReady]);

  return (
    <div
      ref={sceneRef}
      className={styles.scene}
      data-ready={ready}
      data-room={room.id}
      data-framing={room.framing}
      data-active={active}
      data-playing={playing}
      role="group"
      aria-label={room.description}
    >
      {room.framing === "room" && <img
        className={styles.stars}
        src={`${assetPath}/stars.png`}
        alt=""
        width={1254}
        height={1254}
        draggable={false}
      />}
      {isMain && (
        <div className={styles.giantBack}>
          <img
            src={`${assetPath}/peeking-giant.png`}
            alt=""
            width={1254}
            height={1254}
            draggable={false}
          />
          <button className={styles.giantHotspot} aria-label="Look at the giant" disabled={!active || !playing || moving} onPointerEnter={(event) => randomizeHoverTilt(event, sceneRef.current)} onClick={() => onInspect('giant')} />
        </div>
      )}
      <img
        className={styles.room}
        src={`${assetPath}/room.png`}
        alt=""
        width={1254}
        height={1254}
        fetchPriority={isMain ? "high" : "low"}
        draggable={false}
      />
      {/* The same cutout places the hand over the wall while the head stays behind it. */}
      {isMain && (
        <>
          <div className={styles.giantHand} aria-hidden="true">
            <img
              src={`${assetPath}/peeking-giant.png`}
              alt=""
              width={1254}
              height={1254}
              draggable={false}
            />
          </div>
          <div className={styles.figure} onPointerEnter={active && playing && !moving ? randomizeHoverTilt : undefined}>
            <img src={`${assetPath}/room-figure.png`} alt="" width={1254} height={1254} draggable={false} />
            <button className={styles.figureHotspot} aria-label="Look at yourself" disabled={!active || !playing || moving} onClick={() => onInspect('figure')} />
          </div>
        </>
      )}
      <RoomProps room={room} interactive={active && playing && !moving} onInspect={onInspect} progress={progress} />
    </div>
  );
}
