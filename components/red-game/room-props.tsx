import manifest from "@/public/red-game/final/manifest.json";
import type { CSSProperties } from "react";
import { FINAL_ART, ITEM_ART, type ItemArtId } from "./final-art";
import styles from "@/styles/room-props.module.scss";

// Inventory and award dialogs share the artist's transparent item renders.
export function Prop({
  asset,
  className = "",
}: {
  asset: ItemArtId;
  className?: string;
}) {
  const name = ITEM_ART[asset];
  const image = manifest.assets[name];
  return (
    <span
      className={`${styles.sprite} ${className}`}
      data-asset={asset}
      // CSSProperties has no custom properties, hence the cast.
      style={{ aspectRatio: `${image.width} / ${image.height}`, "--prop-ratio": image.width / image.height } as CSSProperties}
      aria-hidden="true"
    >
      <picture>
        {name === "wisp" && <source media="(prefers-reduced-motion: reduce)" srcSet={`${FINAL_ART}wisp-still.webp`} />}
        <img src={image.src} alt="" width={image.width} height={image.height} draggable={false} />
      </picture>
    </span>
  );
}
