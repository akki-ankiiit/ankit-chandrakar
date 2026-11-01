import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { bondureMeta } from './src/data/bondure-meta.js';
import { neostraMeta } from './src/data/neostra-meta.js';
import { shinexMeta } from './src/data/shinex-meta.js';
import { pageMetaTags } from './src/hooks/pageMetaTags.js';

const escape = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function setMeta(html, name, content) {
  const attribute = name.startsWith('og:') ? 'property' : 'name';
  const tag = content == null ? '' : `<meta ${attribute}="${name}" content="${escape(content)}" />`;
  let found = false;
  const page = html.replace(/<meta\b[^>]*>/gi, (existing) => {
    if (!new RegExp(`\\b${attribute}\\s*=\\s*(["'])${name}\\1`, 'i').test(existing)) return existing;
    const replacement = found ? '' : tag;
    found = true;
    return replacement;
  });
  return found || !tag ? page : page.replace('</head>', `  ${tag}\n  </head>`);
}

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
        let page = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escape(meta.title)}</title>`);
        for (const [name, content] of pageMetaTags(meta, meta.siteUrl)) {
          page = setMeta(page, name, content);
        }
        await mkdir(`dist${meta.path}`, { recursive: true });
        await writeFile(`dist${meta.path}/index.html`, page);
      }
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), react(), caseStudyStaticPages([bondureMeta, shinexMeta, neostraMeta])],
  resolve: { alias: { '@': fileURLToPath(new URL('./src/playtime-app', import.meta.url)) } },
});
