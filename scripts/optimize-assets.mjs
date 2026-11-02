import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Keep originals outside the deployment directory; preserve the public output URLs.
const folders = ['imagery', 'work/art', 'work/design'];
for (const folder of folders) {
  const sourceFolder = path.join('source-assets', folder);
  const outputFolder = path.join('public/assets', folder);
  for (const file of await readdir(sourceFolder)) {
    if (!/\.(png|gif|jpg)$/i.test(file)) continue;
    const source = path.join(sourceFolder, file);
    const destination = path.join(outputFolder, file.replace(/\.(png|gif|jpg)$/i, '.webp'));
    const output = file.endsWith('.gif') ? destination.replace('.webp', '-animated.webp') : destination;
    const width = file.startsWith('folder-') || file.startsWith('flower-') ? 180 : file.startsWith('artist-') ? 640 : file.endsWith('.gif') ? 800 : 1200;
    await sharp(source, { animated: file.endsWith('.gif'), limitInputPixels: false })
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 84, effort: 4 })
      .toFile(output);
    const before = (await stat(source)).size;
    const after = (await stat(output)).size;
    console.log(`${file}: ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB`);
  }
}
