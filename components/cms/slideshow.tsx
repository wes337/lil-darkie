"use client";
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/cms.module.scss";

// One large image with previous and next buttons and a strip of thumbnails.
export default function Slideshow({ images }: { images: string[] }) {
  const [selected, setSelected] = useState(0);
  const thumbs = useRef<HTMLDivElement>(null);
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
      <div className={styles["slideshow-main"]}>
        <img src={images[current]} alt="" />
        {images.length > 1 && (
          <>
            <button aria-label="Previous image" onClick={() => step(-1)}>
              ‹
            </button>
            <button aria-label="Next image" onClick={() => step(1)}>
              ›
            </button>
          </>
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
