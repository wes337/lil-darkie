"use client";
import { useEffect, useRef } from "react";
import Hammer from "hammerjs";
import { CDN_URL } from "@/app/utils";
import "@/styles/posters.scss";

const posters = [];
for (let i = 1; i <= 13; i++) {
  posters.push(`${CDN_URL}/photos/posters/${i}.webp`);
}

export default function Posters() {
  const cardSwiperRef = useRef();

  const initCards = () => {
    const allCards = document.querySelectorAll(".poster");
    const newCards = document.querySelectorAll(".poster:not(.removed)");

    newCards.forEach((card, index) => {
      card.style.zIndex = allCards.length - index;
      card.style.transform =
        "scale(" +
        (20 - index) / 20 +
        ") translateY(-" +
        30 * index +
        "px)" +
        ` rotate(${index * 3}deg)`;
      card.style.opacity = (10 - index) / 10;
    });
  };

  useEffect(() => {
    document.documentElement.classList.add("no-scroll");

    return () => {
      document.documentElement.classList.remove("no-scroll");
    };
  }, []);

  useEffect(() => {
    initCards();
  }, []);

  useEffect(() => {
    const allCards = document.querySelectorAll(".poster");

    allCards.forEach((element) => {
      var hammertime = new Hammer(element);

      hammertime.on("pan", (event) => {
        element.classList.add("moving");
      });

      hammertime.on("pan", (event) => {
        if (event.deltaX === 0) return;
        if (event.center.x === 0 && event.center.y === 0) return;

        var xMulti = event.deltaX * 0.03;
        var yMulti = event.deltaY / 80;
        var rotate = xMulti * yMulti;

        event.target.style.transform =
          "translate(" +
          event.deltaX +
          "px, " +
          event.deltaY +
          "px) rotate(" +
          rotate +
          "deg)";
      });

      hammertime.on("panend", (event) => {
        element.classList.remove("moving");

        var moveOutWidth = document.body.clientWidth;
        var keep =
          Math.abs(event.deltaX) < 80 || Math.abs(event.velocityX) < 0.5;

        event.target.classList.toggle("removed", !keep);

        if (keep) {
          event.target.style.transform = "";
        } else {
          var endX = Math.max(
            Math.abs(event.velocityX) * moveOutWidth,
            moveOutWidth
          );
          var toX = event.deltaX > 0 ? endX : -endX;
          var endY = Math.abs(event.velocityY) * moveOutWidth;
          var toY = event.deltaY > 0 ? endY : -endY;
          var xMulti = event.deltaX * 0.03;
          var yMulti = event.deltaY / 80;
          var rotate = xMulti * yMulti;

          event.target.style.transform =
            "translate(" +
            toX +
            "px, " +
            (toY + event.deltaY) +
            "px) rotate(" +
            rotate +
            "deg)";
          initCards();
        }

        const newCards = document.querySelectorAll(".poster:not(.removed)");
        if (newCards.length === 0) {
          const removedCards = document.querySelectorAll(".poster.removed");
          removedCards.forEach((element) =>
            element.classList.remove("removed")
          );
          initCards();
        }
      });
    });
  }, []);

  return (
    <div className="posters" ref={cardSwiperRef}>
      <h1>Posters</h1>
      <div className="posters-list">
        {posters.map((poster) => (
          <div className="poster" key={poster}>
            <img src={poster} alt="" />
          </div>
        ))}
      </div>
    </div>
  );
}
