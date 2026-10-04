"use client";
import Sampler from "@/components/sampler";
import SamplerFace from "@/components/sampler-face";
import styles from "@/styles/sampler.module.scss";

export default function SamplerPage() {
  return (
    <div className={styles["sampler-page"]}>
      <div className={styles.body}>
        <Sampler />
        <SamplerFace />
      </div>
      <div className={styles.copyright}>
        © 2026 Lil Darkie® All Rights Reserved
      </div>
    </div>
  );
}
