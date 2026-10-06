"use client";

import { useEffect, useState } from "react";
import useStore from "@/app/store";
import RedGame from "@/components/red-game/red-game";
import PaintingLanding from "@/components/landing/painting";
import SimpleLanding from "@/components/landing/simple";
import { LANDING_LAYOUT } from "@/components/landing/layout";
import { DEFAULT_LANDING_BUTTONS, type Site } from "@/lib/cms/schema";
import styles from "@/styles/landing.module.scss";

// Both home layouts share the same game and keep their own buttons.
// LANDING_LAYOUT picks which one shows.
export default function Landing({ site }: { site: Site }) {
  const { setNoScroll, setGameStarted, gameStarted } = useStore();
  const layout = LANDING_LAYOUT;
  // Either exit button remounts the game with fresh state.
  const [gameRun, setGameRun] = useState(0);
  // The EXIT button up top asks first. The game draws the question.
  const [confirmingExit, setConfirmingExit] = useState(false);

  function exitGame() {
    setConfirmingExit(false);
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
        <button className={styles.exit} onClick={() => setConfirmingExit(true)}>
          EXIT
        </button>
      )}
      <RedGame
        key={gameRun}
        onExit={exitGame}
        confirmingExit={confirmingExit}
        onCancelExit={() => setConfirmingExit(false)}
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
