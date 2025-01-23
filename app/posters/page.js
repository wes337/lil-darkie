import { CDN_URL } from "@/app/assets";
import Swiper from "@/components/swiper";
import "@/styles/posters.scss";

const posters = [];

for (let i = 1; i <= 13; i++) {
  posters.push(`${CDN_URL}/photos/posters/${i}.webp`);
}

export default function Posters() {
  return (
    <div className="posters">
      <h1>Posters</h1>
      <Swiper items={posters} />
      <div className="copyright">
        Copyright © 2025 Lil Darkie® All Rights Reserved
      </div>
    </div>
  );
}
