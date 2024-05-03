"use client";
import { useRouter } from "next/navigation";
import { CDN_URL } from "@/app/assets";
import useStore from "@/app/store";
import "@/styles/make-track-button.scss";

export default function MakeTrackButton() {
  const router = useRouter();
  const { setBloodTransition } = useStore();

  return (
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
  );
}
