import React from 'react';
import { Volume2, VolumeX, Sparkles, RotateCcw } from 'lucide-react';

interface HeaderProps {
  activeTab: 'simulation' | 'theory' | 'kinematics' | 'quiz';
  setActiveTab: (tab: 'simulation' | 'theory' | 'kinematics' | 'quiz') => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onReset: () => void;
  onStartWalkthrough: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isMuted,
  setIsMuted,
  onReset,
  onStartWalkthrough,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-8">
      {/* Zone 1: Brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#simulation"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('simulation');
          }}
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5 whitespace-nowrap"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-red-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-mono font-extrabold text-sm">
            4C
          </div>
          <span>Inline-4 Engine Lab</span>
        </a>
      </div>

      {/* Zone 2: Nav links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('simulation')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'simulation'
              ? 'text-white border-amber-500'
              : 'border-transparent text-slate-400'
          }`}
        >
          Engine Simulation
        </button>
        <button
          onClick={() => setActiveTab('theory')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'theory'
              ? 'text-white border-amber-500'
              : 'border-transparent text-slate-400'
          }`}
        >
          4-Stroke Thermodynamics
        </button>
        <button
          onClick={() => setActiveTab('kinematics')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'kinematics'
              ? 'text-white border-amber-500'
              : 'border-transparent text-slate-400'
          }`}
        >
          Firing Order & Balance
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'quiz'
              ? 'text-white border-amber-500'
              : 'border-transparent text-slate-400'
          }`}
        >
          Knowledge Check
        </button>
      </nav>

      {/* Zone 3: Primary Action & Utilities */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2 rounded-lg border transition-colors ${
            isMuted
              ? 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              : 'border-amber-500/50 bg-amber-500/10 text-amber-400'
          }`}
          title={isMuted ? 'Unmute engine audio' : 'Mute engine audio'}
          aria-label={isMuted ? 'Unmute engine audio' : 'Mute engine audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={onReset}
          className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
          title="Reset to 0° TDC Cylinder 1"
          aria-label="Reset simulation position"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onStartWalkthrough}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Tour</span>
        </button>
      </div>
    </header>
  );
};
