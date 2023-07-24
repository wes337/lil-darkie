import { create } from "zustand";

const useStore = create((set) => ({
  navOpen: false,
  setNavOpen: (navOpen) => {
    if (navOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    set(() => ({ navOpen }));
  },
  flashing: false,
  setFlashing: (flashing) => set(() => ({ flashing })),
  sticky: false,
  setSticky: (sticky) => set(() => ({ sticky })),
  bloodTransition: false,
  setBloodTransition: (bloodTransition) => set(() => ({ bloodTransition })),
  scroll: 0,
  setScroll: (scroll) => set(() => ({ scroll })),
  lightMode: false,
  setLightMode: (lightMode) => {
    if (lightMode) {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }

    set(() => ({ lightMode }));
  },
  setHideScroll: (hide) => {
    if (hide) {
      document.body.classList.add("no-scroll");
      window.scrollTo(0, 0);
    } else {
      document.body.classList.remove("no-scroll");
    }
  },
}));

export default useStore;
