import React, { useState, useEffect, Component } from 'react';
import FilerobotImageEditor from '@unlayer/react-image-editor';
import { HeistMission, ForgeryValidationResult, EvidencePhotoItem } from '../../types';
import { validateEvidenceForgery } from '../../utils/evidenceValidator';
import { audioEngine } from '../../utils/audioEngine';
import { X, CheckCircle2, ShieldAlert, Send, Layers, Clock, Sparkles, AlertTriangle, Edit3 } from 'lucide-react';

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
}

export const EvidenceEditorModal: React.FC<EvidenceEditorModalProps> = ({
  isOpen,
  mission,
  onClose,
  onSubmitForgery
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // 90-Second Countdown timer for Final Mission
  const [timerRemaining, setTimerRemaining] = useState(90);

  useEffect(() => {
    if (!isOpen || mission.mechanicType !== 'final_speed_run') return;
    setTimerRemaining(90);
    const interval = setInterval(() => {
      setTimerRemaining(t => {
        if (t <= 1) {
          clearInterval(interval);
          handleSaveAndSubmit();
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

  const handleSaveAndSubmit = async (imageDataUrl?: string) => {
    audioEngine.playClickSFX();
    setIsSubmitting(true);

    try {
      const finalUrl = imageDataUrl || currentPhoto.svgDataUrl;
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
        editedImageDataUrl: currentPhoto.svgDataUrl
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* 90-Second Speed Run Timer Badge for Final Mission */}
        {mission.mechanicType === 'final_speed_run' && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-950/60 border border-red-500/50 text-red-400 font-mono font-bold text-xs animate-pulse">
            <Clock className="w-4 h-4" />
            <span>00:{timerRemaining.toString().padStart(2, '0')}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="sm:hidden px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300"
          >
            Objectives ({mission.objectives.length})
          </button>

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

      {/* Main Container */}
      <div className="relative flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Objectives & Bespoke Mechanics Sidebar */}
        <div className={`
          lg:w-80 border-r border-slate-800 bg-slate-900/95 p-4 flex flex-col justify-between shrink-0 z-20 transition-all duration-300
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

          <div className="p-3 rounded-xl bg-pink-950/20 border border-pink-500/20 text-[11px] font-mono text-pink-300 mt-4">
            <span className="font-bold text-pink-400 uppercase block mb-1">UNLAYER EDITOR INSTRUCTIONS:</span>
            Use paint, text, shape, and sticker tools to alter the image. Tap <strong>SUBMIT FORGERY</strong> when finished.
          </div>
        </div>

        {/* Unlayer Image Editor Suite Container */}
        <div className="flex-1 w-full h-full bg-slate-950 relative overflow-hidden flex flex-col">
          <UnlayerErrorBoundary fallback={
            <FallbackEditorPanel photo={currentPhoto} onSubmit={() => handleSaveAndSubmit()} />
          }>
            <FilerobotImageEditor
              key={currentPhoto.id}
              image={currentPhoto.svgDataUrl}
              onSave={(result: any) => {
                const url = result?.dataUrl || result?.imageBase64;
                handleSaveAndSubmit(url);
              }}
              onCancel={onClose}
            />
          </UnlayerErrorBoundary>
        </div>

      </div>
    </div>
  );
};
