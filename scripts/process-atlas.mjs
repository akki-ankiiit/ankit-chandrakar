import { createHash } from 'node:crypto';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Script } from 'node:vm';

// Run from any directory. Only extracts assets; never re-encodes product screens.
const directory = fileURLToPath(new URL('../public/assets/Atlas/', import.meta.url));
const documentPath = path.join(directory, 'Atlas-Case-Study.html');
const original = await readFile(documentPath, 'utf8');
let html = original;
const filesByHash = new Map();
const extensions = { 'font/ttf': 'ttf', 'font/woff2': 'woff2', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg' };
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const pending = new Map();

function extract(uri, name) {
  const match = /^data:([^;,]+);base64,([a-z\d+/=\s]+)$/i.exec(uri);
  if (!match || !extensions[match[1]]) throw new Error(`Unsupported embedded asset: ${name}`);
  let bytes = Buffer.from(match[2], 'base64');
  if (name === 'atlas-logo') {
    // Retain the supplied paths, orange mark, and clipping geometry exactly.
    bytes = Buffer.from(bytes.toString('utf8').replace(/(<path\b[^>]*\bfill=")white(")/gi, '$1#282828$2'));
  }
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (filesByHash.has(hash)) return filesByHash.get(hash);
  const filename = `${slug(name)}.${extensions[match[1]]}`;
  filesByHash.set(hash, filename);
  pending.set(filename, bytes);
  return filename;
}

html = html.replace(/@font-face\s*\{[^}]*\}/g, rule => {
  const family = /font-family:\s*['"]([^'"]+)['"]/.exec(rule)?.[1];
  const weight = /font-weight:\s*([^;]+)/.exec(rule)?.[1]?.trim();
  const style = /font-style:\s*([^;]+)/.exec(rule)?.[1]?.trim() || 'normal';
  return rule.replace(/url\((data:[^)]+)\)/g, (_, uri) => `url('${extract(uri, `${family}-${weight}-${style}`)}')`);
});

// ASSETS is JSON, not executable code. Keep the surrounding presentation script intact.
const assetMatch = /const ASSETS=(\{[\s\S]*?\});/.exec(html);
if (!assetMatch) throw new Error('Could not locate the Atlas asset map');
const assets = JSON.parse(assetMatch[1]);
for (const [name, uri] of Object.entries(assets)) {
  if (uri.startsWith('data:')) assets[name] = extract(uri, name);
}
html = html.replace(assetMatch[0], `const ASSETS=${JSON.stringify(assets, null, 2)};`);
// Expand the formerly giant CSS line for maintainable, reviewable source.
html = html.replace(/<style>([\s\S]*?)<\/style>/, (_, css) => `<style>${css.replace(/}(?=[^\n])/g, '}\n')}</style>`);
if (/data:[^\s"')]*;base64,/.test(html)) throw new Error('Unexpected embedded data remains');
const slideCount = [...html.matchAll(/<section\b[^>]*\bdata-title=/g)].length;
if (slideCount !== 13) throw new Error(`Expected 13 slides, found ${slideCount}`);
const labels = JSON.parse(/const LABELS=(\{[^\n]*?\});/.exec(html)?.[1] || '{}');
for (const match of html.matchAll(/data-(asset|inspect)="([^"]+)"/g)) {
  if (!assets[match[2]]) throw new Error(`Missing asset: ${match[2]}`);
  if (match[1] === 'inspect' && !labels[match[2]]) throw new Error(`Missing inspector label: ${match[2]}`);
}
for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  // Parse only: presentation globals are never evaluated during extraction.
  new Script(match[1], { filename: 'Atlas-Case-Study.html' });
}
const suppliedLogo = await readFile(path.join(directory, 'atlas.svg'), 'utf8');
const displayLogo = pending.get(assets['atlas-logo'])?.toString('utf8') || await readFile(path.join(directory, assets['atlas-logo']), 'utf8');
const paths = svg => Array.from(svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g), match => match[1]);
if (JSON.stringify(paths(suppliedLogo)) !== JSON.stringify(paths(displayLogo))) throw new Error('Atlas logo paths differ from the supplied SVG');
if (!displayLogo.includes('fill="#282828"') || !displayLogo.includes('fill="#FA6A42"')) throw new Error('Unexpected Atlas logo colors');

for (const [filename, bytes] of pending) {
  const destination = path.join(directory, filename);
  let existing;
  try { existing = await readFile(destination); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (existing && !existing.equals(bytes)) throw new Error(`Refusing to overwrite a different asset: ${filename}`);
  if (!existing) await writeFile(destination, bytes);
}
if (html !== original) await writeFile(documentPath, html);

const references = new Set([...Object.values(assets), ...Array.from(html.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g), match => match[1])]);
let assetBytes = 0;
for (const reference of references) {
  if (/^(?:[a-z]+:|\/|#)/i.test(reference) || reference.includes('..')) throw new Error(`Non-local asset: ${reference}`);
  assetBytes += (await stat(path.join(directory, reference))).size;
}
console.log(JSON.stringify({ htmlBefore: Buffer.byteLength(original), htmlAfter: Buffer.byteLength(html), htmlChanged: html !== original, slideCount, referencedFiles: references.size, assetBytes, totalBytes: Buffer.byteLength(html) + assetBytes }, null, 2));
