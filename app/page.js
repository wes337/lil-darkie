"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CDN_URL } from "@/app/assets";
import useStore from "@/app/store";
import "@/styles/landing.scss";

export default function Landing() {
  const router = useRouter();
  const { setBloodTransition } = useStore();

  const onClick = () => {
    setBloodTransition(true);
    setTimeout(() => router.push("/brazil-australia-new-zealand"), 400);
  };

  return (
    <div className="landing" onClick={onClick}>
      <div className="temple-bg" />
      <div className="monster">
        <Image
          src={`${CDN_URL}/temple-of-doom/monster.png`}
          alt=""
          width={1000}
          height={604}
        />
      </div>
      <div className="band">
        <Image
          src={`${CDN_URL}/temple-of-doom/band.png`}
          alt=""
          width={600}
          height={1177}
        />
      </div>
      <div className="main">
        <Image
          className="lil-darkie"
          src={`${CDN_URL}/temple-of-doom/logo.png`}
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
        <button
          className="get-tickets br"
          onClick={(event) => {
            event.stopPropagation();
            setBloodTransition(true);
            setTimeout(() => router.push("/brazil-australia-new-zealand"), 400);
          }}
        >
          <div className="country">
            <div className="flag">
              <Image
                src={`${CDN_URL}/flags/brazil.png`}
                alt=""
                width={200}
                height={140}
              />
            </div>
            <div className="country-name">Brazil</div>
          </div>
          <div className="country">
            <div className="flag">
              <Image
                className="flag"
                src={`${CDN_URL}/flags/australia.png`}
                alt=""
                width={200}
                height={100}
              />
            </div>
            <div className="country-name">Australia</div>
          </div>
          <div className="country">
            <div className="flag">
              <Image
                className="flag"
                src={`${CDN_URL}/flags/new zealand.png`}
                alt=""
                width={200}
                height={100}
              />
            </div>
            <div className="country-name">New Zealand</div>
          </div>
        </button>
      </div>
      <div className="copyright">
        Copyright © 2025 Lil Darkie® All Rights Reserved
      </div>
    </div>
  );
}
