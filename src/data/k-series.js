import images from './k-series-images.json';

export const kSeriesImages = images;
export const kSeriesPath = '/work/kamdhenu-k-series';

export const kSeriesCard = {
  id: 'kamdhenu-k-series',
  href: kSeriesPath,
  client: 'KAMDHENU ADHESIVE',
  category: 'PACKAGING & NAMING',
  title: 'K-Series',
  image: '/assets/Kseries.png',
  subtitle: 'Four numbers and four colours that turned a tile adhesive range into something masons can pick off the shelf.',
};

export const kSeriesHero = {
  title: 'K-Series',
  subtitle: 'How four numbers and four colours turned Kamdhenu Adhesive into a range masons can pick off the shelf without reading a word.',
  meta: ['Packaging and naming system', 'Kamdhenu Adhesive', 'Role: Lead Product Designer'],
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
    use: 'Everyday ceramic tiles on floors and walls. The entry point of the range.',
    colourNote: 'Warm and approachable for the everyday grade.',
    frontNote: 'K50 shows trowelled adhesive and ceramic floor tiles going down: the everyday job.',
  },
  {
    id: 'k60', code: 'K60', colour: '#E1BE00', ink: '#282828',
    english: 'Superior Floor & Wall Tile Adhesive',
    hindi: 'सुपीरियर फ्लोर एंड वॉल टाइल एडेसिव',
    use: 'Vitrified tiles in bathrooms and kitchens, where water and traffic test the bond.',
    colourNote: 'A step brighter, matching Kamdhenu’s own logo yellow.',
    frontNote: 'K60 shows glossy vitrified tiles in a bathroom, where water resistance matters.',
  },
  {
    id: 'k80', code: 'K80', colour: '#C8161D', ink: '#ffffff',
    english: 'Superior Tile & Stone Adhesive',
    hindi: 'सुप्रीम टाइल एंड स्टोन एडेसिव',
    use: 'Heavier tiles and natural stone, including marble-look slabs on counters and walls.',
    colourNote: 'The brand red, signalling serious strength for stone.',
    frontNote: 'K80 shows marble-look slabs pressed onto a counter and a wall: tile and stone.',
  },
  {
    id: 'k90', code: 'K90', colour: '#0B4A98', ink: '#ffffff',
    english: 'Paramount Tile & Stone Adhesive',
    hindi: 'पैरामाउंट टाइल एंड स्टोन एडेसिव',
    use: 'Large-format slabs and vertical stone cladding. The top of the range.',
    colourNote: 'The deepest colour for the premium grade, taken from the logo’s blue.',
    frontNote: 'K90 shows large slabs being fixed to a vertical wall: the hardest job in the range.',
  },
];

export const problem = {
  heading: 'Every adhesive bag on the counter looked the same.',
  paragraphs: [
    'Kamdhenu Adhesive was entering a market crowded with grey-and-white sacks. Each brand had several grades, each grade had a long technical name, and they all sat in the same dusty stack at the dealer’s shop.',
    'The result was predictable. Dealers handed over whatever was on top. Masons used a basic adhesive under heavy vitrified tiles and stone, and when a tile came loose, the brand took the blame. Kamdhenu’s name carried trust from steel and pipes, but the adhesive range had no way to show which bag was meant for which job.',
  ],
  caption: 'Take the colour and the number away and four very different products become one anonymous stack. That was the shelf we had to win.',
};

export const buyer = {
  heading: 'The real customer holds a trowel, not a brochure.',
  intro: 'Homeowners pay for tile adhesive, but masons and contractors decide which bag gets opened. I spent time at dealer counters and on site to see how they choose.',
  columns: [
    { title: 'They choose by colour', text: 'A mason asks for “the red one” or “the blue one”. Colour is remembered after a single job; product names are not.' },
    { title: 'They trust a number', text: 'Builders already compare cement and steel by grade. A higher number reads as a stronger product with no explanation needed.' },
    { title: 'They read Hindi first', text: 'Instructions in English technical language get skipped. Pictures and Hindi get followed, even with wet hands and a mixer running.' },
  ],
};

export const insight = {
  heading: 'Kamdhenu had already taught builders to trust a grade.',
  paragraphs: [
    'Kamdhenu built its name on TMT bars, where every contractor picks steel by its grade number. I gave the adhesive range the same logic: a K for Kamdhenu, and a number that rises with performance.',
    'No new vocabulary for the market to learn. A mason who knows Kamdhenu steel already understands that K90 is stronger than K50.',
  ],
};

export const naming = {
  heading: 'Climb the number, climb the job.',
  axis: ['Lighter tiles, floors', 'Heavier stone, walls and facades'],
};

export const colour = {
  heading: 'One colour per grade, filling the lower half of the bag.',
  text: 'The bottom of every bag is a solid field of its grade colour, carrying the same wave pattern. Stacked on a pallet or in a dealer’s godown, each grade forms its own colour block that can be spotted from the door.',
};

export const front = {
  heading: 'Read from top to bottom in three seconds.',
  pins: [
    { id: 1, x: '50%', y: '14%', title: 'Two marks of trust', text: 'Kamdhenu Group’s gear logo sits beside the Kamdhenu Adhesive wordmark, so the group’s reputation carries straight into a new category.' },
    { id: 2, x: '14%', y: '28%', title: 'The grade, at display size', text: 'The K-number is the largest thing on the bag, with the product name set beside it.' },
    { id: 3, x: '50%', y: '45%', title: 'Four promises', text: 'Ready to use, saves time, high strength, durability. Icons first, words second.' },
    { id: 4, x: '50%', y: '59%', title: 'A window onto the job', text: 'Two photographs show exactly where this grade belongs, so the bag explains itself.' },
    { id: 5, x: '22%', y: '75%', title: 'The colour field', text: 'The grade colour, the wave pattern and the net weight in white.' },
  ],
};

export const back = {
  heading: 'Fourteen pictures, from clean floor to grout.',
  text: 'The back of every K-Series bag works as a site manual. A mason can follow it without reading English, and a contractor can check the specification in seconds.',
  points: [
    { title: 'A 14-step pictogram guide', text: 'Cleaning, water ratio, mixing, resting time, notching, back-buttering, twisting the tile, 24-hour wait and grouting.' },
    { title: 'Bilingual identity', text: 'The product name repeats in Devanagari at the top, so Hindi readers see their language first.' },
    { title: 'Trowel and coverage table', text: 'Notch sizes with the area one 20 kg bag covers, which helps contractors estimate quantity before buying.' },
    { title: 'Compliance in one block', text: 'Standard, open time, adjustment time, shelf life, and a clear box for batch, MRP and unit price.' },
  ],
  spec: ['Type 4, IS 15477:2019', '20 min open time', '3–4 hrs pot life', '20 kg net'],
};

export const approval = {
  heading: 'Approved at Kamdhenu Group headquarters.',
  text: 'The K-Series was designed in Raipur for Kamdhenu Adhesive, marketed by Patcorn Drymix. The complete system, names, colours and both sides of all four bags, went to Kamdhenu Group’s head office in Cyber City, Gurgaon, and was approved as the face of the adhesive range.',
  steps: [
    { title: 'Raipur', text: 'Naming, colour system and bag artwork designed and refined with the sales team and dealers.' },
    { title: 'Cyber City, Gurgaon', text: 'Reviewed by Kamdhenu Group headquarters against the group’s brand standards.' },
    { title: 'Approved', text: 'Adopted for the full K-Series and taken to market under the Kamdhenu Group mark.' },
  ],
};

export const results = {
  heading: 'The range is now selling beyond Raipur.',
  figure: '₹10 Cr',
  figureLabel: 'Yearly sales of K-Series bags in Raipur alone.',
  text: 'Dealers and masons now ask for the range by number and colour. With Raipur proven, the same bags have moved into Nagpur, Bhopal and more cities across central India.',
  spread: [
    { name: 'Raipur', note: 'Origin, proven', kind: 'origin' },
    { name: 'Nagpur', note: 'Now selling', kind: 'city' },
    { name: 'Bhopal', note: 'Now selling', kind: 'city' },
    { name: 'More cities', note: 'Across central India', kind: 'more' },
  ],
};

export const founder = {
  label: 'The person behind the brand',
  heading: 'Sunil Agrawal, Founder, Kamdhenu Group',
  paragraphs: [
    'Sunil Agrawal is the founder of Kamdhenu Group, the company behind Kamdhenu TMT bars. Kamdhenu TMT is one of the most recognised names in Indian construction, and the group, headquartered in Cyber City, Gurgaon, has since grown into paints, structural products and, with Kamdhenu Adhesive, tile adhesives.',
    'For a founder who built his brand on grades that contractors trust, the K-Series naming logic was a natural fit. Seeing him approve it and put his name to it on the brochure was the moment the work felt complete.',
  ],
  facts: [
    { label: 'Headquarters', value: 'Cyber City, Gurgaon' },
    { label: 'Known for', value: 'Kamdhenu TMT bars' },
  ],
};

export const recognition = {
  heading: 'Recognised by the founder of Kamdhenu Group.',
  text: 'At the group’s biggest event, in front of the K-Series launch stand, founder Sunil Agrawal recognised me for the work, congratulated me in person and signed the K-Series product brochure.',
  quote: 'All the best for Adhesive.',
  quoteCaption: 'Handwritten by Sunil Agrawal on the K-Series brochure.',
  figures: [
    { key: 'me-and-sunil', caption: 'With Sunil Agrawal at the K-Series display.', alt: 'Ankit Chandrakar and Sunil Agrawal standing together at an evening event, with K50 and K60 signage behind them.' },
    { key: 'signed-brochure', caption: 'The signed product brochure.', alt: 'The K-Series product brochure with a handwritten message and signature from Sunil Agrawal.' },
  ],
};

export const role = {
  heading: 'A product range people can read at a glance.',
  text: 'I took the K-Series from a set of unnamed formulations to an approved, selling range. The work was never just four pretty bags; it was a system that tells dealers what to stock, masons what to use and Kamdhenu what to build next.',
  deliverables: [
    ['Naming architecture', 'K50, K60, K80, K90'],
    ['Colour coding', 'orange, yellow, red, blue'],
    ['Front layout', 'trust marks, grade, promises, use case'],
    ['Back of pack', '14-step pictograms, specs, compliance'],
    ['Bilingual copy', 'English and Hindi'],
    ['Approval', 'Kamdhenu Group HQ, Gurgaon'],
    ['Outcome', '₹10 Cr yearly in Raipur, now multi-city'],
  ],
};
