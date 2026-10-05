import useStore from "@/app/store";
import SiteLink from "@/components/site-link";
import type { LandingButton } from "@/lib/cms/schema";
import type { StartScreenProps } from "@/components/red-game/red-game";
import styles from "@/styles/simple-landing.module.scss";

export default function SimpleLanding({
  buttons,
  onStart,
  disabled,
  failed,
}: StartScreenProps & { buttons: LandingButton[] }) {
  const { navOpen, setNavOpen } = useStore();

  return (
    <div className={styles.landing}>
      <nav aria-label="Main links">
        <ul>
          {buttons.map((button, index) => (
            <li key={`${button.type}-${index}`}>
              {button.type === "link" ? (
                <SiteLink href={button.href}>{button.label}</SiteLink>
              ) : button.type === "game" ? (
                <button type="button" onClick={onStart} disabled={disabled}>
                  {button.label}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setNavOpen(true)}
                  aria-expanded={navOpen}
                  aria-controls="site-menu"
                >
                  {button.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
      {failed && (
        <p role="alert">The room artwork couldn’t load. Please refresh to try again.</p>
      )}
    </div>
  );
}
