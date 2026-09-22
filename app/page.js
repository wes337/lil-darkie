"use client";

import { useEffect } from "react";
import useStore from "@/app/store";
import styles from "@/styles/landing.module.scss";

const TICKETS_URL =
  "https://www.neckofthewoodssf.com/tm-event/lil-darkie-album-release-show/";

export default function Landing() {
  const { setLightMode, setNoScroll } = useStore();

  const openTickets = () => {
    window.open(TICKETS_URL, "_blank", "noopener");
  };

  useEffect(() => {
    setLightMode(false);
    setNoScroll(true);

    return () => {
      setLightMode(false);
      setNoScroll(false);
    };
  }, [setLightMode, setNoScroll]);

  return (
    <div className={styles.landing} onClick={openTickets}>
      <div className={styles.top}>
        <h1 className={styles.album}>“red”</h1>
        <h2 className={styles.subtitle}>album release show</h2>
      </div>

      <div className={styles.artwork}>
        <img src="/images/red/background.jpeg" alt="" draggable={false} />
      </div>

      <div className={styles.bottom}>
        <p className={styles.details}>
          Saturday October 17th
          <br />
          406 Clement St, San Francisco, CA 94118
          <br />@ Neck of the Woods
        </p>
        <p className={styles.tickets}>tickets available here</p>
      </div>

      <div className={styles.footer}>
        <div className={styles.copyright}>
          Copyright © 2026 Lil Darkie® All Rights Reserved
        </div>
      </div>
    </div>
  );
}
