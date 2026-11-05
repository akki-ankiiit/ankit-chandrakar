import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

// Footer landscape: the original stays in source-assets; the site uses two WebP sizes (srcset picks one).
const source = 'source-assets/Footer (1).png';
const output = 'public/assets/footer';
await mkdir(output, { recursive: true });
for (const { name, width, quality } of [{ name: 'landscape-2880', width: 2880, quality: 78 }, { name: 'landscape-1200', width: 1200, quality: 80 }]) {
  const info = await sharp(source, { limitInputPixels: false })
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toFile(`${output}/${name}.webp`);
  console.log(`${name}.webp ${info.width}×${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}
