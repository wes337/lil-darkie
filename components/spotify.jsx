import Link from "next/link";
import { CDN_URL } from "@/app/utils";
import useStore from "@/app/store";
import "@/styles/spotify.scss";

export default function Spotify() {
  const { navOpen, sticky } = useStore();

  return (
    <Link
      className={`spotify${navOpen ? " hide" : ""}${sticky ? " sticky" : ""}`}
      href="https://open.spotify.com/artist/62F9BiUmjqeXbBztCwiX1U"
      target="_blank"
    >
      <img src={`${CDN_URL}/icons/spotify.png`} alt="" />
    </Link>
  );
}
