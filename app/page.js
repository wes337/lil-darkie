"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CDN_URL } from "@/app/assets";
import { formateDate } from "@/app/utils";
import useStore from "@/app/store";
import tourDates from "@/data/greatest-show-in-human-history.json";
import "@/styles/landing.scss";

export default function Landing() {
  const router = useRouter();
  const { scroll } = useStore();

  useEffect(() => {
    console.log(1 + scroll * 0.01);
  }, [scroll]);

  return (
    <div className={`landing`}>
      <CurtainsAnimation />
      <div className="curtains">
        <img
          className="curtain top-left"
          src={`${CDN_URL}/greatest/top-left-curtain.png`}
          alt=""
          style={{
            transform: `translate(${scroll * -0.1}px, ${scroll * -0.15}px)`,
          }}
        />
        <img
          className="curtain top-right"
          src={`${CDN_URL}/greatest/top-right-curtain.png`}
          alt=""
          style={{
            transform: `translate(${scroll * 0.1}px, ${scroll * -0.15}px)`,
          }}
        />
        <img
          className="curtain left"
          src={`${CDN_URL}/greatest/left-curtain.png`}
          alt=""
          style={{
            transform: `translate(${scroll * -0.25}px, ${scroll * -0.2}px)`,
          }}
        />
        <img
          className="curtain right"
          src={`${CDN_URL}/greatest/right-curtain.png`}
          alt=""
          style={{
            transform: `translate(${scroll * 0.25}px, ${scroll * 0.2}px)`,
          }}
        />
      </div>
      <div className="header">
        <img
          className="presents"
          src={`${CDN_URL}/greatest/presents.png`}
          alt="Presents"
          style={{
            transform: `translateY(${scroll * -1}%)`,
          }}
        />
        <div
          className="main-text"
          style={{
            transform: `translateY(${scroll * -0.3}%) scale(${
              1 + scroll * 0.001
            })`,
          }}
        >
          <img
            className="the"
            src={`${CDN_URL}/greatest/the-banner.png`}
            alt=""
          />
          <img
            src={`${CDN_URL}/greatest/greatest-show-in-human-history.png`}
            alt="The Greatest Show In Human History"
          />
        </div>
        <img
          className="main-art"
          src={`${CDN_URL}/greatest/main-art-2.png`}
          alt=""
          style={{ translate: `-50% ${50 + scroll * -0.15}%` }}
        />
        <div
          className="dates-banner"
          style={{
            transform: `translateY(${scroll * -0.5}%) scale(${
              1 + scroll * 0.001
            })`,
          }}
        >
          <img
            className="dates-curtains"
            src={`${CDN_URL}/greatest/bottom-curtain.png`}
            alt=""
          />
          <img
            className="dates-text"
            src={`${CDN_URL}/greatest/dates-banner.png`}
            alt="North American Tour Dates 2025"
          />
        </div>
      </div>
      <img
        className="happy-mask"
        src={`${CDN_URL}/greatest/happy-mask.png`}
        alt=""
        style={{
          translate: `-${Math.min(scroll * 1, 260)}px -${scroll * 0.33}px`,
        }}
      />
      <img
        className="sad-mask"
        src={`${CDN_URL}/greatest/sad-mask.png`}
        alt=""
        style={{
          translate: `${Math.min(scroll * 1, 260)}px -${scroll * 0.33}px`,
        }}
      />
      <TourDates />
      <div className="footer">
        <div className="copyright">
          Copyright © 2025 Lil Darkie® All Rights Reserved
        </div>
      </div>
    </div>
  );
}

function CurtainsAnimation() {
  const [ended, setEnded] = useState(false);

  const onAnimationEnd = () => {
    setEnded(true);
  };

  if (ended) {
    return null;
  }

  return (
    <div className="curtains-animation" onAnimationEnd={onAnimationEnd}>
      <img
        className="animated-curtain top-left"
        src={`${CDN_URL}/greatest/top-left-curtain.png`}
        alt=""
      />
      <img
        className="animated-curtain top-right"
        src={`${CDN_URL}/greatest/top-right-curtain.png`}
        alt=""
      />
      <img
        className="animated-curtain left"
        src={`${CDN_URL}/greatest/left-curtain.png`}
        alt=""
      />
      <img
        className="animated-curtain right"
        src={`${CDN_URL}/greatest/right-curtain.png`}
        alt=""
      />
    </div>
  );
}

function TourDates() {
  return (
    <div className="tour-dates">
      <div className="column">
        {tourDates
          .slice(0, Math.ceil((tourDates.length - 1) / 2))
          .map(({ date, city, venue, ticketLink, soldOut, opener }, i) => {
            const showIsOver = new Date(date).getTime() < Date.now() - 86400000;

            return (
              <Link
                className={`tour-date`}
                key={date}
                href={ticketLink}
                target="_blank"
                disabled={showIsOver}
              >
                <div className="date">{formateDate(date)}</div>
                <div className={`city ${city.length > 12 ? "long" : ""}`}>
                  {city}
                </div>
                <div className={`venue ${venue.length >= 20 ? "long" : ""}`}>
                  {venue}
                </div>
                {/* <div className="tickets">
                <div>Tickets</div>
              </div> */}
                {soldOut && <div className="sold-out">Sold out!</div>}
              </Link>
            );
          })}
      </div>
      <div className="column">
        {tourDates
          .slice(Math.ceil((tourDates.length - 1) / 2))
          .map(({ date, city, venue, ticketLink, soldOut, opener }, i) => {
            const showIsOver = new Date(date).getTime() < Date.now() - 86400000;

            return (
              <Link
                className={`tour-date`}
                key={date}
                href={ticketLink}
                target="_blank"
                disabled={showIsOver}
              >
                <div className="date">{formateDate(date)}</div>
                <div className={`city ${city.length > 12 ? "long" : ""}`}>
                  {city}
                </div>

                <div className={`venue ${venue.length >= 20 ? "long" : ""}`}>
                  {venue}
                </div>

                {/* <div className="tickets">
                <div>Tickets</div>
              </div> */}
                {soldOut && <div className="sold-out">Sold out!</div>}
              </Link>
            );
          })}
      </div>
    </div>
  );
}
