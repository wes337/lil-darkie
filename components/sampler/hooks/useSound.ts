import { useState, useEffect, useCallback } from "react";
import Sound from "../utils/Sound";

const useSound = (soundFilePath: string) => {
  const [sound, setSound] = useState({ play: () => {} });
  const play = useCallback(() => sound.play(), [sound]);

  useEffect(() => {
    setSound(new Sound(soundFilePath));
  }, [soundFilePath]);

  return [play] as const;
};

export default useSound;
