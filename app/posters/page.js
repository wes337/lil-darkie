import { POSTERS } from "@/data/images";
import Swiper from "@/components/swiper";
import "@/styles/posters.scss";

export default function Posters() {
  return (
    <div className="posters">
      <h1>Posters</h1>
      <Swiper items={POSTERS} />
      <div className="copyright">
        Copyright © 2025 Lil Darkie® All Rights Reserved
      </div>
    </div>
  );
}
