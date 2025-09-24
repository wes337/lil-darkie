"use client";

import Link from "next/link";
import { CDN_URL } from "@/app/assets";
import styles from "@/styles/new-content-button.module.scss";

export default function NewContentButton() {
  return (
    <Link
      className={styles["new-content-button"]}
      href="https://www.racingthoughtsrecords.com"
      target="_blank"
    >
      <img src={`${CDN_URL}/bubble.png`} alt="" />
      <div className={styles.text}>
        <span className={styles.new}>New</span>
        <span className={styles.physical}>Physical</span>
        <span className={styles.media}>Media</span>
      </div>
    </Link>
  );
}
