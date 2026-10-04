"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getRandomNumberBetween } from "@/app/utils";
import useStore from "@/app/store";
import "@/styles/backdrop.scss";

export default function Backdrop() {
  const pathname = usePathname();
  const { flashing, setFlashing, flashingEnabled } = useStore();
  const subtle = pathname === "/";

  useEffect(() => {
    if (!flashingEnabled) {
      return;
    }

    let flashingTimeout: ReturnType<typeof setTimeout> | undefined;
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

    const initialFlashingTimeout = setTimeout(() => {
      triggerFlashing();
    }, 1500);

    return () => {
      clearInterval(flashingInterval);
      clearTimeout(flashingTimeout);
      clearTimeout(initialFlashingTimeout);
    };
  }, [setFlashing, flashingEnabled]);

  return (
    <div
      className={`backdrop${flashing ? " flashing" : ""}${
        subtle ? " subtle" : ""
      }`}
    />
  );
}
