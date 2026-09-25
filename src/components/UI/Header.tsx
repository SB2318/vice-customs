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

  const vehicles: VehicleModel[] = ['infernus', 'cheetah', 'banshee', 'comet', 'dominator', 'dirtbike', 'train', 'boat', 'helicopter'];

  return (
    <header className="w-full bg-[#090912]/98 backdrop-blur-xl border-b border-vice-border z-40 sticky top-0">
      {/* ── MAIN RESPONSIVE ROW ── */}
      <div className="flex items-center justify-between px-2.5 sm:px-4 py-2 gap-2 w-full max-w-full">

        {/* ── LEFT SECTION: BRANDING & VEHICLE SELECTOR ── */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          {/* Logo */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-vice-pink to-vice-purple flex items-center justify-center text-white text-sm sm:text-base shadow-neon-pink font-extrabold shrink-0">
              🌴
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-vice font-black tracking-wider bg-gradient-to-r from-vice-pink via-vice-cyan to-vice-yellow bg-clip-text text-transparent leading-none">
                VICE CUSTOMS
              </h1>
            
            </div>
          </div>

          <div className="hidden sm:block w-[1px] h-4 bg-gray-800 mx-0.5" />

          {/* THREE MAIN MODE TOGGLE TABS (GARAGE STUDIO, VEHICLE HEIST, JOURNEY STORIES) */}
          <div className="flex items-center bg-[#121224] p-0.5 rounded-xl border border-vice-border shrink-0 shadow-md">
            <button
              onClick={() => {
                audioEngine.playTransitionSFX();
                onSelectAppMode('studio');
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-vice font-bold uppercase transition-all flex items-center gap-1 ${
                appMode === 'studio'
                  ? 'bg-gradient-to-r from-vice-pink to-purple-600 text-white shadow-neon-pink'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Car size={12} /> GARAGE
            </button>
            <button
              onClick={() => {
                audioEngine.playTransitionSFX();
                onSelectAppMode('heist');
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-vice font-bold uppercase transition-all flex items-center gap-1 ${
                appMode === 'heist'
                  ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 text-white shadow-neon-cyan ring-1 ring-pink-500/60'
                  : 'text-pink-400 bg-pink-950/30 border border-pink-500/40 hover:text-white hover:bg-pink-900/50'
              }`}
            >
              <ShieldAlert size={12} className="text-pink-400 animate-pulse" /> VEHICLE HEIST
            </button>
            <button
              onClick={() => {
                audioEngine.playTransitionSFX();
                onSelectAppMode('journey');
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-vice font-bold uppercase transition-all flex items-center gap-1 ${
                appMode === 'journey'
                  ? 'bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-400 text-slate-950 font-black shadow-neon-cyan'
                  : 'text-cyan-400 bg-cyan-950/30 border border-cyan-500/40 hover:text-white hover:bg-cyan-900/50'
              }`}
            >
              <Sparkles size={12} className="text-cyan-300" /> JOURNEY STORIES
            </button>
          </div>
        </div>

        {/* ── RIGHT GLOBAL CONTROLS ── */}
        <div className="flex items-center gap-1.5 shrink-0">
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
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE DROPDOWN MENU ── */}
      {appMode === 'studio' && menuOpen && (
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
