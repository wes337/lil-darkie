"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isMobileSizedScreen } from "@/app/utils";
import { CDN_URL } from "@/app/assets";
import useStore from "@/app/store";
import "@/styles/landing.scss";

export default function Landing() {
  const router = useRouter();
  const {
    flashing,
    setFlashing,
    setBloodTransition,
    flashingEnabled,
    cookies,
  } = useStore();

  const onClick = () => {
    // setBloodTransition(true);
    // setTimeout(() => router.push("/tour-2024"), 400);
  };

  return (
    <div className={`landing${flashing ? " flashing" : ""}`} onClick={onClick}>
      <div className="star-bg" />
      <div className="globe-guy">
        <Image
          src={`${CDN_URL}/globe-guy.png`}
          alt=""
          width={1170}
          height={1153}
        />
      </div>
      <button
        className="make-track-button"
        onClick={(event) => {
          event.stopPropagation();
          setBloodTransition(true);
          setTimeout(() => router.push("/sampler"), 400);
        }}
      >
        <img src={`${CDN_URL}/bubble.png`} alt="" />
        <div className="make">Make your own</div>
        <div className="lil-darkie">Lil Darkie</div>
        <div className="track">Track</div>
      </button>
      {/* <button className="landing-footer" onClick={onClick}>
        <div
          className="buy-tickets"
          onPointerOver={() => {
            if (!flashingEnabled) {
              return;
            }

            setFlashing(true);
          }}
          onPointerLeave={() => setFlashing(false)}
          style={{
            marginBottom: isMobileSizedScreen()
              ? !cookies
                ? "300px"
                : "80px"
              : undefined,
          }}
        >
          Buy Tickets Here
        </div>
      </button> */}
      <div className="landing-footer">
        <a
          href="https://open.spotify.com/artist/62F9BiUmjqeXbBztCwiX1U?si=pFe2sfIXQb-JRli_XgwhwQ"
          target="_blank"
        >
          <Image
            src={`${CDN_URL}/icons/Spotify_Icon_RGB_White.png`}
            alt="Spotify"
            width={64}
            height={64}
          />
        </a>
        <a
          href="https://music.apple.com/us/artist/lil-darkie/1411605197"
          target="_blank"
        >
          <Image
            src={`${CDN_URL}/icons/apple-music.png`}
            alt="Apple Music"
            width={64}
            height={64}
          />
        </a>
        <a
          href="https://music.apple.com/us/artist/lil-darkie/1411605197"
          target="_blank"
        >
          <Image
            src={`${CDN_URL}/icons/youtube-blackwhite.png`}
            alt="YouTube"
            width={80}
            height={64}
          />
        </a>
      </div>
      <div className="copyright">
        Copyright © 2025 Lil Darkie® All Rights Reserved
      </div>
    </div>
  );
}
