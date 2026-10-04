import assert from "node:assert/strict";
import test from "node:test";
import { upcomingShows } from "./render.ts";

const show = (date: string) => ({ date, city: "City", venue: "Venue" });
const noon = (date: string) => new Date(`${date}T12:00:00Z`).getTime();

test("upcoming shows are sorted soonest first", () => {
  const shows = [show("2026-11-02"), show("2026-10-17"), show("2026-10-30")];
  assert.deepEqual(
    upcomingShows(shows, noon("2026-10-01")).map((s) => s.date),
    ["2026-10-17", "2026-10-30", "2026-11-02"],
  );
});

test("a show stays listed through its evening everywhere, then drops off", () => {
  const shows = [show("2026-10-17")];
  const at = (time: string) => upcomingShows(shows, new Date(time).getTime()).length;
  assert.equal(at("2026-10-17T12:00:00Z"), 1);
  // 11pm in California on the night of the show.
  assert.equal(at("2026-10-18T06:00:00Z"), 1);
  assert.equal(at("2026-10-19T00:00:00Z"), 0);
});
