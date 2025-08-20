"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ASSETS } from "@/app/assets";
import "@/styles/slide-show.scss";

export default function SlideShow({ images }) {
  const [stopAutoScroll, setStopAutoScroll] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const resetAutoScrollTimer = useRef();

  const scrollToImage = (imageIndex) => {
    const image = document.getElementById(`image-${imageIndex}`);
    image?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "center",
    });
  };

  useEffect(() => {
    if (stopAutoScroll) {
      return;
    }

    scrollToImage(selectedImage);
  }, [selectedImage, stopAutoScroll]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedImage((selectedImage) => {
        const nextIndex = selectedImage + 1;
        if (images[nextIndex]) {
          return nextIndex;
        }

        return 0;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [images]);

  const clearResetAutoScrollTimeout = () => {
    clearTimeout(resetAutoScrollTimer.current);
    setStopAutoScroll(true);
    resetAutoScrollTimer.current = setTimeout(() => {
      setStopAutoScroll(false);
    }, 10000);
  };

  const onClickImage = (i) => {
    setSelectedImage(i);
    clearResetAutoScrollTimeout();
    scrollToImage(i);
  };

  return (
    <div className="slide-show">
      <h1>Tour Photos</h1>
      <div className="slide-show-selected-image">
        <Image
          className="frame-left"
          src={ASSETS.frameLeft}
          alt=""
          width={193}
          height={500}
        />
        <img
          className="slide-show-main-image"
          src={images[selectedImage]}
          alt=""
        />
        <Image
          className="frame-right"
          src={ASSETS.frameRight}
          alt=""
          width={192}
          height={499}
        />
        <Image
          className="frame-bottom"
          src={ASSETS.frameBottom}
          alt=""
          width={1384}
          height={966}
        />
      </div>
      <div className="slide-show-images" onScroll={clearResetAutoScrollTimeout}>
        {images.map((image, i) => (
          <button key={image} id={`image-${i}`} onClick={() => onClickImage(i)}>
            <img
              src={image}
              alt=""
              className={i === selectedImage ? "selected" : ""}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
