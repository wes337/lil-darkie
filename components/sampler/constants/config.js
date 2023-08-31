import { CDN_URL } from "@/app/assets";

export const config = {
  id: 0,
  title: "Sequence 1",
  trackList: [
    {
      title: "Kick",
      soundFile: "kick",
      color: "red",
      onNotes: [],
    },
    {
      title: "Kick 2",
      soundFile: "kick2",
      color: "red",
      onNotes: [],
    },
    {
      title: "Snare",
      soundFile: "snare",
      color: "white",
      onNotes: [],
    },
    {
      title: "Open Hat",
      soundFile: "hh_open",
      color: "yellow",
      onNotes: [],
    },
    {
      title: "Closed Hat",
      soundFile: "hh_closed",
      color: "yellow",
      onNotes: [],
    },
    {
      title: "Growl",
      soundFile: "growl",
      color: "green",
      onNotes: [],
    },
    {
      title: "Pig Squeal",
      soundFile: "pig",
      color: "green",
      onNotes: [],
    },
    {
      title: "Huh",
      soundFile: "huh",
      color: "purple",
      onNotes: [],
    },
    {
      title: "Yuh",
      soundFile: "yuh",
      color: "purple",
      onNotes: [],
    },
    {
      title: "Laugh",
      soundFile: "lol",
      color: "blue",
      onNotes: [],
    },
    {
      title: "Wood Block",
      soundFile: "wood",
      color: "blue",
      onNotes: [],
    },
  ],
};

export const soundFiles = {
  kick: `${CDN_URL}/sounds/kick.wav`,
  kick2: `${CDN_URL}/sounds/kick2.wav`,
  snare: `${CDN_URL}/sounds/snare.wav`,
  hh_open: `${CDN_URL}/sounds/hh_open.wav`,
  hh_closed: `${CDN_URL}/sounds/hh_closed.wav`,
  pig: `${CDN_URL}/sounds/pig.wav`,
  yuh: `${CDN_URL}/sounds/yuh.wav`,
  huh: `${CDN_URL}/sounds/huh.wav`,
  wood: `${CDN_URL}/sounds/wood.wav`,
  growl: `${CDN_URL}/sounds/growl.wav`,
  lol: `${CDN_URL}/sounds/lol.wav`,
};
