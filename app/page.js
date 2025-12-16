"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CDN_URL } from "@/app/assets";
import useStore from "@/app/store";
import { getRandomNumberBetween, isMobileSizedScreen } from "@/app/utils";
import NewContentButton from "@/components/new-content-button";
import styles from "@/styles/landing.module.scss";

export default function Landing() {
  const { lightMode, setLightMode, scroll, setNoScroll } = useStore();
  const [backdropTranslate, setBackdropTranslate] = useState(
    "translate(0%, 0%) scaleX(1)"
  );

  useEffect(() => {
    setLightMode(false);

    setNoScroll(true);

    return () => {
      setLightMode(false);
      setNoScroll(false);
    };
  }, [setLightMode, setNoScroll]);

  const randomizeBackdropTranslate = () => {
    if (isMobileSizedScreen()) {
      const flipX = getRandomNumberBetween(0, 1) == 1;
      const flipY = getRandomNumberBetween(0, 1) == 1;
      setBackdropTranslate(
        `translate(0%, 0%) scaleX(${flipX ? "-1" : "1"}) scaleY(${
          flipY ? "-1" : "1"
        })`
      );
      return;
    }

    const x = getRandomNumberBetween(-5, 5);
    const y = getRandomNumberBetween(-30, 30);
    const flip = getRandomNumberBetween(0, 1) == 1;

    setBackdropTranslate(
      `translate(${x}%, ${y}%) scaleX(${flip ? "-1" : "1"})`
    );
  };

  useEffect(() => {
    randomizeBackdropTranslate();
  }, []);

  return (
    <div className={`${styles.landing} ${lightMode ? styles.light : ""}`}>
      <div
        className={styles["new-content-button"]}
        style={{
          transform: `translate(${scroll * -0.1}px, ${scroll * -0.5}px)`,
        }}
      >
        <NewContentButton />
      </div>
      <div className={styles.backdrop}>
        <img
          src={`${CDN_URL}/faces.png`}
          alt=""
          style={{ transform: backdropTranslate }}
        />
      </div>
      <div className={styles.body}>
        <img
          className={styles.unknown}
          src={`${CDN_URL}/unknown.png`}
          alt=""
          onClick={() => {
            randomizeBackdropTranslate();
            setLightMode(!lightMode);
          }}
        />
        <div className={styles.links}>
          <Link href="https://www.spotify.com" target="_blank">
            <img src={`${CDN_URL}/icons/spotify.png`} alt="Spotify" />
          </Link>
          <Link href="https://www.spotify.com" target="_blank">
            <img src={`${CDN_URL}/icons/apple.png`} alt="Apple Music" />
          </Link>
          <Link href="https://www.spotify.com" target="_blank">
            <img src={`${CDN_URL}/icons/soundcloud.png`} alt="Soundcloud" />
          </Link>
          <Link href="https://www.spotify.com" target="_blank">
            <img src={`${CDN_URL}/icons/youtube.png`} alt="YouTube" />
          </Link>
        </div>
      </div>
      <div className={`${styles.footer} ${lightMode ? styles.light : ""}`}>
        <div className={styles.copyright}>
          Copyright © 2026 Lil Darkie® All Rights Reserved
        </div>
      </div>
    </div>
  );
}
