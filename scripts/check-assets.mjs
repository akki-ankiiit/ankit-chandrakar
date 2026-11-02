import { access, readFile, stat } from 'node:fs/promises';
import sharp from 'sharp';
import { artworks, categories, designProjects, imagery, profile, projects } from '../src/data/portfolio.js';

const kSeries = JSON.parse(await readFile('src/data/k-series-images.json', 'utf8'));
const kSeriesRaster = Object.values(kSeries).map((image) => image.src).filter((src) => /\.(webp|png|jpe?g)$/.test(src));

const bondure = JSON.parse(await readFile('src/data/bondure-images.json', 'utf8'));
const bondureRaster = Object.values(bondure).map((image) => image.src);
const bondureOriginals = [...['Bondure.png', 'Wallstark.png', 'Screed.png'].map((name) => `/assets/Bondure/${name}`), '/assets/Bondure.png'];

const shinex = JSON.parse(await readFile('src/data/shinex-images.json', 'utf8'));
const shinexRaster = Object.values(shinex).map((image) => image.src);

const contractorBhai = JSON.parse(await readFile('src/data/contractorbhai-images.json', 'utf8'));
const contractorBhaiRaster = Object.values(contractorBhai).map((image) => image.src);

const images = new Set([
  ...kSeriesRaster,
  ...bondureRaster,
  ...shinexRaster,
  ...contractorBhaiRaster,
  ...['cover', 'cover-640', 'cover-960'].map((name) => `/assets/ContractorBhai/${name}.webp`),
  ...bondureOriginals,
  ...Object.values(imagery),
  ...categories.map((category) => category.folder),
  ...(artworks || []).map((art) => art.image),
  ...(designProjects || []).flatMap((proj) => [proj.image, proj.thumbnail].filter(Boolean)),
  ...projects.flatMap((project) => [project.image, ...project.caseStudy.chapters.flatMap((chapter) => chapter.images.map((image) => image.src))]),
  ...projects.map((project) => project.thumbnailVideo?.poster).filter(Boolean),
]);
const thumbnailVideos = new Set(projects.map((project) => project.thumbnailVideo?.src).filter(Boolean));
const missing = [];
for (const src of images) {
  try {
    const metadata = await sharp(`public${decodeURIComponent(src)}`).metadata();
    if (!metadata.width || !metadata.height) throw new Error('Invalid image');
  } catch { missing.push(src); }
}
for (const src of thumbnailVideos) {
  try {
    const path = `public${decodeURIComponent(src)}`;
    await access(path);
    const metadata = await stat(path);
    if (!/\.mp4$/i.test(src) || !metadata.isFile() || metadata.size === 0) throw new Error('Invalid video');
  } catch { missing.push(src); }
}
try { await access(`public${profile.resume}`); } catch { missing.push(profile.resume); }
if (missing.length) {
  console.error(`Missing or invalid portfolio assets:\n${missing.join('\n')}\nRun npm run assets:generate (covers) or npm run assets:behance (original project images).`);
  process.exitCode = 1;
} else console.log(`Verified ${images.size} local portfolio images${thumbnailVideos.size ? `, ${thumbnailVideos.size} thumbnail video${thumbnailVideos.size === 1 ? '' : 's'},` : ''} and the résumé PDF.`);
