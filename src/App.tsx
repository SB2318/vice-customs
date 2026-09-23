import React, { useState, useCallback, useEffect, useRef } from 'react';
import { LiveryState, DecalLayer, ViewMode, CameraPreset, GraphicsQuality } from './types';
import { PRESET_LIVERIES } from './utils/presetLiveries';
import { useLiveryHistory } from './utils/useLiveryHistory';
import { decodeLiveryFromUrl } from './utils/shareUtils';
import { Header } from './components/UI/Header';
import { ViceRadio } from './components/UI/ViceRadio';
import { LiveryCanvas } from './components/Canvas2D/LiveryCanvas';
import { Toolbar2D } from './components/Canvas2D/Toolbar2D';
import { GarageScene } from './components/Three3D/GarageScene';
import { GaragePresetsModal } from './components/UI/GaragePresetsModal';
import { ExportModal } from './components/UI/ExportModal';
import { VehicleTransitionLoader } from './components/UI/VehicleTransitionLoader';
import { OnboardingTourModal } from './components/UI/OnboardingTourModal';
import { KeyboardShortcutsModal } from './components/UI/KeyboardShortcutsModal';
import { ViceOutrunGameModal } from './components/UI/ViceOutrunGameModal';
import { GripVertical, GripHorizontal, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Mobile-only bottom tab
type MobileTab = '2d' | '3d';

export const App: React.FC = () => {
  // Check for shared livery in URL hash on initial load
  const initialLivery = (() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#share=')) {
        const encoded = hash.replace('#share=', '');
        const decoded = decodeLiveryFromUrl(encoded);
        if (decoded) return decoded;
      }
    } catch (e) {
      console.error('Failed to parse URL hash livery', e);
    }
    return PRESET_LIVERIES[0].state as LiveryState;
  })();

  // Main Livery State with Undo / Redo History Stack
  const {
    liveryState,
    pushState,
    setRawState,
    undo,
    redo,
    canUndo,
    canRedo
  } = useLiveryHistory(initialLivery);

  const [selectedDecalId, setSelectedDecalId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('front_34');
  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality>('high');
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('2d');

  // ─── RESIZABLE SPLITTERS STATE ──────────────────────────────────────────────
  // 1. Split between 2D suite & 3D studio (percentage: 25% to 75%, default 50%)
  const [mainSplitPercent, setMainSplitPercent] = useState<number>(50);
  // 2. Split between 2D Canvas and Toolbar/Editor (percentage: 30% to 75%, default 58%)
  const [verticalSplitPercent, setVerticalSplitPercent] = useState<number>(58);

  const isDraggingMainSplit = useRef(false);
  const isDraggingVerticalSplit = useRef(false);
  const [isSplitDragging, setIsSplitDragging] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    return !localStorage.getItem('vice_onboarded');
  });

  // Vehicle transition loader
  const prevVehicleRef = useRef(liveryState.vehicle);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);
  useEffect(() => {
    if (prevVehicleRef.current !== liveryState.vehicle) {
      prevVehicleRef.current = liveryState.vehicle;
      setIsLoadingVehicle(true);
      const t = setTimeout(() => setIsLoadingVehicle(false), 600);
      return () => clearTimeout(t);
    }
  }, [liveryState.vehicle]);

  // Partial State Updater with History Push (declared early — keyboard shortcuts useEffect depends on it)
  const handleUpdateLiveryState = useCallback((updates: Partial<LiveryState>) => {
    pushState(prev => ({ ...prev, ...updates }));
  }, [pushState]);

  // Global keyboard shortcuts
  useEffect(() => {
    const CAMERA_PRESET_MAP: CameraPreset[] = [
      'front_34', 'front', 'side', 'rear', 'top', 'wheel', 'turntable', 'cinematic'
    ];
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs/textareas
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      // Undo / Redo
      if (e.ctrlKey && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); return; }
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); return; }

      // Delete selected decal — handled in LiveryCanvas via its own listener, skip

      // Camera preset 1-8
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 8) {
        setCameraPreset(CAMERA_PRESET_MAP[num - 1]);
        return;
      }

      // Test Drive Arcade Game shortcut (G)
      if ((e.key === 'g' || e.key === 'G') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setIsGameOpen(prev => !prev);
        return;
      }

      // Studio FX shortcuts
      if (e.key === 'r' || e.key === 'R') {
        return;
      }
      if (e.key === 'u' || e.key === 'U') {
        handleUpdateLiveryState({ underglowEnabled: !liveryState.underglowEnabled });
        return;
      }

      // Shortcuts modal
      if (e.key === '?') {
        setIsShortcutsOpen(prev => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, liveryState.underglowEnabled, handleUpdateLiveryState]);

  // Decal Operations
  const handleAddDecal = useCallback((decalPartial: Partial<DecalLayer>) => {
    const newDecal: DecalLayer = {
      id: 'decal_' + Date.now(),
      name: decalPartial.name || 'Custom Decal',
      category: decalPartial.category || 'stripe',
      assetId: decalPartial.assetId || 'stripe_dual_center',
      x: decalPartial.x ?? 512,
      y: decalPartial.y ?? 512,
      scaleX: decalPartial.scaleX ?? 1,
      scaleY: decalPartial.scaleY ?? 1,
      rotation: decalPartial.rotation ?? 0,
      color: decalPartial.color || '#ffffff',
      secondaryColor: decalPartial.secondaryColor,
      opacity: decalPartial.opacity ?? 1,
      flipX: decalPartial.flipX ?? false,
      flipY: decalPartial.flipY ?? false,
      zIndex: decalPartial.zIndex ?? liveryState.decals.length + 1,
      visible: true,
      customText: decalPartial.customText,
      fontFamily: decalPartial.fontFamily,
      plateText: decalPartial.plateText,
      plateStyle: decalPartial.plateStyle
    };

    pushState(prev => ({
      ...prev,
      decals: [...prev.decals, newDecal]
    }));
    setSelectedDecalId(newDecal.id);
  }, [liveryState.decals.length, pushState]);

  const handleUpdateDecal = useCallback((id: string, updates: Partial<DecalLayer>) => {
    pushState(prev => ({
      ...prev,
      decals: prev.decals.map(d => (d.id === id ? { ...d, ...updates } : d))
    }));
  }, [pushState]);

  const handleRemoveDecal = useCallback((id: string) => {
    pushState(prev => ({
      ...prev,
      decals: prev.decals.filter(d => d.id !== id)
    }));
    if (selectedDecalId === id) setSelectedDecalId(null);
  }, [selectedDecalId, pushState]);

  const handleLoadLiveryPreset = useCallback((presetState: Partial<LiveryState>) => {
    pushState(prev => ({ ...prev, ...presetState }));
    setSelectedDecalId(null);
  }, [pushState]);

  const handleSaveUnlayerImage = useCallback((dataUrl: string) => {
    // Store the Unlayer-edited image as the canvas base overlay layer
    pushState(prev => ({ ...prev, unlayerOverlayUrl: dataUrl }));
  }, [pushState]);

  // ─── DRAG EVENT LISTENERS FOR SPLITTERS ─────────────────────────────────────
  const handleStartMainSplitDrag = (e: React.PointerEvent) => {
    isDraggingMainSplit.current = true;
    setIsSplitDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleStartVerticalSplitDrag = (e: React.PointerEvent) => {
    isDraggingVerticalSplit.current = true;
    setIsSplitDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingMainSplit.current && mainContainerRef.current) {
      const rect = mainContainerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const percentage = (currentX / rect.width) * 100;
      const clamped = Math.max(15, Math.min(85, percentage));
      setMainSplitPercent(clamped);
    }

    if (isDraggingVerticalSplit.current && leftPanelRef.current) {
      const rect = leftPanelRef.current.getBoundingClientRect();
      const currentY = e.clientY - rect.top;
      const percentage = (currentY / rect.height) * 100;
      
      let clamped = percentage;
      if (clamped < 10) clamped = 0;
      else if (clamped > 90) clamped = 100;
      else clamped = Math.max(15, Math.min(85, clamped));
      
      setVerticalSplitPercent(clamped);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingMainSplit.current || isDraggingVerticalSplit.current) {
      isDraggingMainSplit.current = false;
      isDraggingVerticalSplit.current = false;
      setIsSplitDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const show2D = viewMode === 'split' || viewMode === '2d_only';
  const show3D = viewMode === 'split' || viewMode === '3d_only';

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="h-[100dvh] w-full bg-[#070710] text-white flex flex-col font-sans select-none overflow-hidden"
    >
      {/* TOP HEADER NAVIGATION */}
      <Header
        liveryState={liveryState}
        onUpdateState={handleUpdateLiveryState}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        onOpenPresetsModal={() => setIsPresetsOpen(true)}
        onOpenExportModal={() => setIsExportOpen(true)}
        onOpenGameModal={() => setIsGameOpen(true)}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* ── MAIN WORKSPACE WITH DRAGGABLE RESIZERS ── */}
      <main
        ref={mainContainerRef}
        className="flex-1 flex flex-col lg:flex-row p-1.5 sm:p-2 lg:p-3 min-h-0 relative gap-0 overflow-hidden"
      >
        {/* ── SECTION 1 & 2: 2D CANVAS & EDITOR SUITE ── */}
        <div
          ref={leftPanelRef}
          style={{
            width: viewMode === '2d_only' ? '100%' : viewMode === '3d_only' ? '0%' : `${mainSplitPercent}%`
          }}
          className={`
            ${show2D ? 'flex' : 'hidden'}
            ${mobileTab === '2d' ? 'w-full flex' : 'hidden lg:flex'}
            flex-col
            h-full
            min-w-0 shrink-0
          `}
        >
          {/* 1. 2D Texture Canvas Section (Top) */}
          <div
            style={{
              height: verticalSplitPercent === 0 ? '0%' : verticalSplitPercent === 100 ? '100%' : `${verticalSplitPercent}%`
            }}
            className={`w-full relative flex flex-col ${verticalSplitPercent === 0 ? 'hidden' : 'min-h-[180px] sm:min-h-[220px] shrink-0'}`}
          >
            <LiveryCanvas
              liveryState={liveryState}
              selectedDecalId={selectedDecalId}
              onSelectDecal={setSelectedDecalId}
              onUpdateDecal={handleUpdateDecal}
              onCanvasRender={setCanvasElement}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              onOpenExportModal={() => setIsExportOpen(true)}
            />
          </div>

          {/* DRAGGABLE VERTICAL SPLITTER (Between 2D Canvas and Toolbar/Editor) */}
          <div
            onPointerDown={handleStartVerticalSplitDrag}
            onDoubleClick={() => setVerticalSplitPercent(58)}
            title="Drag up/down to resize Canvas vs Editor (Double click to reset)"
            className="w-full h-4 sm:h-5 bg-[#0d0d1a] hover:bg-vice-pink/30 active:bg-vice-pink/50 cursor-row-resize flex items-center justify-center transition-colors group z-10 shrink-0 select-none border-y border-vice-border touch-none gap-6"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setVerticalSplitPercent(0); }}
              className="p-1 bg-[#1a1a2e] border border-vice-pink/50 text-vice-pink hover:bg-vice-pink hover:text-white transition-all rounded shadow-[0_0_8px_rgba(255,0,127,0.4)] hover:shadow-neon-pink z-20 cursor-pointer"
              title="Collapse Canvas"
            >
              <ChevronUp size={14} />
            </button>

            <div className="w-20 sm:w-24 h-1.5 rounded-full bg-gray-600 group-hover:bg-vice-pink group-hover:shadow-neon-pink transition-all flex items-center justify-center">
              <GripHorizontal size={14} className="text-gray-400 group-hover:text-white" />
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setVerticalSplitPercent(100); }}
              className="p-1 bg-[#1a1a2e] border border-vice-pink/50 text-vice-pink hover:bg-vice-pink hover:text-white transition-all rounded shadow-[0_0_8px_rgba(255,0,127,0.4)] hover:shadow-neon-pink z-20 cursor-pointer"
              title="Collapse Editor"
            >
              <ChevronDown size={14} />
            </button>
          </div>

          {/* 2. 2D Toolbar / Editor Panel Section (Bottom) */}
          <div className={`flex-1 overflow-hidden flex flex-col ${verticalSplitPercent === 100 ? 'hidden' : 'min-h-[140px] sm:min-h-[180px]'}`}>
            <Toolbar2D
              liveryState={liveryState}
              onUpdateState={handleUpdateLiveryState}
              selectedDecalId={selectedDecalId}
              onSelectDecal={setSelectedDecalId}
              onAddDecal={handleAddDecal}
              onUpdateDecal={handleUpdateDecal}
              onRemoveDecal={handleRemoveDecal}
              canvasDataUrl={canvasElement ? canvasElement.toDataURL() : ''}
              onSaveUnlayerImage={handleSaveUnlayerImage}
            />
          </div>
        </div>

        {/* ── DRAGGABLE MAIN HORIZONTAL SPLITTER (Between 2D Suite and 3D Studio) ── */}
        {viewMode === 'split' && (
          <div
            onPointerDown={handleStartMainSplitDrag}
            onDoubleClick={() => setMainSplitPercent(50)}
            title="Drag left/right to resize 2D Editor vs 3D Studio (Double click to reset 50/50)"
            className="hidden lg:flex w-5 h-full bg-[#0d0d1a] hover:bg-vice-cyan/30 active:bg-vice-cyan/50 cursor-col-resize flex-col items-center justify-center transition-colors group z-20 shrink-0 select-none border-x border-vice-border mx-0.5 touch-none gap-6"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setViewMode('3d_only'); }}
              className="p-1 bg-[#1a1a2e] border border-vice-cyan/50 text-vice-cyan hover:bg-vice-cyan hover:text-black transition-all rounded shadow-[0_0_8px_rgba(0,240,255,0.4)] hover:shadow-neon-cyan z-20 cursor-pointer"
              title="Collapse 2D Editor"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="w-1.5 h-24 rounded-full bg-gray-600 group-hover:bg-vice-cyan group-hover:shadow-neon-cyan transition-all flex flex-col items-center justify-center gap-1">
              <GripVertical size={14} className="text-gray-400 group-hover:text-black" />
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setViewMode('2d_only'); }}
              className="p-1 bg-[#1a1a2e] border border-vice-cyan/50 text-vice-cyan hover:bg-vice-cyan hover:text-black transition-all rounded shadow-[0_0_8px_rgba(0,240,255,0.4)] hover:shadow-neon-cyan z-20 cursor-pointer"
              title="Collapse 3D Studio"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── SECTION 3: 3D GARAGE STUDIO VIEWPORT ── */}
        <div
          style={{
            width: viewMode === '3d_only' ? '100%' : viewMode === '2d_only' ? '0%' : `${100 - mainSplitPercent}%`
          }}
          className={`
            ${show3D ? 'flex' : 'hidden'}
            ${mobileTab === '3d' ? 'w-full flex' : 'hidden lg:flex'}
            ${isSplitDragging ? 'pointer-events-none select-none' : ''}
            flex-col flex-1
            h-full
            min-w-0
          `}
        >
          <GarageScene
            liveryState={liveryState}
            onUpdateState={handleUpdateLiveryState}
            canvasElement={canvasElement}
            cameraPreset={cameraPreset}
            onSelectCameraPreset={setCameraPreset}
            quality={graphicsQuality}
            onSelectQuality={setGraphicsQuality}
          />
        </div>
      </main>

      {/* ── NATIVE MOBILE BOTTOM TAB BAR (below lg) ── */}
      <div className="lg:hidden flex border-t border-vice-border bg-[#0b0b14]/95 backdrop-blur-md shrink-0 z-30">
        <button
          onClick={() => setMobileTab('2d')}
          className={`flex-1 py-3 text-xs font-vice transition-all flex items-center justify-center gap-2 ${
            mobileTab === '2d'
              ? 'text-vice-pink bg-vice-card/60 font-bold border-t-2 border-vice-pink shadow-neon-pink'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>🎨</span> 2D CANVAS &amp; EDITOR
        </button>
        <button
          onClick={() => setMobileTab('3d')}
          className={`flex-1 py-3 text-xs font-vice transition-all flex items-center justify-center gap-2 ${
            mobileTab === '3d'
              ? 'text-vice-cyan bg-vice-card/60 font-bold border-t-2 border-vice-cyan shadow-neon-cyan'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>🚗</span> 3D GARAGE STUDIO
        </button>
      </div>

      {/* BOTTOM RADIO STATION BAR */}
      <footer className="px-2 sm:px-3 pb-1.5 pt-1 shrink-0">
        <ViceRadio />
      </footer>

      {/* MODALS */}
      <GaragePresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onLoadLivery={handleLoadLiveryPreset}
        currentLivery={liveryState}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        canvasElement={canvasElement}
        liveryState={liveryState}
        onLoadLivery={handleLoadLiveryPreset}
      />

      {/* 🏎️ VICE OUTRUN HIGHWAY SPEED TRIAL ARCADE GAME */}
      <ViceOutrunGameModal
        isOpen={isGameOpen}
        onClose={() => setIsGameOpen(false)}
        liveryState={liveryState}
        canvasElement={canvasElement}
      />



      {/* VEHICLE TRANSITION LOADER — shows briefly on vehicle switch */}
      <VehicleTransitionLoader
        isLoading={isLoadingVehicle}
        vehicle={liveryState.vehicle}
      />

      {/* ONBOARDING TOUR — shows on first visit, dismissed via localStorage */}
      <OnboardingTourModal
        isOpen={isOnboardingOpen}
        onClose={() => {
          localStorage.setItem('vice_onboarded', '1');
          setIsOnboardingOpen(false);
        }}
        onOpenShortcuts={() => {
          localStorage.setItem('vice_onboarded', '1');
          setIsOnboardingOpen(false);
          setIsShortcutsOpen(true);
        }}
        onOpenExportModal={() => {
          localStorage.setItem('vice_onboarded', '1');
          setIsOnboardingOpen(false);
          setIsExportOpen(true);
        }}
      />

      {/* KEYBOARD SHORTCUTS MODAL — toggle with ? key */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        onOpenTour={() => {
          setIsShortcutsOpen(false);
          setIsOnboardingOpen(true);
        }}
      />
    </div>
  );
};
