"use client";

import { useEffect, useState } from "react";
import useStore from "@/app/store";
import RedGame from "@/components/red-game/red-game";
import styles from "@/styles/landing.module.scss";

export default function Landing() {
  const { setLightMode, setNoScroll, setGameStarted, gameStarted } = useStore();
  // Bumped when the game ends so RedGame remounts with fresh state.
  const [gameRun, setGameRun] = useState(0);

  useEffect(() => {
    setLightMode(false);
    setNoScroll(true);
    setGameStarted(false);

    return () => {
      setLightMode(false);
      setNoScroll(false);
      setGameStarted(false);
    };
  }, [setLightMode, setNoScroll, setGameStarted]);

  return (
    <main className={styles.landing}>
      <RedGame
        key={gameRun}
        onExit={() => {
          setGameStarted(false);
          setGameRun((run) => run + 1);
        }}
      />
      <footer className={styles.footer} data-playing={gameStarted} aria-hidden={gameStarted}>
        Copyright © 2026 Lil Darkie® All Rights Reserved
      </footer>
    </main>
  );
}
