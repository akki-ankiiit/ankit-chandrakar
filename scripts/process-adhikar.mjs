import { createHash } from 'node:crypto';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Script } from 'node:vm';

// Extract the supplied bytes without evaluating the deck or re-encoding images.
const directory = fileURLToPath(new URL('../public/assets/Adhikar/', import.meta.url));
const documentPath = path.join(directory, 'Adhikaar-App-Presentation.html');
const original = await readFile(documentPath, 'utf8');
let html = original;
const pending = new Map();
const hashes = new Map();
const extensions = { 'font/ttf': 'ttf', 'image/webp': 'webp' };
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const local = reference => {
  if (!/^[a-z\d][a-z\d._-]*$/i.test(reference)) throw new Error(`Non-local reference: ${reference}`);
  return path.join(directory, reference);
};
function extract(uri, name) {
  const match = /^data:([^;,]+);base64,([a-z\d+/=\s]+)$/i.exec(uri);
  if (!match || !extensions[match[1]]) throw new Error(`Unsupported asset: ${name}`);
  const bytes = Buffer.from(match[2], 'base64');
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hashes.has(hash)) return hashes.get(hash);
  const filename = `${slug(name)}.${extensions[match[1]]}`;
  if (pending.has(filename) && !pending.get(filename).equals(bytes)) throw new Error(`Asset name collision: ${filename}`);
  hashes.set(hash, filename);
  pending.set(filename, bytes);
  return filename;
}
html = html.replace(/@font-face\s*\{[^}]*\}/g, rule => {
  const family = /font-family:\s*['"]([^'"]+)['"]/.exec(rule)?.[1];
  const weight = /font-weight:\s*([^;]+)/.exec(rule)?.[1]?.trim();
  const style = /font-style:\s*([^;]+)/.exec(rule)?.[1]?.trim() || 'normal';
  return rule.replace(/url\((data:[^)]+)\)/g, (_, uri) => `url('${extract(uri, `${family}-${weight}-${style}`)}')`);
});
const assetMatch = /const ASSETS\s*=\s*(\{[\s\S]*?\});/.exec(html);
if (!assetMatch) throw new Error('Missing asset map');
const assets = JSON.parse(assetMatch[1]);
if (Object.keys(assets).length !== 15) throw new Error('Expected 15 named images');
for (const [name, uri] of Object.entries(assets)) {
  if (uri.startsWith('data:')) assets[name] = extract(uri, name);
}
html = html.replace(assetMatch[0], `const ASSETS=${JSON.stringify(assets, null, 2)};`);
html = html.replace(/<style>([\s\S]*?)<\/style>/, (_, css) => `<style>${css.replace(/}(?=[^\n])/g, '}\n')}</style>`);
// Break slide and script boundaries only; preserve all supplied text and inline design.
html = html.replace(/(<\/section>|<\/script>|<\/head>)(?=<)/g, '$1\n').replace(/(?<!\n)(?=<section\b)/g, '\n');
if (/data:[^\s"')]*;base64,/.test(html)) throw new Error('Embedded asset remains');
const slideCount = [...html.matchAll(/<section\b[^>]*\bdata-title=/g)].length;
if (slideCount !== 20) throw new Error(`Expected 20 slides, found ${slideCount}`);
const fontCount = [...html.matchAll(/@font-face\s*\{/g)].length;
if (fontCount !== 10) throw new Error(`Expected 10 font faces, found ${fontCount}`);
const inspectCount = [...html.matchAll(/data-inspect="/g)].length;
if (inspectCount !== 23) throw new Error(`Expected 23 inspection buttons, found ${inspectCount}`);
const labels = JSON.parse(/const LABELS\s*=\s*(\{[^\n]*?\});/.exec(html)?.[1] || '{}');
for (const match of html.matchAll(/data-(asset|inspect)="([^"]+)"/g)) {
  if (!assets[match[2]]) throw new Error(`Missing image mapping: ${match[2]}`);
  if (match[1] === 'inspect' && !labels[match[2]]) throw new Error(`Missing inspector label: ${match[2]}`);
}
for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Script(match[1], { filename: documentPath });
const references = new Set([...Object.values(assets), ...Array.from(html.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g), match => match[1])]);
// Preflight every destination and reference before writing anything.
for (const [filename, bytes] of pending) {
  let existing;
  try { existing = await readFile(local(filename)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (existing && !existing.equals(bytes)) throw new Error(`Refusing to overwrite a different asset: ${filename}`);
}
for (const reference of references) if (!pending.has(reference)) await stat(local(reference));
for (const [filename, bytes] of pending) {
  try { await writeFile(local(filename), bytes, { flag: 'wx' }); } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    if (!(await readFile(local(filename))).equals(bytes)) throw new Error(`Refusing to overwrite a different asset: ${filename}`);
  }
}
if (html !== original) await writeFile(documentPath, html);
let assetBytes = 0;
let imageBytes = 0;
for (const reference of references) {
  const size = (await stat(local(reference))).size;
  assetBytes += size;
  if (reference.endsWith('.webp')) imageBytes += size;
}
console.log(JSON.stringify({ htmlBefore: Buffer.byteLength(original), htmlAfter: Buffer.byteLength(html), htmlChanged: html !== original, slideCount, inspectCount, fontCount, referencedFiles: references.size, imageBytes, fontBytes: assetBytes - imageBytes, assetBytes, totalBytes: Buffer.byteLength(html) + assetBytes }, null, 2));
