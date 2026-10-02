import { FINAL_ART } from "./final-art.mjs";
import styles from "@/styles/room-scene.module.scss";

export default function FinalImage({ name, className = "", ...props }) {
  return (
    <img
      className={`${styles.render} ${className}`}
      src={`${FINAL_ART}${name}.webp`}
      alt=""
      width={1080}
      height={1080}
      draggable={false}
      {...props}
    />
  );
}

export function Hotspot({ target, label, rect, onInspect, disabled = false }) {
  const [left, top, width, height] = rect;
  return (
    <button
      type="button"
      className={styles.hotspot}
      style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
      aria-label={label}
      disabled={disabled}
      onClick={() => onInspect(target)}
    />
  );
}
