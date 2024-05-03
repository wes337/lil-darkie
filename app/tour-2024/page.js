"use client";
import Image from "next/image";
import Link from "next/link";
import { ASSETS } from "@/app/assets";
import { formateDate } from "@/app/utils";
import tourDates from "@/data/tour-dates-2024.json";
import "@/styles/tour-2024.scss";

export default function Tour2024() {
  return (
    <div className="tour-2024">
      <div className="star-bg" />
      <div className="globe-guy">
        <Image src={ASSETS.globeGuy} alt="" width={1170} height={1153} />
      </div>
      <div className="tour-dates">
        <div className="list">
          {tourDates.map(({ date, city, country, ticketLink, soldOut }, i) => {
            return (
              <Link key={date} className="tour-date" href={ticketLink}>
                <div className="city">{city}</div>
                <div className="country">{country}</div>
                <div className="date">{formateDate(date)}</div>
                <div className="tickets">
                  <div>Get Tickets</div>
                  {soldOut && <div className="sold-out">Sold out!</div>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="copyright">
        Copyright © 2024 Lil Darkie® All Rights Reserved
      </div>
    </div>
  );
}
