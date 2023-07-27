"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CDN_URL } from "@/app/utils";
import useStore from "@/app/store";
import "@/styles/top-bar.scss";

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lightMode, sticky, setBloodTransition, setNavOpen } = useStore();

  const transitionTo = (url) => {
    if (pathname === url) {
      return;
    }

    setBloodTransition(true);
    setTimeout(() => router.push(url), 500);
  };

  return (
    <>
      <div
        className={`top-bar${lightMode ? " light" : ""}${
          sticky ? " sticky" : ""
        }`}
      >
        <Link href="https://www.smalldarkone.com">
          <img src={`${CDN_URL}/icons/gun.png`} alt="" />
          <span>Merch</span>
        </Link>
        <button onClick={() => transitionTo("/sampler")}>
          <img src={`${CDN_URL}/icons/skull.png`} alt="" />
          <span>Sampler</span>
        </button>
        <button
          onClick={() => transitionTo("/")}
          className={`top-bar-logo${sticky ? " sticky" : ""}`}
        >
          <img
            className="logo-yellow"
            src={`${CDN_URL}/logo-yellow.png`}
            alt="Lil Darkie"
          />
          <img
            className="logo-primary"
            src={`${CDN_URL}/logo-small.png`}
            alt="Lil Darkie"
          />
        </button>
        <button onClick={() => transitionTo("/fall-tour")}>
          <img src={`${CDN_URL}/icons/grave.png`} alt="" />
          <span>Fall Tour 2023</span>
        </button>
        <button onClick={() => setNavOpen(true)}>
          <img src={`${CDN_URL}/icons/booze.png`} alt="" />
          <span>More</span>
        </button>
      </div>
      <div className={`top-bar-back${sticky ? " sticky" : ""}`} />
    </>
  );
}
