import { useEffect, useMemo, useRef, useState } from 'react';
import { VintagePaper, type PaperToneName } from './VintagePaper';
import { TypewriterCanvas } from './TypewriterCanvas';
import { useElementWidth, usePrefersReducedMotion, useTypewriterGeometry } from '../../hooks/useTypewriter';
import { indexToCell } from '../../lib/typewriter/caretPosition';
import { DEFAULT_INK, type InkOptions } from '../../lib/typewriter/inkRenderer';
import { makePalette } from '../../lib/typewriter/palette';
import { FONT_STACKS, type TypewriterFont } from '../../lib/typewriter/fonts';

export interface TypewriterDisplayProps {
  text: string;
  animateOnView?: boolean;
  /** Milliseconds per character (before punctuation pauses). */
  typingSpeed?: number;
  showCaret?: boolean;
  seed?: number;
  paperTone?: PaperToneName;
  inkColor?: string;
  fontSize?: number;
  inkVariation?: number;
  paperGrain?: number;
  characterImperfection?: number;
  font?: TypewriterFont;
  minLines?: number;
  /** Delay before typing starts, ms. */
  startDelay?: number;
  /** Render on a sheet of paper (default) or just the ink with a shadowless sheet. */
  sheet?: boolean;
  onComplete?: () => void;
  className?: string;
}

const pauseFor = (ch: string) => (/[.!?]/.test(ch) ? 7 : /[,;:]/.test(ch) ? 3.4 : ch === '\n' ? 6 : 1);

/** Mode B: display-only, letter-by-letter reveal sharing the editor's ink engine. */
export function TypewriterDisplay({
  text, animateOnView = true, typingSpeed = 75, showCaret = true, seed = 42, paperTone = 'warm', inkColor = DEFAULT_INK.primary,
  fontSize = 24, inkVariation = 0.75, paperGrain = 0.35, characterImperfection = 0.6, font = 'special-elite', minLines = 3,
  startDelay = 350, sheet = true, onComplete, className = '',
}: TypewriterDisplayProps) {
  const reduced = usePrefersReducedMotion();
  const [wrap, width] = useElementWidth<HTMLDivElement>();
  const g = useTypewriterGeometry({ text, width, font, fontSize, minLines });
  const [started, setStarted] = useState(!animateOnView);
  const [count, setCount] = useState(0);
  const [fallback, setFallback] = useState(false);
  const done = useRef(onComplete);
  done.current = onComplete;
  const options: InkOptions = useMemo(() => ({ palette: makePalette(inkColor), inkVariation, characterImperfection, seed }), [inkColor, inkVariation, characterImperfection, seed]);

  useEffect(() => {
    if (!animateOnView || started) return undefined;
    const el = wrap.current;
    if (!el) { setStarted(true); return undefined; }
    const visible = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return rect.height > 0 && rect.top < vh * 0.82 && rect.bottom > vh * 0.12;
    };
    let observer: IntersectionObserver | undefined;
    // IntersectionObserver is the primary trigger; a light poll covers hosts where it never reports
    // (e.g. content inside a shadow root while the page is smooth-scrolled).
    const start = () => setStarted(true);
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) start(); }, { threshold: 0.3 });
      observer.observe(el);
    }
    const poll = window.setInterval(() => { if (visible()) start(); }, 400);
    return () => { observer?.disconnect(); window.clearInterval(poll); };
  }, [animateOnView, started, wrap]);

  useEffect(() => {
    if (!started || !g.ready) return undefined;
    if (reduced) { setCount(text.length); done.current?.(); return undefined; }
    let timer: ReturnType<typeof setTimeout>;
    let alive = true;
    const step = (i: number) => {
      if (!alive) return;
      if (i >= text.length) { done.current?.(); return; }
      const delay = typingSpeed * pauseFor(text[i - 1] ?? '') * (0.72 + Math.random() * 0.56);
      timer = setTimeout(() => { setCount(i + 1); step(i + 1); }, delay);
    };
    setCount(0);
    timer = setTimeout(() => step(0), startDelay);
    return () => { alive = false; clearTimeout(timer); };
  }, [started, g.ready, text, typingSpeed, startDelay, reduced]);

  const { metrics, layout, padX, padY, paperHeight } = g;
  const caret = metrics && indexToCell(layout, count);
  const finished = count >= text.length;

  return (
    <div className={`tw-display ${className}`} ref={wrap} style={{ ['--tw-ink' as string]: inkColor }}>
      <VintagePaper tone={paperTone} grain={paperGrain} seed={seed} sheet={sheet} style={{ height: paperHeight || 160 }}>
        {metrics && !fallback && (
          <TypewriterCanvas
            width={width} height={paperHeight} layout={layout} metrics={metrics} options={options}
            originX={padX} originY={padY} grain={paperGrain} visibleCount={count} onUnsupported={() => setFallback(true)}
          />
        )}
        {fallback && <p className="tw-fallback-text" style={{ fontFamily: FONT_STACKS[font], fontSize: g.fontSize, padding: `${padY}px ${padX}px` }}>{text}</p>}
        {showCaret && caret && !fallback && (
          <span
            className={`tw-caret is-live${finished ? ' is-idle' : ''}`}
            aria-hidden="true"
            style={{ left: padX + caret.col * metrics!.cellW, top: padY + caret.line * metrics!.lineH + metrics!.lineH * 0.12, height: metrics!.lineH * 0.76 }}
          />
        )}
      </VintagePaper>
      <p className="tw-sr-only">{text}</p>
    </div>
  );
}
