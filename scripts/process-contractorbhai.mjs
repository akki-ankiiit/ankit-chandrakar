import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Keep the supplied presentation untouched; extract its original WebP bytes.
const root = new URL('../', import.meta.url);
const assets = new URL('public/assets/ContractorBhai/', root);
const source = await readFile(new URL('source-assets/ContractorBhai/ContractorBhai-case-study.html', root), 'utf8');
const match = source.match(/const IMGS\s*=\s*(\{[^\n]+\});/);
if (!match) throw new Error('Could not find the embedded ContractorBhai images.');
const embedded = JSON.parse(match[1]);
const images = {};
for (const [key, base64] of Object.entries(embedded)) {
  if (!/^[a-z0-9_]+$/.test(key)) throw new Error(`Unexpected image key: ${key}`);
  const bytes = Buffer.from(base64, 'base64');
  const { width, height, format } = await sharp(bytes).metadata();
  if (format !== 'webp' || !width || !height) throw new Error(`Invalid screenshot: ${key}`);
  await writeFile(new URL(`${key}.webp`, assets), bytes);
  images[key] = { src: `/assets/ContractorBhai/${key}.webp`, width, height };
  console.log(`${key}: ${width} × ${height} (${bytes.length} bytes)`);
}
await writeFile(new URL('src/data/contractorbhai-images.json', root), `${JSON.stringify(images, null, 2)}\n`);

// A dedicated portfolio cover, composed with the actual app screens.
const background = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="860" viewBox="0 0 1200 860">
  <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#dce8d6" stroke-opacity=".1"/></pattern></defs>
  <rect width="1200" height="860" fill="#163d31"/><rect width="1200" height="860" fill="url(#grid)"/>
  <circle cx="1040" cy="430" r="360" fill="#cfddbd" fill-opacity=".09"/>
  <circle cx="1040" cy="430" r="290" fill="none" stroke="#d5b66d" stroke-opacity=".35"/>
  <text x="72" y="112" font-family="sans-serif" font-size="18" letter-spacing="3" fill="#d9e4ce">TEJAS / PRODUCT DESIGN</text>
  <text x="66" y="330" font-family="Georgia, serif" font-size="91" fill="#faf7ed">Contractor</text>
  <text x="66" y="428" font-family="Georgia, serif" font-size="91" fill="#faf7ed">Bhai<tspan fill="#d5b66d">.</tspan></text>
  <path d="M72 477H156" stroke="#d5b66d" stroke-width="3"/>
  <text x="72" y="548" font-family="sans-serif" font-size="27" fill="#e1e9dc">Every relationship.</text>
  <text x="72" y="588" font-family="sans-serif" font-size="27" fill="#e1e9dc">A little more personal.</text>
  <text x="72" y="780" font-family="sans-serif" font-size="16" letter-spacing="2" fill="#c6d5bd">FIELD SALES + AI MESSAGING</text>
  <rect x="632" y="176" width="254" height="644" rx="29" fill="#0b231b"/>
  <rect x="904" y="288" width="254" height="468" rx="29" fill="#0b231b"/>
</svg>`);
const coverScreens = await Promise.all(['remind', 'diw_top'].map(async (key) => {
  const height = Math.round(images[key].height / images[key].width * 238);
  return {
  input: await sharp(fileURLToPath(new URL(`${key}.webp`, assets)))
    .resize(238, height)
    .composite([{ input: Buffer.from(`<svg width="238" height="${height}"><rect width="238" height="${height}" rx="22" fill="white"/></svg>`), blend: 'dest-in' }])
    .png().toBuffer(),
  left: key === 'remind' ? 640 : 912,
  top: key === 'remind' ? 188 : 300,
  };
}));
const cover = await sharp(background).composite(coverScreens).webp({ quality: 88 }).toBuffer();
await writeFile(new URL('cover.webp', assets), cover);
for (const width of [640, 960]) {
  await sharp(cover).resize(width).webp({ quality: 85 }).toFile(fileURLToPath(new URL(`cover-${width}.webp`, assets)));
}
console.log('Generated ContractorBhai cover and responsive variants.');
