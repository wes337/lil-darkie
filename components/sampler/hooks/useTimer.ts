import { useState, useLayoutEffect } from "react";

const useTimer = (running: boolean) => {
  const [now, setNow] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!running) {
      return;
    }

    const id = requestAnimationFrame(() => setNow(performance.now()));

    return () => cancelAnimationFrame(id);
  }, [running, now]);

  return running ? now : null;
};

export default useTimer;
