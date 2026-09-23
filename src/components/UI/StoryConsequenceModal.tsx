import React from 'react';
import { HeistMission, ForgeryValidationResult } from '../../types';
import { ShieldCheck, ShieldAlert, Award, DollarSign, ArrowRight, RotateCcw, CheckCircle2, Layers, Sparkles } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface StoryConsequenceModalProps {
  isOpen: boolean;
  mission: HeistMission;
  result: ForgeryValidationResult;
  onContinue: () => void;
  onRetry: () => void;
}

export const StoryConsequenceModal: React.FC<StoryConsequenceModalProps> = ({
  isOpen,
  mission,
  result,
  onContinue,
  onRetry,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-8 shadow-2xl overflow-hidden flex flex-col gap-6">
        
        {/* Background Accent Glow */}
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none ${
          result.passed ? 'bg-pink-500' : 'bg-red-600'
        }`} />

        {/* Top Status Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              result.passed ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {result.passed ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 block">
                EDIT → STORY → CONSEQUENCE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                {result.passed ? mission.successHeadline : 'FORGERY REJECTED BY POLICE'}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">FORGERY SCORE</span>
            <span className="text-2xl font-black font-mono text-pink-400">{result.score}/100</span>
          </div>
        </div>

        {/* Dynamic Story Consequence Body */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          
          {/* Forged Evidence Image Preview */}
          <div className="sm:col-span-5">
            <div className="relative rounded-xl border border-pink-500/30 overflow-hidden bg-slate-950 aspect-square">
              <img
                src={result.editedImageDataUrl || mission.evidenceCanvasSvg}
                alt="Forged Evidence"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-pink-400 border border-pink-500/30 font-bold">
                EDITED EVIDENCE SCREEN
              </div>
            </div>
          </div>

          {/* Bespoke Telemetry & Story Outcome */}
          <div className="sm:col-span-7 space-y-4">
            
            {/* Story Cutscene Narrative */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider block mb-1">
                DYNAMIC STORY OUTCOME:
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {result.passed ? mission.successNarrative : mission.failureNarrative}
              </p>
            </div>

            {/* Bespoke Telemetry Cards per Mechanic */}
            {result.mechanicType === 'identity_matrix' && (
              <div className="p-3 rounded-xl bg-yellow-950/20 border border-yellow-500/30 text-xs font-mono space-y-1">
                <span className="font-bold text-yellow-400 block mb-1">IDENTITY MATRIX BREAKDOWN:</span>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
                  <div className="p-1.5 rounded bg-slate-950"><span className="text-slate-400 block">VEHICLE</span><span className="font-bold text-white">{result.vehicleMatchPct}%</span></div>
                  <div className="p-1.5 rounded bg-slate-950"><span className="text-slate-400 block">RIDER</span><span className="font-bold text-white">{result.riderMatchPct}%</span></div>
                  <div className="p-1.5 rounded bg-slate-950"><span className="text-slate-400 block">COLOR</span><span className="font-bold text-white">{result.colorMatchPct}%</span></div>
                </div>
              </div>
            )}

            {result.mechanicType === 'multi_image_consistency' && result.imageConsistencyList && (
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs font-mono space-y-1">
                <span className="font-bold text-cyan-400 block mb-1">CROSS-IMAGE CONSISTENCY REPORT (100%):</span>
                {result.imageConsistencyList.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] text-slate-300">
                    <span>{item.camera}:</span>
                    <span className="font-bold text-emerald-400">{item.text} ✔</span>
                  </div>
                ))}
              </div>
            )}

            {/* Detective Feedback Items */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">DETECTIVE VERIFICATION:</span>
              {result.feedbackNotes.map((note, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>{note}</span>
                </div>
              ))}
            </div>

            {/* Rewards */}
            {result.passed && (
              <div className="flex items-center gap-4 p-3 rounded-xl bg-pink-950/30 border border-pink-500/30">
                <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>+${mission.cashReward.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-pink-400 font-mono font-bold text-xs">
                  <Award className="w-4 h-4" />
                  <span>HEAT REDUCED (-1 ★)</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          {!result.passed && (
            <button
              onClick={() => {
                audioEngine.playClickSFX();
                onRetry();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold uppercase flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              RETRY FORGERY
            </button>
          )}

          <button
            onClick={() => {
              audioEngine.playClickSFX();
              onContinue();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-pink-500/25 flex items-center gap-2"
          >
            <span>CONTINUE GETAWAY</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
