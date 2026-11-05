import { useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import { drawPaper, PAPER_TONES, type PaperBand } from '../../lib/typewriter/paperTexture';

export type PaperToneName = keyof typeof PAPER_TONES;

interface VintagePaperProps {
  tone?: PaperToneName;
  /** 0..1 fine grain / fiber density. */
  grain?: number;
  seed?: number;
  /** Soft edge shadow, for a sheet lying on a surface. Off when the paper fills its container. */
  sheet?: boolean;
  /**
   * Optional painted window of a long sheet (document CSS px). The paper canvas then covers only
   * this band, which keeps memory bounded for long letters. Omit to paint the whole sheet.
   */
  band?: PaperBand;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** Paper surface painted on a cached canvas. Repaints only when its size, band, tone, grain or seed change. */
export function VintagePaper({ tone = 'warm', grain = 0.45, seed = 42, sheet = true, band, className = '', style, children }: VintagePaperProps) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const palette = useMemo(() => PAPER_TONES[tone] ?? PAPER_TONES.warm, [tone]);
  const last = useRef('');
  const bandTop = band ? Math.max(0, band.top) : 0;

  const paint = () => {
    const el = host.current, c = canvas.current;
    if (!el || !c) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width) return;
    const w = Math.round(rect.width);
    const sheetH = Math.max(rect.height, 1);
    let dpr: number;
    let top = 0;
    let bh: number;
    if (band) {
      // Windowed: bounded by the visible band, so the usual device-pixel cap is enough.
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      top = Math.min(bandTop, Math.max(0, sheetH - 1));
      bh = Math.max(1, Math.min(band.height, sheetH - top));
    } else {
      // Whole sheet (presentation mode): keep the pixel budget.
      const snapped = Math.ceil(sheetH / 240) * 240;
      dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(12_000_000 / (w * snapped)));
      bh = snapped;
    }
    const key = `${w}x${sheetH}@${dpr}|${top}x${bh}|${tone}|${grain}|${seed}`;
    if (key === last.current) return;
    last.current = key;
    c.style.width = `${w}px`;
    c.style.height = `${bh}px`;
    c.style.top = `${top}px`;
    drawPaper(c, w, sheetH, dpr, { tone: palette, grain, seed }, band ? { top, height: bh } : undefined);
  };

  useLayoutEffect(() => { paint(); });
  useEffect(() => {
    const el = host.current;
    if (!el) return undefined;
    let frame = 0;
    const observer = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(paint); });
    observer.observe(el);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palette, grain, seed, tone]);

  return (
    <div ref={host} className={`tw-sheet${sheet ? ' has-shadow' : ''} ${className}`} style={{ background: palette.base, ...style }}>
      <canvas ref={canvas} className="tw-paper" aria-hidden="true" />
      {children}
    </div>
  );
}
