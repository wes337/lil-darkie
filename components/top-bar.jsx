"use client";
import { useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ASSETS } from "@/app/assets";
import useStore from "@/app/store";
import "@/styles/top-bar.scss";
import { preloadUrls } from "@/app/utils";

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lightMode, peachMode, sticky, setBloodTransition, setNavOpen } =
    useStore();

  const transitionTo = (url) => {
    if (pathname === url) {
      return;
    }

    setBloodTransition(true);
    setTimeout(() => router.push(url), 500);
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
        className={`top-bar${lightMode || peachMode ? " light" : ""}${
          sticky ? " sticky" : ""
        }`}
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
          <button className="top-bar-logo head">
            <img src={`/images/these-shows-exist/head.png`} alt="Lil Darkie" />
          </button>
        ) : (
          <button
            onClick={() => transitionTo("/")}
            className={`top-bar-logo${sticky ? " sticky" : ""} ${
              hideTopBarLogo ? " hide" : ""
            }`}
          >
            <Image
              className="logo-yellow"
              src={ASSETS.logoYellow}
              alt="Lil Darkie"
              width={254}
              height={68}
            />
            <Image
              className="logo-primary"
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
      <div className={`top-bar-back${sticky ? " sticky" : ""}`} />
    </>
  );
}
