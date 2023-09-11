"use client";
import Image from "next/image";
import { ASSETS } from "@/app/assets";
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
      <Image
        className="normal show"
        src={ASSETS.face1}
        alt=""
        width={395}
        height={429}
      />
      <Image
        className={`s-face${kick || laugh ? " show" : ""}`}
        src={ASSETS.face1Blink}
        alt=""
        width={395}
        height={429}
      />
      <Image
        className={`s-face${huh ? " show" : ""}`}
        src={ASSETS.face3}
        alt=""
        width={407}
        height={429}
      />
      <Image
        className={`s-face${snare || wood || pigSqueal ? " show" : ""}`}
        src={ASSETS.face2}
        alt=""
        width={431}
        height={538}
      />
      <Image
        className={`s-face${closedHat ? " show" : ""}`}
        src={ASSETS.face6}
        alt=""
        width={586}
        height={612}
      />
      <Image
        className={`s-face${openHat || growl ? " show" : ""}`}
        src={ASSETS.face5}
        alt=""
        width={446}
        height={483}
      />
      <Image
        className={`s-face${kickAlt || yuh ? " show" : ""}`}
        src={ASSETS.face7}
        alt=""
        width={429}
        height={463}
      />
    </div>
  );
}
