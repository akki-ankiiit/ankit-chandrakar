import images from './k-series-images.json';

export const kSeriesImages = images;
export const kSeriesPath = '/work/kamdhenu-k-series';

export const kSeriesCard = {
  id: 'kamdhenu-k-series',
  href: kSeriesPath,
  client: 'KAMDHENU ADHESIVE',
  category: 'PACKAGING & NAMING',
  title: 'K-Series',
  image: images['portfolio-card'].src,
  subtitle: 'We asked the people who sell and use the bags. Four numbers and four colours later, a ₹1.5 Cr range became a ₹20 Cr one.',
};

export const kSeriesHero = {
  title: 'K-Series',
  subtitle: kSeriesCard.subtitle,
  facts: [['Client', 'Kamdhenu Adhesive'], ['Scope', 'Research, naming and packaging'], ['Role', 'Lead Product Designer'], ['Outcome', '₹1.5 Cr to ₹20 Cr a year']],
};

export const kSeriesMeta = {
  title: 'K-Series: Kamdhenu Adhesive packaging case study | Ankit Chandrakar',
  description: kSeriesHero.subtitle,
  image: images['k90-front'].src,
};

export const grades = [
  {
    id: 'k50', code: 'K50', colour: '#D2491A', ink: '#ffffff',
    english: 'Floor & Wall Tile Adhesive',
    hindi: 'फ्लोर एंड वाल टाइल एडसिव',
    use: 'Ceramic floors and walls',
  },
  {
    id: 'k60', code: 'K60', colour: '#E1BE00', ink: '#282828',
    english: 'Superior Floor & Wall Tile Adhesive',
    hindi: 'सुपीरियर फ्लोर एंड वॉल टाइल एडेसिव',
    use: 'Vitrified tiles, wet areas',
  },
  {
    id: 'k80', code: 'K80', colour: '#C8161D', ink: '#ffffff',
    english: 'Superior Tile & Stone Adhesive',
    hindi: 'सुप्रीम टाइल एंड स्टोन एडेसिव',
    use: 'Heavy tiles and natural stone',
  },
  {
    id: 'k90', code: 'K90', colour: '#0B4A98', ink: '#ffffff',
    english: 'Paramount Tile & Stone Adhesive',
    hindi: 'पैरामाउंट टाइल एंड स्टोन एडेसिव',
    use: 'Large slabs, vertical cladding',
  },
];

export const recognition = {
  heading: 'Signed off by the founder.',
  lede: 'Sunil Agrawal, founder of Kamdhenu Group, appreciated the work at the K-Series launch and signed the brochure.',
  quote: 'All the best for Adhesive.',
  quoteCaption: 'Handwritten on the K-Series brochure',
  profile: {
    name: 'Sunil Agrawal',
    role: 'Founder, Kamdhenu Group',
    imageKey: 'sunil-portrait',
    alt: 'Sunil Agrawal, founder of Kamdhenu Group',
    bio: 'Kamdhenu’s familiar TMT steel grades helped inspire the K-Series naming system. At the K-Series launch, he appreciated the design and signed the product brochure.',
  },
  figures: [
    { key: 'me-and-sunil', caption: 'With Sunil Agrawal at the launch stand', alt: 'Ankit Chandrakar and Sunil Agrawal standing together at an evening event, with K50 and K60 signage behind them.' },
    { key: 'signed-brochure', caption: 'The signed brochure', alt: 'The K-Series product brochure with a handwritten message and signature from Sunil Agrawal.' },
  ],
};

export const oldBags = [
  { key: 'old-t10', alt: 'Original Kamdhenu T-10 Silver tile adhesive bag in light blue.' },
  { key: 'old-t20', alt: 'Original Kamdhenu T-20 Gold tile adhesive bag in gold.' },
  { key: 'old-wt20', alt: 'Original Kamdhenu WT-20 Gold white tile adhesive bag in muted green.' },
  { key: 'old-t30', alt: 'Original Kamdhenu T-30 Diamond tile adhesive bag in lime green.' },
];

export const problem = {
  heading: 'Every bag on the counter looked the same.',
  lede: 'The original T-series used technical names and similar layouts across four tile adhesives.',
  caption: 'T-10 Silver, T-20 Gold, WT-20 Gold and T-30 Diamond: different colours, similar front-of-pack layouts.',
  names: ['T-10 Silver', 'T-20 Gold', 'WT-20 Gold', 'T-30 Diamond'],
  issues: ['Technical names were hard to say and remember.', 'Near-identical layouts made the range hard to tell apart.', 'No obvious entry-to-premium order.'],
  salesBefore: { label: 'Annual sales before', value: '₹1–1.5 Cr' },
  buyer: [
    { title: 'They choose by colour', text: 'Masons ask for the red one.' },
    { title: 'They trust a number', text: 'Steel and cement are bought by grade.' },
    { title: 'They read Hindi first', text: 'Pictures and Hindi get followed.' },
  ],
};

export const insight = {
  heading: 'Borrow the grade builders already trust.',
  lede: 'Kamdhenu sells TMT steel by grade. Fe500 became the cue for K50: K for Kamdhenu, and a number that rises with strength.',
  steelGradeExample: ['Fe500', 'K50'],
};

export const naming = {
  heading: 'Climb the number, climb the job.',
  lede: 'One grade, one colour, one job. The colour fills the lower half of every bag.',
  axis: ['Lighter tiles, floors', 'Heavier stone, walls and facades'],
  ladder: { k50: 'Ceramic', k60: 'Vitrified', k80: 'Stone', k90: 'Slabs' },
};

export const front = {
  heading: 'Read top to bottom in three seconds.',
  lede: 'Five zones, in the order a mason reads them.',
  pins: [
    { id: 1, x: '50%', y: '14%', title: 'Two marks of trust', text: 'Group logo beside the Adhesive wordmark.' },
    { id: 2, x: '14%', y: '28%', title: 'The grade', text: 'The K-number is the largest thing on the bag.' },
    { id: 3, x: '50%', y: '45%', title: 'Four promises', text: 'Icons first, words second.' },
    { id: 4, x: '50%', y: '59%', title: 'The job', text: 'Two photos show where this grade belongs.' },
    { id: 5, x: '22%', y: '75%', title: 'The colour field', text: 'Grade colour, wave pattern, net weight.' },
  ],
};

export const back = {
  heading: 'The back is a site manual.',
  lede: 'A mason can follow it without English; a contractor can check the spec in seconds.',
  points: [
    { title: '14-step pictograms', text: 'From clean floor to grout' },
    { title: 'Hindi first', text: 'Name repeated in Devanagari' },
    { title: 'Coverage table', text: 'Area per 20 kg bag, by notch size' },
    { title: 'Compliance block', text: 'Standard, batch, MRP' },
  ],
  spec: ['Type 4, IS 15477:2019', '20 min open time', '3–4 hrs pot life', '20 kg net'],
};

export const results = {
  heading: 'From ₹1.5 Cr to ₹20 Cr.',
  lede: 'Approved by Kamdhenu Group in Gurgaon, then rolled out across central India.',
  figure: '₹20 Cr',
  figureLabel: 'Annual adhesive sales, up from ₹1–1.5 Cr',
  supporting: [{ figure: '₹10 Cr', label: 'a year from Raipur alone' }, { figure: '3+', label: 'markets: Raipur, Nagpur, Bhopal and more' }],
  spread: [
    { name: 'Raipur', note: 'Origin, proven', kind: 'origin' },
    { name: 'Nagpur', note: 'Now selling', kind: 'city' },
    { name: 'Bhopal', note: 'Now selling', kind: 'city' },
    { name: 'More cities', note: 'Across central India', kind: 'more' },
  ],
};

export const role = [
  'Field research with sellers, contractors and masons',
  'Naming: K50, K60, K80, K90',
  'Colour coding by grade',
  'Front-of-pack layout',
  'Back-of-pack pictograms and specs',
  'English and Hindi copy',
  'Approval with Kamdhenu Group HQ',
];

export const listening = {
  round1: {
    who: 'Regional managers, founders and sales teams',
    where: 'Dealer counters and sales reviews',
    learned: ['The range was hard to explain in one line.', 'Customers asked by colour, including the red one.', 'Competitor bags were easier to compare at a glance.'],
  },
  round2: {
    who: 'Contractors and masons',
    where: 'On site and at dealer shops',
    learned: ['They choose by colour.', 'They trust grades like those on steel and cement.', 'They read Hindi first and follow pictures.'],
  },
  interviewCount: '', // TODO_USER: Confirm interview count; leave empty until supplied.
  methods: ['Structured interviews', 'Shelf and site observation', 'Competitor bag comparison'],
};

export const researchFindings = [
  { finding: 'Colour is the shortcut.', designResponse: 'One colour per grade, filling the lower half of the bag.' },
  { finding: 'A number carries trust.', designResponse: 'K50–K90: a rising grade system inspired by TMT steel.' },
  { finding: 'Hindi and pictures lead.', designResponse: 'Hindi on the front. A pictogram site manual on the back.' },
];

export const strategyShift = {
  heading: 'A product line the sales team could finally pitch.',
  points: ['A clear ladder replaced four unrelated names.', 'Each step gave dealers a way to explain the next grade and upsell.', 'The system could extend to new grades and new cities.'],
};
