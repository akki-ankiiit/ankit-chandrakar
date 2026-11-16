// Interactive 3D bag models. Optimised copies (meshopt geometry, WebP textures capped at 2048px)
// of the source files; regenerate with:
// npx @gltf-transform/cli optimize <source.glb> public/assets/3d-bags/<name>.glb --compress meshopt --texture-compress webp --texture-size 2048 --simplify false
const glb = (name) => `/assets/3d-bags/${name}.glb`;
const greyWhite = (name) => [
  { id: 'grey', label: 'Grey', src: glb(`${name}-grey`) },
  { id: 'white', label: 'White', src: glb(`${name}-white`) },
];

export const kSeriesBags = [
  { id: 'k50', label: 'K50', name: 'K50', colour: '#D2491A', variants: [{ id: 'grey', label: 'Grey', src: glb('k50') }] },
  { id: 'k60', label: 'K60', name: 'K60', colour: '#E1BE00', variants: greyWhite('k60') },
  { id: 'k80', label: 'K80', name: 'K80', colour: '#C8161D', variants: greyWhite('k80') },
  { id: 'k90', label: 'K90', name: 'K90', colour: '#0B4A98', variants: greyWhite('k90') },
  { id: 'kamdhenu-x', label: 'X', name: 'Kamdhenu X', colour: '#4a4a4a', variants: greyWhite('kamdhenu-x') },
];

export const bondureBags = [
  { id: 'bondure', label: 'BONDURE', name: 'BONDURE AAC Block Jointing Mortar', colour: '#540E1E', variants: [{ id: 'main', src: glb('bondure-aac-block-jointing-mortar') }] },
  { id: 'wallstark', label: 'Wall Stârk', name: 'Wall Stârk Ready-Mix Plaster', colour: '#0B1628', variants: [{ id: 'main', src: glb('bondure-wallstark') }] },
  { id: 'screed', label: 'Scrêêd', name: 'Scrêêd Floor Screed', colour: '#0F2D28', variants: [{ id: 'main', src: glb('bondure-screed') }] },
  { id: 'b555', label: 'B-555', name: 'BASE B-555 Flexible Tile Adhesive, 20 kg', colour: '#4A0749', variants: [{ id: 'main', src: glb('bondure-base-b555-20kg') }] },
  { id: 'b565', label: 'B-565', name: 'BASE B-565 Flexible Tile Adhesive, 20 kg', colour: '#BC342B', variants: [{ id: 'main', src: glb('bondure-base-b565-20kg') }] },
  { id: 'b585', label: 'B-585', name: 'BASE B-585 Flexible Tile Adhesive, 20 kg', colour: '#024E4F', variants: [{ id: 'main', src: glb('bondure-base-b585-20kg') }] },
];
