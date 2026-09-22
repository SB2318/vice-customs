import React from 'react';
import { LiveryState, PresetLivery } from '../../types';
import { PRESET_LIVERIES } from '../../utils/presetLiveries';
import { audioEngine } from '../../utils/audioEngine';
import { X, Sparkles, Car, Check } from 'lucide-react';

interface GaragePresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadLivery: (state: Partial<LiveryState>) => void;
  currentLivery: LiveryState;
}

export const GaragePresetsModal: React.FC<GaragePresetsModalProps> = ({
  isOpen,
  onClose,
  onLoadLivery,
  currentLivery
}) => {
  if (!isOpen) return null;

  const handleSelectPreset = (preset: PresetLivery) => {
    audioEngine.playSprayPaintSFX();
    onLoadLivery(preset.state);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#0f0f1b] border-2 border-vice-pink rounded-2xl shadow-neon-pink p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-vice-border">
          <div className="flex items-center gap-3">
            <Sparkles className="text-vice-pink" size={24} />
            <div>
              <h2 className="text-lg font-vice text-white tracking-wider">VICE SIGNATURE LIVERIES</h2>
              <p className="text-xs text-gray-400">Load iconic GTA Vice Customs pre-built wrapping designs</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          {PRESET_LIVERIES.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="group relative bg-[#151526] hover:bg-vice-card p-4 rounded-xl border border-vice-border hover:border-vice-cyan transition-all cursor-pointer shadow-lg hover:scale-102 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-vice text-vice-cyan uppercase tracking-wider">{preset.vehicle}</span>
                  <span className="text-[10px] text-gray-500">{preset.author}</span>
                </div>
                <h3 className="text-sm font-vice font-bold text-white group-hover:text-vice-pink transition-colors mb-2">
                  {preset.name}
                </h3>
                {/* Color swatches preview */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[10px] text-gray-400">Colors:</span>
                  <div className="w-5 h-5 rounded-full border border-white/40 shadow" style={{ backgroundColor: preset.state.primaryColor }} />
                  <div className="w-5 h-5 rounded-full border border-white/40 shadow" style={{ backgroundColor: preset.state.secondaryColor }} />
                  <span className="text-[10px] font-mono text-vice-yellow uppercase ml-auto">{preset.state.finish}</span>
                </div>
              </div>

              <button className="mt-4 w-full py-2 bg-vice-cyan/20 group-hover:bg-vice-pink text-vice-cyan group-hover:text-white text-xs font-vice rounded-lg transition-colors font-bold flex items-center justify-center gap-2">
                <Car size={14} /> LOAD DESIGN
              </button>
            </div>
          ))}
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1a1a2e] text-gray-300 font-vice text-xs rounded-xl hover:text-white"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};
