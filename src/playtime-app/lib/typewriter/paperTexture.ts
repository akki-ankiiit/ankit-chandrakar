import { clamp, hash01, hash32, mulberry32, valueNoise2 } from './seededRandom';

export interface PaperTone { base: string; highlight: string; aged: string; fiber: string }

export const PAPER_TONES: Record<'warm' | 'ivory' | 'aged', PaperTone> = {
  warm: { base: '#F0EBDD', highlight: '#F7F2E7', aged: '#E5DDCC', fiber: '#C9C0AE' },
  ivory: { base: '#F3EFE4', highlight: '#FAF7EE', aged: '#E9E3D3', fiber: '#CFC7B5' },
  aged: { base: '#EAE1CC', highlight: '#F1E9D6', aged: '#DCCFB4', fiber: '#BDAF92' },
};

export interface PaperOptions { tone: PaperTone; grain: number; seed: number }

const hex = (value: string): [number, number, number] => {
  const n = parseInt(value.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] =>
  [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

let grainTile: HTMLCanvasElement | null = null;

/** One shared 256px tile of fine speckle. Per-pixel noise has no visible repetition at this scale. */
export function getGrainTile(): HTMLCanvasElement {
  if (grainTile) return grainTile;
  const size = 256;
  const tile = document.createElement('canvas');
  tile.width = size; tile.height = size;
  const ctx = tile.getContext('2d')!;
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const n = hash01(7, x, y);
      const coarse = valueNoise2(11, x, y, 3);
      const v = n * 0.65 + coarse * 0.35;
      image.data[i] = 70; image.data[i + 1] = 58; image.data[i + 2] = 42;
      image.data[i + 3] = Math.round(Math.pow(v, 1.6) * 255);
    }
  }
  ctx.putImageData(image, 0, 0);
  grainTile = tile;
  return tile;
}

const LATTICE = 28;
const CHUNK = 512;

export interface PaperBand { top: number; height: number }

/**
 * Draw the sheet, or only the band `[top, top + height)` of it, in document coordinates.
 * Everything is keyed to absolute positions: aging is sampled on an absolute lattice, grain is
 * anchored at the sheet origin, and fibres/specks come from per-512px chunk seeds. So any band
 * repaints identically, and a long sheet never needs a full-height bitmap.
 */
export function drawPaper(canvas: HTMLCanvasElement, width: number, height: number, dpr: number, options: PaperOptions, band?: PaperBand) {
  const top = band ? Math.max(0, band.top) : 0;
  const bandH = band ? Math.max(0, Math.min(band.height, height - top)) : height;
  const w = Math.max(1, Math.round(width * dpr));
  const h = Math.max(1, Math.round(bandH * dpr));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { tone, grain, seed } = options;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);

  // Layer 1: warm ivory base.
  ctx.fillStyle = tone.base;
  ctx.fillRect(0, 0, w, h);

  // Layer 4: tonal aging on absolute lattice rows, so neighbouring bands join without a seam.
  const r0 = Math.floor(top / LATTICE) - 1;
  const r1 = Math.ceil((top + bandH) / LATTICE) + 1;
  const lw = Math.ceil(width / LATTICE) + 2;
  const lh = r1 - r0 + 1;
  const low = document.createElement('canvas');
  low.width = lw; low.height = lh;
  const lctx = low.getContext('2d')!;
  const img = lctx.createImageData(lw, lh);
  const hi = hex(tone.highlight), aged = hex(tone.aged);
  for (let j = 0; j < lh; j += 1) {
    const row = r0 + j;
    for (let x = 0; x < lw; x += 1) {
      const n = valueNoise2(seed + 3, x, row, 5) * 0.65 + valueNoise2(seed + 9, x, row, 2.2) * 0.35;
      const c = mix(hi, aged, clamp((n - 0.28) * 1.5));
      const i = (j * lw + x) * 4;
      img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
    }
  }
  lctx.putImageData(img, 0, 0);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.globalAlpha = 0.62;
  ctx.drawImage(low, 0, (r0 * LATTICE - top) * dpr, lw * LATTICE * dpr, lh * LATTICE * dpr);
  ctx.restore();

  // Layer 2: fine grain. Device = k·user − top·dpr, so the tile origin is the sheet origin (no drift when scrolling).
  const pattern = ctx.createPattern(getGrainTile(), 'repeat');
  if (pattern) {
    const k = dpr / 1.4;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.03 + 0.1 * clamp(grain);
    ctx.setTransform(k, 0, 0, k, 0, -top * dpr);
    ctx.fillStyle = pattern;
    ctx.fillRect(0, (top * dpr) / k, w / k, h / k);
    ctx.restore();
  }

  // Layer 3: fibres and specks, one deterministic set per chunk. Neighbour chunks are included
  // so strokes that cross a band edge are drawn whole.
  const fiberColor = hex(tone.fiber);
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, -top * dpr);
  ctx.lineCap = 'round';
  const c0 = Math.floor(top / CHUNK) - 1;
  const c1 = Math.floor((top + bandH) / CHUNK) + 1;
  for (let c = c0; c <= c1; c += 1) {
    const rand = mulberry32(hash32(seed * 7919 + 13, c));
    const yBase = c * CHUNK;
    const area = width * CHUNK;
    const fibers = Math.round((area / 5200) * (0.35 + clamp(grain) * 0.9));
    for (let i = 0; i < fibers; i += 1) {
      const x = rand() * width, y = yBase + rand() * CHUNK;
      const len = 5 + Math.pow(rand(), 2.2) * 34;
      const angle = rand() * Math.PI * 2;
      const bend = (rand() - 0.5) * len * 0.6;
      const dark = rand() < 0.62;
      const col = dark ? fiberColor : [255, 252, 244];
      ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${(dark ? 0.1 : 0.22) + rand() * (dark ? 0.2 : 0.2)})`;
      ctx.lineWidth = 0.3 + rand() * 0.7;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(angle) * len * 0.5 - Math.sin(angle) * bend, y + Math.sin(angle) * len * 0.5 + Math.cos(angle) * bend, x + Math.cos(angle) * len, y + Math.sin(angle) * len);
      ctx.stroke();
    }
    const specks = Math.round((area / 3800) * (0.3 + clamp(grain)));
    for (let i = 0; i < specks; i += 1) {
      const x = rand() * width, y = yBase + rand() * CHUNK;
      const r = 0.25 + Math.pow(rand(), 3) * 0.9;
      ctx.fillStyle = `rgba(110,92,66,${0.08 + rand() * 0.22})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
