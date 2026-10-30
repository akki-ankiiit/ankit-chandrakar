import images from './shinex-images.json';
import { shinexMeta } from './shinex-meta.js';

export { shinexMeta };
export const shinexPath = shinexMeta.path;

// Kamdhenu blue, red and yellow, the same values the K-Series grades use (sampled from the logo).
const brand = { blue: '#0B4A98', red: '#C8161D' };

export const shinexCard = {
  id: 'shinex-crystalx',
  href: shinexPath,
  client: 'KAMDHENU ADHESIVE',
  category: 'PACKAGING & SOCIAL',
  title: 'ShineX & CrystalX',
  image: images['card'].src,
  subtitle: 'Two floor cleaners from Kamdhenu Adhesive: one for tiles, one for marble, in one family that’s easy to tell apart.',
};

export const shinexHero = {
  title: 'ShineX & CrystalX',
  subtitle: 'Two floor cleaners from Kamdhenu Adhesive: one for tiles, one for marble, in one family that’s easy to tell apart.',
  meta: ['Packaging', 'Product naming and logos', 'Social media', 'Kamdhenu Adhesive', 'Role: Lead Product Designer'],
};

export const idea = {
  heading: 'From fixing the floor to caring for it.',
  text: 'Kamdhenu Adhesive’s K-Series helps lay tiles and stone. ShineX and CrystalX carry the brand into what happens next: keeping those floors clean. Tile and marble need different care, so the range is split by surface, not by strength.',
  linkLabel: 'See the K-Series adhesive range →',
};

export const products = [
  {
    id: 'shinex',
    name: 'ShineX',
    surface: 'Tile',
    image: images['shinex'],
    alt: 'ShineX Advanced Tile & Floor Cleaner, 1 L bottle with a red cap',
    logo: { src: '/assets/TileCleaner/ShineX.svg', width: 686, height: 348, alt: 'ShineX logo' },
    accent: brand.red,
    benefits: ['10x powerful stain removal', 'Professional heavy-duty cleaning', 'Instant shine, spotless finish'],
  },
  {
    id: 'crystalx',
    name: 'CrystalX',
    surface: 'Marble',
    image: images['crystalx'],
    alt: 'CrystalX Marble & Stone Cleaner, 1 L bottle with a red cap',
    logo: { src: '/assets/TileCleaner/CrystalX.svg', width: 621, height: 285, alt: 'CrystalX logo' },
    accent: brand.blue,
    benefits: ['Streak-free mirror shine', 'pH balanced formulation', 'Cleans, restores and protects', 'Safe for all Italian marble and granite'],
  },
];

export const notes = [
  { title: 'Shared bottle, shared label', text: 'Same 1 L bottle, red cap and label layout, framed by the blue, red and yellow swoosh taken from the Kamdhenu Group logo, so both products read as Kamdhenu at a glance.' },
  { title: 'The X', text: 'Both names end in X. ShineX uses fast, slanted red lettering for everyday tile cleaning. CrystalX uses an icy, crystal-textured X for marble’s polished finish.' },
  { title: 'Shields for proof', text: 'Every benefit and the net quantity sit in a shield badge, so trust signals look the same on both bottles.' },
];

export const socialIntro = {
  heading: 'ShineX on social.',
  text: 'A set of 22 posts introducing ShineX: what it cleans, how to use it and the finish it leaves.',
};

export const posts = [
  'ShineX post: a boy kneels to wipe up a yellow spill on a glossy living-room floor while a girl watches',
  'ShineX post: a mother looks down at her son cleaning a yellow spill on a sunlit floor',
  'ShineX post: close-up of a tile floor covered in wet, dark dirt and stains',
  'ShineX post: a ShineX bottle standing on a sunlit floor in a living room',
  'ShineX post: a woman mops a shiny living-room floor while two children play nearby',
  'ShineX post: two children play with toys on a glossy floor in a bright living room',
  'ShineX post: a boy runs across a glossy floor beside a ShineX bottle, with the line “So clean… you might miss it”',
  'ShineX post: a boy runs barefoot across a reflective floor, with the line “So clean… you might miss it”',
  'ShineX post: “Don’t guess. Test it.” An ordinary cleaner leaves dirt on the tile, while ShineX lifts it cleanly',
  'ShineX post: a ShineX bottle on a glossy floor, with a gloved hand mopping up a trail of blue light',
  'ShineX post: a ShineX bottle standing on a polished floor beside a sunlit window',
  'ShineX post: a ShineX bottle at the edge of a bright room, with two children playing on the floor',
  'ShineX post: the ShineX mascot with blue gloves and boots, sending dirt flying with blue sparks',
  'ShineX post: a smiling ShineX mascot with blue gloves and boots on a white background',
  'ShineX post: a ShineX bottle beside icons for deep cleaning, bacteria removal and dust and allergen removal',
  'ShineX post: a ShineX bottle inside a ring of blue water splash on a dark background',
  'ShineX post: a ShineX bottle under a spotlight on a dark, reflective floor',
  'ShineX post: a ShineX bottle on a marble floor, with BEFORE and AFTER labels and a blue light trail',
  'ShineX post: a woman in a patterned top mops a floor while a child plays with toys nearby',
  'ShineX post: a ShineX bottle in front of a marble wall, with small figures of workers and scaffolding',
  'ShineX post: a ShineX bottle on a wet, dark-grey floor with a blue glow',
  'ShineX post: a ShineX bottle in a bright room on a reflective floor, with a plant and a window',
].map((alt, index) => {
  const number = String(index + 1).padStart(2, '0');
  const image = images[`post-${number}`];
  return { number, src: image.src, width: image.width, height: image.height, alt };
});

export const role = {
  heading: 'My role',
  items: ['Product naming', 'ShineX and CrystalX logos', 'Bottle label design', 'Benefit icons and badges', '22-post social media campaign'],
};
