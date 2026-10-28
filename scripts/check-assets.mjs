import { access } from 'node:fs/promises';
import sharp from 'sharp';
import { artworks, categories, designBooks, designProjects, imagery, profile, projects } from '../src/data/portfolio.js';

const images = new Set([
  ...Object.values(imagery),
  ...categories.map((category) => category.folder),
  ...(artworks || []).map((art) => art.image),
  ...(designBooks || []).map((book) => book.image),
  ...(designProjects || []).map((proj) => proj.image),
  ...projects.flatMap((project) => [project.image, ...project.caseStudy.chapters.flatMap((chapter) => chapter.images.map((image) => image.src))]),
]);
const missing = [];
for (const src of images) {
  try {
    const metadata = await sharp(`public${src}`).metadata();
    if (!metadata.width || !metadata.height) throw new Error('Invalid image');
  } catch { missing.push(src); }
}
try { await access(`public${profile.resume}`); } catch { missing.push(profile.resume); }
if (missing.length) {
  console.error(`Missing or invalid portfolio assets:\n${missing.join('\n')}\nRun npm run assets:generate (covers) or npm run assets:behance (original project images).`);
  process.exitCode = 1;
} else console.log(`Verified ${images.size} local portfolio images and the résumé PDF.`);
