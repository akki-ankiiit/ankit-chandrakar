// Plain module (no imports) so vite.config.js can reuse it to write the static page's <head> at build time.
export const bondureMeta = {
  path: '/work/bondure',
  siteUrl: 'https://ankitchandrakar.in', // same as profile.website; used for absolute Open Graph URLs in the static page
  title: 'BONDURE: Packaging and identity for Tejas | Ankit Chandrakar',
  description: 'Packaging and identity for BONDURE, a new construction-chemicals brand by Tejas: a jointing mortar, a ready-mix plaster and a floor screed designed as one family.',
  image: '/assets/Bondure/bondure-og.jpg',
  imageWidth: 1200,
  imageHeight: 630,
  imageAlt: 'Three BONDURE bags side by side: the maroon jointing mortar, the navy Wall Stârk plaster and the green Scrêêd floor screed.',
};
