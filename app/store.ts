import { create } from "zustand";
import { combine } from "zustand/middleware";

// `combine` infers the store type from the initial state and the setters, so
// consumers get typed state without a separate declaration to keep in sync.
const useStore = create(
  combine(
    {
      gameStarted: false,
      navOpen: false,
      flashingEnabled: false,
      flashing: false,
      sticky: false,
      scroll: 0,
      noScroll: false,
      kick: false,
      kickAlt: false,
      snare: false,
      openHat: false,
      closedHat: false,
      growl: false,
      pigSqueal: false,
      huh: false,
      yuh: false,
      laugh: false,
      wood: false,
    },
    (set) => ({
      setGameStarted: (gameStarted: boolean) => set({ gameStarted }),
      setNavOpen: (navOpen: boolean) => {
        if (navOpen) {
          document.body.classList.add("no-scroll");
        } else {
          document.body.classList.remove("no-scroll");
        }

        set(() => ({ navOpen }));
      },
      setFlashingEnabled: (flashingEnabled: boolean) =>
        set(() => ({ flashingEnabled })),
      setFlashing: (flashing: boolean) => set(() => ({ flashing })),
      setSticky: (sticky: boolean) => set(() => ({ sticky })),
      setScroll: (scroll: number) => set(() => ({ scroll })),
      setNoScroll: (noScroll: boolean) => {
        if (noScroll) {
          document.documentElement.classList.add("no-scroll");
          document.body.classList.add("no-scroll");
        } else {
          document.documentElement.classList.remove("no-scroll");
          document.body.classList.remove("no-scroll");
        }

        set(() => ({ noScroll }));
      },
      playedKick: (kick: boolean) => set(() => ({ kick })),
      playedKickAlt: (kickAlt: boolean) => set(() => ({ kickAlt })),
      playedSnare: (snare: boolean) => set(() => ({ snare })),
      playedOpenHat: (openHat: boolean) => set(() => ({ openHat })),
      playedClosedHat: (closedHat: boolean) => set(() => ({ closedHat })),
      playedGrowl: (growl: boolean) => set(() => ({ growl })),
      playedPigSqueal: (pigSqueal: boolean) => set(() => ({ pigSqueal })),
      playedHuh: (huh: boolean) => set(() => ({ huh })),
      playedYuh: (yuh: boolean) => set(() => ({ yuh })),
      playedLaugh: (laugh: boolean) => set(() => ({ laugh })),
      playedWood: (wood: boolean) => set(() => ({ wood })),
    })
  )
);

export default useStore;
