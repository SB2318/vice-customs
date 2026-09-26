import { create } from 'zustand';
import {
  AppMode,
  CameraPreset,
  GraphicsQuality,
  HeistMission,
  ForgeryValidationResult,
  ViewMode,
} from '../types';
import {
  DEFAULT_MAIN_SPLIT_PCT,
  DEFAULT_VERTICAL_SPLIT_PCT,
  MODE_TRANSITION_MS,
  VEHICLE_TRANSITION_MS,
} from '../constants';

//  UI / Navigation Slice 

interface UISlice {
  appMode: AppMode;
  mobileTab: '2d' | '3d';
  viewMode: ViewMode;
  cameraPreset: CameraPreset;
  graphicsQuality: GraphicsQuality;
  isLoadingVehicle: boolean;

  setAppMode: (mode: AppMode) => void;
  setMobileTab: (tab: '2d' | '3d') => void;
  setViewMode: (mode: ViewMode) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setGraphicsQuality: (quality: GraphicsQuality) => void;
  triggerVehicleTransition: () => void;
}

//  Split Pane Slice

interface SplitSlice {
  mainSplitPercent: number;
  verticalSplitPercent: number;
  isSplitDragging: boolean;

  setMainSplitPercent: (pct: number) => void;
  setVerticalSplitPercent: (pct: number) => void;
  setIsSplitDragging: (dragging: boolean) => void;
}

//  Modal Slice 

interface ModalSlice {
  isPresetsOpen: boolean;
  isExportOpen: boolean;
  isShortcutsOpen: boolean;
  isGameOpen: boolean;
  isGameTourOpen: boolean;

  openPresets: () => void;
  closePresets: () => void;
  openExport: () => void;
  closeExport: () => void;
  openShortcuts: () => void;
  closeShortcuts: () => void;
  openGame: () => void;
  closeGame: () => void;
  openGameTour: () => void;
  closeGameTour: () => void;
  toggleShortcuts: () => void;
  toggleGameTour: () => void;
}

//  Heist Game Slice 

interface HeistSlice {
  activeHeistMission: HeistMission | null;
  isEvidenceEditorOpen: boolean;
  forgeryResult: ForgeryValidationResult | null;
  isConsequenceOpen: boolean;

  selectHeistMission: (mission: HeistMission) => void;
  clearHeistMission: () => void;
  setForgeryResult: (result: ForgeryValidationResult) => void;
  openConsequence: () => void;
  closeConsequence: () => void;
  openEvidenceEditor: () => void;
  closeEvidenceEditor: () => void;
}

//  Canvas Slice

interface CanvasSlice {
  canvasElement: HTMLCanvasElement | null;
  selectedDecalId: string | null;

  setCanvasElement: (canvas: HTMLCanvasElement | null) => void;
  setSelectedDecalId: (id: string | null) => void;
}

//  Full Store Type 

export type AppStore = UISlice & SplitSlice & ModalSlice & HeistSlice & CanvasSlice;

//  Store Implementation

let vehicleTransitionTimer: ReturnType<typeof setTimeout> | null = null;
let modeTransitionTimer: ReturnType<typeof setTimeout> | null = null;

export const useAppStore = create<AppStore>((set, get) => ({
  //  UI / Navigation 
  appMode: 'heist',
  mobileTab: '2d',
  viewMode: 'split',
  cameraPreset: 'front_34',
  graphicsQuality: 'high',
  isLoadingVehicle: false,

  setAppMode: (mode) => {
    if (mode === get().appMode) return;
    if (modeTransitionTimer) clearTimeout(modeTransitionTimer);
    set({ appMode: mode, isLoadingVehicle: true });
    modeTransitionTimer = setTimeout(
      () => set({ isLoadingVehicle: false }),
      MODE_TRANSITION_MS,
    );
  },

  setMobileTab: (tab) => set({ mobileTab: tab }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  setGraphicsQuality: (quality) => set({ graphicsQuality: quality }),

  triggerVehicleTransition: () => {
    if (vehicleTransitionTimer) clearTimeout(vehicleTransitionTimer);
    set({ isLoadingVehicle: true });
    vehicleTransitionTimer = setTimeout(
      () => set({ isLoadingVehicle: false }),
      VEHICLE_TRANSITION_MS,
    );
  },

  //  Split Pane 
  mainSplitPercent: DEFAULT_MAIN_SPLIT_PCT,
  verticalSplitPercent: DEFAULT_VERTICAL_SPLIT_PCT,
  isSplitDragging: false,

  setMainSplitPercent: (pct) => set({ mainSplitPercent: pct }),
  setVerticalSplitPercent: (pct) => set({ verticalSplitPercent: pct }),
  setIsSplitDragging: (dragging) => set({ isSplitDragging: dragging }),

  //  Modals
  isPresetsOpen: false,
  isExportOpen: false,
  isShortcutsOpen: false,
  isGameOpen: false,
  isGameTourOpen: false,

  openPresets: () => set({ isPresetsOpen: true }),
  closePresets: () => set({ isPresetsOpen: false }),
  openExport: () => set({ isExportOpen: true }),
  closeExport: () => set({ isExportOpen: false }),
  openShortcuts: () => set({ isShortcutsOpen: true }),
  closeShortcuts: () => set({ isShortcutsOpen: false }),
  openGame: () => set({ isGameOpen: true }),
  closeGame: () => set({ isGameOpen: false }),
  openGameTour: () => set({ isGameTourOpen: true }),
  closeGameTour: () => set({ isGameTourOpen: false }),
  toggleShortcuts: () => set((s) => ({ isShortcutsOpen: !s.isShortcutsOpen })),
  toggleGameTour: () => set((s) => ({ isGameTourOpen: !s.isGameTourOpen })),

  //  Heist Game
  activeHeistMission: null,
  isEvidenceEditorOpen: false,
  forgeryResult: null,
  isConsequenceOpen: false,

  selectHeistMission: (mission) =>
    set({ activeHeistMission: mission, isEvidenceEditorOpen: true }),

  clearHeistMission: () =>
    set({ activeHeistMission: null, isEvidenceEditorOpen: false }),

  setForgeryResult: (result) => set({ forgeryResult: result }),
  openConsequence: () => set({ isConsequenceOpen: true }),
  closeConsequence: () => set({ isConsequenceOpen: false }),
  openEvidenceEditor: () => set({ isEvidenceEditorOpen: true }),
  closeEvidenceEditor: () => set({ isEvidenceEditorOpen: false }),

  //  Canvas
  canvasElement: null,
  selectedDecalId: null,

  setCanvasElement: (canvas) => set({ canvasElement: canvas }),
  setSelectedDecalId: (id) => set({ selectedDecalId: id }),
}));
