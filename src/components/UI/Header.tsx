import React from 'react';
import { LiveryState, VehicleModel, ViewMode, CameraPreset } from '../../types';
import { audioEngine } from '../../utils/audioEngine';
import { Flame, Eye, Sparkles, Download, Layers, Sun, Zap, Camera } from 'lucide-react';

interface HeaderProps {
  liveryState: LiveryState;
  onUpdateState: (updates: Partial<LiveryState>) => void;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  cameraPreset: CameraPreset;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  onOpenPresetsModal: () => void;
  onOpenExportModal: () => void;
  onOpenUnlayerModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  liveryState,
  onUpdateState,
  viewMode,
  onSelectViewMode,
  cameraPreset,
  onSelectCameraPreset,
  onOpenPresetsModal,
  onOpenExportModal,
  onOpenUnlayerModal,
}) => {
  const handleRevEngine = () => {
    audioEngine.revEngine(2200);
  };

  return (
    <header className="w-full bg-[#090912]/90 backdrop-blur-xl border-b border-vice-border px-4 py-3 flex flex-wrap items-center justify-between gap-4 z-40">
      {/* BRANDING LOGO */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vice-pink to-vice-purple flex items-center justify-center text-white text-xl shadow-neon-pink font-extrabold tracking-tighter">
          🌴
        </div>
        <div>
          <h1 className="text-xl font-vice font-black tracking-wider bg-gradient-to-r from-vice-pink via-vice-cyan to-vice-yellow bg-clip-text text-transparent drop-shadow-md">
            VICE CUSTOMS
          </h1>
          <p className="text-[10px] font-vice text-gray-400 tracking-widest uppercase">
            2D DECAL & LIVERY DESIGNER
          </p>
        </div>
      </div>

      {/* VEHICLE MODEL SELECTOR */}
      <div className="flex items-center bg-[#121224] p-1 rounded-xl border border-vice-border">
        {(['infernus', 'banshee', 'dominator', 'dirtbike'] as VehicleModel[]).map((vm) => (
          <button
            key={vm}
            onClick={() => {
              onUpdateState({ vehicle: vm });
              audioEngine.playClickSFX();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-vice uppercase transition-all ${
              liveryState.vehicle === vm
                ? 'bg-vice-pink text-white font-bold shadow-neon-pink'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {vm}
          </button>
        ))}
      </div>

      {/* VIEW MODE & CAMERA PRESET CONTROLS */}
      <div className="flex items-center gap-2">
        {/* View Mode Split */}
        <div className="flex bg-[#121224] p-1 rounded-xl border border-vice-border text-xs font-vice">
          <button
            onClick={() => onSelectViewMode('split')}
            className={`px-2.5 py-1 rounded-lg ${viewMode === 'split' ? 'bg-vice-cyan text-black font-bold' : 'text-gray-400'}`}
          >
            SPLIT 2D/3D
          </button>
          <button
            onClick={() => onSelectViewMode('2d_only')}
            className={`px-2.5 py-1 rounded-lg ${viewMode === '2d_only' ? 'bg-vice-cyan text-black font-bold' : 'text-gray-400'}`}
          >
            2D CANVAS
          </button>
          <button
            onClick={() => onSelectViewMode('3d_only')}
            className={`px-2.5 py-1 rounded-lg ${viewMode === '3d_only' ? 'bg-vice-cyan text-black font-bold' : 'text-gray-400'}`}
          >
            3D STUDIO
          </button>
        </div>

        {/* Camera Angle Presets */}
        <div className="hidden xl:flex items-center bg-[#121224] p-1 rounded-xl border border-vice-border text-[11px] font-vice">
          <span className="px-2 text-gray-500"><Camera size={14} /></span>
          <button
            onClick={() => onSelectCameraPreset('front_34')}
            className={`px-2 py-1 rounded ${cameraPreset === 'front_34' ? 'bg-vice-card text-vice-pink' : 'text-gray-400'}`}
          >
            3/4 Front
          </button>
          <button
            onClick={() => onSelectCameraPreset('side')}
            className={`px-2 py-1 rounded ${cameraPreset === 'side' ? 'bg-vice-card text-vice-pink' : 'text-gray-400'}`}
          >
            Side
          </button>
          <button
            onClick={() => onSelectCameraPreset('rear')}
            className={`px-2 py-1 rounded ${cameraPreset === 'rear' ? 'bg-vice-card text-vice-pink' : 'text-gray-400'}`}
          >
            Rear
          </button>
          <button
            onClick={() => onSelectCameraPreset('turntable')}
            className={`px-2 py-1 rounded ${cameraPreset === 'turntable' ? 'bg-vice-yellow text-black font-bold' : 'text-gray-400'}`}
          >
            Spin 🔄
          </button>
        </div>
      </div>

      {/* INTERACTIVE ACTIONS & AUDIO REV BUTTON */}
      <div className="flex items-center gap-3">
        {/* UNLAYER REACT IMAGE EDITOR BUTTON */}
        <button
          onClick={onOpenUnlayerModal}
          className="px-3 py-2 bg-[#141426] hover:bg-vice-card border border-vice-cyan text-vice-cyan font-vice text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-neon-cyan/40"
          title="Open Unlayer React Image Editor"
        >
          🖌️ UNLAYER EDITOR
        </button>

        {/* REV ENGINE BUTTON */}
        <button
          onClick={handleRevEngine}
          className="group relative px-4 py-2 bg-gradient-to-r from-vice-orange to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-vice text-xs font-black rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-yellow-400/40"
        >
          <Flame size={16} className="text-yellow-300 animate-pulse group-hover:rotate-12 transition-transform" />
          REV ENGINE!
        </button>

        {/* Underglow Toggle */}
        <button
          onClick={() => onUpdateState({ underglowEnabled: !liveryState.underglowEnabled })}
          className={`p-2 rounded-xl border transition-all ${
            liveryState.underglowEnabled
              ? 'bg-vice-cyan/20 border-vice-cyan text-vice-cyan shadow-neon-cyan'
              : 'bg-[#121224] border-vice-border text-gray-400'
          }`}
          title="Toggle Neon Underglow"
        >
          <Zap size={18} />
        </button>

        {/* Presets Modal Button */}
        <button
          onClick={onOpenPresetsModal}
          className="px-3 py-2 bg-[#141426] hover:bg-vice-card border border-vice-border hover:border-vice-pink text-vice-pink font-vice text-xs rounded-xl transition-all flex items-center gap-1.5"
        >
          <Sparkles size={16} /> PRESETS
        </button>

        {/* Export / Download Button */}
        <button
          onClick={onOpenExportModal}
          className="px-4 py-2 bg-vice-pink hover:bg-pink-600 text-white font-vice text-xs font-bold rounded-xl shadow-neon-pink transition-all flex items-center gap-2"
        >
          <Download size={16} /> EXPORT
        </button>
      </div>
    </header>
  );
};
