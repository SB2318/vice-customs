import { DecalCategory } from '../types';

export interface DecalDefinition {
  id: string;
  name: string;
  category: DecalCategory;
  defaultColor: string;
  secondaryColor?: string;
  pathSvg?: string;
  renderType: 'svg' | 'text' | 'plate' | 'pattern';
  description: string;
}

export const DECAL_CATEGORIES: { id: DecalCategory; label: string; icon: string }[] = [
  { id: 'stripe', label: 'Racing Stripes', icon: '🏁' },
  { id: 'flame', label: 'Flames & Graphics', icon: '🔥' },
  { id: 'stencil', label: 'Spray Stencils', icon: '🎨' },
  { id: 'sponsor', label: 'Sponsor Logos', icon: '⚡' },
  { id: 'bullet', label: 'Bullet Holes & Scratches', icon: '💥' },
  { id: 'plate', label: 'License Plates', icon: '🚘' },
  { id: 'text', label: 'Custom Typography', icon: '🔤' },
];

export const DECAL_LIBRARY: DecalDefinition[] = [
  // --- RACING STRIPES ---
  {
    id: 'stripe_dual_center',
    name: 'GT Dual Center Stripes',
    category: 'stripe',
    defaultColor: '#ffffff',
    secondaryColor: '#00f0ff',
    renderType: 'svg',
    description: 'Classic dual hood-to-tail racing stripes',
    pathSvg: 'M-120,-512 L-40,-512 L-40,512 L-120,512 Z M40,-512 L120,-512 L120,512 L40,512 Z'
  },
  {
    id: 'stripe_asymmetric_rally',
    name: 'Asymmetric Offset Rally Stripe',
    category: 'stripe',
    defaultColor: '#ff007f',
    secondaryColor: '#ffffff',
    renderType: 'svg',
    description: 'Aggressive offset rally stripe with thin accent line',
    pathSvg: 'M-180,-512 L-60,-512 L-60,512 L-180,512 Z M-40,-512 L-20,-512 L-20,512 L-40,512 Z'
  },
  {
    id: 'stripe_checkered_side',
    name: 'Checkered Flag Side Banner',
    category: 'stripe',
    defaultColor: '#ffffff',
    renderType: 'svg',
    description: 'Racing checkered pattern banner',
    pathSvg: `
      M-400,-40 L400,-40 L400,40 L-400,40 Z
      M-400,-40 L-300,-40 L-300,0 L-400,0 Z M-200,-40 L-100,-40 L-100,0 L-200,0 Z M0,-40 L100,-40 L100,0 L0,0 Z M200,-40 L300,-40 L300,0 L200,0 Z
      M-300,0 L-200,0 L-200,40 L-300,40 Z M-100,0 L0,0 L0,40 L-100,40 Z M100,0 L200,0 L200,40 L100,40 Z M300,0 L400,0 L400,40 L300,40 Z
    `
  },
  {
    id: 'stripe_side_spear',
    name: 'Door Panel Spear Stripe',
    category: 'stripe',
    defaultColor: '#00f0ff',
    renderType: 'svg',
    description: 'Sharp aerodynamic door accent stripe',
    pathSvg: 'M-400,0 L350,-20 L450,30 L-350,30 Z'
  },

  // --- FLAMES & GRAPHICS ---
  {
    id: 'flame_retro_hotrod',
    name: 'Vice Retro Flames',
    category: 'flame',
    defaultColor: '#ff5500',
    secondaryColor: '#ffea00',
    renderType: 'svg',
    description: 'Classic 80s hot-rod flames extending along hood & doors',
    pathSvg: `
      M-350,50 C-250,-100 -150,-200 -50,-50 C50,-250 150,-300 250,-100 C300,-350 400,-300 500,50 
      C350,-30 250,10 200,50 C130,30 70,70 0,50 C-70,70 -130,30 -150,50 Z
    `
  },
  {
    id: 'flame_cyber_neon',
    name: 'Cyber Synthwave Wings',
    category: 'flame',
    defaultColor: '#ff007f',
    secondaryColor: '#00f0ff',
    renderType: 'svg',
    description: 'Geometric vector flames with synthwave grid flares',
    pathSvg: `
      M-350,0 L-150,-100 L-200,-30 L0,-150 L-80,-50 L200,-200 L80,20 L400,-20 L150,80 L-100,70 L-250,80 Z
    `
  },
  {
    id: 'graphic_vice_palms',
    name: 'Vice Sunset Palms',
    category: 'flame',
    defaultColor: '#ff007f',
    renderType: 'svg',
    description: 'Iconic Vice City palm trees against retro sun horizon',
    pathSvg: `
      M-150,100 A150,150 0 0,1 150,100 Z
      M20,100 C10,0 0,-100 -20,-200 C10,-190 60,-170 100,-140 M-20,-200 C-50,-210 -110,-190 -160,-140 M-20,-200 C-30,-250 -40,-300 -80,-330 M-20,-200 C0,-250 40,-290 90,-310
    `
  },

  // --- SPRAY STENCILS ---
  {
    id: 'stencil_vice_palms',
    name: 'Aerosol Palm Stencil',
    category: 'stencil',
    defaultColor: '#00f0ff',
    renderType: 'svg',
    description: 'Gritty aerosol palm silhouette',
    pathSvg: `
      M0,150 C-10,30 -30,-70 -80,-170 C-40,-160 20,-130 60,-90 M-80,-170 C-120,-190 -180,-170 -230,-120 M-80,-170 C-90,-230 -110,-290 -160,-330 M-80,-170 C-50,-230 0,-270 60,-290
    `
  },
  {
    id: 'stencil_race_number_88',
    name: '#88 Vice Special Stencil',
    category: 'stencil',
    defaultColor: '#ffea00',
    renderType: 'svg',
    description: 'Classic stencil bold racing number 88',
    pathSvg: `
      M-120,-100 C-120,-160 -20,-160 -20,-100 C-20,-60 -40,-40 -70,-20 C-20,0 -10,40 -10,100 C-10,180 -130,180 -130,100 Z M-85,-120 C-85,-130 -55,-130 -55,-120 Z M-90,100 C-90,70 -50,70 -50,100 Z
      M80,-100 C80,-160 180,-160 180,-100 C180,-60 160,-40 130,-20 C180,0 190,40 190,100 C190,180 70,180 70,100 Z M115,-120 C115,-130 145,-130 145,-120 Z M110,100 C110,70 150,70 150,100 Z
    `
  },
  {
    id: 'stencil_skull_wrenches',
    name: 'Garage Skull & Wrenches',
    category: 'stencil',
    defaultColor: '#ffffff',
    renderType: 'svg',
    description: 'Outlaw garage pirate skull logo',
    pathSvg: `
      M0,-150 C-80,-150 -140,-90 -140,-10 C-140,50 -110,90 -80,110 L-80,170 L80,170 L80,110 C110,90 140,50 140,-10 C140,-90 80,-150 0,-150 Z
      M-80,-20 A30,30 0 1,1 -80,-21 Z M80,-20 A30,30 0 1,1 80,-21 Z M0,50 L-30,90 L30,90 Z
      M-60,150 L-60,170 M-20,150 L-20,170 M20,150 L20,170 M60,150 L60,170
    `
  },

  // --- SPONSOR LOGOS ---
  {
    id: 'sponsor_pegassi',
    name: 'PEGASSI Supercars',
    category: 'sponsor',
    defaultColor: '#ffea00',
    renderType: 'text',
    description: 'Italian supercar manufacturer logo',
  },
  {
    id: 'sponsor_grotti',
    name: 'GROTTI Corse',
    category: 'sponsor',
    defaultColor: '#ff0055',
    renderType: 'text',
    description: 'High performance racing team logo',
  },
  {
    id: 'sponsor_sprunk',
    name: 'SPRUNK Extreme',
    category: 'sponsor',
    defaultColor: '#39ff14',
    renderType: 'text',
    description: 'Fuel your high-octane lifestyle',
  },
  {
    id: 'sponsor_ecola',
    name: 'eCOLA Motorsport',
    category: 'sponsor',
    defaultColor: '#ff0000',
    renderType: 'text',
    description: 'Deliciously infectious energy',
  },
  {
    id: 'sponsor_atomic',
    name: 'ATOMIC Radial Tires',
    category: 'sponsor',
    defaultColor: '#ffea00',
    renderType: 'text',
    description: 'High velocity performance rubber',
  },

  // --- BULLET HOLES & SCRATCHES ---
  {
    id: 'bullet_holes_pack',
    name: 'Bullet Hole Cluster',
    category: 'bullet',
    defaultColor: '#1a1a1a',
    secondaryColor: '#aaaaaa',
    renderType: 'svg',
    description: 'Realistic metal bullet impacts with dent ring',
    pathSvg: `
      M-100,-100 A25,25 0 1,1 -100,-101 Z M-100,-100 A10,10 0 1,0 -100,-101 Z
      M-20,-50 A20,20 0 1,1 -20,-51 Z M-20,-50 A8,8 0 1,0 -20,-51 Z
      M-60,20 A28,28 0 1,1 -60,19 Z M-60,20 A12,12 0 1,0 -60,19 Z
    `
  },
  {
    id: 'scratch_claw_marks',
    name: 'Metal Scratch gouges',
    category: 'bullet',
    defaultColor: '#888888',
    renderType: 'svg',
    description: 'Deep side panel battle damage gouges',
    pathSvg: `
      M-200,-150 L50,100 L60,90 L-190,-160 Z
      M-150,-170 L100,80 L110,70 L-140,-180 Z
      M-100,-190 L150,60 L160,50 L-90,-200 Z
    `
  },

  // --- LICENSE PLATES ---
  {
    id: 'plate_vice_pink',
    name: 'Vice City Sunset Plate',
    category: 'plate',
    defaultColor: '#ffffff',
    renderType: 'plate',
    description: '80s Vice City pink palm tree custom plate',
  },
  {
    id: 'plate_yellow_blue',
    name: 'Classic San Andreas Blue',
    category: 'plate',
    defaultColor: '#ffea00',
    renderType: 'plate',
    description: 'Vintage blue plate with bold yellow font',
  },
  {
    id: 'plate_black_gold',
    name: 'Outlaw Black & Gold',
    category: 'plate',
    defaultColor: '#ffea00',
    renderType: 'plate',
    description: 'Sleek matte black plate with metallic gold lettering',
  }
];
