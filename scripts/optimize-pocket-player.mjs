import { spawnSync } from 'node:child_process';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const directory = new URL('../public/assets/video/', import.meta.url);
const source = fileURLToPath(new URL('../source-assets/video/Pocket Player.mp4', import.meta.url));
const output = fileURLToPath(new URL('pocket-player-web.mp4', directory));
const poster = fileURLToPath(new URL('pocket-player-poster.webp', directory));
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
// Repair only the lower-right watermark at source resolution, preserving the shoes
// and full composition. Share the exact repair between the animation and poster.
const filter = 'delogo=x=760:y=1024:w=82:h=38,scale=632:800';

const encode = spawnSync(ffmpeg, [
  '-hide_banner', '-loglevel', 'error', '-y', '-i', source,
  '-map', '0:v:0', '-an', '-vf', filter, '-r', '24',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p',
  '-map_metadata', '-1', '-movflags', '+faststart', output,
], { stdio: 'inherit' });
if (encode.error) throw encode.error;
if (encode.status !== 0) throw new Error('Pocket Player video encoding failed');

const frame = spawnSync(ffmpeg, [
  '-hide_banner', '-loglevel', 'error', '-ss', '1', '-i', source,
  '-frames:v', '1', '-vf', filter, '-f', 'image2pipe', '-vcodec', 'png', 'pipe:1',
], { maxBuffer: 8 * 1024 * 1024 });
if (frame.error) throw frame.error;
if (frame.status !== 0) throw new Error(frame.stderr.toString());
await sharp(frame.stdout).webp({ quality: 85 }).toFile(poster);
console.log({ originalBytes: (await stat(source)).size, videoBytes: (await stat(output)).size, posterBytes: (await stat(poster)).size });
