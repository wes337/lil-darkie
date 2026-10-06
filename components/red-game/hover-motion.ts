import type { PointerEvent } from "react";

/** Choose a fresh tilt on pointer entry without moving the object's hit area. */
export function randomizeHoverTilt(
  event: PointerEvent<HTMLElement>,
  target = event.currentTarget,
) {
  if (event.pointerType === "touch") return;
  target.style.setProperty(
    "--hover-tilt",
    `${(Math.random() - 0.5).toFixed(2)}deg`,
  );
}
