"use client";
import { useRouter } from "next/navigation";
import { CDN_URL } from "@/app/utils";
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
          <img src={`${CDN_URL}/fall-tour-title-dark-small.png`} alt="" />
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
        <img src={`${CDN_URL}/monsters-red.png`} alt="" />
      </div>
    </div>
  );
}
