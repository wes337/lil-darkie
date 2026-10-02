import manifest from "@/public/red-game/final/manifest.json";
import { FINAL_ART, ITEM_ART } from "./final-art.mjs";
import styles from "@/styles/room-props.module.scss";

// Inventory and award dialogs share the artist's transparent item renders.
export function Prop({ asset, className = "" }) {
  const name = ITEM_ART[asset];
  const image = manifest.assets[name];
  return (
    <span
      className={`${styles.sprite} ${className}`}
      data-asset={asset}
      style={{ aspectRatio: `${image.width} / ${image.height}`, "--prop-ratio": image.width / image.height }}
      aria-hidden="true"
    >
      <picture>
        {name === "wisp" && <source media="(prefers-reduced-motion: reduce)" srcSet={`${FINAL_ART}wisp-still.webp`} />}
        <img src={image.src} alt="" width={image.width} height={image.height} draggable={false} />
      </picture>
    </span>
  );
}
