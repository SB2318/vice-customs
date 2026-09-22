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
import { UnlayerEditorModal } from './components/Canvas2D/UnlayerEditorModal';
import { GripVertical, GripHorizontal } from 'lucide-react';

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
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUnlayerOpen, setIsUnlayerOpen] = useState(false);

  // Partial State Updater with History Push
  const handleUpdateLiveryState = useCallback((updates: Partial<LiveryState>) => {
    pushState(prev => ({ ...prev, ...updates }));
  }, [pushState]);

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
    handleAddDecal({
      name: 'Unlayer Image Artwork',
      category: 'stencil',
      assetId: 'unlayer_artwork',
      x: 512,
      y: 512,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      color: '#ffffff',
      opacity: 1,
      visible: true
    });
  }, [handleAddDecal]);

  // ─── DRAG EVENT LISTENERS FOR SPLITTERS ─────────────────────────────────────
  const handleStartMainSplitDrag = (e: React.PointerEvent) => {
    isDraggingMainSplit.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleStartVerticalSplitDrag = (e: React.PointerEvent) => {
    isDraggingVerticalSplit.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingMainSplit.current && mainContainerRef.current) {
      const rect = mainContainerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const percentage = (currentX / rect.width) * 100;
      const clamped = Math.max(25, Math.min(75, percentage));
      setMainSplitPercent(clamped);
    }

    if (isDraggingVerticalSplit.current && leftPanelRef.current) {
      const rect = leftPanelRef.current.getBoundingClientRect();
      const currentY = e.clientY - rect.top;
      const percentage = (currentY / rect.height) * 100;
      const clamped = Math.max(30, Math.min(75, percentage));
      setVerticalSplitPercent(clamped);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingMainSplit.current = false;
    isDraggingVerticalSplit.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const show2D = viewMode === 'split' || viewMode === '2d_only';
  const show3D = viewMode === 'split' || viewMode === '3d_only';

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="min-h-screen w-full bg-[#070710] text-white flex flex-col font-sans select-none overflow-x-hidden"
    >
      {/* TOP HEADER NAVIGATION */}
      <Header
        liveryState={liveryState}
        onUpdateState={handleUpdateLiveryState}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        onOpenPresetsModal={() => setIsPresetsOpen(true)}
        onOpenExportModal={() => setIsExportOpen(true)}
        onOpenUnlayerModal={() => setIsUnlayerOpen(true)}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* ── MOBILE TAB SWITCHER (visible below lg) ── */}
      <div className="lg:hidden flex border-b border-vice-border bg-[#0b0b14]">
        <button
          onClick={() => setMobileTab('2d')}
          className={`flex-1 py-2.5 text-xs font-vice transition-all ${
            mobileTab === '2d'
              ? 'text-vice-pink border-b-2 border-vice-pink bg-vice-card/50 font-bold'
              : 'text-gray-400'
          }`}
        >
          🎨 2D CANVAS &amp; EDITOR
        </button>
        <button
          onClick={() => setMobileTab('3d')}
          className={`flex-1 py-2.5 text-xs font-vice transition-all ${
            mobileTab === '3d'
              ? 'text-vice-cyan border-b-2 border-vice-cyan bg-vice-card/50 font-bold'
              : 'text-gray-400'
          }`}
        >
          🚗 3D GARAGE STUDIO
        </button>
      </div>

      {/* ── MAIN WORKSPACE WITH DRAGGABLE RESIZERS ── */}
      <main
        ref={mainContainerRef}
        className="flex-1 flex flex-col lg:flex-row p-2 lg:p-3 min-h-0 relative gap-0 overflow-hidden"
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
            h-[calc(100vh-130px)] lg:h-[calc(100vh-125px)]
            min-w-0 shrink-0
          `}
        >
          {/* 1. 2D Texture Canvas Section (Top) */}
          <div
            style={{
              height: `${verticalSplitPercent}%`
            }}
            className="w-full min-h-[220px] shrink-0 relative flex flex-col"
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
            />
          </div>

          {/* DRAGGABLE VERTICAL SPLITTER (Between 2D Canvas and Toolbar/Editor) */}
          <div
            onPointerDown={handleStartVerticalSplitDrag}
            onDoubleClick={() => setVerticalSplitPercent(58)}
            title="Drag up/down to resize Canvas vs Editor (Double click to reset)"
            className="w-full h-3 bg-[#0d0d1a] hover:bg-vice-pink/30 active:bg-vice-pink/50 cursor-row-resize flex items-center justify-center transition-colors group z-10 shrink-0 select-none border-y border-vice-border"
          >
            <div className="w-16 h-1 rounded-full bg-gray-600 group-hover:bg-vice-pink group-hover:shadow-neon-pink transition-all flex items-center justify-center">
              <GripHorizontal size={12} className="text-gray-400 group-hover:text-white" />
            </div>
          </div>

          {/* 2. 2D Toolbar / Editor Panel Section (Bottom) */}
          <div className="flex-1 min-h-[180px] overflow-hidden">
            <Toolbar2D
              liveryState={liveryState}
              onUpdateState={handleUpdateLiveryState}
              selectedDecalId={selectedDecalId}
              onSelectDecal={setSelectedDecalId}
              onAddDecal={handleAddDecal}
              onUpdateDecal={handleUpdateDecal}
              onRemoveDecal={handleRemoveDecal}
            />
          </div>
        </div>

        {/* ── DRAGGABLE MAIN HORIZONTAL SPLITTER (Between 2D Suite and 3D Studio) ── */}
        {viewMode === 'split' && (
          <div
            onPointerDown={handleStartMainSplitDrag}
            onDoubleClick={() => setMainSplitPercent(50)}
            title="Drag left/right to resize 2D Editor vs 3D Studio (Double click to reset 50/50)"
            className="hidden lg:flex w-3.5 h-[calc(100vh-125px)] bg-[#0d0d1a] hover:bg-vice-cyan/30 active:bg-vice-cyan/50 cursor-col-resize items-center justify-center transition-colors group z-20 shrink-0 select-none border-x border-vice-border mx-0.5"
          >
            <div className="w-1.5 h-16 rounded-full bg-gray-600 group-hover:bg-vice-cyan group-hover:shadow-neon-cyan transition-all flex flex-col items-center justify-center gap-1">
              <GripVertical size={12} className="text-gray-400 group-hover:text-black" />
            </div>
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
            flex-col flex-1
            h-[calc(100vh-130px)] lg:h-[calc(100vh-125px)]
            min-w-0
          `}
        >
          <GarageScene
            liveryState={liveryState}
            canvasElement={canvasElement}
            cameraPreset={cameraPreset}
            onSelectCameraPreset={setCameraPreset}
            quality={graphicsQuality}
            onSelectQuality={setGraphicsQuality}
          />
        </div>
      </main>

      {/* BOTTOM RADIO STATION BAR */}
      <footer className="px-2 sm:px-3 pb-2 sm:pb-3 pt-1">
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

      <UnlayerEditorModal
        isOpen={isUnlayerOpen}
        onClose={() => setIsUnlayerOpen(false)}
        imageUrl={canvasElement ? canvasElement.toDataURL() : ''}
        onSaveEditedImage={handleSaveUnlayerImage}
      />
    </div>
  );
};
