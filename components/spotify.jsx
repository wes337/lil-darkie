"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ASSETS } from "@/app/assets";
import useStore from "@/app/store";
import "@/styles/spotify.scss";

export default function Spotify() {
  const pathname = usePathname();
  const { navOpen, sticky } = useStore();
  if (pathname === "/") {
    return null;
  }

  return (
    <Link
      className={`spotify${navOpen ? " hide" : ""}${sticky ? " sticky" : ""}`}
      href="https://open.spotify.com/artist/62F9BiUmjqeXbBztCwiX1U"
      target="_blank"
    >
      <Image
        src={ASSETS.spotifyWhiteIcon}
        alt="Spotify"
        width={64}
        height={64}
      />
    </Link>
  );
}
