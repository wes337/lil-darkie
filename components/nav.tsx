"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ASSETS } from "@/app/assets";
import useStore from "@/app/store";
import SiteLink from "@/components/site-link";
import type { Site } from "@/lib/cms/schema";
import "@/styles/nav.scss";

const SOCIAL_ICONS = {
  spotify: ASSETS.spotifyWhiteIcon,
  soundcloud: ASSETS.soundcloudIcon,
  youtube: ASSETS.youtubeIcon,
};

// The slide-out menu. Its links, social icons and copyright line come from
// the site record.
export default function Nav({ site }: { site: Site }) {
  const pathname = usePathname();
  const {
    navOpen,
    setNavOpen,
    sticky,
    setSticky,
    setScroll,
    gameStarted,
  } = useStore();

  useEffect(() => {
    setNavOpen(false);
  }, [pathname, setNavOpen]);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = Math.floor(window.scrollY);
      setScroll(scrollY);
      setSticky(scrollY >= 32);
    };

    onScroll();

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [setScroll, setSticky]);

  const gamePlaying = pathname === "/" && gameStarted;

  return (
    <>
      <div
        className={`blur${navOpen ? " open" : ""}`}
        onClick={() => setNavOpen(false)}
      />
      <button
        className={`mobile-nav-button${sticky ? " sticky" : ""}`}
        data-game-landing={pathname === "/"}
        data-game-playing={gamePlaying}
        disabled={gamePlaying}
        aria-hidden={gamePlaying}
        onClick={() => setNavOpen(true)}
      >
        {/* The landing page uses a copy recolored to the red game's painted palette. */}
        <Image
          src={
            pathname === "/"
              ? "/images/red-game/navigation/menu.webp"
              : ASSETS.menu
          }
          alt="Menu"
          width={98}
          height={66}
        />
      </button>
      <div className={`nav${navOpen ? " open" : ""}`} inert={!navOpen}>
        <div className="nav-header">
          <Image
            className="nav-logo"
            src={ASSETS.logoYellow}
            alt="Lil Darkie"
            width={254}
            height={68}
          />
          <div className="social-media-links">
            {site.social.map(({ platform, href }) => (
              <Link key={href} href={href} target="_blank">
                <Image
                  src={SOCIAL_ICONS[platform]}
                  alt={platform}
                  width={32}
                  height={32}
                />
              </Link>
            ))}
          </div>
          <button className="nav-close" onClick={() => setNavOpen(false)}>
            <Image src={ASSETS.closeIcon} alt="Close" width={40} height={42} />
          </button>
        </div>
        <div className="nav-links">
          {site.nav.map(({ label, href }) => (
            <SiteLink key={`${label}-${href}`} href={href}>
              <Image
                src={ASSETS.dashIcon}
                aria-hidden="true"
                alt=""
                width={24}
                height={48}
              />
              <span>{label}</span>
            </SiteLink>
          ))}
          <div className="nav-copyright">{site.copyright}</div>
        </div>
      </div>
    </>
  );
}
