// Your portfolio's single source of truth. Résumé dates take precedence over the older Notion page.
import { behanceEnrichment, behanceProjects } from './case-studies.js';
const notion = 'https://ankitchandrakar.notion.site/Ankit-Chandrakar-2017005b2f704fceb52bd95dd15e755c';
const deck = 'https://ankitchandrakar.notion.site/Check-Out-My-Short-Sweet-Portfolio-207babe469f544ac904082668f82191e';
const asset = (name) => `/assets/ankit/${name}`;
const slide = (number) => asset(`notion-slide-${String(number).padStart(2, '0')}.webp`);
const optimizedCover = (name, width = 1200, height = 860) => ({
  image: `/assets/optimized/${name}.webp`,
  thumbnailSrcSet: `/assets/optimized/${name}-640.webp 640w, /assets/optimized/${name}-960.webp 960w, /assets/optimized/${name}.webp ${width}w`,
  imageWidth: width,
  imageHeight: height,
});

export const profile = {
  name: 'Ankit',
  fullName: 'Ankit Chandrakar',
  brand: 'Ankit Chandrakar',
  email: 'chandrakarankit014@gmail.com',
  phone: '+91 6260906952',
  telephone: '+916260906952',
  website: 'https://ankitchandrakar.in',
  notion,
  resume: '/Ankit_Chandrakar_Senior_Product_Designer_Resume.pdf',
  announcement: 'Thoughtful products. A little curiosity. A lot of care.',
  headline: 'Ankit Chandrakar is a product designer who designs & codes </>',
  introduction: 'A Lead Product Designer turning complex workflows into thoughtful digital experiences.',
  role: 'Lead Product Designer',
  bio: 'I’m Ankit Chandrakar, a product designer with a computer science foundation and 2+ years of experience across enterprise SaaS, AI-powered products, privacy technology, and design systems. I connect user needs, business goals, and engineering to take products from the first question to the final interaction.',
  philosophy: 'A little structure for the complex. A little personality for the everyday.',
  contact: 'Have a complex product challenge, a new idea, or a team that cares about good design? Send me a note. Let’s make something thoughtful together.',
  companies: ['Nyusta', 'Patcorn Drymix', 'Kamdhenu Group', 'WhatCode'],
  stats: [],
  socials: [
    { name: 'LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/in/ankit-chandrakar-001akki/' },
    { name: 'Behance', icon: 'behance', url: 'https://www.behance.net/ankitchandrakar1' },
    { name: 'X', icon: 'x', url: 'https://twitter.com/akki_ankiiit' },
  ],
  resources: [
    { title: 'The full picture', description: 'Projects, case studies, and a few experiments from my Notion portfolio.', url: notion, label: 'Explore my Notion', icon: 'books' },
    { title: 'A visual collection', description: 'A closer look at the interfaces and visual work I share on Behance.', url: 'https://www.behance.net/ankitchandrakar1', label: 'Visit Behance', icon: 'behance' },
    { title: 'Let’s connect', description: 'Find me on LinkedIn to talk product design, collaboration, and what comes next.', url: 'https://www.linkedin.com/in/ankit-chandrakar-001akki/', label: 'Say hello on LinkedIn', icon: 'linkedin' },
  ],
};

export const imagery = {
  logo: '/assets/newlogo/navbar-logo.svg',
  mark: asset('monogram.svg'),
  hero: '/assets/newlogo/image.webp',
  heroSmall: '/assets/newlogo/image.webp',
  portrait: '/assets/optimized/image_6.webp',
  headphones: asset('ink-headphones.svg'),
  sketchbook: asset('ink-sketchbook.svg'),
  sneaker: asset('ink-sneaker.svg'),
  companion: asset('ink-robot.svg'),
};

export const categories = [
  { id: 'case-studies', label: 'Case Studies', folder: '/assets/imagery/folder-beige.webp' },
  { id: 'websites', label: 'Websites', folder: '/assets/imagery/folder-slate.webp' },
  { id: 'design-systems', label: 'Design Systems', folder: '/assets/imagery/folder-terracotta.webp' },
  { id: 'packaging-designs', label: 'Packaging designs', folder: '/assets/imagery/folder-brown.webp' },
  { id: 'brand-design', label: 'Brand Design', folder: '/assets/imagery/folder-plum.webp' },
];

export const artworks = [
  { id: 'feedusbitch', title: 'Feed Us Bitch', year: '2025', image: '/assets/work/art/2025-feedusbitch.webp', width: 800, height: 800, col: 0 },
  { id: 'bs-kitchen', title: 'Kitchen Stories', year: '2025', image: '/assets/work/art/2025-bs-kitchen.webp', width: 800, height: 604, col: 0 },
  { id: 'flash', title: 'Flash & Locker Room', year: '2025', image: '/assets/work/art/2025-flash.webp', width: 800, height: 1067, col: 0 },
  { id: 'goose', title: 'Goose in the Pond', year: '2023', image: '/assets/work/art/2023-goose.webp', width: 800, height: 800, col: 1 },
  { id: 'neyomi-hop', title: 'Neyomi — Hopper x Noru', year: '2025', image: '/assets/work/art/2025-neyomi-hop.webp', width: 800, height: 1135, col: 1 },
  { id: 'bs-movie', title: 'Movie Night', year: '2025', image: '/assets/work/art/2025-bs-movie.webp', width: 800, height: 999, col: 2 },
  { id: 'bs-locker', title: 'Golden Hour', year: '2025', image: '/assets/work/art/2025-bs-locker.webp', width: 800, height: 608, col: 2 },
  { id: 'kdh-zoey', title: 'K-Pop Demon Hunters: Zoey', year: '2026', image: '/assets/work/art/2026-kdh-zoey.webp', width: 800, height: 1066, col: 2 },
  { id: 'kdh-mira', title: 'K-Pop Demon Hunters: Mira', year: '2026', image: '/assets/work/art/2026-kdh-mira.webp', width: 800, height: 1066, col: 3 },
  { id: 'reena', title: 'Reena', year: '2025', image: '/assets/work/art/2025-reena.webp', width: 800, height: 800, col: 3 },
];

export const designProjects = [
  {
    id: 'bondure',
    client: 'BONDURE',
    category: 'PACKAGING DESIGN',
    title: 'BONDURE',
    image: '/assets/Bondure.webp',
    locked: true,
    year: 'Coming soon',
    role: 'Packaging Designer',
    scope: 'Packaging design',
    description: 'Packaging design for BONDURE. The full project write-up and imagery are coming soon.',
    highlights: [
      'Packaging design for the BONDURE range.',
      'Full case study and imagery to be added.',
    ],
  },
];

const existingProjects = [
  {
    id: 'neostra', title: 'Neostra', subtitle: 'Privacy, without the complexity.',
    href: '/work/neostra',
    client: 'Nyusta', category: 'Enterprise SaaS', group: 'products', year: '2024 — Present',
    image: asset('project-neostra.webp'), visualType: 'concept',
    role: 'Lead Product Designer', scope: 'Discovery → implementation',
    description: 'End-to-end product design for a scalable privacy compliance platform. I translated complex privacy requirements into enterprise workflows, partnering with founders, product managers, developers, and customers throughout delivery.',
    highlights: ['Designed 30+ enterprise workflows and 200+ reusable design-system components.', 'Designed Privacy Portal, DSAR Management, Cookie Consent, Preference Center, Data Mapping, Privacy Assessments, and Administration.', 'Owned research, information architecture, prototypes, developer handoff, and implementation reviews.'],
    tags: ['Privacy technology', 'UX strategy', 'Design systems'],
  },
  {
    id: 'yesbot', title: 'YesBot.ai', subtitle: 'A more human way to build with AI.',
    client: 'WhatCode', category: 'AI Product Design', group: 'products', year: '2024',
    image: asset('project-yesbot.webp'), visualType: 'original', gallery: [7, 8, 9, 10, 11, 12].map(slide),
    role: 'Product Designer', scope: 'Research, UX/UI & prototyping', sourceUrl: deck,
    description: 'A business chatbot platform designed to streamline operations and improve customer engagement. The experience brings knowledge sources, trigger keywords, conversations, and customer context into one workspace.',
    highlights: ['The published case study documents a survey of 100 participants, exploring ease of use, accuracy, customization, and integrations.', 'Designed knowledge-base flows for websites, files, Notion, and Google Drive.', 'Explored trigger-keyword workflows, conversation analysis, customer information, and responsive interfaces.'],
    tags: ['Conversational AI', 'Research', 'Interaction design'],
  },
  {
    id: 'cryptotax', title: 'CryptoTax', subtitle: 'Less tax friction. More clarity.',
    client: 'WhatCode', category: 'Fintech', group: 'products', year: '2023',
    image: asset('project-cryptotax.webp'), visualType: 'original', gallery: [3, 4, 5, 6].map(slide),
    role: 'Product Designer', scope: 'Research → responsive product', sourceUrl: deck,
    description: 'A cryptocurrency portfolio and tax-reporting platform focused on simplifying wallet tracking, transaction management, and tax workflows across desktop and mobile.',
    highlights: ['Investigated fragmented transaction tracking, manual processes, and the difficulty of understanding tax obligations.', 'Mapped a workflow connecting research, accounts, wallet details, and buy/sell activity.', 'Designed account summaries, transaction tables, wallet connections, and tax-harvesting interfaces.'],
    tags: ['Fintech', 'Information architecture', 'Responsive UX'],
  },
  {
    id: 'tejas', title: 'The Tejas ecosystem', subtitle: 'Five products. One shared language.',
    client: 'Patcorn Drymix', category: 'Business Products', group: 'products', year: '2025 — Present',
    image: asset('project-tejas.webp'), visualType: 'concept',
    role: 'Design Consultant', scope: 'Multi-product strategy & delivery',
    description: 'Designed and launched five internal business products serving sales teams, contractors, dealers, and operations. The Tejas ecosystem brings Chiraag, Tejas Captain, ContractorBhai, Helix.labs, and Adhikar together through shared product standards.',
    highlights: ['Led UX strategy and product design across all five products.', 'Worked with business leadership on product vision, journeys, workflows, and feature roadmaps.', 'Established reusable components and supported the ecosystem with branding, websites, presentations, and product identities.'],
    tags: ['Construction technology', 'Business workflows', 'Product strategy'],
  },
  {
    id: 'thanq', title: 'ThanQ', subtitle: 'Better questions. Better experiences.',
    client: 'Nyusta', category: 'UX Research', group: 'products', year: 'From the Notion portfolio',
    image: asset('project-thanq.webp'), visualType: 'concept', sourceUrl: notion,
    role: 'Product Designer', scope: 'UX research & recommendations',
    description: 'The Notion portfolio documents UX research and case-study work for Nyusta’s ThanQ app, alongside design and development guidance focused on cohesive, user-centered experiences.',
    highlights: ['Conducted UX research and documented the product experience.', 'Shared UX recommendations and strategic insights with design and development teams.', 'Aligned product-design recommendations with user needs and business objectives.'],
    tags: ['UX research', 'Product discovery', 'Collaboration'],
  },
  {
    id: 'kamdhenu', title: 'Kamdhenu digital experiences', subtitle: 'Connecting business to the people on site.',
    client: 'Kamdhenu Group', category: 'CRM & Loyalty', group: 'products', year: '2024',
    image: asset('project-kamdhenu.webp'), visualType: 'concept',
    role: 'Junior Product Designer', scope: 'Product, web & brand experiences',
    description: 'Digital products spanning dealer engagement, contractor loyalty, sales enablement, and internal business platforms, developed in collaboration with product, engineering, sales, and marketing.',
    highlights: ['Designed interfaces for dealer management and loyalty programs.', 'Contributed to product branding, campaigns, websites, and scalable design assets.', 'Earlier Notion work also documents a CRM map helping relationship managers find contractors near a site.'],
    tags: ['Dealer management', 'Loyalty', 'Sales enablement'],
  },
  ...[
    { id: 'jd-institute', title: 'JD Institute of Fashion Technology', subtitle: 'A digital introduction to creative education.', category: 'Education Website', client: 'Notion portfolio' },
    { id: 'lionlab', title: 'LionLabNFTs', subtitle: 'An expressive home for digital collectibles.', category: 'NFT Marketplace', client: 'Notion portfolio' },
    { id: 'streetsnap', title: 'StreetSnap.co', subtitle: 'Where fashion meets the streets.', category: 'Fashion E-commerce', client: 'Notion portfolio' },
    { id: 'electrawheeler', title: 'ElectraWheeler', subtitle: 'Making electric mobility feel approachable.', category: 'EV Website', client: 'ElectraWheeler' },
    { id: 'acetech', title: 'Acetech', subtitle: 'A colorful, welcoming web experience.', category: 'Website Design', client: 'Notion portfolio' },
  ].map((project) => ({
    ...project, group: 'websites', year: 'Selected earlier work', role: 'Product / Web Designer',
    scope: 'Website interface design', image: asset(`project-${project.id}.webp`), visualType: 'original',
    sourceUrl: deck, gallery: [slide(13)],
    description: `${project.title} is featured in my published Notion portfolio’s collection of website work. The original design appears in the presentation slide below.`,
    highlights: ['Original website design sourced from the published portfolio.', 'Explore the source slide below for the project in its original presentation.'],
    tags: ['Web design', 'Visual design', 'Original portfolio work'],
  })),
  ...[
    { id: 'blackspace', title: 'Blackspace', subtitle: 'A bold, dark-mode web presence.', category: 'Website Design', embedUrl: 'https://www.blackspace.media/', context: ['Blackspace is a creative studio in Bengaluru, established in 2023, making content, film and brand work.', 'The team writes, shoots, cuts and ships content campaigns, scripts, edits and brand work, with AI handling much of the preparation.', 'The website puts that process front and centre: work, services and contact sit in a single bold interface, with playful cards that show each stage of a project.'] },
    // { id: 'azure-interiors', title: 'Azure Interiors', subtitle: 'A calm, elegant home for interior design.', category: 'Website Design', embedUrl: 'https://azure-interior.vercel.app/' },
    { id: 'atlas', title: 'Atlas', subtitle: 'A warm, exploratory web experience.', category: 'Website Design' },
    { id: 'golf-mill', title: 'The Golf Mill', subtitle: 'Tee times and the game, a click away.', category: 'Website Design', embedUrl: 'https://thegolfmill.in/' },
  ].map((project) => ({
    ...project, client: 'Selected work', group: 'websites', year: 'Selected work', role: 'Web Designer',
    scope: 'Website interface design',
    description: `Website design for ${project.title}: layout, visual language, and responsive interface design.`,
    highlights: ['Designed the site structure, layouts, and responsive interface.', 'Defined the visual language: typography, color, and imagery.'],
    tags: ['Web design', 'Visual design'],
  })),
  ...[
    { id: 'adhikar', title: 'Adhikar', subtitle: 'A business tool from the Tejas ecosystem.', appCover: optimizedCover('Adhikar') },
    { id: 'contractorbhai', title: 'ContractorBhai', subtitle: 'Every relationship. A little more personal.', href: '/work/contractorbhai' },
    { id: 'helix', title: 'Helix.labs', subtitle: 'A workflow app from the Tejas ecosystem.', embedUrl: 'https://helixlab-one.vercel.app/projects', thumbnailVideo: { src: '/assets/video/Helix-clean.mp4', width: 1120, height: 800, poster: '/assets/video/Helix-clean-poster.webp' } },
  ].map((project) => ({
    ...project, client: 'Tejas', category: 'Internal App', group: project.id === 'helix' ? 'websites' : 'products', year: '2025 — Present',
    role: 'Design Consultant', scope: 'Product design within the Tejas ecosystem',
    description: `${project.title} is one of the internal business products designed and launched as part of the Tejas ecosystem.`,
    highlights: ['Designed the product experience within the shared Tejas standards.', 'Built on the reusable components used across the ecosystem.'],
    tags: ['Business workflows', 'Product design'],
  })),
  {
    id: 'neostra-system', title: 'Neostra design system', subtitle: 'Consistency, built into every interaction.',
    embedUrl: 'https://design.penpot.app/?screen=viewer&file-id=2bd3d7f1-914f-8188-8008-dd279008f96c&page-id=6188061b-c672-80ce-8008-a55672bc5fb1&section=interactions&frame-id=1e5ac49f-73a5-805a-8008-a5681f884b8c&index=0&interactions-mode=show-on-click&share-id=afdfee27-b9c2-42ed-b7e6-96fa5e01fea9',
    embedLabel: 'Shared Penpot file preview',
    embedLinkLabel: 'Open interactive Penpot file ↗',
    embedPreview: {
      src: asset('neostra-penpot-preview.webp'),
      alt: 'Neostra — Design system V1 in Penpot: Privacy, with clarity, with the green #29BD8E accent and DM Sans + Crimson Pro typography.',
      width: 1440,
      height: 1000,
      note: 'Penpot opens in a new tab',
    },
    context: ['Explore the components, foundations and patterns in the shared Penpot file.'],
    client: 'Nyusta', category: 'Design System', group: 'systems', year: '2024 — Present',
    image: asset('project-neostra-system.webp'), visualType: 'concept',
    role: 'Lead Product Designer', scope: 'Components, patterns & documentation',
    description: 'A reusable design foundation for a complex enterprise privacy platform, connecting interface components, interaction patterns, accessibility guidance, and implementation documentation.',
    highlights: ['Created 200+ reusable components as part of Neostra’s product design.', 'Defined scalable interaction patterns and accessibility guidelines.', 'Documented standards and reviewed implementation quality with engineering.'],
    tags: ['Component architecture', 'Accessibility', 'DesignOps'],
  },
  ...[
    {
      section: 'DSAR',
      embedUrl: 'https://embed.figma.com/design/ga0hmHb684QwqMCtH3PoAA/-Neostra_DSAR_?node-id=2614-2&embed-host=share',
      fileUrl: 'https://www.figma.com/design/ga0hmHb684QwqMCtH3PoAA/-Neostra_DSAR_?node-id=2614-2&t=dIAjoHN0tN0YnrPV-1',
    },
    {
      section: 'CPMP',
      embedUrl: 'https://embed.figma.com/design/KJ1Dc0jkNsM6XetA5heLBy/-Neostra_CPMP_?node-id=2487-5539&embed-host=share',
      fileUrl: 'https://www.figma.com/design/KJ1Dc0jkNsM6XetA5heLBy/-Neostra_CPMP_?node-id=2487-5539&t=1G9wGlZHkDzY5JYa-1',
    },
  ].map(({ section, embedUrl, fileUrl }) => ({
    id: `neostra-${section.toLowerCase()}`, title: `Neostra : ${section}`, subtitle: `${section} design system.`,
    embedType: 'figma', embedUrl, fileUrl, embedLabel: 'Figma design system',
    client: 'Nyusta', category: 'Design System', group: 'systems', year: '2024 — Present',
    image: asset('project-neostra-system.webp'), visualType: 'original',
    role: 'Lead Product Designer', scope: `${section} design system`,
    description: `Explore the Neostra ${section} design system in its original Figma file. Pan and zoom in the viewer, or open the file in Figma for a closer look.`,
    highlights: [`Dedicated ${section} design-system folder within Neostra.`],
    tags: ['Neostra', section],
  })),
  {
    id: 'tejas-system', title: 'One Tejas, many touchpoints', subtitle: 'A common foundation for a growing ecosystem.',
    client: 'Patcorn Drymix', category: 'Product & Brand System', group: 'systems', year: '2025 — Present',
    image: asset('project-tejas-system.webp'), visualType: 'concept',
    role: 'Design Consultant', scope: 'Shared standards & brand identity',
    description: 'A unified design system across five business products, complemented by product identity, marketing design, websites, and presentations for the Tejas brand portfolio.',
    highlights: ['Established reusable design components and shared product standards.', 'Maintained consistency across multiple internal platforms.', 'Connected product experiences with the wider Tejas brand portfolio.'],
    tags: ['Design systems', 'Brand experience', 'Multi-product design'],
  },
];

const cardThumbnails = {
  neostra: {
    image: '/assets/Neostra_Brand.webp',
    imageWidth: 1481,
    imageHeight: 1062,
  },
  yesbot: optimizedCover('YesBot'),
  cryptotax: optimizedCover('CryptoTaxx'),
  tejas: '/assets/thumbnails/case-study-tejas.webp',
  thanq: {
    image: '/assets/ThanQ.webp',
    imageWidth: 1481,
    imageHeight: 1062,
  },
  'neostra-system': optimizedCover('Neo', 1032, 740),
  'neostra-dsar': {
    image: '/assets/DSAR.webp',
    imageWidth: 1481,
    imageHeight: 1062,
  },
  'neostra-cpmp': {
    image: '/assets/CPMP.webp',
    imageWidth: 1481,
    imageHeight: 1062,
  },
  blackspace: '/assets/thumbnails/website-blackspace-hero.webp',
  // 'azure-interiors': optimizedCover('azure', 1032, 740),
  atlas: optimizedCover('Atlas', 1032, 740),
  'golf-mill': '/assets/thumbnails/website-the-golf-mill-hero.webp',

  adhikar: '/assets/thumbnails/case-study-tejas.webp',
  contractorbhai: {
    image: '/assets/contractorbhai_thumbnail.webp',
    imageWidth: 1481,
    imageHeight: 1062,
  },
  helix: {
    image: '/assets/video/Helix-clean-poster.webp',
    imageWidth: 1120,
    imageHeight: 800,
  },
};

export const projects = [...existingProjects.map((project) => ({ ...project, ...behanceEnrichment[project.id] })), ...behanceProjects].map((project) => ({
  ...project,
  ...(typeof cardThumbnails[project.id] === 'object'
    ? cardThumbnails[project.id]
    : { image: cardThumbnails[project.id] || asset(`ink-${project.id}.webp`) }),
  sourceLabel: project.sourceLabel || (project.sourceUrl ? 'Notion' : undefined),
  caseStudy: project.caseStudy || {
    challenge: project.description,
    approach: project.highlights.map((text, index) => ({ title: ['The product scope', 'The design contribution', 'Working together'][index] || 'The detail', text })),
    chapters: project.gallery ? [{ id: 'original', title: 'Original portfolio material', description: 'The original presentation from my Notion portfolio.', images: project.gallery.map((src, index) => ({ src, width: 1600, height: 900, alt: `${project.title} — portfolio presentation ${index + 1}` })) }] : [],
  },
}));

export const experience = [
  { company: 'Nyusta', role: 'Lead Product Designer', period: 'Nov 2024 — Present', location: 'Bengaluru', description: 'Led end-to-end product design for Neostra, a privacy management platform, and delivered UX/UI, branding, design systems, websites, and digital experiences for The Golf Mill, ThanQ, Blackspace, and multiple client projects, driving scalable, user-centric solutions across diverse industries.' },
  { company: 'Tejas', role: 'Design Consultant', period: 'Sep 2025 — Present', location: 'Raipur', description: 'Designed and launched five internal business products at Patcorn Drymix for the Tejas ecosystem, including Helix.labs, ContractorBhai, Adhikar, and Chiraag. Defined a unified design system, led product and brand experiences, and designed websites, sales-enablement assets, and workflows for dealer engagement, contractor loyalty, and business operations.' },
  { company: 'Kamdhenu Group', role: 'Junior Product Designer', period: 'May 2024 — Nov 2024', location: 'Gurgaon', description: 'Designed dealer-engagement, contractor-loyalty, and business interfaces, with supporting websites, campaigns, branding, and sales-enablement assets.' },
  { company: 'WhatCode', role: 'Design Intern', period: 'Jul 2023 — May 2024', location: 'Navi Mumbai', description: 'My first internship. Designed for client projects including StreetSnap.co, JD Institute, CypherBlockChain, CryptoTax, CreatorPe, AceTech, and YesBot.ai, learning the craft hands-on and sharpening my skills.' },
];

export const education = { degree: 'B.Tech · Computer Science & Engineering', school: 'Government Engineering College Raipur', period: 'July 2020 — May 2024' };

export const skills = [
  { title: 'Lead & align', items: ['Product strategy', 'UX leadership', 'Stakeholder management', 'Cross-functional collaboration', 'DesignOps', 'Agile & Scrum'] },
  { title: 'Research & make', items: ['User research', 'Information architecture', 'Interaction design', 'Prototyping', 'Usability testing', 'Design systems', 'Accessibility (WCAG)', 'Motion Design', 'Brand Design'] },
  { title: 'Tools of the trade', items: ['Figma & FigJam', 'Framer', 'Adobe Creative Suite', 'Jira', 'Notion', 'Miro', 'Penpot', 'Antigravity', 'Protopie', 'XCode'] },
  { title: 'An AI-assisted practice', items: ['Generative AI', 'Prompt engineering', 'ChatGPT · Claude · Gemini', 'Cursor & GitHub Copilot', 'Midjourney · Leonardo · Ideogram', 'V0 · Lovable · Readdy AI'] },
];
