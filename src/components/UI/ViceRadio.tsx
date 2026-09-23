import React, { useState, useEffect } from 'react';
import { audioEngine } from '../../utils/audioEngine';
import { Radio, Volume2, VolumeX, Play, Square, Disc } from 'lucide-react';

export const RADIO_STATIONS = [
  { id: 'flashfm', name: 'FLASH FM', freq: '95.6 FM', genre: '80s Synthpop', color: '#ff007f' },
  { id: 'wave103', name: 'WAVE 103', freq: '103.2 FM', genre: 'Darkwave / New Wave', color: '#00f0ff' },
  { id: 'vrock', name: 'V-ROCK', freq: '98.5 FM', genre: 'Heavy Synth Riffs', color: '#ffea00' },
  { id: 'wildstyle', name: 'WILDSTYLE', freq: '96.8 FM', genre: 'Electro Funk Beats', color: '#39ff14' },
];

export const ViceRadio: React.FC = () => {
  const [activeStation, setActiveStation] = useState<string | null>(() => audioEngine.getCurrentStation());
  const [isMuted, setIsMuted] = useState(() => audioEngine.getIsMuted());
  const [volume, setVolume] = useState(0.4);

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
      audioEngine.toggleMute(); // unmute if user clicks a radio station
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

  return (
    <div className="bg-[#10101f] border border-vice-border rounded-xl p-2 sm:p-3 shadow-2xl text-white">
      {/* Top row: logo + stations + volume */}
      <div className="flex items-center gap-2">
        {/* Radio Logo */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-lg bg-vice-pink/20 border border-vice-pink flex items-center justify-center text-vice-pink shadow-neon-pink">
          <Radio size={16} className={activeStation ? 'animate-bounce' : ''} />
        </div>

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

        {/* Volume */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={toggleMute} className="text-gray-400 hover:text-white">
            {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
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
