import Image from "next/image";
import { CDN_URL, ASSETS } from "@/app/assets";
import SlideShow from "@/components/slide-show";
import "@/styles/gallery.scss";

const images = [];

for (let i = 1; i <= 9; i++) {
  images.push(`${CDN_URL}/photos/comp/${i}.png`);
}

export default function Gallery() {
  return (
    <>
      <Image className="tv" src={ASSETS.tv} alt="" width={1920} height={1080} />
      <div className="gallery">
        <SlideShow images={images} />
        <div className="copyright">
          Copyright © 2024 Lil Darkie® All Rights Reserved
        </div>
      </div>
    </>
  );
}
