import type { ComponentProps } from "react";
import { FINAL_ART, type Rect } from "./final-art";
import styles from "@/styles/room-scene.module.scss";

export default function FinalImage({
  name,
  className = "",
  ...props
}: { name: string } & ComponentProps<"img">) {
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

export function Hotspot({
  target,
  label,
  rect,
  onInspect,
  disabled = false,
}: {
  target: string;
  label: string;
  rect: Rect;
  onInspect: (target: string) => void;
  disabled?: boolean;
}) {
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
