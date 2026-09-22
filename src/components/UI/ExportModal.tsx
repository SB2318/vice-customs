import React, { useState, useRef } from 'react';
import { LiveryState } from '../../types';
import { audioEngine } from '../../utils/audioEngine';
import { downloadLiveryJson, readLiveryJsonFile } from '../../utils/shareUtils';
import { Download, Camera, Save, X, Check, Image as ImageIcon, Upload, Trash2, FolderOpen, FileCode } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasElement: HTMLCanvasElement | null;
  liveryState: LiveryState;
  onLoadLivery?: (state: Partial<LiveryState>) => void;
}

interface SavedGarageSlot {
  id: string;
  name: string;
  timestamp: string;
  state: LiveryState;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvasElement,
  liveryState,
  onLoadLivery
}) => {
  const [activeTab, setActiveTab] = useState<'images' | 'json_garage'>('images');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [customSlotName, setCustomSlotName] = useState('');
  const [garageSlots, setGarageSlots] = useState<SavedGarageSlot[]>(() => {
    try {
      const str = localStorage.getItem('vice_customs_garage') || '[]';
      return JSON.parse(str);
    } catch {
      return [];
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Download 2D Texture PNG
  const handleDownload2D = () => {
    const target2DCanvas = canvasElement || document.querySelector('canvas:not(#three-webgl-canvas)');
    if (!target2DCanvas) return;
    audioEngine.playClickSFX();
    const link = document.createElement('a');
    link.download = `ViceCustoms_${liveryState.vehicle}_2D_UV_Texture.png`;
    link.href = (target2DCanvas as HTMLCanvasElement).toDataURL('image/png');
    link.click();
  };

  // 2. Download 3D Studio Screenshot
  const handleDownload3D = () => {
    audioEngine.playClickSFX();
    const threeCanvas = document.querySelector('#three-webgl-canvas canvas') as HTMLCanvasElement;
    if (!threeCanvas) return;
    const link = document.createElement('a');
    link.download = `ViceCustoms_${liveryState.vehicle}_3D_Studio_Render.png`;
    link.href = threeCanvas.toDataURL('image/png');
    link.click();
  };

  // 3. Download JSON Livery File
  const handleDownloadJson = () => {
    audioEngine.playClickSFX();
    downloadLiveryJson(liveryState);
  };

  // 4. Import JSON Livery File
  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      audioEngine.playSprayPaintSFX();
      const loadedState = await readLiveryJsonFile(file);
      if (onLoadLivery) {
        onLoadLivery(loadedState);
      }
      onClose();
    } catch (err) {
      alert('Failed to parse Livery JSON file. Please check file format.');
    }
  };

  // 5. Save Livery to Local Garage Storage
  const handleSaveToGarage = () => {
    audioEngine.playClickSFX();
    const slotTitle = customSlotName.trim() || `${liveryState.vehicle.toUpperCase()} - ${liveryState.finish.toUpperCase()}`;
    const newEntry: SavedGarageSlot = {
      id: 'saved_' + Date.now(),
      name: slotTitle,
      timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      state: liveryState
    };
    const updated = [newEntry, ...garageSlots.filter(s => s.name !== slotTitle)];
    setGarageSlots(updated);
    localStorage.setItem('vice_customs_garage', JSON.stringify(updated));
    setSavedSuccess(true);
    setCustomSlotName('');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteSlot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickSFX();
    const updated = garageSlots.filter(s => s.id !== id);
    setGarageSlots(updated);
    localStorage.setItem('vice_customs_garage', JSON.stringify(updated));
  };

  const handleLoadSlot = (slotState: LiveryState) => {
    audioEngine.playSprayPaintSFX();
    if (onLoadLivery) {
      onLoadLivery(slotState);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#0f0f1b] border-2 border-vice-pink rounded-2xl shadow-neon-pink p-4 sm:p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-vice-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-vice-pink/20 border border-vice-pink flex items-center justify-center text-vice-pink shadow-neon-pink">
              <Download size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-vice text-white tracking-wider">
                EXPORT &amp; LIVERY STORAGE
              </h2>
              <p className="text-xs text-gray-400">
                Download 2D/3D visual renders &amp; JSON livery presets
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex bg-[#121224] p-1 rounded-xl border border-vice-border my-4">
          <button
            onClick={() => setActiveTab('images')}
            className={`flex-1 py-2 rounded-lg text-xs font-vice transition-all flex items-center justify-center gap-2 ${
              activeTab === 'images' ? 'bg-vice-pink text-white font-bold shadow-neon-pink' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon size={15} /> 📷 2D &amp; 3D Visual PNGs
          </button>
          <button
            onClick={() => setActiveTab('json_garage')}
            className={`flex-1 py-2 rounded-lg text-xs font-vice transition-all flex items-center justify-center gap-2 ${
              activeTab === 'json_garage' ? 'bg-vice-cyan text-black font-bold shadow-neon-cyan' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileCode size={15} /> 💾 JSON &amp; Garage Storage ({garageSlots.length})
          </button>
        </div>

        {/* ── TAB 1: EXPORT IMAGES & 3D ── */}
        {activeTab === 'images' && (
          <div className="space-y-3.5 my-2">
            <button
              onClick={handleDownload2D}
              className="w-full p-4 bg-[#141426] hover:bg-vice-card border border-vice-border hover:border-vice-pink rounded-xl flex items-center justify-between transition-all group shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-vice-pink/20 border border-vice-pink flex items-center justify-center text-vice-pink">
                  <ImageIcon size={22} />
                </div>
                <div className="text-left">
                  <h3 className="text-xs sm:text-sm font-vice font-bold text-white group-hover:text-vice-pink">
                    DOWNLOAD 2D UV TEXTURE (PNG)
                  </h3>
                  <p className="text-[11px] text-gray-400">1024x1024 unwrapped vehicle wrap texture map</p>
                </div>
              </div>
              <Download size={18} className="text-gray-400 group-hover:text-white" />
            </button>

            <button
              onClick={handleDownload3D}
              className="w-full p-4 bg-[#141426] hover:bg-vice-card border border-vice-border hover:border-vice-cyan rounded-xl flex items-center justify-between transition-all group shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-vice-cyan/20 border border-vice-cyan flex items-center justify-center text-vice-cyan">
                  <Camera size={22} />
                </div>
                <div className="text-left">
                  <h3 className="text-xs sm:text-sm font-vice font-bold text-white group-hover:text-vice-cyan">
                    DOWNLOAD 3D STUDIO SCREENSHOT (PNG)
                  </h3>
                  <p className="text-[11px] text-gray-400">Full-res WebGL neon garage studio viewport snapshot</p>
                </div>
              </div>
              <Camera size={18} className="text-gray-400 group-hover:text-white" />
            </button>
          </div>
        )}

        {/* ── TAB 2: JSON BACKUP & LOCAL GARAGE SLOTS ── */}
        {activeTab === 'json_garage' && (
          <div className="space-y-4 my-2">
            {/* JSON Export & Import Cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadJson}
                className="p-3.5 bg-[#141426] hover:bg-vice-card border border-vice-border hover:border-vice-yellow rounded-xl flex flex-col items-center justify-center text-center gap-2 transition-all group shadow-md"
              >
                <Download size={22} className="text-vice-yellow group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-vice text-white font-bold block">EXPORT JSON</span>
                  <span className="text-[10px] text-gray-400">Download .json config file</span>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 bg-[#141426] hover:bg-vice-card border border-vice-border hover:border-vice-purple rounded-xl flex flex-col items-center justify-center text-center gap-2 transition-all group shadow-md"
              >
                <Upload size={22} className="text-vice-purple group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-vice text-white font-bold block">IMPORT JSON</span>
                  <span className="text-[10px] text-gray-400">Upload &amp; apply .json file</span>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </div>

            {/* Quick Save to Local Storage Garage */}
            <div className="bg-[#141426] p-3.5 rounded-xl border border-vice-border space-y-2">
              <label className="text-[11px] font-vice text-gray-400 block flex items-center gap-1.5">
                <FolderOpen size={13} className="text-vice-yellow" /> SAVE TO BROWSER GARAGE SLOTS
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSlotName}
                  onChange={(e) => setCustomSlotName(e.target.value)}
                  placeholder={`${liveryState.vehicle.toUpperCase()} - Custom Build`}
                  className="flex-1 bg-black/60 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:border-vice-yellow focus:outline-none"
                />
                <button
                  onClick={handleSaveToGarage}
                  className="px-4 py-2 bg-vice-yellow text-black font-vice text-xs font-bold rounded-lg hover:bg-yellow-300 transition-colors flex items-center gap-1.5 shadow-neon-yellow shrink-0"
                >
                  {savedSuccess ? <Check size={14} /> : <Save size={14} />}
                  {savedSuccess ? 'SAVED!' : 'SAVE'}
                </button>
              </div>
            </div>

            {/* Saved Slots List */}
            <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
              {garageSlots.length === 0 ? (
                <div className="p-5 text-center text-xs font-vice text-gray-500 border border-dashed border-gray-800 rounded-xl">
                  No saved liveries in local garage yet. Click Save above to store a slot!
                </div>
              ) : (
                garageSlots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => handleLoadSlot(slot.state)}
                    className="p-3 bg-[#16162a] hover:bg-vice-card border border-vice-border hover:border-vice-yellow rounded-xl flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full border border-white/40 shadow"
                        style={{ backgroundColor: slot.state.primaryColor }}
                      />
                      <div>
                        <h4 className="text-xs font-vice text-white group-hover:text-vice-yellow transition-colors font-bold">
                          {slot.name}
                        </h4>
                        <span className="text-[10px] text-gray-500">{slot.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-vice text-vice-yellow opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                        LOAD 🚗
                      </span>
                      <button
                        onClick={(e) => handleDeleteSlot(slot.id, e)}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        title="Delete slot"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer Close Button */}
        <div className="pt-3 border-t border-vice-border flex items-center justify-between mt-auto">
          <span className="text-[10px] font-mono text-gray-500">
            AUTOSAVE TO LOCALSTORAGE READY
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#18182a] text-gray-300 hover:text-white font-vice text-xs rounded-lg hover:bg-white/10"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
