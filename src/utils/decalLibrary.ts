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
    pathSvg: 'M380,0 L440,0 L440,1024 L380,1024 Z M584,0 L644,0 L644,1024 L584,1024 Z'
  },
  {
    id: 'stripe_asymmetric_rally',
    name: 'Asymmetric Offset Rally Stripe',
    category: 'stripe',
    defaultColor: '#ff007f',
    secondaryColor: '#ffffff',
    renderType: 'svg',
    description: 'Aggressive offset rally stripe with thin accent line',
    pathSvg: 'M250,0 L370,0 L370,1024 L250,1024 Z M390,0 L405,0 L405,1024 L390,1024 Z'
  },
  {
    id: 'stripe_checkered_side',
    name: 'Checkered Flag Side Banner',
    category: 'stripe',
    defaultColor: '#ffffff',
    renderType: 'svg',
    description: 'Racing checkered pattern banner',
    pathSvg: `
      M100,200 L900,200 L900,280 L100,280 Z
      M100,200 L150,200 L150,240 L100,240 Z M200,200 L250,200 L250,240 L200,240 Z M300,200 L350,200 L350,240 L300,240 Z
      M400,200 L450,200 L450,240 L400,240 Z M500,200 L550,200 L550,240 L500,240 Z M600,200 L650,200 L650,240 L600,240 Z
      M700,200 L750,200 L750,240 L700,240 Z M800,200 L850,200 L850,240 L800,240 Z
      M150,240 L200,240 L200,280 L150,280 Z M250,240 L300,240 L300,280 L250,280 Z M350,240 L400,240 L400,280 L350,280 Z
      M450,240 L500,240 L500,280 L450,280 Z M550,240 L600,240 L600,280 L550,280 Z M650,240 L700,240 L700,280 L650,280 Z
      M750,240 L800,240 L800,280 L750,280 Z M850,240 L900,240 L900,280 L850,280 Z
    `
  },
  {
    id: 'stripe_side_spear',
    name: 'Door Panel Spear Stripe',
    category: 'stripe',
    defaultColor: '#00f0ff',
    renderType: 'svg',
    description: 'Sharp aerodynamic door accent stripe',
    pathSvg: 'M50,500 L850,480 L950,530 L100,530 Z'
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
      M100,500 C150,400 200,300 250,450 C300,250 350,200 450,400 C500,150 600,200 750,500 
      C600,420 500,460 450,500 C380,480 320,520 250,500 C180,520 120,480 100,500 Z
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
      M100,450 L300,350 L250,420 L500,300 L420,400 L700,250 L580,420 L900,380 L650,480 L400,470 L200,480 Z
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
      M450,550 A150,150 0 0,1 750,550 Z
      M580,550 C570,450 560,350 540,250 C570,260 620,280 660,310 M540,250 C510,240 450,260 400,300 M540,250 C530,200 520,150 480,120 M540,250 C560,200 600,160 650,140
      M640,550 C650,470 660,390 680,310 C700,320 740,340 780,370 M680,310 C660,290 610,300 570,330
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
      M480,600 C470,480 450,380 400,280 C440,290 500,320 540,360 M400,280 C360,260 300,280 250,330 M400,280 C390,220 370,160 320,120 M400,280 C430,220 480,180 540,160
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
      M280,300 C280,240 380,240 380,300 C380,340 360,360 330,380 C380,400 390,440 390,500 C390,580 270,580 270,500 C270,440 290,400 330,380 C290,360 280,340 280,300 Z
      M315,280 C315,270 345,270 345,280 C345,300 315,300 315,280 Z M310,500 C310,470 350,470 350,500 C350,530 310,530 310,500 Z
      M550,300 C550,240 650,240 650,300 C650,340 630,360 600,380 C650,400 660,440 660,500 C660,580 540,580 540,500 C540,440 560,400 600,380 C560,360 550,340 550,300 Z
      M585,280 C585,270 615,270 615,280 C615,300 585,300 585,280 Z M580,500 C580,470 620,470 620,500 C620,530 580,530 580,500 Z
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
      M500,200 C420,200 360,260 360,340 C360,400 390,440 420,460 L420,520 L580,520 L580,460 C610,440 640,400 640,340 C640,260 580,200 500,200 Z
      M420,330 A30,30 0 1,1 420,329 Z M580,330 A30,30 0 1,1 580,329 Z M500,400 L470,440 L530,440 Z
      M440,500 L440,520 M480,500 L480,520 M520,500 L520,520 M560,500 L560,520
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
      M300,300 A25,25 0 1,1 300,299 Z M300,300 A10,10 0 1,0 300,299 Z
      M380,350 A20,20 0 1,1 380,349 Z M380,350 A8,8 0 1,0 380,349 Z
      M340,420 A28,28 0 1,1 340,419 Z M340,420 A12,12 0 1,0 340,419 Z
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
      M200,200 L450,450 L460,440 L210,190 Z
      M250,180 L500,430 L510,420 L260,170 Z
      M300,160 L550,410 L560,400 L310,150 Z
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
