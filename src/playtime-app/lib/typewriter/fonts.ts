/**
 * Typewriter faces, served locally from /assets/fonts/typewriter (SIL OFL / Apache-2.0).
 * They are registered through the FontFace API on `document.fonts`, which both the
 * shadow-root DOM and Canvas 2D can use.
 */
export type TypewriterFont = 'courier-prime' | 'special-elite';

export const FONT_STACKS: Record<TypewriterFont, string> = {
  'courier-prime': '"TW Courier Prime", "Courier New", monospace',
  'special-elite': '"TW Special Elite", "Courier New", monospace',
};

const SOURCES: Record<TypewriterFont, { family: string; url: string; weight: string }[]> = {
  'courier-prime': [
    { family: 'TW Courier Prime', url: '/assets/fonts/typewriter/courier-prime-latin-400-normal.woff2', weight: '400' },
    { family: 'TW Courier Prime', url: '/assets/fonts/typewriter/courier-prime-latin-700-normal.woff2', weight: '700' },
  ],
  'special-elite': [
    { family: 'TW Special Elite', url: '/assets/fonts/typewriter/special-elite-latin-400-normal.woff2', weight: '400' },
  ],
};

const loading = new Map<TypewriterFont, Promise<void>>();

export function ensureTypewriterFont(font: TypewriterFont): Promise<void> {
  const cached = loading.get(font);
  if (cached) return cached;
  const promise = (async () => {
    if (typeof FontFace === 'undefined' || !document.fonts) return;
    await Promise.all(SOURCES[font].map(async ({ family, url, weight }) => {
      const face = new FontFace(family, `url(${url}) format("woff2")`, { weight, display: 'swap' });
      await face.load();
      document.fonts.add(face);
    }));
  })().catch(() => undefined);
  loading.set(font, promise);
  return promise;
}
