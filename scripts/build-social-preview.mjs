import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Run: node scripts/build-social-preview.mjs
// Requires ffmpeg on PATH (or FFMPEG=/path/to/ffmpeg); never overwrites the source.
const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'public/assets/web-thumbnail.gif');
const gif = path.join(root, 'public/assets/social-preview.gif');
const jpg = path.join(root, 'public/assets/social-preview.jpg');
const metadata = await sharp(source).metadata();
if (metadata.width !== 1200 || metadata.height !== 630) {
  throw new Error('Expected a 1200×630 source; do not resize the small preview text.');
}

const temporary = await mkdtemp(path.join(tmpdir(), 'social-preview-'));
try {
  const intermediate = path.join(temporary, 'palette.gif');
  // Full-frame palette sampling preserves static colours, including the green CTA.
  // Ordered dithering and transparent deltas avoid noisy error-diffusion animation.
  execFileSync(process.env.FFMPEG || 'ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', source,
    '-filter_complex', 'fps=12,split[a][b];[a]palettegen=max_colors=96:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle',
    '-gifflags', '+transdiff', '-loop', '0', intermediate,
  ], { stdio: 'inherit' });
  // Bounded inter-frame loss reduces subtle colour churn without resizing text.
  // Higher tolerances left visible trails around the moving character in trials.
  await sharp(intermediate, { animated: true, limitInputPixels: false })
    .gif({ reuse: false, colours: 96, effort: 10, dither: 0, interFrameMaxError: 16, interPaletteMaxError: 3, loop: 0 })
    .toFile(gif);
  // The first source frame has the complete headline and a clear skateboard pose.
  await sharp(source, { page: 0 })
    .jpeg({ quality: 90, chromaSubsampling: '4:4:4', mozjpeg: true })
    .toFile(jpg);

  const originalBytes = (await stat(source)).size;
  for (const file of [gif, jpg]) {
    const bytes = (await stat(file)).size;
    console.log(`${path.relative(root, file)}: ${bytes.toLocaleString('en-US')} bytes (${(100 * (1 - bytes / originalBytes)).toFixed(1)}% smaller than source)`);
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
