"use client";

import { useEffect, useState } from "react";
import useStore from "@/app/store";
import RedGame from "@/components/red-game/red-game";
import type { Site } from "@/lib/cms/schema";
import styles from "@/styles/landing.module.scss";

// The home page: the red game's start screen, plus the buttons and copyright
// line from the site record.
export default function Landing({ site }: { site: Site }) {
  const { setNoScroll, setGameStarted, gameStarted } = useStore();
  // Either exit button remounts the game with fresh state.
  const [gameRun, setGameRun] = useState(0);

  function exitGame() {
    setGameStarted(false);
    setGameRun((run) => run + 1);
  }

  useEffect(() => {
    setNoScroll(true);
    setGameStarted(false);

    return () => {
      setNoScroll(false);
      setGameStarted(false);
    };
  }, [setNoScroll, setGameStarted]);

  return (
    <main className={styles.landing} data-playing={gameStarted}>
      {gameStarted && (
        <button className={styles.exit} onClick={exitGame}>
          EXIT
        </button>
      )}
      <RedGame key={gameRun} onExit={exitGame} buttons={site.homeButtons ?? []} />
      <footer
        className={styles.footer}
        data-playing={gameStarted}
        aria-hidden={gameStarted}
      >
        {site.copyright}
      </footer>
    </main>
  );
}
