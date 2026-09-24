import React, { useState, useEffect } from 'react';
import { audioEngine } from '../../utils/audioEngine';
import { Radio, Volume2, VolumeX, Flame, Disc, Music, Zap } from 'lucide-react';

export const RADIO_STATIONS = [
  { id: 'flashfm', name: 'FLASH FM', freq: '95.6 FM', genre: '80s Synthpop', color: '#ff007f' },
  { id: 'wave103', name: 'WAVE 103', freq: '103.2 FM', genre: 'Darkwave / New Wave', color: '#00f0ff' },
  { id: 'vrock', name: 'V-ROCK', freq: '98.5 FM', genre: 'Heavy Synth Riffs', color: '#ffea00' },
  { id: 'wildstyle', name: 'WILDSTYLE', freq: '96.8 FM', genre: 'Electro Funk Beats', color: '#39ff14' },
];

interface ViceRadioProps {
  compact?: boolean;
  showRev?: boolean;
  className?: string;
  onRevClick?: () => void;
}

export const ViceRadio: React.FC<ViceRadioProps> = ({
  compact = false,
  showRev = true,
  className = '',
  onRevClick
}) => {
  const [activeStation, setActiveStation] = useState<string | null>(() => audioEngine.getCurrentStation());
  const [isMuted, setIsMuted] = useState(() => audioEngine.getIsMuted());
  const [volume, setVolume] = useState(0.4);
  const [isRevving, setIsRevving] = useState(false);

  useEffect(() => {
    const unsubMute = audioEngine.subscribeMute((muted) => {
      setIsMuted(muted);
      if (muted) setActiveStation(null);
    });

    const unsubRadio = audioEngine.subscribeRadio((station) => {
      setActiveStation(station);
    });

    return () => {
      unsubMute();
      unsubRadio();
    };
  }, []);

  const handleStationClick = (id: string) => {
    if (audioEngine.getIsMuted()) {
      audioEngine.toggleMute(); // unmute if user selects a radio station
    }
    if (activeStation === id) {
      audioEngine.stopRadio();
    } else {
      audioEngine.playRadioStation(id);
    }
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    audioEngine.setRadioVolume(isMuted ? 0 : v);
  };

  const toggleMute = () => {
    const nextMuted = audioEngine.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleRevEngine = () => {
    if (audioEngine.getIsMuted()) {
      audioEngine.toggleMute();
    }
    if (isRevving) {
      audioEngine.stopEngine();
      setIsRevving(false);
    } else {
      setIsRevving(true);
      audioEngine.revEngine(2200, () => {
        setIsRevving(false);
      });
      if (onRevClick) onRevClick();
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl px-2 py-1 text-white shadow-lg backdrop-blur-md ${className}`}>
        {/* REVI Button */}
        {showRev && (
          <button
            onClick={handleRevEngine}
            title="REVI Engine Rev SFX"
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 border transition-all ${
              isRevving
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white border-orange-400 shadow-lg shadow-orange-500/50 animate-pulse'
                : 'bg-orange-950/40 text-orange-400 border-orange-500/40 hover:bg-orange-900/60 hover:text-white'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${isRevving ? 'animate-bounce text-yellow-300' : 'text-orange-400'}`} />
            <span>REVI</span>
          </button>
        )}

        {/* Radio Music Stations Pill Selector */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {RADIO_STATIONS.map((station) => (
            <button
              key={station.id}
              onClick={() => handleStationClick(station.id)}
              style={{
                borderColor: activeStation === station.id ? station.color : 'transparent',
                color: activeStation === station.id ? station.color : '#94a3b8'
              }}
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border transition-all whitespace-nowrap ${
                activeStation === station.id ? 'bg-slate-950 shadow-sm' : 'bg-slate-800/60 hover:text-white'
              }`}
            >
              {station.name}
            </button>
          ))}
        </div>

        {/* Global Sound Mute/Unmute */}
        <div className="flex items-center gap-1 shrink-0 border-l border-slate-800 pl-1.5">
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#10101f] border border-vice-border rounded-xl p-2 sm:p-3 shadow-2xl text-white ${className}`}>
      {/* Top row: logo + REVI + stations + volume */}
      <div className="flex items-center gap-2">
        {/* Radio Logo */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-lg bg-vice-pink/20 border border-vice-pink flex items-center justify-center text-vice-pink shadow-neon-pink">
          <Radio size={16} className={activeStation ? 'animate-bounce' : ''} />
        </div>

        {/* REVI Button */}
        {showRev && (
          <button
            onClick={handleRevEngine}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-vice font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all shrink-0 ${
              isRevving
                ? 'bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 text-white border-yellow-300 shadow-neon-pink animate-pulse'
                : 'bg-orange-950/40 text-orange-400 border-orange-500/40 hover:bg-orange-900/60 hover:text-white'
            }`}
          >
            <Flame size={14} className={isRevving ? 'animate-bounce text-yellow-300' : 'text-orange-400'} />
            <span>REVI</span>
          </button>
        )}

        {/* Station buttons — scrollable */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
          {RADIO_STATIONS.map((station) => (
            <button
              key={station.id}
              onClick={() => handleStationClick(station.id)}
              style={{
                borderColor: activeStation === station.id ? station.color : 'transparent',
                color: activeStation === station.id ? station.color : '#aaaaaa'
              }}
              className={`px-2 py-1 rounded text-[10px] font-vice border transition-all whitespace-nowrap ${
                activeStation === station.id ? 'bg-black font-bold shadow-md' : 'bg-[#18182a] hover:text-white'
              }`}
            >
              {station.name}
            </button>
          ))}
        </div>

        {/* Cassette spools — desktop only */}
        <div className="hidden lg:flex items-center gap-3 bg-black/60 px-3 py-1 rounded-full border border-gray-800 shrink-0">
          <Disc size={16} className={`text-vice-cyan ${activeStation ? 'animate-spin' : 'opacity-40'}`} />
          <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
            {activeStation && (
              <div className="w-full h-full bg-gradient-to-r from-vice-pink via-vice-cyan to-vice-yellow animate-pulse" />
            )}
          </div>
          <Disc size={16} className={`text-vice-pink ${activeStation ? 'animate-spin' : 'opacity-40'}`} />
        </div>

        {/* Volume & Global Sound Controller */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={toggleMute} className="text-gray-400 hover:text-white">
            {isMuted || volume === 0 ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} className="text-cyan-400" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-16 sm:w-20 accent-vice-pink cursor-pointer"
          />
        </div>
      </div>

      {/* Now playing label — shown below on mobile when active */}
      {activeStation && (
        <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-gray-400 sm:hidden">
          <span className="w-1.5 h-1.5 rounded-full bg-vice-pink animate-ping shrink-0" />
          {RADIO_STATIONS.find(s => s.id === activeStation)?.name} · {RADIO_STATIONS.find(s => s.id === activeStation)?.genre}
        </div>
      )}
    </div>
  );
};
