# Ankit Chandrakar — Product Design Portfolio

A personal React + Vite portfolio with the original sage-green palette, supplied ink-character artwork, illustrated graph-paper thumbnails, and dedicated case-study pages.

## Run

```sh
npm install
npm run dev
npm run build
npm run preview
```

Use the local URL printed by Vite. The development preview for this session runs at **http://localhost:5188**.

## Edit your portfolio

| Content | File |
| --- | --- |
| Identity, contact details, links, projects, experience, skills | `src/data/portfolio.js` |
| Main page sections | `src/components/` |
| Typography, spacing, personal layout rules | `src/styles/portfolio.css` |
| Sage-green theme and case-study styling | `src/styles/sage-theme.css`, `src/styles/case-study.css` |
| Dedicated case-study page | `src/pages/CaseStudy.jsx` |
| Behance case-study chapters and source content | `src/data/case-studies.js`, `src/data/behance-media.json` |
| Global colors and font declarations | `src/styles/index.css` |
| Original supplied hero artwork | `public/assets/newlogo/image.png` |
| Optimized hero artwork and ink portrait | `public/assets/ankit/ink-hero.webp`, `public/assets/ankit/ink-portrait.webp` |
| Interactive hero illustration | `src/components/HeroArtwork.jsx` |
| Ink-art layout and blending | `src/styles/ink-art.css` |
| Local project thumbnails and Notion presentation slides | `public/assets/ankit/` |
| Search and social metadata | `index.html` |

To use your own photo, put it in `public/assets/ankit/` and change `imagery.portrait` in `portfolio.js`. The current portrait is an ink cutout from the supplied character artwork, not a photograph of Ankit. The original uploaded image and your custom logo are preserved in `public/assets/newlogo/`.

The hero uses the supplied image, with responsive WebP sizes, soft edge masks, and multiply blending. Its sketchbook link opens the projects, the thought button cycles through design notes, and focus mode pauses the ambient animation and pointer movement. These controls support keyboard and touch; motion respects the visitor's reduced-motion preference.

## Project content and images

The gallery contains **16 projects**, organized into Products, Websites, and Systems. Every thumbnail links to a shareable page at `/work/project-id`, including `/work/yesbot` and `/work/cryptotax`.

- **Résumé:** Neostra, the Tejas ecosystem, Kamdhenu digital experiences, and the Neostra/Tejas design systems.
- **Notion work history:** ThanQ research.
- **Original Notion presentation:** CryptoTax, YesBot.ai, JD Institute of Fashion Technology, LionLabNFTs, StreetSnap.co, ElectraWheeler, and Acetech.
- **Behance:** the complete YesBot.ai and CryptoTax presentations, plus CypherWallet, IPL ’24, Code For Community, LionLabNFT, StreetSnap.co, and ElectraWheeler. Sixty original Behance images are stored locally.

All 16 thumbnails are locally generated black-ink compositions on graph paper, with project-specific drawings, comic callouts, crosshatching, and small sage accents. Four additional book, headphones, sneaker, and robot illustrations carry the drawing style through the page. They are illustrative covers, **not production screenshots**. Original Behance and Notion visuals retain their published colors inside the case studies.

To extend a case study, edit its `caseStudy` object in `src/data/case-studies.js`. Each presentation chapter has an `id`, `title`, `description`, and `images` array. Images use local paths and explicit dimensions. Projects without published screens have an editable overview based on the supplied résumé.

The supplied résumé takes precedence over the older Notion profile for current roles and employment dates. The two concurrent current roles are retained as supplied. Website projects with limited source material have deliberately brief descriptions, without invented results.

### Regenerate assets

```sh
npm run assets:generate  # Prepare the supplied hero, portrait, 16 ink covers, and supporting doodles
npm run assets:check     # Verify every local project image and the résumé
npm run resume:build     # Regenerate the downloadable résumé PDF
```

The PDF is a reformatted résumé summary built from the supplied information; it is not the original uploaded PDF. You can replace `public/ankit-chandrakar-resume.pdf` with your preferred résumé.

`npm run assets:behance` reimports the published Behance images. `scripts/import-notion.mjs` can reimport the 13 original Notion slides. Normal development and production use local files. The `predev` and `prebuild` scripts check asset availability before starting. Earlier reference assets are retained for design reference; the personal site does not use the old identity, portrait, artwork, client logos, or videos.

## Notes and contact messages

`/notes` is a moderated guestbook; `/admin/notes` is the owner's password-login dashboard. The footer sends private messages through a Supabase Edge Function with Turnstile protection and durable Resend notifications, without opening an email app. Notes remain private until approved; visitor email addresses are never included in the public wall response.

Follow **[Notes and contact setup](docs/notes-setup.md)** for local setup, owner provisioning, database/security design, environment variables, email/domain configuration, tests, deployment order, and live delivery verification. Public configuration starts in `.env.example`; backend secrets start in `supabase/secrets.example`.

## Checks

```sh
npm run lint
npx playwright install chromium  # First browser-test run only
npm run test:e2e
```

Browser tests cover image loading, viewport overflow, gallery categories, direct case-study URLs, chapter navigation, source images, browser history, mobile navigation, résumé download, contact validation, and reduced-motion behavior.

## Deploy

Deploy `dist/` after `npm run build`. Case studies use `/work/:projectId` and the Design desk uses `/desk`. Netlify/Cloudflare Pages fallback rules are included in `public/_redirects`; Vercel rules are in `vercel.json`. On another host, serve `index.html` for those application routes so direct links and refreshes work. All images, fonts, and résumé files are served locally.
# portfolio
