"use client";

import Link from "next/link";
import { CDN_URL } from "@/app/assets";
import { formateDate } from "@/app/utils";
import useStore from "@/app/store";
import NewContentButton from "@/components/new-content-button";
import tourDates from "@/data/greatest-show-in-human-history.json";
import styles from "@/styles/landing.2.module.scss";

export default function Landing() {
  const { scroll } = useStore();

  return (
    <div className={styles.landing}>
      <div
        className={styles["new-content-button"]}
        style={{
          transform: `translate(${scroll * -0.1}px, ${scroll * -0.5}px)`,
        }}
      >
        <NewContentButton />
      </div>
      <div className={styles.curtains}>
        <img
          className={`${styles.curtain} ${styles["top-left"]}`}
          src={`${CDN_URL}/greatest/top-left-curtain.png`}
          alt=""
          style={{
            transform: `translate(${scroll * -0.1}px, ${scroll * -0.15}px)`,
          }}
        />
        <img
          className={`${styles.curtain} ${styles["top-right"]}`}
          src={`${CDN_URL}/greatest/top-right-curtain.png`}
          alt=""
          style={{
            transform: `translate(${scroll * 0.1}px, ${scroll * -0.15}px)`,
          }}
        />
        <img
          className={`${styles.curtain} ${styles["left"]}`}
          src={`${CDN_URL}/greatest/left-curtain.png`}
          alt=""
          style={{
            transform: `translate(${scroll * -0.25}px, ${scroll * -0.2}px)`,
          }}
        />
        <img
          className={`${styles.curtain} ${styles["right"]}`}
          src={`${CDN_URL}/greatest/right-curtain.png`}
          alt=""
          style={{
            transform: `translate(${scroll * 0.25}px, ${scroll * 0.2}px)`,
          }}
        />
      </div>
      <div className={styles.header}>
        <img
          className={styles.presents}
          src={`${CDN_URL}/greatest/presents.png`}
          alt="Presents"
          style={{
            transform: `translateY(${scroll * -1}%)`,
          }}
        />
        <div
          className={styles["main-text"]}
          style={{
            transform: `translateY(-${Math.max(
              scroll * 0.3,
              0
            )}%) scale(${Math.max(1, 1 + scroll * 0.001)})`,
          }}
        >
          <img
            className={styles.the}
            src={`${CDN_URL}/greatest/the-banner.png`}
            alt=""
          />
          <img
            src={`${CDN_URL}/greatest/greatest-show-in-human-history.png`}
            alt="The Greatest Show In Human History"
          />
        </div>
        <img
          className={styles["main-art"]}
          src={`${CDN_URL}/greatest/main-art-2.png`}
          alt=""
          style={{ translate: `-50% ${50 + scroll * -0.15}%` }}
        />
        <div
          className={styles["dates-banner"]}
          style={{
            transform: `translateY(${scroll * -0.5}%) scale(${
              1 + scroll * 0.001
            })`,
          }}
        >
          <img
            className={styles["dates-curtains"]}
            src={`${CDN_URL}/greatest/bottom-curtain.png`}
            alt=""
          />
          <img
            className={styles["dates-text"]}
            src={`${CDN_URL}/greatest/dates-banner.png`}
            alt="North American Tour Dates 2025"
          />
        </div>
      </div>
      <img
        className={styles["happy-mask"]}
        src={`${CDN_URL}/greatest/happy-mask.png`}
        alt=""
        style={{
          translate: `-${Math.min(scroll * 1, 260)}px -${scroll * 0.33}px`,
        }}
      />
      <img
        className={styles["sad-mask"]}
        src={`${CDN_URL}/greatest/sad-mask.png`}
        alt=""
        style={{
          translate: `${Math.min(scroll * 1, 260)}px -${scroll * 0.33}px`,
        }}
      />
      <TourDates />
      <div className={styles.footer}>
        <div className={styles.copyright}>
          Copyright © 2025 Lil Darkie® All Rights Reserved
        </div>
      </div>
    </div>
  );
}

function TourDates() {
  const futureTourDates = tourDates.filter(({ date }) => {
    const showIsOver = new Date(date).getTime() < Date.now() - 86400000;
    return !showIsOver;
  });

  return (
    <div
      className={`${styles["tour-dates"]} ${
        futureTourDates.length === 1 ? styles.single : ""
      }`}
    >
      <div className={styles.column}>
        {futureTourDates.map(
          ({ date, city, venue, ticketLink, soldOut, opener }, i) => {
            return (
              <Link
                className={styles["tour-date"]}
                key={date}
                href={ticketLink}
                target="_blank"
              >
                <div className={styles.date}>{formateDate(date)}</div>
                <div
                  className={`${styles.city} ${
                    city.length > 12 ? styles.long : ""
                  }`}
                >
                  {city}
                </div>
                <div
                  className={`${styles.venue} ${
                    venue.length >= 20 ? styles.long : ""
                  }`}
                >
                  {venue}
                </div>
                {soldOut && <div className={styles["sold-out"]}>Sold out!</div>}
                <img
                  className={styles.image}
                  src={`/images/greatest-show-in-human-history/city${
                    i === 0 ? "1" : "2"
                  }.png`}
                  alt=""
                />
              </Link>
            );
          }
        )}
      </div>
    </div>
  );
}
