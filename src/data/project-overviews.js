// Reading-layer content. Employment periods describe the role, not project launch dates.
// Scope counts describe résumé-listed design scope, not measured product impact.
// Penpot and Helix viewport captures are observed demo artifacts, not production records.
const evidenceFigure = (name, alt, caption, width = 1440, height = 1000) => ({
  src: `/assets/portfolio-evidence/${name}.webp`, width, height,
  srcSet: `/assets/portfolio-evidence/${name}-960.webp 960w, /assets/portfolio-evidence/${name}.webp ${width}w`,
  alt, caption,
});
const neostraRole = [
  { label: 'My role', value: 'Lead Product Designer · Nyusta' },
  { label: 'Role period', value: 'November 2024 — Present' },
];
const tejasRole = [
  { label: 'My role', value: 'Design Consultant (part-time) · Tejas' },
  { label: 'Role period', value: 'September 2025 — Present' },
];
const neostraDelivery = 'Research, information architecture, interactive prototypes, developer handoff, and implementation reviews';

export const projectOverviews = {
  'neostra-dsar': {
    title: 'Neostra · Data Subject Access Request',
    domain: 'Enterprise SaaS · Privacy operations',
    description: 'Data Subject Access Request (DSAR) management is part of Neostra, Nyusta’s enterprise privacy product. As Lead Product Designer, I work on the product’s privacy workflows from research and information architecture through prototypes, developer handoff, and implementation review.',
    image: '/assets/DSAR.webp',
    facts: [
      ...neostraRole,
      { label: 'Product area', value: 'Data Subject Access Request management' },
      { label: 'My delivery scope', value: neostraDelivery },
    ],
    sections: [
      {
        id: 'context',
        title: 'A privacy request is an operational task',
        paragraphs: [
          'A Data Subject Access Request concerns an individual’s access to their personal data. Within Neostra, DSAR management sits alongside consent management, data mapping, and privacy assessments. The design challenge is to make this specialized work understandable within a wider enterprise product.',
          'My responsibility spans the structure of those workflows and the interfaces used to navigate them. I collaborate with founders, product managers, engineers, and customers, carrying design decisions into handoff and implementation reviews.',
        ],
      },
      {
        id: 'triage',
        title: 'Make ownership and urgency visible together',
        paragraphs: [
          'The shared Penpot privacy-request template places request type, status, assigned person, and due date in the same table. A privacy operator can inspect an access request alongside deletion, portability, correction, and objection requests, rather than treating each as an isolated record.',
          'The illustrated states include In review, Due soon, Overdue, Pending, and Verified. Search, a status filter, and request-type navigation give the list different entry points. Showing an assignee and due date beside the status makes the next responsibility and time pressure visible together; this is an explanation of the supplied design, not a measured usability result.',
          'The template is explicitly a demo workspace with sample data. Its counts, median response, and improvement text are interface examples, not observed operating results. The visible template documents request triage; it does not establish a complete intake-to-resolution implementation.',
        ],
        figures: [evidenceFigure('neostra-requests-clean', 'Neostra privacy-request template with request type, labeled status, assignee, due date, request search, status filter, and sample-data disclosure.', 'Shared Penpot privacy-request template mockup. All names, counts, dates, and response-time figures are sample data.', 2000, 1510)],
      },
      {
        id: 'scope',
        title: 'Product workflows and a shared system',
        paragraphs: [
          'My résumé records work across 30+ Neostra workflows and the creation of 200+ reusable UI components, interaction patterns, and accessibility guidance. Those figures describe the overall Neostra scope; they are not a DSAR-only component count or a measure of time saved.',
          'This page focuses on the DSAR product area. The separate Neostra design-system overview covers the reusable foundations. The linked Figma file preserves the original DSAR design material for closer inspection.',
        ],
      },
    ],
    links: [
      { label: 'Open the DSAR design file', href: 'https://www.figma.com/design/ga0hmHb684QwqMCtH3PoAA/-Neostra_DSAR_?node-id=2614-2' },
      { label: 'Neostra design system', href: '/work/neostra-system' },
      { label: 'Neostra CPMP', href: '/work/neostra-cpmp' },
    ],
  },
  'neostra-cpmp': {
    title: 'Neostra · CPMP',
    domain: 'Enterprise SaaS · Privacy management',
    description: 'CPMP is a dedicated design file within my Neostra work at Nyusta. My Lead Product Designer role covers enterprise privacy workflows, including consent management, and connects research and information architecture with UI design, prototypes, and engineering delivery.',
    image: '/assets/CPMP.webp',
    facts: [
      ...neostraRole,
      { label: 'Design material', value: 'Dedicated Neostra CPMP Figma file' },
      { label: 'My delivery scope', value: neostraDelivery },
    ],
    sections: [
      {
        id: 'context',
        title: 'Privacy management within a larger product',
        paragraphs: [
          'Neostra brings multiple privacy responsibilities into an enterprise product. Consent management is one of the areas documented in my résumé, alongside Data Subject Access Request management, data mapping, and privacy assessments. CPMP is presented as its own design file in the original portfolio.',
          'My contribution connects product structure and interaction design with delivery: I own research, information architecture, interactive prototypes, developer handoff, and implementation reviews in collaboration with product, engineering, leadership, and customers.',
        ],
      },
      {
        id: 'drafts',
        title: 'Keep editing separate from publishing',
        paragraphs: [
          'The shared Penpot collection-point template groups Details, Attributes, Banner, and Integration in one workspace. A Draft label and separate Discard draft / Publish changes actions distinguish editing from making a configuration available. The owner, brand, description, captured attributes, and consent integration remain connected to that collection point.',
          'The privacy-preference pattern distinguishes Necessary from optional Analytics and Marketing, with Reject optional and Save preferences actions. These are inspectable examples of configuration and choice in the shared Neostra library; the linked CPMP Figma file remains a separate source artifact.',
        ],
        figures: [evidenceFigure('neostra-collection-details', 'Collection-point draft in Neostra with Details, Attributes, Banner, Integration, Discard draft, and Publish changes.', 'Shared Penpot collection-point template with sample workspace content. This is design evidence, not a record of a published configuration.')],
      },
      {
        id: 'material',
        title: 'The original design material',
        paragraphs: [
          'The Figma file is the reference for the CPMP interface work. The shared design system is documented separately, so the product-area material and the reusable foundations can be explored in their own contexts.',
          'Across Neostra, my résumé records 30+ workflows and 200+ reusable UI components. These are platform-wide delivery counts, rather than CPMP-specific results or evidence of a measured compliance outcome.',
        ],
      },
    ],
    links: [
      { label: 'Open the CPMP design file', href: 'https://www.figma.com/design/KJ1Dc0jkNsM6XetA5heLBy/-Neostra_CPMP_?node-id=2487-5539' },
      { label: 'Neostra design system', href: '/work/neostra-system' },
      { label: 'Data Subject Access Request work', href: '/work/neostra-dsar' },
    ],
  },
  'neostra-system': {
    title: 'Neostra design system',
    domain: 'Design systems · Enterprise privacy software',
    description: 'I created reusable UI components, interaction patterns, and accessibility guidance for Neostra, Nyusta’s enterprise privacy product. The system supports design work across specialized privacy workflows and gives implementation reviews a shared foundation.',
    image: '/assets/ankit/neostra-penpot-preview.webp',
    facts: [
      ...neostraRole,
      { label: 'Documented scope', value: '200+ reusable UI components, interaction patterns, and accessibility guidance' },
      { label: 'Delivery', value: 'Design-system work, developer handoff, and implementation reviews' },
    ],
    sections: [
      {
        id: 'context',
        title: 'A common language for specialized work',
        paragraphs: [
          'Neostra’s product scope includes Data Subject Access Request management, consent management, data mapping, and privacy assessments. Reusable components and patterns provide common building blocks as the workflows change from one product area to another.',
          'As Lead Product Designer, I connect this system work to research, information architecture, prototypes, developer handoff, and implementation reviews. The 200+ component figure is documented delivery scope across Neostra, not a claim about adoption or efficiency gains.',
        ],
      },
      {
        id: 'foundations',
        title: 'The visible foundations',
        paragraphs: [
          'The shared Penpot foundations organize base primitives, Neostra/V1 semantic tokens, and dark-theme overrides. The color examples include brand #29BD8E, canvas #FAF9F5, surface #FFFFFF, text #252521, and border #E3E0D7. Crimson Pro is used for display and headings; DM Sans for navigation, controls, data, and product copy.',
          'The spacing scale runs from 4 to 64 pixels, and control sizes from 28 to 44 pixels. These explicit foundations connect typography, spacing, and interaction sizing instead of leaving each screen to define them independently.',
        ],
        figures: [
          evidenceFigure('neostra-tokens', 'Neostra Penpot foundations board showing semantic token layers, color values, Crimson Pro and DM Sans, and spacing scale.', 'Browser capture of the actual foundations board in the shared Penpot library.'),
        ],
      },
      {
        id: 'states', title: 'From a button state to a privacy pattern',
        paragraphs: [
          'The button reference crosses Primary, Secondary, Tonal, Ghost, and Destructive appearances with Idle, Hover, Focus, Pressed, Disabled, and Loading states. The wider matrix includes size and icon properties and references button-color, radius, control-size, and focus tokens.',
          'The privacy patterns then put shared controls into a concrete task: necessary cookies remain enabled while optional categories can be changed before saving. The request summary pattern pairs an In review label with a due date. Those examples connect component states with the privacy workflows rather than displaying a library in isolation.',
          'The reference includes keyboard-focus and status-label guidance. It also documents a contrast limitation in white text on the green primary button, while the foundations recommend dark on-brand text. This is inspectable design documentation, not a claim that every state has passed an accessibility audit.',
        ],
        figures: [
          evidenceFigure('neostra-button-states', 'Button reference matrix with Primary, Secondary, Tonal, Ghost, and Destructive rows across idle, hover, focus, pressed, disabled, and loading states.', 'Actual component reference showing visual and interaction states. This reference includes documented contrast limitations.'),
          evidenceFigure('neostra-privacy-preferences', 'Privacy preference pattern with Necessary enabled, Analytics and Marketing off, Reject optional, and Save preferences.', 'Actual privacy-preference pattern from the shared library; configuration is sample design content.'),
        ],
      },
    ],
    links: [
      { label: 'Open the shared Penpot file', href: 'https://design.penpot.app/?screen=viewer&file-id=2bd3d7f1-914f-8188-8008-dd279008f96c&page-id=6188061b-c672-80ce-8008-a55672bc5fb1&section=interactions&frame-id=1e5ac49f-73a5-805a-8008-a5681f884b8c&index=0&interactions-mode=show-on-click&share-id=afdfee27-b9c2-42ed-b7e6-96fa5e01fea9' },
      { label: 'Data Subject Access Request work', href: '/work/neostra-dsar' },
      { label: 'Neostra CPMP', href: '/work/neostra-cpmp' },
    ],
  },
  helix: {
    title: 'Helix Labs',
    domain: 'AI-assisted workflows · Materials R&D',
    description: 'Helix Labs is an interactive formulation prototype connecting literature review, candidate formulations, lab trials, and results analysis. I designed the workflow with AI agent status, constraint checks, and human-in-the-loop approval so a person can review the proposed direction before moving forward.',
    image: '/assets/video/Helix-clean-poster.webp',
    facts: [
      ...tejasRole,
      { label: 'My contribution', value: 'Interactive formulation workflow and prototype design' },
      { label: 'Artifact', value: 'Interactive prototype · simulated runs and demo values' },
    ],
    sections: [
      {
        id: 'workflow',
        title: 'From a research question to a trial',
        paragraphs: [
          'The prototype connects four stages of materials work: review literature, compare candidate formulations, organize lab trials, and analyze results. Keeping these tasks within one workflow gives the reviewer a path from the starting information to the next experimental decision.',
          'My contribution is the product and interaction design of that path. Agent statuses make the proposed work visible, while candidate review, constraints, and flags give the person using the prototype material to inspect before an approval checkpoint.',
        ],
      },
      {
        id: 'checkpoints',
        title: 'Keep review in the workflow',
        paragraphs: [
          'An agent’s progress and a formulation’s suitability are different questions. The experience brings status information together with candidate-path review and constraint checks, leaving human checkpoints in the sequence rather than treating an automated run as the final decision.',
          'The live artifact is a demonstration: runs are simulated and the displayed values are demo data. They show the intended interaction model, not real AI execution, validated material performance, or laboratory results.',
        ],
        figures: [
          evidenceFigure('helix-projects', 'Helix projects overview showing formulation names, current workflow stage, crew, and waiting, running, failed, and low-confidence states.', 'Browser capture of the live interactive prototype. Runs are simulated and values are demo data.'),
          evidenceFigure('helix-pathways', 'Helix gypsum-plaster project with a pathway stage, low-confidence warning, candidate formulation, and predicted-versus-target table.', 'The prototype exposes limited-source and extrapolation flags before candidate selection. Predictions, rankings, and values are illustrative, not lab results.'),
        ],
      },
    ],
    links: [
      { label: 'Explore the interactive prototype', href: 'https://helixlab-one.vercel.app/projects' },
      { label: 'ContractorBhai · CRM and AI drafts', href: '/work/contractorbhai' },
    ],
  },
  contractorbhai: {
    title: 'ContractorBhai',
    domain: 'CRM · AI-assisted communication',
    description: 'ContractorBhai is a mobile relationship workspace for managers who need to keep contractor details, conversations, and important occasions together. I designed the CRM workflow from profiles and reminders to editable AI greetings, recipient selection, and a WhatsApp sharing handoff.',
    image: '/assets/ContractorBhai/cover.webp',
    facts: [
      ...tejasRole,
      { label: 'My contribution', value: 'Contractor profiles, reminders, AI-draft controls, recipient selection, and sharing workflow' },
      { label: 'Design evidence', value: 'Original mobile screens and interactive case-study presentation' },
    ],
    sections: [
      {
        id: 'context',
        title: 'Prepare for the person, not just the next call',
        paragraphs: [
          'A relationship manager’s context can be scattered across notes and memory: previous meetings, personal preferences, family occasions, and the history of the partnership. ContractorBhai brings those details into a shared profile before the manager calls, visits, or prepares a greeting.',
          'The profile design places recognition, contact actions, recent meeting context, and a relationship journey together. A separate reminders view organizes birthdays, anniversaries, and festivals. These visible choices make stored context available at the point of the next interaction.',
        ],
        figures: [
          {
            src: '/assets/ContractorBhai/slide-mockups/profile-context-phone.webp', width: 800, height: 1441,
            srcSet: '/assets/ContractorBhai/slide-mockups/profile-context-phone-480.webp 480w, /assets/ContractorBhai/slide-mockups/profile-context-phone.webp 800w',
            alt: 'Original ContractorBhai phone mockup showing a contractor profile, call and WhatsApp actions, recent meeting context, and a relationship timeline.',
            caption: 'Phone mockup from slide 5, “Context before contact”: contact actions sit with recent history and relationship context. Names, dates, and values are source design sample data.',
          },
          {
            src: '/assets/ContractorBhai/slide-mockups/occasion-reminders-phone.webp', width: 800, height: 1431,
            srcSet: '/assets/ContractorBhai/slide-mockups/occasion-reminders-phone-480.webp 480w, /assets/ContractorBhai/slide-mockups/occasion-reminders-phone.webp 800w',
            alt: 'Original ContractorBhai phone mockup with birthday and anniversary reminders, message actions, and a calendar.',
            caption: 'Phone mockup from slide 7, “The next moment is already in view”: reminders connect an occasion to a next action. Names, dates, and event counts are source design sample data.',
          },
        ],
      },
      {
        id: 'drafts',
        title: 'An AI draft the manager can shape',
        paragraphs: [
          'The greeting workflow starts with an occasion, a creative, and an AI-assisted draft. The manager can change language, tone, length, and message type, then edit the words. Personal context can inform a greeting while the person using the app retains control of the final message.',
          'The design trades a single, fast broadcast for a more deliberate sequence: prepare the message, choose the recipients, and adjust an individual version where needed. The controls and selected-recipient state make those decisions visible; this is an interpretation of the interface, rather than a reported usability-test result.',
        ],
        figures: [
          {
            src: '/assets/ContractorBhai/slide-mockups/editable-greeting-phone.webp', width: 800, height: 1434,
            srcSet: '/assets/ContractorBhai/slide-mockups/editable-greeting-phone-480.webp 480w, /assets/ContractorBhai/slide-mockups/editable-greeting-phone.webp 800w',
            alt: 'Original ContractorBhai phone mockup showing a scrolled festival-message editor with templates, language, tone, length, message type, editable text, and a WhatsApp action.',
            caption: 'Phone mockup from slide 9, “The manager shapes the message”: draft controls expose wording choices before the WhatsApp handoff. The greeting and selected options are source design sample content.',
          },
          {
            src: '/assets/ContractorBhai/slide-mockups/recipient-selection-phone.webp', width: 800, height: 1392,
            srcSet: '/assets/ContractorBhai/slide-mockups/recipient-selection-phone-480.webp 480w, /assets/ContractorBhai/slide-mockups/recipient-selection-phone.webp 800w',
            alt: 'Original ContractorBhai phone mockup showing recipient search, filters, individual selection controls, and a selected-recipient bar.',
            caption: 'Phone mockup from slide 11, “Choose the people”: recipient selection keeps individual choices visible within a group action. Names, locations, and selection counts are source design sample data.',
          },
        ],
      },
      {
        id: 'handoff',
        title: 'The boundary is the WhatsApp handoff',
        paragraphs: [
          'The designed sequence is profiles → reminders → editable AI draft → recipient selection → WhatsApp sharing. The original presentation includes completion states as feedback at the end of that sequence.',
          'Those screens document the intended sharing experience. A completion state in the design does not establish that WhatsApp messages were delivered or read; no delivery rate or relationship outcome is reported here.',
        ],
      },
    ],
    links: [
      { label: 'Atlas · references for sales visits', href: '/work/atlas-brand' },
      { label: 'Adhikar · contractor rewards and portfolios', href: '/work/adhikar-brand' },
    ],
  },
  atlas: {
    title: 'Atlas',
    domain: 'Geospatial sales enablement · iPad experience',
    description: 'Atlas helps a sales relationship manager find nearby examples of product use during a site visit. I designed an iPad map experience with location search, filters, project previews, media, testimonials, and order history so the conversation can move from a general product claim to a relevant local reference.',
    image: '/assets/optimized/Atlas.webp',
    facts: [
      { label: 'My contribution', value: 'Product and interaction design for an iPad map experience' },
      { label: 'Audience', value: 'Sales relationship managers during field visits' },
      { label: 'Design evidence', value: 'Map, filter, preview, project-media, testimonial, and order screens' },
      { label: 'Data shown', value: 'Sample project and order data' },
    ],
    sections: [
      {
        id: 'context',
        title: 'Find a reference that means something here',
        paragraphs: [
          'During a sales visit, explaining product quality is only part of the conversation. Atlas addresses a more specific question: where nearby has this product been used, and what can the manager show from that project?',
          'The map makes location the starting point. Search and filters narrow the references; a project preview lets the manager check the owner, place, images, and available video before opening the detail view. My design work connects this lookup task to the evidence needed in the conversation.',
        ],
        figures: [
          {
            src: '/assets/Atlas/map.webp', width: 1400, height: 905,
            alt: 'Atlas satellite map with search, status markers, and project cards showing locations and image previews.',
            caption: 'The map-first reference view uses sample projects. Locations and previews stay in the same context.',
          },
        ],
      },
      {
        id: 'flow',
        title: 'Map → filter → preview → project evidence',
        paragraphs: [
          'The filter panel offers ways to narrow the map by area and the people or landmarks connected to a project. The popup then provides a smaller decision point: is this reference relevant enough to open?',
          'This layered structure keeps an overview available before exposing the full project. That is the visible design tradeoff: a quick relevance check on the map, followed by richer detail when the manager needs it.',
        ],
        figures: [
          {
            src: '/assets/Atlas/filter-focus.webp', width: 1040, height: 760,
            alt: 'Atlas filter panel beside map project cards, including a selected locality and landmark-owner options.',
            caption: 'Filters narrow the visible references while retaining the map beside them.',
          },
          {
            src: '/assets/Atlas/popup-focus.webp', width: 480, height: 550,
            alt: 'Atlas map popup with a sample project owner, location, date, images, and video preview.',
            caption: 'A compact project preview provides context before the full detail view.',
          },
        ],
      },
      {
        id: 'evidence',
        title: 'Keep the work, the account, and the products together',
        paragraphs: [
          'The expanded project view connects an overview with a gallery, testimonial videos, and orders. The manager can move from the finished space to the customer’s account and the products recorded for that site without switching to a separate reference collection.',
          'The order design includes product names, packs, dispatched quantities, and historical order value. These are sample records in the presentation. Atlas documents a sales-enablement design; a conversion increase or faster reference lookup has not been measured.',
        ],
        figures: [
          {
            src: '/assets/Atlas/order-details.webp', width: 1080, height: 1000,
            alt: 'Atlas sample order details with total order value, dispatched bag quantities, and a list of adhesive products.',
            caption: 'Order details connect the project reference to product records. The quantities and value are sample data.',
          },
        ],
      },
    ],
    links: [
      { label: 'ContractorBhai · relationship context', href: '/work/contractorbhai' },
      { label: 'Adhikar · contractor project portfolios', href: '/work/adhikar-brand' },
    ],
  },
  adhikar: {
    title: 'Adhikar',
    domain: 'Contractor loyalty · Rewards and project portfolios',
    description: 'Adhikar brings contractor points, reward redemption, and project portfolios into a mobile experience. My product design work connects a visible points balance and reward details with short project submissions, company-assisted portfolio preparation, and relationship-manager follow-up.',
    image: '/assets/optimized/Adhikar.webp',
    facts: [
      ...tejasRole,
      { label: 'My contribution', value: 'Product design for contractor loyalty, rewards, and portfolio workflows' },
      { label: 'Design evidence', value: 'Original app mockups and a 20-slide product presentation' },
    ],
    sections: [
      {
        id: 'rewards',
        title: 'Make points useful at the moment of redemption',
        paragraphs: [
          'The home screen gives available points the strongest emphasis and places “Redeem Now” directly underneath. Points history separates earned and redeemed activity, while reward details explain the point cost and the experience before a claim.',
          'In the documented tour workflow, the contractor makes a claim and a relationship manager follows up to coordinate the arrangements. The design keeps the initial app action short while making room for assisted coordination beyond the screen.',
        ],
        figures: [
          {
            src: '/assets/Adhikar/home.webp', width: 1400, height: 2679,
            alt: 'Adhikar home mockup with available points, Redeem Now, quick-access tools, and tour previews.',
            caption: 'Home prioritizes the points balance and redemption. The balance and growth text are interface examples.',
          },
          {
            src: '/assets/Adhikar/points-history.webp', width: 1400, height: 2679,
            alt: 'Adhikar points-history mockup showing balance totals, earned and redeemed filters, and transaction entries.',
            caption: 'Points history gives the balance a transaction trail rather than presenting it as a standalone number.',
          },
        ],
      },
      {
        id: 'portfolio',
        title: 'Start a portfolio with information from the site',
        paragraphs: [
          'A contractor starts with “Add Project.” The first step collects a photo, project name, and location; the next gathers details such as project type, status, built area, and a description. The company can then review the submission, document the work, and prepare the finished portfolio.',
          'The finished project brings together its people, project facts, gallery, and products used, with a prepared PDF for sharing. My design work organizes the submission and the resulting project experience around this company-assisted process.',
        ],
        figures: [
          {
            src: '/assets/Adhikar/add-photo.webp', width: 1400, height: 2679,
            alt: 'Adhikar Add New Project step one with upload options, a project-name field, a location field, and Continue.',
            caption: 'The first submission step asks for a photo and basic project identity.',
          },
          {
            src: '/assets/Adhikar/project-overview.webp', width: 1400, height: 2679,
            alt: 'Adhikar completed project-overview mockup presenting a project and its supporting details.',
            caption: 'The prepared project view is the destination of the assisted portfolio workflow.',
          },
        ],
      },
      {
        id: 'service',
        title: 'A short app flow with people behind it',
        paragraphs: [
          'Points costs, a two-step submission, familiar selection controls, and RM follow-up are visible decisions in the original presentation. They distribute the work between contractor input and company support rather than asking the contractor to prepare a complete portfolio or arrange a trip inside the app.',
          'The presentation also includes marketing assets, memories, analytics, and a coverage calculator. The central story here is rewards and project submission; the supplied screens show the design intent, not verified reward fulfillment, portfolio turnaround time, or engagement growth.',
        ],
      },
    ],
    links: [
      { label: 'ContractorBhai · the manager’s relationship workspace', href: '/work/contractorbhai' },
      { label: 'Atlas · local project references', href: '/work/atlas-brand' },
    ],
  },
  yesbot: {
    title: 'YesBot.ai',
    domain: 'Conversational AI · Chatbot management',
    description: 'YesBot.ai explores a configurable chatbot workspace for businesses managing knowledge sources, conversations, and customer information. I designed UX/UI for the product during my WhatCode internship, with flows and responsive interface explorations preserved in the published case study.',
    image: '/assets/optimized/YesBot.webp',
    facts: [
      { label: 'My role', value: 'Design Intern · WhatCode' },
      { label: 'My contribution', value: 'UX/UI, user flows, wireframes, and responsive interface design' },
      { label: 'Published', value: 'May 30, 2024 · Behance' },
    ],
    sections: [
      {
        id: 'context',
        title: 'Bring the support workspace together',
        paragraphs: [
          'The product challenge is fragmentation: knowledge can live in websites, uploaded files, Notion, or Google Drive, while conversations and customer details need their own management views. The case study explores how those parts fit into a configurable chatbot workspace.',
          'My interface work includes knowledge-source flows, trigger-keyword workflows, conversation analysis, and customer information. A DM Sans-based visual system, components, and wireframes connect the desktop and mobile explorations.',
        ],
        figures: [
          {
            src: '/assets/yesbot/slide-14.webp', width: 2000, height: 1800,
            srcSet: '/assets/yesbot/slide-14-1000.webp 1000w, /assets/yesbot/slide-14.webp 2000w',
            alt: 'YesBot.ai dashboard design with usage, conversations, messages, sentiment, leads, products, and bot channels.',
            caption: 'Dashboard from the original case study. The displayed counts and rates are design content, not reported product results.',
          },
        ],
      },
      {
        id: 'study',
        title: 'Read the original study in context',
        paragraphs: [
          'The published presentation includes a survey described as having 100 participants, competitor comparisons, personas, and journey exploration. These are documented as part of the source narrative; they do not establish a measured improvement in usability or chatbot performance.',
          'The original slides below preserve the research framing, user flows, shared visual language, and high-fidelity explorations. They show how the design was organized without treating interface sample data as live AI accuracy or engagement evidence.',
        ],
      },
    ],
    links: [
      { label: 'CryptoTax · another WhatCode project', href: '/work/cryptotax' },
      { label: 'Helix Labs · a human-reviewed AI workflow', href: '/work/helix' },
    ],
  },
  cryptotax: {
    title: 'CryptoTax',
    domain: 'Fintech · Cryptocurrency portfolios and tax reporting',
    description: 'CryptoTax is a portfolio and tax-reporting design exploration for cryptocurrency activity spread across wallets and exchanges. I designed UX/UI during my WhatCode internship, organizing accounts, transaction records, wallet information, and tax-related tasks across desktop and mobile.',
    image: '/assets/optimized/CryptoTaxx.webp',
    facts: [
      { label: 'My role', value: 'Design Intern · WhatCode' },
      { label: 'My contribution', value: 'UX/UI, account and transaction flows, wireframes, and responsive product explorations' },
      { label: 'Published', value: 'June 3, 2024 · Behance' },
    ],
    sections: [
      {
        id: 'context',
        title: 'Make fragmented activity easier to inspect',
        paragraphs: [
          'The original case study investigates manual transaction tracking, missing or inconsistent records, tax-calculation complexity, and differences in reporting requirements. The product structure connects account access, wallet setup, transactions, reporting, and tax-related tasks.',
          'My interface explorations use account summaries, transaction tables, connection and sync states, and tax-harvesting views. Raleway typography and a turquoise palette carry through the product, pricing, marketing, and mobile compositions.',
        ],
        figures: [
          {
            src: '/assets/ankit/notion-slide-06.webp', width: 1400, height: 788,
            alt: 'Annotated CryptoTax transaction and account designs with summary cards, a transaction table, account search, and sync-status cards.',
            caption: 'Original portfolio annotations explain the transaction and account structure. Figures and sync labels are interface examples.',
          },
        ],
      },
      {
        id: 'study',
        title: 'From research framing to interface structure',
        paragraphs: [
          'Research questions, interviews, survey findings, personas, and competitor comparisons appear in the published case study. The user-flow diagrams and wireframes then establish the hierarchy before high-fidelity visual design.',
          'The material documents a design exploration. It does not verify exchange integrations, the correctness of tax calculations, regulatory compliance, or a reduction in reporting errors. The complete source presentation remains available below.',
        ],
      },
    ],
    links: [
      { label: 'YesBot.ai · another WhatCode project', href: '/work/yesbot' },
      { label: 'Neostra · enterprise privacy workflows', href: '/work/neostra-dsar' },
    ],
  },
};
