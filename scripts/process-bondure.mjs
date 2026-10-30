// Optimises the BONDURE packaging images (transparency kept) and writes the derived assets.
// Source + output folder: public/assets/Bondure  (originals are never modified or renamed)
// Also writes src/data/bondure-images.json with the real pixel size of every file.
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const DIR = 'public/assets/Bondure';
const WEB = '/assets/Bondure';
const PAPER = '#fdfdf5'; // site --paper
const PANEL = '#f3f2e6'; // same light panel the K-Series card uses

const bags = [
  { key: 'bondure', file: 'Bondure' },
  { key: 'wallstark', file: 'Wallstark' },
  { key: 'screed', file: 'Screed' },
];

const webp = { quality: 86, alphaQuality: 92, effort: 5 };
const manifest = {};

async function save(key, pipeline, file, options = webp) {
  const format = file.endsWith('.jpg') ? 'jpeg' : 'webp';
  const info = await pipeline[format](options).toFile(`${DIR}/${file}`);
  manifest[key] = { src: `${WEB}/${file}`, width: info.width, height: info.height };
  console.log(file, `${info.width}×${info.height}`, `${Math.round(info.size / 1024)} KB`);
}

// 1. Optimised bags. The PNGs are ~1050px wide, so they are never enlarged (the cap is 1200px).
for (const bag of bags) {
  await save(bag.key, sharp(`${DIR}/${bag.file}.png`).resize({ width: 1200, withoutEnlargement: true }), `${bag.file}.webp`);
}

// 2. Card thumbnail for the Packaging tab: the mortar bag centred on a light panel (1200×850 = the card ratio).
const mortar = await sharp(`${DIR}/Bondure.png`).resize({ height: 720 }).png().toBuffer();
await save('card', sharp({ create: { width: 1200, height: 850, channels: 4, background: PANEL } }).composite([{ input: mortar, gravity: 'centre' }]), 'bondure-card.webp');

// 3. Open Graph image: the three bags on the site paper colour, 1200×630 (JPEG for the widest crawler support).
const ogBag = (file, height) => sharp(`${DIR}/${file}.png`).resize({ height }).png().toBuffer();
const left = await ogBag('Bondure', 470);
const middle = await ogBag('Wallstark', 510);
const right = await ogBag('Screed', 470);
const og = sharp({ create: { width: 1200, height: 630, channels: 3, background: PAPER } });
await save('og', og.composite([
  { input: left, left: 30, top: 120 },
  { input: right, left: 752, top: 120 },
  { input: middle, left: 383, top: 62 },
]), 'bondure-og.jpg', { quality: 88, mozjpeg: true });

// 4. Detail crops taken from the bag artwork itself (coordinates measured on the source PNGs).
const crop = (file, region, width) => sharp(`${DIR}/${file}.png`).extract(region).resize({ width, withoutEnlargement: true });
await save('roof-wallstark', crop('Wallstark', { left: 235, top: 278, width: 620, height: 126 }), 'roof-wallstark.webp');
await save('roof-screed', crop('Screed', { left: 285, top: 284, width: 500, height: 128 }), 'roof-screed.webp');
await save('conforms', crop('Bondure', { left: 160, top: 1002, width: 305, height: 80 }), 'conforms.webp');

// 5. The four promise icons, cut out of the Wall Stârk bag as transparent circles.
const icons = [
  { key: 'icon-self-curing', cx: 333, cy: 523 },
  { key: 'icon-durability', cx: 465, cy: 523 },
  { key: 'icon-strength', cx: 602, cy: 523 },
  { key: 'icon-easy', cx: 730, cy: 523 },
];
const R = 33;
const mask = Buffer.from(`<svg width="${R * 2}" height="${R * 2}"><circle cx="${R}" cy="${R}" r="${R}" fill="#fff"/></svg>`);
for (const icon of icons) {
  const cut = await sharp(`${DIR}/Wallstark.png`).extract({ left: icon.cx - R, top: icon.cy - R, width: R * 2, height: R * 2 }).ensureAlpha().composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  await save(icon.key, sharp(cut).resize({ width: R * 4, kernel: 'lanczos3' }), `${icon.key}.webp`, { quality: 92, alphaQuality: 100, effort: 5 });
}

await writeFile('src/data/bondure-images.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${Object.keys(manifest).length} entries to src/data/bondure-images.json`);
