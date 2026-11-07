import media from './behance-media.json' with { type: 'json' };
import cryptotaxSlides from './cryptotax-images.json' with { type: 'json' };
import yesbotSlides from './yesbot-images.json' with { type: 'json' };

// Full slide decks stored locally (see scripts/optimize-slides.mjs), in slide order, stacked without gaps.
const slideDescriptions = {
  'YesBot.ai case study': [
    'Introduction to the YesBot.ai business-chatbot design case study.',
    'Product overview and responsive website introduction.',
    'Published design process: research, ideation, personas, journeys, wireframes, and collaboration.',
    'The original study’s 100-participant survey and reported priorities; these are source-reported findings.',
    'Feature comparison of chatbot and business-support products.',
    'Responsive device mockups introducing the YesBot.ai visual identity.',
    'Personas documenting goals, challenges, and scenarios in the original study.',
    'User-flow diagrams for connected chatbot-management tasks.',
    'Design foundations: DM Sans typography, purple palette, and icon set.',
    'Reusable components, controls, tables, and cards for the chatbot workspace.',
    'Desktop wireframes for management and configuration screens.',
    'Long-form website wireframe and content hierarchy.',
    'High-fidelity workspace screens, including configuration and conversations.',
    'Dashboard with usage, conversations, sentiment, leads, products, and bot channels; values are interface examples.',
    'Marketing website design describing the chatbot offering.',
    'Pricing-page design with tier comparison; displayed prices are presentation content.',
    'Mobile dashboard and management interface explorations.',
    'Desktop workspace, knowledge-source, and configuration interface variations.',
    'Responsive marketing-website layouts.',
    'Device mockups of dashboard and website designs.',
    'Closing credits and mobile interface mockups.',
  ],
  'CryptoTax case study': [
    'Introduction to cryptocurrency portfolio management and tax-reporting design.',
    'Product overview: wallets, transactions, and reporting in one workspace.',
    'Problem framing: fragmented tracking, manual errors, reporting complexity, and poor usability.',
    'Desktop marketing-page device mockup.',
    'Proposed solution directions in the original study; not verified integration or tax-accuracy results.',
    'Published design-process outline from research to usability testing.',
    'Research questions about portfolio and tax-management experience.',
    'Research rationale: challenges, expectations, key features, and recommendations.',
    'Interview-question and response material as presented in the original case study.',
    'Source-reported survey priorities; these percentages are not product-performance outcomes.',
    'Design foundations: Raleway typography, turquoise palette, and icons.',
    'Personas with goals and challenges from the published narrative.',
    'Competitive feature comparison of cryptocurrency and tax tools.',
    'User-flow diagram connecting sign-in, account creation, transactions, wallets, and reporting.',
    'Desktop account, wallet, and transaction wireframes.',
    'Marketing website wireframe and section hierarchy.',
    'High-fidelity desktop account, transaction, and tax-workflow explorations.',
    'Marketing website design for the cryptocurrency tool.',
    'Pricing-page exploration; displayed amounts are design content.',
    'Mobile portfolio and transaction interface explorations and closing credits.',
  ],
};
const deck = (title, slides) => [{
  id: 'slides', title, description: `The complete ${title}, slide by slide.`,
  images: slides.map((image, index) => ({ ...image, alt: `${slideDescriptions[title]?.[index] || title} (${index + 1} of ${slides.length})` })),
}];

// Slide numbers preserve the order of the original Behance presentations.
const chapter = (source, id, title, description, numbers) => ({
  id, title, description,
  images: numbers.map((number) => ({ ...media[source].images[number - 1], alt: `${title} — original presentation, slide ${number}` })),
});
const all = (source, title, description) => [chapter(source, 'visuals', title, description, media[source].images.map((_, index) => index + 1))];

export const behanceEnrichment = {
  yesbot: {
    sourceUrl: media['case-study-01'].url, sourceLabel: 'Behance', published: 'May 30, 2024', stream: true,
    caseStudy: {
      eyebrow: 'A more human conversation',
      challenge: 'Business support experiences can become fragmented across knowledge sources, conversations, and customer information. YesBot.ai explores how these pieces can come together in a configurable AI-chatbot workspace that is approachable on desktop, tablet, and mobile.',
      approach: [
        { title: 'Listen before designing', text: 'The published study includes a survey of 100 participants, competitor comparisons, personas, and journey exploration to frame the needs of business users.' },
        { title: 'Connect the moving parts', text: 'User flows bring knowledge sources, trigger keywords, conversation handling, and customer context into a connected product structure.' },
        { title: 'Build a shared language', text: 'A DM Sans-based visual system, component library, and wireframes establish consistency before the high-fidelity desktop and mobile screens.' },
      ],
      takeaway: 'The work connects a complex collection of AI-support capabilities through a common visual language and explicit user flows. The original presentation below documents the decisions and interface explorations.',
      chapters: deck('YesBot.ai case study', yesbotSlides),
    },
  },
  cryptotax: {
    sourceUrl: media['case-study-02'].url, sourceLabel: 'Behance', published: 'June 3, 2024', stream: true,
    caseStudy: {
      eyebrow: 'Bringing order to the numbers',
      challenge: 'Cryptocurrency activity is often spread across wallets and exchanges. The case study investigates transaction-tracking complexity, manual errors, tax calculations, regulatory differences, and the difficulty of understanding tax-harvesting opportunities.',
      approach: [
        { title: 'Understand the friction', text: 'Research questions, interviews, survey findings, personas, and competitor comparisons explore how people manage cryptocurrency portfolios and reporting.' },
        { title: 'Make the structure clear', text: 'The user-flow diagrams connect account access, wallet setup, transactions, reporting, and tax-related tasks. Wireframes establish the hierarchy before visual design.' },
        { title: 'Design for everyday clarity', text: 'Raleway typography, a restrained turquoise palette, and shared interface patterns carry through desktop, pricing, marketing, and mobile explorations.' },
      ],
      takeaway: 'The design exploration organizes fragmented financial information around recognizable tasks: connect a wallet, understand activity, and review tax information. The full source material is preserved in the chapters below.',
      chapters: deck('CryptoTax case study', cryptotaxSlides),
    },
  },
  lionlab: {
    title: 'LionLabNFT', client: 'Independent design', sourceUrl: media.lionlab.url, sourceLabel: 'Behance', published: 'March 31, 2024', year: '2024',
    description: 'A visually expressive NFT marketplace exploration, bringing collectible artwork, collection browsing, and marketplace actions together in a dark, gallery-like website.',
    highlights: ['Published as an original Figma UI/UX and website design project.', 'Explores a dark visual environment that puts collectible artwork first.', 'The full original website composition is available below.'],
    caseStudy: {
      challenge: 'Present richly varied collectible artwork in a coherent marketplace experience, while making collection discovery and primary actions easy to find.',
      approach: [{ title: 'Let the artwork lead', text: 'A dark canvas and prominent collectible cards establish the visual focus.' }, { title: 'Create a browsing rhythm', text: 'Repeated cards and grouped website sections provide a consistent structure for discovery.' }, { title: 'Bring the composition together', text: 'Typography, contrast, and accent colors connect the full-page interface.' }],
      chapters: all('lionlab', 'The marketplace', 'The original full-page website design, as published on Behance.'),
    },
  },
  streetsnap: {
    client: 'Independent design', sourceUrl: media.streetsnap.url, sourceLabel: 'Behance', published: 'March 25, 2024', year: '2024',
    description: 'A fashion e-commerce interface exploration for StreetSnap.co, combining editorial imagery, product discovery, and responsive storefront layouts.',
    highlights: ['Designed an editorial storefront with a fashion-led visual hierarchy.', 'Explored product browsing and responsive shopping interfaces.', 'Five original presentation images are included from Behance.'],
    caseStudy: {
      challenge: 'Bring the character of a streetwear brand into a shopping interface without letting the visual expression overwhelm the products and browsing experience.',
      approach: [{ title: 'Set the mood', text: 'The storefront pairs large editorial imagery with a concise brand introduction.' }, { title: 'Put products in reach', text: 'Product imagery and repeatable content patterns support discovery throughout the page.' }, { title: 'Carry it across screens', text: 'The original presentation includes multiple interface compositions and responsive explorations.' }],
      chapters: all('streetsnap', 'The storefront', 'Original StreetSnap.co compositions and interface explorations.'),
    },
  },
  electrawheeler: {
    sourceUrl: media.electrawheeler.url, sourceLabel: 'Behance', published: 'November 27, 2023', year: '2023', role: 'Product Design Intern',
    description: 'Website design created during my internship with ElectraWheeler, an electric-vehicle startup from IIT Madras. The published project documents collaboration with the co-founder and CEO and learning about the electric-bike space.',
    highlights: ['Collaborated directly with the co-founder and CEO during the internship.', 'Explored a website experience introducing electric bikes and the brand.', 'The original full-page website is included from the AkkiDesign02 Behance project.'],
    caseStudy: {
      challenge: 'Introduce an electric-mobility brand and its products in an approachable web experience, while learning the needs of an early-stage EV business.',
      approach: [{ title: 'Learn the context', text: 'Direct collaboration with startup leadership helped ground the design work in the electric-vehicle space.' }, { title: 'Organize the story', text: 'The website moves from a brand introduction into products, supporting information, and company content.' }, { title: 'Make the journey tangible', text: 'The original design uses product imagery and clearly separated sections to communicate the offering.' }],
      chapters: all('electrawheeler', 'The original website', 'The full website composition published as AkkiDesign02 on Behance.'),
    },
  },
};

export const behanceProjects = [
  {
    id: 'cypherwallet', title: 'CypherWallet', subtitle: 'A clearer home for digital assets.', client: 'Independent design', category: 'Wallet Interface', group: 'products', year: '2024',
    role: 'UI/UX Designer', scope: 'Wallet interface exploration', sourceUrl: media.cypherwallet.url, sourceLabel: 'Behance', published: 'March 25, 2024',
    description: 'A digital-wallet interface exploration covering account setup, asset balances, transfers, and connected-account management across compact and expanded layouts.',
    highlights: ['Account creation and existing-wallet entry points.', 'Token balances, wallet actions, and transaction states.', 'Account selection and connected-account management.'], tags: ['Fintech', 'Interaction design'],
    caseStudy: {
      challenge: 'Make important wallet tasks legible in a compact interface: create or connect an account, understand asset balances, and move through a transaction with clear feedback.',
      approach: [{ title: 'Start with the account', text: 'The first composition establishes clear options for creating or importing a wallet.' }, { title: 'Prioritize key actions', text: 'Balances, assets, and wallet actions become the center of the main interface.' }, { title: 'Close the feedback loop', text: 'Account selection and transfer confirmation states help complete the interaction story.' }],
      chapters: all('cypherwallet', 'Wallet interactions', 'Four original interface compositions, preserved from Behance.'),
    },
  },
  {
    id: 'ipl24', title: 'IPL ’24', subtitle: 'A little match-day energy, on screen.', client: 'Independent design', category: 'Sports Website', group: 'websites', year: '2024',
    role: 'UI/UX Designer', scope: 'Sports website exploration', sourceUrl: media.ipl24.url, sourceLabel: 'Behance', published: 'March 31, 2024',
    description: 'A cricket website exploration bringing player-led stories, match information, news, and video content into an energetic, dark-themed editorial experience.',
    highlights: ['A series of player-led hero treatments.', 'Content modules for news, upcoming matches, and videos.', 'A complete long-form website composition.'], tags: ['Editorial design', 'Sports experience'],
    caseStudy: {
      challenge: 'Balance the energy of match-day storytelling with the structure needed to browse news, fixtures, videos, and league information.',
      approach: [{ title: 'Lead with the moment', text: 'Player imagery and prominent headlines bring the latest story into focus.' }, { title: 'Build an editorial rhythm', text: 'Reusable news, fixture, and video modules organize the content below the hero.' }, { title: 'Explore the variations', text: 'Six hero treatments and the complete website composition document the visual exploration.' }],
      chapters: [chapter('ipl24', 'heroes', 'Hero explorations', 'Six variations on the match-day story.', [1, 2, 3, 4, 5, 6]), chapter('ipl24', 'website', 'The complete website', 'The original full-page design.', [7])],
    },
  },
  {
    id: 'cfc', title: 'Code For Community', subtitle: 'A digital home for a community of builders.', client: 'Code For Community', category: 'Community Website', group: 'websites', year: '2023',
    role: 'Product / Web Designer', scope: 'Community website design', sourceUrl: media.cfc.url, sourceLabel: 'Behance', published: 'May 29, 2023',
    description: 'The CFC website design brings a student coding community’s identity and activities into a single digital presence. The original Figma website composition was published on Behance in May 2023.',
    highlights: ['An original community-focused website design.', 'A long-form page structure with distinct content sections.', 'Published under UI/UX, Figma, and website design.'], tags: ['Community', 'Web design'],
    caseStudy: {
      challenge: 'Give a community of student builders a coherent home online, with a visual identity and page structure that can accommodate its different activities.',
      approach: [{ title: 'Introduce the community', text: 'The opening section sets the tone for the group and its digital presence.' }, { title: 'Structure the content', text: 'Clearly separated sections organize the original long-form website.' }, { title: 'Make it feel connected', text: 'A shared color palette and repeatable interface patterns unify the composition.' }],
      chapters: all('cfc', 'The community website', 'The original full-page CFC website design from Behance.'),
    },
  },
];
