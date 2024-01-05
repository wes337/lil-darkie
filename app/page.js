"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS, CDN_URL } from "@/app/assets";
import useStore from "@/app/store";
import "@/styles/landing.scss";

export default function Landing() {
  const router = useRouter();
  const { flashing, setFlashing, setBloodTransition, flashingEnabled } =
    useStore();

  const listenToNewAlbum = () => {
    setBloodTransition(true);
    setTimeout(() => {
      window.location.href = "https://vyd.co/Thefutureisdarkdeluxe";
    }, 400);
  };

  return (
    <div
      className={`landing${flashing ? " flashing" : ""}`}
      onClick={listenToNewAlbum}
    >
      <div className="star-bg" />
      <div className="globe-guy">
        <Image src={ASSETS.globeGuy} alt="" width={1170} height={1153} />
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
      <button className="landing-footer" onClick={listenToNewAlbum}>
        <div
          className="tickets"
          onPointerOver={() => {
            if (!flashingEnabled) {
              return;
            }

            setFlashing(true);
          }}
          onPointerLeave={() => setFlashing(false)}
        >
          Listen to the New Album
        </div>
      </button>
      <div className="copyright">
        Copyright © 2024 Lil Darkie® All Rights Reserved
      </div>
    </div>
  );
}
