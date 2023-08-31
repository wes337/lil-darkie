"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/app/assets";
import useStore from "@/app/store";
import Face from "@/components/face";
import "@/styles/landing.scss";

export default function Landing() {
  const router = useRouter();
  const {
    flashing,
    setFlashing,
    setBloodTransition,
    flashingEnabled,
    setFlashingEnabled,
  } = useStore();

  const toggleStrobe = () => {
    const nextFlashingEnabled = !flashingEnabled;
    setFlashingEnabled(nextFlashingEnabled);

    if (nextFlashingEnabled) {
      setTimeout(() => {
        setFlashing(true);
      }, 200);
    } else {
      setFlashing(false);
    }
  };

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
          <Image
            src={ASSETS.fallTourTitleDark}
            alt=""
            width={800}
            height={278}
          />
        </div>
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
          Get Tickets
        </div>
      </button>
      <button className="strobe-toggle" onClick={toggleStrobe}>
        <span className="label">Strobe</span>
        <span className="value">{flashingEnabled ? "On" : "Off"}</span>
      </button>
      <div className="landing-monsters">
        <Image src={ASSETS.monsters} alt="" width={1920} height={273} />
      </div>
    </div>
  );
}
