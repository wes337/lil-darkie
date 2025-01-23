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
  const { navOpen, setNavOpen, sticky, setSticky, setScroll, setFlashing } =
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

    return () => window.removeEventListener("scoll", onScroll);
  }, [setScroll, setSticky]);

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
        <Image src={ASSETS.menu} alt="Menu" width={98} height={66} />
      </button>
      <div className={`nav${navOpen ? " open" : ""}`}>
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
            <span className="new">New!</span>
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
          <Link href="/brazil-australia-new-zealand">
            <Image
              src={ASSETS.dashIcon}
              aria-hidden="true"
              alt=""
              width={24}
              height={48}
            />
            <span>Brazil & Aus & NZ Tour</span>
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
            Copyright © 2025 Lil Darkie® - All Rights Reserved.
          </div>
        </div>
      </div>
      <div className={`mushroom${navOpen ? " open" : ""}`}>
        <Image src={ASSETS.mushroom} alt="" width={867} height={1076} />
      </div>
      <div className={`planes${navOpen ? " open" : ""}`}>
        <Image
          className="plane-one"
          src={ASSETS.plane2}
          alt=""
          width={800}
          height={547}
        />
        <Image
          className="plane-two"
          src={ASSETS.plane1}
          alt=""
          width={688}
          height={516}
        />
      </div>
    </>
  );
}
