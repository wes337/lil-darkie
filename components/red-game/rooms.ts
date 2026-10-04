// Clockwise around the room, as laid out on the concept board.
export const ROOMS = [
  {
    id: "main",
    name: "Main room",
    description:
      "A red room beneath a starry sky, with a door on the left, a giant peeking over the back wall, and a many-armed figure inside.",
  },
  {
    id: "safe",
    name: "Safe wall",
    description:
      "A close view of the red wall: a safe, a flower on a stool, and footprints leading to a mouse hole.",
  },
  {
    id: "computer",
    name: "Computer back wall",
    description:
      "A computer, desk lamp and note on a red desk, with a standing lamp beside it and stars overhead.",
  },
  {
    id: "sink",
    name: "Sink wall",
    description:
      "A white pedestal sink beneath a cracked mirror, with a torn teddy bear on the floor.",
  },
] as const;
export type Room = (typeof ROOMS)[number];
