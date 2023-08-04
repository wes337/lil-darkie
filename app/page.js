"use client";
import { useRouter } from "next/navigation";
import { CDN_URL } from "@/app/utils";
import useStore from "@/app/store";
import Face from "@/components/face";
import "@/styles/landing.scss";

export default function Landing() {
  const router = useRouter();
  const { flashing, setFlashing, setBloodTransition } = useStore();

  return (
    <div className={`landing${flashing ? " flashing" : ""}`}>
      <Face />
      <button
        className="landing-footer"
        onClick={() => {
          setBloodTransition(true);
          setTimeout(() => router.push("/fall-tour"), 400);
        }}
      >
        <div className="landing-footer-tour">
          <img src={`${CDN_URL}/fall-tour-title-dark-small.png`} alt="" />
        </div>
        <div
          className="tickets"
          onPointerOver={() => setFlashing(true)}
          onPointerLeave={() => setFlashing(false)}
        >
          Get Tickets
        </div>
      </button>
      <div className="landing-monsters">
        <img src={`${CDN_URL}/monsters.png`} alt="" />
      </div>
    </div>
  );
}
