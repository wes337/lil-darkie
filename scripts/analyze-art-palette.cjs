const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

// Read-only sampling for the game's reference grade. Alpha edges are excluded.
const reference = process.argv[2];
if (!reference) throw new Error('Pass the path to main-room-high-quality.png');
const root = process.argv[4] || path.resolve(__dirname, '../public/images/red-game');
const regions = {
  wall: [0.38, 0.34, 0.80, 0.52],
  floor: [0.32, 0.80, 0.49, 0.94],
  side: [0.05, 0.20, 0.20, 0.34],
};

function summarize(pixels) {
  const sorted = [0, 1, 2].map(channel => pixels.map(pixel => pixel[channel]).sort((a, b) => a - b));
  const quantile = fraction => sorted.map(channel => channel[Math.floor((channel.length - 1) * fraction)]);
  return { count: pixels.length, p10: quantile(0.1), median: quantile(0.5), p90: quantile(0.9) };
}

async function sample(file, room = false) {
  const { data, info } = await sharp(file).resize(600, 600, { fit: 'inside' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const groups = { red: [], dark: [], light: [] };
  if (room) for (const region of Object.keys(regions)) groups[region] = [];
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const offset = (y * info.width + x) * 4;
    const [r, g, b, a] = data.subarray(offset, offset + 4);
    if (a < 250) continue;
    const pixel = [r, g, b];
    if (r > 50 && r > g * 1.6 && r > b * 1.6) groups.red.push(pixel);
    if (Math.max(r, g, b) < 45 && Math.max(r, g, b) - Math.min(r, g, b) < 15) groups.dark.push(pixel);
    if (Math.min(r, g, b) > 170) groups.light.push(pixel);
    if (room) for (const [name, [x0, y0, x1, y1]] of Object.entries(regions)) {
      if (x / info.width > x0 && x / info.width < x1 && y / info.height > y0 && y / info.height < y1) groups[name].push(pixel);
    }
  }
  return Object.fromEntries(Object.entries(groups).filter(([, pixels]) => pixels.length).map(([name, pixels]) => [name, summarize(pixels)]));
}

(async () => {
  const report = { reference: await sample(reference, true) };
  for (const room of ['main-room', 'computer-back-wall', 'safe-right-wall', 'sink-left-wall']) report[room] = await sample(path.join(root, room, 'room.png'), true);
  const assets = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../components/red-game/prop-assets.json')));
  for (const [name, asset] of Object.entries(assets)) report[name] = await sample(path.join(root, asset.src.slice('/images/red-game/'.length)));
  for (const room of ['main-room', 'computer-back-wall', 'safe-right-wall', 'sink-left-wall']) report[`${room}/stars`] = await sample(path.join(root, room, 'stars.png'));
  for (const layer of ['room-figure', 'peeking-giant']) report[layer] = await sample(path.join(root, 'main-room', `${layer}.png`));
  report['paint-red'] = await sample(path.join(root, 'buttons/paint-red.png'));
  if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(report, null, 2));
  console.log(JSON.stringify(Object.fromEntries(Object.entries(report).map(([name, groups]) => [name, Object.fromEntries(Object.entries(groups).map(([group, stats]) => [group, stats.median]))])), null, 2));
})();
