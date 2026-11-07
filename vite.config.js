import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { bondureMeta } from './src/data/bondure-meta.js';
import { neostraMeta } from './src/data/neostra-meta.js';
import { shinexMeta } from './src/data/shinex-meta.js';
import { contractorBhaiMeta } from './src/data/contractorbhai-meta.js';
import { atlasMeta } from './src/data/atlas-meta.js';
import { adhikarMeta } from './src/data/adhikar-meta.js';
import { thanqMeta } from './src/data/thanq-meta.js';
import { pageMetaTags } from './src/lib/pageMetaTags.js';
import { projectMetas } from './src/data/project-meta.js';

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
        page = page.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${escape(new URL(meta.path, meta.siteUrl).href)}" />`);
        for (const [name, content] of pageMetaTags(meta, meta.siteUrl)) {
          page = setMeta(page, name, content);
        }
        await mkdir(`dist${meta.path}`, { recursive: true });
        await writeFile(`dist${meta.path}/index.html`, page);
      }
    },
  };
}

// The owner supplied this assessment under public/ for this local review.
// Retain the source file but exclude private review material from serving/build output.
function privateReviewMaterial() {
  const denyPrivateFiles = (server) => {
    server.middlewares.use((request, response, next) => {
      let path;
      try { path = decodeURIComponent((request.url || '').split('?')[0]).replaceAll('\\', '/'); } catch { return next(); }
      if (/\/ankit-remote-job-report\.pdf\/?$/i.test(path) || /\/docs\/private(?:\/|$)/i.test(path)) {
        response.statusCode = 404;
        response.end('Not found');
        return;
      }
      next();
    });
  };
  return {
    name: 'private-review-material',
    configureServer: denyPrivateFiles,
    configurePreviewServer: denyPrivateFiles,
    async closeBundle() { await rm('dist/ankit-remote-job-report.pdf', { force: true }); },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), react(), privateReviewMaterial(), caseStudyStaticPages([bondureMeta, shinexMeta, neostraMeta, contractorBhaiMeta, atlasMeta, thanqMeta, adhikarMeta, ...Object.values(projectMetas).filter((meta) => !['/work/contractorbhai', '/work/atlas-brand', '/work/adhikar-brand'].includes(meta.path))])],
  resolve: { alias: { '@': fileURLToPath(new URL('./src/playtime-app', import.meta.url)) } },
});
