import React, { useState } from 'react';
import {
  Sparkles, Heart, Users, MapPin, Compass, Smile, Calendar, Camera,
  Play, CheckCircle2, Image as ImageIcon, ArrowRight, ShieldAlert,
  Zap, Lock, ChevronRight, Car, Bike, Train, Ship, Navigation, Trophy,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';
import { HeistMission, GetawayVehicleType } from '../../types';
import { HEIST_MISSIONS } from '../../utils/heistMissions';

interface JourneyStoryHubProps {
  onSelectStory: (storyId: string, linkedMission: HeistMission) => void;
  onOpenTour?: () => void;
}

export interface JourneyStory {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  vehicleType: GetawayVehicleType;
  vehicleThemeLabel: string;
  iconName: 'heart' | 'family' | 'drive' | 'reunion' | 'friends' | 'anniversary';
  badge: string;
  color: string;
  bgGradient: string;
  description: string;
  chapters: number;
  sampleMission: string;
  challengeTip: string;
  unlayerTool: string;
  /**
   * The heist mission that powers this story's evidence editing.
   * Same Unlayer mechanic — different narrative skin.
   */
  linkedMissionId: string;
  /** Flavour text explaining WHY this story uses that mechanic. */
  mechanicBridge: string;
}

export const JOURNEY_STORIES: JourneyStory[] = [
  {
    id: 'family_trip',
    title: 'THE ROAD HOME',
    subtitle: 'Family Car Trip Memory Album',
    category: 'FAMILY CAR TRIP',
    vehicleType: 'car',
    vehicleThemeLabel: 'Family Getaway Car & Road Trip',
    iconName: 'family',
    badge: 'HEARTWARMING CAR TRIP',
    color: '#ff007f',
    bgGradient: 'from-pink-950/40 via-purple-950/20 to-slate-950',
    description:
      'Reconstruct the family getaway car album. Grandma is missing from the scenic overlook shot, bad weather ruined the coastal drive, and someone blinked in the car group photo.',
    chapters: 5,
    sampleMission: 'Add Grandma to the waterfall road trip photo and respray the car chassis color',
    challengeTip: 'Use Unlayer sticker overlays, chassis recolour, and sky respray tools',
    unlayerTool: 'Stickers & Car Photo Compositing',
    linkedMissionId: 'mission-car',
    mechanicBridge:
      'Both use the same "vehicle disguise" technique — just as The Forger resprays a getaway car to fool traffic cams, you\'ll recolour and reframe family car photos to fix imperfect memories.',
  },
  {
    id: 'dating',
    title: 'THE PERFECT FIRST DATE',
    subtitle: 'Scenic Scooter Date: Reality vs Your Story',
    category: 'MOTORBIKE ROMANCE',
    vehicleType: 'bike',
    vehicleThemeLabel: 'Motorbike & Sunset Scooter Ride',
    iconName: 'heart',
    badge: 'HUMOROUS MOTORCYCLE DATE',
    color: '#00f0ff',
    bgGradient: 'from-cyan-950/40 via-blue-950/20 to-slate-950',
    description:
      'Transform an awkward motorcycle sunset date into a magical memory. Edit ordinary café lighting, helmet reflections, and traffic into a cinematic coastal ride postcard.',
    chapters: 4,
    sampleMission: 'Turn rain and traffic into a glowing sunset coastal motorbike drive',
    challengeTip: 'Compare REALITY vs YOUR STORY before sending the motorcycle postcard',
    unlayerTool: 'Color Grading & Identity Filters',
    linkedMissionId: 'mission-bike',
    mechanicBridge:
      'The identity-matrix mechanic strips away recognisable features — The Forger hides a motorbike rider\'s identity; you\'re hiding the ugly reality of a bad date behind beautiful edits.',
  },
  {
    id: 'long_drive',
    title: 'MILES BETWEEN US',
    subtitle: 'Cross-Country Express Rail Journey',
    category: 'EXPRESS RAIL JOURNEY',
    vehicleType: 'train',
    vehicleThemeLabel: 'Express Bullet Train & Rail Route',
    iconName: 'drive',
    badge: 'CINEMATIC RAIL ADVENTURE',
    color: '#ffea00',
    bgGradient: 'from-amber-950/40 via-orange-950/20 to-slate-950',
    description:
      'Follow two travelers across 1,247 km of scenic railways from dawn to starlight. Edit multi-camera station feeds, train viewports, and track signs into a cohesive cinematic rail journey.',
    chapters: 6,
    sampleMission: 'Synchronize 4 station approach camera feeds and destination boards to HARBOR express',
    challengeTip: 'Ensure all 4 train camera views tell the exact same route story',
    unlayerTool: 'Multi-Image Consistency & Route Editor',
    linkedMissionId: 'mission-train',
    mechanicBridge:
      'Multi-image consistency is the key skill: The Forger edits 4 train-camera feeds to agree on destination HARBOR; you edit 6 rail-journey stages so the timeline reads as one cohesive train adventure.',
  },
  {
    id: 'reunion',
    title: 'ONE MORE PHOTO',
    subtitle: 'Coastal Speedboat Reunion',
    category: 'MARINA BOAT REUNION',
    vehicleType: 'boat',
    vehicleThemeLabel: 'Speedboat & Marina Yacht Cruise',
    iconName: 'reunion',
    badge: 'NOSTALGIC HARBOR',
    color: '#39ff14',
    bgGradient: 'from-emerald-950/40 via-teal-950/20 to-slate-950',
    description:
      'Friends meeting after 14 years for a coastal speedboat reunion. Restore damaged marina photos, un-crop missing companions, and alter background harbor context.',
    chapters: 4,
    sampleMission: 'Repair scratch marks on 2012 marina photo & alter vessel name context',
    challengeTip: 'Seamlessly blend vintage film grain with marina water reflections',
    unlayerTool: 'Environment Context & Photo Blending',
    linkedMissionId: 'mission-boat',
    mechanicBridge:
      'Environment context editing — The Forger changes the marina backdrop to disguise a smuggler\'s boat; you swap the harbor background to blend a 2012 photo into a 2026 reunion frame.',
  },
  {
    id: 'friends_trip',
    title: 'THE GROUP PHOTO',
    subtitle: 'Helicopter Air Tour Memories',
    category: 'SKYLINE HELICOPTER TOUR',
    vehicleType: 'helicopter',
    vehicleThemeLabel: 'Skyline Helicopter & Aerial Tour',
    iconName: 'friends',
    badge: 'HILARIOUS AIR TOUR',
    color: '#a855f7',
    bgGradient: 'from-purple-950/40 via-pink-950/20 to-slate-950',
    description:
      'The group took a skyline helicopter air tour — someone fell asleep in the chopper, rotor glare blurred the photo, and someone photobombed. Make the aerial trip look epic.',
    chapters: 5,
    sampleMission: 'Swap blinked eyes, clear helicopter rotor glare, and align skyline lighting',
    challengeTip: 'Maintain realistic lighting shadows and helicopter callsign placement',
    unlayerTool: 'Lighting & Callsign Realism Check',
    linkedMissionId: 'mission-chopper',
    mechanicBridge:
      'Reality & lighting consistency is crucial — The Forger composites a helicopter callsign believably; you swap faces and helicopter backgrounds while keeping lighting shadows convincing.',
  },
  {
    id: 'anniversary',
    title: 'OUR STORY (2018-2026)',
    subtitle: 'Grand Multi-Vehicle Anniversary',
    category: 'MASTER FLEET TIMELINE',
    vehicleType: 'final',
    vehicleThemeLabel: 'Master Multi-Vehicle Fleet',
    iconName: 'anniversary',
    badge: 'SWEET TIMELINE FLEET',
    color: '#ff3366',
    bgGradient: 'from-rose-950/40 via-pink-950/20 to-slate-950',
    description:
      'Build a grand multi-vehicle visual story timeline: First Car Ride → Scooter Date → Scenic Train Trip → Marina Boat Cruise → Skyline Helicopter → Today. Edit & frame photos across all vehicle milestones.',
    chapters: 5,
    sampleMission: 'Craft 5 milestone photos across Car, Bike, Train, Boat, and Chopper before time runs out',
    challengeTip: 'Creates a custom digital love timeline across all vehicle adventures',
    unlayerTool: 'Multi-Vehicle Timeline & Typography',
    linkedMissionId: 'mission-final',
    mechanicBridge:
      'The Final Speed Run demands editing a connected evidence set under pressure — here you\'re racing to craft 5 multi-vehicle milestone photos into one beautiful anniversary album.',
  },
];

export const JourneyStoryHub: React.FC<JourneyStoryHubProps> = ({ onSelectStory, onOpenTour }) => {
  const [selectedStoryId, setSelectedStoryId] = useState<string>(JOURNEY_STORIES[0].id);

  const currentStory = JOURNEY_STORIES.find(s => s.id === selectedStoryId) || JOURNEY_STORIES[0];
  const linkedMission = HEIST_MISSIONS.find(m => m.id === currentStory.linkedMissionId) || HEIST_MISSIONS[0];

  const handleStartStory = (story: JourneyStory) => {
    audioEngine.playClickSFX();
    const mission = HEIST_MISSIONS.find(m => m.id === story.linkedMissionId) || HEIST_MISSIONS[0];
    onSelectStory(story.id, mission);
  };

  const getStoryIcon = (iconName: JourneyStory['iconName'], color: string) => {
    switch (iconName) {
      case 'family':      return <Users size={22} style={{ color }} />;
      case 'heart':       return <Heart size={22} style={{ color }} />;
      case 'drive':       return <Compass size={22} style={{ color }} />;
      case 'reunion':     return <MapPin size={22} style={{ color }} />;
      case 'friends':     return <Smile size={22} style={{ color }} />;
      case 'anniversary': return <Calendar size={22} style={{ color }} />;
      default:            return <Camera size={22} style={{ color }} />;
    }
  };

  const getVehicleIcon = (type: GetawayVehicleType, size: number = 14) => {
    switch (type) {
      case 'car':        return <Car size={size} className="text-pink-400 shrink-0" />;
      case 'bike':       return <Bike size={size} className="text-yellow-400 shrink-0" />;
      case 'train':      return <Train size={size} className="text-cyan-400 shrink-0" />;
      case 'boat':       return <Ship size={size} className="text-emerald-400 shrink-0" />;
      case 'helicopter': return <Navigation size={size} className="text-purple-400 shrink-0" />;
      case 'final':      return <Trophy size={size} className="text-amber-400 shrink-0" />;
      default:           return <Car size={size} className="text-pink-400 shrink-0" />;
    }
  };

  return (
    <div className="relative w-full h-[calc(100dvh-54px)] overflow-y-auto bg-slate-950 text-white p-3 sm:p-6 md:p-8 flex flex-col items-center custom-scrollbar">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/*  HOW IT WORKS — Connection Banner  */}
      <div className="relative z-10 w-full max-w-6xl mb-5">
        <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-950/50 via-purple-950/40 to-cyan-950/50 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-pink-400" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 hidden sm:block" />
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Camera className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono font-bold text-pink-400 uppercase tracking-widest mb-0.5">
              🔗 POWERED BY THE SAME ENGINE AS VEHICLE HEIST
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every Journey Story matches a specific <strong className="text-cyan-300">Vehicle Theme</strong> (Car, Bike, Train, Boat, Chopper, Fleet) and uses the <strong className="text-white">exact same Unlayer editing mechanics</strong> as the{' '}
              <strong className="text-pink-400">Vehicle Heist</strong> mode — wrapped in narrative journeys.
              Pick a story below to launch the editor with its matched vehicle theme and objective set.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-mono text-yellow-400 font-bold whitespace-nowrap">MATCHED VEHICLE THEMES</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 w-full max-w-6xl mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-cyan-500/30 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1 justify-center sm:justify-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase">
              <Camera className="w-3.5 h-3.5" /> JOURNEY — EVERY PHOTO TELLS A STORY
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/40 text-pink-300 text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" /> POWERED BY UNLAYER IMAGE EDITOR
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-sans tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 uppercase">
            INTERACTIVE STORYTELLING ENGINE — CHOOSE YOUR STORY
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Pick a memory journey: Family Car Trips, Sunset Motorbike Dates, Express Rail Journeys, Marina Speedboat Reunions, Helicopter Air Tours, or Grand Multi-Vehicle Timelines.
          </p>
        </div>

        {onOpenTour && (
          <button
            onClick={() => { audioEngine.playClickSFX(); onOpenTour(); }}
            className="px-4 py-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/50 text-cyan-200 text-xs font-mono font-bold uppercase flex items-center gap-2 transition-all hover:scale-105 shrink-0 shadow-lg shadow-cyan-500/10"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>STORY GUIDE</span>
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Story selector list */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>SELECT A STORY JOURNEY ({JOURNEY_STORIES.length}):</span>
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto custom-scrollbar pr-1">
            {JOURNEY_STORIES.map((story) => {
              const isSelected = story.id === selectedStoryId;
              const mission    = HEIST_MISSIONS.find(m => m.id === story.linkedMissionId);
              return (
                <div
                  key={story.id}
                  onClick={() => {
                    audioEngine.playClickSFX();
                    setSelectedStoryId(story.id);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-400/50 scale-[1.01]'
                      : 'bg-slate-900/50 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center border shrink-0"
                      style={{ backgroundColor: story.color + '15', borderColor: story.color + '44' }}
                    >
                      {getStoryIcon(story.iconName, story.color)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: story.color + '22', color: story.color }}>
                          {story.category}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">{story.chapters} STAGES</span>
                        {/* Explicit Vehicle Theme Badge */}
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-cyan-500/40 text-cyan-300 bg-cyan-500/10 flex items-center gap-1 font-bold">
                          {getVehicleIcon(story.vehicleType, 11)}
                          <span>{story.vehicleType.toUpperCase()}</span>
                        </span>
                        {/* Heist mechanic link badge */}
                        {mission && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-pink-500/30 text-pink-400 bg-pink-500/10 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />{mission.mechanicBadgeLabel}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white tracking-wide mt-1 font-sans truncate">
                        {story.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{story.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <ArrowRight size={16} className={isSelected ? 'text-cyan-400' : 'text-slate-600'} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active story dossier */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-0">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>STORY DOSSIER &amp; UNLAYER OBJECTIVES:</span>
          </div>

          <div className={`flex-1 rounded-2xl border border-slate-800 bg-gradient-to-b ${currentStory.bgGradient} p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden`}>
            {/* Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full filter blur-3xl opacity-10 pointer-events-none" style={{ backgroundColor: currentStory.color }} />

            <div>
              {/* Badge row */}
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-full border shadow-md" style={{ backgroundColor: currentStory.color + '20', borderColor: currentStory.color + '60', color: currentStory.color }}>
                  {currentStory.badge}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  UNLAYER TOOL: <strong className="text-white">{currentStory.unlayerTool}</strong>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-sans text-white tracking-tight mb-1">
                {currentStory.title}
              </h2>
              <p className="text-xs font-mono text-cyan-400 mb-4">{currentStory.subtitle}</p>

              {/* Story details */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 mb-4">
                <p className="text-xs text-slate-300 leading-relaxed">{currentStory.description}</p>
                <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1.5 text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                    <strong>SAMPLE MISSION:</strong> {currentStory.sampleMission}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-yellow-400 shrink-0" />
                    <strong>PRO TIP:</strong> {currentStory.challengeTip}
                  </span>
                </div>
              </div>

              {/*  VEHICLE THEME & HEIST CONNECTION BRIDGE */}
              <div className="p-3.5 rounded-xl bg-pink-950/30 border border-pink-500/30 mb-4">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-wider">
                        🔗 VEHICLE HEIST CONNECTION — {linkedMission.mechanicBadgeLabel}
                      </span>
                      <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border border-cyan-500/40 text-cyan-300 bg-cyan-500/20 flex items-center gap-1">
                        {getVehicleIcon(currentStory.vehicleType, 12)}
                        <span>VEHICLE THEME: {currentStory.vehicleThemeLabel.toUpperCase()}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentStory.mechanicBridge}
                    </p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-pink-300 bg-pink-500/10 border border-pink-500/30 px-2 py-0.5 rounded">
                        HEIST VEHICLE: {linkedMission.title} ({linkedMission.vehicleType.toUpperCase()})
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        uses matching vehicle engine &amp; editor mechanics
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage pills */}
              <div className="space-y-1.5 mb-4">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">JOURNEY STAGES:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Array.from({ length: currentStory.chapters }).map((_, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold text-slate-300">
                      STAGE 0{idx + 1}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch CTAs */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
              {/* Primary: story mode */}
              <button
                onClick={() => handleStartStory(currentStory)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 hover:from-cyan-400 hover:to-yellow-400 text-slate-950 font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>BEGIN STORY — {currentStory.title} ({currentStory.vehicleType.toUpperCase()})</span>
              </button>
            </div>

            <p className="text-center text-[10px] font-mono text-slate-500 mt-2">
              Launches the Unlayer evidence editor pre-loaded with this story's visual challenge →{' '}
              <span className="text-pink-400">same engine as Vehicle Heist</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
