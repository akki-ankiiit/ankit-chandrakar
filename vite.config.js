import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { bondureMeta } from './src/data/bondure-meta.js';
import { shinexMeta } from './src/data/shinex-meta.js';

const escape = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Writes dist/work/<project>/index.html for each case study: the built app shell with the page's own title and Open Graph tags.
// Link previews (WhatsApp, LinkedIn, X) do not run JavaScript, so the tags must be in the served HTML.
// The same files also let a direct visit to a case-study URL resolve on a static host.
function caseStudyStaticPages(metas) {
  return {
    name: 'case-study-static-pages',
    apply: 'build',
    async closeBundle() {
      const html = await readFile('dist/index.html', 'utf8');
      for (const meta of metas) {
        const image = `${meta.siteUrl}${meta.image}`;
        const tags = [
          ['property', 'og:url', `${meta.siteUrl}${meta.path}`],
          ['property', 'og:image', image],
          ['property', 'og:image:width', String(meta.imageWidth)],
          ['property', 'og:image:height', String(meta.imageHeight)],
          ['property', 'og:image:alt', meta.imageAlt],
          ['name', 'twitter:card', 'summary_large_image'],
          ['name', 'twitter:image', image],
        ].map(([attribute, name, content]) => `    <meta ${attribute}="${name}" content="${escape(content)}" />\n`).join('');
        const page = html
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(meta.title)}</title>`)
          .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escape(meta.description)}$2`)
          .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escape(meta.title)}$2`)
          .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escape(meta.description)}$2`)
          .replace('</head>', `${tags}  </head>`);
        await mkdir(`dist${meta.path}`, { recursive: true });
        await writeFile(`dist${meta.path}/index.html`, page);
      }
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), react(), caseStudyStaticPages([bondureMeta, shinexMeta])],
  resolve: { alias: { '@': fileURLToPath(new URL('./src/playtime-app', import.meta.url)) } },
});
