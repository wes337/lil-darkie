"use client";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CDN_URL } from "@/app/assets";
import { formateDate } from "@/app/utils";
import useStore from "@/app/store";
import tourDates from "@/data/these-shows-exist.json";
import "@/styles/landing.scss";

export default function Landing() {
  const router = useRouter();
  const { setLightMode, scroll } = useStore();

  useEffect(() => {
    setLightMode(true);

    return () => setLightMode(false);
  }, [setLightMode]);

  const onClick = () => {
    // setBloodTransition(true);
    // setTimeout(() => router.push("/tour-2024"), 400);
  };

  return (
    <div className={`landing`} onClick={onClick}>
      <img
        className="background"
        src={`/images/these-shows-exist/background-sm.png`}
        alt=""
      />

      <div className="header">
        <img
          className="title"
          src={`/images/these-shows-exist/title.png`}
          alt="These Shows Exist"
        />
      </div>
      <div className="tour-dates">
        {tourDates.map(
          ({ date, city, venue, ticketLink, soldOut, opener }, i) => {
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
                <div className="location">
                  <div className={`city ${city.length > 12 ? "long" : ""}`}>
                    {city}
                  </div>
                  <div className={`venue ${venue.length >= 20 ? "long" : ""}`}>
                    @ {venue}
                  </div>
                </div>
                <div className="tickets">
                  <div>Tickets</div>
                </div>
                {soldOut && <div className="sold-out">Sold out!</div>}
              </Link>
            );
          }
        )}
      </div>

      <div className="copyright">
        Copyright © 2025 Lil Darkie® All Rights Reserved
      </div>
    </div>
  );
}
