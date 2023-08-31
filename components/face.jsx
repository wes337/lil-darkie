"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ASSETS } from "@/app/assets";
import useStore from "@/app/store";
import "@/styles/face.scss";

export default function Face() {
  const router = useRouter();
  const { setFlashing, setBloodTransition, flashingEnabled } = useStore();
  const [facePressed, setFacePressed] = useState(false);
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    let blinkTimeout;

    const triggerBlink = () => {
      setBlinking(true);
      const blinkDuration = 200;
      blinkTimeout = setTimeout(() => setBlinking(false), blinkDuration);
    };

    const blinkInterval = setInterval(() => {
      const random = Math.random() < 0.5;

      if (random) {
        triggerBlink();
      }
    }, 2000);

    return () => {
      clearInterval(blinkInterval);
      clearTimeout(blinkTimeout);
    };
  }, []);

  useEffect(() => {
    if (!flashingEnabled) {
      return;
    }

    setFlashing(facePressed);
  }, [facePressed, setFlashing, flashingEnabled]);

  return (
    <div
      className={`face${blinking ? " blink" : ""}`}
      onPointerDown={() => setFacePressed(true)}
      onPointerUp={() => setFacePressed(false)}
      onClick={() => {
        setBloodTransition(true);
        setTimeout(() => router.push("/fall-tour"), 400);
      }}
    >
      <div className={`red${facePressed ? " show" : ""}`} />
      <Image
        className={`normal${facePressed ? "" : " show"}`}
        src={ASSETS.face1}
        alt=""
        width={395}
        height={429}
      />
      <Image
        className={`blink${!facePressed && blinking ? " show" : ""}`}
        src={ASSETS.face1Blink}
        alt=""
        width={395}
        height={429}
      />
      <Image
        className={`speak${!blinking && facePressed ? " show" : ""}`}
        src={ASSETS.face2}
        alt=""
        width={431}
        height={538}
      />
      <Image
        className={`speak-blink${blinking && facePressed ? " show" : ""}`}
        src={ASSETS.face5}
        alt=""
        width={446}
        height={483}
      />
    </div>
  );
}
