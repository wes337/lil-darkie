"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ASSETS } from "@/app/assets";
import useStore from "@/app/store";
import styles from "@/styles/top-bar.module.scss";

// The same logo art on the landing page and everywhere else.
const LOGO = "/images/greatest-show-in-human-history/lil-darkie.png";

// Both landing layouts and the game share the centered logo. `logo` is the
// one set in the admin. It replaces the built-in art, including the yellow
// copy shown once the page is scrolled.
export default function TopBar({ logo }: { logo?: string }) {
  const pathname = usePathname();
  const { sticky, gameStarted } = useStore();

  // The built-in art's size is known up front. A custom logo sizes itself.
  const image = logo
    ? { src: logo, alt: "Lil Darkie" }
    : { src: LOGO, alt: "Lil Darkie", width: 841, height: 231 };

  if (pathname === "/") {
    return (
      <header className={styles["game-header"]} data-playing={gameStarted}>
        <img {...image} draggable={false} />
      </header>
    );
  }

  return (
    <>
      <div className={`${styles["top-bar"]}${sticky ? ` ${styles.sticky}` : ""}`}>
        <Link
          href="/"
          className={`${styles["top-bar-logo"]}${sticky ? ` ${styles.sticky}` : ""}`}
        >
          {logo ? (
            <img {...image} />
          ) : (
            <>
              <Image
                className={`${styles["logo-yellow"]}`}
                src={ASSETS.logoYellow}
                alt="Lil Darkie"
                width={254}
                height={68}
              />
              <img className={styles["logo-primary"]} {...image} />
            </>
          )}
        </Link>
      </div>
      <div
        className={`${styles["top-bar-back"]}${sticky ? ` ${styles.sticky}` : ""}`}
      />
    </>
  );
}
