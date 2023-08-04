"use client";
import { useState, useEffect } from "react";
import { CDN_URL } from "@/app/utils";
import "@/styles/epilepsy.scss";

export default function Epilepsy() {
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

  if (hide) {
    return null;
  }

  return (
    <div className="epilepsy">
      <img
        className="epilepsy-logo"
        src={`${CDN_URL}/logo-small.png`}
        alt="Lil Darkie"
      />
      <div className="epilepsy-inner">
        <h1>Epilepsy</h1>
        <h1>Warning</h1>
        <button onClick={onClick}>Ok</button>
      </div>
    </div>
  );
}