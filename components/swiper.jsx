"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import Image from "next/image";
import useStore from "@/app/store";
import { ASSETS } from "@/app/assets";
import "@/styles/swiper.scss";

const Hammer = () => import("hammerjs");

export default function Swiper({ items = [] }) {
  const swiperRef = useRef();
  const { setHideScroll } = useStore();
  const [hasPrevious, setHasPrevious] = useState(false);

  const initItems = useCallback(() => {
    if (items.length === 0) {
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
  }, [items]);

  useEffect(() => {
    setHideScroll(true);

    return () => {
      setHideScroll(false);
    };
  }, [setHideScroll]);

  useEffect(() => {
    const allItems = document.querySelectorAll(".item");

    allItems.forEach(async (element) => {
      const hammer = await Hammer().then((mod) => mod.default || mod);
      const hammertime = new hammer(element);

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
          Math.abs(event.deltaX) < 80 || Math.abs(event.velocityX) < 0.01;

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
  }, [initItems]);

  if (items.length === 0) {
    return null;
  }

  const goToNext = () => {
    const currentItem = document.querySelector(".item:not(.removed)");

    if (!currentItem) {
      return;
    }

    setHasPrevious(true);

    currentItem.classList.add("removed");

    const velocityX = 1;
    const velocityY = 1;
    const deltaX = 1;
    const deltaY = 1;

    var moveOutWidth = document.body.clientWidth;

    var endX = Math.max(Math.abs(velocityX) * moveOutWidth, moveOutWidth);

    var toX = deltaX > 0 ? endX : -endX;
    var endY = Math.abs(velocityY) * moveOutWidth;
    var toY = deltaY > 0 ? endY : -endY;
    var xMulti = deltaX * 0.03;
    var yMulti = deltaY / 80;
    var rotate = xMulti * yMulti;

    currentItem.style.transform =
      "translate(" +
      toX +
      "px, " +
      (toY + deltaY) +
      "px) rotate(" +
      rotate +
      "deg)";

    initItems();

    const newItems = document.querySelectorAll(".item:not(.removed)");

    if (newItems.length === 0) {
      const removedItems = document.querySelectorAll(".item.removed");
      removedItems.forEach((element) => element.classList.remove("removed"));
      initItems();
      setHasPrevious(false);
    }
  };

  const goToPrevious = () => {
    const removedItems = document.querySelectorAll(".item.removed");
    const lastItem = removedItems[removedItems.length - 1];

    if (!lastItem) {
      return;
    }

    if (removedItems.length === 1) {
      setHasPrevious(false);
    }

    lastItem.classList.remove("removed");
    initItems();
  };

  return (
    <>
      <div className="swiper" ref={swiperRef}>
        {items.map((item) => (
          <div className="item" key={item}>
            <img src={item} alt="" />
          </div>
        ))}
      </div>
      <div className="swiper-controls">
        <button onClick={goToPrevious} disabled={!hasPrevious}>
          <Image
            className="flip"
            src={ASSETS.arrowIcon}
            alt=""
            width={60}
            height={72}
          />
          <div className="swiper-label">Prev</div>
        </button>
        <button onClick={goToNext}>
          <div className="swiper-label">Next</div>
          <Image src={ASSETS.arrowIcon} alt="" width={60} height={72} />
        </button>
      </div>
    </>
  );
}
