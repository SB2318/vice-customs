import React, { useState } from 'react';
import { audioEngine } from '../../utils/audioEngine';
import { Radio, Volume2, VolumeX, Play, Square, Disc } from 'lucide-react';

export const RADIO_STATIONS = [
  { id: 'flashfm', name: 'FLASH FM', freq: '95.6 FM', genre: '80s Synthpop', color: '#ff007f' },
  { id: 'wave103', name: 'WAVE 103', freq: '103.2 FM', genre: 'Darkwave / New Wave', color: '#00f0ff' },
  { id: 'vrock', name: 'V-ROCK', freq: '98.5 FM', genre: 'Heavy Synth Riffs', color: '#ffea00' },
  { id: 'wildstyle', name: 'WILDSTYLE', freq: '96.8 FM', genre: 'Electro Funk Beats', color: '#39ff14' },
];

export const ViceRadio: React.FC = () => {
  const [activeStation, setActiveStation] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);

  const handleStationClick = (id: string) => {
    if (activeStation === id) {
      audioEngine.stopRadio();
      setActiveStation(null);
    } else {
      audioEngine.playRadioStation(id);
      setActiveStation(id);
    }
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    audioEngine.setRadioVolume(isMuted ? 0 : v);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    audioEngine.setRadioVolume(!isMuted ? 0 : volume);
  };

  return (
    <div className="bg-[#10101f] border border-vice-border rounded-xl p-3 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-white">
      {/* Radio Logo & Tuner Screen */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="w-10 h-10 rounded-lg bg-vice-pink/20 border border-vice-pink flex items-center justify-center text-vice-pink shadow-neon-pink">
          <Radio size={20} className={activeStation ? 'animate-bounce' : ''} />
        </div>
        <div>
          <div className="text-xs font-vice text-vice-pink tracking-wider flex items-center gap-2">
            VICE RADIO 1986
            {activeStation && <span className="w-2 h-2 rounded-full bg-vice-pink animate-ping" />}
          </div>
          <div className="text-[11px] font-mono text-gray-400">
            {activeStation
              ? `${RADIO_STATIONS.find(s => s.id === activeStation)?.name} (${RADIO_STATIONS.find(s => s.id === activeStation)?.freq})`
              : 'STATION OFF - SELECT TO PLAY'}
          </div>
        </div>
      </div>

      {/* Cassette Tape Spools Animation */}
      <div className="hidden lg:flex items-center gap-4 bg-black/60 px-4 py-1.5 rounded-full border border-gray-800">
        <Disc size={20} className={`text-vice-cyan ${activeStation ? 'animate-spin' : 'opacity-40'}`} />
        <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
          {activeStation && (
            <div className="w-full h-full bg-gradient-to-r from-vice-pink via-vice-cyan to-vice-yellow animate-pulse" />
          )}
        </div>
        <Disc size={20} className={`text-vice-pink ${activeStation ? 'animate-spin' : 'opacity-40'}`} />
      </div>

      {/* Station Selector Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
        {RADIO_STATIONS.map((station) => (
          <button
            key={station.id}
            onClick={() => handleStationClick(station.id)}
            style={{
              borderColor: activeStation === station.id ? station.color : 'transparent',
              color: activeStation === station.id ? station.color : '#aaaaaa'
            }}
            className={`px-2.5 py-1 rounded text-[10px] font-vice border transition-all whitespace-nowrap ${
              activeStation === station.id ? 'bg-black font-bold shadow-md' : 'bg-[#18182a] hover:text-white'
            }`}
          >
            {station.name}
          </button>
        ))}
      </div>

      {/* Volume Slider */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        <button onClick={toggleMute} className="text-gray-400 hover:text-white">
          {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-20 accent-vice-pink cursor-pointer"
        />
      </div>
    </div>
  );
};
