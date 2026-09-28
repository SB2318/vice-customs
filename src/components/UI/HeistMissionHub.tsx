import React, { useState } from 'react';
import { HEIST_MISSIONS } from '../../utils/heistMissions';
import { HeistMission, GetawayVehicleType } from '../../types';
import { Car, Bike, Train, Ship, Navigation, ShieldAlert, Award, Play, Trophy, Sparkles, AlertCircle, Layers } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';
import { ViceRadio } from './ViceRadio';

interface HeistMissionHubProps {
  onSelectMission: (mission: HeistMission) => void;
  onOpenTour?: () => void;
  onClose?: () => void;
}

const VEHICLE_ICONS: Record<GetawayVehicleType, React.ReactNode> = {
  car: <Car className="w-5 h-5 sm:w-7 sm:h-7 text-pink-500" />,
  bike: <Bike className="w-5 h-5 sm:w-7 sm:h-7 text-yellow-400" />,
  train: <Train className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-400" />,
  boat: <Ship className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-400" />,
  helicopter: <Navigation className="w-5 h-5 sm:w-7 sm:h-7 text-purple-400" />,
  final: <Trophy className="w-5 h-5 sm:w-7 sm:h-7 text-amber-400 animate-pulse" />,
};

export const HeistMissionHub: React.FC<HeistMissionHubProps> = ({ onSelectMission, onOpenTour }) => {
  const [selectedMissionId, setSelectedMissionId] = useState<string>(HEIST_MISSIONS[0].id);

  const currentMission = HEIST_MISSIONS.find(m => m.id === selectedMissionId) || HEIST_MISSIONS[0];

  const handleStartMission = (mission: HeistMission) => {
    audioEngine.playClickSFX();
    onSelectMission(mission);
  };

  return (
    <div className="relative w-full h-[calc(100dvh-64px)] overflow-y-auto bg-slate-950 text-white p-3 sm:p-6 md:p-8 flex flex-col items-center">
      {/* Background Neon Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 w-full max-w-6xl mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-pink-500/30 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-mono font-bold tracking-widest uppercase">
              <ShieldAlert className="w-3.5 h-3.5" /> NEON ESCAPE — 5 INTERCONNECTED CHAPTERS
            </div>
          
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-sans tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 uppercase">
            VEHICLE HEIST STUDIO — FORGE THE EVIDENCE &amp; ESCAPE
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Choose your getaway vehicle path. Use the Unlayer image editor to forge surveillance evidence, alter identity markings, fool the police database, and execute live 3D pursuit evasion.
          </p>
        </div>

        {onOpenTour && (
          <button
            onClick={() => {
              audioEngine.playClickSFX();
              onOpenTour();
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/50 text-purple-200 text-xs font-mono font-bold uppercase flex items-center gap-2 transition-all hover:scale-105 shrink-0 shadow-lg shadow-purple-500/10"
          >
            <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
            START GAME TOUR
          </button>
        )}
      </div>

      {/* Vehicle Selection Cards Grid */}
      <div className="relative z-10 w-full max-w-6xl mb-6">
        <h2 className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-2">
          SELECT YOUR GETAWAY VEHICLE & FORGERY MISSION
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {HEIST_MISSIONS.map((mission) => {
            const isSelected = mission.id === selectedMissionId;
            return (
              <button
                key={mission.id}
                onClick={() => {
                  audioEngine.playClickSFX();
                  setSelectedMissionId(mission.id);
                }}
                className={`relative flex flex-col items-center p-3 rounded-xl border text-left transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-pink-950/40 border-pink-500 shadow-lg shadow-pink-500/20 scale-[1.02]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className={`p-2.5 rounded-lg mb-2 ${isSelected ? 'bg-pink-500/20' : 'bg-slate-800/80'}`}>
                  {VEHICLE_ICONS[mission.vehicleType]}
                </div>
                
                <span className="text-[10px] font-mono font-bold text-pink-400 tracking-wider uppercase">{mission.vehicleType}</span>
                <span className="text-xs font-black text-white truncate max-w-full">{mission.codename}</span>

                {/* Mechanic Badge */}
                <div className="mt-2 w-full pt-2 border-t border-slate-800/80 text-[9px] font-mono text-center">
                  <span className="text-slate-400 block truncate">{mission.mechanicBadgeLabel}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Mission Dossier Detail Card */}
      <div className="relative z-10 w-full max-w-6xl bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-md grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Evidence Photo Preview or Multi-Image Grid */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="relative rounded-xl border border-slate-700 overflow-hidden bg-slate-950 aspect-square flex items-center justify-center">
            <img 
              src={currentMission.evidenceCanvasSvg} 
              alt={currentMission.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-black/80 backdrop-blur border border-pink-500/40 text-[10px] font-mono text-pink-400 font-bold">
              {currentMission.evidencePhotoTitle}
            </div>
            <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-300">
              {currentMission.evidencePhotoSub}
            </div>
          </div>

          {/* Multi-Image Indicator Badge for Train */}
          {currentMission.evidencePhotos && (
            <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-center gap-2 text-xs font-mono text-cyan-300">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Includes 4 Evidence Photos requiring Cross-Consistency Check</span>
            </div>
          )}
        </div>

        {/* Right: Mission Dossier Briefing & Objectives */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full gap-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-pink-400 tracking-widest uppercase">
                CHAPTER #{currentMission.id.toUpperCase()} — {currentMission.mechanicBadgeLabel}
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < currentMission.heatLevel ? 'bg-pink-500 shadow-sm shadow-pink-500' : 'bg-slate-800'
                    }`}
                  />
                ))}
                <span className="text-[10px] font-mono text-pink-400 ml-1">HEAT L{currentMission.heatLevel}</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-2">
              {currentMission.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
              {currentMission.briefingText}
            </p>

            {/* Bespoke Mechanic Highlight Box */}
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs font-mono text-purple-300 mb-4 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-purple-400 uppercase">BESPOKE EDITING MECHANIC:</span>
                <p className="mt-0.5 text-purple-200">{currentMission.mechanicDescription}</p>
              </div>
            </div>

            {/* Mission Objectives Checklist */}
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
              FORGERY OBJECTIVES
            </h3>
            <div className="space-y-2 mb-6">
              {currentMission.objectives.map((obj) => (
                <div
                  key={obj.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                >
                  <div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-white">{obj.title}</span>
                    <span className="text-slate-400 ml-2">({obj.targetRegionLabel})</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">{obj.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => handleStartMission(currentMission)}
              className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white font-black font-mono text-sm tracking-wider uppercase shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-white" />
              START {currentMission.mechanicBadgeLabel} FORGERY
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
