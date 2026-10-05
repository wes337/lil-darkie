import { useState } from "react";
import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import { applyMove, inventory, newProgress } from "./game-model";
import type { ItemId, Move, Progress, Result, TopicId } from "./game-model";
import { GREETING, ITEMS } from "./game-content";
import type { Refusal } from "@/lib/red-game-proof";
import type { DownloadId } from "@/lib/signed-downloads";

// What the game says when the server won't hand over a file.
const FAILED_LINE = "the download failed. try again";
const REFUSAL_LINES = new Map<string, string>(
  Object.entries({
    refused: FAILED_LINE,
    expired: "this session has expired. exit and begin again",
    "too-soon": "the file is not ready yet. try again in a moment",
    limit: "this file has been taken too many times",
  } satisfies Record<Refusal, string>),
);

type DialogArt = {
  asset: (typeof ITEMS)[ItemId]["asset"];
  fromPage: number;
  // Read by red-game.tsx for `data-dialog-source`, but nothing sets it.
  roomProp?: string;
};
type Dialog = {
  kind: "conversation" | "message";
  messages: string[];
  art?: DialogArt | null;
  pageSounds?: Result["pageSounds"];
  sourceTarget?: string;
};
type Sequence = {
  type: NonNullable<Result["sequence"]>;
  message?: string[];
  art: DialogArt | null;
};
export type Game = {
  progress: Progress;
  selected: ItemId | null;
  dialog: Dialog | null;
  sequence: Sequence | null;
  select(item: ItemId): void;
  deselect(): void;
  act(target: string): Result | null;
  submitCode(code: string): Result | null;
  talk(topic: TopicId | "help"): void;
  // Starts the session. Called once, when the game starts.
  begin(): void;
  // Tells the server the session is over, without waiting for an answer.
  end(): void;
  // Asks the server for a reward file. Says why when it is refused.
  download(id: DownloadId): Promise<void>;
  closeDialog(): void;
  finishSequence(): void;
};

// Show the supplied inventory render when the player receives an item.
function dialogArt(before: Progress, result: Result): DialogArt | null {
  const had = inventory(before);
  const gained = inventory(result.progress).find((id) => !had.includes(id));
  if (gained)
    return { asset: ITEMS[gained].asset, fromPage: result.itemPage ?? 0 };
  return null;
}

function createGameStore() {
  return createStore<Game>()((set, get) => {
    const apply = (
      result: Result,
      sourceTarget = get().dialog?.sourceTarget,
    ) => {
      if (!result) return null;
      const art = dialogArt(get().progress, result);
      set({
        progress: result.progress,
        selected: null,
        sequence: result.sequence
          ? { type: result.sequence, message: result.message, art }
          : null,
        dialog:
          result.sequence || (!result.message?.length && !result.conversation)
            ? null
            : {
                pageSounds: result.pageSounds,
                sourceTarget,
                art,
                kind: result.conversation ? "conversation" : "message",
                messages: result.message?.length ? result.message : [GREETING],
              },
      });
      return result;
    };
    const blocked = () => get().dialog || get().sequence;

    // The moves that changed something, in order. The server replays them to
    // check a download, so looking at things isn't recorded.
    const moves: Move[] = [];
    const play = (move: Move, sourceTarget?: string) => {
      const before = get().progress;
      const result = apply(applyMove(before, move), sourceTarget);
      if (result && result.progress !== before) moves.push(move);
      return result;
    };

    // The session token, or null when the server couldn't be reached.
    let session: Promise<string | null> = Promise.resolve(null);

    return {
      progress: newProgress(),
      selected: null,
      dialog: null,
      sequence: null,
      begin() {
        session = fetch("/api/red-game/session", { method: "POST" })
          .then((response) => (response.ok ? response.json() : null))
          .then((body: { session: string } | null) => body?.session ?? null)
          .catch(() => null);
      },
      end() {
        const ended = session;
        session = Promise.resolve(null);
        // Not waited for, and a failure is fine: the session expires anyway.
        // `keepalive` lets the request finish if the page is going away.
        void ended
          .then((token) =>
            token
              ? fetch("/api/red-game/session", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ session: token }),
                  keepalive: true,
                })
              : null,
          )
          .catch(() => null);
      },
      async download(id) {
        const token = await session;
        const response = token
          ? await fetch(`/api/downloads/${id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ session: token, moves }),
            }).catch(() => null)
          : null;
        if (response?.ok) {
          const { url }: { url: string } = await response.json();
          // The file downloads and the game stays on screen.
          window.location.assign(url);
          return;
        }
        const body: { error?: string } = (await response?.json().catch(() => null)) ?? {};
        const line = REFUSAL_LINES.get(body.error ?? "") ?? FAILED_LINE;
        set({ dialog: { kind: "message", messages: [line] } });
      },
      select(item) {
        if (blocked() || !inventory(get().progress).includes(item)) return;
        set({ selected: get().selected === item ? null : item });
      },
      deselect: () => set({ selected: null }),
      act(target) {
        return blocked()
          ? null
          : play({ type: "interact", target, item: get().selected }, target);
      },
      submitCode(code) {
        return blocked() ? null : play({ type: "code", code });
      },
      talk(topic) {
        if (get().dialog?.kind !== "conversation") return;
        play({ type: "talk", topic });
      },
      closeDialog: () => set({ dialog: null }),
      finishSequence() {
        const { message: messages, art } = get().sequence ?? {};
        set({
          sequence: null,
          dialog: messages?.length ? { kind: "message", messages, art } : null,
        });
      },
    };
  });
}

// Progress belongs to this mounted game and resets on refresh.
export default function useGame() {
  const [store] = useState(createGameStore);
  return useStore(store);
}
