import { GAME_CDN } from "./art.ts";
import type { Progress } from "./game-model.ts";

export const FINAL_ART = `${GAME_CDN}/final/`;

// The renders and hotspots share the same square coordinates on every screen.
export function roomImage(room: RoomId, progress: Progress) {
  if (room === "main") return "room-idle";
  if (room === "safe")
    return progress.water === "spent" ? "room-safe-bloomed" : "room-safe";
  if (room === "sink")
    return progress.bear === "collected" ? "room-sink" : "room-sink-teddy-torn";
  const computer = progress.usbInserted
    ? "room-computer-on"
    : ["threaded", "used"].includes(progress.sewing)
      ? "room-computer"
      : "room-computer-thread";
  return `${computer}${progress.lampOn ? "-lit" : ""}`;
}

export function safeImage(progress: Progress) {
  if (progress.keyTaken && progress.cdTaken) return "safe-empty";
  if (progress.keyTaken) return "safe-disc";
  if (progress.cdTaken) return "safe-key";
  return "safe-open";
}

export const ITEM_ART = {
  "imaginary-friend": "wisp",
  "bear-repaired": "item-teddy",
  "bear-ripped": "item-teddy-torn",
  "glass-empty": "item-glass",
  "glass-half-full": "item-water",
  "usb-stick": "item-usb",
  cd: "item-disc",
  key: "item-key",
  needle: "item-needle",
  "needle-and-thread": "item-needle-thread",
  "thread-spool": "item-thread",
} as const;
export type ItemArtId = keyof typeof ITEM_ART;

// Hotspot positions, as percentages of the square render.
export type Rect = [left: number, top: number, width: number, height: number];
type RoomTarget = [target: string, label: string, ...rect: Rect];

export const ROOM_TARGETS = {
  main: [
    ["door-front", "Inspect doorway", 8, 34, 18, 49],
    ["giant", "Look at the giant", 43, 0, 45, 29],
    ["figure", "Look at yourself", 50, 54, 42, 44],
  ],
  safe: [
    ["safe-front", "Inspect the safe", 11, 22, 42, 26],
    ["flower-wilted", "Inspect the flower", 64, 37, 23, 26],
    ["stool", "Inspect the stool", 64, 61, 25, 30],
    ["mouse-hole", "Look into the mouse hole", 10, 76, 17, 20],
  ],
  computer: [
    ["desk", "Inspect computer desk", 11, 42, 46, 40],
    ["floor-lamp-off", "Toggle standing lamp", 69, 36, 22, 47],
  ],
  sink: [
    ["wall-light", "Inspect wall light", 25, 4, 49, 12],
    ["cracked-mirror", "Inspect cracked mirror", 33, 22, 31, 38],
    ["sink", "Inspect the sink", 31, 60, 35, 35],
    ["bear-ripped", "Inspect the ripped bear", 73, 70, 25, 29],
  ],
} satisfies Record<string, RoomTarget[]>;
export type RoomId = keyof typeof ROOM_TARGETS;

export function dialogImage(target: string | undefined, progress: Progress) {
  switch (target) {
    case "mouse-hole":
      return progress.friend === "returned" ? "mousehole-teddy" : "mousehole";
    case "flower-wilted":
    case "stool":
      return progress.water === "spent" ? "flower-bloomed" : "flower-wilted";
    case "bear-ripped":
      return progress.bear === "collected" ? "sink-floor" : "sink-teddy-torn";
    case "sink":
      return progress.water === "full" ? "sink-on" : "sink-off";
    case "doorknob": return "door-lock";
    case "door-frame": return progress.sewing === "hidden" ? "door-upper" : "door-upper-alternate";
    case "door-crack": return "door-bottom";
    case "thread-spool": return "thread-closeup";
    default: return null;
  }
}
