"use client";
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/cms.module.scss";

// A swipe has to travel this far sideways to change the image.
const SWIPE_PX = 40;

// One large image and a strip of thumbnails. Change images with the arrow
// buttons, by swiping on a touch screen, or by picking a thumbnail.
export default function Slideshow({ images }: { images: string[] }) {
  const [selected, setSelected] = useState(0);
  const thumbs = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number>(null);
  // The editor can remove images while one past the new end is selected.
  const current = Math.min(selected, images.length - 1);
  const step = (by: number) =>
    setSelected((current + by + images.length) % images.length);

  // Keep the selected thumbnail centered in the strip. Scrolling the strip
  // itself, not the thumbnail into view, leaves the page where it is.
  useEffect(() => {
    const strip = thumbs.current;
    const thumb = strip?.children[current];
    if (!strip || !(thumb instanceof HTMLElement)) return;
    strip.scrollLeft = thumb.offsetLeft - strip.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2;
  }, [current]);

  if (images.length === 0) return null;

  return (
    <div className={styles.slideshow}>
      <div
        className={styles["slideshow-main"]}
        onTouchStart={(event) => {
          touchStart.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const end = event.changedTouches[0]?.clientX;
          if (touchStart.current === null || end === undefined) return;
          const moved = end - touchStart.current;
          if (Math.abs(moved) >= SWIPE_PX && images.length > 1) step(moved < 0 ? 1 : -1);
          touchStart.current = null;
        }}
      >
        {images.length > 1 && (
          <button aria-label="Previous image" onClick={() => step(-1)}>
            ‹
          </button>
        )}
        <img src={images[current]} alt="" draggable={false} />
        {images.length > 1 && (
          <button aria-label="Next image" onClick={() => step(1)}>
            ›
          </button>
        )}
      </div>
      {images.length > 1 && (
        <div className={styles["slideshow-thumbs"]} ref={thumbs}>
          {images.map((image, i) => (
            <button
              key={`${image}-${i}`}
              aria-label={`Image ${i + 1}`}
              aria-current={i === current}
              onClick={() => setSelected(i)}
            >
              <img src={image} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
