"use client";
import { useEffect } from "react";
import { getRandomNumberBetween } from "@/app/utils";
import useStore from "@/app/store";
import "@/styles/backdrop.scss";

export default function Backdrop() {
  const { lightMode, flashing, setFlashing, flashingEnabled } = useStore();

  useEffect(() => {
    if (!flashingEnabled) {
      return;
    }

    let initialFlashingTimeout;
    let flashingTimeout;
    setFlashing(false);

    const triggerFlashing = () => {
      setFlashing(true);
      const flashingDuration = getRandomNumberBetween(1000, 1500);
      flashingTimeout = setTimeout(() => setFlashing(false), flashingDuration);
    };

    const flashingInterval = setInterval(() => {
      const random = Math.random() < 0.5;

      if (random) {
        triggerFlashing();
      }
    }, 5000);

    initialFlashingTimeout = setTimeout(() => {
      triggerFlashing();
    }, 1500);

    return () => {
      clearInterval(flashingInterval);
      clearTimeout(flashingTimeout);
      clearTimeout(initialFlashingTimeout);
    };
  }, [setFlashing, flashingEnabled]);

  return (
    <div className={`backdrop${flashing || lightMode ? " flashing" : ""}`} />
  );
}
