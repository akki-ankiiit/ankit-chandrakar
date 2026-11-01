import { access, readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { artworks, categories, designProjects, imagery, profile, projects } from '../src/data/portfolio.js';

const kSeries = JSON.parse(await readFile('src/data/k-series-images.json', 'utf8'));
const kSeriesRaster = Object.values(kSeries).map((image) => image.src).filter((src) => /\.(webp|png|jpe?g)$/.test(src));

const bondure = JSON.parse(await readFile('src/data/bondure-images.json', 'utf8'));
const bondureRaster = Object.values(bondure).map((image) => image.src);
const bondureOriginals = [...['Bondure.png', 'Wallstark.png', 'Screed.png'].map((name) => `/assets/Bondure/${name}`), '/assets/Bondure.png'];

const shinex = JSON.parse(await readFile('src/data/shinex-images.json', 'utf8'));
const shinexRaster = Object.values(shinex).map((image) => image.src);

const images = new Set([
  ...kSeriesRaster,
  ...bondureRaster,
  ...shinexRaster,
  ...bondureOriginals,
  ...Object.values(imagery),
  ...categories.map((category) => category.folder),
  ...(artworks || []).map((art) => art.image),
  ...(designProjects || []).flatMap((proj) => [proj.image, proj.thumbnail].filter(Boolean)),
  ...projects.flatMap((project) => [project.image, ...project.caseStudy.chapters.flatMap((chapter) => chapter.images.map((image) => image.src))]),
]);
const missing = [];
for (const src of images) {
  try {
    const metadata = await sharp(`public${decodeURIComponent(src)}`).metadata();
    if (!metadata.width || !metadata.height) throw new Error('Invalid image');
  } catch { missing.push(src); }
}
try { await access(`public${profile.resume}`); } catch { missing.push(profile.resume); }
if (missing.length) {
  console.error(`Missing or invalid portfolio assets:\n${missing.join('\n')}\nRun npm run assets:generate (covers) or npm run assets:behance (original project images).`);
  process.exitCode = 1;
} else console.log(`Verified ${images.size} local portfolio images and the résumé PDF.`);
