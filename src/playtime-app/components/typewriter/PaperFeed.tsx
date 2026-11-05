import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';

/** Shared timing. A carriage return should start at the same moment and use this same duration. */
export const PAPER_FEED_MS = 220;
const EASING = 'cubic-bezier(.22,.8,.26,1)';
/** Small rebound past rest, so the sheet seats instead of stopping dead. */
const SETTLE_PX = -1.2;
/** Band the caret should stay inside, clear of the fixed site header and the bottom edge. */
const FOLLOW_TOP = 160;
const FOLLOW_BOTTOM = 120;
/** After the user scrolls by hand, auto-follow stays quiet for a moment. */
const USER_SCROLL_HOLD_MS = 400;

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface PaperFeedHandle {
  /** Advance the paper by exactly one rendered line height in one 220ms move. */
  feedLine: () => void;
  /** Scroll the page only when the caret sits outside the comfortable band. */
  followCaret: () => void;
  isAnimating: () => boolean;
}

export interface PaperFeedProps {
  /** Rendered line pitch in CSS px (the feed distance). */
  lineHeight: number;
  /** The contained scroll region. When given, auto-follow scrolls it instead of the page. */
  scrollRef?: RefObject<HTMLElement | null>;
  /** The caret element. Used to decide whether the page must follow it. */
  caretRef?: RefObject<HTMLElement | null>;
  /** Optional curved-paper shading. Overlay only: text geometry and cursor mapping never change. */
  curved?: boolean;
  /** 0..1 strength of the curved shading. */
  curvature?: number;
  onFeedEnd?: () => void;
  className?: string;
  children?: ReactNode;
}

/**
 * Moves the writing layers (ink canvas, caret, textarea) vertically as one unit, like a platen feeding paper.
 * Transform-only: no top/left or layout animation, so the textarea's hit-testing and the printed text
 * always share one coordinate system. The machine rail lives outside this component and never moves.
 */
export const PaperFeed = forwardRef<PaperFeedHandle, PaperFeedProps>(function PaperFeed(
  { lineHeight, scrollRef, caretRef, curved = false, curvature = 0.5, onFeedEnd, className = '', children },
  ref,
) {
  const stage = useRef<HTMLDivElement>(null);
  const anim = useRef<Animation | null>(null);
  const lastUserScroll = useRef(0);
  const latest = useRef({ lineHeight, onFeedEnd });
  useLayoutEffect(() => { latest.current = { lineHeight, onFeedEnd }; });

  const followCaret = useCallback(() => {
    const caret = caretRef?.current;
    if (!caret || typeof window === 'undefined') return;
    // A feed in flight moves the caret; the feed's end calls this again, so wait for it.
    if (anim.current) return;
    if (performance.now() - lastUserScroll.current < USER_SCROLL_HOLD_MS) return;
    const box = scrollRef?.current;
    if (box) {
      const c = caret.getBoundingClientRect();
      const b = box.getBoundingClientRect();
      const top = c.top - b.top;
      const bottom = c.bottom - b.top;
      const band = 28;
      let delta = 0;
      if (bottom > box.clientHeight - band) delta = bottom - (box.clientHeight - band);
      else if (top < band) delta = top - band;
      if (Math.abs(delta) >= 1) box.scrollTo({ top: box.scrollTop + delta, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      return;
    }
    const vv = window.visualViewport;
    // Mobile keyboard open: the browser already keeps the native caret visible. Do not fight it.
    if (vv && vv.height < window.innerHeight * 0.8) return;
    const viewport = vv?.height ?? window.innerHeight;
    const r = caret.getBoundingClientRect();
    let delta = 0;
    if (r.bottom > viewport - FOLLOW_BOTTOM) delta = r.bottom - (viewport - FOLLOW_BOTTOM);
    else if (r.top < FOLLOW_TOP) delta = r.top - FOLLOW_TOP;
    if (Math.abs(delta) < 1) return;
    window.scrollBy({ top: delta, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [caretRef, scrollRef]);

  const feedLine = useCallback(() => {
    const el = stage.current;
    if (!el) return;
    const lh = latest.current.lineHeight;
    // A feed already in flight: continue from where the paper is, plus one more line, so rapid Enters never jump.
    let from = lh;
    if (anim.current) {
      const t = getComputedStyle(el).transform;
      const offset = t && t !== 'none' ? new DOMMatrixReadOnly(t).m42 : 0;
      from = Math.max(0, offset) + lh;
      anim.current.cancel();
      anim.current = null;
    }
    if (prefersReducedMotion() || !lh || typeof el.animate !== 'function') {
      el.style.transform = '';
      return;
    }
    el.style.willChange = 'transform';
    // Starts one line low (the new line is already laid out there) and rises into rest with a small settle.
    const a = el.animate(
      [
        { transform: `translate3d(0, ${from}px, 0)` },
        { transform: `translate3d(0, ${SETTLE_PX}px, 0)`, offset: 0.8 },
        { transform: 'translate3d(0, 0px, 0)' },
      ],
      { duration: PAPER_FEED_MS, easing: EASING },
    );
    anim.current = a;
    a.onfinish = () => {
      if (anim.current === a) anim.current = null;
      el.style.willChange = '';
      el.style.transform = '';
      latest.current.onFeedEnd?.();
      followCaret();
    };
  }, [followCaret]);

  useEffect(() => {
    const target: EventTarget = scrollRef?.current ?? window;
    const mark = () => { lastUserScroll.current = performance.now(); };
    target.addEventListener('wheel', mark, { passive: true });
    target.addEventListener('touchmove', mark, { passive: true });
    return () => {
      target.removeEventListener('wheel', mark);
      target.removeEventListener('touchmove', mark);
      anim.current?.cancel();
    };
  }, [scrollRef]);

  useImperativeHandle(ref, () => ({ feedLine, followCaret, isAnimating: () => anim.current !== null }), [feedLine, followCaret]);

  const strength = Math.min(1, Math.max(0, curvature));
  return (
    <div className={`pf-root ${className}`}>
      <div ref={stage} className="pf-stage">{children}</div>
      {curved && <div className="pf-curve" aria-hidden="true" style={{ ['--pf-curve' as string]: String(strength) }} />}
    </div>
  );
});
