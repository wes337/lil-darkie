"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ASSETS } from "@/app/assets";
import useStore from "@/app/store";
import "@/styles/epilepsy.scss";

export default function Epilepsy() {
  const { flashingEnabled } = useStore();
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const hide = localStorage?.getItem?.("lil-darkie-epilepsy");

    if (hide) {
      setHide(true);
    }
  }, []);

  const onClick = () => {
    localStorage?.setItem?.("lil-darkie-epilepsy", true);
    setHide(true);
  };

  if (hide || !flashingEnabled) {
    return null;
  }

  return (
    <div className="epilepsy">
      <Image
        className="epilepsy-logo"
        src={ASSETS.logo}
        alt="Lil Darkie"
        width={254}
        height={68}
      />

      <div className="epilepsy-inner">
        <h1>Epilepsy</h1>
        <h1>Warning</h1>
        <button onClick={onClick}>Ok</button>
      </div>
    </div>
  );
}
