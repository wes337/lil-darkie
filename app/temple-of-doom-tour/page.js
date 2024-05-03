"use client";
import Image from "next/image";
import Link from "next/link";
import { ASSETS } from "@/app/assets";
import { isMobileSizedScreen, formateDate } from "@/app/utils";
import tourDates from "@/data/temple-of-doom-tour-dates.json";
import useStore from "@/app/store";
import "@/styles/temple-of-doom-tour.scss";

export default function TempleOfDoomTour() {
  const { scroll } = useStore();

  return (
    <div className="temple-of-doom-tour">
      <div className="background" />
      <Image
        className="monster"
        src="/images/temple-of-doom/monster.png"
        alt=""
        width={800}
        height={278}
      />
      <h1 className="title">
        The Temple
        <br />
        of Doom Tour
      </h1>
      <div className={`panel${scroll >= 100 ? " scroll" : ""}`}>
        <div className="tour-cities">
          {tourDates.map(
            ({ date, city, venue, ticketLink, soldOut, opener }, i) => {
              const showIsOver =
                new Date(date).getTime() < Date.now() - 86400000;

              return (
                <Link
                  className={`city ${i % 2 ? "right" : "left"} ${
                    showIsOver ? "over" : ""
                  }`}
                  key={date}
                  href={ticketLink}
                  target="_blank"
                  disabled={showIsOver}
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
      </div>
      <div className="copyright">
        Copyright © 2024 Lil Darkie® All Rights Reserved
      </div>
    </div>
  );
}
