// Creates WebP copies of the ShineX / CrystalX bottles and social posts, plus the card and Open Graph images.
// Sources: source-assets/TileCleaner → outputs: public/assets/TileCleaner.
// Also writes src/data/shinex-images.json with the real pixel size of every file.
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const DIR = 'public/assets/TileCleaner';
const SOURCE = 'source-assets/TileCleaner';
const WEB = '/assets/TileCleaner';
const PAPER = '#fdfdf5';
const PANEL = '#f3f2e6';

const manifest = {};

async function save(key, pipeline, file, options) {
  const format = file.endsWith('.jpg') ? 'jpeg' : 'webp';
  const info = await pipeline[format](options).toFile(`${DIR}/${file}`);
  manifest[key] = { src: `${WEB}/${file}`, width: info.width, height: info.height };
  console.log(file, `${info.width}×${info.height}`, `${Math.round(info.size / 1024)} KB`);
}

const webp = { quality: 86, alphaQuality: 92, effort: 5 };
const post = { quality: 82, effort: 5 };

// 1. Bottles, transparency kept. The PNGs are 2035px tall, so they are capped at 1100px.
for (const name of ['ShineX', 'CrystalX']) {
  await save(name.toLowerCase(), sharp(`${SOURCE}/${name}.png`).resize({ height: 1100, withoutEnlargement: true }), `${name}.webp`, webp);
}

// 2. Social posts. Each keeps its natural aspect ratio; the longest side is capped at 1536px (the source size).
const posts = Array.from({ length: 22 }, (_, index) => String(index + 1).padStart(2, '0'));
for (const number of posts) {
  await save(`post-${number}`, sharp(`${SOURCE}/smc/${number}.png`).resize({ width: 1536, height: 1536, fit: 'inside', withoutEnlargement: true }), `smc/${number}.webp`, post);
}

// 3. Card cover for the Packaging tab: both bottles on the light panel (1200×850 = the card ratio).
const bottles = [
  { input: await sharp(`${SOURCE}/ShineX.png`).resize({ height: 640 }).png().toBuffer(), left: 300, top: 110 },
  { input: await sharp(`${SOURCE}/CrystalX.png`).resize({ height: 640 }).png().toBuffer(), left: 760, top: 110 },
];
await save('card', sharp({ create: { width: 1200, height: 850, channels: 3, background: PANEL } }).composite(bottles), 'shinex-crystalx-card.webp', webp);

// 4. Open Graph image: both bottles on the site paper colour, 1200×630 (JPEG for the widest crawler support).
const ogBottles = [
  { input: await sharp(`${SOURCE}/ShineX.png`).resize({ height: 500 }).png().toBuffer(), left: 268, top: 80 },
  { input: await sharp(`${SOURCE}/CrystalX.png`).resize({ height: 500 }).png().toBuffer(), left: 735, top: 80 },
];
await save('og', sharp({ create: { width: 1200, height: 630, channels: 3, background: PAPER } }).composite(ogBottles), 'shinex-crystalx-og.jpg', { quality: 88, mozjpeg: true });

await writeFile('src/data/shinex-images.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${Object.keys(manifest).length} entries to src/data/shinex-images.json`);
