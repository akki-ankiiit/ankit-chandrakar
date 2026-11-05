import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ensureTypewriterFont, FONT_STACKS, type TypewriterFont } from '../lib/typewriter/fonts';
import { measureMetrics, type TypewriterMetrics } from '../lib/typewriter/glyphMasks';
import { layoutText, type TextLayout } from '../lib/typewriter/textLayout';

const MAX_PIXELS = 14_000_000;

export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setWidth(Math.round(el.getBoundingClientRect().width));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Client width (excludes any scrollbar) of an element, kept current by ResizeObserver. */
export function useClientWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

export interface TypewriterGeometry {
  ready: boolean;
  metrics: TypewriterMetrics | null;
  layout: TextLayout;
  padX: number;
  padY: number;
  cols: number;
  paperHeight: number;
  fontSize: number;
}

/** Fonts, metrics, wrapping and paper size for a sheet of the given width. */
export function useTypewriterGeometry(opts: {
  text: string; width: number; font: TypewriterFont; fontSize: number; minLines: number;
}): TypewriterGeometry {
  const { text, width, font, fontSize: baseSize, minLines } = opts;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    setReady(false);
    // The editing layer is always set in Courier Prime (monospaced) so native layout matches the cells.
    Promise.all([ensureTypewriterFont(font), ensureTypewriterFont('courier-prime')]).then(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, [font]);

  const fontSize = Math.round(baseSize * (width && width < 420 ? 0.72 : width < 600 ? 0.82 : 1) * 10) / 10;
  const padX = Math.round(Math.min(72, Math.max(20, width * 0.075)));
  const padY = Math.round(Math.min(64, Math.max(24, width * 0.07)));
  const dpr = useMemo(() => {
    const raw = Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1, 2.5);
    return raw;
  }, []);

  const metrics = useMemo(() => {
    if (!ready || !width) return null;
    let d = dpr;
    // Keep canvas memory reasonable on very tall sheets (long text): fall back toward 1x.
    const estimate = width * (padY * 2 + Math.max(minLines, text.split('\n').length) * fontSize * 1.45) * d * d;
    if (estimate > MAX_PIXELS) d = Math.max(1, Math.sqrt(MAX_PIXELS / (estimate / (d * d))));
    return measureMetrics(FONT_STACKS[font], fontSize, 1.45, d);
    // text line count only matters for the memory cap; recompute when the sheet gets very long.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, width, font, fontSize, dpr, padY, minLines, Math.ceil(text.length / 400)]);

  const cols = metrics ? Math.max(8, Math.floor((width - padX * 2) / metrics.cellW)) : 40;
  const layout = useMemo(() => layoutText(text, cols), [text, cols]);
  const lines = Math.max(minLines, layout.lines.length);
  const paperHeight = Math.ceil(padY * 2 + lines * (metrics?.lineH ?? fontSize * 1.45));
  return { ready, metrics, layout, padX, padY, cols, paperHeight, fontSize };
}
