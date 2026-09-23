import React, { useState } from 'react';
import { LiveryState, PaintFinish, DecalCategory, DecalLayer, WindowTint } from '../../types';
import { DECAL_LIBRARY, DECAL_CATEGORIES } from '../../utils/decalLibrary';
import { audioEngine } from '../../utils/audioEngine';
import { Paintbrush, Layers, Type as TypeIcon, Sparkles, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, FlipHorizontal, CloudRain, Disc, Copy, ImageIcon, X as XIcon, Maximize, Minimize } from 'lucide-react';
import FilerobotImageEditor from '@unlayer/react-image-editor';

import { useDragScroll } from '../../utils/useDragScroll';

interface Toolbar2DProps {
  liveryState: LiveryState;
  onUpdateState: (updates: Partial<LiveryState>) => void;
  selectedDecalId: string | null;
  onSelectDecal: (id: string | null) => void;
  onAddDecal: (decal: Partial<DecalLayer>) => void;
  onUpdateDecal: (id: string, updates: Partial<DecalLayer>) => void;
  onRemoveDecal: (id: string) => void;
  canvasDataUrl?: string;
  onSaveUnlayerImage?: (dataUrl: string) => void;
}

const PRIMARY_PALETTE = [
  '#ff007f', '#00f0ff', '#39ff14', '#ffea00', '#9d00ff', '#ff5500',
  '#ffffff', '#0b0b12', '#ff0033', '#0a2342', '#888888', '#d4af37'
];

const SECONDARY_PALETTE = [
  '#ffffff', '#111111', '#00f0ff', '#ffea00', '#ff007f', '#39ff14',
  '#ff4500', '#6b21a8', '#e0e0e0', '#dc2626', '#0284c7', '#d97706'
];

export const Toolbar2D: React.FC<Toolbar2DProps> = ({
  liveryState,
  onUpdateState,
  selectedDecalId,
  onSelectDecal,
  onAddDecal,
  onUpdateDecal,
  onRemoveDecal,
  canvasDataUrl,
  onSaveUnlayerImage,
}) => {
  const [activeTab, setActiveTab] = useState<'paint' | 'decals' | 'text' | 'tuning' | 'layers' | 'image'>('image');
  const [isUnlayerFullscreen, setIsUnlayerFullscreen] = useState(false);
  const [decalCategory, setDecalCategory] = useState<DecalCategory>('stripe');
  
  const tabDrag = useDragScroll();
  const categoryDrag = useDragScroll();

  // Custom Text & Plate inputs
  // ...

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

  // 1-Click Mirror Decal to Opposite Side
  const handleMirrorDecal = () => {
    if (!selectedDecal) return;
    audioEngine.playSprayPaintSFX();
    onAddDecal({
      ...selectedDecal,
      id: undefined,
      name: `${selectedDecal.name} (Mirrored)`,
      x: 1024 - selectedDecal.x, // Mirror X axis
      flipX: !selectedDecal.flipX
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#10101c] border border-vice-border rounded-xl overflow-hidden shadow-2xl">
      {/* TABS NAVIGATION */}
      <div 
        ref={tabDrag.scrollRef}
        onMouseDown={tabDrag.onMouseDown}
        onMouseLeave={tabDrag.onMouseLeave}
        onMouseUp={tabDrag.onMouseUp}
        onMouseMove={tabDrag.onMouseMove}
        onWheel={tabDrag.onWheel}
        className="flex bg-[#0b0b14] border-b border-vice-border overflow-x-auto custom-scrollbar pb-1 cursor-grab select-none"
      >
        <button
          onClick={() => { setActiveTab('paint'); audioEngine.playClickSFX(); }}
          className={`px-3 py-3 flex items-center justify-center gap-1.5 text-[11px] font-vice transition-all whitespace-nowrap ${
            activeTab === 'paint'
              ? 'bg-vice-card text-vice-pink border-b-2 border-vice-pink shadow-neon-pink'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Paintbrush size={15} /> Paint
        </button>

        <button
          onClick={() => { setActiveTab('decals'); audioEngine.playClickSFX(); }}
          className={`px-3 py-3 flex items-center justify-center gap-1.5 text-[11px] font-vice transition-all whitespace-nowrap ${
            activeTab === 'decals'
              ? 'bg-vice-card text-vice-cyan border-b-2 border-vice-cyan shadow-neon-cyan'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles size={15} /> Decals
        </button>

        <button
          onClick={() => { setActiveTab('text'); audioEngine.playClickSFX(); }}
          className={`px-3 py-3 flex items-center justify-center gap-1.5 text-[11px] font-vice transition-all whitespace-nowrap ${
            activeTab === 'text'
              ? 'bg-vice-card text-vice-yellow border-b-2 border-vice-yellow shadow-neon-yellow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <TypeIcon size={15} /> Text/Plates
        </button>

        <button
          onClick={() => { setActiveTab('tuning'); audioEngine.playClickSFX(); }}
          className={`px-3 py-3 flex items-center justify-center gap-1.5 text-[11px] font-vice transition-all whitespace-nowrap ${
            activeTab === 'tuning'
              ? 'bg-vice-card text-vice-orange border-b-2 border-vice-orange shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Disc size={15} /> Tuning & Rain
        </button>

        <button
          onClick={() => { setActiveTab('layers'); audioEngine.playClickSFX(); }}
          className={`px-3 py-3 flex items-center justify-center gap-1.5 text-[11px] font-vice transition-all whitespace-nowrap ${
            activeTab === 'layers'
              ? 'bg-vice-card text-vice-purple border-b-2 border-vice-purple shadow-neon-purple'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Layers size={15} /> Layers ({liveryState.decals.length})
        </button>

        <button
          onClick={() => { setActiveTab('image'); audioEngine.playClickSFX(); }}
          className={`px-3 py-3 flex items-center justify-center gap-1.5 text-[11px] font-vice transition-all whitespace-nowrap ${
            activeTab === 'image'
              ? 'bg-vice-card text-[#39ff14] border-b-2 border-[#39ff14] shadow-neon-green'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ImageIcon size={15} /> Unlayer Editor
        </button>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-5 custom-scrollbar">
        {/* --- TAB 1: PAINT & FINISH --- */}
        {activeTab === 'paint' && (
          <div className="space-y-4">
            {/* Primary Body Coat */}
            <div className="bg-[#141424] p-3 rounded-xl border border-vice-border space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-vice text-gray-300 flex items-center gap-1.5 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-vice-pink shadow-neon-pink" /> PRIMARY BODY COAT
                </label>
                <div className="flex items-center gap-1.5 bg-black/50 px-2 py-0.5 rounded-lg border border-gray-700">
                  <input
                    type="color"
                    value={liveryState.primaryColor}
                    onChange={(e) => onUpdateState({ primaryColor: e.target.value })}
                    className="w-5 h-5 bg-transparent cursor-pointer rounded border-0"
                    title="Choose custom color"
                  />
                  <span className="text-[10px] font-mono text-gray-300">{liveryState.primaryColor}</span>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-1.5 pt-1">
                {PRIMARY_PALETTE.map(c => (
                  <button
                    key={c}
                    onClick={() => onUpdateState({ primaryColor: c })}
                    style={{ backgroundColor: c }}
                    className={`h-7 rounded-lg border transition-transform hover:scale-110 ${
                      liveryState.primaryColor === c ? 'border-white scale-105 ring-2 ring-vice-pink shadow-neon-pink' : 'border-black/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Dual-Tone Secondary Accent */}
            <div className="bg-[#141424] p-3 rounded-xl border border-vice-border space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-vice text-gray-300 flex items-center gap-1.5 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-vice-cyan shadow-neon-cyan" /> DUAL-TONE SECONDARY ACCENT
                </label>
                <div className="flex items-center gap-1.5 bg-black/50 px-2 py-0.5 rounded-lg border border-gray-700">
                  <input
                    type="color"
                    value={liveryState.secondaryColor}
                    onChange={(e) => onUpdateState({ secondaryColor: e.target.value })}
                    className="w-5 h-5 bg-transparent cursor-pointer rounded border-0"
                    title="Choose custom accent color"
                  />
                  <span className="text-[10px] font-mono text-gray-300">{liveryState.secondaryColor}</span>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-1.5 pt-1">
                {SECONDARY_PALETTE.map(c => (
                  <button
                    key={c}
                    onClick={() => onUpdateState({ secondaryColor: c })}
                    style={{ backgroundColor: c }}
                    className={`h-7 rounded-lg border transition-transform hover:scale-110 ${
                      liveryState.secondaryColor === c ? 'border-white scale-105 ring-2 ring-vice-cyan shadow-neon-cyan' : 'border-black/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Finish Material */}
            <div className="bg-[#141424] p-3 rounded-xl border border-vice-border space-y-2">
              <label className="text-xs font-vice text-gray-300 block font-bold">FINISH MATERIAL PATINA</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['gloss', 'matte', 'metallic', 'pearlescent', 'chameleon', 'carbon', 'rust'] as PaintFinish[]).map(finish => (
                  <button
                    key={finish}
                    onClick={() => onUpdateState({ finish })}
                    className={`py-1.5 px-2.5 rounded-lg text-[11px] font-vice capitalize border transition-all text-left flex items-center justify-between ${
                      liveryState.finish === finish
                        ? 'bg-vice-card border-vice-pink text-vice-pink shadow-neon-pink'
                        : 'bg-[#181828] border-vice-border text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>{finish}</span>
                    {liveryState.finish === finish && <Sparkles size={12} className="text-vice-pink animate-spin" />}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* --- TAB 2: DECALS STUDIO LIBRARY --- */}
        {activeTab === 'decals' && (
          <div className="space-y-4">
            <div 
              ref={categoryDrag.scrollRef}
              onMouseDown={categoryDrag.onMouseDown}
              onMouseLeave={categoryDrag.onMouseLeave}
              onMouseUp={categoryDrag.onMouseUp}
              onMouseMove={categoryDrag.onMouseMove}
              onWheel={categoryDrag.onWheel}
              className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar cursor-grab select-none"
            >
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

        {/* --- TAB 4: TUNING & WEATHER STUDIO --- */}
        {activeTab === 'tuning' && (
          <div className="space-y-6">
            {/* ── SCENE ENVIRONMENT MODE ── */}
            <div className="bg-[#141424] p-4 rounded-xl border border-vice-border space-y-3">
              <label className="text-xs font-vice text-white flex items-center gap-2 font-bold">
                <span className="w-2 h-2 rounded-full bg-vice-pink shadow-neon-pink" />
                SCENE ENVIRONMENT
              </label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: 'studio',    icon: '🏢', label: 'STUDIO',    color: 'border-gray-500 text-gray-300' },
                  { id: 'rain',      icon: '🌧️', label: 'RAIN',      color: 'border-vice-cyan text-vice-cyan' },
                  { id: 'synthwave', icon: '🌅', label: 'SYNTHWAVE', color: 'border-vice-pink text-vice-pink' },
                  { id: 'cyberpunk', icon: '⚡', label: 'CYBERPUNK', color: 'border-[#39ff14] text-[#39ff14]' },
                ] as const).map(env => {
                  const current = liveryState.sceneEnvironment || (liveryState.isRainyWeather ? 'rain' : 'studio');
                  const isActive = current === env.id;
                  return (
                    <button
                      key={env.id}
                      onClick={() => {
                        onUpdateState({
                          sceneEnvironment: env.id,
                          isRainyWeather: env.id === 'rain',
                        });
                        audioEngine.playClickSFX();
                      }}
                      className={`py-2.5 px-3 rounded-xl text-[11px] font-vice font-bold border transition-all flex items-center gap-2 ${
                        isActive
                          ? `${env.color} bg-white/5 shadow-lg`
                          : 'border-gray-700 text-gray-500 hover:text-white bg-[#1a1a2e]'
                      }`}
                    >
                      <span className="text-base leading-none">{env.icon}</span>
                      {env.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rim Color Selector */}
            <div className="bg-[#141424] p-3 rounded-xl border border-vice-border space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-vice text-gray-300 flex items-center gap-1.5 font-bold">
                  <Disc size={15} className="text-vice-yellow" /> METALLIC RIM COLOR TUNING
                </label>
                <div className="flex items-center gap-1.5 bg-black/50 px-2 py-0.5 rounded-lg border border-gray-700">
                  <input
                    type="color"
                    value={liveryState.rimColor || '#e5e5e5'}
                    onChange={(e) => onUpdateState({ rimColor: e.target.value })}
                    className="w-5 h-5 bg-transparent cursor-pointer rounded border-0"
                    title="Choose custom rim color"
                  />
                  <span className="text-[10px] font-mono text-gray-300">{liveryState.rimColor || '#e5e5e5'}</span>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-1.5 pt-1">
                {['#e5e5e5', '#ffea00', '#00f0ff', '#ff007f', '#39ff14', '#111111'].map(c => (
                  <button
                    key={c}
                    onClick={() => onUpdateState({ rimColor: c })}
                    style={{ backgroundColor: c }}
                    className={`h-7 rounded-lg border transition-transform hover:scale-110 ${
                      liveryState.rimColor === c ? 'border-white scale-105 ring-2 ring-vice-yellow shadow-neon-yellow' : 'border-black/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Window Tint Selector */}
            <div className="bg-[#141424] p-3 rounded-xl border border-vice-border space-y-2">
              <label className="text-xs font-vice text-gray-300 block font-bold">WINDOW TINT FILM</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['clear', 'dark_limo', 'pink_neon', 'cyan_neon'] as WindowTint[]).map(tint => (
                  <button
                    key={tint}
                    onClick={() => onUpdateState({ windowTint: tint })}
                    className={`py-1.5 px-2.5 rounded-lg text-[11px] font-vice uppercase border transition-all text-left flex items-center justify-between ${
                      liveryState.windowTint === tint
                        ? 'bg-vice-card border-vice-cyan text-vice-cyan shadow-neon-cyan'
                        : 'bg-[#181828] border-vice-border text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>{tint.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: LAYERS MANAGER --- */}
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
                    <label className="text-[10px] text-gray-400 block mb-1">COLOR TINT</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedDecal.color}
                        onChange={(e) => onUpdateDecal(selectedDecal.id, { color: e.target.value })}
                        className="w-7 h-7 bg-transparent cursor-pointer rounded border border-gray-700"
                      />
                      <span className="text-[10px] font-mono text-gray-300">{selectedDecal.color}</span>
                    </div>
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
                      className="w-full accent-vice-pink mt-1.5"
                    />
                  </div>
                </div>

                {/* Quick Decal Color Palette */}
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">QUICK TINT PRESETS</label>
                  <div className="grid grid-cols-8 gap-1">
                    {PRIMARY_PALETTE.slice(0, 8).map(c => (
                      <button
                        key={c}
                        onClick={() => onUpdateDecal(selectedDecal.id, { color: c })}
                        style={{ backgroundColor: c }}
                        className={`h-5 rounded border transition-transform hover:scale-110 ${
                          selectedDecal.color === c ? 'border-white ring-1 ring-vice-pink' : 'border-black/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-700">
                  <button
                    onClick={handleMirrorDecal}
                    className="px-2.5 py-1 bg-vice-cyan/20 border border-vice-cyan rounded text-[10px] font-vice text-vice-cyan hover:bg-vice-cyan hover:text-black flex items-center gap-1 font-bold shadow-neon-cyan/40"
                    title="Mirror selected decal to opposite side of car body"
                  >
                    <Copy size={13} /> Mirror to Right Door 🪞
                  </button>

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
                    <ArrowUp size={14} /> Raise
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

        {/* --- TAB 6: ADVANCED IMAGE EDITOR (UNLAYER) --- */}
        {activeTab === 'image' && (
          <div className={
            isUnlayerFullscreen
              ? "fixed inset-0 z-[100] bg-[#070710]/95 backdrop-blur-md flex flex-col p-2 sm:p-4 animate-fadeIn"
              : "h-full flex flex-col space-y-3 relative"
          }>
            <div className={`bg-[#141424] p-3 rounded-xl border border-vice-border flex items-start gap-3 ${isUnlayerFullscreen ? 'mb-4' : ''}`}>
              <div className="p-2 bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14] rounded-lg">
                <ImageIcon size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-vice text-white">ADVANCED UNLAYER EDITOR</h3>
                <p className="text-[10px] text-gray-400 mt-1">
                  Use the integrated Filerobot editor to draw shapes, apply filters, and freehand paint over your current base layers. Saves as a static overlay underneath your decals.
                </p>
              </div>
              <button
                onClick={() => setIsUnlayerFullscreen(!isUnlayerFullscreen)}
                className="p-2 bg-[#1a1a2e] hover:bg-white/10 text-[#39ff14] hover:text-white rounded-lg transition-colors border border-vice-border flex items-center justify-center shrink-0 shadow-neon-green"
                title={isUnlayerFullscreen ? "Exit Fullscreen" : "Expand to Fullscreen"}
              >
                {isUnlayerFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
            
            {/* Clear Advanced Overlay */}
            {liveryState.unlayerOverlayUrl && !isUnlayerFullscreen && (
              <div className="bg-[#141424] p-3 rounded-xl border border-vice-border">
                <button
                  onClick={() => onUpdateState({ unlayerOverlayUrl: undefined })}
                  className="w-full py-2 bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-white border border-red-500/50 rounded-lg text-xs font-vice transition-all flex items-center justify-center gap-2"
                >
                  <XIcon size={14} /> Clear Advanced Overlay
                </button>
              </div>
            )}

            <div className={`flex-1 w-full relative bg-black border border-vice-border rounded-xl overflow-hidden ${isUnlayerFullscreen ? '' : 'min-h-[400px]'}`}>
              <FilerobotImageEditor
                image={canvasDataUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="%2310101c"/><text x="512" y="512" font-size="24" fill="white" font-family="monospace" text-anchor="middle">Loading Canvas Data...</text></svg>'}
                onSave={(res: any) => {
                  if (res?.dataUrl && onSaveUnlayerImage) {
                    onSaveUnlayerImage(res.dataUrl);
                    setIsUnlayerFullscreen(false);
                    setActiveTab('paint');
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
