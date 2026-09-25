import React, { useCallback, useEffect, useRef } from 'react';
import { LiveryState, DecalLayer, ForgeryValidationResult } from './types';
import { PRESET_LIVERIES } from './utils/presetLiveries';
import { useLiveryHistory } from './utils/useLiveryHistory';
import { decodeLiveryFromUrl } from './utils/shareUtils';
import { audioEngine } from './utils/audioEngine';
import { useAppStore } from './store/useAppStore';
import {
  VEHICLE_MODELS,
  VIEW_MODES,
  CAMERA_PRESET_CYCLE,
  SPLIT_MIN_PCT,
  SPLIT_MAX_PCT,
  VERTICAL_SNAP_THRESHOLD,
} from './constants';

import { Header } from './components/UI/Header';
import { ViceRadio } from './components/UI/ViceRadio';
import { LiveryCanvas } from './components/Canvas2D/LiveryCanvas';
import { Toolbar2D } from './components/Canvas2D/Toolbar2D';
import { GarageScene } from './components/Three3D/GarageScene';
import { GaragePresetsModal } from './components/UI/GaragePresetsModal';
import { ExportModal } from './components/UI/ExportModal';
import { VehicleTransitionLoader } from './components/UI/VehicleTransitionLoader';
import { HeistGameTourModal } from './components/UI/HeistGameTourModal';
import { KeyboardShortcutsModal } from './components/UI/KeyboardShortcutsModal';
import { ViceOutrunGameModal } from './components/UI/ViceOutrunGameModal';
import { HeistMissionHub } from './components/UI/HeistMissionHub';
import { JourneyStoryHub } from './components/UI/JourneyStoryHub';
import { EvidenceEditorModal } from './components/UI/EvidenceEditorModal';
import { StoryConsequenceModal } from './components/UI/StoryConsequenceModal';
import { GripVertical, GripHorizontal, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Flame, Sparkles, Download } from 'lucide-react';

// Mobile-only bottom tab
type MobileTab = '2d' | '3d';

export const App: React.FC = () => {
  // ── Zustand store ──────────────────────────────────────────────────────────
  const {
    appMode, setAppMode,
    mobileTab, setMobileTab,
    viewMode, setViewMode,
    cameraPreset, setCameraPreset,
    graphicsQuality, setGraphicsQuality,
    isLoadingVehicle, triggerVehicleTransition,
    mainSplitPercent, setMainSplitPercent,
    verticalSplitPercent, setVerticalSplitPercent,
    isSplitDragging, setIsSplitDragging,
    isPresetsOpen, openPresets, closePresets,
    isExportOpen, openExport, closeExport,
    isShortcutsOpen, closeShortcuts, toggleShortcuts,
    isGameOpen, openGame, closeGame,
    isGameTourOpen, openGameTour, closeGameTour, toggleGameTour,
    activeHeistMission, selectHeistMission, clearHeistMission,
    isEvidenceEditorOpen, openEvidenceEditor, closeEvidenceEditor,
    forgeryResult, setForgeryResult,
    isConsequenceOpen, openConsequence, closeConsequence,
    canvasElement, setCanvasElement,
    selectedDecalId, setSelectedDecalId,
  } = useAppStore();

  // ── Livery state with undo/redo ────────────────────────────────────────────
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

  const {
    liveryState,
    pushState,
    setRawState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useLiveryHistory(initialLivery);

  // ── Vehicle transition on vehicle change ───────────────────────────────────
  const prevVehicleRef = useRef(liveryState.vehicle);
  useEffect(() => {
    if (prevVehicleRef.current !== liveryState.vehicle) {
      prevVehicleRef.current = liveryState.vehicle;
      triggerVehicleTransition();
    }
  }, [liveryState.vehicle, triggerVehicleTransition]);

  // ── Livery update helpers ──────────────────────────────────────────────────
  const handleUpdateLiveryState = useCallback(
    (updates: Partial<LiveryState>) => {
      pushState(prev => ({ ...prev, ...updates }));
    },
    [pushState],
  );

  // ── Global keyboard shortcuts ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) return;

      // Undo / Redo
      if (e.ctrlKey && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); return; }
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); return; }

      // Camera preset shortcuts (keys 1–8)
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= CAMERA_PRESET_CYCLE.length) {
        setCameraPreset(CAMERA_PRESET_CYCLE[num - 1]);
        return;
      }

      // Toggle game tour (G)
      if ((e.key === 'g' || e.key === 'G') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        toggleGameTour();
        return;
      }

      // Toggle underglow (U)
      if (e.key === 'u' || e.key === 'U') {
        handleUpdateLiveryState({ underglowEnabled: !liveryState.underglowEnabled });
        return;
      }

      // Open shortcuts modal (?)
      if (e.key === '?') {
        toggleShortcuts();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    undo, redo,
    liveryState.underglowEnabled,
    handleUpdateLiveryState,
    setCameraPreset,
    toggleGameTour,
    toggleShortcuts,
  ]);

  // ── Decal operations ───────────────────────────────────────────────────────
  const handleAddDecal = useCallback(
    (decalPartial: Partial<DecalLayer>) => {
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
        plateStyle: decalPartial.plateStyle,
      };
      pushState(prev => ({ ...prev, decals: [...prev.decals, newDecal] }));
      setSelectedDecalId(newDecal.id);
    },
    [liveryState.decals.length, pushState, setSelectedDecalId],
  );

  const handleUpdateDecal = useCallback(
    (id: string, updates: Partial<DecalLayer>) => {
      pushState(prev => ({
        ...prev,
        decals: prev.decals.map(d => (d.id === id ? { ...d, ...updates } : d)),
      }));
    },
    [pushState],
  );

  const handleRemoveDecal = useCallback(
    (id: string) => {
      pushState(prev => ({ ...prev, decals: prev.decals.filter(d => d.id !== id) }));
      if (selectedDecalId === id) setSelectedDecalId(null);
    },
    [selectedDecalId, pushState, setSelectedDecalId],
  );

  const handleLoadLiveryPreset = useCallback(
    (presetState: Partial<LiveryState>) => {
      pushState(prev => ({ ...prev, ...presetState }));
      setSelectedDecalId(null);
    },
    [pushState, setSelectedDecalId],
  );

  const handleSaveUnlayerImage = useCallback(
    (dataUrl: string) => {
      pushState(prev => ({ ...prev, unlayerOverlayUrl: dataUrl }));
    },
    [pushState],
  );

  // ── Vehicle Heist handlers ─────────────────────────────────────────────────
  const handleSubmitForgery = (result: ForgeryValidationResult) => {
    setForgeryResult(result);
    closeEvidenceEditor();
    closeGame();
    openConsequence();
  };

  const handleConsequenceContinue = () => {
    closeConsequence();
    openGame(); // trigger getaway pursuit 3D game
  };

  // ── Resizable split drag ───────────────────────────────────────────────────
  const isDraggingMainSplit     = useRef(false);
  const isDraggingVerticalSplit = useRef(false);
  const mainContainerRef        = useRef<HTMLDivElement>(null);
  const leftPanelRef            = useRef<HTMLDivElement>(null);

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
      const pct  = ((e.clientX - rect.left) / rect.width) * 100;
      setMainSplitPercent(Math.max(SPLIT_MIN_PCT, Math.min(SPLIT_MAX_PCT, pct)));
    }

    if (isDraggingVerticalSplit.current && leftPanelRef.current) {
      const rect = leftPanelRef.current.getBoundingClientRect();
      const pct  = ((e.clientY - rect.top) / rect.height) * 100;
      let clamped = pct;
      if      (clamped < VERTICAL_SNAP_THRESHOLD)        clamped = 0;
      else if (clamped > 100 - VERTICAL_SNAP_THRESHOLD)  clamped = 100;
      else    clamped = Math.max(SPLIT_MIN_PCT, Math.min(SPLIT_MAX_PCT, clamped));
      setVerticalSplitPercent(clamped);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingMainSplit.current || isDraggingVerticalSplit.current) {
      isDraggingMainSplit.current     = false;
      isDraggingVerticalSplit.current = false;
      setIsSplitDragging(false);
      try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
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
      {/* TOP HEADER */}
      <Header
        liveryState={liveryState}
        onUpdateState={handleUpdateLiveryState}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        appMode={appMode}
        onSelectAppMode={setAppMode}
        onOpenPresetsModal={openPresets}
        onOpenExportModal={openExport}
        onOpenTour={openGameTour}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Smooth mode transition wrapper */}
      <div
        key={appMode}
        className="flex-1 w-full flex flex-col min-h-0 relative overflow-hidden animate-fadeIn transition-opacity duration-300"
      >
        {/* ── MODE 1: VEHICLE HEIST ── */}
        {appMode === 'heist' ? (
          <HeistMissionHub
            onSelectMission={selectHeistMission}
            onOpenTour={openGameTour}
          />
        ) : appMode === 'journey' ? (
          /* ── MODE 2: JOURNEY STORIES ── */
          <JourneyStoryHub
            onSelectStory={(storyId, linkedMission) => {
              selectHeistMission(linkedMission);
            }}
            onOpenTour={openGameTour}
          />
        ) : (
          /* ── MODE 3: VICE CUSTOMS GARAGE STUDIO ── */
          <div className="flex-1 w-full flex flex-col min-h-0 overflow-hidden">
            {/* Garage toolbar */}
            <div className="px-3 py-1.5 bg-[#0b0b16] border-b border-vice-border flex items-center justify-between gap-2 shrink-0 overflow-x-auto scrollbar-none">
              {/* Vehicle model pills */}
              <div className="flex items-center gap-1 bg-[#121224] p-0.5 rounded-xl border border-vice-border shrink-0 overflow-x-auto scrollbar-none max-w-[50vw] sm:max-w-none">
                {VEHICLE_MODELS.map((vm) => (
                  <button
                    key={vm}
                    onClick={() => {
                      handleUpdateLiveryState({ vehicle: vm });
                      audioEngine.playClickSFX();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-vice uppercase transition-all whitespace-nowrap ${
                      liveryState.vehicle === vm
                        ? 'bg-vice-pink text-white font-bold shadow-neon-pink'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {vm}
                  </button>
                ))}
              </div>

              {/* View mode & action controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* View mode toggle */}
                <div className="flex bg-[#121224] p-0.5 rounded-xl border border-vice-border text-[10px] font-vice">
                  {VIEW_MODES.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setViewMode(m);
                        audioEngine.playTransitionSFX();
                      }}
                      className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                        viewMode === m
                          ? 'bg-vice-cyan text-black font-bold shadow-neon-cyan'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {m === 'split' ? 'SPLIT' : m === '2d_only' ? '2D' : '3D'}
                    </button>
                  ))}
                </div>

                {/* Rev engine */}
                <button
                  onClick={() => { audioEngine.revEngine(2200, () => {}); }}
                  className="px-2.5 py-1 bg-gradient-to-r from-vice-orange to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-vice text-[10px] font-black rounded-xl shadow-lg transition-all flex items-center gap-1 border border-yellow-400/40 whitespace-nowrap shrink-0"
                >
                  <Flame size={12} className="text-yellow-300 animate-pulse" />
                  REV!
                </button>

                {/* Presets */}
                <button
                  onClick={openPresets}
                  className="px-2.5 py-1 bg-[#141426] hover:bg-vice-card border border-vice-border hover:border-vice-pink text-vice-pink font-vice text-[10px] rounded-xl transition-all flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <Sparkles size={12} /> PRESETS
                </button>

                {/* Export */}
                <button
                  onClick={openExport}
                  className="px-3 py-1 bg-vice-pink hover:bg-pink-600 text-white font-vice text-[10px] font-bold rounded-xl shadow-neon-pink transition-all flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <Download size={12} /> EXPORT &amp; JSON
                </button>
              </div>
            </div>

            <main
              ref={mainContainerRef}
              className="flex-1 flex flex-col lg:flex-row p-1.5 sm:p-2 lg:p-3 min-h-0 relative gap-0 overflow-hidden"
            >
              {/* 2D Canvas & Editor Suite Panel */}
              <div
                ref={leftPanelRef}
                style={{
                  width:
                    viewMode === '2d_only' ? '100%'
                    : viewMode === '3d_only' ? '0%'
                    : `${mainSplitPercent}%`,
                }}
                className={`
                  ${show2D ? 'flex' : 'hidden'}
                  ${mobileTab === '2d' ? 'w-full flex' : 'hidden lg:flex'}
                  flex-col h-full min-w-0 shrink-0
                `}
              >
                {/* 2D Canvas section (top) */}
                <div
                  style={{
                    height:
                      verticalSplitPercent === 0   ? '0%'
                      : verticalSplitPercent === 100 ? '100%'
                      : `${verticalSplitPercent}%`,
                  }}
                  className={`w-full relative flex flex-col ${
                    verticalSplitPercent === 0
                      ? 'hidden'
                      : 'min-h-[180px] sm:min-h-[220px] shrink-0'
                  }`}
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
                    onOpenExportModal={openExport}
                  />
                </div>

                {/* Draggable vertical splitter */}
                <div
                  onPointerDown={handleStartVerticalSplitDrag}
                  onDoubleClick={() => setVerticalSplitPercent(58)}
                  title="Drag up/down to resize Canvas vs Editor"
                  className="w-full h-4 sm:h-5 bg-[#0d0d1a] hover:bg-vice-pink/30 active:bg-vice-pink/50 cursor-row-resize flex items-center justify-center transition-colors group z-10 shrink-0 select-none border-y border-vice-border touch-none gap-6"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); setVerticalSplitPercent(0); }}
                    className="p-1 bg-[#1a1a2e] border border-vice-pink/50 text-vice-pink hover:bg-vice-pink hover:text-white transition-all rounded shadow-neon-pink z-20 cursor-pointer"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <div className="w-20 sm:w-24 h-1.5 rounded-full bg-gray-600 group-hover:bg-vice-pink group-hover:shadow-neon-pink transition-all flex items-center justify-center">
                    <GripHorizontal size={14} className="text-gray-400 group-hover:text-white" />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setVerticalSplitPercent(100); }}
                    className="p-1 bg-[#1a1a2e] border border-vice-pink/50 text-vice-pink hover:bg-vice-pink hover:text-white transition-all rounded shadow-neon-pink z-20 cursor-pointer"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Toolbar / Unlayer editor (bottom) */}
                <div
                  className={`flex-1 overflow-hidden flex flex-col ${
                    verticalSplitPercent === 100 ? 'hidden' : 'min-h-[140px] sm:min-h-[180px]'
                  }`}
                >
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

              {/* Main horizontal splitter */}
              {viewMode === 'split' && (
                <div
                  onPointerDown={handleStartMainSplitDrag}
                  onDoubleClick={() => setMainSplitPercent(50)}
                  className="hidden lg:flex w-5 h-full bg-[#0d0d1a] hover:bg-vice-cyan/30 active:bg-vice-cyan/50 cursor-col-resize flex-col items-center justify-center transition-colors group z-20 shrink-0 select-none border-x border-vice-border mx-0.5 touch-none gap-6"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); setViewMode('3d_only'); }}
                    className="p-1 bg-[#1a1a2e] border border-vice-cyan/50 text-vice-cyan hover:bg-vice-cyan hover:text-black transition-all rounded shadow-neon-cyan z-20 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="w-1.5 h-24 rounded-full bg-gray-600 group-hover:bg-vice-cyan group-hover:shadow-neon-cyan transition-all flex flex-col items-center justify-center gap-1">
                    <GripVertical size={14} className="text-gray-400 group-hover:text-black" />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setViewMode('2d_only'); }}
                    className="p-1 bg-[#1a1a2e] border border-vice-cyan/50 text-vice-cyan hover:bg-vice-cyan hover:text-black transition-all rounded shadow-neon-cyan z-20 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* 3D Garage viewport */}
              <div
                style={{
                  width:
                    viewMode === '3d_only' ? '100%'
                    : viewMode === '2d_only' ? '0%'
                    : `${100 - mainSplitPercent}%`,
                }}
                className={`
                  ${show3D ? 'flex' : 'hidden'}
                  ${mobileTab === '3d' ? 'w-full flex' : 'hidden lg:flex'}
                  ${isSplitDragging ? 'pointer-events-none select-none' : ''}
                  flex-col flex-1 h-full min-w-0
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
          </div>
        )}
      </div>

      {/* Mobile bottom nav */}
      {appMode === 'studio' && (
        <div className="lg:hidden flex border-t border-vice-border bg-[#0b0b14]/95 backdrop-blur-md shrink-0 z-30">
          <button
            onClick={() => setMobileTab('2d')}
            className={`flex-1 py-3 text-xs font-vice transition-all flex items-center justify-center gap-2 ${
              mobileTab === '2d'
                ? 'text-vice-pink bg-vice-card/60 font-bold border-t-2 border-vice-pink shadow-neon-pink'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>PAINT &amp; UNLAYER EDITOR</span>
          </button>
          <button
            onClick={() => setMobileTab('3d')}
            className={`flex-1 py-3 text-xs font-vice transition-all flex items-center justify-center gap-2 ${
              mobileTab === '3d'
                ? 'text-vice-cyan bg-vice-card/60 font-bold border-t-2 border-vice-cyan shadow-neon-cyan'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>3D GARAGE STUDIO</span>
          </button>
        </div>
      )}

      {/* Bottom radio bar */}
      <footer className="px-2 sm:px-3 pb-1.5 pt-1 shrink-0">
        <ViceRadio />
      </footer>

      {/* ── MODALS ── */}

      {activeHeistMission && (
        <EvidenceEditorModal
          isOpen={isEvidenceEditorOpen}
          mission={activeHeistMission}
          onClose={clearHeistMission}
          onSubmitForgery={handleSubmitForgery}
          liveryState={liveryState}
          onUpdateLiveryState={handleUpdateLiveryState}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      )}

      {activeHeistMission && forgeryResult && (
        <StoryConsequenceModal
          isOpen={isConsequenceOpen}
          mission={activeHeistMission}
          result={forgeryResult}
          onContinue={handleConsequenceContinue}
          onRetry={() => {
            closeConsequence();
            openEvidenceEditor();
          }}
        />
      )}

      <GaragePresetsModal
        isOpen={isPresetsOpen}
        onClose={closePresets}
        onLoadLivery={handleLoadLiveryPreset}
        currentLivery={liveryState}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={closeExport}
        canvasElement={canvasElement}
        liveryState={liveryState}
        onLoadLivery={handleLoadLiveryPreset}
        appMode={appMode}
      />

      <ViceOutrunGameModal
        isOpen={isGameOpen}
        onClose={closeGame}
        liveryState={liveryState}
        canvasElement={canvasElement}
        mission={activeHeistMission}
      />

      <VehicleTransitionLoader
        isLoading={isLoadingVehicle}
        vehicle={liveryState.vehicle}
      />

      <HeistGameTourModal
        isOpen={isGameTourOpen}
        onClose={closeGameTour}
        onStartHeist={() => setAppMode('heist')}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={closeShortcuts}
        onOpenTour={() => {
          closeShortcuts();
          openGameTour();
        }}
      />
    </div>
  );
};
