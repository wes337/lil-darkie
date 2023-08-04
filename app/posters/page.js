"use client";
import { useState, useEffect } from "react";
import { CDN_URL } from "@/app/utils";
import Swiper from "@/components/swiper";
import "@/styles/posters.scss";

export default function Posters() {
  const [posters, setPosters] = useState([]);

  useEffect(() => {
    const posters = [];

    for (let i = 1; i <= 13; i++) {
      posters.push(`${CDN_URL}/photos/posters/${i}.webp`);
    }

    setPosters(posters);
  }, []);

  if (!posters || posters.length === 0) {
    return null;
  }

  return (
    <div className="posters">
      <h1>Posters</h1>
      <Swiper items={posters} />
    </div>
  );
}
