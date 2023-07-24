import { CDN_URL } from "@/app/utils";
import SlideShow from "@/components/slide-show";
import "@/styles/gallery.scss";

const images = [];

for (let i = 1; i <= 29; i++) {
  images.push(`${CDN_URL}/photos/usa-2023/${i}.webp`);
}

export default function Gallery() {
  return (
    <>
      <img className="tv" src={`${CDN_URL}/tv.jpg`} alt="" />
      <div className="gallery">
        <SlideShow images={images} />
      </div>
    </>
  );
}
