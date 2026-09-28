"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ASSETS } from "@/app/assets";
import useStore from "@/app/store";
import "@/styles/nav.scss";

export default function Nav() {
  const pathname = usePathname();
  const { navOpen, setNavOpen, sticky, setSticky, setScroll, setFlashing, gameStarted } =
    useStore();

  useEffect(() => {
    setNavOpen(false);
    setFlashing(false);
  }, [pathname, setFlashing, setNavOpen]);

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
        <Image src={pathname === "/" ? "/images/red-game/navigation/menu.png" : ASSETS.menu} alt="Menu" width={98} height={66} />
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
            <Link
              href="https://open.spotify.com/artist/62F9BiUmjqeXbBztCwiX1U"
              target="_blank"
            >
              <Image
                src={ASSETS.spotifyWhiteIcon}
                alt="Spotify"
                width={32}
                height={32}
              />
            </Link>
            <Link href="https://soundcloud.com/lildvrkie" target="_blank">
              <Image
                src={ASSETS.soundcloudIcon}
                alt="Soundcloud"
                width={32}
                height={32}
              />
            </Link>
            <Link
              href="https://www.youtube.com/channel/UCy1PnulzEixUtsR-w-Pgd4w"
              target="_blank"
            >
              <Image
                src={ASSETS.youtubeIcon}
                alt="YouTube"
                width={32}
                height={32}
              />
            </Link>
          </div>
          <button className="nav-close" onClick={() => setNavOpen(false)}>
            <Image src={ASSETS.closeIcon} alt="Close" width={40} height={42} />
          </button>
        </div>
        <div className="nav-links">
          <a href="https://www.smalldarkone.com">
            <Image
              src={ASSETS.dashIcon}
              aria-hidden="true"
              alt=""
              width={24}
              height={48}
            />
            <span>Merch</span>
          </a>
          <Link href="/comics">
            <Image
              src={ASSETS.dashIcon}
              aria-hidden="true"
              alt=""
              width={24}
              height={48}
            />
            <span>Comics</span>
          </Link>
          <Link href="/gallery">
            <Image
              src={ASSETS.dashIcon}
              aria-hidden="true"
              alt=""
              width={24}
              height={48}
            />
            <span>Gallery</span>
          </Link>
          <Link href="/sampler">
            <Image
              src={ASSETS.dashIcon}
              aria-hidden="true"
              alt=""
              width={24}
              height={48}
            />
            <span>Sampler</span>
          </Link>
          <Link href="/posters">
            <Image
              src={ASSETS.dashIcon}
              aria-hidden="true"
              alt=""
              width={24}
              height={48}
            />
            <span>Posters</span>
          </Link>
          <Link href="/blog">
            <Image
              src={ASSETS.dashIcon}
              aria-hidden="true"
              alt=""
              width={24}
              height={48}
            />
            <span>Writings</span>
          </Link>
          <Link href="/the-lost-songs">
            <Image
              src={ASSETS.dashIcon}
              aria-hidden="true"
              alt=""
              width={24}
              height={48}
            />
            <span>The Lost Songs</span>
          </Link>
          <div className="nav-copyright">
            Copyright © 2026 Lil Darkie® - All Rights Reserved.
          </div>
        </div>
      </div>
    </>
  );
}
