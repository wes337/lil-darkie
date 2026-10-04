"use client";
import Image from "next/image";
import { ASSETS } from "@/app/assets";
import useStore from "@/app/store";
import styles from "@/styles/sampler-face.module.scss";

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
    <div className={styles["sampler-face"]}>
      <div className={`${styles.red} ${growl ? styles.show : ""}`} />
      <div className={`${styles.yellow} ${kickAlt ? styles.show : ""}`} />
      <div
        className={`${styles.white} ${laugh || pigSqueal ? styles.show : ""}`}
      />
      <Image
        className={`${styles.normal} ${styles.show}`}
        src={ASSETS.face1}
        alt=""
        width={395}
        height={429}
      />
      <Image
        className={`${styles["s-face"]} ${kick || laugh ? styles.show : ""}}`}
        src={ASSETS.face1Blink}
        alt=""
        width={395}
        height={429}
      />
      <Image
        className={`${styles["s-face"]} ${huh ? styles.show : ""}`}
        src={ASSETS.face3}
        alt=""
        width={407}
        height={429}
      />
      <Image
        className={`${styles["s-face"]} ${
          snare || wood || pigSqueal ? styles.show : ""
        }`}
        src={ASSETS.face2}
        alt=""
        width={431}
        height={538}
      />
      <Image
        className={`${styles["s-face"]} ${closedHat ? styles.show : ""}`}
        src={ASSETS.face6}
        alt=""
        width={586}
        height={612}
      />
      <Image
        className={`${styles["s-face"]} ${openHat || growl ? styles.show : ""}`}
        src={ASSETS.face5}
        alt=""
        width={446}
        height={483}
      />
      <Image
        className={`${styles["s-face"]} ${kickAlt || yuh ? styles.show : ""}`}
        src={ASSETS.face7}
        alt=""
        width={429}
        height={463}
      />
    </div>
  );
}
