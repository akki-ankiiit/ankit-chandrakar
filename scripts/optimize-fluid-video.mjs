import { spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = `${root}source-assets/video/Fluid.mp4`;
const output = `${root}public/assets/video/fluid-web.mp4`;
// Native framing is retained; only the small lower-right logo is reconstructed.
const filter = 'delogo=x=1134:y=650:w=114:h=48';
function ffmpeg(args) {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', ...args], { maxBuffer: 20 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr.toString());
  return result.stdout;
}
ffmpeg(['-y', '-i', source, '-vf', filter, '-map', '0:v:0', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-maxrate', '850k', '-bufsize', '1700k', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-map_metadata', '-1', output]);
const frame = ffmpeg(['-ss', '1', '-i', source, '-vf', filter, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-']);
await sharp(frame).webp({ quality: 85 }).toFile(`${root}public/assets/video/fluid-poster.webp`);
console.log(JSON.stringify({ sourceBytes: statSync(source).size, videoBytes: statSync(output).size, posterBytes: statSync(`${root}public/assets/video/fluid-poster.webp`).size }));

// Optional inspection sheet, outside the project: original / cleaned at 0,1,5,9s.
if (process.argv[2]) {
  const panels = [];
  for (const [row, seconds] of [0, 1, 5, 9].entries()) {
    for (const [column, input] of [source, output].entries()) {
      const image = ffmpeg(['-ss', String(seconds), '-i', input, '-vf', 'crop=264:160:1000:560,scale=528:320', '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-']);
      panels.push({ input: image, left: column * 528, top: row * 320 });
    }
  }
  await sharp({ create: { width: 1056, height: 1280, channels: 3, background: '#111' } }).composite(panels).png().toFile(process.argv[2]);
}
