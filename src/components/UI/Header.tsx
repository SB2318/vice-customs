import React, { useState } from 'react';
import { LiveryState, VehicleModel, ViewMode } from '../../types';
import { audioEngine } from '../../utils/audioEngine';
import { Flame, Sparkles, Download, Zap, Menu, X, Undo2, Redo2 } from 'lucide-react';

interface HeaderProps {
  liveryState: LiveryState;
  onUpdateState: (updates: Partial<LiveryState>) => void;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  onOpenPresetsModal: () => void;
  onOpenExportModal: () => void;
  onOpenUnlayerModal: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  liveryState,
  onUpdateState,
  viewMode,
  onSelectViewMode,
  onOpenPresetsModal,
  onOpenExportModal,
  onOpenUnlayerModal,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRevving, setIsRevving] = useState(false);

  const handleRevEngine = () => {
    if (isRevving) {
      audioEngine.stopEngine();
      setIsRevving(false);
      onUpdateState({ isExhaustFlamesActive: false });
    } else {
      setIsRevving(true);
      onUpdateState({ isExhaustFlamesActive: true });
      audioEngine.revEngine(2200, () => {
        setIsRevving(false);
        onUpdateState({ isExhaustFlamesActive: false });
      });
    }
    setMenuOpen(false);
  };

  const vehicles: VehicleModel[] = ['infernus', 'banshee', 'dominator', 'dirtbike'];

  return (
    <header className="w-full bg-[#090912]/98 backdrop-blur-xl border-b border-vice-border z-40 sticky top-0 overflow-x-auto scrollbar-none">
      {/* ── MAIN HORIZONTALLY SCROLLABLE ROW ── */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 gap-2 min-w-max">

        {/* ── LEFT SECTION: BRANDING & VEHICLE SELECTOR ── */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-vice-pink to-vice-purple flex items-center justify-center text-white text-base sm:text-lg shadow-neon-pink font-extrabold">
              🌴
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-vice font-black tracking-wider bg-gradient-to-r from-vice-pink via-vice-cyan to-vice-yellow bg-clip-text text-transparent">
                VICE CUSTOMS
              </h1>
              <p className="hidden 2xl:block text-[8px] font-vice text-gray-400 tracking-widest uppercase">
                GTA VI CAR LIVERY STUDIO
              </p>
            </div>
          </div>

          <div className="hidden sm:block w-[1px] h-5 bg-gray-800 mx-0.5" />

          {/* VEHICLE MODEL SELECTOR */}
          <div className="flex items-center bg-[#121224] p-0.5 rounded-xl border border-vice-border shrink-0 shadow-md">
            {vehicles.map((vm) => (
              <button
                key={vm}
                onClick={() => {
                  onUpdateState({ vehicle: vm });
                  audioEngine.playClickSFX();
                }}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-vice uppercase transition-all whitespace-nowrap ${
                  liveryState.vehicle === vm
                    ? 'bg-vice-pink text-white font-bold shadow-neon-pink'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {vm}
              </button>
            ))}
          </div>
        </div>

        {/* ── CENTER SECTION: UNDO / REDO & VIEW MODE ── */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Undo / Redo */}
          <div className="flex items-center bg-[#121224] p-0.5 rounded-xl border border-vice-border shadow-md">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className={`p-1.5 rounded-lg transition-all ${
                canUndo ? 'text-vice-pink hover:bg-white/10' : 'text-gray-600 cursor-not-allowed'
              }`}
            >
              <Undo2 size={14} />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className={`p-1.5 rounded-lg transition-all ${
                canRedo ? 'text-vice-cyan hover:bg-white/10' : 'text-gray-600 cursor-not-allowed'
              }`}
            >
              <Redo2 size={14} />
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex bg-[#121224] p-0.5 rounded-xl border border-vice-border text-[11px] font-vice shadow-md">
            {(['split', '2d_only', '3d_only'] as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => onSelectViewMode(m)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                  viewMode === m ? 'bg-vice-cyan text-black font-bold shadow-neon-cyan' : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'split' ? 'SPLIT' : m === '2d_only' ? '2D' : '3D'}
              </button>
            ))}
          </div>
        </div>

        {/* ── RIGHT SECTION: ALL ACTION BUTTONS (ALWAYS VISIBLE) ── */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          {/* Unlayer Editor */}
          <button
            onClick={onOpenUnlayerModal}
            className="px-2.5 py-1.5 bg-[#141426] hover:bg-vice-card border border-vice-cyan text-vice-cyan font-vice text-[11px] rounded-xl transition-all flex items-center gap-1 shadow-neon-cyan/40 whitespace-nowrap hover:scale-105 active:scale-95 shrink-0"
            title="Launch Unlayer React Image Editor"
          >
            🖌️ UNLAYER
          </button>

          {/* Rev Engine */}
          <button
            onClick={handleRevEngine}
            className="group px-3 py-1.5 bg-gradient-to-r from-vice-orange to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-vice text-[11px] font-black rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1 border border-yellow-400/40 whitespace-nowrap shrink-0"
          >
            <Flame size={14} className="text-yellow-300 animate-pulse" />
            REV!
          </button>

          {/* Underglow */}
          <button
            onClick={() => onUpdateState({ underglowEnabled: !liveryState.underglowEnabled })}
            className={`p-1.5 rounded-xl border transition-all shrink-0 ${
              liveryState.underglowEnabled
                ? 'bg-vice-cyan/20 border-vice-cyan text-vice-cyan shadow-neon-cyan'
                : 'bg-[#121224] border-vice-border text-gray-400 hover:text-white'
            }`}
            title="Toggle Neon Underglow"
          >
            <Zap size={15} />
          </button>

          {/* Presets */}
          <button
            onClick={onOpenPresetsModal}
            className="px-2.5 py-1.5 bg-[#141426] hover:bg-vice-card border border-vice-border hover:border-vice-pink text-vice-pink font-vice text-[11px] rounded-xl transition-all flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <Sparkles size={13} /> PRESETS
          </button>

          {/* 💾 EXPORT & JSON - PROMINENT & NEVER HIDDEN */}
          <button
            onClick={onOpenExportModal}
            className="px-3.5 py-1.5 bg-vice-pink hover:bg-pink-600 text-white font-vice text-[11px] font-bold rounded-xl shadow-neon-pink transition-all flex items-center gap-1.5 whitespace-nowrap hover:scale-105 active:scale-95 shrink-0"
            title="Export 2D/3D PNGs & JSON Livery Files"
          >
            <Download size={14} /> 💾 EXPORT &amp; JSON
          </button>
        </div>

        {/* ── MOBILE ROW ACTIONS (< md) ── */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          {/* Mobile Undo */}
          {onUndo && (
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-xl border border-vice-border transition-all ${
                canUndo ? 'bg-[#121224] text-vice-pink' : 'bg-[#121224]/50 text-gray-600'
              }`}
            >
              <Undo2 size={14} />
            </button>
          )}

          {/* Mobile Export quick button */}
          <button
            onClick={onOpenExportModal}
            className="px-2.5 py-1.5 bg-vice-pink text-white rounded-xl shadow-neon-pink flex items-center gap-1 text-[10px] font-vice font-bold shrink-0"
            title="Export & JSON"
          >
            <Download size={14} />
            <span>EXPORT</span>
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 bg-[#121224] border border-vice-border rounded-xl text-gray-300 hover:text-white shrink-0"
          >
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE DROPDOWN MENU ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-vice-border bg-[#0c0c1a] px-3 py-2.5 space-y-2.5 animate-fadeIn">
          {/* View Mode */}
          <div>
            <p className="text-[9px] font-vice text-gray-500 uppercase mb-1">View Mode</p>
            <div className="flex bg-[#121224] p-0.5 rounded-xl border border-vice-border text-xs font-vice">
              {(['split', '2d_only', '3d_only'] as ViewMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { onSelectViewMode(m); setMenuOpen(false); }}
                  className={`flex-1 py-1.5 rounded-lg ${
                    viewMode === m ? 'bg-vice-cyan text-black font-bold' : 'text-gray-400'
                  }`}
                >
                  {m === 'split' ? 'SPLIT' : m === '2d_only' ? '2D CANVAS' : '3D STUDIO'}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => { onOpenUnlayerModal(); setMenuOpen(false); }}
              className="py-2 bg-[#141426] border border-vice-cyan text-vice-cyan font-vice text-xs rounded-xl flex items-center justify-center gap-1.5"
            >
              🖌️ UNLAYER EDITOR
            </button>
            <button
              onClick={handleRevEngine}
              className="py-2 bg-gradient-to-r from-vice-orange to-red-600 text-white font-vice text-xs font-black rounded-xl flex items-center justify-center gap-1.5 border border-yellow-400/40"
            >
              <Flame size={14} className="text-yellow-300" /> REV ENGINE!
            </button>
            <button
              onClick={() => { onOpenPresetsModal(); setMenuOpen(false); }}
              className="py-2 bg-[#141426] border border-vice-border text-vice-pink font-vice text-xs rounded-xl flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} /> PRESETS
            </button>
            <button
              onClick={() => { onOpenExportModal(); setMenuOpen(false); }}
              className="py-2 bg-vice-pink text-white font-vice text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-neon-pink"
            >
              <Download size={14} /> EXPORT &amp; JSON
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
