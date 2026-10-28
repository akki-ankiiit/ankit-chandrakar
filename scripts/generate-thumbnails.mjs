import sharp from 'sharp';

const W = 1536;
const H = 1024;
const out = 'public/assets/thumbnails';
const INK = '#1f211c';
const PAPER = '#ece9df';
const CREAM = '#f3ecd9';
const TAN = '#e4d8b6';
const SAGE = '#b9d39c';
const GREEN = '#2f5a34';
const WHITE = '#fbfbf5';

const defs = `<defs>
<pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#b9bdab" stroke-width="1" opacity=".5"/></pattern>
<filter id="blur" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.12  0 0 0 0 0.1  0 0 0 -1.4 1"/></filter>
<radialGradient id="gold" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#f6d77a"/><stop offset=".6" stop-color="#c79a2e"/><stop offset="1" stop-color="#7a5a16"/></radialGradient>
<radialGradient id="planet" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#5b5d56"/><stop offset="1" stop-color="#1d1e1b"/></radialGradient>
</defs>`;

function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const base = () => `<rect width="${W}" height="${H}" fill="${PAPER}"/><rect width="${W}" height="${H}" fill="url(#grid)"/><rect width="${W}" height="${H}" filter="url(#grain)" opacity=".6"/>`;

const hand = (x, y, text, size = 34, { fill = INK, anchor = 'start', rot = 0 } = {}) =>
  `<text x="${x}" y="${y}" font-family="Bradley Hand" font-size="${size}" fill="${fill}" text-anchor="${anchor}" transform="rotate(${rot} ${x} ${y})">${esc(text)}</text>`;
const mono = (x, y, text, size = 15, { fill = INK, anchor = 'start', ls = 3 } = {}) =>
  `<text x="${x}" y="${y}" font-family="Courier" font-weight="700" font-size="${size}" letter-spacing="${ls}" fill="${fill}" text-anchor="${anchor}">${esc(text)}</text>`;
const disp = (x, y, text, size, { fill = INK, anchor = 'start', ls = 0, family = 'Arial Black' } = {}) =>
  `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" letter-spacing="${ls}" fill="${fill}" text-anchor="${anchor}">${text}</text>`;
const ui = (x, y, text, size = 22, { fill = INK, anchor = 'start', weight = 400 } = {}) =>
  `<text x="${x}" y="${y}" font-family="Helvetica Neue" font-weight="${weight}" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${esc(text)}</text>`;
const rr = (x, y, w, h, r, fill, stroke = null, sw = 3) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}/>`;
const circle = (cx, cy, r, fill, stroke = null, sw = 3) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}/>`;
const line = (x1, y1, x2, y2, color = INK, w = 3, extra = '') =>
  `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" fill="none" ${extra}/>`;
const arrow = (x1, y1, x2, y2, bend = 0.2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx = (x1 + x2) / 2 - dy * bend;
  const cy = (y1 + y2) / 2 + dx * bend;
  const a = Math.atan2(y2 - cy, x2 - cx);
  const head = [a + 0.45, a - 0.45].map((t) => `M${x2 - Math.cos(t) * 18} ${y2 - Math.sin(t) * 18}L${x2} ${y2}`).join('');
  return `<path d="M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}${head}" stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"/>`;
};
const underline = (x1, x2, y, color = SAGE) => `<path d="M${x1} ${y}Q${(x1 + x2) / 2} ${y + 10} ${x2} ${y + 2}" stroke="${color}" stroke-width="9" stroke-linecap="round" fill="none" opacity=".9"/>`;
const check = (x, y, on = true, { size = 24, color = INK } = {}) =>
  rr(x, y, size, size, 3, 'none', color, 2.5) +
  (on ? `<path d="M${x + 5} ${y + size / 2}l${size * 0.25} ${size * 0.25}l${size * 0.42} -${size * 0.54}" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : '');
const tape = (x, y, w, h, rot) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e9e3c9" opacity=".75" transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"/>`;
const globe = (cx, cy, r) => {
  let s = circle(cx, cy, r, 'none', INK, 2.5);
  [0.45, 0.8].forEach((k) => { s += `<ellipse cx="${cx}" cy="${cy}" rx="${r * k}" ry="${r}" fill="none" stroke="${INK}" stroke-width="2" opacity=".7"/>`; });
  [-0.5, 0, 0.5].forEach((k) => { s += `<ellipse cx="${cx}" cy="${cy + r * k}" rx="${r * Math.sqrt(1 - k * k)}" ry="${r * 0.12}" fill="none" stroke="${INK}" stroke-width="2" opacity=".7"/>`; });
  return s;
};
const plus = (x, y, s = 14) => `<path d="M${x - s} ${y}H${x + s}M${x} ${y - s}V${y + s}" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;

function paper(R, x, y, w, h, { fill = CREAM, rot = 0, jag = 5 } = {}, inner = '') {
  const pts = [];
  const edge = (x1, y1, x2, y2) => {
    const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 12));
    for (let i = 0; i < n; i++) {
      const t = i / n;
      pts.push([x1 + (x2 - x1) * t + (R() - 0.5) * jag * 2, y1 + (y2 - y1) * t + (R() - 0.5) * jag * 2]);
    }
  };
  edge(x, y, x + w, y);
  edge(x + w, y, x + w, y + h);
  edge(x + w, y + h, x, y + h);
  edge(x, y + h, x, y);
  const d = `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')}Z`;
  const cx = x + w / 2;
  const cy = y + h / 2;
  return `<g transform="rotate(${rot} ${cx} ${cy})"><path d="${d}" transform="translate(6 10)" fill="#000" opacity=".24" filter="url(#blur)"/><path d="${d}" fill="${fill}"/>${inner}</g>`;
}

function browser(x, y, w, h, { bg, bar, rot = 0 }, inner = '') {
  return `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"><rect x="${x + 8}" y="${y + 12}" width="${w}" height="${h}" rx="16" fill="#000" opacity=".22" filter="url(#blur)"/>${rr(x, y, w, h, 16, bg, INK, 3)}<path d="M${x} ${y + 16}a16 16 0 0 1 16-16h${w - 32}a16 16 0 0 1 16 16v26h-${w}Z" fill="${bar}"/>${circle(x + 24, y + 22, 6, '#e05d4f')}${circle(x + 44, y + 22, 6, '#e8c15a')}${circle(x + 64, y + 22, 6, '#79b775')}${inner}</g>`;
}

function robot(cx, cy) {
  return `<path d="M${cx} ${cy - 120}V${cy - 160}" stroke="${INK}" stroke-width="6"/>` +
    circle(cx, cy - 172, 16, SAGE, INK, 4) +
    rr(cx - 150, cy - 120, 300, 230, 62, '#f6f5ee', INK, 4) +
    rr(cx - 118, cy - 88, 236, 170, 40, '#1c1d1a') +
    `<path d="M${cx - 82} ${cy - 10}l28 -30l28 30M${cx + 26} ${cy - 10}l28 -30l28 30" fill="none" stroke="#9fe0a0" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>` +
    circle(cx - 150, cy, 36, SAGE, INK, 4) + circle(cx + 150, cy, 36, SAGE, INK, 4) +
    rr(cx - 96, cy + 110, 192, 130, 46, '#f6f5ee', INK, 4) + circle(cx, cy + 175, 20, SAGE, INK, 3);
}

function chat(x, y, w, text, kind) {
  const bot = kind === 'bot';
  return rr(x, y, w, 58, 16, bot ? SAGE : WHITE, INK, 2) +
    circle(x + 32, y + 29, 16, bot ? '#1c1d1a' : '#e4e2d8', INK, 2) +
    ui(x + 60, y + 36, text, bot ? 17 : 19);
}

function cryptoTax() {
  const R = rng(3);
  let s = base();
  s += mono(82, 92, 'FIELD NOTES / 03', 15) + mono(82, 118, 'FINTECH', 13);
  s += mono(1200, 92, 'CRYPTO TAXES', 14) + mono(1200, 116, 'COMPLIANCE', 14) + mono(1200, 140, 'A CLEARER YOU', 14);
  s += paper(R, 92, 150, 360, 250, { fill: SAGE, rot: -3 },
    hand(120, 232, 'Less tax friction.', 46) + hand(120, 290, 'More clarity.', 46) + underline(130, 330, 318, GREEN));
  s += hand(470, 160, 'Track.', 30, { rot: -4 }) + hand(478, 200, 'Calculate.', 30, { rot: -4 }) + hand(490, 240, 'File.', 30, { rot: -4 }) + hand(500, 280, 'Stress less.', 30, { rot: -4 });
  s += paper(R, 828, 96, 282, 298, { fill: '#1c1d1a', rot: 3, jag: 3 },
    '<ellipse cx="1020" cy="158" rx="66" ry="34" fill="none" stroke="#f3ecd9" stroke-width="3"/>' +
    mono(1020, 166, 'READY', 17, { fill: CREAM, anchor: 'middle', ls: 1 }) +
    '<path d="M866 330L928 270L958 292L1050 196" stroke="#6fbf6b" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M1030 196L1050 196L1048 216" stroke="#6fbf6b" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>');
  s += rr(560, 350, 470, 190, 22, '#262721', '#000', 2);
  s += line(590, 392, 1000, 392, '#55574d', 2, 'stroke-dasharray="6 8"') + circle(950, 448, 16, '#55574d');
  s += paper(R, 640, 110, 300, 340, { fill: WHITE, rot: -4 },
    [['Bitcoin', '+0.45 BTC', '#f7931a'], ['Ethereum', '+2.13 ETH', '#8c8c8c'], ['Solana', '+18.4 SOL', '#3d2c6b'], ['USDT', '+1,250.00', '#26a17b']]
      .map(([name, amount, color], i) =>
        circle(684, 180 + i * 56, 14, color, INK, 2) +
        mono(708, 186 + i * 56, name, 17, { ls: 0 }) +
        mono(912, 186 + i * 56, amount, 15, { anchor: 'end', ls: 0 }))
      .join(''));
  s += paper(R, 300, 600, 930, 130, { fill: '#e8dfc2', rot: -1, jag: 3 });
  s += `<text x="768" y="700" text-anchor="middle" font-family="Arial Black" font-size="136" letter-spacing="-2"><tspan fill="${INK}">Crypto</tspan><tspan fill="${GREEN}">Tax</tspan></text>`;
  s += mono(768, 775, 'YOUR CRYPTO, SIMPLER TAXES.', 22, { anchor: 'middle', ls: 4 }) + underline(440, 1090, 800, SAGE);
  s += paper(R, 60, 470, 280, 170, { fill: '#d9d8d2', rot: -4 },
    hand(90, 522, 'From transactions', 28) + hand(90, 560, 'to tax reports', 28) + hand(90, 598, '— effortlessly.', 28));
  s += paper(R, 1150, 240, 250, 210, { fill: '#f6f2e6', rot: 4 },
    hand(1180, 300, 'Same assets.', 34) + hand(1180, 344, 'Clearer', 34) + hand(1180, 388, 'Taxes.', 34) + underline(1180, 1300, 412, SAGE));
  s += paper(R, 220, 790, 340, 200, { fill: '#f4f1e6', rot: 1 },
    ['Multi-wallet support', 'Accurate tax calculation', 'Compliance ready', 'Peace of mind']
      .map((t, i) => check(246, 828 + i * 40, true) + hand(288, 850 + i * 40, t, 28))
      .join(''));
  s += hand(960, 860, 'Global', 40, { rot: -4 }) + hand(960, 905, 'Compliant', 40, { rot: -4 }) + hand(960, 950, 'Hassle-free', 40, { rot: -4 });
  s += circle(40, 950, 150, 'url(#gold)', INK, 3) + disp(40, 1010, 'B', 170, { anchor: 'middle', fill: '#5a4210' });
  s += paper(R, 1180, 700, 420, 320, { fill: '#202120', rot: 3 },
    mono(1220, 770, 'BUILT', 16, { fill: CREAM }) + mono(1220, 800, 'FOR A MORE', 16, { fill: CREAM }) +
    mono(1220, 830, 'OPEN FINANCIAL', 16, { fill: CREAM }) + mono(1220, 860, 'FUTURE', 16, { fill: CREAM }));
  return s;
}

function yesBot() {
  const R = rng(7);
  let s = base();
  s += mono(82, 92, 'FIELD NOTES / 02', 15) + mono(82, 118, 'AI PRODUCT DESIGN', 13);
  s += mono(1240, 92, 'IDEAS', 14) + mono(1240, 116, 'PRODUCTS', 14) + mono(1240, 140, 'PEOPLE', 14) + mono(1240, 164, 'A MORE HUMAN AI', 14);
  s += hand(90, 250, 'More Human', 46, { rot: -3 }) + hand(90, 300, 'Conversations.', 46, { rot: -3 }) + underline(120, 400, 322, SAGE);
  s += arrow(360, 300, 470, 360, 0.2);
  s += paper(R, 40, 400, 330, 260, { fill: SAGE, rot: -3 },
    ['Understand', 'Assist', 'Automate', 'Grow']
      .map((t, i) => check(90, 436 + i * 56, true, { size: 28 }) + hand(136, 462 + i * 56, t, 40))
      .join(''));
  s += robot(700, 300);
  s += line(410, 210, 455, 225, INK, 4) + line(420, 268, 462, 268, INK, 4);
  s += `<ellipse cx="940" cy="150" rx="112" ry="76" fill="${WHITE}" stroke="${INK}" stroke-width="3"/><path d="M900 215L858 252L934 222Z" fill="${WHITE}" stroke="${INK}" stroke-width="3"/>`;
  s += hand(940, 140, 'Hello', 34, { anchor: 'middle' }) + hand(940, 176, 'How can', 34, { anchor: 'middle' }) + hand(940, 210, 'I help?', 34, { anchor: 'middle' });
  s += chat(1030, 230, 350, 'Summarize this document', 'user');
  s += chat(1050, 300, 340, "Sure! Here's a quick summary...", 'bot');
  s += chat(1030, 370, 350, 'Create a marketing plan', 'user');
  s += chat(1050, 440, 340, "On it! Here's a detailed plan...", 'bot');
  s += `<text x="768" y="690" text-anchor="middle" font-family="Arial Black" font-size="168" letter-spacing="-3"><tspan fill="${INK}">YesBot</tspan><tspan fill="${GREEN}">.ai</tspan></text>`;
  s += hand(768, 752, 'A more human way to build with AI.', 42, { anchor: 'middle' }) + underline(560, 1000, 772, SAGE);
  s += `<ellipse cx="640" cy="835" rx="100" ry="38" fill="none" stroke="${INK}" stroke-width="3"/><ellipse cx="930" cy="835" rx="120" ry="38" fill="none" stroke="${INK}" stroke-width="3"/><ellipse cx="790" cy="935" rx="100" ry="46" fill="none" stroke="${INK}" stroke-width="3"/>`;
  s += mono(640, 841, 'IDEAS', 18, { anchor: 'middle', ls: 1 }) + mono(930, 841, 'AUTOMATION', 18, { anchor: 'middle', ls: 1 }) + mono(790, 931, 'REAL', 17, { anchor: 'middle', ls: 1 }) + mono(790, 956, 'IMPACT', 17, { anchor: 'middle', ls: 1 });
  s += arrow(745, 835, 805, 835, 0) + arrow(900, 870, 840, 912, 0.1) + arrow(738, 912, 682, 870, 0.1);
  s += hand(320, 820, 'Automate', 30, { rot: -6 }) + hand(330, 862, 'Accelerate', 30, { rot: -6 }) + hand(345, 904, 'Augment', 30, { rot: -6 }) + hand(360, 946, 'Together.', 30, { rot: -6 });
  s += globe(90, 880, 170).replace('fill="none"', 'fill="url(#planet)"');
  s += paper(R, 1200, 690, 290, 170, { fill: TAN, rot: 4 },
    hand(1230, 752, 'Built for', 40) + hand(1230, 806, 'curious minds.', 40) + underline(1240, 1450, 828, INK));
  s += mono(1215, 930, 'CONVERSATIONS', 15) + mono(1215, 956, 'THAT CREATE', 15) + mono(1215, 982, 'OPPORTUNITIES', 15);
  return s;
}

function websiteBlackspace() {
  const R = rng(21);
  let s = base();
  s += mono(82, 92, 'FIELD NOTES', 15) + mono(82, 118, 'WEBSITE', 13);
  s += paper(R, 110, 150, 320, 170, { fill: TAN, rot: -3 }, hand(140, 220, 'Web design', 40) + hand(140, 270, 'Selected work', 36) + underline(150, 360, 296, INK));
  s += browser(860, 120, 580, 340, { bg: '#15161a', bar: '#2a2b2f', rot: -2 },
    rr(900, 220, 380, 30, 6, CREAM) + rr(900, 262, 300, 30, 6, CREAM) + rr(900, 320, 170, 44, 22, CREAM) +
    rr(1180, 200, 110, 110, 10, '#3a3b40') + rr(1306, 200, 110, 110, 10, '#55575e') + rr(1180, 326, 236, 94, 10, '#3a3b40'));
  s += disp(110, 560, 'Blackspace', 118, { ls: -2 });
  s += paper(R, 1100, 700, 380, 260, { fill: '#202120', rot: 3 }, mono(1140, 780, 'WEBSITE DESIGN', 18, { fill: CREAM, ls: 2 }));
  s += tape(760, 118, 120, 38, 28) + plus(1420, 560, 14);
  return s;
}

function websiteAzure() {
  const R = rng(22);
  let s = base();
  s += mono(82, 92, 'FIELD NOTES', 15) + mono(82, 118, 'WEBSITE', 13);
  s += `<text x="110" y="500" font-family="Georgia" font-style="italic" font-size="190" fill="${INK}">Azure</text>`;
  s += mono(116, 580, 'INTERIORS', 28, { fill: '#4f7896', ls: 10 });
  s += browser(800, 120, 620, 380, { bg: '#f4f7f9', bar: '#dfe8ef', rot: 2 },
    `<path d="M1040 470V300A120 120 0 0 1 1280 300V470Z" fill="#9db9cf"/>` +
    rr(840, 220, 260, 26, 6, '#c6d4de') + rr(840, 260, 200, 26, 6, '#c6d4de') + rr(840, 310, 140, 40, 20, '#4f7896') +
    circle(856, 400, 16, '#9db9cf') + circle(896, 400, 16, '#d8c7b0') + circle(936, 400, 16, '#4f7896'));
  s += paper(R, 110, 760, 320, 160, { fill: '#e6e9ea', rot: -2 }, hand(140, 818, 'Website design', 40) + hand(140, 864, 'Selected work', 36));
  s += paper(R, 1120, 720, 360, 250, { fill: '#9db9cf', rot: 3 }, mono(1160, 800, 'WEBSITE DESIGN', 18, { ls: 2 }));
  s += tape(1050, 110, 120, 38, -20) + plus(560, 150, 14);
  return s;
}

function websiteAtlas() {
  const R = rng(23);
  let s = base();
  s += mono(82, 92, 'FIELD NOTES', 15) + mono(82, 118, 'WEBSITE', 13);
  s += hand(110, 190, 'Selected work', 44, { rot: -2 }) + underline(120, 420, 214, SAGE);
  let contours = '';
  [220, 170, 120, 70].forEach((rx, i) => { contours += `<ellipse cx="1240" cy="330" rx="${rx}" ry="${rx * 0.6}" fill="none" stroke="#b5651d" stroke-width="2.5" opacity="${0.4 + i * 0.15}"/>`; });
  s += browser(920, 110, 560, 360, { bg: '#efe6d2', bar: '#d8c9a8', rot: 0 },
    contours + rr(940, 220, 200, 24, 6, '#c9b48e') + rr(940, 258, 150, 24, 6, '#c9b48e') + circle(1400, 370, 26, WHITE, INK, 2.5) + line(1400, 340, 1400, 400, INK, 2));
  s += disp(110, 560, 'ATLAS', 200, { ls: 14 });
  s += paper(R, 110, 640, 300, 150, { fill: TAN, rot: -3 }, hand(140, 700, 'Website design', 40) + underline(150, 340, 730, INK));
  s += globe(560, 860, 110);
  s += paper(R, 1100, 690, 380, 270, { fill: '#b5651d', rot: 3 }, mono(1140, 770, 'WEBSITE DESIGN', 18, { fill: CREAM, ls: 2 }));
  return s;
}

function websiteGolfMill() {
  const R = rng(24);
  let s = base();
  s += mono(82, 92, 'FIELD NOTES', 15) + mono(82, 118, 'WEBSITE', 13);
  s += `<text x="110" y="470" font-family="Georgia" font-weight="700" font-size="128" fill="${INK}">The Golf</text>` +
    `<text x="110" y="610" font-family="Georgia" font-weight="700" font-size="170" fill="${GREEN}">Mill</text>`;
  s += browser(860, 120, 600, 380, { bg: '#f6f1e1', bar: '#d7e3c2', rot: 0 },
    '<path d="M860 470Q1000 300 1160 360T1460 300L1460 470Z" fill="#8fb27a"/>' +
    rr(900, 220, 300, 28, 6, '#d9d2b8') + rr(900, 300, 170, 44, 22, GREEN) +
    line(1300, 320, 1300, 430, INK, 3) + `<path d="M1300 320L1344 334L1300 348Z" fill="${GREEN}"/>` + circle(1240, 436, 9, WHITE, INK, 2));
  s += paper(R, 110, 700, 300, 150, { fill: '#e7ebd6', rot: -3 }, hand(140, 760, 'Website design', 40));
  s += paper(R, 1100, 700, 380, 260, { fill: GREEN, rot: 3 }, mono(1140, 780, 'WEBSITE DESIGN', 18, { fill: CREAM, ls: 2 }));
  s += tape(900, 110, 120, 38, -14) + plus(620, 160, 14);
  return s;
}

function designWedding() {
  const R = rng(31);
  let s = base();
  s += mono(82, 92, 'FIELD NOTES / 06', 15) + mono(82, 118, 'EVENTS · BRAND & EVENT DESIGN', 13);
  s += mono(1240, 92, 'INVITATIONS', 14) + mono(1240, 116, 'STATIONERY', 14) + mono(1240, 140, 'SIGNAGE', 14);
  s += paper(R, 90, 160, 330, 240, { fill: '#e9dcc4', rot: -3 },
    hand(120, 236, 'A celebration,', 42) + hand(120, 290, 'designed in detail.', 42) + underline(130, 380, 318, '#b99a5b'));
  s += paper(R, 560, 90, 380, 500, { fill: '#fbf7ec', rot: 2 },
    circle(750, 250, 74, 'none', '#8a6d2f', 3) + circle(750, 250, 62, 'none', '#8a6d2f', 1.5) +
    `<text x="750" y="268" text-anchor="middle" font-family="Georgia" font-style="italic" font-size="62" fill="#8a6d2f">J&amp;V</text>` +
    mono(750, 376, 'TOGETHER WITH THEIR FAMILIES', 13, { anchor: 'middle', ls: 3 }) +
    `<text x="750" y="446" text-anchor="middle" font-family="Georgia" font-size="40" fill="${INK}">Jamie &amp; Victoria</text>` +
    line(660, 482, 840, 482, '#8a6d2f', 2) + mono(750, 522, 'ARE GETTING MARRIED', 13, { anchor: 'middle', ls: 3 }));
  s += tape(700, 76, 120, 38, -6);
  s += paper(R, 960, 210, 270, 330, { fill: '#efe7d3', rot: -4 },
    mono(1095, 280, 'MENU', 20, { anchor: 'middle', ls: 8 }) + line(1020, 304, 1170, 304, '#8a6d2f', 2) +
    [0, 1, 2, 3].map((i) => line(1010, 350 + i * 44, 1180, 350 + i * 44, '#b9a98a', 6)).join(''));
  s += paper(R, 1180, 170, 280, 100, { fill: '#1c1d1a', rot: 3, jag: 3 }, mono(1320, 228, 'CONFIDENTIAL', 18, { fill: CREAM, anchor: 'middle', ls: 5 }));
  s += `<g transform="translate(1320 380) rotate(8)"><path d="M-34 -20a34 34 0 0 1 68 0v20h-68Z" fill="none" stroke="${INK}" stroke-width="7"/><path d="M0 100C-70 50-70 -10-30 -10C-10 -10 0 8 0 8C0 8 10 -10 30 -10C70 -10 70 50 0 100Z" fill="#c9a84c" stroke="${INK}" stroke-width="4"/><circle cx="0" cy="34" r="9" fill="${INK}"/><path d="M0 36V62" stroke="${INK}" stroke-width="7"/></g>`;
  s += paper(R, 140, 700, 1250, 150, { fill: '#e8dfc2', rot: -1, jag: 3 });
  s += `<text x="765" y="800" text-anchor="middle" font-family="Georgia" font-style="italic" font-size="76" fill="${INK}">The Wedding of Jamie &amp; Victoria</text>`;
  s += mono(765, 890, 'BESPOKE INVITATIONS · STATIONERY · SIGNAGE', 18, { anchor: 'middle', ls: 4 }) + underline(380, 1150, 908, '#d8c389');
  s += paper(R, 90, 440, 300, 210, { fill: '#f4efe0', rot: 3 },
    ['Custom monogram', 'Letterpress finishes', 'Venue signage'].map((t, i) => check(120, 482 + i * 50, true) + hand(160, 505 + i * 50, t, 30)).join(''));
  s += plus(1450, 620, 16) + plus(480, 640, 12);
  return s;
}

function designNuvei() {
  const R = rng(32);
  const BLUE = '#1b9bdc';
  const NAVY = '#2b2866';
  let s = base();
  s += mono(82, 92, 'FIELD NOTES / 07', 15) + mono(82, 118, 'DESIGN & MOTION', 13);
  s += paper(R, 80, 160, 380, 250, { fill: SAGE, rot: -3 },
    hand(110, 240, 'Every payment,', 46) + hand(110, 296, 'everywhere.', 46) + underline(120, 330, 326, GREEN));
  s += paper(R, 520, 90, 290, 480, { fill: '#e6e8e6', rot: -3 },
    rr(550, 120, 230, 420, 26, '#f6f6f2', INK, 3) + rr(570, 150, 190, 250, 12, WHITE, INK, 2) +
    `<text x="665" y="290" text-anchor="middle" font-family="Georgia" font-weight="700" font-size="40" fill="${NAVY}">nuvei</text>` +
    `<path d="M630 440h70M630 466h70M630 492h70" stroke="${INK}" stroke-width="3" opacity=".45"/>`);
  s += paper(R, 860, 110, 380, 270, { fill: NAVY, rot: 3 },
    `<text x="900" y="200" font-family="Georgia" font-size="40" fill="${WHITE}">PAX <tspan fill="#6fd0ff">A910s</tspan></text>` +
    mono(900, 240, 'QUICK REFERENCE GUIDE', 14, { fill: CREAM, ls: 2 }) +
    rr(900, 276, 130, 64, 10, BLUE) + circle(1170, 290, 50, 'none', CREAM, 3) + `<path d="M1150 290l14 14l28-30" stroke="${CREAM}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  s += paper(R, 1180, 400, 270, 160, { fill: WHITE, rot: -4 },
    rr(1206, 430, 74, 74, 6, INK) + rr(1214, 438, 22, 22, 2, WHITE) + rr(1250, 438, 22, 22, 2, WHITE) + rr(1214, 474, 22, 22, 2, WHITE) +
    hand(1296, 468, 'Scan for', 26) + hand(1296, 500, 'support', 26));
  s += paper(R, 100, 700, 1340, 140, { fill: '#e8dfc2', rot: -1, jag: 3 });
  s += `<text x="770" y="792" text-anchor="middle" font-family="Arial Black" font-size="84" letter-spacing="-2" fill="${INK}">Every payment<tspan fill="${BLUE}">,</tspan> everywhere</text>`;
  s += mono(770, 878, 'DESIGN SYSTEM · MARKETING COLLATERAL · MOTION', 18, { anchor: 'middle', ls: 4 }) + underline(300, 1240, 896, BLUE);
  s += paper(R, 90, 460, 330, 190, { fill: '#f4f1e6', rot: 2 },
    ['Onboarding collateral', '3D motion renders', 'Cohesive packaging'].map((t, i) => check(116, 500 + i * 46, true) + hand(156, 523 + i * 46, t, 30)).join(''));
  s += paper(R, 1000, 560, 440, 100, { fill: '#202120', rot: 2, jag: 3 }, mono(1220, 620, 'NUVEI · PRODUCT DESIGNER', 17, { fill: CREAM, anchor: 'middle', ls: 3 }));
  s += plus(470, 640, 14) + plus(1470, 700, 14);
  return s;
}

function designSystemNeostra() {
  const R = rng(41);
  let s = base();
  s += mono(82, 92, 'FIELD NOTES / 08', 15) + mono(82, 118, 'DESIGN SYSTEM', 13);
  s += mono(1240, 92, 'COMPONENTS', 14) + mono(1240, 116, 'PATTERNS', 14);
  s += disp(110, 300, 'Neostra', 120, { ls: -3 });
  s += hand(110, 370, 'Consistency, built into', 40, { rot: -2 }) + hand(110, 414, 'every interaction.', 40, { rot: -2 }) + underline(120, 400, 438, SAGE);
  s += paper(R, 90, 500, 330, 170, { fill: SAGE, rot: -3 }, hand(120, 560, '200+ reusable', 34) + hand(120, 606, 'components.', 34));
  s += paper(R, 800, 110, 640, 420, { fill: '#f6f2e6', rot: 2 },
    mono(840, 150, 'BUTTONS', 14) +
    rr(840, 168, 170, 50, 10, GREEN) + ui(925, 200, 'Save changes', 20, { fill: WHITE, anchor: 'middle', weight: 700 }) +
    rr(1030, 168, 150, 50, 10, 'none', INK, 2.5) + ui(1105, 200, 'Cancel', 20, { anchor: 'middle' }) +
    mono(840, 260, 'CONTROLS', 14) +
    rr(840, 276, 84, 40, 20, GREEN) + circle(904, 296, 16, WHITE) + ui(946, 302, 'Cookie consent', 22) +
    check(840, 336, true, { size: 26 }) + ui(880, 356, 'Preference center', 22) +
    mono(840, 400, 'INPUT', 14) +
    rr(840, 412, 320, 46, 8, WHITE, INK, 2) + ui(860, 442, 'name@company.com', 20, { fill: '#8a8c80' }) +
    rr(1190, 412, 170, 46, 23, SAGE) + ui(1275, 442, 'Compliant', 20, { anchor: 'middle', weight: 700 }));
  s += tape(1000, 92, 120, 38, -6);
  s += [INK, GREEN, SAGE, TAN, '#8a8c80'].map((color, i) => circle(860 + i * 80, 620, 26, color, INK, 2)).join('');
  s += mono(860, 672, 'TOKENS · TYPE · SPACING', 15, { ls: 3 });
  s += plus(1470, 640, 16);
  s += paper(R, 100, 760, 1340, 140, { fill: '#e8dfc2', rot: -1, jag: 3 });
  s += disp(770, 850, 'Privacy, without the complexity.', 56, { anchor: 'middle', ls: -1 });
  s += mono(770, 930, 'DESIGN SYSTEM · COMPONENTS · PATTERNS · DOCUMENTATION', 18, { anchor: 'middle', ls: 4 }) + underline(330, 1210, 948, GREEN);
  return s;
}

function designSystemGolfMill() {
  const R = rng(42);
  let s = base();
  s += mono(82, 92, 'FIELD NOTES / 09', 15) + mono(82, 118, 'DESIGN SYSTEM', 13);
  s += `<text x="110" y="470" font-family="Georgia" font-weight="700" font-size="128" fill="${INK}">The Golf</text>` +
    `<text x="110" y="610" font-family="Georgia" font-weight="700" font-size="170" fill="${GREEN}">Mill</text>`;
  s += browser(860, 120, 600, 380, { bg: '#f6f1e1', bar: '#d7e3c2', rot: 0 },
    `<text x="900" y="330" font-family="Georgia" font-weight="700" font-size="100" fill="${GREEN}">Aa</text>` +
    rr(1040, 230, 84, 84, 12, GREEN) + rr(1134, 230, 84, 84, 12, '#8fb27a') + rr(1228, 230, 84, 84, 12, '#e7ebd6') + rr(1322, 230, 84, 84, 12, '#d9d2b8') +
    rr(1040, 350, 170, 44, 22, GREEN) + ui(1125, 378, 'Book a tee time', 18, { fill: WHITE, anchor: 'middle', weight: 700 }) +
    rr(1230, 350, 150, 44, 22, 'none', INK, 2.5) + ui(1305, 378, 'Details', 18, { anchor: 'middle' }) +
    rr(900, 414, 520, 20, 6, '#d9d2b8') + rr(900, 448, 360, 20, 6, '#d9d2b8'));
  s += paper(R, 110, 700, 300, 150, { fill: '#e7ebd6', rot: -3 }, hand(140, 760, 'Design system', 40));
  s += paper(R, 1100, 700, 380, 260, { fill: GREEN, rot: 3 },
    mono(1140, 780, 'PALETTE · TYPE', 18, { fill: CREAM, ls: 2 }) + mono(1140, 820, 'COMPONENTS', 18, { fill: CREAM, ls: 2 }));
  s += tape(900, 110, 120, 38, -14) + plus(620, 160, 14);
  return s;
}

const scenes = {
  'case-study-cryptotax': cryptoTax,
  'case-study-yesbot': yesBot,
  'website-blackspace': websiteBlackspace,
  'website-azure-interiors': websiteAzure,
  'website-atlas': websiteAtlas,
  'website-the-golf-mill': websiteGolfMill,
  'design-wedding-jamie-victoria': designWedding,
  'design-nuvei-every-payment': designNuvei,
  'design-system-neostra': designSystemNeostra,
  'design-system-the-golf-mill': designSystemGolfMill,
};

for (const [name, build] of Object.entries(scenes)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}${build()}</svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 92 }).toFile(`${out}/${name}.webp`);
  console.log(`Created ${name}.webp`);
}
