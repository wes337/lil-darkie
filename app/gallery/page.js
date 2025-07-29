import Image from "next/image";
import { ASSETS } from "@/app/assets";
import { GALLERY } from "@/data/images";
import SlideShow from "@/components/slide-show";
import "@/styles/gallery.scss";

export default function Gallery() {
  return (
    <>
      <Image className="tv" src={ASSETS.tv} alt="" width={1920} height={1080} />
      <div className="gallery">
        <SlideShow images={GALLERY} />
        <div className="copyright">
          Copyright © 2025 Lil Darkie® All Rights Reserved
        </div>
      </div>
    </>
  );
}
