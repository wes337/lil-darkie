import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { roomImage, safeImage, dialogImage, ITEM_ART } from "./final-art.ts";
import { newProgress } from "./game-model.ts";

type Asset = { src: string; bytes: number; width?: number; height?: number; crop?: unknown };

test("world renders follow collected objects and independent lamp/computer states", () => {
  const p = newProgress();
  assert.equal(roomImage("computer", p), "room-computer-thread");
  assert.equal(roomImage("computer", { ...p, sewing: "threaded", lampOn: true }), "room-computer-lit");
  assert.equal(roomImage("computer", { ...p, usbInserted: true }), "room-computer-on");
  assert.equal(roomImage("computer", { ...p, usbInserted: true, lampOn: true }), "room-computer-on-lit");
  assert.equal(roomImage("sink", p), "room-sink-teddy-torn");
  assert.equal(roomImage("sink", { ...p, bear: "collected" }), "room-sink");
  assert.equal(roomImage("safe", { ...p, water: "spent" }), "room-safe-bloomed");
  assert.equal(dialogImage("door-frame", { ...p, sewing: "needle" }), "door-upper-alternate");
  assert.equal(dialogImage("sink", { ...p, water: "full" }), "sink-on");
});

test("safe artwork removes only the items already taken", () => {
  const p = newProgress();
  assert.equal(safeImage(p), "safe-open");
  assert.equal(safeImage({ ...p, keyTaken: true }), "safe-disc");
  assert.equal(safeImage({ ...p, cdTaken: true }), "safe-key");
  assert.equal(safeImage({ ...p, keyTaken: true, cdTaken: true }), "safe-empty");
});

test("imported art is present and inventory metadata matches shipped files", () => {
  const manifest: { assets: Record<string, Asset> } = JSON.parse(
    readFileSync(new URL("../../public/red-game/final/manifest.json", import.meta.url), "utf8"),
  );
  for (const name of Object.values(ITEM_ART)) {
    const asset = manifest.assets[name];
    assert.ok((asset?.width ?? 0) > 0 && (asset?.height ?? 0) > 0, name);
  }
  for (const [name, asset] of Object.entries(manifest.assets)) {
    const file = new URL(`../../public${asset.src}`, import.meta.url);
    assert.equal(statSync(file).size, asset.bytes, name);
    if (asset.width && !asset.crop) assert.equal(asset.width, asset.height, name);
  }
});
