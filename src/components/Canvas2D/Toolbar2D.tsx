import React, { useState } from 'react';
import { LiveryState, PaintFinish, DecalCategory, DecalLayer } from '../../types';
import { DECAL_LIBRARY, DECAL_CATEGORIES } from '../../utils/decalLibrary';
import { audioEngine } from '../../utils/audioEngine';
import { Paintbrush, Layers, Type as TypeIcon, Sparkles, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, FlipHorizontal, Sliders } from 'lucide-react';

interface Toolbar2DProps {
  liveryState: LiveryState;
  onUpdateState: (updates: Partial<LiveryState>) => void;
  selectedDecalId: string | null;
  onSelectDecal: (id: string | null) => void;
  onAddDecal: (decal: Partial<DecalLayer>) => void;
  onUpdateDecal: (id: string, updates: Partial<DecalLayer>) => void;
  onRemoveDecal: (id: string) => void;
}

const PALETTE_COLORS = [
  '#ff007f', '#00f0ff', '#39ff14', '#ffea00', '#9d00ff', '#ff5500',
  '#0b0b12', '#ffffff', '#111111', '#888888', '#ff0000', '#0a2342'
];

export const Toolbar2D: React.FC<Toolbar2DProps> = ({
  liveryState,
  onUpdateState,
  selectedDecalId,
  onSelectDecal,
  onAddDecal,
  onUpdateDecal,
  onRemoveDecal
}) => {
  const [activeTab, setActiveTab] = useState<'paint' | 'decals' | 'text' | 'layers'>('paint');
  const [decalCategory, setDecalCategory] = useState<DecalCategory>('stripe');

  // Custom Text & Plate inputs
  const [customTextVal, setCustomTextVal] = useState('VICE CITY');
  const [textFont, setTextFont] = useState('Orbitron');
  const [textColor, setTextColor] = useState('#ffffff');

  const [plateTextVal, setPlateTextVal] = useState('VC 1986');
  const [plateStyleVal, setPlateStyleVal] = useState<'vice_pink' | 'yellow_blue' | 'black_gold'>('vice_pink');

  const selectedDecal = liveryState.decals.find(d => d.id === selectedDecalId);

  const handleAddDecalFromLibrary = (defId: string) => {
    const def = DECAL_LIBRARY.find(d => d.id === defId);
    if (!def) return;

    audioEngine.playSprayPaintSFX();

    if (def.category === 'plate') {
      onAddDecal({
        name: def.name,
        category: 'plate',
        assetId: def.id,
        x: 512,
        y: 850,
        scaleX: 0.8,
        scaleY: 0.8,
        rotation: 0,
        color: '#ffffff',
        opacity: 1,
        flipX: false,
        flipY: false,
        zIndex: liveryState.decals.length + 1,
        visible: true,
        plateText: plateTextVal,
        plateStyle: plateStyleVal
      });
    } else {
      onAddDecal({
        name: def.name,
        category: def.category,
        assetId: def.id,
        x: 512,
        y: 512,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        color: def.defaultColor,
        secondaryColor: def.secondaryColor,
        opacity: 1,
        flipX: false,
        flipY: false,
        zIndex: liveryState.decals.length + 1,
        visible: true,
      });
    }
  };

  const handleAddCustomText = () => {
    if (!customTextVal.trim()) return;
    audioEngine.playSprayPaintSFX();
    onAddDecal({
      name: `Text: ${customTextVal}`,
      category: 'text',
      assetId: 'custom_text_item',
      x: 512,
      y: 512,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      color: textColor,
      opacity: 1,
      flipX: false,
      flipY: false,
      zIndex: liveryState.decals.length + 1,
      visible: true,
      customText: customTextVal,
      fontFamily: textFont
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#10101c] border border-vice-border rounded-xl overflow-hidden shadow-2xl">
      {/* TABS NAVIGATION */}
      <div className="flex bg-[#0b0b14] border-b border-vice-border">
        <button
          onClick={() => { setActiveTab('paint'); audioEngine.playClickSFX(); }}
          className={`flex-1 py-3 px-2 flex items-center justify-center gap-2 text-xs font-vice transition-all ${
            activeTab === 'paint'
              ? 'bg-vice-card text-vice-pink border-b-2 border-vice-pink shadow-neon-pink'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Paintbrush size={16} /> Paint & Finish
        </button>

        <button
          onClick={() => { setActiveTab('decals'); audioEngine.playClickSFX(); }}
          className={`flex-1 py-3 px-2 flex items-center justify-center gap-2 text-xs font-vice transition-all ${
            activeTab === 'decals'
              ? 'bg-vice-card text-vice-cyan border-b-2 border-vice-cyan shadow-neon-cyan'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles size={16} /> Decals Studio
        </button>

        <button
          onClick={() => { setActiveTab('text'); audioEngine.playClickSFX(); }}
          className={`flex-1 py-3 px-2 flex items-center justify-center gap-2 text-xs font-vice transition-all ${
            activeTab === 'text'
              ? 'bg-vice-card text-vice-yellow border-b-2 border-vice-yellow shadow-neon-yellow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <TypeIcon size={16} /> Text & Plates
        </button>

        <button
          onClick={() => { setActiveTab('layers'); audioEngine.playClickSFX(); }}
          className={`flex-1 py-3 px-2 flex items-center justify-center gap-2 text-xs font-vice transition-all ${
            activeTab === 'layers'
              ? 'bg-vice-card text-vice-purple border-b-2 border-vice-purple shadow-neon-purple'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Layers size={16} /> Layers ({liveryState.decals.length})
        </button>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="flex-1 p-4 overflow-y-auto space-y-5 custom-scrollbar">
        {/* --- TAB 1: PAINT & FINISH --- */}
        {activeTab === 'paint' && (
          <div className="space-y-6">
            {/* Primary Paint Color */}
            <div>
              <label className="text-xs font-vice text-gray-300 block mb-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-vice-pink" /> PRIMARY BODY COAT
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PALETTE_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => onUpdateState({ primaryColor: c })}
                    style={{ backgroundColor: c }}
                    className={`h-9 rounded-lg border-2 transition-transform hover:scale-110 ${
                      liveryState.primaryColor === c ? 'border-white scale-105 ring-2 ring-vice-pink' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-400">Custom Hex:</span>
                <input
                  type="color"
                  value={liveryState.primaryColor}
                  onChange={(e) => onUpdateState({ primaryColor: e.target.value })}
                  className="w-10 h-8 bg-transparent cursor-pointer rounded border border-gray-700"
                />
                <span className="text-xs font-mono text-gray-300">{liveryState.primaryColor}</span>
              </div>
            </div>

            {/* Secondary Accent Paint */}
            <div>
              <label className="text-xs font-vice text-gray-300 block mb-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-vice-cyan" /> DUAL-TONE SECONDARY ACCENT
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PALETTE_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => onUpdateState({ secondaryColor: c })}
                    style={{ backgroundColor: c }}
                    className={`h-9 rounded-lg border-2 transition-transform hover:scale-110 ${
                      liveryState.secondaryColor === c ? 'border-white scale-105 ring-2 ring-vice-cyan' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Paint Finish Selector */}
            <div>
              <label className="text-xs font-vice text-gray-300 block mb-2">FINISH MATERIAL Patina</label>
              <div className="grid grid-cols-2 gap-2">
                {(['gloss', 'matte', 'metallic', 'pearlescent', 'chameleon', 'carbon', 'rust'] as PaintFinish[]).map(finish => (
                  <button
                    key={finish}
                    onClick={() => onUpdateState({ finish })}
                    className={`py-2 px-3 rounded-lg text-xs font-vice capitalize border transition-all text-left flex items-center justify-between ${
                      liveryState.finish === finish
                        ? 'bg-vice-card border-vice-pink text-vice-pink shadow-neon-pink'
                        : 'bg-[#181828] border-vice-border text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>{finish}</span>
                    {liveryState.finish === finish && <Sparkles size={14} className="text-vice-pink animate-spin" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: DECALS STUDIO LIBRARY --- */}
        {activeTab === 'decals' && (
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {DECAL_CATEGORIES.filter(c => c.id !== 'plate' && c.id !== 'text').map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setDecalCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-vice whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    decalCategory === cat.id
                      ? 'bg-vice-cyan text-black font-bold shadow-neon-cyan'
                      : 'bg-[#181828] text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>

            {/* Decal Items Grid */}
            <div className="grid grid-cols-2 gap-3">
              {DECAL_LIBRARY.filter(d => d.category === decalCategory).map(decal => (
                <button
                  key={decal.id}
                  onClick={() => handleAddDecalFromLibrary(decal.id)}
                  className="group relative p-3 bg-[#161626] hover:bg-vice-card border border-vice-border hover:border-vice-pink rounded-xl flex flex-col items-center text-center transition-all hover:scale-105 shadow-md"
                >
                  <div className="w-12 h-12 mb-2 flex items-center justify-center rounded-lg bg-black/50 border border-gray-700 text-vice-cyan font-bold text-lg group-hover:border-vice-pink">
                    {decal.category === 'stripe' ? '🏁' : decal.category === 'flame' ? '🔥' : decal.category === 'stencil' ? '🎨' : '⚡'}
                  </div>
                  <span className="text-xs font-vice text-white group-hover:text-vice-pink">{decal.name}</span>
                  <span className="text-[10px] text-gray-400 mt-1 line-clamp-1">{decal.description}</span>
                  <span className="mt-2 text-[10px] font-vice text-vice-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                    + APPLY TO CANVAS
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: TEXT & PLATES --- */}
        {activeTab === 'text' && (
          <div className="space-y-6">
            {/* Custom Typography Generator */}
            <div className="bg-[#141424] p-4 rounded-xl border border-vice-border space-y-3">
              <h4 className="text-xs font-vice text-vice-yellow flex items-center gap-2">
                <TypeIcon size={16} /> CUSTOM RACING TYPOGRAPHY
              </h4>
              <input
                type="text"
                value={customTextVal}
                onChange={(e) => setCustomTextVal(e.target.value)}
                placeholder="Enter custom text..."
                className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-vice focus:border-vice-yellow focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-vice text-gray-400 block mb-1">FONT STYLE</label>
                  <select
                    value={textFont}
                    onChange={(e) => setTextFont(e.target.value)}
                    className="w-full bg-black/60 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white"
                  >
                    <option value="Orbitron">Orbitron 80s</option>
                    <option value="Impact">Impact Stencil</option>
                    <option value="Permanent Marker">Marker Graffiti</option>
                    <option value="Press Start 2P">8-Bit Arcade</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-vice text-gray-400 block mb-1">TEXT COLOR</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 bg-transparent cursor-pointer rounded"
                    />
                    <span className="text-xs font-mono">{textColor}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddCustomText}
                className="w-full py-2 bg-vice-yellow text-black font-vice text-xs rounded-lg hover:bg-yellow-300 transition-colors font-bold shadow-neon-yellow"
              >
                + ADD TEXT DECAL
              </button>
            </div>

            {/* License Plate Generator */}
            <div className="bg-[#141424] p-4 rounded-xl border border-vice-border space-y-3">
              <h4 className="text-xs font-vice text-vice-pink flex items-center gap-2">
                🚘 LICENSE PLATE CREATOR
              </h4>
              <input
                type="text"
                value={plateTextVal}
                onChange={(e) => setPlateTextVal(e.target.value.toUpperCase())}
                maxLength={8}
                placeholder="VC 1986"
                className="w-full bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase tracking-widest text-center focus:border-vice-pink focus:outline-none"
              />

              <div>
                <label className="text-[10px] font-vice text-gray-400 block mb-1">PLATE STYLE</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPlateStyleVal('vice_pink')}
                    className={`p-2 rounded text-[10px] font-vice border ${
                      plateStyleVal === 'vice_pink' ? 'border-vice-pink bg-vice-pink/20 text-vice-pink' : 'border-gray-700 text-gray-400'
                    }`}
                  >
                    Vice Sunset
                  </button>
                  <button
                    onClick={() => setPlateStyleVal('yellow_blue')}
                    className={`p-2 rounded text-[10px] font-vice border ${
                      plateStyleVal === 'yellow_blue' ? 'border-blue-500 bg-blue-500/20 text-yellow-300' : 'border-gray-700 text-gray-400'
                    }`}
                  >
                    Blue / Yellow
                  </button>
                  <button
                    onClick={() => setPlateStyleVal('black_gold')}
                    className={`p-2 rounded text-[10px] font-vice border ${
                      plateStyleVal === 'black_gold' ? 'border-yellow-500 bg-black text-yellow-400' : 'border-gray-700 text-gray-400'
                    }`}
                  >
                    Black & Gold
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleAddDecalFromLibrary('plate_vice_pink')}
                className="w-full py-2 bg-vice-pink text-white font-vice text-xs rounded-lg hover:bg-pink-600 transition-colors font-bold shadow-neon-pink"
              >
                + MOUNT LICENSE PLATE
              </button>
            </div>
          </div>
        )}

        {/* --- TAB 4: LAYERS MANAGER & ACTIVE DECAL CONTROLS --- */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            {selectedDecal && (
              <div className="bg-vice-card p-3 rounded-xl border border-vice-pink shadow-neon-pink space-y-3">
                <div className="flex items-center justify-between text-xs font-vice text-vice-pink">
                  <span>EDITING: {selectedDecal.name}</span>
                  <button onClick={() => onRemoveDecal(selectedDecal.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-gray-400">COLOR TINT</label>
                    <input
                      type="color"
                      value={selectedDecal.color}
                      onChange={(e) => onUpdateDecal(selectedDecal.id, { color: e.target.value })}
                      className="w-full h-8 bg-transparent cursor-pointer rounded"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400">OPACITY ({Math.round(selectedDecal.opacity * 100)}%)</label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={selectedDecal.opacity}
                      onChange={(e) => onUpdateDecal(selectedDecal.id, { opacity: parseFloat(e.target.value) })}
                      className="w-full accent-vice-pink"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                  <button
                    onClick={() => onUpdateDecal(selectedDecal.id, { flipX: !selectedDecal.flipX })}
                    className="px-2 py-1 bg-black/50 rounded text-[10px] font-vice text-gray-300 hover:text-white flex items-center gap-1"
                  >
                    <FlipHorizontal size={14} /> Flip X
                  </button>
                  <button
                    onClick={() => onUpdateDecal(selectedDecal.id, { zIndex: selectedDecal.zIndex + 1 })}
                    className="px-2 py-1 bg-black/50 rounded text-[10px] font-vice text-gray-300 hover:text-white flex items-center gap-1"
                  >
                    <ArrowUp size={14} /> Raise Layer
                  </button>
                  <button
                    onClick={() => onUpdateDecal(selectedDecal.id, { zIndex: Math.max(1, selectedDecal.zIndex - 1) })}
                    className="px-2 py-1 bg-black/50 rounded text-[10px] font-vice text-gray-300 hover:text-white flex items-center gap-1"
                  >
                    <ArrowDown size={14} /> Lower
                  </button>
                </div>
              </div>
            )}

            {/* Stacked Layers List */}
            <div className="space-y-2">
              {[...liveryState.decals].sort((a, b) => b.zIndex - a.zIndex).map((d) => (
                <div
                  key={d.id}
                  onClick={() => onSelectDecal(d.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    selectedDecalId === d.id
                      ? 'bg-vice-pink/20 border-vice-pink text-white shadow-neon-pink'
                      : 'bg-[#141424] border-vice-border text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-xs font-vice">{d.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateDecal(d.id, { visible: !d.visible });
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      {d.visible ? <Eye size={14} /> : <EyeOff size={14} className="text-red-400" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveDecal(d.id);
                      }}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
