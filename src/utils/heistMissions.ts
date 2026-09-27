import { HeistMission, GetawayVehicleType } from '../types';

export function createSvgDataUrl(svgString: string): string {
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

//  SVG Evidence Canvas Generators 

const CAR_EVIDENCE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="#0c0e14"/>
  <rect x="20" y="20" width="984" height="984" fill="none" stroke="#ff0055" stroke-width="2" stroke-dasharray="16,8" opacity="0.4"/>
  <path d="M0,512 L1024,512 M512,0 L512,1024" stroke="#00f0ff" stroke-width="1" opacity="0.15"/>

  <!-- Road -->
  <path d="M50,850 L974,850 L850,550 L174,550 Z" fill="#151922"/>
  <line x1="512" y1="550" x2="512" y2="850" stroke="#ffea00" stroke-width="6" stroke-dasharray="40,30"/>

  <!-- Red Sports Car -->
  <g id="car-chassis">
    <ellipse cx="512" cy="740" rx="340" ry="60" fill="rgba(0,0,0,0.8)"/>
    <path d="M220,720 Q240,630 340,610 Q420,540 512,540 Q604,540 684,610 Q784,630 804,720 Q784,770 240,770 Z" fill="#dc2626"/>
    <path d="M340,610 Q410,540 512,540 Q614,540 684,610 Z" fill="#991b1b"/>
    <path d="M360,610 Q420,555 512,555 Q604,555 664,610 Z" fill="#1e293b" stroke="#00f0ff" stroke-width="2"/>

    <!-- Damaged Bumper -->
    <path d="M220,720 C240,740 260,710 275,750 Z" fill="#111827" stroke="#ff0000" stroke-width="3"/>
    <text x="200" y="795" fill="#ef4444" font-family="monospace" font-size="18" font-weight="bold">[DAMAGED BUMPER]</text>

    <!-- License Plate VC-4821 -->
    <rect x="432" y="735" width="160" height="34" fill="#ffffff" stroke="#1e293b" stroke-width="3" rx="4"/>
    <rect x="436" y="739" width="152" height="26" fill="#fef08a" rx="2"/>
    <text x="512" y="758" fill="#0f172a" font-family="sans-serif" font-size="20" font-weight="900" text-anchor="middle" letter-spacing="3">VC-4821</text>
  </g>

  <!-- CCTV Telemetry -->
  <text x="50" y="60" fill="#00f0ff" font-family="monospace" font-size="22" font-weight="bold">CAM 047 - DOWNTOWN INTERSECTION</text>
  <text x="50" y="90" fill="#ff0055" font-family="monospace" font-size="18">TARGET: RED SPORTS CAR | LIC: VC-4821</text>
</svg>
`;

const BIKE_EVIDENCE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="#090d16"/>
  <text x="50" y="60" fill="#00f0ff" font-family="monospace" font-size="22" font-weight="bold">HIGHWAY CAM #102 - SPEED TRAP</text>
  <text x="50" y="90" fill="#ffea00" font-family="monospace" font-size="18">SPEED: 184 MPH | SUSPECT: MOTORBIKE</text>

  <!-- Motorbike & Rider -->
  <g id="bike-body">
    <ellipse cx="512" cy="730" rx="260" ry="35" fill="rgba(0,0,0,0.8)"/>
    <circle cx="340" cy="700" r="75" fill="#1e293b" stroke="#00f0ff" stroke-width="12"/>
    <circle cx="684" cy="700" r="75" fill="#1e293b" stroke="#00f0ff" stroke-width="12"/>
    <path d="M340,700 L450,600 L560,630 L684,700 Z" fill="none" stroke="#dc2626" stroke-width="28"/>
    
    <!-- Helmet & Jacket -->
    <circle cx="480" cy="450" r="45" fill="#ef4444" stroke="#ffffff" stroke-width="4"/>
    <path d="M450,490 L520,530 L480,610 L430,570 Z" fill="#dc2626" stroke="#facc15" stroke-width="4"/>
    <text x="530" y="550" fill="#facc15" font-family="sans-serif" font-size="16" font-weight="900">PHANTOM-99</text>
  </g>
</svg>
`;

// Train Multi-Image SVGs
const TRAIN_CAM_01_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="#0f172a"/>
  <text x="50" y="60" fill="#39ff14" font-family="monospace" font-size="22" font-weight="bold">CAMERA 01 - STATION APPROACH</text>
  <rect x="200" y="300" width="624" height="300" fill="#090d16" stroke="#00f0ff" stroke-width="4"/>
  <text x="512" y="470" fill="#ffea00" font-family="monospace" font-size="52" font-weight="900" text-anchor="middle">APPROACHING: DOWNTOWN</text>
</svg>
`;

const TRAIN_CAM_02_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="#0f172a"/>
  <text x="50" y="60" fill="#39ff14" font-family="monospace" font-size="22" font-weight="bold">CAMERA 02 - TRAIN FRONT ENGINE</text>
  <rect x="150" y="250" width="724" height="500" fill="#1e293b" stroke="#38bdf8" stroke-width="6"/>
  <text x="512" y="480" fill="#39ff14" font-family="monospace" font-size="44" font-weight="bold" text-anchor="middle">HIJACKED EXPRESS #809</text>
</svg>
`;

const TRAIN_CAM_03_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="#0f172a"/>
  <text x="50" y="60" fill="#39ff14" font-family="monospace" font-size="22" font-weight="bold">CAMERA 03 - DESTINATION LED BOARD</text>
  <rect x="150" y="200" width="724" height="380" fill="#020617" stroke="#3b82f6" stroke-width="12" rx="16"/>
  <text x="512" y="380" fill="#ffea00" font-family="monospace" font-size="64" font-weight="900" text-anchor="middle">DOWNTOWN</text>
  <text x="512" y="460" fill="#ff0055" font-family="monospace" font-size="32" text-anchor="middle">EXPRESS - PLATFORM 4</text>
</svg>
`;

const TRAIN_CAM_04_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="#0f172a"/>
  <text x="50" y="60" fill="#39ff14" font-family="monospace" font-size="22" font-weight="bold">CAMERA 04 - PLATFORM SIGNAGE</text>
  <rect x="250" y="300" width="524" height="240" fill="#020617" stroke="#ffea00" stroke-width="6"/>
  <text x="512" y="420" fill="#ffffff" font-family="sans-serif" font-size="40" font-weight="900" text-anchor="middle">NEXT STOP: DOWNTOWN</text>
</svg>
`;

const BOAT_EVIDENCE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="#030712"/>
  <path d="M0,400 Q250,370 500,400 T1024,400 L1024,1024 L0,1024 Z" fill="#0c4a6e"/>
  <text x="50" y="60" fill="#00f0ff" font-family="monospace" font-size="22" font-weight="bold">MARINA CCTV - HARBOR SWEEP</text>
  
  <g id="speedboat">
    <ellipse cx="512" cy="660" rx="360" ry="70" fill="rgba(0,0,0,0.6)"/>
    <path d="M180,620 L840,620 L760,700 L260,700 Z" fill="#0f172a" stroke="#ffffff" stroke-width="4"/>
    <text x="512" y="665" fill="#facc15" font-family="sans-serif" font-size="36" font-weight="bold" text-anchor="middle">BLACK FIN</text>
    <text x="512" y="695" fill="#ffffff" font-family="monospace" font-size="16" text-anchor="middle">REG: VC-207</text>
  </g>
</svg>
`;

const HELICOPTER_EVIDENCE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="#020617"/>
  <circle cx="512" cy="512" r="400" fill="none" stroke="#22c55e" stroke-width="2" opacity="0.3"/>
  <text x="50" y="60" fill="#22c55e" font-family="monospace" font-size="22" font-weight="bold">AIR TRAFFIC RADAR CAM #09</text>

  <g id="chopper">
    <ellipse cx="512" cy="512" rx="140" ry="240" fill="#0f172a" stroke="#ef4444" stroke-width="6"/>
    <rect x="442" y="680" width="140" height="40" fill="#1e293b" stroke="#facc15" stroke-width="2"/>
    <text x="512" y="707" fill="#facc15" font-family="monospace" font-size="20" font-weight="900" text-anchor="middle">N-882VC</text>
  </g>
</svg>
`;

//  6 Interconnected Getaway Story Missions 

export const HEIST_MISSIONS: HeistMission[] = [
  {
    id: 'mission-car',
    vehicleType: 'car',
    mechanicType: 'vehicle_disguise',
    title: 'The Red Ghost',
    codename: 'THE GHOST',
    location: 'Downtown Intersection',
    difficulty: 'EASY',
    cashReward: 5000,
    heatLevel: 2,
    mechanicBadgeLabel: 'VEHICLE DISGUISE & HEAT METER',
    mechanicDescription: 'Change vehicle color, obscure plate VC-4821, and repair bumper damage to drop camera confidence.',
    briefingText: '11:47 PM. Downtown camera captured your red sports car. Change the color, hide the plate, and fix the damage before police match confidence reaches 100%.',
    detectiveNote: 'CAMERA DATABASE: Scan all feeds for red car, plate VC-4821, front damage.',
    evidencePhotoTitle: 'SECURITY PHOTO #047',
    evidencePhotoSub: 'Interception Cam 047 - Downtown',
    evidenceCanvasSvg: createSvgDataUrl(CAR_EVIDENCE_SVG),
    objectives: [
      { id: 'obj-car-color', category: 'color_respray', title: 'Respray Car Color', description: 'Paint red chassis dark black or cyan.', targetRegionLabel: 'Chassis Body', targetRegion: 'car_body_color' },
      { id: 'obj-car-plate', category: 'plate_obscure', title: 'Obscure License Plate', description: 'Cover license plate text VC-4821.', targetRegionLabel: 'License Plate', targetRegion: 'license_plate' },
      { id: 'obj-car-damage', category: 'damage_repair', title: 'Remove Bumper Damage', description: 'Disguise front bumper collision scrapings.', targetRegionLabel: 'Front Bumper', targetRegion: 'front_bumper' }
    ],
    initialNarrative: 'Detectives locked onto Security Photo #047. The red sports car is flagged across all city checkpoints.',
    successHeadline: 'CAMERA DATABASE UPDATED',
    successNarrative: 'Vehicle match confidence dropped to 12%. The edited black car replaces your red car in the subsequent story cutscene!',
    failureNarrative: 'Camera database matched your vehicle profile. Heat level increased by +1.'
  },
  {
    id: 'mission-bike',
    vehicleType: 'bike',
    mechanicType: 'identity_matrix',
    title: 'The Phantom Seen',
    codename: 'THE PHANTOM',
    location: 'Interstate Highway 102',
    difficulty: 'MEDIUM',
    cashReward: 8500,
    heatLevel: 3,
    mechanicBadgeLabel: 'IDENTITY BREAKDOWN MATRIX',
    mechanicDescription: 'Tracks Vehicle Match %, Rider Match %, and Color Match %. Overall identity match must be under 20%.',
    briefingText: 'You never leave your identity behind. But tonight, a speed trap caught your red helmet and PHANTOM-99 jacket. Alter your visual identity before the next camera scan.',
    detectiveNote: 'ALERT: Highway units monitor toll plazas for rider with red helmet & sponsor jacket.',
    evidencePhotoTitle: 'HIGHWAY CAM #102',
    evidencePhotoSub: 'Speed Trap 102 - Interstate',
    evidenceCanvasSvg: createSvgDataUrl(BIKE_EVIDENCE_SVG),
    objectives: [
      { id: 'obj-bike-helmet', category: 'color_respray', title: 'Disguise Helmet', description: 'Change red helmet color to black.', targetRegionLabel: 'Rider Helmet', targetRegion: 'helmet' },
      { id: 'obj-bike-jacket', category: 'text_modify', title: 'Cover Jacket Logo', description: 'Cover PHANTOM-99 sponsor text.', targetRegionLabel: 'Rider Jacket', targetRegion: 'jacket' },
      { id: 'obj-bike-decal', category: 'marking_remove', title: 'Alter Bike Decals', description: 'Remove red bike racing stripes.', targetRegionLabel: 'Bike Chassis', targetRegion: 'callsign_text' }
    ],
    initialNarrative: 'Highway patrol locked onto your red helmet signature at toll plazas.',
    successHeadline: 'IDENTITY MATCH REDUCED TO 14%',
    successNarrative: 'Identity match dropped below threshold! Story Twist: Someone else is using your Phantom identity.',
    failureNarrative: 'Rider identity match exceeded 65%. Toll cameras flagged your position.'
  },
  {
    id: 'mission-train',
    vehicleType: 'train',
    mechanicType: 'multi_image_consistency',
    title: 'Change The Route',
    codename: 'THE RUNAWAY',
    location: 'Central Metro Terminal',
    difficulty: 'HARD',
    cashReward: 14000,
    heatLevel: 4,
    mechanicBadgeLabel: 'MULTI-IMAGE EVIDENCE CONSISTENCY',
    mechanicDescription: 'Edit 4 distinct surveillance images (Station, Train, Board, Platform). All 4 MUST tell the exact same story!',
    briefingText: 'A mysterious package is on the train. The city is tracking it, but doesn\'t know the destination. Edit all 4 evidence photos to change DOWNTOWN to HARBOR.',
    detectiveNote: 'CRITICAL: Intercept Express Train #809 at Downtown Station Platform 4.',
    evidencePhotoTitle: 'MULTI-IMAGE EVIDENCE SET (4 CAMERAS)',
    evidencePhotoSub: 'Central Station Terminal Cameras 01-04',
    evidenceCanvasSvg: createSvgDataUrl(TRAIN_CAM_03_SVG),
    evidencePhotos: [
      { id: 'cam-01', title: 'Camera 01 - Approach', subtitle: 'Station Approach Cam', svgDataUrl: createSvgDataUrl(TRAIN_CAM_01_SVG) },
      { id: 'cam-02', title: 'Camera 02 - Train Front', subtitle: 'Train Front Engine Cam', svgDataUrl: createSvgDataUrl(TRAIN_CAM_02_SVG) },
      { id: 'cam-03', title: 'Camera 03 - LED Board', subtitle: 'Destination Board Cam', svgDataUrl: createSvgDataUrl(TRAIN_CAM_03_SVG) },
      { id: 'cam-04', title: 'Camera 04 - Platform', subtitle: 'Platform Sign Cam', svgDataUrl: createSvgDataUrl(TRAIN_CAM_04_SVG) }
    ],
    objectives: [
      { id: 'obj-train-dest', category: 'text_modify', title: 'Change Destination to HARBOR', description: 'Modify DOWNTOWN to HARBOR across all camera views.', targetRegionLabel: 'Destination Board', targetRegion: 'destination_text' },
      { id: 'obj-train-consist', category: 'text_modify', title: 'Cross-Image Consistency', description: 'Ensure all 4 images report HARBOR destination.', targetRegionLabel: 'Multi-Image Set', targetRegion: 'header_bar' }
    ],
    initialNarrative: 'Police SWAT units are converging on Downtown Station based on Camera 03.',
    successHeadline: 'ROUTE DATABASE CORRUPTED',
    successNarrative: 'Consistency Check: 100% Match! All 4 cameras report Harbor. Track switches rerouted the train automatically!',
    failureNarrative: 'Consistency Check Failed: Camera 03 said Harbor, but Camera 01 said Downtown. Police spotted the discrepancy.'
  },
  {
    id: 'mission-boat',
    vehicleType: 'boat',
    mechanicType: 'environment_context',
    title: 'Make Vessel Disappear',
    codename: 'THE SMUGGLER',
    location: 'Vice City Marina',
    difficulty: 'EXPERT',
    cashReward: 20000,
    heatLevel: 4,
    mechanicBadgeLabel: 'ENVIRONMENT & CONTEXT EDITING',
    mechanicDescription: 'Alter vessel name (BLACK FIN to BLUE MOON), reg VC-207, and edit the marina environment context.',
    briefingText: 'Harbor cameras know what your boat looks like. Change BLACK FIN to BLUE MOON, update registration, and alter the marina environment context.',
    detectiveNote: 'COASTGUARD MANDATE: Intercept black speedboat named BLACK FIN, reg VC-207.',
    evidencePhotoTitle: 'MARINA SURVEILLANCE PHOTO',
    evidencePhotoSub: 'Harbor Channel Sweep',
    evidenceCanvasSvg: createSvgDataUrl(BOAT_EVIDENCE_SVG),
    objectives: [
      { id: 'obj-boat-name', category: 'text_modify', title: 'Change Name to BLUE MOON', description: 'Overwrite BLACK FIN with BLUE MOON.', targetRegionLabel: 'Vessel Hull Name', targetRegion: 'vessel_name' },
      { id: 'obj-boat-reg', category: 'text_modify', title: 'Update Reg to VC-913', description: 'Modify registration number VC-207 to VC-913.', targetRegionLabel: 'Registration Number', targetRegion: 'registration' },
      { id: 'obj-boat-env', category: 'environment_alter', title: 'Edit Marina Context', description: 'Alter harbor background lighting & water reflections.', targetRegionLabel: 'Marina Environment', targetRegion: 'background' }
    ],
    initialNarrative: 'Coastguard cutters are establishing a perimeter around Marina Dock 4.',
    successHeadline: 'HARBOR CONTROL: NO MATCH FOUND',
    successNarrative: 'Vessel re-identified as BLUE MOON (VC-913) at a different harbor location. Cutters disengaged!',
    failureNarrative: 'Coastguard spotters matched vessel hull structure. Pursuit initiated.'
  },
  {
    id: 'mission-chopper',
    vehicleType: 'helicopter',
    mechanicType: 'reality_check',
    title: 'Skyline Extraction',
    codename: 'SKYLINE',
    location: 'Metropolitan Airspace',
    difficulty: 'INSANE',
    cashReward: 35000,
    heatLevel: 5,
    mechanicBadgeLabel: 'REALITY & ADVANCED CONSISTENCY CHECK',
    mechanicDescription: 'Modify callsign N-882VC while maintaining physical lighting & skyline consistency.',
    briefingText: 'Final extraction point. Military radar tracked callsign N-882VC. Rewrite the callsign and disguise the searchlight while preserving realistic lighting consistency.',
    detectiveNote: 'MAX HEAT: Fighter jet patrol dispatched to intercept N-882VC.',
    evidencePhotoTitle: 'AIR TRAFFIC RADAR CAM #09',
    evidencePhotoSub: 'Skyline Perimeter',
    evidenceCanvasSvg: createSvgDataUrl(HELICOPTER_EVIDENCE_SVG),
    objectives: [
      { id: 'obj-chopper-reg', category: 'text_modify', title: 'Modify Tail Callsign', description: 'Change tail callsign N-882VC.', targetRegionLabel: 'Tail Fin Callsign', targetRegion: 'tail_callsign' },
      { id: 'obj-chopper-reality', category: 'marking_remove', title: 'Preserve Skyline Consistency', description: 'Maintain realistic lighting & physical shadow consistency.', targetRegionLabel: 'Physical Lighting', targetRegion: 'sky_region' }
    ],
    initialNarrative: 'Fighter jets locked onto callsign N-882VC in metropolitan airspace.',
    successHeadline: 'AIRSPACE CLEARANCE APPROVED',
    successNarrative: 'Reality Check: 94% Consistency! Radar registered callsign as authorized medical transport.',
    failureNarrative: 'Visual consistency check failed. Fighter jet escort forced emergency landing.'
  },
  {
    id: 'mission-final',
    vehicleType: 'final',
    mechanicType: 'final_speed_run',
    title: 'Neon Escape Final',
    codename: 'NEON ESCAPE',
    location: 'Metropolitan Grid',
    difficulty: 'INSANE',
    cashReward: 100000,
    heatLevel: 5,
    mechanicBadgeLabel: '90-SECOND MULTI-EVIDENCE SPEED RUN',
    mechanicDescription: 'The city connected all evidence across Car, Bike, Train, Boat, and Chopper. You have 90 seconds to rewrite the connected evidence set!',
    briefingText: 'The city has connected all evidence files. You have 90 seconds to rewrite the connected evidence set and generate a final ESCAPE REPORT.',
    detectiveNote: 'MAXIMUM ALERT: City central AI synthesizing cross-vehicle evidence match.',
    evidencePhotoTitle: 'CONNECTED CITY EVIDENCE FILE',
    evidencePhotoSub: 'Central Intelligence Database',
    evidenceCanvasSvg: createSvgDataUrl(CAR_EVIDENCE_SVG),
    objectives: [
      { id: 'obj-final-rewrite', category: 'text_modify', title: 'Rewrite Connected Evidence', description: 'Alter connected vehicle evidence before 90s timer expires.', targetRegionLabel: 'Central Intelligence File', targetRegion: 'full_frame' }
    ],
    initialNarrative: 'City central AI is 90 seconds away from executing a total city lockdown.',
    successHeadline: 'ESCAPE REPORT STATUS: CLEAR',
    successNarrative: 'ESCAPE REPORT: Vehicle Identity 12%, Visual Consistency 94%, Evidence Match 8%. ESCAPE SUCCESSFUL!',
    failureNarrative: 'Time expired before evidence set was rewritten. City AI initiated lockdown.'
  }
];
