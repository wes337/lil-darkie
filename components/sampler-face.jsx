"use client";
import { CDN_URL } from "@/app/utils";
import useStore from "@/app/store";
import "@/styles/sampler-face.scss";

export default function SamplerFace() {
  const {
    kick,
    kickAlt,
    snare,
    openHat,
    closedHat,
    growl,
    pigSqueal,
    huh,
    yuh,
    laugh,
    wood,
  } = useStore();

  return (
    <div className="sampler-face">
      <div className={`red${growl ? " show" : ""}`} />
      <div className={`yellow${kickAlt ? " show" : ""}`} />
      <div className={`white${laugh || pigSqueal ? " show" : ""}`} />
      <img
        className={`normal show`}
        src={`${CDN_URL}/face/face-1.png`}
        alt=""
      />
      <img
        className={`s-face${kick || laugh ? " show" : ""}`}
        src={`${CDN_URL}/face/face-1-blink.png`}
        alt=""
      />
      <img
        className={`s-face${huh ? " show" : ""}`}
        src={`${CDN_URL}/face/face-3.png`}
        alt=""
      />
      <img
        className={`s-face${snare || wood || pigSqueal ? " show" : ""}`}
        src={`${CDN_URL}/face/face-2.png`}
        alt=""
      />
      <img
        className={`s-face${closedHat ? " show" : ""}`}
        src={`${CDN_URL}/face/face-6.png`}
        alt=""
      />
      <img
        className={`s-face${openHat || growl ? " show" : ""}`}
        src={`${CDN_URL}/face/face-5.png`}
        alt=""
      />
      <img
        className={`s-face${kickAlt || yuh ? " show" : ""}`}
        src={`${CDN_URL}/face/face-7.png`}
        alt=""
      />
    </div>
  );
}
