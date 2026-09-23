import React, { useState } from 'react';
import { LiveryState, VehicleModel, ViewMode, AppMode } from '../../types';
import { audioEngine } from '../../utils/audioEngine';
import { Flame, Sparkles, Download, Menu, X, Undo2, Redo2, Volume2, VolumeX, ShieldAlert, Car } from 'lucide-react';
import { useDragScroll } from '../../utils/useDragScroll';

interface HeaderProps {
  liveryState: LiveryState;
  onUpdateState: (updates: Partial<LiveryState>) => void;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  appMode: AppMode;
  onSelectAppMode: (mode: AppMode) => void;
  onOpenPresetsModal: () => void;
  onOpenExportModal: () => void;
  onOpenTour?: () => void;
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
  appMode,
  onSelectAppMode,
  onOpenPresetsModal,
  onOpenExportModal,
  onOpenTour,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {

  const [menuOpen, setMenuOpen] = useState(false);
  const [isRevving, setIsRevving] = useState(false);
  const [isMuted, setIsMuted] = useState(() => audioEngine.getIsMuted());

  React.useEffect(() => {
    const unsub = audioEngine.subscribeMute((muted) => {
      setIsMuted(muted);
    });
    return () => { unsub(); };
  }, []);

  const handleToggleMute = () => {
    const nextMuted = audioEngine.toggleMute();
    setIsMuted(nextMuted);
  };
  
  const headerDrag = useDragScroll();

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
    <header className="w-full bg-[#090912]/98 backdrop-blur-xl border-b border-vice-border z-40 sticky top-0">
      {/* ── MAIN RESPONSIVE ROW ── */}
      <div className="flex items-center justify-between px-2.5 sm:px-4 py-2 gap-2 w-full max-w-full">

        {/* ── LEFT SECTION: BRANDING & VEHICLE SELECTOR ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-vice-pink to-vice-purple flex items-center justify-center text-white text-base sm:text-lg shadow-neon-pink font-extrabold shrink-0">
              🌴
            </div>
            <div>
              <h1 className="text-xs sm:text-base font-vice font-black tracking-wider bg-gradient-to-r from-vice-pink via-vice-cyan to-vice-yellow bg-clip-text text-transparent">
                VICE CUSTOMS
              </h1>
              <p className="hidden 2xl:block text-[8px] font-vice text-gray-400 tracking-widest uppercase">
                VEHICLE HEIST EDITION
              </p>
            </div>
          </div>

          <div className="hidden sm:block w-[1px] h-5 bg-gray-800 mx-0.5" />

          {/* DUAL MODE TOGGLE BUTTONS (GARAGE STUDIO vs VEHICLE HEIST FOCUSABLE) */}
          <div className="flex items-center bg-[#121224] p-0.5 rounded-xl border border-vice-border shrink-0 shadow-md">
            <button
              onClick={() => {
                audioEngine.playTransitionSFX();
                onSelectAppMode('studio');
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-vice font-bold uppercase transition-all flex items-center gap-1.5 ${
                appMode === 'studio'
                  ? 'bg-gradient-to-r from-vice-pink to-purple-600 text-white shadow-neon-pink'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Car size={13} /> GARAGE
            </button>
            <button
              onClick={() => {
                audioEngine.playTransitionSFX();
                onSelectAppMode('heist');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-vice font-bold uppercase transition-all flex items-center gap-1.5 ${
                appMode === 'heist'
                  ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 text-white shadow-neon-cyan ring-2 ring-pink-500/60'
                  : 'text-pink-400 bg-pink-950/30 border border-pink-500/40 hover:text-white hover:bg-pink-900/50'
              }`}
            >
              <ShieldAlert size={13} className="text-pink-400 animate-pulse" /> VEHICLE HEIST
            </button>
          </div>

          <div className="hidden lg:block w-[1px] h-5 bg-gray-800 mx-0.5" />

          {/* VEHICLE MODEL SELECTOR - Desktop Pills (only in studio mode) */}
          {appMode === 'studio' && (
            <div className="hidden lg:flex items-center bg-[#121224] p-0.5 rounded-xl border border-vice-border shrink-0 shadow-md">
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
          )}

          {/* VEHICLE MODEL SELECTOR - Mobile Dropdown */}
          {appMode === 'studio' && (
            <div className="lg:hidden">
              <select
                value={liveryState.vehicle}
                onChange={(e) => {
                  onUpdateState({ vehicle: e.target.value as VehicleModel });
                  audioEngine.playClickSFX();
                }}
                className="bg-[#121224] text-vice-pink border border-vice-border rounded-lg px-2 py-1 text-xs font-vice uppercase font-bold focus:outline-none"
              >
                {vehicles.map((vm) => (
                  <option key={vm} value={vm} className="bg-[#121224] text-white">
                    {vm}
                  </option>
                ))}
              </select>
            </div>
          )}
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
                onClick={() => {
                  onSelectViewMode(m);
                  audioEngine.playTransitionSFX();
                }}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                  viewMode === m ? 'bg-vice-cyan text-black font-bold shadow-neon-cyan' : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'split' ? 'SPLIT' : m === '2d_only' ? '2D' : '3D'}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          {/* Sound Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-1.5 rounded-xl border transition-all shrink-0 ${
              isMuted
                ? 'bg-red-500/20 border-red-500/60 text-red-400'
                : 'bg-[#141426] border-vice-cyan text-vice-cyan shadow-neon-cyan/40 hover:bg-vice-cyan hover:text-black'
            }`}
            title={isMuted ? "Unmute Audio SFX" : "Mute Audio SFX"}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <button
            onClick={handleRevEngine}
            className="group px-3 py-1.5 bg-gradient-to-r from-vice-orange to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-vice text-[11px] font-black rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1 border border-yellow-400/40 whitespace-nowrap shrink-0"
          >
            <Flame size={14} className="text-yellow-300 animate-pulse" />
            REV!
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
          {/* Mobile Mute button */}
          <button
            onClick={handleToggleMute}
            className={`p-1.5 rounded-xl border transition-all ${
              isMuted
                ? 'bg-red-500/20 border-red-500/60 text-red-400'
                : 'bg-[#121224] border-vice-cyan text-vice-cyan'
            }`}
            title={isMuted ? "Unmute Audio SFX" : "Mute Audio SFX"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

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
