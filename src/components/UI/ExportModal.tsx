import React, { useState } from 'react';
import { LiveryState } from '../../types';
import { audioEngine } from '../../utils/audioEngine';
import { Download, Camera, Save, X, Check, Image as ImageIcon } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasElement: HTMLCanvasElement | null;
  liveryState: LiveryState;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvasElement,
  liveryState
}) => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  // Download 2D Texture PNG
  const handleDownload2D = () => {
    const target2DCanvas = canvasElement || document.querySelector('canvas:not(#three-webgl-canvas)');
    if (!target2DCanvas) return;
    audioEngine.playClickSFX();
    const link = document.createElement('a');
    link.download = `ViceCustoms_${liveryState.vehicle}_2D_UV_Texture.png`;
    link.href = (target2DCanvas as HTMLCanvasElement).toDataURL('image/png');
    link.click();
  };

  // Download 3D Studio Screenshot
  const handleDownload3D = () => {
    audioEngine.playClickSFX();
    const threeCanvas = (document.getElementById('three-webgl-canvas') || document.querySelector('#three-webgl-canvas canvas')) as HTMLCanvasElement;
    if (!threeCanvas) return;
    const link = document.createElement('a');
    link.download = `ViceCustoms_${liveryState.vehicle}_3D_Studio_Render.png`;
    link.href = threeCanvas.toDataURL('image/png');
    link.click();
  };

  // Save Livery to Local Garage Storage
  const handleSaveToGarage = () => {
    audioEngine.playClickSFX();
    const existingStr = localStorage.getItem('vice_customs_garage') || '[]';
    const existing = JSON.parse(existingStr);
    const newEntry = {
      id: 'saved_' + Date.now(),
      name: `${liveryState.vehicle.toUpperCase()} - ${liveryState.finish.toUpperCase()} LIVERY`,
      timestamp: new Date().toLocaleDateString(),
      state: liveryState
    };
    existing.unshift(newEntry);
    localStorage.setItem('vice_customs_garage', JSON.stringify(existing));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0f0f1b] border-2 border-vice-cyan rounded-2xl shadow-neon-cyan p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-vice-border">
          <div className="flex items-center gap-3">
            <Download className="text-vice-cyan" size={24} />
            <div>
              <h2 className="text-lg font-vice text-white tracking-wider">EXPORT & SAVE STUDIO</h2>
              <p className="text-xs text-gray-400">Download high-res textures & studio renders</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Export Options Grid */}
        <div className="space-y-4 my-6">
          <button
            onClick={handleDownload2D}
            className="w-full p-4 bg-[#141426] hover:bg-vice-card border border-vice-border hover:border-vice-pink rounded-xl flex items-center justify-between transition-all group shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-vice-pink/20 border border-vice-pink flex items-center justify-center text-vice-pink">
                <ImageIcon size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-vice font-bold text-white group-hover:text-vice-pink">
                  DOWNLOAD 2D UV TEXTURE (PNG)
                </h3>
                <p className="text-[11px] text-gray-400">High-res 1024x1024 unwrapped vehicle livery wrap texture</p>
              </div>
            </div>
            <Download size={18} className="text-gray-400 group-hover:text-white" />
          </button>

          <button
            onClick={handleDownload3D}
            className="w-full p-4 bg-[#141426] hover:bg-vice-card border border-vice-border hover:border-vice-cyan rounded-xl flex items-center justify-between transition-all group shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-vice-cyan/20 border border-vice-cyan flex items-center justify-center text-vice-cyan">
                <Camera size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-vice font-bold text-white group-hover:text-vice-cyan">
                  DOWNLOAD 3D STUDIO SCREENSHOT (PNG)
                </h3>
                <p className="text-[11px] text-gray-400">Capture current neon garage 3D studio viewpoint render</p>
              </div>
            </div>
            <Camera size={18} className="text-gray-400 group-hover:text-white" />
          </button>

          <button
            onClick={handleSaveToGarage}
            className="w-full p-4 bg-[#141426] hover:bg-vice-card border border-vice-border hover:border-vice-yellow rounded-xl flex items-center justify-between transition-all group shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-vice-yellow/20 border border-vice-yellow flex items-center justify-center text-vice-yellow">
                <Save size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-vice font-bold text-white group-hover:text-vice-yellow">
                  SAVE TO LOCAL GARAGE
                </h3>
                <p className="text-[11px] text-gray-400">Save livery setup to browser LocalStorage for future use</p>
              </div>
            </div>
            {savedSuccess ? <Check size={18} className="text-green-400" /> : <Save size={18} className="text-gray-400 group-hover:text-white" />}
          </button>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-vice-cyan text-black font-vice text-xs rounded-xl font-bold hover:bg-cyan-300"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
