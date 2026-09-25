// ─── Vehicle & Mode Enumerations ─────────────────────────────────────────────

export const VEHICLE_MODELS = [
  'infernus',
  'cheetah',
  'banshee',
  'comet',
  'dominator',
  'dirtbike',
  'train',
  'boat',
  'helicopter',
] as const;

export const VIEW_MODES = ['split', '2d_only', '3d_only'] as const;

/** Camera presets exposed in the keyboard shortcut map (keys 1–8). */
export const CAMERA_PRESET_CYCLE = [
  'front_34',
  'front',
  'side',
  'rear',
  'top',
  'wheel',
  'turntable',
  'cinematic',
] as const;

export const GRAPHICS_QUALITIES = ['low', 'medium', 'high'] as const;

// ─── 2D Canvas ────────────────────────────────────────────────────────────────

/** Side length of the UV texture canvas in pixels. */
export const CANVAS_SIZE = 1024;

// ─── Resizable Split Pane ─────────────────────────────────────────────────────

/** Minimum allowed percentage for the main (horizontal) split. */
export const SPLIT_MIN_PCT = 15;
/** Maximum allowed percentage for the main (horizontal) split. */
export const SPLIT_MAX_PCT = 85;

/** Default starting position (%) for the horizontal 2D | 3D split. */
export const DEFAULT_MAIN_SPLIT_PCT = 50;
/** Default starting position (%) for the vertical canvas | toolbar split. */
export const DEFAULT_VERTICAL_SPLIT_PCT = 58;

/** Percentage at which the vertical splitter snaps to "canvas only" mode. */
export const VERTICAL_SNAP_THRESHOLD = 10;

// ─── Transition Timings ───────────────────────────────────────────────────────

/** Duration (ms) of the vehicle-swap loading overlay. */
export const VEHICLE_TRANSITION_MS = 600;
/** Duration (ms) of the app-mode switch loading overlay. */
export const MODE_TRANSITION_MS = 450;

// ─── Evidence Validator ───────────────────────────────────────────────────────

/**
 * Minimum fraction of sampled pixels (0–1) that must differ from the original
 * image before an objective region is considered "edited".
 */
export const EDIT_DETECTION_THRESHOLD = 0.08;

/**
 * Per-channel RGB distance (0–255) required to count a pixel as "changed".
 */
export const PIXEL_CHANGE_SENSITIVITY = 30;
