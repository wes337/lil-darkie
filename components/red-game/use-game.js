import { useState } from 'react';
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { interact, inventory, newProgress, talk, unlockSafe } from './game-model.mjs';
import { GREETING, ITEMS } from './game-content.mjs';

// Props drawn large behind the text box when they open it, by source target.
// Their room copies hide meanwhile (see `data-dialog-source` in red-game.jsx).
const PROP_ART = {
  'flower-wilted': (progress) => progress.water === 'spent' ? 'flower-blooming' : 'flower-wilted',
  // Once threaded onto the needle, the spool is gone from the desk.
  'thread-spool': (progress) => ['threaded', 'used'].includes(progress.sewing) ? null : 'thread-spool',
  'desk-lamp-on': () => 'desk-lamp-on',
  'bear-ripped': (progress) => progress.bear === 'collected' ? null : 'bear-ripped',
};

// Art for the text box: a newly gained item wins (shown from `itemPage`), else the inspected prop.
function dialogArt(before, result, sourceTarget) {
  const had = inventory(before);
  const gained = inventory(result.progress).find((id) => !had.includes(id));
  if (gained) return { asset: ITEMS[gained].asset, fromPage: result.itemPage ?? 0 };
  const asset = PROP_ART[sourceTarget]?.(result.progress);
  return asset ? { asset, fromPage: 0, roomProp: sourceTarget } : null;
}

function createGameStore() {
  return createStore((set, get) => {
    const apply = (result, sourceTarget = get().dialog?.sourceTarget) => {
      if (!result) return null;
      const art = dialogArt(get().progress, result, sourceTarget);
      set({
        progress: result.progress, selected: null,
        sequence: result.sequence ? { type: result.sequence, message: result.message, art } : null,
        dialog: result.sequence || !result.message?.length && !result.conversation ? null : {
          pageSounds: result.pageSounds,
          sourceTarget, art,
          kind: result.conversation ? 'conversation' : 'message',
          messages: result.message?.length ? result.message : [GREETING],
        },
      });
      return result;
    };
    const blocked = () => get().dialog || get().sequence;
    return {
      progress: newProgress(), selected: null, dialog: null, sequence: null,
      select(item) {
        if (blocked() || !inventory(get().progress).includes(item)) return;
        set({ selected: get().selected === item ? null : item });
      },
      deselect: () => set({ selected: null }),
      act(target) { return blocked() ? null : apply(interact(get().progress, target, get().selected), target); },
      submitCode(code) { return blocked() ? null : apply(unlockSafe(get().progress, code)); },
      talk(topic) {
        if (get().dialog?.kind !== 'conversation') return;
        apply(talk(get().progress, topic));
      },
      closeDialog: () => set({ dialog: null }),
      finishSequence() {
        const { message: messages, art } = get().sequence ?? {};
        set({ sequence: null, dialog: messages?.length ? { kind: 'message', messages, art } : null });
      },
    };
  });
}

// Progress belongs to this mounted game and resets on refresh.
export default function useGame() {
  const [store] = useState(createGameStore);
  return useStore(store);
}
