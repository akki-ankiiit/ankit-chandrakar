import { useEffect, useRef } from 'react';
import { ThinkingOrb, scaleRadii } from 'thinking-orbs';
import { MODE_FRAMES, resolvePreset, paintFrame } from 'thinking-orbs/engine';
import { useCanvasMotion } from '../../agents/useCanvasMotion.js';
import { getOrbColour, hexToRgb } from '../../agents/orb-palette.js';

// The original 64px design, painted at the display's resolution instead of CSS-upscaling a small bitmap.
function PresenceOrb({ state, size, paused, speed }) {
  const canvas = useRef(null);
  useEffect(() => {
    const element = canvas.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    element.width = Math.round(size * dpr);
    element.height = Math.round(size * dpr);
    const context = element.getContext('2d');
    if (!context) return;
    const preset = resolvePreset(state, 64);
    const scale = size / 64;
    const opts = scaleRadii(preset.opts, 1 / Math.sqrt(scale) + 0.25);
    let frame;
    const draw = (time) => {
      context.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
      context.clearRect(0, 0, 64, 64);
      paintFrame(context, MODE_FRAMES[preset.mode](64, time, opts), false, hexToRgb(getOrbColour(state)));
    };
    const tick = (time) => {
      draw(time / 1000 * preset.speed * speed);
      frame = requestAnimationFrame(tick);
    };
    draw(0.6);
    if (!paused) frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [state, size, paused, speed]);
  return <canvas ref={canvas} aria-hidden="true" style={{ width: size, height: size }} />;
}

export function HelixOrb({ state, size = 64, motion = 'lively', paused = false }) {
  const { ref, animate } = useCanvasMotion(!paused && motion !== 'still', size > 64);
  const speed = motion === 'calm' ? 0.7 : 1;
  return <span ref={ref} className="agents-orb" role="img" aria-label={`Helix ${state}`} data-animating={animate} style={{ width: size, height: size }}>
    {size > 64 ? <PresenceOrb state={state} size={size} speed={speed} paused={!animate} /> :
      <ThinkingOrb state={state} size={size} speed={speed} theme="light" color={getOrbColour(state)} paused={!animate} aria-hidden="true" />}
  </span>;
}
