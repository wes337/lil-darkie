"use client";
import { useEffect } from "react";
import Link from "next/link";
import { isMobileSizedScreen, formateDate, CDN_URL } from "@/app/utils";
import tourDates from "@/data/fall-tour-dates.json";
import useStore from "@/app/store";
import "@/styles/fall-tour.scss";

export default function FallTour() {
  const { setLightMode, scroll } = useStore();

  useEffect(() => {
    setLightMode(true);

    return () => setLightMode(false);
  }, [setLightMode]);

  return (
    <div className="fall-tour">
      <img
        className="title"
        src={`${CDN_URL}/fall-tour-title-small.png`}
        alt=""
        style={{
          transform: `translateY(${
            isMobileSizedScreen()
              ? Math.min(Math.floor((scroll - 2) * -1), 0)
              : Math.floor(scroll + 5 * 2)
          }px)`,
        }}
      />
      <img
        className="end"
        src={`${CDN_URL}/end.png`}
        alt=""
        style={{
          transform: `translateY(calc(
            ${isMobileSizedScreen() ? "280%" : "100%"} +
            ${
              isMobileSizedScreen()
                ? Math.floor(scroll / 4)
                : Math.floor(scroll * 0.75)
            }px))`,
        }}
      />
      <img className="bottom" src={`${CDN_URL}/bottom-small.png`} alt="" />
      <div className={`panel${scroll >= 100 ? " scroll" : ""}`}>
        <div className="vote-guy">
          <img src={`${CDN_URL}/vote_guy-small.png`} alt="" />
        </div>
        <div className="paratrooper">
          <img src={`${CDN_URL}/paratrooper-small.png`} alt="" />
        </div>
        <div className="tour-cities">
          {tourDates.map(({ date, city, venue, ticketLink }) => {
            return (
              <Link
                className="city"
                key={date}
                href={ticketLink}
                target="_blank"
              >
                {city.split(",")[0].trim()}
                <div className="date">{formateDate(date)}</div>
                <div className="venue">@ {venue}</div>
              </Link>
            );
          })}
        </div>
        <div className="copyright">
          Copyright © 2023 Lil Darkie
          <br />
          All Rights Reserved
        </div>
      </div>
    </div>
  );
}
