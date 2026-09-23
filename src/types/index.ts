export type VehicleModel = 'infernus' | 'cheetah' | 'banshee' | 'comet' | 'dominator' | 'dirtbike';

export type PaintFinish = 'gloss' | 'matte' | 'metallic' | 'pearlescent' | 'chameleon' | 'carbon' | 'rust';

export type DecalCategory = 
  | 'stripe' 
  | 'flame' 
  | 'stencil' 
  | 'bullet' 
  | 'sponsor' 
  | 'plate' 
  | 'text' 
  | 'scratch'
  | 'spray';

export type SpoilerStyle = 'stock' | 'gt_wing' | 'ducktail' | 'drag';
export type RimStyle = 'spoke' | 'cyber_dish' | 'gold_wire' | 'steelies';
export type WindowTint = 'clear' | 'dark_limo' | 'pink_neon' | 'cyan_neon';

export interface DecalLayer {
  id: string;
  name: string;
  category: DecalCategory;
  assetId: string;
  x: number; // 0 to 1024 (canvas width 1024)
  y: number; // 0 to 1024 (canvas height 1024)
  scaleX: number;
  scaleY: number;
  rotation: number; // degrees 0-360
  color: string;
  secondaryColor?: string;
  opacity: number; // 0 to 1
  flipX: boolean;
  flipY: boolean;
  zIndex: number;
  visible: boolean;
  locked?: boolean;
  customText?: string;
  fontFamily?: string;
  plateText?: string;
  plateStyle?: 'vice_pink' | 'yellow_blue' | 'black_gold' | 'neon_grid';
}

export interface LiveryState {
  vehicle: VehicleModel;
  primaryColor: string;
  secondaryColor: string;
  finish: PaintFinish;
  pearlescentColor: string;
  decals: DecalLayer[];
  underglowColor: string;
  underglowEnabled: boolean;
  underglowBeatPulse?: boolean;
  headlightsColor: string;
  headlightsOn: boolean;
  doorsOpen: boolean;
  hoodOpen: boolean;
  // Tuning & Environmental Additions for 1st Prize Winner Status
  spoilerStyle: SpoilerStyle;
  rimStyle: RimStyle;
  rimColor: string;
  windowTint: WindowTint;
  isRainyWeather: boolean;
  sceneEnvironment?: 'studio' | 'rain' | 'synthwave' | 'cyberpunk';
  isExhaustFlamesActive: boolean;
  unlayerOverlayUrl?: string;
}

export type GraphicsQuality = 'low' | 'medium' | 'high';

export type CameraPreset = 'front_34' | 'front' | 'side' | 'rear' | 'top' | 'wheel' | 'door_closeup' | 'turntable' | 'cinematic';

export type ViewMode = 'split' | '2d_only' | '3d_only';

export interface RadioStation {
  id: string;
  name: string;
  tagline: string;
  genre: string;
  color: string;
  freq: string;
}

export interface PresetLivery {
  id: string;
  name: string;
  author: string;
  vehicle: VehicleModel;
  thumbnailUrl?: string;
  state: Partial<LiveryState>;
}
