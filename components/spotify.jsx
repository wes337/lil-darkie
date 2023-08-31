"use client";
import Link from "next/link";
import Image from "next/image";
import { ASSETS } from "@/app/assets";
import useStore from "@/app/store";
import "@/styles/spotify.scss";

export default function Spotify() {
  const { navOpen, sticky, lightMode } = useStore();

  return (
    <Link
      className={`spotify${navOpen ? " hide" : ""}${sticky ? " sticky" : ""}`}
      href="https://open.spotify.com/artist/62F9BiUmjqeXbBztCwiX1U"
      target="_blank"
    >
      {lightMode ? (
        <Image
          src={ASSETS.spotifyGreenIcon}
          alt="Spotify"
          width={64}
          height={64}
        />
      ) : (
        <Image
          src={ASSETS.spotifyWhiteIcon}
          alt="Spotify"
          width={64}
          height={64}
        />
      )}
    </Link>
  );
}
