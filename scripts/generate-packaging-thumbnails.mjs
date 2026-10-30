import sharp from 'sharp';

// Card thumbnails for the "Packaging designs" folder. 1032×740 matches the website and design-system thumbnails
// (Atlas.png, Neo.png), so every folder's cards share one proportion.
const W = 1032;
const H = 740;
const out = 'public/assets/thumbnails';
const INK = '#1f211c';
const PAPER = '#ece9df';

const save = (image, name) => image.resize({ width: W, height: H, fit: 'cover' }).webp({ quality: 90 }).toFile(`${out}/${name}.webp`).then(() => console.log(`Created ${name}.webp`));

// K-Series uses public/assets/Kseries.png directly (see kSeriesCard in src/data/k-series.js).

// BONDURE: placeholder card until the project's own imagery is ready.
const bondure = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#b9bdab" stroke-width="1" opacity=".5"/></pattern></defs>
<rect width="${W}" height="${H}" fill="${PAPER}"/><rect width="${W}" height="${H}" fill="url(#grid)"/>
<text x="60" y="80" font-family="Courier" font-weight="700" font-size="15" letter-spacing="3" fill="${INK}">PACKAGING DESIGN</text>
<text x="${W / 2}" y="${H / 2 + 38}" font-family="Arial Black" font-size="128" letter-spacing="6" fill="${INK}" text-anchor="middle">BONDURE</text>
<path d="M${W / 2 - 280} ${H / 2 + 74}Q${W / 2} ${H / 2 + 86} ${W / 2 + 280} ${H / 2 + 72}" stroke="#b9d39c" stroke-width="9" stroke-linecap="round" fill="none"/>
<rect x="${W / 2 - 110}" y="${H / 2 + 130}" width="220" height="46" rx="23" fill="none" stroke="${INK}" stroke-width="2.5"/>
<text x="${W / 2}" y="${H / 2 + 160}" font-family="Courier" font-weight="700" font-size="16" letter-spacing="3" fill="${INK}" text-anchor="middle">COMING SOON</text>
<path d="M60 676h24M72 664v24M${W - 84} 676h24M${W - 72} 664v24" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;
await save(sharp(Buffer.from(bondure)), 'packaging-bondure');
