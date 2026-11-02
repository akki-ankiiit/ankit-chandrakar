// One colour per gesture, shared by the full-size engine and package badges.
export const ORB_PALETTE = Object.freeze({
  working: '#60784b',
  searching: '#71805a',
  solving: '#526c42',
  listening: '#4d786b',
  connecting: '#617b68',
  weaving: '#6f8350',
  composing: '#5b7551',
  breathing: '#7d8d67',
  shaping: '#526c52',
});

export function getOrbColour(state) {
  return ORB_PALETTE[state] || ORB_PALETTE.working;
}

export function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}
