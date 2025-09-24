"use client";
import Image from "next/image";
import { ASSETS } from "@/app/assets";
import Sampler from "@/components/sampler";
import SamplerFace from "@/components/sampler-face";
import styles from "@/styles/sampler.module.scss";

export default function SamplerPage() {
  return (
    <>
      <Image
        className={styles.camo}
        src={ASSETS.camo}
        alt=""
        width={1920}
        height={1920}
      />
      <div className={styles["sampler-page"]}>
        <div className={styles.body}>
          <Sampler />
          <SamplerFace />
        </div>
        <div className={styles.copyright}>
          Copyright © 2025 Lil Darkie® All Rights Reserved
        </div>
      </div>
    </>
  );
}
