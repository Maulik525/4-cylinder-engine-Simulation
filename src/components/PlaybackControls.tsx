import React from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Gauge, Activity } from 'lucide-react';
import { FiringOrder } from '../types/engine';

interface PlaybackControlsProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  rpm: number;
  setRpm: (rpm: number) => void;
  masterAngleDeg: number;
  setMasterAngleDeg: (angle: number) => void;
  firingOrder: FiringOrder;
  setFiringOrder: (order: FiringOrder) => void;
  stepAngle: (deltaDeg: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  setIsPlaying,
  rpm,
  setRpm,
  masterAngleDeg,
  setMasterAngleDeg,
  firingOrder,
  setFiringOrder,
  stepAngle,
}) => {
  const currentAngleMod = Math.round(((masterAngleDeg % 720) + 720) % 720);

  // Preset RPM buttons
  const rpmPresets = [
    { label: 'Slow-Mo 30', val: 30 },
    { label: 'Study 120', val: 120 },
    { label: 'Idle 800', val: 800 },
    { label: 'Cruise 2400', val: 2400 },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl backdrop-blur-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Section 1: Play/Pause and Stepping controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-wrap items-center gap-2">
          {/* Main Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Motion</span>
              </>
            )}
          </button>

          {/* Steppers */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => stepAngle(-180)}
              disabled={isPlaying}
              className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1 font-mono"
              title="Step backward 1 full stroke (180°)"
            >
              <SkipBack className="w-3.5 h-3.5" />
              <span>-180°</span>
            </button>
            <button
              onClick={() => stepAngle(-15)}
              disabled={isPlaying}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg disabled:opacity-40 transition-colors"
              title="Jog back 15°"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => stepAngle(15)}
              disabled={isPlaying}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg disabled:opacity-40 transition-colors"
              title="Jog forward 15°"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => stepAngle(180)}
              disabled={isPlaying}
              className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1 font-mono"
              title="Step forward 1 full stroke (180°)"
            >
              <span>+180°</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Firing Order Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 pl-2 font-mono text-[11px]">Firing Order:</span>
            <button
              onClick={() => setFiringOrder('1-3-4-2')}
              className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-colors ${
                firingOrder === '1-3-4-2'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1-3-4-2
            </button>
            <button
              onClick={() => setFiringOrder('1-2-4-3')}
              className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-colors ${
                firingOrder === '1-2-4-3'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1-2-4-3
            </button>
          </div>
        </div>

        {/* Section 2: RPM Speed Slider & Presets (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>Engine Speed</span>
            </span>
            <span className="font-mono text-sm font-bold text-amber-400 tabular-nums">
              {rpm} <span className="text-xs text-slate-500 font-normal">RPM</span>
            </span>
          </div>

          <input
            type="range"
            min="20"
            max="3600"
            step="10"
            value={rpm}
            onChange={(e) => setRpm(Number(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between gap-1">
            {rpmPresets.map((p) => (
              <button
                key={p.val}
                onClick={() => setRpm(p.val)}
                className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                  rpm === p.val
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 font-medium'
                    : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Master Crank Angle Display & Scrubber (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>Crank Angle (4-Stroke Cycle)</span>
            </span>
            <span className="font-mono text-sm font-bold text-sky-400 tabular-nums">
              {currentAngleMod}° <span className="text-slate-500 font-normal text-xs">/ 720°</span>
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="720"
            step="1"
            value={currentAngleMod}
            onChange={(e) => {
              setIsPlaying(false);
              setMasterAngleDeg(Number(e.target.value));
            }}
            className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>0° (Rev 1)</span>
            <span>180°</span>
            <span>360° (Rev 2)</span>
            <span>540°</span>
            <span>720°</span>
          </div>
        </div>
      </div>
    </div>
  );
};
