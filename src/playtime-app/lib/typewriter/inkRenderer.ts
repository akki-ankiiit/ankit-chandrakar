import { clamp, hash01, lerp, mulberry32, valueNoise2 } from './seededRandom';
import { getGlyphMask, type TypewriterMetrics } from './glyphMasks';
import { getGrainTile } from './paperTexture';
import type { TextLayout } from './textLayout';
import { selectionRanges } from './caretPosition';

export interface InkPalette { heavy: string; primary: string; mid: string; faded: string }
export const DEFAULT_INK: InkPalette = { heavy: '#252321', primary: '#403B36', mid: '#625D56', faded: '#8F8980' };

export interface InkOptions {
  palette: InkPalette;
  /** 0..1: spread between strong and faded impressions. */
  inkVariation: number;
  /** 0..1: dropouts, pressure gradients, edge roughness and mechanical jitter. */
  characterImperfection: number;
  seed: number;
}

const rgb = (value: string): [number, number, number] => {
  const n = parseInt(value.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

interface Variant {
  color: [number, number, number];
  density: number;
  thick: boolean;
  pattern: number;
  pressure: number;
  dropThreshold: number;
  noiseSeed: number;
  dx: number; dy: number; rot: number;
}

/**
 * Every character gets its own deterministic impression. A slow 1-D noise over the character index
 * correlates neighbours (a ribbon fades and recovers over several letters); a per-glyph random value
 * adds the individual strike. Initial mix: ~15% strong, ~50% normal, ~25% light, ~10% faded.
 */
function deriveVariant(ch: string, index: number, o: InkOptions): Variant {
  const seed = o.seed >>> 0;
  const code = ch.charCodeAt(0);
  const rnd = mulberry32(hash01(seed, index, code) * 4294967296);
  const slow = valueNoise2(seed + 101, index, 0, 7);
  let u = lerp(rnd(), slow, 0.35);
  u = clamp(0.5 + (u - 0.5) * 1.3);
  const palette = [rgb(o.palette.faded), rgb(o.palette.mid), rgb(o.palette.primary), rgb(o.palette.heavy)];
  let klass: number, base: number;
  if (u > 0.85) { klass = 3; base = 0.97 + rnd() * 0.03; }
  else if (u > 0.35) { klass = 2; base = 0.86 + rnd() * 0.12; }
  else if (u > 0.1) { klass = 1; base = 0.64 + rnd() * 0.16; }
  else { klass = 0; base = 0.42 + rnd() * 0.14; }
  const v = clamp(o.inkVariation);
  const imp = clamp(o.characterImperfection);
  const density = lerp(0.9, base, v);
  // Colour follows the class but is pulled toward the primary ink when variation is low.
  const target = palette[klass];
  const primary = palette[2];
  const color: [number, number, number] = [lerp(primary[0], target[0], v), lerp(primary[1], target[1], v), lerp(primary[2], target[2], v)];
  const jitter = 0.4 + imp * 0.9;
  return {
    color,
    density,
    thick: rnd() < 0.07 + 0.05 * v,
    pattern: Math.floor(rnd() * 5),
    pressure: (0.12 + rnd() * 0.4) * imp,
    dropThreshold: (0.05 + rnd() * 0.2) * imp,
    noiseSeed: Math.floor(rnd() * 1e6),
    dx: (rnd() - 0.5) * 2 * 0.4 * jitter,
    dy: (rnd() - 0.5) * 2 * 0.8 * jitter,
    rot: ((rnd() - 0.5) * 2 * 0.35 * jitter * Math.PI) / 180,
  };
}

const pressureAt = (pattern: number, k: number, x: number, y: number): number => {
  switch (pattern) {
    case 1: return 1 - k * Math.abs(y - 0.5) * 2.2;          // darker through the middle
    case 2: return 1 - k * (1 - y) * 1.5;                    // darker lower portion
    case 3: return 1 - k * clamp((0.38 - y) * 3) * 1.8;      // top under-inked
    case 4: return 1 - k * Math.abs(x - 0.5) * 2 * (x < 0.5 ? 1.4 : 0.5); // one side lighter
    default: return 1 - k * 0.3;
  }
};

const bitmaps = new Map<string, HTMLCanvasElement>();

/** Cached per-character ink bitmap (RGBA, device pixels). */
function renderChar(ch: string, index: number, m: TypewriterMetrics, o: InkOptions): HTMLCanvasElement | null {
  const key = `${m.fontCss}|${m.dpr}|${m.lineH}|${o.seed}|${o.inkVariation}|${o.characterImperfection}|${o.palette.primary}|${index}|${ch}`;
  const hit = bitmaps.get(key);
  if (hit) return hit;
  const variant = deriveVariant(ch, index, o);
  const mask = getGlyphMask(ch, m, variant.thick);
  if (!mask) return null;
  const { width, height, alpha } = mask;
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(width, height);
  const out = image.data;
  const [r, g, b] = variant.color;
  const s = variant.noiseSeed;
  const imp = clamp(o.characterImperfection);
  const scale = m.dpr;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      let a = alpha[i] / 255;
      if (a <= 0) continue;
      const fine = hash01(s, x, y);
      // Edge roughness: only partially covered pixels are perturbed, so shapes stay recognisable.
      if (a < 0.96) a = clamp(a * (0.62 + 0.76 * fine) + (fine - 0.5) * 0.12 * imp);
      // Ink density map: slow undulation plus fine tooth, clipped to the glyph (alpha already is).
      const low = valueNoise2(s + 5, x, y, 4.5 * scale);
      const map = low * 0.62 + fine * 0.38;
      const gap = clamp((map - variant.dropThreshold) / 0.1);
      // Impact pressure across the glyph box.
      const press = pressureAt(variant.pattern, variant.pressure, x / width, y / height);
      const density = variant.density * (0.9 + 0.2 * low) * clamp(press, 0.2, 1);
      const final = a * density * gap;
      if (final <= 0.004) continue;
      const p = i * 4;
      out[p] = r; out[p + 1] = g; out[p + 2] = b; out[p + 3] = Math.round(clamp(final) * 255);
    }
  }
  ctx.putImageData(image, 0, 0);
  if (bitmaps.size > 3000) bitmaps.delete(bitmaps.keys().next().value as string);
  bitmaps.set(key, canvas);
  return canvas;
}

export interface DrawInkParams {
  canvas: HTMLCanvasElement;
  /** Sheet width (CSS px) and full sheet height (CSS px). */
  width: number; height: number;
  layout: TextLayout;
  metrics: TypewriterMetrics;
  options: InkOptions;
  originX: number; originY: number;
  /** Only characters with index < visibleCount are printed (presentation typing). */
  visibleCount?: number;
  selection?: { from: number; to: number };
  grain: number;
  /**
   * Optional vertical window of the sheet to paint (CSS px, sheet coordinates). Long documents
   * paint only the band around the scroll position, so per-keystroke work stays bounded.
   */
  band?: { top: number; height: number };
}

export function drawInk(p: DrawInkParams) {
  const { canvas, width, layout, metrics: m, options, originX, originY, visibleCount, selection, grain } = p;
  const dpr = m.dpr;
  const top = p.band ? Math.max(0, p.band.top) : 0;
  const bandH = p.band ? Math.max(0, Math.min(p.band.height, p.height - top)) : p.height;
  const w = Math.max(1, Math.round(width * dpr));
  const h = Math.max(1, Math.round(bandH * dpr));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  // A line is painted when it touches the band (one line of slack for feed offsets and ink bleed).
  const inBand = (y: number) => y + m.lineH >= top - m.lineH && y <= top + bandH + m.lineH;

  if (selection && selection.to > selection.from) {
    ctx.fillStyle = 'rgba(143,137,128,0.34)';
    for (const range of selectionRanges(layout, selection.from, selection.to)) {
      const y = originY + range.line * m.lineH;
      if (!inBand(y)) continue;
      ctx.fillRect(
        (originX + range.from * m.cellW) * dpr,
        (y - top) * dpr,
        (range.to - range.from) * m.cellW * dpr,
        m.lineH * dpr,
      );
    }
  }

  const limit = visibleCount ?? Infinity;
  for (const c of layout.chars) {
    if (c.index >= limit || c.ch === ' ' || c.ch === '\t') continue;
    const lineY = originY + c.line * m.lineH;
    if (!inBand(lineY)) continue;
    const bitmap = renderChar(c.ch, c.index, m, options);
    if (!bitmap) continue;
    const v = deriveVariant(c.ch, c.index, options);
    const x = (originX + c.col * m.cellW - m.pad + v.dx) * dpr;
    const y = (lineY + v.dy - top) * dpr;
    if (Math.abs(v.rot) < 1e-4) { ctx.drawImage(bitmap, x, y); continue; }
    ctx.save();
    ctx.translate(x + bitmap.width / 2, y + bitmap.height / 2);
    ctx.rotate(v.rot);
    ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
    ctx.restore();
  }

  // Ink-paper interaction: the sheet's grain knocks tiny holes in the ink.
  const pattern = ctx.createPattern(getGrainTile(), 'repeat');
  if (pattern && grain > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = 0.12 + 0.3 * clamp(grain);
    ctx.scale(dpr / 1.4, dpr / 1.4);
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w / (dpr / 1.4), h / (dpr / 1.4));
    ctx.restore();
  }
  return true;
}
