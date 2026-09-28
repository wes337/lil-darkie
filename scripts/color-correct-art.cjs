const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');

// Always grade a backup, never an already corrected image. Outputs are staged separately.
const [backupRoot, palettePath, outputRoot] = process.argv.slice(2);
if (!backupRoot || !palettePath || !outputRoot) throw new Error('Usage: node scripts/color-correct-art.cjs BACKUP PALETTE_JSON OUTPUT');
const palette = JSON.parse(fs.readFileSync(palettePath, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(backupRoot, 'manifest.json'), 'utf8').replace(/^\uFEFF/, ''));
const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const smooth = (low, high, value) => {
  const t = clamp((value-low)/(high-low), 0, 1);
  return t*t*(3-2*t);
};

function interpolate(points, value) {
  const upper = points.findIndex(point => point[0] >= value);
  if (upper <= 0) return points[upper < 0 ? points.length-1 : 0][1];
  const [x0,y0] = points[upper-1], [x1,y1] = points[upper];
  return y0 + (y1-y0) * (value-x0)/(x1-x0);
}

function redWeight(r, g, b) {
  const maximum = Math.max(r,g,b), minimum = Math.min(r,g,b);
  if (r !== maximum || maximum === minimum) return 0;
  const hue = Math.abs(60 * (g-b)/(maximum-minimum));
  return smooth(0.08, 0.35, (r-Math.max(g,b))/Math.max(r,1)) * (1-smooth(25,50,hue));
}

function calibration(name, room) {
  const source = palette[name];
  const channels = [[],[],[]];
  if (room) {
    for (let channel=0; channel<3; channel++) channels[channel].push([0,0], [13,channel===0 ? 13 : 0]);
    for (const region of ['side','wall','floor']) {
      const from = source[region].median, to = palette.reference[region].median;
      channels[0].push([from[0],to[0]]);
      for (let channel=1; channel<3; channel++) channels[channel].push([from[0],to[channel]-from[channel]*to[0]/from[0]]);
    }
    channels[0].push([255,255]);
    channels[1].push([255,0]);
    channels[2].push([255,0]);
  } else if (source.red) {
    const [r,g,b] = source.red.median;
    // Objects retain their own brightness. Match the reference's red chroma at that brightness.
    const referencePoints = channel => [[0,0],[13,13],...['side','wall','floor'].map(region => {
      const color = palette.reference[region].median;
      return [color[0],color[channel]];
    }),[255,55]];
    channels[0].push([0,0],[255,255]);
    channels[1].push([0,0],[13,0],[r,interpolate(referencePoints(1),r)-g],[255,0]);
    channels[2].push([0,0],[13,0],[r,interpolate(referencePoints(2),r)-b],[255,0]);
  }
  const neutralShift = source.dark
    ? source.dark.median.map(value => clamp(13-value, -3, /stars|peeking-giant/.test(name) ? 6 : 3))
    : [0,0,0];
  return { channels, neutralShift: room ? [0,0,0] : neutralShift };
}

(async () => {
  const result = { reference: 'main-room-high-quality.png', backupRoot, outputs: [], preserved: [] };
  const originals = manifest.filter(file => file.Path.replaceAll('\\','/').startsWith('website/') && file.Path.endsWith('.png'));
  for (const file of originals) {
    const relative = file.Path.replaceAll('\\','/').slice('website/'.length);
    // Yellow navigation has no counterpart in the reference and remains the approved concept color.
    if (relative.startsWith('navigation/') || relative === 'buttons/paint-yellow.png') {
      result.preserved.push(relative);
      continue;
    }
    const room = relative.endsWith('/room.png');
    const name = room ? relative.split('/')[0] : relative.endsWith('/stars.png') ? relative.slice(0,-4) : path.basename(relative,'.png');
    if (!palette[name]) throw new Error(`Missing palette sample: ${name}`);
    const input = fs.readFileSync(path.join(backupRoot,file.Path));
    if (hash(input) !== file.SHA256) throw new Error(`Backup hash changed: ${relative}`);
    const { data: before, info } = await sharp(input).toColourspace('srgb').ensureAlpha().raw().toBuffer({ resolveWithObject:true });
    const corrected = Buffer.from(before);
    const { channels, neutralShift } = calibration(name,room);
    const lookup = channels.map(points => points.length ? Array.from({length:256},(_,value) => interpolate(points,value)) : null);
    let changedPixels = 0;
    for (let offset=0; offset<before.length; offset+=4) {
      const r=before[offset], g=before[offset+1], b=before[offset+2];
      if (!before[offset+3]) continue;
      const weight = lookup[0] ? redWeight(r,g,b) : 0;
      const newRed = lookup[0]?.[r] ?? r;
      const ratio = r ? newRed/r : 1;
      const rgb = [r+(newRed-r)*weight, g+((g*ratio+(lookup[1]?.[r]??0))-g)*weight, b+((b*ratio+(lookup[2]?.[r]??0))-b)*weight];
      const neutralWeight = (1-smooth(12,30,Math.max(r,g,b)-Math.min(r,g,b))) * (1-smooth(30,64,Math.max(r,g,b)));
      for (let channel=0; channel<3; channel++) corrected[offset+channel] = Math.round(clamp(rgb[channel]+neutralWeight*neutralShift[channel],0,255));
      if (corrected[offset] !== r || corrected[offset+1] !== g || corrected[offset+2] !== b) changedPixels++;
    }
    const output = await sharp(corrected,{raw:{width:info.width,height:info.height,channels:4}}).png({compressionLevel:9}).toBuffer();
    const verified = await sharp(output).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    if (verified.info.width !== info.width || verified.info.height !== info.height) throw new Error(`Dimensions changed: ${relative}`);
    for (let offset=3; offset<before.length; offset+=4) if (verified.data[offset] !== before[offset]) throw new Error(`Alpha changed: ${relative}`);
    const counterparts = manifest.filter(entry => entry.Path.replaceAll('\\','/').startsWith('experimental/') && entry.SHA256 === file.SHA256).map(entry => entry.Path.replaceAll('\\','/'));
    if (!counterparts.length) throw new Error(`Missing source artwork for ${relative}`);
    for (const destination of [`website/${relative}`, ...counterparts]) {
      const target = path.join(outputRoot,destination);
      fs.mkdirSync(path.dirname(target),{recursive:true});
      fs.writeFileSync(target,output);
    }
    result.outputs.push({file:relative,width:info.width,height:info.height,alphaUnchanged:true,changedPixels,beforeSHA256:file.SHA256,afterSHA256:hash(output),counterparts});
  }
  fs.writeFileSync(path.join(outputRoot,'correction-report.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify({corrected:result.outputs.length,preserved:result.preserved,alphaVerified:result.outputs.every(file=>file.alphaUnchanged),outputRoot},null,2));
})();
