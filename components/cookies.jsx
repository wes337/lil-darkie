"use client";
import { useState } from "react";
import "@/styles/cookies.scss";

export default function Cookies() {
  const [hide, setHide] = useState(
    localStorage?.getItem?.("lil-darkie-cookies") || false
  );

  const onClick = () => {
    localStorage?.setItem?.("lil-darkie-cookies", true);
    setHide(true);
  };

  if (hide) {
    return null;
  }

  return (
    <div className="cookies">
      <div className="cookies-inner">
        <p>
          To improve your online experience, this website uses cookies. By
          clicking Accept, you represent to Lil Darkie® that you are located
          outside the European Economic Area and consent to the use of cookies.
          For more information on this website&apos;s cookie policies and how we
          use cookies to improve your experience on lildarkie.com and its
          affiliated websites, including smalldarkone.com, please see our
          Privacy Policy.
        </p>
        <button onClick={onClick}>Accept</button>
      </div>
    </div>
  );
}
