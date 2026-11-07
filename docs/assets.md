# Media sources and deployed assets

`public/` contains deployed files. `source-assets/` preserves source-only originals
in Git, outside Vite's public directory. Paths below are relative to the repository
root; run the Node scripts from that root. The separate, ignored `assets-src/`
directory used by some older generators is not this archive.

## Source-to-output manifest

### Product-evidence captures (7 November 2026)

`public/assets/portfolio-evidence/` contains browser viewport captures, encoded as
1440px and 960px WebPs with Sharp (quality 85). They are observed design/demo
artifacts, not production records or proof of measured outcomes.

- `neostra-requests`, `neostra-collection-details`, `neostra-tokens`,
  `neostra-button-states`, and `neostra-privacy-preferences`: the existing shared
  Neostra Penpot viewer, linked in `src/data/portfolio.js`. Captures retain viewer
  chrome and include only the visible portion of the named board. Product values
  are sample data. Both original Figma links returned HTTP 403 during this review.
- `helix-projects`: `https://helixlab-one.vercel.app/projects`.
- `helix-pathways`: `https://helixlab-one.vercel.app/projects/p-gyp`.
  These are screenshots of the interactive prototype; agent runs are simulated,
  predictions and rankings are demo values, and no lab outcome is established.

HTML captions and alternative text in `src/data/project-overviews.js` describe
these boundaries. No separate Helix application files were changed.

Each source below moved from the same relative path under `public/assets/` to
`source-assets/`. Original names, bytes, and grouping are preserved. The existing
public derivative URLs remain unchanged.

| Source under `source-assets/` | Files | Exact bytes | Generator / deployed output |
| --- | ---: | ---: | --- |
| `sketches/*.png` | 7 | 59,291,292 | Mapping below → `public/assets/sketches/*.webp` |
| `TileCleaner/{ShineX,CrystalX}.png`, `TileCleaner/smc/01.png`–`22.png` | 24 | 56,901,317 | `node scripts/process-shinex.mjs` → existing bottle/post WebPs, card WebP, OG JPEG, and `src/data/shinex-images.json` |
| `imagery/*.png`, `imagery/sketch-timelapse.gif` | 11 | 14,721,284 | `npm run assets:optimize` → `public/assets/imagery/` |
| `work/art/*.jpg` | 10 | 1,658,213 | `npm run assets:optimize` → same-stem WebPs in `public/assets/work/art/` |
| `work/design/*.jpg` | 5 | 743,231 | `npm run assets:optimize` → same-stem WebPs in `public/assets/work/design/` |
| `web-thumbnail.gif` | 1 | 8,866,518 | `node scripts/build-social-preview.mjs` → `public/assets/social-preview.gif` and `.jpg` |
| `video/Fluid.mp4` | 1 | 8,048,878 | `node scripts/optimize-fluid-video.mjs` → `public/assets/video/fluid-web.mp4` and `fluid-poster.webp` |
| `video/Pocket Player.mp4` | 1 | 2,131,518 | `node scripts/optimize-pocket-player.mjs` → `public/assets/video/pocket-player-web.mp4` and `pocket-player-poster.webp` |
| `ContractorBhai/ContractorBhai-case-study.html` | 1 | 1,869,811 | `node scripts/process-contractorbhai.mjs` → extracted WebPs, cover variants, and `src/data/contractorbhai-images.json` |
| `Neostra logo book/` (entire supplied bundle) | 87 | 2,922,338 | Archived HTML, 40 PNGs, 32 SVGs, and 14 `_source/` helper files; runtime uses `src/data/neostra-logo-book.html` and `public/assets/neostra-book/` |
| **Total preserved outside deployment** | **148** | **157,154,400** | |

The imagery originals are `artist-portrait.png`, `faded-grid.png`,
`faded-grid-vert.png`, `folder-{beige,brown,green,plum,slate,terracotta}.png`,
`sketch-timelapse.png`, and `sketch-timelapse.gif`. PNG/JPEG outputs use the same
stem; the GIF output is `sketch-timelapse-animated.webp`.

The art originals are `2023-goose.jpg`, `2025-bs-kitchen.jpg`,
`2025-bs-locker.jpg`, `2025-bs-movie.jpg`, `2025-feedusbitch.jpg`,
`2025-flash.jpg`, `2025-neyomi-hop.jpg`, `2025-reena.jpg`, `2026-kdh-mira.jpg`,
and `2026-kdh-zoey.jpg`. The design originals are
`cover-{dymocks,jv-locked,nuvei,penguin,vauliys}.jpg`.

Image scripts require the project's `sharp` dependency. Video and social-preview
scripts also require FFmpeg. The supplied Neostra `_source/` helpers are historical
originals, including references to their author's `/sessions/...` environment;
they are not a portable project regeneration command. No runtime or project
script consumes the archived Neostra bundle.

### Sketch original mapping

The mappings were verified by comparing the original and derivative image pixels
after resizing to 64×64 RGB on white. Every source had a distinct best match
(mean squared error 6–15 versus at least 3,054 for the next-best image).
Dimensions below describe the original PNGs.

| Original filename in `source-assets/sketches/` | Original dimensions | Existing file in `public/assets/sketches/` |
| --- | --- | --- |
| `467CB927-78B4-4112-8E81-0BC0FA73B715 1.png` | 2253×3696 | `deadpool-crossed-arms.webp` |
| `6C39185B-C8EA-47E0-91AC-422F7F7D7373 1.png` | 2079×3696 | `akki-character.webp` |
| `6CCA9BC4-C9CA-4549-A2ED-992DBEF4CB35 1.png` | 2160×3696 | `deadpool-line-study.webp` |
| `74A7C3E9-4938-407B-AAE2-24F13DBE5981 1.png` | 2160×3696 | `po-panda.webp` |
| `9DF1F32E-03C7-423E-B8C1-2FEFA97DC767 1.png` | 2079×3696 | `deadpool-colour-study.webp` |
| `Untitled 1 1.png` | 2613×3696 | `nobita-shizuka.webp` |
| `Untitled 2 1.png` | 2613×3696 | `chutki-bheem.webp` |

There is no checked-in sketch export script. Preserve these originals and use the
mapping when exporting replacements; the current WebPs were retained as-is.

## Removed deployment files

References in source, scripts, tests, configuration, and HTML were checked before
removal. Only byte-identical duplicates, unused generated variants with retained
generators, empty placeholders, and Finder metadata were removed.

| Removed path(s), relative to `public/assets/` | Files | Exact bytes | Reason / reproduction |
| --- | ---: | ---: | --- |
| `navbar logo.svg` | 1 | 10,816 | SHA-256 identical to retained `newlogo/navbar-logo.svg` |
| `newlogo/Logo (4).svg` | 1 | 6,450 | SHA-256 identical to retained `public/favicon.svg` (repository-root-relative) |
| `.gitkeep`, `ankit/.gitkeep`, `behance/.gitkeep` | 3 | 0 | All three directories contain real files |
| `ankit/*-orange.svg` (listed below) | 7 | 4,626 | Unused palette exports from retained `scripts/generate-scrapbook.mjs` |
| `ankit/scrapbook-*.webp` (listed below) | 16 | 742,076 | Unused generated covers from retained `scripts/generate-scrapbook.mjs` |
| `thumbnails/packaging-bondure.webp` | 1 | 11,508 | Unused placeholder from retained `scripts/generate-packaging-thumbnails.mjs`; current BONDURE imagery is separate |
| `Kamadhenu_Adhesive Old bags/.DS_Store` | 1 | 6,148 | Ignored macOS Finder metadata |
| **Total deleted** | **30** | **781,624** | Includes the ignored `.DS_Store` |

The seven orange variants were `folder-products-orange.svg`,
`folder-systems-orange.svg`, `folder-websites-orange.svg`, `idea-orange.svg`,
`monogram-orange.svg`, `portrait-orange.svg`, and `wordmark-orange.svg`.

The sixteen scrapbook stems were `acetech`, `cfc`, `cryptotax`, `cypherwallet`,
`electrawheeler`, `ipl24`, `jd-institute`, `kamdhenu`, `lionlab`, `neostra-system`,
`neostra`, `streetsnap`, `tejas-system`, `tejas`, `thanq`, and `yesbot`.

The two legacy generators are retained for reproducibility; running them will
recreate unused files in `public/`. `thumbnails/packaging-k-series.webp` was
retained because a generator for that existing output could not be verified.

## Preserved deployed material

Active metadata/social images, responsive/optimized variants, fonts, HTML
presentations, all ThanQ SMP assets, old packaging/before images, and Helix clean
video assets remain in place. Other hand-authored or unknown originals remain
where they were. The résumé PDFs were not moved into this tracked archive.

## Cleanup verification snapshot

- Deployed file bytes observed before cleanup: **440,602,034**.
- Deployed file bytes after cleanup: **282,666,010**.
- Reduction: **157,936,024 bytes**, from source relocation plus deletion.
- All 100 binary source moves were SHA-256 checked during relocation. The moved
  text originals were checked for byte preservation as well.
- `npm run assets:check` passed: 201 portfolio images, one thumbnail video, and
  the résumé PDF.
- All 21 `.mjs` scripts passed `node --check`; changed tracked scripts passed
  `git diff --check`.
- No Git-visible repository file exceeds 100,000,000 bytes. The largest is
  `public/assets/newlogo/image.gif` at 26,349,363 bytes.
- Asset generators were not run; existing generated outputs were not overwritten.
- Build and browser verification are coordinated separately from this cleanup.
