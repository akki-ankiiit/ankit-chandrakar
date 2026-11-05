import { useEffect, useRef } from 'react';
import { drawInk, type InkOptions } from '../../lib/typewriter/inkRenderer';
import type { TypewriterMetrics } from '../../lib/typewriter/glyphMasks';
import type { TextLayout } from '../../lib/typewriter/textLayout';

interface TypewriterCanvasProps {
  width: number;
  height: number;
  layout: TextLayout;
  metrics: TypewriterMetrics;
  options: InkOptions;
  originX: number;
  originY: number;
  grain: number;
  visibleCount?: number;
  selection?: { from: number; to: number };
  /** Vertical window of the sheet to paint (see drawInk). Omit to paint the whole sheet. */
  band?: { top: number; height: number };
  onUnsupported?: () => void;
}

/** Ink layer: redraws only when text, selection or geometry change (never while idle). */
export function TypewriterCanvas({ width, height, layout, metrics, options, originX, originY, grain, visibleCount, selection, band, onUnsupported }: TypewriterCanvasProps) {
  const top = band ? Math.max(0, band.top) : 0;
  const bandH = band ? Math.max(0, Math.min(band.height, height - top)) : height;
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !width) return undefined;
    const frame = requestAnimationFrame(() => {
      const ok = drawInk({ canvas, width, height, layout, metrics, options, originX, originY, visibleCount, selection, grain, band: band ? { top, height: bandH } : undefined });
      if (!ok) onUnsupported?.();
    });
    return () => cancelAnimationFrame(frame);
  }, [width, height, layout, metrics, options, originX, originY, visibleCount, selection?.from, selection?.to, grain, top, bandH, band ? 1 : 0, onUnsupported]);
  return <canvas ref={ref} className="tw-ink" aria-hidden="true" style={{ width, height: bandH, top }} />;
}
