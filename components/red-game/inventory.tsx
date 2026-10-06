import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ITEMS } from "./game-content";
import { inventory } from "./game-model";
import type { ItemArtId } from "./final-art";
import type { Game } from "./use-game";
import { Prop } from "./room-props";
import styles from "@/styles/game-ui.module.scss";

type Point = { x: number; y: number };

export default function Inventory({
  game,
  disabled,
  onSound,
}: {
  game: Game;
  disabled: boolean;
  onSound: (id: string) => void;
}) {
  // Where the selecting click happened, so the held item starts under the cursor.
  const [grabbedAt, setGrabbedAt] = useState<Point | null>(null);
  const items = inventory(game.progress);
  if (!items.length || game.sequence) return null;
  return (
    <aside className={styles.inventory} aria-label="Inventory" inert={disabled}>
      <div className={styles.items}>
        {items.map((id) => (
          <button
            key={id}
            className={styles.item}
            aria-label={`Use ${ITEMS[id].name}`}
            aria-pressed={game.selected === id}
            onClick={(event) => {
              onSound(game.selected === id ? "click-soft" : "item-inv-2");
              // Keyboard clicks have no position (detail 0); the item then appears on the next mouse move.
              setGrabbedAt(
                event.detail ? { x: event.clientX, y: event.clientY } : null,
              );
              game.select(id);
            }}
            disabled={disabled}
          >
            <span className={styles.itemArt}>
              <Prop asset={ITEMS[id].asset} />
            </span>
          </button>
        ))}
      </div>
      {/* Portaled so ancestors' transforms can't offset its fixed position. */}
      {game.selected &&
        createPortal(
          <HeldItem
            key={game.selected}
            asset={ITEMS[game.selected].asset}
            from={grabbedAt}
          />,
          document.body,
        )}
    </aside>
  );
}

// The selected item's art, trailing the mouse pointer. Hidden on touch screens by CSS.
function HeldItem({ asset, from }: { asset: ItemArtId; from: Point | null }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // The <div> is always rendered, so its ref is set before effects run.
    const element = ref.current!;
    const place = (x: number, y: number) => {
      element.style.translate = `${x}px ${y}px`;
      element.hidden = false;
    };
    if (from) place(from.x, from.y);
    const move = (event: PointerEvent) => {
      if (event.pointerType === "mouse") place(event.clientX, event.clientY);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [from]);
  return (
    <div ref={ref} className={styles.heldItem} aria-hidden="true" hidden>
      <span className={styles.itemArt}>
        <Prop asset={asset} />
      </span>
    </div>
  );
}
