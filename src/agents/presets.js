// Hero material and personality signatures retained from Helix agents/presets.ts.
const HERO = Object.freeze({ size: 112, shading: 'plastic', interactive: true, turn: 1, jumpEvery: 10 });
const FABRIC = Object.freeze({ ...HERO, shading: 'fabric' });
export function presetProps(material = 'plastic') {
  return material === 'fabric' ? FABRIC : HERO;
}
export const PERSONALITY = Object.freeze({
  lively: Object.freeze({ turn: 1, jumpEvery: 8, speed: 1.1 }),
  calm: Object.freeze({ turn: 0.5, jumpEvery: 0, speed: 0.9 }),
  still: Object.freeze({ turn: 0, jumpEvery: 0, speed: 1, paused: true }),
});
