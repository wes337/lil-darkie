import { TOPICS, HELP_TEXT } from "./game-content.ts";
import type { ITEMS } from "./game-content.ts";

type FriendState = "waiting" | "searching" | "returned";
type BearState = "ripped" | "inhabited" | "collected";
type SewingState = "hidden" | "needle" | "threaded" | "used";
type WaterState = "none" | "empty" | "full" | "spent";
export type ItemId = keyof typeof ITEMS;
export type TopicId = keyof typeof TOPICS;
export type Progress = {
  topics: TopicId[];
  friend: FriendState;
  bear: BearState;
  sewing: SewingState;
  water: WaterState;
  usbInserted: boolean;
  safeUnlocked: boolean;
  keyTaken: boolean;
  cdTaken: boolean;
  cdInserted: boolean;
  lampOn: boolean;
  endingSeen: boolean;
};
// What an action did: the next progress, plus anything the UI should show or play.
export type Result = {
  progress: Progress;
  message?: string[];
  sound?: string;
  sequence?: "repair" | "ending";
  view?: string;
  conversation?: boolean;
  pageSounds?: Record<number, string>;
  itemPage?: number;
};

export function newProgress(): Progress {
  return {
    topics: [],
    friend: "waiting",
    bear: "ripped",
    sewing: "hidden",
    water: "none",
    usbInserted: false,
    safeUnlocked: false,
    keyTaken: false,
    cdTaken: false,
    cdInserted: false,
    lampOn: false,
    endingSeen: false,
  };
}

// Derive ownership from world changes, so consumed items cannot reappear.
export function inventory(p: Progress) {
  const items: ItemId[] = [];
  if (p.friend === "searching" && p.bear === "ripped")
    items.push("imaginary-friend");
  if (p.bear === "collected" && p.friend === "searching") items.push("bambi");
  if (p.water === "empty") items.push("glass-empty");
  if (p.water === "full") items.push("glass-half-full");
  if (p.water === "spent" && !p.usbInserted) items.push("usb-stick");
  if (p.keyTaken) items.push("key");
  if (p.cdTaken && !p.cdInserted) items.push("cd");
  if (p.sewing === "needle") items.push("needle");
  if (p.sewing === "threaded") items.push("needle-and-thread");
  return items;
}

export function interact(
  progress: Progress,
  target: string,
  item: ItemId | null = null,
): Result {
  const say = (...message: string[]) => ({ progress, message });
  const change = (patch: Partial<Progress>, ...message: string[]) => ({
    progress: { ...progress, ...patch },
    message,
  });

  if (item) {
    if (!inventory(progress).includes(item))
      return { ...say("nothing happens"), sound: "click-no" };
    if (
      item === "imaginary-friend" &&
      target === "bear-ripped" &&
      progress.bear === "ripped"
    ) {
      return {
        ...change({ bear: "inhabited" }, "you give soul to this form"),
        sound: "item-mystery-4",
      };
    }
    if (
      item === "needle" &&
      target === "thread-spool" &&
      progress.sewing === "needle"
    ) {
      return {
        ...change({ sewing: "threaded" }, "much more useful"),
        sound: "item-mystery",
      };
    }
    if (
      item === "needle-and-thread" &&
      target === "bear-ripped" &&
      progress.bear === "inhabited"
    ) {
      return {
        ...change(
          { sewing: "used", bear: "collected" },
          "you mend its physical form. it is alive",
        ),
        sequence: "repair",
      };
    }
    if (
      item === "bambi" &&
      target === "mouse-hole" &&
      progress.friend === "searching"
    ) {
      return {
        ...change(
          { friend: "returned", water: "empty" },
          "you place him within the hole again, this time with a body",
          "Thank you so much. It was good to spend time with you again. I missed you. Here. Take this.",
          "Goodbye now. Until we meet again someday!",
        ),
        sound: "success",
        pageSounds: { 1: "item-mystery" },
        itemPage: 1,
      };
    }
    if (item === "glass-empty" && target === "sink")
      return {
        ...change({ water: "full" }, "you fill the vessel"),
        sound: "click-glass",
      };
    if (item === "glass-half-full" && target === "flower-wilted")
      return {
        ...change({ water: "spent" }, "you bring it back to life"),
        sound: "item-mystery",
      };
    if (item === "usb-stick" && target === "computer-tower")
      return {
        ...change(
          { usbInserted: true },
          "you insert the USB. the computer stirs and beeps",
        ),
        sound: "usb-in",
      };
    if (item === "cd" && target === "computer-tower" && progress.usbInserted)
      return {
        ...change(
          { cdInserted: true },
          "you insert the CD. the computer whirs and cheeps",
        ),
        sound: "cd-in",
      };
    if (item === "key" && target === "doorknob")
      return { ...change({ endingSeen: true }), sequence: "ending" };
    return { ...say("nothing happens"), sound: "click-no" };
  }

  switch (target) {
    case "giant":
      return {
        ...say("you are being observed fearfully"),
        sound: "peaking-guy",
      };
    case "figure":
      return { ...say("it's you"), sound: "you" };
    case "sky":
      return {
        ...say("you look up at the sky. there are stars. where are you?"),
        sound: "sparkle",
      };
    case "doorknob":
      return {
        ...say("it wont budge. the door is locked"),
        sound: "door-locked",
      };
    case "door-crack":
      return {
        ...say("you feel a cool breeze from the other side"),
        sound: "door-bottom",
      };
    case "door-frame":
      return progress.sewing === "hidden"
        ? {
            ...change({ sewing: "needle" }, "you find a sewing needle"),
            sound: "item-mystery",
          }
        : { ...say("nothing else is here"), sound: "detection-click-2" };
    case "outdoors":
      return { ...say("you long for freedom"), sound: "sparkle" };
    case "safe-handle":
      return progress.safeUnlocked
        ? { progress, view: "safe-interior", sound: "safe-open" }
        : {
            ...say("the handle is stiff. the door is locked"),
            sound: "safe-open",
          };
    case "key":
      return progress.safeUnlocked && !progress.keyTaken
        ? {
            ...change({ keyTaken: true }, "you pick up the key"),
            sound: "item-mystery",
          }
        : say("nothing happens");
    case "cd":
      return progress.safeUnlocked && !progress.cdTaken
        ? {
            ...change({ cdTaken: true }, "you pick up the compact disc"),
            sound: "item-mystery",
          }
        : say("nothing happens");
    case "flower-wilted":
      return {
        ...say(
          progress.water === "spent" ? "it is alive" : "it is dying. how sad",
        ),
        sound: "plant-2",
      };
    case "sink":
      return { ...say("dreadful"), sound: "detection-click-2" };
    case "bear-ripped":
      return {
        ...say(
          progress.bear === "inhabited"
            ? "he is here, waiting"
            : "you feel you should know it",
        ),
        sound: "item-mystery-3",
      };
    case "mouse-hole":
      // Holding the mended bear, clicking the hole returns him without selecting him first.
      if (inventory(progress).includes("bambi"))
        return interact(progress, "mouse-hole", "bambi");
      if (progress.friend === "returned")
        return {
          ...say("it is quiet. your friend is gone"),
          sound: "item-mystery-2",
        };
      if (progress.friend === "searching")
        return {
          ...say("i have to find his body, and bring him back here"),
          sound: "item-mystery-5",
        };
      return { progress, conversation: true, sound: "item-mystery-2" };
    case "floor-lamp-off":
      return {
        ...change({ lampOn: !progress.lampOn }),
        sound: progress.lampOn ? "lamp-off" : "lamp-on",
      };
    case "desk-lamp-on":
      return { ...say("it shocks you to touch. unpleasant"), sound: "zap-1" };
    case "thread-spool":
      return { ...say("you can't do much with this"), sound: "plant-1" };
    case "computer-tower":
      return { ...say("you can hear a soft hum"), sound: "computer-hum" };
    case "locked-screen":
      return { ...say("useless for now"), sound: "computer-beep" };
    case "cracked-mirror":
      return { ...say("a fractured reflection"), sound: "click-glass" };
    case "wall-light":
      return { ...say("a cold light"), sound: "zap-2" };
    case "stool":
      return { ...say("worn, but still standing"), sound: "detection-click-2" };
    case "keyboard":
    case "mouse":
      return { progress, view: "computer-monitor" };
    default:
      return { ...say("nothing happens"), sound: "click-no" };
  }
}

export function talk(progress: Progress, topic: TopicId | "help"): Result {
  if (progress.friend !== "waiting")
    return { progress, message: ["nothing happens"] };
  if (topic === "help") {
    if (progress.topics.length !== Object.keys(TOPICS).length)
      return { progress, message: ["nothing happens"] };
    return {
      progress: { ...progress, friend: "searching" },
      message: [HELP_TEXT],
    };
  }
  if (!Object.hasOwn(TOPICS, topic))
    return { progress, message: ["nothing happens"] };
  return {
    progress: {
      ...progress,
      topics: [...new Set([...progress.topics, topic])],
    },
    message: [TOPICS[topic].text],
    conversation: true,
  };
}

export function unlockSafe(progress: Progress, code: string): Result {
  if (code !== "100698")
    return { progress, message: ["the code is incorrect"], sound: "click-no" };
  return {
    progress: { ...progress, safeUnlocked: true },
    message: ["you hear the safe door unlock from within"],
    sound: "success",
  };
}
