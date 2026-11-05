/** Glyph alpha masks: each character is rasterised once per (font, size, dpr, thickness) and reused. */
export interface TypewriterMetrics {
  fontCss: string;
  fontSize: number;
  dpr: number;
  /** Monospaced advance in CSS px. */
  cellW: number;
  /** Line pitch in CSS px. */
  lineH: number;
  /** Baseline offset from the top of a line box, CSS px. */
  baseline: number;
  /** Horizontal bleed around a cell so wide glyphs and rotation are never clipped, CSS px. */
  pad: number;
  /**
   * Font size at which the invisible editing <textarea> (set in a truly monospaced face) has exactly
   * `cellW` advance, so native wrapping, clicks and selection land on the same cells as the printed ink.
   */
  inputFontSize: number;
}

export interface GlyphMask { width: number; height: number; alpha: Uint8ClampedArray }

const MONO_PROBE = '"TW Courier Prime", "Courier New", monospace';

export function measureMetrics(family: string, fontSize: number, lineHeightRatio: number, dpr: number): TypewriterMetrics {
  const fontCss = `${fontSize}px ${family}`;
  const probe = document.createElement('canvas').getContext('2d')!;
  probe.font = fontCss;
  const m = probe.measureText('MMMMMMMMMM');
  const narrow = probe.measureText('iiiiiiiiii').width / 10;
  const wide = m.width / 10;
  // Truly monospaced faces use their advance. Typewriter faces with uneven widths (Special Elite) are set on a
  // fixed pitch, the average lowercase width, with each glyph centred in its cell like a real typebar strike.
  const lower = probe.measureText('abcdefghijklmnopqrstuvwxyz').width / 26;
  const cellW = Math.abs(wide - narrow) < 0.02 * wide ? wide : lower;
  const lineH = Math.round(fontSize * lineHeightRatio * 100) / 100;
  const ascent = m.fontBoundingBoxAscent ?? fontSize * 0.8;
  const descent = m.fontBoundingBoxDescent ?? fontSize * 0.25;
  // Same placement CSS uses: the font's content area centred in the line box.
  const baseline = (lineH - (ascent + descent)) / 2 + ascent;
  probe.font = `100px ${MONO_PROBE}`;
  const inputRatio = probe.measureText('M'.repeat(20)).width / 2000;
  return { fontCss, fontSize, dpr, cellW, lineH, baseline, pad: Math.ceil(fontSize * 0.3), inputFontSize: cellW / inputRatio };
}

const masks = new Map<string, GlyphMask>();

export function getGlyphMask(ch: string, metrics: TypewriterMetrics, thick: boolean): GlyphMask | null {
  const key = `${metrics.fontCss}|${metrics.dpr}|${metrics.lineH}|${metrics.cellW}|${thick ? 1 : 0}|${ch}`;
  const hit = masks.get(key);
  if (hit) return hit;
  const { dpr, pad, cellW, lineH, baseline } = metrics;
  const width = Math.round((cellW + pad * 2) * dpr);
  const height = Math.round(lineH * dpr);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.scale(dpr, dpr);
  ctx.font = metrics.fontCss;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#000';
  const glyphW = ctx.measureText(ch).width;
  const x0 = pad + (cellW - glyphW) / 2;
  ctx.fillText(ch, x0, baseline);
  // Over-inked impressions get a second, slightly displaced strike (never a visible duplicate).
  if (thick) { ctx.globalAlpha = 0.75; ctx.fillText(ch, x0 + 0.32, baseline + 0.18); }
  const alpha = new Uint8ClampedArray(width * height);
  const data = ctx.getImageData(0, 0, width, height).data;
  for (let i = 0; i < alpha.length; i += 1) alpha[i] = data[i * 4 + 3];
  const mask = { width, height, alpha };
  if (masks.size > 1500) masks.delete(masks.keys().next().value as string);
  masks.set(key, mask);
  return mask;
}
