# Ankit Chandrakar — Product Design Portfolio

React 19 + Vite portfolio with a project gallery, dedicated case studies and brand presentations, a design desk, and interactive Playtime experiments. Styling combines the portfolio's sage-and-paper theme with isolated Tailwind styles for Playtime.

## Getting started

Use Node.js 22.12+ and npm. Run commands from the repository root:

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. `predev` and `prebuild` run the local asset check automatically. Public backend configuration is optional for the currently active routes; `.env.example` documents the paused Notes feature's browser settings.

## Routes and features

| Route | Content |
| --- | --- |
| `/` | Introduction, categorized project gallery, experience, and impact |
| `/about` | About page |
| `/desk` | Design desk and creator resources |
| `/playtime` | Interactive galleries, flipbook, Fluid water ripple, dock, and Pocket Vibes player |
| `/work/:projectId` | Project case studies, website showcases, and brand presentations |
| `/agents` | Legacy redirect to `/work/helix#agents` |

Dedicated presentations include Kamdhenu K-Series, Bondure, ShineX CrystalX, Neostra, ContractorBhai, Atlas, Adhikar, and ThanQ. Other project URLs use the shared case-study page. Unknown routes show the not-found page.

**Notes is temporarily paused:** `/notes`, `/admin/notes`, and Notes navigation are disabled. The feature source, Supabase backend, and skipped browser suite remain available for restoration. The footer currently prepares a `mailto:` draft in the visitor's configured email app; the visitor sends it there. It does not submit contact messages to Supabase. See [Notes setup](docs/notes-setup.md) for the retained backend implementation and restoration setup.

## Project structure

```text
src/
  App.jsx           Routes and shared page shell
  components/       Portfolio sections and shared UI
  pages/            Route pages and dedicated case studies
  data/             Portfolio content, project metadata, and image manifests
  hooks/            React hooks
  lib/              Shared helpers, metadata tags, and paused backend clients
  agents/           Embedded Agents experience support
  features/         Feature-specific components
  playtime-app/     Interactive experiments and their section wrappers
  styles/           Portfolio, case-study, and Playtime styles
public/             Served assets, résumé, and static presentations
scripts/            Asset preparation, imports, checks, and résumé generation
tests/e2e/          Playwright specs: agents, playtime, presentation-shell, notes
tests/backend/      Deno handler and database tests for the paused backend
supabase/           Backend functions, migrations, and security tests
docs/               Setup and maintenance guides
```

Edit identity, contact details, gallery projects, experience, and skills in `src/data/portfolio.js`. Shared case-study content lives in `src/data/case-studies.js`; dedicated presentations also use their own pages and data files. `src/styles/index.css` is the portfolio stylesheet entry point. Playtime's `src/styles/playtime-app.css` is loaded into a shadow root by `src/pages/Playtime.jsx`.

Search/social metadata comes from `index.html`, page metadata in `src/data/`, and `src/hooks/usePageMeta.js`. The pure helper in `src/lib/pageMetaTags.js` is shared with Vite's static case-study HTML generation.

## Scripts and checks

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite with the asset precheck |
| `npm run build` | Check assets and build production output to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test:e2e` | Run browser specs from `tests/e2e/` |
| `npm run assets:check` | Check required local assets |
| `npm run assets:optimize` | Run the asset optimization script |
| `npm run assets:generate` | Generate ink-art derivatives |
| `npm run assets:behance` | Import Behance presentation images |
| `npm run resume:build` | Generate the downloadable résumé PDF |

Install Chromium before the first browser-test run:

```sh
npx playwright install chromium
npm run lint
npm run test:e2e
```

Playwright starts its own strict-port Vite server on port `5189`; override with `PLAYWRIGHT_PORT` when needed. Five viewport projects cover desktop, mobile, compact mobile, tablet, and small desktop. Active suites cover the embedded Agents experience, Playtime behavior, and presentation controls/layouts. The Notes suite is intentionally skipped while the feature is paused. Backend test commands and configuration are documented in [Notes setup](docs/notes-setup.md) and [the backend README](supabase/README.md). These commands describe how to verify the project; they are not a record of passing checks or live integrations.

Asset generators and importers are maintenance tasks: inspect their inputs and output paths before running them. Regular development uses the checked-in served assets.

## Deployment

Build with `npm run build` and deploy `dist/`. Vite also generates route-specific HTML for selected case studies so link previews receive their metadata without JavaScript. SPA fallback rules are in `vercel.json` and `public/_redirects`; other hosts need equivalent fallbacks for direct application-route visits and refreshes. Some Playtime content uses external fonts and YouTube, so those interactions require network access.
