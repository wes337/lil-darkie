"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ASSETS } from "@/app/assets";
import { isMobileSizedScreen } from "@/app/utils";
import blog from "@/data/blog.json";
import useStore from "@/app/store";
import "@/styles/blog.scss";

export default function Blog() {
  const { setPeachMode, scroll } = useStore();
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    setPeachMode(true);

    return () => setPeachMode(false);
  }, [setPeachMode]);

  useEffect(() => {
    const scrollPercentage = Math.floor((scroll / window.outerHeight) * 100);
    setScrollPercentage(scrollPercentage);
  }, [scroll]);

  return (
    <div className="blog">
      <div
        className="art-left"
        style={{
          opacity: `${100 - scrollPercentage * 4}%`,
          transform: `translate(-${Math.floor(scroll / 2)}px, ${Math.floor(
            scroll / 10
          )}px)`,
        }}
      >
        <Image src={ASSETS.emo} alt="" width={672} height={801} />
      </div>
      <div className="blog-entries">
        {blog.map((entry, i) => (
          <div key={i} className="entry">
            <div className="date">{entry.date}</div>
            <div className="content">{entry.content}</div>
          </div>
        ))}
      </div>
      <div
        className="art-right"
        style={{
          opacity: isMobileSizedScreen() ? 1 : `${scrollPercentage * 2}%`,
          transform: `translate(${Math.floor(scroll / 5)}px, ${Math.floor(
            scroll / 10
          )}px)`,
        }}
      >
        <Image src={ASSETS.billion} alt="" width={1000} height={1000} />
      </div>
    </div>
  );
}
