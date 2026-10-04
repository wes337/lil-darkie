"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ASSETS } from "@/app/assets";
import useStore from "@/app/store";
import SiteLink from "@/components/site-link";
import type { Site } from "@/lib/cms/schema";
import styles from "@/styles/top-bar.module.scss";

const ICONS = {
  gun: ASSETS.gunIcon,
  skull: ASSETS.skullIcon,
  grave: ASSETS.graveIcon,
  knife: ASSETS.knifeIcon,
};

function TopBarLink({ link }: { link: Site["nav"][number] }) {
  return (
    <SiteLink href={link.href}>
      {link.icon && <Image src={ICONS[link.icon]} alt="" width={48} height={48} />}
      <span>{link.label}</span>
    </SiteLink>
  );
}

// Desktop header. Shows the nav links flagged for the top bar, split around
// the logo, and a button that opens the full menu.
export default function TopBar({ site }: { site: Site }) {
  const pathname = usePathname();
  const { sticky, setNavOpen, gameStarted } = useStore();

  if (pathname === "/") {
    return (
      <header className={styles["game-header"]} data-playing={gameStarted}>
        <img
          src="/images/greatest-show-in-human-history/lil-darkie.png"
          alt="Lil Darkie"
          width={841}
          height={231}
          draggable={false}
        />
      </header>
    );
  }

  const links = site.nav.filter((link) => link.topBar);

  return (
    <>
      <div className={`${styles["top-bar"]}${sticky ? ` ${styles.sticky}` : ""}`}>
        {links.slice(0, 2).map((link) => (
          <TopBarLink key={link.href} link={link} />
        ))}
        <Link
          href="/"
          className={`${styles["top-bar-logo"]}${sticky ? ` ${styles.sticky}` : ""}`}
        >
          <Image
            className={`${styles["logo-yellow"]}`}
            src={ASSETS.logoYellow}
            alt="Lil Darkie"
            width={254}
            height={68}
          />
          <Image
            className={`${styles["logo-primary"]}`}
            src={ASSETS.logo}
            alt="Lil Darkie"
            width={254}
            height={68}
          />
        </Link>
        {links.slice(2).map((link) => (
          <TopBarLink key={link.href} link={link} />
        ))}
        <button onClick={() => setNavOpen(true)}>
          <Image src={ASSETS.boozeIcon} alt="" width={48} height={48} />
          <span>More</span>
        </button>
      </div>
      <div
        className={`${styles["top-bar-back"]}${sticky ? ` ${styles.sticky}` : ""}`}
      />
    </>
  );
}
