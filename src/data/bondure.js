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
  image: '/assets/Bondure.webp',
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

// Early directions: fill in name, what it tried and why it was set aside. Sections stay hidden until real text replaces the TODO_USER placeholders.
export const ideas = {
  heading: 'Three directions before one system.',
  lede: 'TODO_USER: One-line summary of the early directions, before the family system.',
  items: [
    { name: 'TODO_USER: Direction 1 name', text: 'TODO_USER: What this direction tried.', setAside: 'TODO_USER: Why it was set aside.' },
    { name: 'TODO_USER: Direction 2 name', text: 'TODO_USER: What this direction tried.', setAside: 'TODO_USER: Why it was set aside.' },
    { name: 'TODO_USER: Direction 3 name', text: 'TODO_USER: What this direction tried.', setAside: 'TODO_USER: Why it was set aside.' },
  ],
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
  why: [
    { title: 'One layout, one reading', text: 'A buyer who learns one bag can read the next.' },
    { title: 'Colour does the sorting', text: 'Each product has its own colour, taken from the bag’s solid base.' },
    { title: 'Only the name changes', text: 'The product name and type are the only text that differ.' },
  ],
};

// Kamdhenu Group HQ details: fill in each step from the brief, review and approval. Sections stay hidden until real text replaces the TODO_USER placeholders.
export const hq = {
  heading: 'Built to the Kamdhenu HQ brief.',
  lede: 'Tejas is from the team behind Kamdhenu Adhesive, so the work followed the Kamdhenu Group HQ details before it was implemented.',
  steps: [
    { title: 'What HQ asked for', text: 'TODO_USER: The brief and requirements from Kamdhenu Group HQ.' },
    { title: 'What changed after review', text: 'TODO_USER: Feedback from HQ and the changes made.' },
    { title: 'How it was approved', text: 'TODO_USER: The approval round and sign-off.' },
  ],
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
