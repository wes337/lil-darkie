import Image from "next/image";
import Link from "next/link";
import { ASSETS } from "@/app/assets";
import { formateDate } from "@/app/utils";
import tourDates from "@/data/brazil-australia-new-zealand.json";
import "@/styles/brazil-australia-new-zealand.scss";

export default function BrazilAustraliaNewZealand() {
  return (
    <div className="brazil-australia-new-zealand">
      <div className="star-bg" />
      <div className="globe-guy">
        <Image src={ASSETS.globeGuy} alt="" width={1170} height={1153} />
      </div>
      <div className="tour-dates">
        <div className="list">
          {tourDates.map(({ date, city, country, ticketLink, soldOut }, i) => {
            return (
              <Link key={date} className="tour-date" href={ticketLink}>
                <div className="location">
                  <div className="city">{city}</div>
                  <div className="country">{country}</div>
                </div>
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
