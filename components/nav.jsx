"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CDN_URL } from "@/app/utils";
import useStore from "@/app/store";
import "@/styles/nav.scss";

export default function Nav() {
  const pathname = usePathname();
  const { navOpen, setNavOpen, sticky, setFlashing } = useStore();

  useEffect(() => {
    setNavOpen(false);
    setFlashing(false);
  }, [pathname, setFlashing, setNavOpen]);

  return (
    <>
      <div
        className={`blur${navOpen ? " open" : ""}`}
        onClick={() => setNavOpen(false)}
      />
      <button
        className={`mobile-nav-button${sticky ? " sticky" : ""}`}
        onClick={() => setNavOpen(true)}
      >
        <img src={`${CDN_URL}/menu.png`} alt="" />
      </button>
      <div className={`nav${navOpen ? " open" : ""}`}>
        <div className="nav-header">
          <img
            className="nav-logo"
            src={`${CDN_URL}/logo-yellow.png`}
            alt="Lil Darkie"
          />
          <div className="social-media-links">
            <Link
              href="https://open.spotify.com/artist/62F9BiUmjqeXbBztCwiX1U"
              target="_blank"
            >
              <img src={`${CDN_URL}/icons/spotify.png`} alt="Spotify" />
            </Link>
            <Link href="https://soundcloud.com/lildvrkie" target="_blank">
              <img src={`${CDN_URL}/icons/soundcloud.png`} alt="Soundcloud" />
            </Link>
            <Link
              href="https://www.youtube.com/channel/UCy1PnulzEixUtsR-w-Pgd4w"
              target="_blank"
            >
              <img src={`${CDN_URL}/icons/youtube.png`} alt="YouTube" />
            </Link>
          </div>
          <button className="nav-close" onClick={() => setNavOpen(false)}>
            <img src={`${CDN_URL}/icons/close.png`} alt="Close" />
          </button>
        </div>
        <div className="nav-links">
          <Link href="https://www.smalldarkone.com">
            <img src={`${CDN_URL}/icons/gun.png`} alt="" />
            <span>Merch</span>
          </Link>
          <Link href="/gallery">
            <img src={`${CDN_URL}/icons/skull.png`} alt="" />
            <span>Gallery</span>
          </Link>
          <Link href="/upcoming-shows">
            <img src={`${CDN_URL}/icons/grave.png`} alt="" />
            <span>Upcoming Shows</span>
          </Link>
          <Link href="/fall-tour">
            <img src={`${CDN_URL}/icons/knife.png`} alt="" />
            <span>Fall 2023 Tour</span>
          </Link>
          <Link href="/posters">
            <img src={`${CDN_URL}/icons/cig.png`} alt="" />
            <span>Posters</span>
          </Link>
          <Link href="/the-lost-songs">
            <img src={`${CDN_URL}/icons/booze.png`} alt="" />
            <span>The Lost Songs</span>
          </Link>
          <div className="nav-copyright">
            Copyright © 2023 Lil Darkie - All Rights Reserved.
          </div>
        </div>
      </div>
      <div className={`mushroom${navOpen ? " open" : ""}`}>
        <img src={`${CDN_URL}/mushroom-small.png`} alt="" />
      </div>
      <div className={`planes${navOpen ? " open" : ""}`}>
        <img
          className="plane-one"
          src={`${CDN_URL}/plane-2-small.png`}
          alt=""
        />
        <img
          className="plane-two"
          src={`${CDN_URL}/plane-1-small.png`}
          alt=""
        />
      </div>
    </>
  );
}
