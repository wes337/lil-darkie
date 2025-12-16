"use client";

import { useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ASSETS, CDN_URL } from "@/app/assets";
import { preloadUrls } from "@/app/utils";
import useStore from "@/app/store";
import styles from "@/styles/top-bar.module.scss";

export default function TopBar() {
  const pathname = usePathname();
  const { lightMode, peachMode, sticky, setBloodTransition, setNavOpen } =
    useStore();

  const transitionTo = (url) => {
    if (pathname === url) {
      return;
    }

    setBloodTransition(true);
    setTimeout(() => window.open(url, "_self"), 500);
  };

  const hideTopBarLogo = false;

  useEffect(() => {
    preloadUrls([
      "/comics",
      "/sampler",
      "/gallery",
      "/posters",
      "/blog",
      "/the-lost-songs",
    ]);
  }, []);

  return (
    <>
      <div
        className={`${styles["top-bar"]} ${
          lightMode || peachMode ? ` ${styles.light}` : ""
        }${sticky ? ` ${styles.sticky}` : ""}`}
      >
        <a href="https://www.smalldarkone.com">
          <Image src={ASSETS.gunIcon} alt="" width={48} height={48} />
          <span>Merch</span>
        </a>
        <button onClick={() => transitionTo("/sampler")}>
          <Image src={ASSETS.skullIcon} alt="" width={48} height={48} />
          <span>Sampler</span>
        </button>
        {pathname === "/" ? (
          <button className={`${styles["top-bar-logo"]} ${styles.head}`}>
            <img src={`${CDN_URL}/greatest/lil-darkie.png`} alt="Lil Darkie" />
          </button>
        ) : (
          <button
            onClick={() => transitionTo("/")}
            className={`${styles["top-bar-logo"]} ${
              sticky ? ` ${styles.sticky}` : ""
            } ${hideTopBarLogo ? ` ${styles.hide}` : ""}`}
          >
            <Image
              className={`${styles["logo-yellow"]}`}
              src={ASSETS.logoYellow}
              alt="Lil Darkie"
              width={254}
              height={68}
            />
            <Image
              className={`${styles["logo-primary"]}`}
              src={ASSETS.logo}
              alt="Lil Darkie"
              width={254}
              height={68}
            />
          </button>
        )}

        <button onClick={() => transitionTo("/comics")}>
          <Image src={ASSETS.graveIcon} alt="" width={48} height={48} />
          <span>Comics</span>
        </button>
        <button onClick={() => setNavOpen(true)}>
          <Image src={ASSETS.boozeIcon} alt="" width={48} height={48} />
          <span>More</span>
        </button>
      </div>
      <div
        className={`${styles["top-bar-back"]} ${
          sticky ? ` ${styles.sticky}` : ""
        }${pathname === "/" ? ` ${styles.black}` : ""}`}
      />
    </>
  );
}
