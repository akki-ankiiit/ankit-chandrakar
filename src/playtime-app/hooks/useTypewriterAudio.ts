import { useCallback, useEffect, useRef, useState } from 'react';
import { mulberry32 } from '../lib/typewriter/seededRandom';

/**
 * Typewriter sound. Every sample is synthesised here from oscillators and filtered noise, once per session.
 * No recordings are shipped, so there are no third-party licences to track.
 */
export type SoundKind = 'strike' | 'space' | 'return' | 'feed' | 'bell';

export interface AudioSettings {
  enabled: boolean;
  volume: number;
  bell: boolean;
}

const STORAGE_KEY = 'typewriter-audio';
const DEFAULTS: AudioSettings = { enabled: false, volume: 0.6, bell: false };
/** Upper bound on overlapping voices. Older voices fade out early instead of queueing. */
const MAX_VOICES = 8;
const VARIANTS: Record<SoundKind, number> = { strike: 6, space: 3, return: 2, feed: 3, bell: 1 };
const BASE_GAIN: Record<SoundKind, number> = { strike: 0.9, space: 0.7, return: 0.65, feed: 0.5, bell: 0.55 };
/** Playback-rate jitter (fraction). Restrained so nothing sounds cartoonish. */
const RATE_JITTER: Record<SoundKind, number> = { strike: 0.03, space: 0.02, return: 0.02, feed: 0.02, bell: 0 };

function loadSettings(): AudioSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      enabled: Boolean(parsed.enabled),
      volume: typeof parsed.volume === 'number' ? Math.min(1, Math.max(0, parsed.volume)) : DEFAULTS.volume,
      bell: Boolean(parsed.bell),
    };
  } catch {
    return DEFAULTS;
  }
}

function saveSettings(s: AudioSettings) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* private mode: ignore */ }
}

/* ---------- synthesis (runs once per AudioContext) ---------- */

type Rnd = () => number;

function noise(n: number, rnd: Rnd): Float32Array {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) out[i] = rnd() * 2 - 1;
  return out;
}

/** RBJ biquad, in place. */
function biquad(data: Float32Array, type: 'bp' | 'lp', freq: number, q: number, sr: number) {
  const w = (2 * Math.PI * freq) / sr;
  const cos = Math.cos(w);
  const alpha = Math.sin(w) / (2 * q);
  const a0 = 1 + alpha;
  const a1 = -2 * cos / a0;
  const a2 = (1 - alpha) / a0;
  const b0 = (type === 'bp' ? alpha : (1 - cos) / 2) / a0;
  const b1 = (type === 'bp' ? 0 : 1 - cos) / a0;
  const b2 = (type === 'bp' ? -alpha : (1 - cos) / 2) / a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < data.length; i += 1) {
    const x = data[i];
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    data[i] = y;
  }
}

function normalize(data: Float32Array, peak: number) {
  let max = 0;
  for (let i = 0; i < data.length; i += 1) max = Math.max(max, Math.abs(data[i]));
  if (max <= 0) return;
  const k = peak / max;
  for (let i = 0; i < data.length; i += 1) data[i] *= k;
}

function strikeSample(sr: number, v: number, rnd: Rnd): Float32Array {
  const n = Math.round(0.07 * sr);
  const d = noise(n, rnd);
  biquad(d, 'bp', 1800 + v * 230, 1.1, sr);
  for (let i = 0; i < n; i += 1) {
    const t = i / sr;
    d[i] = d[i] * Math.exp(-t / 0.008)
      + 0.6 * Math.sin(2 * Math.PI * (1450 + v * 190) * t) * Math.exp(-t / 0.018)
      + 0.9 * Math.sin(2 * Math.PI * 150 * t) * Math.exp(-t / 0.011);
  }
  normalize(d, 0.85);
  return d;
}

function spaceSample(sr: number, v: number, rnd: Rnd): Float32Array {
  const n = Math.round(0.1 * sr);
  const d = noise(n, rnd);
  biquad(d, 'bp', 850 + v * 60, 0.9, sr);
  for (let i = 0; i < n; i += 1) {
    const t = i / sr;
    d[i] = d[i] * 0.45 * Math.exp(-t / 0.02) + 0.85 * Math.sin(2 * Math.PI * (92 + v * 5) * t) * Math.exp(-t / 0.035);
  }
  normalize(d, 0.7);
  return d;
}

function returnSample(sr: number, _v: number, rnd: Rnd): Float32Array {
  const dur = 0.45;
  const n = Math.round(dur * sr);
  const hiss = noise(n, rnd);
  biquad(hiss, 'lp', 900, 0.7, sr);
  const d = new Float32Array(n);
  const clickAt = 0.36;
  for (let i = 0; i < n; i += 1) {
    const t = i / sr;
    const u = t / dur;
    const s = Math.sin(Math.PI * u);
    d[i] = 0.35 * Math.sin(2 * Math.PI * (80 + 40 * u) * t) * s * s + hiss[i] * 0.25 * s * s;
    if (t >= clickAt) d[i] += 0.5 * Math.sin(2 * Math.PI * 2300 * (t - clickAt)) * Math.exp(-(t - clickAt) / 0.008);
  }
  normalize(d, 0.7);
  return d;
}

function feedSample(sr: number, v: number, rnd: Rnd): Float32Array {
  const dur = 0.26;
  const n = Math.round(dur * sr);
  const roll = noise(n, rnd);
  biquad(roll, 'lp', 1100 + v * 220, 0.7, sr);
  const d = new Float32Array(n);
  const ticks = [0.05, 0.14];
  for (let i = 0; i < n; i += 1) {
    const t = i / sr;
    const s = Math.sin(Math.PI * (t / dur));
    d[i] = roll[i] * 0.5 * Math.pow(Math.max(0, s), 1.5);
    for (const t0 of ticks) if (t >= t0) d[i] += 0.15 * Math.sin(2 * Math.PI * 2800 * (t - t0)) * Math.exp(-(t - t0) / 0.004);
  }
  normalize(d, 0.5);
  return d;
}

function bellSample(sr: number): Float32Array {
  const n = Math.round(1.8 * sr);
  const d = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / sr;
    d[i] = 0.5 * Math.sin(2 * Math.PI * 2093 * t) * Math.exp(-2.1 * t)
      + 0.15 * Math.sin(2 * Math.PI * 4186 * t) * Math.exp(-3.2 * t)
      + 0.06 * Math.sin(2 * Math.PI * 3136 * t) * Math.exp(-2.6 * t);
  }
  normalize(d, 0.45);
  return d;
}

function buildBuffers(ctx: AudioContext): Map<SoundKind, AudioBuffer[]> {
  const sr = ctx.sampleRate;
  const rnd = mulberry32(0x5eed);
  const make = (data: Float32Array) => {
    const buf = ctx.createBuffer(1, data.length, sr);
    buf.copyToChannel(new Float32Array(data), 0);
    return buf;
  };
  const out = new Map<SoundKind, AudioBuffer[]>();
  out.set('strike', Array.from({ length: VARIANTS.strike }, (_, v) => make(strikeSample(sr, v, rnd))));
  out.set('space', Array.from({ length: VARIANTS.space }, (_, v) => make(spaceSample(sr, v, rnd))));
  out.set('return', Array.from({ length: VARIANTS.return }, (_, v) => make(returnSample(sr, v, rnd))));
  out.set('feed', Array.from({ length: VARIANTS.feed }, (_, v) => make(feedSample(sr, v, rnd))));
  out.set('bell', [make(bellSample(sr))]);
  return out;
}

/* ---------- engine ---------- */

class TypewriterAudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers: Map<SoundKind, AudioBuffer[]> | null = null;
  private voices: { source: AudioBufferSourceNode; gain: GainNode }[] = [];
  private last = new Map<SoundKind, number>();
  private rnd = mulberry32(0xc0ffee);
  private enabled = false;
  private volume = DEFAULTS.volume;
  private bell = false;

  constructor() {
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  configure(s: AudioSettings) {
    this.enabled = s.enabled;
    this.volume = s.volume;
    this.bell = s.bell;
    if (this.master) this.master.gain.setTargetAtTime(this.level(), this.ctx!.currentTime, 0.02);
    if (!s.enabled) this.stopAll();
  }

  /** Must run inside a user gesture (click or key) for iOS and Safari to allow audio. */
  unlock() {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!this.ctx) {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.level();
      this.master.connect(this.ctx.destination);
      this.buffers = buildBuffers(this.ctx);
    }
    if (this.enabled && this.ctx.state === 'suspended' && !document.hidden) void this.ctx.resume();
  }

  play(kind: SoundKind) {
    if (!this.enabled) return;
    if (kind === 'bell' && !this.bell) return;
    if (!this.ctx) this.unlock();
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.buffers) return;
    // A context that is still resuming after the enabling click queues its sources; they start as soon as
    // it runs. Nothing is queued while the tab is hidden (the context is suspended on purpose then).
    if (ctx.state === 'closed' || (ctx.state === 'suspended' && document.hidden)) return;
    const list = this.buffers.get(kind);
    if (!list || list.length === 0) return;
    // Pick a random variant, never the same one twice in a row.
    let idx = Math.floor(this.rnd() * list.length);
    if (list.length > 1 && idx === this.last.get(kind)) idx = (idx + 1) % list.length;
    this.last.set(kind, idx);

    if (this.voices.length >= MAX_VOICES) this.retire(this.voices.shift()!);
    const source = ctx.createBufferSource();
    source.buffer = list[idx];
    source.playbackRate.value = 1 + (this.rnd() * 2 - 1) * RATE_JITTER[kind];
    const gain = ctx.createGain();
    gain.gain.value = BASE_GAIN[kind] * (0.94 + 0.12 * this.rnd());
    source.connect(gain).connect(this.master);
    const voice = { source, gain };
    this.voices.push(voice);
    source.onended = () => {
      this.voices = this.voices.filter((v) => v !== voice);
      gain.disconnect();
    };
    source.start();
  }

  dispose() {
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.stopAll();
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.buffers = null;
  }

  private level() {
    return Math.pow(this.volume, 1.6) * 0.9;
  }

  private retire(v: { source: AudioBufferSourceNode; gain: GainNode }) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    v.gain.gain.cancelScheduledValues(now);
    v.gain.gain.setValueAtTime(v.gain.gain.value, now);
    v.gain.gain.linearRampToValueAtTime(0, now + 0.01);
    try { v.source.stop(now + 0.012); } catch { /* already stopped */ }
  }

  private stopAll() {
    while (this.voices.length) this.retire(this.voices.shift()!);
  }

  /** Background tabs: suspend so nothing plays unseen, then resume when visible again. */
  private onVisibility = () => {
    if (!this.ctx) return;
    if (document.hidden) void this.ctx.suspend();
    else if (this.enabled) void this.ctx.resume();
  };
}

/** Sound settings and playback. Muted by default; audio starts only after the visitor enables it. */
export function useTypewriterAudio() {
  const [settings, setSettings] = useState<AudioSettings>(loadSettings);
  const engine = useRef<TypewriterAudioEngine | null>(null);

  useEffect(() => {
    const e = new TypewriterAudioEngine();
    engine.current = e;
    e.configure(settings);
    return () => { e.dispose(); engine.current = null; };
    // Created once; later settings changes are pushed in by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engine.current?.configure(settings);
    saveSettings(settings);
  }, [settings]);

  const update = useCallback((patch: Partial<AudioSettings>) => setSettings((s) => ({ ...s, ...patch })), []);

  /** Call from a click handler so the browser accepts the audio unlock. */
  const setEnabled = useCallback((enabled: boolean) => {
    if (enabled) {
      engine.current?.configure({ enabled: true, volume: settingsRef.current.volume, bell: settingsRef.current.bell });
      engine.current?.unlock();
    }
    update({ enabled });
  }, [update]);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const play = useCallback((kind: SoundKind) => engine.current?.play(kind), []);

  return {
    settings,
    setEnabled,
    setVolume: (volume: number) => update({ volume }),
    setBell: (bell: boolean) => update({ bell }),
    play,
  };
}
