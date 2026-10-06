import React, { useRef, useLayoutEffect, memo } from "react";
import "./play-head.scss";

const PlayHead = ({
  notesAreaWidthInPixels,
  timePerSequence,
  totalLapsedTime,
}: {
  notesAreaWidthInPixels: number;
  timePerSequence: number;
  totalLapsedTime: number;
}) => {
  const PlayHead = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!PlayHead.current) {
      return;
    }

    let progress = Math.min(
      (totalLapsedTime % timePerSequence) / timePerSequence,
      1
    );

    PlayHead.current.style.transform =
      "translate3d(" +
      (progress * notesAreaWidthInPixels).toFixed(2) +
      "px, 0, 0px)";
  }, [notesAreaWidthInPixels, timePerSequence, totalLapsedTime]);

  return <div className="play-head" ref={PlayHead}></div>;
};

export default memo(PlayHead);
