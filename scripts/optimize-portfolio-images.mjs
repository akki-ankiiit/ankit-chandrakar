import { mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Run explicitly: node scripts/optimize-portfolio-images.mjs
// All outputs use the current PNG artwork; originals are never modified.
const assets = new URL('../public/assets/', import.meta.url);
const output = new URL('optimized/', assets);
await mkdir(output, { recursive: true });
const covers = ['CryptoTaxx', 'YesBot', 'Neo', 'azure', 'Atlas', 'Adhikar'];
let sourceBytes = 0;
let fullBytes = 0;
let derivativeBytes = 0;
for (const name of [...covers, 'image_6', 'TeamNyusta']) {
  const source = fileURLToPath(new URL(`${name}.png`, assets));
  const isCover = covers.includes(name);
  const variants = isCover ? [640, 960, 1200] : [name === 'TeamNyusta' ? 1920 : 724];
  const originalBytes = (await stat(source)).size;
  sourceBytes += originalBytes;
  for (const width of variants) {
    const isFull = width === variants.at(-1);
    const target = fileURLToPath(new URL(`${name}${isFull ? '' : `-${width}`}.webp`, output));
    const result = await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 88, effort: 6 })
      .toFile(target);
    derivativeBytes += result.size;
    if (isFull) fullBytes += result.size;
    console.log(`${name}${isFull ? '' : `-${width}`}.webp: ${result.width}×${result.height}, ${result.size} bytes (PNG ${originalBytes})`);
  }
}
console.log(`Originals: ${sourceBytes} bytes; full WebPs: ${fullBytes} bytes; all derivatives: ${derivativeBytes} bytes.`);
