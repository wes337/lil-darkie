"use client";

import { useEffect, useState } from "react";
import useStore from "@/app/store";
import RedGame from "@/components/red-game/red-game";
import PaintingLanding from "@/components/landing/painting";
import SimpleLanding from "@/components/landing/simple";
import { DEFAULT_LANDING_BUTTONS, type Site } from "@/lib/cms/schema";
import styles from "@/styles/landing.module.scss";

// Both home layouts share the same game and keep their own editable buttons.
export default function Landing({ site }: { site: Site }) {
  const { setNoScroll, setGameStarted, gameStarted } = useStore();
  const layout = site.landingLayout ?? "simple";
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
    <main className={styles.landing} data-playing={gameStarted} data-layout={layout}>
      {gameStarted && (
        <button className={styles.exit} onClick={exitGame}>
          EXIT
        </button>
      )}
      <RedGame
        key={gameRun}
        onExit={exitGame}
        renderStart={(props) => layout === "painting" ? (
          <PaintingLanding {...props} buttons={site.homeButtons ?? []} />
        ) : (
          <SimpleLanding {...props} buttons={site.landingButtons ?? DEFAULT_LANDING_BUTTONS} />
        )}
      />
      <footer className={styles.footer} data-playing={gameStarted} aria-hidden={gameStarted}>
        {site.copyright}
      </footer>
    </main>
  );
}
