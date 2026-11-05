import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Case-study slide decks. Originals live in source-assets (not deployed); the site uses optimized WebP.
// Each slide is written at 2000px (sharp on high-DPI screens) and 1000px (phones, small windows); the page picks via srcset.
// Slide order follows the file names; `after` places an unnumbered file right after a numbered one.
const decks = [
  { id: 'cryptotax', source: 'source-assets/CryptoTax Case Study', output: 'public/assets/cryptotax', json: 'src/data/cryptotax-images.json', after: {} },
  { id: 'yesbot', source: 'source-assets/YesBot.ai Case Study (1)', output: 'public/assets/yesbot', json: 'src/data/yesbot-images.json', after: { 'Slide 16_9 - 30.png': '14.png' } },
];
const sizes = [{ width: 2000, suffix: '', quality: 75 }, { width: 1000, suffix: '-1000', quality: 78 }];

const key = (name) => {
  const match = name.match(/^(\d+)(?:\((\w)\))?\.png$/i);
  return match ? Number(match[1]) * 100 + (match[2] ? match[2].toLowerCase().charCodeAt(0) - 96 : 0) : null;
};
function orderFiles(files, after) {
  const numbered = files.filter((file) => key(file) !== null).sort((a, b) => key(a) - key(b));
  for (const [file, anchor] of Object.entries(after)) {
    if (!files.includes(file)) continue;
    numbered.splice(numbered.indexOf(anchor) + 1, 0, file);
  }
  return numbered;
}

for (const deck of decks) {
  const files = orderFiles((await readdir(deck.source)).filter((file) => /\.png$/i.test(file)), deck.after);
  await rm(deck.output, { recursive: true, force: true });
  await mkdir(deck.output, { recursive: true });
  const images = [];
  let total = 0;
  for (const [index, file] of files.entries()) {
    const base = `slide-${String(index + 1).padStart(2, '0')}`;
    const written = {};
    for (const size of sizes) {
      const info = await sharp(path.join(deck.source, file), { limitInputPixels: false })
        .resize({ width: size.width, withoutEnlargement: true })
        .webp({ quality: size.quality, effort: 6, smartSubsample: true })
        .toFile(path.join(deck.output, `${base}${size.suffix}.webp`));
      written[size.suffix] = info; total += info.size;
    }
    const full = written[''];
    images.push({
      src: `/assets/${deck.id}/${base}.webp`, width: full.width, height: full.height,
      srcSet: `/assets/${deck.id}/${base}-1000.webp ${written['-1000'].width}w, /assets/${deck.id}/${base}.webp ${full.width}w`,
    });
    console.log(`${deck.id} ${file} → ${base} (${full.width}×${full.height}) ${(full.size / 1024).toFixed(0)} KB + ${(written['-1000'].size / 1024).toFixed(0)} KB`);
  }
  await writeFile(deck.json, `${JSON.stringify(images, null, 2)}\n`);
  console.log(`${deck.id}: ${images.length} slides, ${(total / 1024 / 1024).toFixed(2)} MB total (both sizes)\n`);
}
