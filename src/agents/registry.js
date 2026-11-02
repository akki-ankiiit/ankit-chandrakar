// Character definitions adapted from akki-ankiiit/helix01, src/agents/registry.ts.
export const AGENTS = {
  conductor: {
    id: 'conductor', name: 'Helix', title: 'Conductor',
    role: 'Orchestrator — plans the run, hands work to the crew, answers in Ask Helix',
    plainRole: 'Runs the team and answers your questions', type: 'hexagon', face: 'mouth',
    accessories: { headphones: true }, tools: ['plan_run', 'handoff', 'answer'],
    defaultOrb: 'weaving', orbs: ['weaving', 'composing', 'listening'],
    greeting: 'On it. Pulling the crew together.', worksOn: ['Magic Start', 'Agent console', 'Ask Helix', 'Task queue'],
  },
  reader: {
    id: 'reader', name: 'Iris', title: 'Reader',
    role: 'Reads links, TDS/MSDS PDFs and spreadsheets; extracts values',
    plainRole: 'Reads the links and data sheets you share', type: 'cat', face: 'eyes',
    accessories: { glasses: 'round' }, tools: ['fetch_url', 'detect_doc_type', 'extract_tds', 'extract_table', 'map_columns'],
    defaultOrb: 'searching', orbs: ['searching'], greeting: "I'll read the link.",
    worksOn: ['Magic Start link / PDF', 'Benchmark upload & extraction review', 'Raw material Excel import', 'Literature — upload own source'],
  },
  classifier: {
    id: 'classifier', name: 'Atlas', title: 'Classifier',
    role: 'Maps the need to group, category, sub-SKU, standard and property template',
    plainRole: 'Works out what kind of product you need', type: 'square', face: 'eyes',
    tools: ['classify_product', 'lookup_standard', 'load_template'], defaultOrb: 'connecting', orbs: ['connecting'],
    greeting: "I'll pick the category.", worksOn: ['Steps 1–2', 'Templates page'],
  },
  site: {
    id: 'site', name: 'Terra', title: 'Site agent',
    role: 'Turns site situations into use-case fields; asks the guided questions',
    plainRole: 'Asks about your site and how the product is used', type: 'pebble', face: 'mouth',
    accessories: { hat: 'beanie' }, tools: ['infer_use_case', 'ask_guided_question', 'map_answer_to_fields'],
    defaultOrb: 'listening', orbs: ['listening', 'connecting'], greeting: "I'll work out the use case.",
    worksOn: ['Step 3 (leads in Non-scientist mode)'],
  },
  benchmark: {
    id: 'benchmark', name: 'Echo', title: 'Benchmarker', role: 'Finds and compares the closest benchmarks (up to 3)',
    plainRole: 'Finds a product to match or beat', type: 'triangle', face: 'eyes',
    tools: ['search_benchmarks', 'create_benchmark', 'compare_values'], defaultOrb: 'searching', orbs: ['searching', 'connecting'],
    greeting: "I'll find the closest benchmark.", worksOn: ['Benchmark step', 'Benchmark library', 'Analysis benchmark column'],
  },
  targets: {
    id: 'targets', name: 'Vega', title: 'Target setter',
    role: 'Sets targets, operators, priorities and the top-3 ranking; checks against standards',
    plainRole: 'Decides how well the product must perform', type: 'star', face: 'eyes',
    tools: ['draft_targets', 'compare_to_standard', 'rank_priorities'], defaultOrb: 'solving', orbs: ['solving'],
    greeting: "I'll set the targets.", worksOn: ['Targets step', 'Target below standard validation'],
  },
  cost: {
    id: 'cost', name: 'Ledger', title: 'Cost agent', role: 'Cost ceiling, raw-material limits, cost per kg, constraint checks',
    plainRole: 'Keeps an eye on price and budget', type: 'pill', face: 'eyes', accessories: { glasses: 'square' },
    tools: ['estimate_cost', 'check_ceiling', 'check_material_limits'], defaultOrb: 'solving', orbs: ['solving'],
    greeting: "I'll set the cost limits.", worksOn: ['Constraints step', 'Trials footer rows', 'Raw material master'],
  },
  scholar: {
    id: 'scholar', name: 'Lumen', title: 'Scholar', role: 'Literature review: Analyse, Identify, Strategy, Search, Cluster, Extract',
    plainRole: 'Reads research papers and patents', type: 'ghost', face: 'eyes', accessories: { glasses: 'round' },
    tools: ['analyse_brief', 'identify_concepts', 'build_strategy', 'search_literature', 'cluster_sources', 'extract_findings'],
    defaultOrb: 'searching', orbs: ['searching', 'connecting'], greeting: "I'll search the literature.",
    worksOn: ['Literature stage', 'Processing showcase (left)'],
  },
  weaver: {
    id: 'weaver', name: 'Weave', title: 'Pathway designer', role: 'Synthesises pathways, scores them, makes variants',
    plainRole: 'Designs possible recipes to try', type: 'flower', face: 'eyes',
    tools: ['generate_pathways', 'predict_properties', 'score_pathway', 'make_variant'], defaultOrb: 'weaving', orbs: ['weaving'],
    greeting: "I'll design the pathways.", worksOn: ['Pathways stage', 'Compare page', 'Processing showcase (right)'],
  },
  mixer: {
    id: 'mixer', name: 'Batch', title: 'Trial designer',
    role: 'Designs trial recipes (DOE), mixing protocol and test plan; swaps materials',
    plainRole: 'Writes the trial recipes for the lab', type: 'droid', face: 'eyes',
    tools: ['design_trials', 'balance_recipe', 'write_protocol', 'plan_tests', 'swap_material'], defaultOrb: 'shaping', orbs: ['shaping'],
    greeting: "I'll build the trial recipes.", worksOn: ['Trials stage', 'Export trial sheet'],
  },
  lab: {
    id: 'lab', name: 'Probe', title: 'Lab agent', role: 'Reads lab results, parses Excel pastes, tracks aged-test due dates',
    plainRole: 'Reads the lab results', type: 'mech', face: 'eyes', tools: ['parse_paste', 'compute_mean', 'schedule_aged_tests'],
    defaultOrb: 'working', orbs: ['working', 'listening'], greeting: "I'll read the lab results.", worksOn: ['Results stage'],
  },
  analyst: {
    id: 'analyst', name: 'Delta', title: 'Analyst', role: 'Pass / borderline / fail matrix, proposes the next iteration',
    plainRole: 'Checks the results and suggests what to change', type: 'alien', face: 'eyes',
    tools: ['evaluate_targets', 'propose_iteration'], defaultOrb: 'solving', orbs: ['solving', 'composing'],
    greeting: "I'll analyse the results.", worksOn: ['Analysis stage', '"Targets met?" loop'],
  },
  sentinel: {
    id: 'sentinel', name: 'Guard', title: 'Safety agent',
    role: 'Safety and compliance: hazard flags, VOC/chloride limits, validation errors',
    plainRole: 'Checks safety and rules', type: 'circle', face: 'eyes', accessories: { glasses: 'shades' },
    tools: ['check_hazards', 'check_compliance', 'validate_recipe'], defaultOrb: 'solving', orbs: ['solving'],
    greeting: "I'll check safety and compliance.", worksOn: ['Pathway hazard flags', 'Recipe ≠ 100 %', 'Cost over ceiling', 'Compliance chips'],
  },
  scribe: {
    id: 'scribe', name: 'Quill', title: 'Writer', role: 'Writes the summary, brief, R&D handoff, reports and the final dossier',
    plainRole: 'Writes it all up', type: 'blob', face: 'mouth', accessories: { hat: 'beret' },
    tools: ['write_summary', 'write_brief', 'render_report'], defaultOrb: 'composing', orbs: ['composing', 'shaping'],
    greeting: "I'll write it up.", worksOn: ['Preview summary', 'Brief review', 'Reports', 'Final'],
  },
};
export const AGENT_IDS = Object.keys(AGENTS);
export const RESERVED_TYPES = ['clover', 'drop', 'cloud', 'puddle'];
export const ORB_STATES = ['working', 'searching', 'solving', 'listening', 'connecting', 'weaving', 'composing', 'breathing', 'shaping'];
