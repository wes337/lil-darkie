"use client";
import { useState, useEffect } from "react";
import { ASSETS, CDN_URL } from "@/app/assets";
import useStore from "@/app/store";
import "@/styles/comics.scss";

const comics = [];

for (let i = 0; i <= 1; i++) {
  comics.push(`${CDN_URL}/comics/${i}.jpeg`);
}

export default function Comics() {
  const [selectedComic, setSelectedComic] = useState(0);
  const { setLightMode } = useStore();

  useEffect(() => {
    setLightMode(true);

    return () => setLightMode(false);
  }, [setLightMode]);

  const selectNextComic = () => {
    setSelectedComic((current) => {
      const next = current + 1;

      if (comics[next]) {
        return next;
      }

      return 0;
    });
  };

  const selectPreviousComic = () => {
    setSelectedComic((current) => {
      const previous = current - 1;

      if (comics[previous]) {
        return previous;
      }

      return comics.length - 1;
    });
  };

  return (
    <div className="comics">
      <h1>Comics</h1>
      <div className="comic-list">
        <img className="comic" src={comics[selectedComic]} alt="" />;
      </div>
      <div className="controls">
        <button onClick={selectNextComic}>
          <img
            className="flip"
            src={ASSETS.arrowIcon}
            alt=""
            width={60}
            height={72}
          />
          <div className="label">Prev</div>
        </button>
        <button onClick={selectPreviousComic}>
          <div className="label">Next</div>
          <img src={ASSETS.arrowIcon} alt="" width={60} height={72} />
        </button>
      </div>
      <div className="copyright">
        Copyright © 2024 Lil Darkie® All Rights Reserved
      </div>
    </div>
  );
}
