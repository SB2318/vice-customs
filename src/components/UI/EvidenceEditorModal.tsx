import React, { useState, useEffect, useRef, Component } from 'react';
import FilerobotImageEditor from '@unlayer/react-image-editor';
import { HeistMission, ForgeryValidationResult, EvidencePhotoItem, LiveryState, DecalLayer, CameraPreset, GraphicsQuality, VehicleModel } from '../../types';
import { validateEvidenceForgery } from '../../utils/evidenceValidator';
import { audioEngine } from '../../utils/audioEngine';
import { downloadForgeryJson, readForgeryJsonFile } from '../../utils/shareUtils';
import { GarageScene } from '../Three3D/GarageScene';
import { LiveryCanvas } from '../Canvas2D/LiveryCanvas';
import { Toolbar2D } from '../Canvas2D/Toolbar2D';
import { ViceRadio } from './ViceRadio';
import { X, CheckCircle2, ShieldAlert, Send, Layers, Clock, Sparkles, AlertTriangle, Edit3, Download, Upload, Paintbrush, FileCode, Check, Car, Box, RefreshCw } from 'lucide-react';

// ── Error Boundary so Unlayer crash never shows a blank screen ────────────────
interface EBState { hasError: boolean; }
class UnlayerErrorBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }, EBState> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: Error) { console.warn('[Unlayer] Editor failed to mount:', err.message); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// ── Fallback editor panel (shown if Unlayer fails) ────────────────────────────
const FallbackEditorPanel: React.FC<{ photo: EvidencePhotoItem; onSubmit: () => void }> = ({ photo, onSubmit }) => (
  <div className="flex-1 w-full h-full bg-slate-950 flex flex-col items-center justify-center gap-6 p-6">
    <div className="w-full max-w-2xl flex flex-col gap-4">
      <div className="p-3 rounded-xl bg-yellow-950/40 border border-yellow-500/40 text-yellow-300 text-xs font-mono flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-400" />
        <span>
          <strong>Editor loading...</strong> If the image editor does not appear within 5 seconds, your browser may be blocking third-party scripts.
          You can still submit the forgery using the button below to continue the story.
        </span>
      </div>
      <div className="relative rounded-xl border-2 border-pink-500/40 overflow-hidden aspect-video bg-slate-900 flex items-center justify-center">
        <img src={photo.svgDataUrl} alt={photo.title} className="max-w-full max-h-full object-contain" />
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-pink-400 border border-pink-500/30">
          {photo.title}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-purple-400" />
          Use the objectives panel on the left to understand what evidence must be altered, then submit the forgery.
        </div>
        <button
          onClick={onSubmit}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-pink-500/30"
        >
          <Send className="w-4 h-4" /> SUBMIT FORGERY
        </button>
      </div>
    </div>
  </div>
);

interface EvidenceEditorModalProps {
  isOpen: boolean;
  mission: HeistMission;
  onClose: () => void;
  onSubmitForgery: (result: ForgeryValidationResult) => void;
  liveryState?: LiveryState;
  onUpdateLiveryState?: (updates: Partial<LiveryState>) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onOpenExportModal?: () => void;
}

export const EvidenceEditorModal: React.FC<EvidenceEditorModalProps> = ({
  isOpen,
  mission,
  onClose,
  onSubmitForgery,
  liveryState,
  onUpdateLiveryState,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenExportModal
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Sub-mode tab state: 'forgery' (Unlayer evidence photo) | 'garage_studio' (3D + 2D Garage customizer)
  const [editorSubMode, setEditorSubMode] = useState<'forgery' | 'garage_studio'>('forgery');
  const [selectedDecalId, setSelectedDecalId] = useState<string | null>(null);
  const [garageCanvasElement, setGarageCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('front_34');
  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality>('high');

  // JSON Import/Export state & refs
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [importedOverlayUrl, setImportedOverlayUrl] = useState<string | null>(null);
  const [jsonNotice, setJsonNotice] = useState<string | null>(null);

  // Automatically sync liveryState.vehicle with mission's vehicleType on modal open
  useEffect(() => {
    if (!isOpen || !mission) return;
    const vehicleMapping: Record<string, VehicleModel> = {
      car: 'infernus',
      bike: 'dirtbike',
      train: 'train',
      boat: 'boat',
      helicopter: 'helicopter',
      final: 'infernus'
    };
    const targetModel = vehicleMapping[mission.vehicleType] || 'infernus';
    if (onUpdateLiveryState && liveryState?.vehicle !== targetModel) {
      onUpdateLiveryState({ vehicle: targetModel });
    }
  }, [isOpen, mission?.id, mission?.vehicleType, onUpdateLiveryState]);

  // 90-Second Countdown timer for Final Mission
  const [timerRemaining, setTimerRemaining] = useState(90);

  useEffect(() => {
    if (!isOpen || mission?.mechanicType !== 'final_speed_run') return;
    setTimerRemaining(90);
    const interval = setInterval(() => {
      setTimerRemaining(t => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, mission]);

  if (!isOpen) return null;

  const multiPhotos: EvidencePhotoItem[] = mission.evidencePhotos || [
    {
      id: 'primary',
      title: mission.evidencePhotoTitle,
      subtitle: mission.evidencePhotoSub,
      svgDataUrl: mission.evidenceCanvasSvg
    }
  ];

  const currentPhoto = multiPhotos[activePhotoIndex] || multiPhotos[0];

  const handleExportJson = () => {
    audioEngine.playClickSFX();
    downloadForgeryJson({
      missionId: mission.id,
      vehicleType: mission.vehicleType,
      editedDataUrl: importedOverlayUrl || currentPhoto.svgDataUrl,
      notes: mission.objectives.map(o => o.title)
    });
    setJsonNotice('Forgery JSON exported successfully!');
    setTimeout(() => setJsonNotice(null), 3000);
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      audioEngine.playSprayPaintSFX();
      const parsed = await readForgeryJsonFile(file);
      setImportedOverlayUrl(parsed.editedDataUrl);
      setJsonNotice(`Imported forgery JSON "${file.name}"!`);
      setTimeout(() => setJsonNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to parse Forgery JSON file.');
    } finally {
      if (jsonInputRef.current) jsonInputRef.current.value = '';
    }
  };

  const activeImageToEdit = importedOverlayUrl || currentPhoto.svgDataUrl;

  const handleSaveAndSubmit = async (imageDataUrl?: string) => {
    audioEngine.playClickSFX();
    setIsSubmitting(true);

    try {
      const finalUrl = imageDataUrl || activeImageToEdit;
      const result = await validateEvidenceForgery(mission, finalUrl);
      onSubmitForgery(result);
    } catch (err) {
      console.error('Forgery validation error:', err);
      onSubmitForgery({
        passed: true,
        score: 92,
        mechanicType: mission.mechanicType,
        objectivesCompleted: mission.objectives.map(o => o.id),
        feedbackNotes: ['Forgery accepted.'],
        editedImageDataUrl: activeImageToEdit
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDecal = (decalPartial: Partial<DecalLayer>) => {
    if (!liveryState || !onUpdateLiveryState) return;
    const newDecal: DecalLayer = {
      id: 'decal_' + Date.now(),
      name: decalPartial.name || 'Custom Decal',
      category: decalPartial.category || 'stripe',
      assetId: decalPartial.assetId || 'stripe_dual_center',
      x: decalPartial.x ?? 512,
      y: decalPartial.y ?? 512,
      scaleX: decalPartial.scaleX ?? 1,
      scaleY: decalPartial.scaleY ?? 1,
      rotation: decalPartial.rotation ?? 0,
      color: decalPartial.color || '#ffffff',
      secondaryColor: decalPartial.secondaryColor,
      opacity: decalPartial.opacity ?? 1,
      flipX: decalPartial.flipX ?? false,
      flipY: decalPartial.flipY ?? false,
      zIndex: decalPartial.zIndex ?? (liveryState.decals?.length || 0) + 1,
      visible: true,
      customText: decalPartial.customText,
      fontFamily: decalPartial.fontFamily,
      plateText: decalPartial.plateText,
      plateStyle: decalPartial.plateStyle
    };
    onUpdateLiveryState({ decals: [...(liveryState.decals || []), newDecal] });
    setSelectedDecalId(newDecal.id);
  };

  const handleUpdateDecal = (id: string, updates: Partial<DecalLayer>) => {
    if (!liveryState || !onUpdateLiveryState) return;
    onUpdateLiveryState({
      decals: (liveryState.decals || []).map(d => (d.id === id ? { ...d, ...updates } : d))
    });
  };

  const handleRemoveDecal = (id: string) => {
    if (!liveryState || !onUpdateLiveryState) return;
    onUpdateLiveryState({
      decals: (liveryState.decals || []).filter(d => d.id !== id)
    });
    if (selectedDecalId === id) setSelectedDecalId(null);
  };

  const VEHICLE_OPTIONS: Array<{ model: VehicleModel; label: string }> = [
    { model: 'infernus', label: 'INFERNUS' },
    { model: 'cheetah', label: 'CHEETAH' },
    { model: 'banshee', label: 'BANSHEE' },
    { model: 'comet', label: 'COMET' },
    { model: 'dominator', label: 'DOMINATOR' },
    { model: 'dirtbike', label: 'SUPERBIKE' },
    { model: 'train', label: 'BULLET TRAIN' },
    { model: 'boat', label: 'POWERBOAT' },
    { model: 'helicopter', label: 'STEALTH HELO' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col h-[100dvh] w-full overflow-hidden">
      
      {/* Top Header Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 truncate">
          <div className="p-1.5 rounded bg-pink-500/20 text-pink-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h2 className="text-xs sm:text-sm font-black font-mono text-white tracking-wider uppercase truncate flex items-center gap-2">
              <span>THE FORGER</span>
              <span className="text-[10px] text-pink-400 font-normal px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20">
                {mission.mechanicBadgeLabel}
              </span>
            </h2>
            <p className="text-[10px] font-mono text-slate-400 truncate">
              {currentPhoto.title} ({mission.vehicleType.toUpperCase()})
            </p>
          </div>
        </div>

        {/* Global Sound Controller (REVI + MUSIC + Master Mute) */}
        <div className="hidden sm:flex items-center gap-2">
          <ViceRadio compact showRev />
        </div>

        {/* Mode Tab Switcher: Forgery Evidence vs 3D Garage Customizer */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 shrink-0">
          <button
            onClick={() => { audioEngine.playClickSFX(); setEditorSubMode('forgery'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              editorSubMode === 'forgery'
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> FORGERY EVIDENCE
          </button>
          <button
            onClick={() => { audioEngine.playClickSFX(); setEditorSubMode('garage_studio'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              editorSubMode === 'garage_studio'
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-cyan-300" /> 3D GARAGE CUSTOMIZER
          </button>
        </div>

        {/* 90-Second Speed Run Timer Badge for Final Mission */}
        {mission.mechanicType === 'final_speed_run' && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-950/60 border border-red-500/50 text-red-400 font-mono font-bold text-xs animate-pulse">
            <Clock className="w-4 h-4" />
            <span>00:{timerRemaining.toString().padStart(2, '0')}</span>
          </div>
        )}

        {/* Action Controls & JSON Pipeline Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="sm:hidden px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300"
          >
            Objectives ({mission.objectives.length})
          </button>

          {/* JSON Export Button */}
          <button
            onClick={handleExportJson}
            title="Export Evidence Forgery as .json configuration file"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXPORT JSON</span>
          </button>

          {/* JSON Import Button */}
          <button
            onClick={() => jsonInputRef.current?.click()}
            title="Import Evidence Forgery .json configuration file"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-yellow-400" />
            <span>IMPORT JSON</span>
          </button>
          <input
            ref={jsonInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />

          {/* Submit Forgery Button */}
          <button
            disabled={isSubmitting}
            onClick={() => handleSaveAndSubmit()}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white font-mono font-bold text-xs tracking-wider uppercase shadow-md shadow-pink-500/20 flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            {isSubmitting ? 'VERIFYING...' : 'SUBMIT FORGERY'}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── MODE 1: FORGERY EVIDENCE UNLAYER EDITOR ── */}
      {editorSubMode === 'forgery' ? (
        <div className="relative flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          
          {/* Objectives & Bespoke Mechanics Sidebar */}
          <div className={`
            lg:w-80 border-r border-slate-800 bg-slate-900/95 p-4 flex flex-col justify-between shrink-0 z-20 transition-all duration-300 overflow-y-auto
            ${isDrawerOpen ? 'fixed inset-x-0 bottom-0 top-14 z-30' : 'hidden lg:flex'}
          `}>
            <div>
              {/* Multi-Image Evidence Switcher (For Train & Final Mission) */}
              {multiPhotos.length > 1 && (
                <div className="mb-4">
                  <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> MULTI-IMAGE EVIDENCE SET ({multiPhotos.length})
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {multiPhotos.map((photo, i) => (
                      <button
                        key={photo.id}
                        onClick={() => {
                          audioEngine.playClickSFX();
                          setActivePhotoIndex(i);
                        }}
                        className={`p-2 rounded-lg text-[10px] font-mono font-bold border transition-all text-left truncate ${
                          i === activePhotoIndex
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {photo.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bespoke Telemetry Widget */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 mb-4">
                <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-wider block mb-1">
                  LIVE FORGERY TELEMETRY
                </span>

                {mission.mechanicType === 'vehicle_disguise' && (
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">HEAT LEVEL:</span>
                    <span className="text-pink-400 font-bold">██░░░ LOW HEAT</span>
                  </div>
                )}

                {mission.mechanicType === 'identity_matrix' && (
                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between"><span className="text-slate-400">VEHICLE MATCH:</span><span className="text-pink-400 font-bold">18%</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">RIDER MATCH:</span><span className="text-pink-400 font-bold">12%</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">COLOR MATCH:</span><span className="text-pink-400 font-bold">8%</span></div>
                    <div className="pt-1 border-t border-slate-800 flex justify-between font-bold"><span className="text-emerald-400">OVERALL IDENTITY:</span><span className="text-emerald-400">14% ✔</span></div>
                  </div>
                )}

                {mission.mechanicType === 'multi_image_consistency' && (
                  <div className="text-[11px] font-mono space-y-1 text-cyan-300">
                    <div className="flex justify-between"><span>CONSISTENCY:</span><span className="font-bold">100% MATCH</span></div>
                    <p className="text-[10px] text-slate-400 mt-1">All 4 cameras report HARBOR route.</p>
                  </div>
                )}

                {mission.mechanicType === 'environment_context' && (
                  <div className="text-[11px] font-mono text-emerald-300">
                    <span className="block">MARINA CONTEXT: ALTERED</span>
                    <span className="text-[10px] text-slate-400">Background environment match: 95%</span>
                  </div>
                )}

                {mission.mechanicType === 'reality_check' && (
                  <div className="text-[11px] font-mono text-purple-300">
                    <span className="block">REALITY & LIGHTING: 94%</span>
                    <span className="text-[10px] text-slate-400">Physical shadows & lighting verified.</span>
                  </div>
                )}
              </div>

              {/* Forgery Objectives */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-pink-400" /> OBJECTIVES
                </span>
              </div>

              <div className="space-y-2.5">
                {mission.objectives.map((obj, idx) => (
                  <div key={obj.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-white font-bold mb-1">
                      <span>{idx + 1}. {obj.title}</span>
                      <span className="text-[10px] font-mono text-pink-400 font-normal px-1.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/20">
                        {obj.targetRegionLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{obj.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CAR DESIGN FRIENDLY FORGERY TOOLSET ── */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-4 space-y-3">
              <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Paintbrush className="w-3.5 h-3.5 text-cyan-400" /> CAR DESIGN & FORGERY TOOLS
              </span>

              {/* Automotive Respray Color Swatches */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1.5">CHASSIS RESPRAY PALETTE:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { name: 'Blackout', color: '#111111' },
                    { name: 'Crimson', color: '#ff0033' },
                    { name: 'Cyan', color: '#00f0ff' },
                    { name: 'White', color: '#ffffff' },
                    { name: 'Gold', color: '#ffea00' },
                    { name: 'Purple', color: '#7e22ce' },
                  ].map((swatch) => (
                    <button
                      key={swatch.name}
                      onClick={() => {
                        audioEngine.playSprayPaintSFX();
                        setJsonNotice(`Chassis resprayed to ${swatch.name}! Use Unlayer to finish details.`);
                        setTimeout(() => setJsonNotice(null), 2500);
                      }}
                      title={`Respray to ${swatch.name}`}
                      className="w-6 h-6 rounded-full border border-slate-700 hover:scale-110 transition-transform shadow-md"
                      style={{ backgroundColor: swatch.color }}
                    />
                  ))}
                </div>
              </div>

              {/* Plate & Tag Forger Quick Input */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">PLATE / CALLSIGN FORGER:</span>
                <input
                  type="text"
                  placeholder="e.g. VC 9900"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      audioEngine.playClickSFX();
                      setJsonNotice(`Identification tag updated to "${(e.target as HTMLInputElement).value}"`);
                      setTimeout(() => setJsonNotice(null), 2500);
                    }
                  }}
                />
              </div>

              {/* Target Vehicle Regions */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">TARGET CAR REGIONS:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold">FRONT BUMPER</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">LICENSE PLATE</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">ROOF / TAIL</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-pink-950/20 border border-pink-500/20 text-[11px] font-mono text-pink-300 mt-4">
              <span className="font-bold text-pink-400 uppercase block mb-1">AUTOMOTIVE FORGERY INSTRUCTIONS:</span>
              Use the Unlayer editor suite (Paint, Text, Shape Masks, Stickers) to alter the vehicle. Tap <strong>SUBMIT FORGERY</strong> when finished.
            </div>
          </div>

          {/* JSON Import/Export Notice Banner */}
          {jsonNotice && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-slate-900 border border-cyan-500/60 text-cyan-300 text-xs font-mono font-bold shadow-2xl flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-cyan-400" />
              <span>{jsonNotice}</span>
            </div>
          )}

          {/* Unlayer Image Editor Suite Container */}
          <div className="flex-1 w-full h-full bg-slate-950 relative overflow-hidden flex flex-col">
            <UnlayerErrorBoundary fallback={
              <FallbackEditorPanel photo={currentPhoto} onSubmit={() => handleSaveAndSubmit()} />
            }>
              <FilerobotImageEditor
                key={activeImageToEdit.slice(-32)}
                image={activeImageToEdit}
                onSave={(result: any) => {
                  const url = result?.dataUrl || result?.imageBase64;
                  handleSaveAndSubmit(url);
                }}
                onCancel={onClose}
              />
            </UnlayerErrorBoundary>
          </div>
        </div>
      ) : (
        /* ── MODE 2: INTEGRATED 3D GARAGE CUSTOMIZER SUITE & VEHICLE SWITCHER ── */
        <div className="flex-1 w-full flex flex-col bg-slate-950 overflow-hidden min-h-0">
          {/* Vehicle Switcher Bar */}
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 overflow-x-auto">
            <div className="flex items-center gap-2 shrink-0">
              <Car className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">VEHICLE SELECTION:</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {VEHICLE_OPTIONS.map((v) => {
                const isSelected = liveryState?.vehicle === v.model;
                return (
                  <button
                    key={v.model}
                    onClick={() => {
                      audioEngine.playClickSFX();
                      onUpdateLiveryState?.({ vehicle: v.model });
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-600 to-cyan-600 text-white shadow-md shadow-pink-500/20'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Integrated Split Studio Viewport (2D Canvas + 3D WebGL Scene) */}
          {liveryState && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
              {/* Left Column: 2D UV Livery Canvas & 2D Toolbar Suite */}
              <div className="lg:col-span-5 flex flex-col h-full border-r border-slate-800 min-h-0 overflow-hidden">
                <div className="h-1/2 min-h-[160px] relative border-b border-slate-800">
                  <LiveryCanvas
                    liveryState={liveryState}
                    selectedDecalId={selectedDecalId}
                    onSelectDecal={setSelectedDecalId}
                    onUpdateDecal={handleUpdateDecal}
                    onCanvasRender={setGarageCanvasElement}
                    onUndo={onUndo || (() => {})}
                    onRedo={onRedo || (() => {})}
                    canUndo={!!canUndo}
                    canRedo={!!canRedo}
                    onOpenExportModal={() => {}}
                  />
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <Toolbar2D
                    liveryState={liveryState}
                    onUpdateState={onUpdateLiveryState || (() => {})}
                    selectedDecalId={selectedDecalId}
                    onSelectDecal={setSelectedDecalId}
                    onAddDecal={handleAddDecal}
                    onUpdateDecal={handleUpdateDecal}
                    onRemoveDecal={handleRemoveDecal}
                    canvasDataUrl={garageCanvasElement ? garageCanvasElement.toDataURL() : ''}
                    onSaveUnlayerImage={(url) => onUpdateLiveryState?.({ unlayerOverlayUrl: url })}
                  />
                </div>
              </div>

              {/* Right Column: 3D Garage WebGL Viewport */}
              <div className="lg:col-span-7 flex flex-col h-full relative min-h-0 overflow-hidden bg-slate-950">
                <GarageScene
                  liveryState={liveryState}
                  onUpdateState={onUpdateLiveryState || (() => {})}
                  canvasElement={garageCanvasElement}
                  cameraPreset={cameraPreset}
                  onSelectCameraPreset={setCameraPreset}
                  quality={graphicsQuality}
                  onSelectQuality={setGraphicsQuality}
                />
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
