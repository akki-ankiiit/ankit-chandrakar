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
  subtitle: 'Identity and packaging that made a brand-new construction-chemicals range look established from day one.',
  facts: [['Client', 'Tejas'], ['Scope', 'Identity and packaging'], ['Role', 'Lead Product Designer'], ['Outcome', '₹2 Cr+ in monthly sales']],
};

export const brief = {
  heading: 'A new name on a crowded shelf.',
  lede: 'Tejas, from the team behind Kamdhenu Adhesive, launched three products for modern walls and floors.',
  challenge: 'Look premium, trustworthy and like one family, next to brands buyers already knew.',
  linkLabel: 'See how the same team launched Kamdhenu Adhesive →',
};

export const logo = {
  heading: 'A wordmark built to hold.',
  lede: 'BONDURE reads as “bond” and “endure”. Tejas stays as the maker’s mark on every bag.',
};

// Accents are the median colour of the solid colour field at the bottom of each bag (sampled from the PNGs).
export const products = [
  {
    id: 'bondure', image: 'bondure', name: 'BONDURE', type: 'AAC Block Jointing Mortar',
    colour: 'Maroon', accent: '#540E1E', pack: '40 kg',
    alt: 'BONDURE AAC Block Jointing Mortar bag in maroon, 40 kg',
  },
  {
    id: 'wallstark', image: 'wallstark', name: 'Wall Stârk', type: 'German Finish Ready-Mix Plaster',
    colour: 'Navy', accent: '#0B1628', pack: '40 kg',
    alt: 'Wall Stârk German Finish Ready-Mix Plaster bag in navy, 40 kg',
  },
  {
    id: 'screed', image: 'screed', name: 'Scrêêd', type: 'German Finish Floor Screed',
    colour: 'Deep green', accent: '#0F2D28', pack: '50 kg',
    alt: 'Scrêêd German Finish Floor Screed bag in deep green, 50 kg',
  },
];

export const system = {
  heading: 'One family, three colours.',
  lede: 'The same layout on every bag. Only the colour and the product name change.',
};

export const notes = {
  roof: {
    title: 'Roof accents',
    text: 'The chevrons over “â” and “êê” are drawn as roofs.',
    figures: [
      { key: 'roof-wallstark', alt: 'The Wall Stârk name from the bag, with a red roof-shaped chevron over the “â”.' },
      { key: 'roof-screed', alt: 'The Scrêêd name from the bag, with a red roof-shaped chevron over each “ê”.' },
    ],
  },
  promises: {
    title: 'Four promises',
    text: 'One icon set across the range.',
    items: [
      { key: 'icon-self-curing', label: 'Self curing', alt: 'Self curing icon: a clock with a circular arrow' },
      { key: 'icon-strength', label: 'High strength', alt: 'High strength icon: a flexed arm' },
      { key: 'icon-durability', label: 'Durability', alt: 'Durability icon: a house inside a shield' },
      { key: 'icon-easy', label: 'Easy to use', alt: 'Easy to use icon: a hand with a finger snap' },
    ],
  },
  proof: {
    title: 'Proof at the bottom',
    text: 'Certifications and net weight close every bag.',
    conformsAlt: 'ISO, IGBC, ASTM and Bureau of Indian Standards marks from the bottom of the BONDURE bag',
  },
};

export const results = {
  heading: 'Selling across three states.',
  lede: 'The range now sells across central and western India.',
  figure: '₹2 Cr+',
  figureLabel: 'Monthly sales across the range',
  states: ['Chhattisgarh', 'Maharashtra', 'Madhya Pradesh'],
};

export const role = ['BONDURE name treatment and logo', 'Packaging system for three products', 'Colour coding', 'Icon set', 'Print-ready bag artwork'];
