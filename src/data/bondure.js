import images from './bondure-images.json';
import { bondureMeta } from './bondure-meta.js';

// Raster sizes come from scripts/process-bondure.mjs; the two SVG logos are used as supplied.
export const bondureImages = {
  ...images,
  logo: { src: '/assets/Bondure/BONDURE.svg', width: 798, height: 109 },
  tejas: { src: '/assets/Bondure/Tejas.svg', width: 129, height: 71 },
};
export { bondureMeta };
export const bondurePath = bondureMeta.path;

export const bondureCard = {
  id: 'bondure',
  href: bondurePath,
  client: 'TEJAS',
  category: 'PACKAGING & IDENTITY',
  title: 'BONDURE',
  image: '/assets/Bondure.png',
  subtitle: 'Three bags, three colours and one family: packaging and identity for a new brand by Tejas.',
};

export const bondureHero = {
  title: 'BONDURE',
  subtitle: 'Packaging and identity for a new construction-chemicals brand by Tejas, built to look established from day one.',
  meta: ['Brand identity', 'Packaging', 'Tejas', 'Role: Lead Product Designer'],
};

export const brief = {
  heading: 'A new name, entering a market that already knew the team.',
  text: 'Tejas is a new company launched by the founding team behind Kamdhenu Adhesive. Their first range was three products for modern walls and floors: an AAC block jointing mortar, a ready-mix plaster and a floor screed.',
  challenge: 'a brand nobody had heard of had to sit on the same shelves as established names and look premium, trustworthy and like one family.',
  linkLabel: 'See how the same team launched Kamdhenu Adhesive →',
};

export const logo = {
  heading: 'The logo',
  text: 'I designed the BONDURE wordmark: a strong serif that reads as “bond” and “endure”, solid enough for a product that holds walls together. Tejas stays as the maker’s mark on every bag.',
};

// Accents are the median colour of the solid colour field at the bottom of each bag (sampled from the PNGs).
export const products = [
  {
    id: 'bondure', image: 'bondure', name: 'BONDURE', type: 'AAC Block Jointing Mortar',
    use: 'For laying AAC blocks with thin, strong joints.',
    colour: 'Maroon', accent: '#540E1E', pack: '40 kg',
    alt: 'BONDURE AAC Block Jointing Mortar bag in maroon, 40 kg',
  },
  {
    id: 'wallstark', image: 'wallstark', name: 'Wall Stârk', type: 'German Finish Ready-Mix Plaster',
    use: 'Smooth wall plastering straight from the bag.',
    colour: 'Navy', accent: '#0B1628', pack: '40 kg',
    alt: 'Wall Stârk German Finish Ready-Mix Plaster bag in navy, 40 kg',
  },
  {
    id: 'screed', image: 'screed', name: 'Scrêêd', type: 'German Finish Floor Screed',
    use: 'Level, durable floor beds.',
    colour: 'Deep green', accent: '#0F2D28', pack: '50 kg',
    alt: 'Scrêêd German Finish Floor Screed bag in deep green, 50 kg',
  },
];

export const system = {
  heading: 'One family, three colours.',
  intro: 'Every bag uses the same layout, so the range is recognisable from across a store. Only the colour and the product name change.',
};

export const notes = {
  roof: {
    title: 'Roof accents',
    text: 'The chevrons over the “â” and “êê” in Stârk and Scrêêd are drawn as roofs, a quiet nod to building.',
    figures: [
      { key: 'roof-wallstark', alt: 'The Wall Stârk name from the bag, with a red roof-shaped chevron over the “â”.' },
      { key: 'roof-screed', alt: 'The Scrêêd name from the bag, with a red roof-shaped chevron over each “ê”.' },
    ],
  },
  promises: {
    title: 'Four promises',
    items: [
      { key: 'icon-self-curing', label: 'Self curing', alt: 'Self curing icon: a clock with a circular arrow' },
      { key: 'icon-strength', label: 'High strength', alt: 'High strength icon: a flexed arm' },
      { key: 'icon-durability', label: 'Durability', alt: 'Durability icon: a house inside a shield' },
      { key: 'icon-easy', label: 'Easy to use', alt: 'Easy to use icon: a hand with a finger snap' },
    ],
  },
  proof: {
    title: 'Proof at the bottom',
    conforms: 'Conforms to',
    conformsAlt: 'ISO, IGBC, ASTM and Bureau of Indian Standards marks from the bottom of the BONDURE bag',
    weightLabel: 'Net weight',
  },
};

export const results = {
  heading: 'Results',
  figure: '₹2 Cr+',
  figureLabel: 'Monthly sales across the range.',
  text: 'Sold across Chhattisgarh, Maharashtra, Madhya Pradesh and other states of India.',
  states: ['Chhattisgarh', 'Maharashtra', 'Madhya Pradesh'],
};

export const role = {
  heading: 'My role',
  items: [
    'Brand name treatment and BONDURE logo',
    'Packaging system for three products',
    'Colour coding',
    'Icon set',
    'Print-ready bag artwork',
  ],
};
