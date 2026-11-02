import fs from 'node:fs';
import crypto from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourcePath = new URL('../public/assets/ThanQ/ThanQ_Brand_Guidelines.html', import.meta.url);
const original = fs.readFileSync(sourcePath, 'utf8');
const slides = [...original.matchAll(/<section\b[\s\S]*?<\/section>/g)].map(([html]) => ({ id: html.match(/\bid="([^"]+)"/)[1], html }));
if (process.argv.includes('--verify')) {
  const { chromium } = await import('@playwright/test');
  const { default: sharp } = await import('sharp');
  const { createServer } = await import('vite');
  const output = fs.mkdtempSync(join(tmpdir(), 'thanq-verification-'));
  console.log(`Verification artifacts: ${output}`);
  let server;
  let browser;
  try {
  server = await createServer({
    configFile: false,
    root: fileURLToPath(new URL('..', import.meta.url)),
    cacheDir: join(output, 'vite-cache'),
    logLevel: 'error',
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { host: '127.0.0.1', port: 0, open: false, hmr: false, preTransformRequests: false },
  });
  // Vite treats configured port 0 as its default port. Bind the owned Node
  // HTTP server directly so the operating system really selects a free port.
  await new Promise((resolve, reject) => {
    server.httpServer.once('error', reject);
    server.httpServer.listen(0, '127.0.0.1', () => {
      server.httpServer.off('error', reject);
      resolve();
    });
  });
  const address = server.httpServer.address();
  const baseURL = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1200 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${baseURL}/assets/ThanQ/ThanQ_Brand_Guidelines.html`);
  await page.evaluate(() => document.fonts.ready);
  const report = await page.evaluate(async () => {
    const frames = [...document.querySelectorAll('.frame')];
    const layout = {};
    for (const id of ['hierarchy', 'uifound', 'anatomy']) {
      const slide = document.getElementById(id);
      const scale = Number(slide.style.getPropertyValue('--k'));
      const origin = slide.getBoundingClientRect();
      layout[id] = [...slide.querySelectorAll('div,h2')].filter(el => el.childElementCount === 0 && el.textContent.trim()).map(el => {
        const rect = el.getBoundingClientRect();
        const css = getComputedStyle(el);
        return { text: el.textContent.trim(), x: (rect.x - origin.x) / scale, y: (rect.y - origin.y) / scale, width: rect.width / scale, height: rect.height / scale, font: css.fontSize, leading: css.lineHeight };
      });
    }
    const defs = document.querySelector('body > svg').innerHTML;
    async function pixelTest(id, viewBox, point, body) {
      const draw = async show => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="${viewBox}">${defs}<defs><linearGradient id="test-bg"><stop stop-color="#00ff99"/><stop offset="1" stop-color="#9955ff"/></linearGradient></defs><rect x="0" y="0" width="500" height="500" fill="url(#test-bg)"/>${show ? `<use href="#${id}" x="${viewBox.split(' ')[0]}" y="${viewBox.split(' ')[1]}" width="${viewBox.split(' ')[2]}" height="${viewBox.split(' ')[3]}" style="--q:white;--t:black;--h:magenta"/>` : ''}</svg>`;
        const image = new Image();
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        await image.decode();
        const canvas = document.createElement('canvas'); canvas.width = 300; canvas.height = 300;
        const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
        return [point, body].map(([x, y]) => [...ctx.getImageData(x, y, 1, 1).data]);
      };
      const [painted, background] = await Promise.all([draw(true), draw(false)]);
      return { id, painted, background, transparentHeart: JSON.stringify(painted[0]) === JSON.stringify(background[0]), visibleBody: JSON.stringify(painted[1]) !== JSON.stringify(background[1]) };
    }
    const knockouts = await Promise.all([pixelTest('sym-q', '75 78 100 94.83', [142, 149], [40, 149]), pixelTest('sym-wm', '109.99 88.96 280 71.9', [260, 150], [228, 150])]);
    const suiteKnockouts = [];
    for (const [index, img] of [...document.images].entries()) {
      const svg = atob(img.src.split(',')[1]);
      const heart = index < 2 ? [352, 125] : index < 4 ? [124, 125] : [122, 125];
      const body = index < 2 ? [322, 125] : index < 4 ? [93, 125] : [80, 125];
      const tail = index < 2 ? [385, 154] : index < 4 ? [160, 155] : [170, 167];
      const pixels = async source => {
        const image = new Image(); image.src = `data:image/svg+xml;base64,${btoa(source)}`; await image.decode();
        const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
        return [heart, body, tail].map(([x, y]) => [...ctx.getImageData(x, y, 1, 1).data]);
      };
      const [painted, background] = await Promise.all([pixels(svg), pixels(svg.replace(/<path\b[^>]*mask="url\(#suite-\d-knockout\)"[^>]*\/>/, ''))]);
      suiteKnockouts.push({ index: index + 1, transparentHeart: JSON.stringify(painted[0]) === JSON.stringify(background[0]), visibleBody: JSON.stringify(painted[1]) !== JSON.stringify(background[1]), visibleTail: JSON.stringify(painted[2]) !== JSON.stringify(background[2]) });
    }
    const seamlessHearts = ['pat-hearts', 'pat-hearts-dark'].map(name => {
      const rule = [...document.styleSheets[0].cssRules].find(rule => rule.selectorText === `.${name}`);
      const svg = decodeURIComponent(rule.style.backgroundImage.match(/data:image\/svg\+xml,([\s\S]*)"\)$/)[1]);
      return { name, wrappedRows: [...svg.matchAll(/translate\(-27 (70|190)\)/g)].map(match => Number(match[1])) };
    });
    const gridRule = [...document.styleSheets[0].cssRules].find(rule => rule.selectorText === '.pat-qgrid');
    const gridSVG = decodeURIComponent(gridRule.style.backgroundImage.match(/data:image\/svg\+xml,([\s\S]*)"\)$/)[1]);
    const gridDocument = new DOMParser().parseFromString(gridSVG, 'image/svg+xml');
    const motifs = [...gridDocument.querySelectorAll('svg > g')];
    const qgridKnockouts = [];
    for (const background of ['cream', 'gradient']) {
      const svg = background === 'cream' ? gridSVG : gridSVG.replace('<rect ', '<defs><linearGradient id="qgrid-test-bg"><stop stop-color="#00ff99"/><stop offset="1" stop-color="#9955ff"/></linearGradient></defs><rect ').replace('fill="#FEF9F7"', 'fill="url(#qgrid-test-bg)"');
      const pixels = async source => {
        const image = new Image(); image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`; await image.decode();
        const canvas = document.createElement('canvas'); canvas.width = 240; canvas.height = 240;
        const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
        return motifs.map(group => {
          const [, tx, ty, scale] = group.getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\) scale\(([\d.]+)\)/).map(Number);
          return [[122, 125], [80, 125], [170, 167]].map(([x, y]) => [...ctx.getImageData(Math.round(tx + (x - 75) * scale), Math.round(ty + (y - 78) * scale), 1, 1).data]);
        });
      };
      const [painted, surface] = await Promise.all([pixels(svg), pixels(svg.replace(/<g\b[\s\S]*?<\/g>/g, ''))]);
      qgridKnockouts.push(...motifs.map((group, index) => ({ background, motif: index + 1, opacity: group.getAttribute('opacity'), transparentHeart: JSON.stringify(painted[index][0]) === JSON.stringify(surface[index][0]), visibleBody: JSON.stringify(painted[index][1]) !== JSON.stringify(surface[index][1]), visibleTail: JSON.stringify(painted[index][2]) !== JSON.stringify(surface[index][2]) })));
    }
    const calls = [];
    const scroll = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function(options) { calls.push({ id: this.id, behavior: options.behavior }); };
    const key = (target, init) => target.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true, ...init }));
    key(document.body, {});
    const normal = calls.splice(0);
    for (const modifier of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey']) key(document.body, { [modifier]: true });
    key(document.querySelector('.bar button'), {});
    key(document.querySelector('.bar a'), {});
    const input = document.createElement('input'); document.body.append(input); key(input, {}); input.remove();
    const editable = document.createElement('div'); editable.contentEditable = 'true'; document.body.append(editable); key(editable, {}); editable.remove();
    const prevented = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }); prevented.preventDefault(); document.body.dispatchEvent(prevented);
    const guarded = calls.splice(0);
    Element.prototype.scrollIntoView = scroll;
    return { headings: document.querySelectorAll('h1,h2').length, namedFrames: frames.every(f => document.getElementById(f.getAttribute('aria-labelledby'))), images: [...document.images].map(img => ({ alt: img.getAttribute('alt'), loaded: img.complete && img.naturalWidth > 0 })), unnamedDiagrams: document.querySelectorAll('#mark svg:not([aria-label]),#clearspace svg:not([aria-label])').length, layout, knockouts, suiteKnockouts, seamlessHearts, qgridKnockouts, keyboard: { normal, guarded } };
  });
  const selected = ['primary', 'anatomy', 'suite', 'backgrounds', 'hierarchy', 'patterns', 'patapps', 'uifound', 'closing'];
  const thumbnails = [];
  for (const id of selected) {
    const image = await page.locator(`#${id}`).screenshot({ path: `${output}/thanq-after-${id}.png` });
    thumbnails.push({ input: await sharp(image).resize(640, 360).png().toBuffer(), left: (thumbnails.length % 2) * 640, top: Math.floor(thumbnails.length / 2) * 360 });
  }
  await sharp({ create: { width: 1280, height: Math.ceil(selected.length / 2) * 360, channels: 3, background: '#eeeeee' } }).composite(thumbnails).png().toFile(`${output}/thanq-after-contact.png`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  report.mobile = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, bar: document.querySelector('.bar').getBoundingClientRect().height, navScrolls: document.querySelector('.bar nav').scrollWidth > document.querySelector('.bar nav').clientWidth, frameWidth: document.querySelector('.frame').getBoundingClientRect().width, scale: document.querySelector('.frame').style.getPropertyValue('--k') }));
  await page.screenshot({ path: `${output}/thanq-after-mobile.png` });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  report.keyboard.standardMotion = await page.evaluate(() => {
    const scroll = Element.prototype.scrollIntoView;
    const calls = [];
    Element.prototype.scrollIntoView = function(options) { calls.push(options.behavior); };
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true, cancelable: true }));
    Element.prototype.scrollIntoView = scroll;
    return calls;
  });
  report.errors = errors;
  report.artifactDirectory = output;
  report.baseURL = baseURL;
  fs.writeFileSync(`${output}/thanq-repair-verification.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ...report, layout: `Detailed bounds saved to ${output}/thanq-repair-verification.json` }, null, 2));
  if (errors.length || report.qgridKnockouts.length !== 8 || [...report.knockouts, ...report.suiteKnockouts, ...report.qgridKnockouts].some(test => !test.transparentHeart || !test.visibleBody || test.visibleTail === false) || report.seamlessHearts.some(test => JSON.stringify(test.wrappedRows) !== '[70,190]') || report.keyboard.guarded.length || report.keyboard.standardMotion[0] !== 'smooth' || report.headings !== 39 || report.mobile.document > report.mobile.viewport) process.exitCode = 1;
  } finally {
    try {
      await browser?.close();
    } finally {
      await server?.close();
    }
  }
  process.exit(process.exitCode ?? 0);
}
if (process.argv.includes('--inspect')) {
  console.log(slides.map(({ id }, i) => `${i + 1}: ${id}`).join('\n'));
  for (const id of process.argv.slice(3)) {
    if (id === 'embedded') {
      for (const [uri] of slides.find(slide => slide.id === 'suite').html.matchAll(/data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+/g)) console.log(Buffer.from(uri.split(',')[1], 'base64').toString().replace(/></g, '>\n<'));
      continue;
    }
    const html = slides.find(slide => slide.id === id)?.html ?? original.match(new RegExp(`<symbol id="${id}"[\\s\\S]*?</symbol>`))?.[0];
    console.log(html?.replace(/data:[^"\s)]+/g, value => `[embedded resource ${value.length} chars]`).replace(/></g, '>\n<'));
  }
  process.exit(0);
}

const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const resources = html => [...html.matchAll(/data:(?:font\/[^;,]+|image\/(?!svg\+xml)[^;,]+);base64,[A-Za-z0-9+/=]+/g)].map(([value]) => hash(value));
let result = original;

// Targeted repairs are applied below; embedded fonts and raster photographs are immutable.
function replaceExact(from, to, count = 1) {
  const found = result.split(from).length - 1;
  if (found !== count) throw new Error(`Expected ${count} occurrences, found ${found}: ${from.slice(0, 100)}`);
  result = result.replaceAll(from, to);
}
function repairSlide(id, repair) {
  const pattern = new RegExp(`<section\\b[^>]*\\bid="${id}"[\\s\\S]*?</section>`);
  if (!pattern.test(result)) throw new Error(`Missing slide ${id}`);
  result = result.replace(pattern, repair);
}
function knockout(id, heart, bounds) {
  const [x, y, width, height] = bounds;
  return `<mask id="${id}" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="${x}" y="${y}" width="${width}" height="${height}" style="mask-type:luminance"><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="white"/><path d="${heart}" fill="black"/></mask>`;
}
if (!original.includes('id="sym-q-knockout"')) {
replaceExact('color:color:#5C5650;', 'color:#5C5650;', 5);
replaceExact('color:font-size:23px;', 'font-size:23px;', 6);
for (const [id, bounds] of [['sym-q', [75, 78, 100, 94.83]], ['sym-wm', [318.803, 91.7782, 71.184, 67.5038]]]) {
  const pattern = new RegExp(`<symbol id="${id}"[\\s\\S]*?</symbol>`);
  const symbol = result.match(pattern)[0];
  const heart = symbol.match(/<path d="([^"]+)" style="fill:var\(--h,#fff\)"\/>/)[1];
  // The heart does not intersect the separate tail subpath in either master.
  const fixed = symbol.replace(/<path d="[^"]+" style="fill:var\(--h,#fff\)"\/>/, '')
    .replace('style="fill:var(--q,url(#gE))"', `style="fill:var(--q,url(#gE))" mask="url(#${id}-knockout)"`);
  result = result.replace(pattern, `${knockout(`${id}-knockout`, heart, bounds)}\n${fixed}`);
}

let suiteImages = 0;
repairSlide('suite', html => html.replace(/<img src="data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)"/g, (_, encoded) => {
  let svg = Buffer.from(encoded, 'base64').toString('utf8');
  const heart = svg.match(/<path id="stroke0_[^"]+" d="([^"]+)"/)[1];
  const isWordmark = suiteImages < 2;
  const isIcon = suiteImages === 2 || suiteImages === 3;
  const bounds = isWordmark ? [318.803, 91.7782, 71.184, 67.5038] : isIcon ? [88.4302, 89.4523, 75.4288, 71.5287] : [75, 78, 100, 94.83];
  const prefix = isWordmark ? 'M369.521' : isIcon ? 'M142.172' : 'M146.248';
  const maskId = `suite-${++suiteImages}-knockout`;
  svg = svg.replace(new RegExp(`(<path d="${prefix}[^>]+)(/>)`), `$1 mask="url(#${maskId})"$2`);
  // Only the heart's painted/filter group is removed. Tile shadows and backgrounds stay intact.
  svg = svg.replace(/<g filter="url\(#filter[01]_d_[^)]+\)">(?:(?!<\/g>)[\s\S])*?<use xlink:href="#stroke0_[\s\S]*?<\/g>/, '');
  if (/<use xlink:href="#stroke0_/.test(svg)) throw new Error('Painted suite heart remains');
  svg = svg.replace('<defs>', `<defs>${knockout(maskId, heart, bounds)}`);
  return `<img alt="" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"`;
}));
if (suiteImages !== 6) throw new Error('Expected six suite images');

for (const name of ['pat-hearts', 'pat-hearts-dark']) {
  const pattern = new RegExp(`(\\.${name}\\{background-image:url\\(")(data:image/svg\\+xml,)([^"\\n]+)`);
  result = result.replace(pattern, (_, start, mime, encoded) => {
    let svg = decodeURIComponent(encoded);
    const fragments = [...svg.matchAll(/<path\b[^>]*transform="translate\(133 (70|190)\)[^>]*\/>/g)];
    if (fragments.length !== 2) throw new Error('Expected two clipped hearts');
    svg = svg.replace('</svg>', fragments.map(([path]) => path.replace('translate(133 ', 'translate(-27 ')).join('') + '</svg>');
    return start + mime + encodeURIComponent(svg);
  });
}
repairSlide('backgrounds', html => html.replace('Charcoal on sand, 11.9:1', 'Charcoal on sand, 12.2:1'));

repairSlide('hierarchy', html => {
  const fonts = [['600 112px/1', '600 112.5px/114px'], ['600 84px/1.05', '600 84px/90px'], ['600 63px/1.1', '600 63px/72px'], ['600 48px/1.2', '600 48px/60px'], ['400 36px/1.45', '400 36px/54px'], ['400 27px/1.55', '400 27px/42px'], ['400 21px/1.4', '400 21px/30px']];
  for (const [from, to] of fonts) html = html.replace(`font:${from} `, `font:${to} `);
  return html.replaceAll('gap:44px;align-items:center', 'gap:32px;align-items:center')
    .replaceAll('width:300px;flex:none', 'width:260px;flex:none')
    .replaceAll('max-width:1000px', 'flex:1;min-width:0');
});
repairSlide('uifound', html => html
  .replaceAll('height:72px;padding:0 36px;border-radius:20px', 'height:84px;padding:0 36px;border-radius:24px')
  .replaceAll('font:700 26px', 'font:700 36px')
  .replace('width:260px;height:84px', 'width:300px;height:84px')
  .replaceAll('height:64px;padding:0 28px;border-radius:32px', 'height:72px;padding:0 36px;border-radius:36px')
  .replaceAll('font:400 24px', 'font:400 30px')
  .replaceAll('width:950px;', 'width:920px;')
  .replace('top:510px;width:920px;', 'top:510px;width:920px;display:flex;align-items:center;gap:24px;')
  .replace('top:598px;', 'top:612px;')
  .replace('top:660px;width:920px;', 'top:672px;width:920px;display:flex;align-items:center;gap:24px;')
  .replace('top:770px;width:920px;', 'top:792px;width:920px;display:flex;align-items:center;gap:24px;')
  .replace('top:860px;', 'top:888px;')
  .replace(/(?:&nbsp;)+(?=<)/g, '')
);

repairSlide('anatomy', html => html
  .replace('left:1383.0099999999998px;top:200px;width:520px;', 'left:1383.01px;top:200px;width:416px;')
  .replace('left:860.6099999999999px;top:743.1542857142857px;width:600px;', 'left:1260px;top:743.1542857142857px;width:540px;')
  .replace('left:420px;top:737.3285714285714px;width:765.4885714285714px;', 'left:420px;top:743.1542857142857px;width:700px;')
  .replaceAll('text-align:right', 'text-align:left')
);
repairSlide('story', html => html.replace('</div></div></div></section>', '</div><div style="background:#FEF9F7;padding:4px 12px;border-radius:8px">Brand&nbsp;&nbsp;&nbsp;03 / 39</div></div></div></section>'));

// Every slide receives one principal heading; existing adapter classes and type styles remain.
repairSlide('typefaces', html => html.replace('<div class="s">', '<div class="s"><div class="h1s" style="position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap">Typefaces</div>')
  .replace(/<div class="h2"([^>]*)>(Josefin Sans|Lato)<\/div>/g, '<h3 class="h2"$1>$2</h3>'));
result = result.replace(/<section\b[\s\S]*?<\/section>/g, html => {
  const id = html.match(/\bid="([^"]+)"/)[1];
  const tag = id === 'cover' ? 'h1' : 'h2';
  const headingId = `${id}-title`;
  let replaced = false;
  if (!/<div class="(?:h1|h1s|display)"/.test(html)) html = html.replace('class="h2"', 'class="h2 h1s"');
  html = html.replace(/<div class="(h1|h1s|display|h2 h1s)"([^>]*)>([\s\S]*?)<\/div>/, (_, cls, attrs, text) => {
    replaced = true;
    return `<${tag} id="${headingId}" class="${cls}"${attrs}>${text}</${tag}>`;
  });
  if (!replaced) throw new Error(`No principal heading for ${id}`);
  return html.replace(`aria-label="${id}"`, `aria-labelledby="${headingId}"`);
});
repairSlide('mark', html => html.replace('<svg width="880"', '<svg role="img" aria-label="Symbol construction: circular disc, heart cut-out and speech-bubble tail" width="880"'));
repairSlide('clearspace', html => html
  .replace('<svg width="860"', '<svg role="img" aria-label="Wordmark clear space: a heart-width margin on all four sides" width="860"')
  .replace('<svg width="400"', '<svg role="img" aria-label="Symbol clear space: a heart-width margin on all four sides" width="400"'));

replaceExact('@media (prefers-reduced-motion:reduce)', '@media (max-width:900px){\n  .bar{display:grid;grid-template-columns:1fr auto;gap:8px 16px;padding:8px 3vw}\n  .bar nav{grid-column:1/-1;grid-row:2;width:100%;min-width:0;flex-wrap:nowrap;overflow-x:auto;margin-left:0;overscroll-behavior-x:contain}\n  .bar nav a{flex:none;white-space:nowrap}\n  .bar button{grid-column:2;grid-row:1}\n  .frame{scroll-margin-top:112px}\n}\n@media (prefers-reduced-motion:reduce)');
replaceExact("  var k=e.key,i=cur();", "  if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;\n  if(e.target instanceof Element&&(e.target.closest('input,textarea,select,button,a,summary,[role=\"button\"],[role=\"link\"],[role=\"textbox\"],[role=\"slider\"],[role=\"combobox\"],[role=\"listbox\"],[role=\"menu\"],[role=\"tablist\"],[contenteditable]:not([contenteditable=\"false\"])')||e.target.isContentEditable))return;\n  var k=e.key,i=cur(),motion=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';");
replaceExact("scrollIntoView({behavior:'smooth'})", 'scrollIntoView({behavior:motion})', 2);

const slideIds = html => [...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(match => match[1]);
if (JSON.stringify(slideIds(result)) !== JSON.stringify(slides.map(slide => slide.id))) throw new Error('Slide IDs/order changed');
if ([...result.matchAll(/<h[12]\b/g)].length !== 39) throw new Error('Expected 39 principal headings');
}

// Keep the tail leader above its annotation, rather than running through the copy.
repairSlide('anatomy', html => html.replace('left:1484.61px;top:623.1542857142857px;width:2px;height:190px;', 'left:1484.61px;top:623.1542857142857px;width:2px;height:90px;'));
repairSlide('uifound', html => html.replace('<div>Digital37 / 39</div>', '<div>Digital&nbsp;&nbsp;&nbsp;37 / 39</div>'));

// Each Q is masked at full strength before its motif's opacity is composited.
// This incremental repair also runs on sources repaired by earlier script versions.
const gridPattern = /(\.pat-qgrid\{background-image:url\(")(data:image\/svg\+xml,)([^"\n]+)/;
if (!gridPattern.test(result)) throw new Error('Missing Q-grid tile');
result = result.replace(gridPattern, (uri, start, mime, encoded) => {
  let svg = decodeURIComponent(encoded);
  const maskId = 'qgrid-heart-knockout';
  if (svg.includes(`id="${maskId}"`)) return uri;
  let motifs = 0;
  let heart;
  svg = svg.replace(/<g\b([^>]*)>([\s\S]*?)<\/g>/g, (_, attributes, paths) => {
    const parts = [...paths.matchAll(/<path\b[^>]*\/>/g)];
    if (parts.length !== 2 || !parts[0][0].includes('d="M146.248') || !parts[1][0].includes('d="M150.87')) throw new Error('Unexpected Q-grid geometry');
    const nextHeart = parts[1][0].match(/\bd="([^"]+)"/)[1];
    if (heart && nextHeart !== heart) throw new Error('Inconsistent Q-grid heart geometry');
    heart = nextHeart;
    motifs++;
    return `<g${attributes.replace('fill-opacity=', 'opacity=')}>${parts[0][0].replace('/>', ` mask="url(#${maskId})"/>`)}</g>`;
  });
  if (!motifs) throw new Error('No Q-grid motifs found');
  svg = svg.replace('</svg>', `<defs>${knockout(maskId, heart, [75, 78, 100, 94.83])}</defs></svg>`);
  return start + mime + encodeURIComponent(svg);
});

if (JSON.stringify(resources(original)) !== JSON.stringify(resources(result))) throw new Error('Font/photo resources changed');
if (JSON.stringify([...result.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(match => match[1])) !== JSON.stringify(slides.map(slide => slide.id))) throw new Error('Slide IDs/order changed');
fs.writeFileSync(sourcePath, result);
console.log(JSON.stringify({ sourceBefore: hash(original), sourceAfter: hash(result), resourceManifest: hash(JSON.stringify(resources(result))), preservedResources: resources(result) }, null, 2));
