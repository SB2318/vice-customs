import { HeistMission, ForgeryValidationResult, EditingMechanicType } from '../types';
import { EDIT_DETECTION_THRESHOLD, PIXEL_CHANGE_SENSITIVITY, CANVAS_SIZE } from '../constants';

// Region Definitions
// Coordinates are in the 1024×1024 SVG / canvas space.

interface SamplingRegion {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Key regions per mechanic that the player is expected to edit. */
const MECHANIC_REGIONS: Record<EditingMechanicType, SamplingRegion[]> = {
  vehicle_disguise: [
    { name: 'license_plate',    x: 430, y: 730, w: 165, h: 40  },
    { name: 'car_body_color',   x: 280, y: 580, w: 460, h: 150 },
    { name: 'front_bumper',     x: 200, y: 700, w: 100, h: 80  },
  ],
  identity_matrix: [
    { name: 'helmet',           x: 435, y: 405, w: 95,  h: 95  },
    { name: 'jacket',           x: 420, y: 480, w: 120, h: 140 },
    { name: 'callsign_text',    x: 490, y: 500, w: 200, h: 70  },
  ],
  multi_image_consistency: [
    { name: 'destination_text', x: 160, y: 380, w: 704, h: 200 },
    { name: 'header_bar',       x: 0,   y: 0,   w: 1024,h: 120 },
  ],
  environment_context: [
    { name: 'vessel_name',      x: 100, y: 400, w: 500, h: 120 },
    { name: 'registration',     x: 100, y: 530, w: 300, h: 80  },
    { name: 'background',       x: 0,   y: 700, w: 1024,h: 300 },
  ],
  reality_check: [
    { name: 'tail_callsign',    x: 300, y: 200, w: 420, h: 120 },
    { name: 'sky_region',       x: 0,   y: 0,   w: 1024,h: 300 },
  ],
  final_speed_run: [
    { name: 'full_frame',       x: 0,   y: 0,   w: 1024,h: 1024 },
  ],
};

// Pixel Analysis Helpers

/**
 * Draws an image source (data URL or SVG data URL) into an offscreen canvas
 * and returns the pixel data for the requested region.
 */
function sampleRegion(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  region: SamplingRegion,
): Uint8ClampedArray {
  return ctx.getImageData(region.x, region.y, region.w, region.h).data;
}

/**
 * Returns the fraction of pixels that differ by at least `sensitivity`
 * in any R/G/B channel between two same-size Uint8ClampedArray buffers.
 */
function changedPixelFraction(
  original: Uint8ClampedArray,
  edited: Uint8ClampedArray,
  sensitivity: number = PIXEL_CHANGE_SENSITIVITY,
): number {
  const pixelCount = original.length / 4;
  let changedCount = 0;

  for (let i = 0; i < original.length; i += 4) {
    const dr = Math.abs(original[i]     - edited[i]);
    const dg = Math.abs(original[i + 1] - edited[i + 1]);
    const db = Math.abs(original[i + 2] - edited[i + 2]);
    if (dr > sensitivity || dg > sensitivity || db > sensitivity) {
      changedCount++;
    }
  }

  return changedCount / pixelCount;
}

/**
 * Renders a data URL into a 1024×1024 OffscreenCanvas (or regular Canvas
 * in environments that don't support OffscreenCanvas) and returns the 2D ctx.
 */
async function renderDataUrl(
  dataUrl: string,
): Promise<CanvasRenderingContext2D> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d')!;

  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      resolve();
    };
    img.onerror = () => reject(new Error('Failed to load image for analysis'));
    img.src = dataUrl;
  });

  return ctx;
}

//  Per-Region Analysis  

interface RegionResult {
  name: string;
  changeFraction: number;
  edited: boolean;
}

async function analyzeRegions(
  originalCtx: CanvasRenderingContext2D,
  editedCtx: CanvasRenderingContext2D,
  regions: SamplingRegion[],
): Promise<RegionResult[]> {
  return regions.map((region) => {
    const original = sampleRegion(originalCtx, region);
    const edited   = sampleRegion(editedCtx,   region);
    const changeFraction = changedPixelFraction(original, edited);
    return {
      name: region.name,
      changeFraction,
      edited: changeFraction >= EDIT_DETECTION_THRESHOLD,
    };
  });
}

//  Mechanic-Specific Scoring 

function buildVehicleDisguiseResult(
  regions: RegionResult[],
  editedDataUrl: string,
  mission: HeistMission,
): ForgeryValidationResult {
  const plate   = regions.find(r => r.name === 'license_plate');
  const body    = regions.find(r => r.name === 'car_body_color');
  const bumper  = regions.find(r => r.name === 'front_bumper');

  const objectivesCompleted: string[] = [];
  const feedbackNotes: string[] = [];

  if (plate?.edited) {
    objectivesCompleted.push(mission.objectives.find(o => o.category === 'plate_obscure')?.id ?? '');
    feedbackNotes.push('[VERIFIED] License plate obscured — match confidence dropped.');
  } else {
    feedbackNotes.push('[WARNING] License plate region unchanged — still identifiable.');
  }

  if (body?.edited) {
    objectivesCompleted.push(mission.objectives.find(o => o.category === 'color_respray')?.id ?? '');
    feedbackNotes.push(`[VERIFIED] Chassis color altered (${Math.round((body.changeFraction) * 100)}% pixels changed).`);
  } else {
    feedbackNotes.push('[WARNING] Vehicle color unchanged — original paint still detectable.');
  }

  if (bumper?.edited) {
    objectivesCompleted.push(mission.objectives.find(o => o.category === 'damage_repair')?.id ?? '');
    feedbackNotes.push('[VERIFIED] Front bumper damage concealed.');
  } else {
    feedbackNotes.push('[ADVISORY] Bumper damage still visible — raises suspicion.');
  }

  const validIds = objectivesCompleted.filter(Boolean);
  const editedCount  = regions.filter(r => r.edited).length;
  const totalRegions = regions.length;
  const rawScore     = Math.round((editedCount / totalRegions) * 100);
  // Heat goes down as more edits are made
  const heatLevelPct = Math.max(5, 100 - rawScore * 1.1 - (plate?.edited ? 30 : 0));
  const passed       = validIds.length >= Math.ceil(mission.objectives.length * 0.5);

  feedbackNotes.push(
    passed
      ? `CAMERA DATABASE: Vehicle match confidence dropped to ${Math.round(heatLevelPct / 5)}%.`
      : 'ALERT: Insufficient modifications — vehicle still identifiable.',
  );

  return {
    passed,
    score: rawScore,
    mechanicType: 'vehicle_disguise',
    heatLevelPct: Math.round(heatLevelPct),
    objectivesCompleted: validIds,
    feedbackNotes,
    editedImageDataUrl: editedDataUrl,
  };
}

function buildIdentityMatrixResult(
  regions: RegionResult[],
  editedDataUrl: string,
  mission: HeistMission,
): ForgeryValidationResult {
  const helmet   = regions.find(r => r.name === 'helmet');
  const jacket   = regions.find(r => r.name === 'jacket');
  const callsign = regions.find(r => r.name === 'callsign_text');

  const vehicleMatch = helmet?.edited   ? Math.round(helmet.changeFraction   * 30)  : 85;
  const riderMatch   = jacket?.edited   ? Math.round(jacket.changeFraction   * 30)  : 90;
  const colorMatch   = callsign?.edited ? Math.round(callsign.changeFraction * 25)  : 80;
  const overall      = Math.round((vehicleMatch + riderMatch + colorMatch) / 3);

  const feedbackNotes = [
    `[MATRIX] Vehicle Match: ${vehicleMatch}%`,
    `[MATRIX] Rider Match: ${riderMatch}%`,
    `[MATRIX] Color Match: ${colorMatch}%`,
  ];

  const passed = overall < 20;
  feedbackNotes.push(
    passed
      ? `[VERIFIED] Overall identity match (${overall}%) below 20% threshold!`
      : `[ALERT] Identity match (${overall}%) still too high — more disguise needed.`,
  );

  const objectivesCompleted = mission.objectives
    .filter(o => {
      if (o.category === 'color_respray'   && helmet?.edited)   return true;
      if (o.category === 'marking_remove'  && callsign?.edited) return true;
      if (o.category === 'damage_repair'   && jacket?.edited)   return true;
      return false;
    })
    .map(o => o.id);

  return {
    passed,
    score: 100 - overall,
    mechanicType: 'identity_matrix',
    vehicleMatchPct: vehicleMatch,
    riderMatchPct: riderMatch,
    colorMatchPct: colorMatch,
    overallIdentityPct: overall,
    objectivesCompleted,
    feedbackNotes,
    editedImageDataUrl: editedDataUrl,
  };
}

function buildMultiImageResult(
  regions: RegionResult[],
  editedDataUrl: string,
  mission: HeistMission,
  multiImages?: Record<string, string>,
): ForgeryValidationResult {
  // With multi-images, check consistency across cameras (simplified: header + destination)
  const destRegion   = regions.find(r => r.name === 'destination_text');
  const headerRegion = regions.find(r => r.name === 'header_bar');

  const editedCameras = [destRegion?.edited, headerRegion?.edited].filter(Boolean).length;
  const consistencyScorePct = multiImages
    ? Math.min(100, 60 + editedCameras * 20)
    : (destRegion?.edited ? 100 : 30);

  const passed = consistencyScorePct >= 75;

  const cameraResults = [
    { camera: 'Camera 01 - Approach',    text: destRegion?.edited   ? 'HARBOR' : 'DOWNTOWN', match: !!destRegion?.edited   },
    { camera: 'Camera 02 - Train Front', text: destRegion?.edited   ? 'HARBOR' : 'DOWNTOWN', match: !!destRegion?.edited   },
    { camera: 'Camera 03 - LED Board',   text: headerRegion?.edited ? 'HARBOR' : 'DOWNTOWN', match: !!headerRegion?.edited  },
    { camera: 'Camera 04 - Platform',    text: headerRegion?.edited ? 'HARBOR' : 'DOWNTOWN', match: !!headerRegion?.edited  },
  ];

  const feedbackNotes = cameraResults.map(
    c => `[${c.match ? 'VERIFIED' : 'MISMATCH'}] ${c.camera}: ${c.text}`,
  );
  feedbackNotes.push(
    passed
      ? 'ROUTE DATABASE CORRUPTED: Track switches rerouted train automatically!'
      : 'ALERT: Destination text inconsistency detected across camera feeds.',
  );

  return {
    passed,
    score: consistencyScorePct,
    mechanicType: 'multi_image_consistency',
    consistencyScorePct,
    imageConsistencyList: cameraResults,
    objectivesCompleted: passed ? mission.objectives.map(o => o.id) : [],
    feedbackNotes,
    editedImageDataUrl: editedDataUrl,
  };
}

function buildEnvironmentContextResult(
  regions: RegionResult[],
  editedDataUrl: string,
  mission: HeistMission,
): ForgeryValidationResult {
  const name       = regions.find(r => r.name === 'vessel_name');
  const reg        = regions.find(r => r.name === 'registration');
  const background = regions.find(r => r.name === 'background');

  const editedCount = [name, reg, background].filter(r => r?.edited).length;
  const environmentMatchPct = Math.min(100, 40 + editedCount * 20);
  const passed = editedCount >= 2;

  const feedbackNotes: string[] = [];
  if (name?.edited)       feedbackNotes.push('[VERIFIED] Vessel name altered.');
  else                    feedbackNotes.push('[WARNING] Vessel name unchanged.');
  if (reg?.edited)        feedbackNotes.push('[VERIFIED] Registration number changed.');
  else                    feedbackNotes.push('[WARNING] Registration still matches records.');
  if (background?.edited) feedbackNotes.push('[VERIFIED] Marina environment context altered.');
  feedbackNotes.push(
    passed
      ? 'HARBOR CONTROL: NO MATCH FOUND for target vessel.'
      : 'HARBOR CONTROL: Vessel still matches intercept report.',
  );

  return {
    passed,
    score: environmentMatchPct,
    mechanicType: 'environment_context',
    environmentMatchPct,
    objectivesCompleted: passed ? mission.objectives.map(o => o.id) : [],
    feedbackNotes,
    editedImageDataUrl: editedDataUrl,
  };
}

function buildRealityCheckResult(
  regions: RegionResult[],
  editedDataUrl: string,
  mission: HeistMission,
): ForgeryValidationResult {
  const callsign = regions.find(r => r.name === 'tail_callsign');
  const sky      = regions.find(r => r.name === 'sky_region');

  const callsignEdited = callsign?.edited ?? false;
  const skyEdited      = sky?.edited ?? false;
  const editedCount    = [callsignEdited, skyEdited].filter(Boolean).length;
  const realityCheckScorePct = Math.min(100, 40 + editedCount * 30);
  const passed = callsignEdited; // Callsign is mandatory

  const feedbackNotes: string[] = [];
  if (callsignEdited) feedbackNotes.push('[VERIFIED] Tail callsign altered — identity masked.');
  else                feedbackNotes.push('[WARNING] Tail callsign unchanged — still traceable.');
  if (skyEdited)      feedbackNotes.push(`[REALITY CHECK ${realityCheckScorePct}%] Skyline lighting consistency verified.`);
  feedbackNotes.push(
    passed
      ? 'AIRSPACE CLEARANCE APPROVED: Radar registered as medical transport.'
      : 'ALERT: Callsign still matches intercept database — clearance denied.',
  );

  return {
    passed,
    score: realityCheckScorePct,
    mechanicType: 'reality_check',
    realityCheckScorePct,
    objectivesCompleted: passed ? mission.objectives.map(o => o.id) : [],
    feedbackNotes,
    editedImageDataUrl: editedDataUrl,
  };
}

function buildFinalSpeedRunResult(
  regions: RegionResult[],
  editedDataUrl: string,
  mission: HeistMission,
  timeRemainingSec?: number,
): ForgeryValidationResult {
  const fullFrame    = regions.find(r => r.name === 'full_frame');
  const changePct    = Math.round((fullFrame?.changeFraction ?? 0) * 100);
  const timeBonus    = timeRemainingSec ? Math.min(20, Math.round(timeRemainingSec / 4.5)) : 0;
  const score        = Math.min(100, changePct + timeBonus);
  const passed       = score >= 35;

  return {
    passed,
    score,
    mechanicType: 'final_speed_run',
    objectivesCompleted: passed ? mission.objectives.map(o => o.id) : [],
    feedbackNotes: [
      'FINAL ESCAPE REPORT GENERATED:',
      `• Visual Change Index: ${changePct}%`,
      `• Time Bonus: +${timeBonus} pts`,
      `• Total Score: ${score}/100`,
      passed ? 'ESCAPE STATUS: CLEAR' : 'ESCAPE STATUS: COMPROMISED — insufficient edits.',
    ],
    editedImageDataUrl: editedDataUrl,
  };
}

// Public API

/**
 * Validates the player's edited evidence image against the original SVG
 * using real pixel-level analysis.
 *
 * Each mechanic samples its own key regions and scores based on how much
 * those regions actually changed from the source material.
 */
export async function validateEvidenceForgery(
  mission: HeistMission,
  editedDataUrl: string,
  extraData?: { multiImages?: Record<string, string>; timeRemainingSec?: number },
): Promise<ForgeryValidationResult> {
  const mechanic: EditingMechanicType = mission.mechanicType || 'vehicle_disguise';
  const regions = MECHANIC_REGIONS[mechanic];

  try {
    // Render original SVG
    const originalCtx = await renderDataUrl(mission.evidenceCanvasSvg);
    // Render player's edited image
    const editedCtx   = await renderDataUrl(editedDataUrl);

    const regionResults = await analyzeRegions(originalCtx, editedCtx, regions);

    switch (mechanic) {
      case 'vehicle_disguise':
        return buildVehicleDisguiseResult(regionResults, editedDataUrl, mission);

      case 'identity_matrix':
        return buildIdentityMatrixResult(regionResults, editedDataUrl, mission);

      case 'multi_image_consistency':
        return buildMultiImageResult(regionResults, editedDataUrl, mission, extraData?.multiImages);

      case 'environment_context':
        return buildEnvironmentContextResult(regionResults, editedDataUrl, mission);

      case 'reality_check':
        return buildRealityCheckResult(regionResults, editedDataUrl, mission);

      case 'final_speed_run':
        return buildFinalSpeedRunResult(regionResults, editedDataUrl, mission, extraData?.timeRemainingSec);

      default:
        return buildVehicleDisguiseResult(regionResults, editedDataUrl, mission);
    }
  } catch (err) {
    // Graceful fallback if canvas analysis fails (e.g. CORS restriction)
    console.warn('[evidenceValidator] Pixel analysis failed, using change-detection fallback:', err);
    return {
      passed: false,
      score: 0,
      mechanicType: mechanic,
      objectivesCompleted: [],
      feedbackNotes: [
        '[ERROR] Evidence analysis engine failed to process the submitted image.',
        'Ensure the image was exported correctly from the editor and try again.',
      ],
      editedImageDataUrl: editedDataUrl,
    };
  }
}
