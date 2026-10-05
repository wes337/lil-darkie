import type { HomeButton } from "@/lib/cms/schema";
import LandingScene from "@/components/red-game/landing-scene";
import { GAME_CDN, artSources } from "@/components/red-game/art";
import type { StartScreenProps } from "@/components/red-game/red-game";
import styles from "@/styles/painting-landing.module.scss";

// The original painting landing, retained with its own artwork and styles.
export default function PaintingLanding({
  buttons,
  onStart,
  disabled,
  failed,
}: StartScreenProps & { buttons: HomeButton[] }) {
  return (
    <>
      <LandingScene />
      <div className={styles.start}>
        <button className={styles.play} onClick={onStart} disabled={disabled}>
          <img
            className={styles.playYellow}
            {...artSources(`${GAME_CDN}/buttons/paint-yellow.webp`)}
            alt=""
            width={2172}
            height={724}
            draggable={false}
          />
          <img
            className={styles.playRed}
            {...artSources(`${GAME_CDN}/buttons/paint-red.webp`)}
            alt=""
            width={2172}
            height={724}
            draggable={false}
          />
          <span>Play the Game</span>
        </button>
        {buttons.length > 0 && (
          <nav className={styles.links} aria-label="Featured links">
            {buttons.map((button) => (
              <a
                key={`${button.label}-${button.href}`}
                href={button.href}
                data-size={button.size ?? "medium"}
                data-transparent={button.backgroundColor === "transparent"}
                style={{ color: button.textColor, background: button.backgroundColor }}
              >
                {button.label}
              </a>
            ))}
          </nav>
        )}
        {failed && (
          <p role="alert">The room artwork couldn’t load. Please refresh to try again.</p>
        )}
      </div>
    </>
  );
}
