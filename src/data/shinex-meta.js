// Plain module (no imports) so vite.config.js can reuse it to write the static page's <head> at build time.
export const shinexMeta = {
  path: '/work/shinex-crystalx',
  siteUrl: 'https://ankitchandrakar.in', // same as profile.website; used for absolute Open Graph URLs in the static page
  title: 'ShineX & CrystalX: Cleaner packaging for Kamdhenu Adhesive | Ankit Chandrakar',
  description: 'Packaging, product naming, logos and a 22-post social media campaign for ShineX and CrystalX, two floor cleaners from Kamdhenu Adhesive: one for tiles, one for marble.',
  image: '/assets/TileCleaner/shinex-crystalx-og.jpg',
  imageWidth: 1200,
  imageHeight: 630,
  imageAlt: 'Two 1 L bottles side by side: ShineX for tiles on the left and CrystalX for marble on the right.',
};
