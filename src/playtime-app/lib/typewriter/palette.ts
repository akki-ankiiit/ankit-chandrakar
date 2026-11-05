import { DEFAULT_INK, type InkPalette } from './inkRenderer';

const rgb = (v: string): [number, number, number] => { const n = parseInt(v.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = (c: number[]) => `#${c.map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')}`;
const mix = (a: string, b: string, t: number) => { const x = rgb(a), y = rgb(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };

/** Derive heavy / medium / faded ink from one colour. The default colour returns the reference palette. */
export function makePalette(ink: string): InkPalette {
  if (!/^#[0-9a-f]{6}$/i.test(ink) || ink.toLowerCase() === DEFAULT_INK.primary.toLowerCase()) return DEFAULT_INK;
  return { primary: ink, heavy: mix(ink, '#000000', 0.45), mid: mix(ink, '#F0EBDD', 0.3), faded: mix(ink, '#F0EBDD', 0.55) };
}
