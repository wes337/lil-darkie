"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useStore from "@/app/store";
import "@/styles/landing.scss";

export default function Landing() {
  const router = useRouter();
  const { setBloodTransition, cookies } = useStore();

  const onClick = () => {
    setBloodTransition(true);
    setTimeout(() => router.push("/temple-of-doom-tour"), 400);
  };

  return (
    <div className="landing" onClick={onClick}>
      <div className="temple-bg" />
      <div className="monster">
        <Image
          src="/images/temple-of-doom/monster.png"
          alt=""
          width={1000}
          height={604}
        />
      </div>
      <div className="band">
        <Image
          src="/images/temple-of-doom/band.png"
          alt=""
          width={600}
          height={1177}
        />
      </div>
      <div className="main">
        <Image
          className="lil-darkie"
          src="/images/temple-of-doom/logo.png"
          alt=""
          width={1006}
          height={576}
        />
        <h2 className="presents">Presents</h2>
        <h1 className="doom">
          <div>The Temple</div>
          <div>of Doom Tour</div>
        </h1>
      </div>
      <div className="featuring">
        <div>Featuring:</div>
        <div>Wendigo</div>
        <div>Cubensis</div>
        <div>MKULTRA</div>
        <div>Jack</div>
      </div>
      <div className="buttons">
        <button className="get-tickets">
          <span>Get Tickets</span>
        </button>
      </div>
      <div className="copyright">
        Copyright © 2024 Lil Darkie® All Rights Reserved
      </div>
    </div>
  );
}
