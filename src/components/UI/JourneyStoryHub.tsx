import React, { useState } from 'react';
import { Sparkles, Heart, Users, MapPin, Compass, Smile, Calendar, Camera, Play, CheckCircle2, Image as ImageIcon, ArrowRight, ShieldAlert } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface JourneyStoryHubProps {
  onSelectStory: (storyId: string) => void;
  onOpenTour?: () => void;
}

export interface JourneyStory {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  iconName: 'heart' | 'family' | 'drive' | 'reunion' | 'friends' | 'anniversary';
  badge: string;
  color: string;
  bgGradient: string;
  description: string;
  chapters: number;
  sampleMission: string;
  challengeTip: string;
  unlayerTool: string;
}

export const JOURNEY_STORIES: JourneyStory[] = [
  {
    id: 'family_trip',
    title: 'THE ROAD HOME',
    subtitle: 'Family Trip Memory Album',
    category: 'FAMILY TRIP',
    iconName: 'family',
    badge: 'HEARTWARMING',
    color: '#ff007f',
    bgGradient: 'from-pink-950/40 via-purple-950/20 to-slate-950',
    description: 'Reconstruct the family trip album. Grandma is missing from the waterfall shot, bad weather ruined the beach, and someone blinked in the group photo.',
    chapters: 5,
    sampleMission: 'Add Grandma to the waterfall group photo and fix the overcast sky',
    challengeTip: 'Use Unlayer sticker overlays, text, and sky respray tools',
    unlayerTool: 'Stickers & Photo Compositing'
  },
  {
    id: 'dating',
    title: 'THE PERFECT FIRST DATE',
    subtitle: 'Reality vs Your Story',
    category: 'DATING & ROMANCE',
    iconName: 'heart',
    badge: 'HUMOROUS & ROMANTIC',
    color: '#00f0ff',
    bgGradient: 'from-cyan-950/40 via-blue-950/20 to-slate-950',
    description: 'Transform an awkward first date into a magical memory. Edit ordinary café lighting, traffic jams, and rain into a cinematic sunset date postcard.',
    chapters: 4,
    sampleMission: 'Turn rain and traffic into a glowing sunset coastal drive',
    challengeTip: 'Compare REALITY vs YOUR STORY before sending the postcard',
    unlayerTool: 'Color Grading & Light Filters'
  },
  {
    id: 'long_drive',
    title: 'MILES BETWEEN US',
    subtitle: 'From Sunrise to Midnight',
    category: 'LONG ROAD TRIP',
    iconName: 'drive',
    badge: 'CINEMATIC ADVENTURE',
    color: '#ffea00',
    bgGradient: 'from-amber-950/40 via-orange-950/20 to-slate-950',
    description: 'Follow two road-trippers across 1,247 km from dawn to starlight. Enhance sunrises, clear traffic from mountain passes, and polish night cityscapes.',
    chapters: 6,
    sampleMission: 'Clear morning traffic and enhance golden hour mountain fog',
    challengeTip: 'Points along the timeline become your shareable journey map',
    unlayerTool: 'Object Removal & Magic Brush'
  },
  {
    id: 'reunion',
    title: 'ONE MORE PHOTO',
    subtitle: 'Old Friends Reunion',
    category: 'REUNION & MEMORIES',
    iconName: 'reunion',
    badge: 'NOSTALGIC',
    color: '#39ff14',
    bgGradient: 'from-emerald-950/40 via-teal-950/20 to-slate-950',
    description: 'Friends meeting after 14 years. Restore damaged college photos, un-crop missing companions, and build a THEN (2012) → NOW (2026) visual portrait.',
    chapters: 4,
    sampleMission: 'Repair scratch marks on 2012 college photo & add missing friend',
    challengeTip: 'Seamlessly blend vintage film grain with modern clarity',
    unlayerTool: 'Photo Restoration & Blending'
  },
  {
    id: 'friends_trip',
    title: 'THE GROUP PHOTO',
    subtitle: 'The Trip That "Never Happened"',
    category: 'FRIENDS TRIP',
    iconName: 'friends',
    badge: 'HILARIOUS HACKATHON',
    color: '#a855f7',
    bgGradient: 'from-purple-950/40 via-pink-950/20 to-slate-950',
    description: 'The group took terrible photos—someone fell asleep, someone blinked, and someone photobombed. Your job: make the trip look epic and legendary.',
    chapters: 5,
    sampleMission: 'Swap blinked eyes, remove background photobombers, add neon text',
    challengeTip: 'Export the hilarious "Reality vs Story" meme postcard',
    unlayerTool: 'Face Swap Stickers & Text Annotations'
  },
  {
    id: 'anniversary',
    title: 'OUR STORY (2018-2026)',
    subtitle: 'Anniversary Timeline',
    category: 'ANNIVERSARY',
    iconName: 'anniversary',
    badge: 'SWEET TIMELINE',
    color: '#ff3366',
    bgGradient: 'from-rose-950/40 via-pink-950/20 to-slate-950',
    description: 'Build a visual story timeline: First Meeting → First Date → First Road Trip → First Home → Today. Edit & frame a photo for each milestone.',
    chapters: 5,
    sampleMission: 'Add romantic date frame, warm aesthetic filters, and anniversary text',
    challengeTip: 'Creates a custom digital love timeline',
    unlayerTool: 'Frames, Filters & Typography'
  }
];

export const JourneyStoryHub: React.FC<JourneyStoryHubProps> = ({ onSelectStory, onOpenTour }) => {
  const [selectedStoryId, setSelectedStoryId] = useState<string>(JOURNEY_STORIES[0].id);

  const currentStory = JOURNEY_STORIES.find(s => s.id === selectedStoryId) || JOURNEY_STORIES[0];

  const handleStartStory = (story: JourneyStory) => {
    audioEngine.playClickSFX();
    onSelectStory(story.id);
  };

  const getStoryIcon = (iconName: JourneyStory['iconName'], color: string) => {
    switch (iconName) {
      case 'family': return <Users size={22} style={{ color }} />;
      case 'heart': return <Heart size={22} style={{ color }} />;
      case 'drive': return <Compass size={22} style={{ color }} />;
      case 'reunion': return <MapPin size={22} style={{ color }} />;
      case 'friends': return <Smile size={22} style={{ color }} />;
      case 'anniversary': return <Calendar size={22} style={{ color }} />;
      default: return <Camera size={22} style={{ color }} />;
    }
  };

  return (
    <div className="relative w-full h-[calc(100dvh-54px)] overflow-y-auto bg-slate-950 text-white p-3 sm:p-6 md:p-8 flex flex-col items-center custom-scrollbar">
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 w-full max-w-6xl mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-cyan-500/30 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1 justify-center sm:justify-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase">
              <Camera className="w-3.5 h-3.5" /> JOURNEY — EVERY PHOTO TELLS A STORY
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/40 text-pink-300 text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" /> POWERED BY UNLAYER IMAGE EDITOR &amp; GOOGLE ANTIGRAVITY
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-sans tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 uppercase">
            INTERACTIVE STORYTELLING ENGINE — CHOOSE YOUR STORY
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Pick a memory journey: Family Trips, First Dates, Long Drives, Reunions, or Hilarious Group Photos. Edit photographs in Unlayer to reconstruct memories and shape the final story.
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

      {/* Main Grid: Story Selector List + Active Story Preview Card */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Story Cards Selector (6 Columns) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>SELECT A STORY JOURNEY ({JOURNEY_STORIES.length}):</span>
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto custom-scrollbar pr-1">
            {JOURNEY_STORIES.map((story) => {
              const isSelected = story.id === selectedStoryId;
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
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center border shrink-0"
                      style={{
                        backgroundColor: story.color + '15',
                        borderColor: story.color + '44'
                      }}
                    >
                      {getStoryIcon(story.iconName, story.color)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: story.color + '22', color: story.color }}>
                          {story.category}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">{story.chapters} CHAPTERS</span>
                      </div>
                      <h3 className="text-sm font-bold text-white tracking-wide mt-0.5 font-sans">
                        {story.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{story.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">SELECT</span>
                    <ArrowRight size={16} className={isSelected ? 'text-cyan-400' : 'text-slate-600'} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Story Dossier & Launch Card (6 Columns) */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>STORY DOSSIER &amp; UNLAYER OBJECTIVES:</span>
          </div>

          <div className={`flex-1 rounded-2xl border border-slate-800 bg-gradient-to-b ${currentStory.bgGradient} p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden`}>
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full filter blur-3xl opacity-10 pointer-events-none" style={{ backgroundColor: currentStory.color }} />

            <div>
              {/* Header Badge & Title */}
              <div className="flex items-center justify-between gap-2 mb-3">
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

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 mb-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentStory.description}
                </p>

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

              {/* Story Chapters Preview Pills */}
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

            {/* Launch Button */}
            <div className="pt-3 border-t border-slate-800/80">
              <button
                onClick={() => handleStartStory(currentStory)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 hover:from-cyan-400 hover:to-yellow-400 text-slate-950 font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>BEGIN STORY — {currentStory.title}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
