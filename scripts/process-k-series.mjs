// Crops, resizes and exports the Kamdhenu K-Series packaging images.
// Source: assets-src/k-series  →  Output: public/assets/packaging/K-Series  (+ src/data/k-series-images.json)
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const SRC = 'assets-src/k-series';
const OUT = 'public/assets/packaging/K-Series';
const WEB = '/assets/packaging/K-Series';
const grades = ['k50', 'k60', 'k80', 'k90'];

// The renders are 4000×3000 with a transparent background and a soft shadow.
// Measured from the alpha channel: the bag + shadow sit inside x 987–2856, y 406–2763.
const BAG = { left: 980, top: 400, width: 1884, height: 2370 };
// Bottom colour field of the front bag, inset from the curved edges.
const COLOUR = { left: 1210, top: 2090, width: 1380, height: 425 };

const webp = { quality: 86, alphaQuality: 92, effort: 5 };
const manifest = {};

async function save(key, pipeline, file) {
  const info = await pipeline.webp(webp).toFile(`${OUT}/${file}`);
  manifest[key] = { src: `${WEB}/${file}`, width: info.width, height: info.height };
  console.log(file, `${info.width}×${info.height}`, `${Math.round(info.size / 1024)} KB`);
}

await mkdir(OUT, { recursive: true });

for (const grade of grades) {
  const upper = grade.toUpperCase();
  const front = () => sharp(`${SRC}/${upper}_Front.png`);
  const back = () => sharp(`${SRC}/${upper}_Back.png`);
  await save(`${grade}-front`, front().extract(BAG).resize({ width: 1200 }), `${grade}-front.webp`);
  await save(`${grade}-front-thumb`, front().extract(BAG).resize({ width: 480 }), `${grade}-front-thumb.webp`);
  await save(`${grade}-back`, back().extract(BAG).resize({ width: 1400 }), `${grade}-back.webp`);
  await save(`${grade}-back-thumb`, back().extract(BAG).resize({ width: 480 }), `${grade}-back-thumb.webp`);
  await save(`${grade}-colour`, front().extract(COLOUR).resize({ width: 720 }), `${grade}-colour.webp`);
}

// Card thumbnail for the Packaging designs tab: the K90 front on a light panel (1200×659, same ratio as other cards).
const bag = await sharp(`${SRC}/K90_Front.png`).extract(BAG).resize({ height: 640 }).png().toBuffer();
await save('card', sharp({ create: { width: 1200, height: 659, channels: 4, background: '#f3f2e6' } }).composite([{ input: bag, gravity: 'centre' }]), 'k-series-card.webp');

// .rotate() with no arguments applies the EXIF orientation (Signed.jpeg is already upright).
await save('signed-brochure', sharp(`${SRC}/Signed.jpeg`).rotate().resize({ width: 1400 }), 'signed-brochure.webp');
await save('me-and-sunil', sharp(`${SRC}/Me&Sunil.jpg`).rotate().resize({ width: 900 }), 'me-and-sunil.webp');

await copyFile(`${SRC}/Kamdhenu Adhesive.svg`, `${OUT}/kamdhenu-adhesive-logo.svg`);
await copyFile(`${SRC}/Kamdhenu Group Logo.svg`, `${OUT}/kamdhenu-group-logo.svg`);
manifest['logo-adhesive'] = { src: `${WEB}/kamdhenu-adhesive-logo.svg`, width: 527, height: 139 };
manifest['logo-group'] = { src: `${WEB}/kamdhenu-group-logo.svg`, width: 548, height: 209 };

await writeFile('src/data/k-series-images.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${Object.keys(manifest).length} entries to src/data/k-series-images.json`);
