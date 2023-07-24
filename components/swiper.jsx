"use client";
import { useEffect, useRef } from "react";
import Hammer from "hammerjs";
import useStore from "@/app/store";
import "@/styles/swiper.scss";

export default function Swiper({ items }) {
  const swiperRef = useRef();
  const { setHideScroll } = useStore();

  const initItems = () => {
    if (typeof window === "undefined") {
      return;
    }

    const allItems = document.querySelectorAll(".item");
    const newItems = document.querySelectorAll(".item:not(.removed)");

    newItems.forEach((item, index) => {
      item.style.zIndex = allItems.length - index;
      item.style.transform =
        "scale(" +
        (20 - index) / 20 +
        ") translateY(-" +
        30 * index +
        "px)" +
        ` rotate(${index * 3}deg)`;
      item.style.opacity = (10 - index) / 10;
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setHideScroll(true);

    return () => {
      setHideScroll(false);
    };
  }, [setHideScroll]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    initItems();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const allItems = document.querySelectorAll(".item");

    allItems.forEach((element) => {
      const hammertime = new Hammer(element);

      hammertime.on("pan", (event) => {
        if (typeof window === "undefined") {
          return;
        }
        element.classList.add("moving");
      });

      hammertime.on("pan", (event) => {
        if (typeof window === "undefined") {
          return;
        }
        if (event.deltaX === 0) return;
        if (event.center.x === 0 && event.center.y === 0) return;

        const xMulti = event.deltaX * 0.03;
        const yMulti = event.deltaY / 80;
        const rotate = xMulti * yMulti;

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
        if (typeof window === "undefined") {
          return;
        }

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
          initItems();
        }

        const newItems = document.querySelectorAll(".item:not(.removed)");

        if (newItems.length === 0) {
          const removedItems = document.querySelectorAll(".item.removed");
          removedItems.forEach((element) =>
            element.classList.remove("removed")
          );
          initItems();
        }
      });
    });
  }, []);

  if (!items) {
    return null;
  }

  return (
    <div className="swiper" ref={swiperRef}>
      {items.map((item) => (
        <div className="item" key={item}>
          <img src={item} alt="" />
        </div>
      ))}
    </div>
  );
}
