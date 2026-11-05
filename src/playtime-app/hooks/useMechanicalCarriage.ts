import { useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from 'react';
import { indexToCell } from '../lib/typewriter/caretPosition';
import type { TextLayout } from '../lib/typewriter/textLayout';
import { PAPER_FEED_MS } from '../components/typewriter/PaperFeed';

/** What the last text-changing input was. Set from native beforeinput; reset to 'nav' once consumed. */
export type InputAction = 'key' | 'enter' | 'erase' | 'paste' | 'composition' | 'nav';

/** Sounds the carriage asks for. Playback lives in useTypewriterAudio. */
export type CarriageSound = 'strike' | 'space' | 'return' | 'feed' | 'bell';

/** Character advance: a light spring that settles in roughly 70ms. */
const STEP_HZ = 10;
const STEP_DAMPING = 0.9;
/** The carriage return shares the paper-feed duration so both finish together. */
export const CARRIAGE_RETURN_MS = PAPER_FEED_MS;
/** Hammer strike length (also the CSS keyframe duration). */
export const HAMMER_MS = 48;

const clampN = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export interface CarriageGeometry {
  cellW: number;
  lineH: number;
  padX: number;
  railWidth: number;
  capsuleWidth: number;
}

/** Capsule left edge so its centre sits on the caret column, clamped to the rail. */
export function xForColumn(col: number, g: CarriageGeometry): number {
  const maxX = Math.max(0, g.railWidth - g.capsuleWidth);
  return clampN(g.padX + col * g.cellW - g.capsuleWidth / 2, 0, maxX);
}

export interface MechanicalCarriageOptions {
  enabled: boolean;
  text: string;
  caretIndex: number;
  layout: TextLayout;
  geometry: CarriageGeometry;
  reduced: boolean;
  actionRef: MutableRefObject<InputAction>;
  /** The single place a new line feeds the paper. */
  onLineFeed: () => void;
  /** Keep the caret in view after an arrow or pointer move. */
  onNavigate: () => void;
  /** Optional: one call per physical action (strike, carriage return + feed, bell). */
  onSound?: (kind: CarriageSound) => void;
}

export interface CarriageState {
  x: number;
  strikeId: number;
  striking: boolean;
  returning: boolean;
}

interface Motion {
  x: number;
  v: number;
  target: number;
  last: number;
  raf: number;
  ret: null | { start: number; from: number; to: number; after: number };
}

/** Frame loop for the carriage. Only writes state when the visible position changes. */
function createCarriage(publish: (x: number, returning: boolean) => void) {
  const m: Motion = { x: 0, v: 0, target: 0, last: 0, raf: 0, ret: null };
  let shown = Number.NaN;
  let shownRet = false;
  const emit = () => {
    const ret = m.ret !== null;
    if (Number.isNaN(shown) || Math.abs(m.x - shown) >= 0.05 || ret !== shownRet) {
      shown = m.x;
      shownRet = ret;
      publish(m.x, ret);
    }
  };
  const frame = (now: number) => {
    const dt = clampN((now - m.last) / 1000, 0, 1 / 30);
    m.last = now;
    let busy = false;
    if (m.ret) {
      const t = clampN((now - m.ret.start) / CARRIAGE_RETURN_MS, 0, 1);
      m.x = m.ret.from + (m.ret.to - m.ret.from) * easeOutCubic(t);
      busy = true;
      if (t >= 1) { m.target = m.ret.after; m.v = 0; m.ret = null; }
    }
    if (!m.ret) {
      // Sub-stepped so the spring stays stable even on slow frames (explicit integration diverges near 1/30s steps).
      const w = 2 * Math.PI * STEP_HZ;
      for (let left = dt; left > 0; left -= 1 / 240) {
        const h = Math.min(left, 1 / 240);
        m.v += (w * w * (m.target - m.x) - 2 * STEP_DAMPING * w * m.v) * h;
        m.x += m.v * h;
      }
      if (Math.abs(m.target - m.x) < 0.05 && Math.abs(m.v) < 0.5) { m.x = m.target; m.v = 0; }
      else busy = true;
    }
    emit();
    m.raf = busy ? requestAnimationFrame(frame) : 0;
  };
  const kick = () => {
    if (!m.raf) { m.last = performance.now(); m.raf = requestAnimationFrame(frame); }
  };
  return {
    jump(x: number) {
      cancelAnimationFrame(m.raf); m.raf = 0; m.ret = null;
      m.x = x; m.target = x; m.v = 0;
      emit();
    },
    glide(x: number) { m.ret = null; m.target = x; kick(); },
    returnThen(margin: number, after: number) {
      m.ret = { start: performance.now(), from: m.x, to: margin, after };
      kick();
    },
    dispose() { cancelAnimationFrame(m.raf); m.raf = 0; m.ret = null; },
  };
}

/**
 * Drives the capsule from the editor's real state. Each text or caret change is classified once:
 * - key: hammer strike, then a spring to the new column
 * - enter / automatic wrap: one paper feed plus a carriage return, started together
 * - erase, caret navigation: spring to the column, no strike, no feed
 * - paste, composition, resize, reduced motion: jump to the final column
 */
export function useMechanicalCarriage(o: MechanicalCarriageOptions): CarriageState {
  const [state, setState] = useState<CarriageState>({ x: 0, strikeId: 0, striking: false, returning: false });
  const [carriage] = useState(() => createCarriage((x, returning) => setState((s) => (
    Math.abs(s.x - x) < 0.05 && s.returning === returning ? s : { ...s, x, returning }
  ))));
  const callbacks = useRef({ onLineFeed: o.onLineFeed, onNavigate: o.onNavigate, onSound: o.onSound });
  const prev = useRef<{ line: number; col: number; text: string; geom: string } | null>(null);
  const hammerTimer = useRef(0);

  useLayoutEffect(() => { callbacks.current = { onLineFeed: o.onLineFeed, onNavigate: o.onNavigate, onSound: o.onSound }; });
  useEffect(() => () => { carriage.dispose(); window.clearTimeout(hammerTimer.current); }, [carriage]);

  const { enabled, text, caretIndex, layout, reduced, actionRef } = o;
  const { cellW, lineH, padX, railWidth, capsuleWidth } = o.geometry;

  useLayoutEffect(() => {
    if (!enabled) { prev.current = null; return; }
    const geo: CarriageGeometry = { cellW, lineH, padX, railWidth, capsuleWidth };
    const cell = indexToCell(layout, caretIndex);
    const target = xForColumn(cell.col, geo);
    const margin = xForColumn(0, geo);
    const action = actionRef.current;
    actionRef.current = 'nav';
    const before = prev.current;
    const geom = `${cellW}|${lineH}|${padX}|${railWidth}|${capsuleWidth}`;
    prev.current = { line: cell.line, col: cell.col, text, geom };
    if (!before || before.geom !== geom) { carriage.jump(target); return; }

    // A blocked edit (maxLength, rejected input) leaves the text unchanged: treat that as navigation.
    const kind: InputAction = before.text === text ? 'nav' : action;
    const newLine = kind === 'enter' || (kind === 'key' && cell.line > before.line);
    if (newLine) {
      // Carriage return and paper feed start together, with one feed call.
      callbacks.current.onSound?.('return');
      callbacks.current.onSound?.('feed');
      callbacks.current.onLineFeed();
    }
    if (kind === 'key') {
      callbacks.current.onSound?.(text[caretIndex - 1] === ' ' ? 'space' : 'strike');
      // End-of-line bell once, when the caret crosses into the last three columns.
      if (cell.line === before.line && before.col < layout.cols - 3 && cell.col >= layout.cols - 3) callbacks.current.onSound?.('bell');
    }
    if (kind === 'key' && !reduced) {
      setState((s) => ({ ...s, strikeId: s.strikeId + 1, striking: true }));
      window.clearTimeout(hammerTimer.current);
      hammerTimer.current = window.setTimeout(() => setState((s) => ({ ...s, striking: false })), HAMMER_MS);
    }
    if (reduced || kind === 'paste' || kind === 'composition') { carriage.jump(target); return; }
    if (newLine) { carriage.returnThen(margin, target); return; }
    if (kind === 'nav' && cell.line !== before.line) callbacks.current.onNavigate();
    carriage.glide(target);
  }, [enabled, text, caretIndex, layout, cellW, lineH, padX, railWidth, capsuleWidth, reduced, actionRef, carriage]);

  return state;
}
