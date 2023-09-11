"use client";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ASSETS } from "@/app/assets";
import { isMobileSizedScreen, formateDate } from "@/app/utils";
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
      <Image
        className="title"
        src={ASSETS.fallTourTitle}
        alt=""
        style={{
          transform: `translateY(${
            isMobileSizedScreen()
              ? Math.min(Math.floor((scroll - 2) * -1), 0)
              : Math.floor(scroll + 5 * 2)
          }px)`,
        }}
        width={800}
        height={278}
      />
      <Image
        className="end"
        src={ASSETS.end}
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
        width={358}
        height={335}
      />
      <Image
        className="bottom"
        src={ASSETS.bottom}
        alt=""
        width={1200}
        height={512}
      />
      <div className={`panel${scroll >= 100 ? " scroll" : ""}`}>
        <div className="vote-guy">
          <Image
            src={ASSETS.voteGuy}
            alt=""
            width={800}
            height={783}
            priority
          />
        </div>
        <div className="paratrooper">
          <Image
            src={ASSETS.paratrooper}
            alt=""
            width={800}
            height={881}
            priority
          />
        </div>
        <div className="tour-cities">
          {tourDates.map(
            ({ date, city, venue, ticketLink, soldOut, opener }, i) => {
              return (
                <Link
                  className={`city ${i % 2 ? "right" : "left"}`}
                  key={date}
                  href={ticketLink}
                  target="_blank"
                >
                  {city.split(",")[0].trim()}
                  <div className="date">{formateDate(date)}</div>
                  <div className="venue">@ {venue}</div>
                  {opener && (
                    <div className="opener">
                      <span>with</span>
                      {opener}
                    </div>
                  )}
                  {soldOut && <div className="sold-out">Sold out!</div>}
                </Link>
              );
            }
          )}
        </div>
        <div className="copyright">
          Copyright © 2023 Lil Darkie®
          <br />
          All Rights Reserved
        </div>
      </div>
    </div>
  );
}
