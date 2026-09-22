import React, { useState, useCallback } from 'react';
import { LiveryState, DecalLayer, ViewMode, CameraPreset } from './types';
import { PRESET_LIVERIES } from './utils/presetLiveries';
import { Header } from './components/UI/Header';
import { ViceRadio } from './components/UI/ViceRadio';
import { LiveryCanvas } from './components/Canvas2D/LiveryCanvas';
import { Toolbar2D } from './components/Canvas2D/Toolbar2D';
import { GarageScene } from './components/Three3D/GarageScene';
import { GaragePresetsModal } from './components/UI/GaragePresetsModal';
import { ExportModal } from './components/UI/ExportModal';
import { UnlayerEditorModal } from './components/Canvas2D/UnlayerEditorModal';

export const App: React.FC = () => {
  // Main Livery State (Initialized with Vice City Nights #88)
  const [liveryState, setLiveryState] = useState<LiveryState>(
    PRESET_LIVERIES[0].state as LiveryState
  );

  const [selectedDecalId, setSelectedDecalId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('front_34');
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);

  // Modals state
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUnlayerOpen, setIsUnlayerOpen] = useState(false);

  // Partial State Updater
  const handleUpdateLiveryState = useCallback((updates: Partial<LiveryState>) => {
    setLiveryState(prev => ({ ...prev, ...updates }));
  }, []);

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

    setLiveryState(prev => ({
      ...prev,
      decals: [...prev.decals, newDecal]
    }));
    setSelectedDecalId(newDecal.id);
  }, [liveryState.decals.length]);

  const handleUpdateDecal = useCallback((id: string, updates: Partial<DecalLayer>) => {
    setLiveryState(prev => ({
      ...prev,
      decals: prev.decals.map(d => (d.id === id ? { ...d, ...updates } : d))
    }));
  }, []);

  const handleRemoveDecal = useCallback((id: string) => {
    setLiveryState(prev => ({
      ...prev,
      decals: prev.decals.filter(d => d.id !== id)
    }));
    if (selectedDecalId === id) setSelectedDecalId(null);
  }, [selectedDecalId]);

  const handleLoadLiveryPreset = useCallback((presetState: Partial<LiveryState>) => {
    setLiveryState(prev => ({ ...prev, ...presetState }));
    setSelectedDecalId(null);
  }, []);

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

  return (
    <div className="min-h-screen w-full bg-[#070710] text-white flex flex-col font-sans select-none overflow-x-hidden">
      {/* TOP HEADER NAVIGATION */}
      <Header
        liveryState={liveryState}
        onUpdateState={handleUpdateLiveryState}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        cameraPreset={cameraPreset}
        onSelectCameraPreset={setCameraPreset}
        onOpenPresetsModal={() => setIsPresetsOpen(true)}
        onOpenExportModal={() => setIsExportOpen(true)}
        onOpenUnlayerModal={() => setIsUnlayerOpen(true)}
      />

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* 2D CANVAS DECAL EDITOR (Left panel / Split) */}
        {(viewMode === 'split' || viewMode === '2d_only') && (
          <div className={`${viewMode === '2d_only' ? 'lg:col-span-12' : 'lg:col-span-6'} flex flex-col xl:flex-row gap-3 h-[calc(100vh-160px)] min-h-[580px]`}>
            {/* 2D Canvas Area */}
            <div className="flex-1 min-h-[380px]">
              <LiveryCanvas
                liveryState={liveryState}
                selectedDecalId={selectedDecalId}
                onSelectDecal={setSelectedDecalId}
                onUpdateDecal={handleUpdateDecal}
                onCanvasRender={setCanvasElement}
              />
            </div>

            {/* 2D Toolbar Control Palette */}
            <div className="w-full xl:w-[360px] h-[340px] xl:h-full">
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
        )}

        {/* 3D NEON GARAGE STUDIO VIEWPORT (Right panel / Split) */}
        {(viewMode === 'split' || viewMode === '3d_only') && (
          <div className={`${viewMode === '3d_only' ? 'lg:col-span-12' : 'lg:col-span-6'} h-[calc(100vh-160px)] min-h-[580px]`}>
            <GarageScene
              liveryState={liveryState}
              canvasElement={canvasElement}
              cameraPreset={cameraPreset}
            />
          </div>
        )}
      </main>

      {/* BOTTOM RADIO STATION BAR */}
      <footer className="px-3 pb-3">
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
