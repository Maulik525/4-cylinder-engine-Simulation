import React from 'react';
import { FiringOrder, StrokeType, STROKE_METAS } from '../types/engine';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface FiringOrderTimelineProps {
  masterAngleDeg: number;
  firingOrder: FiringOrder;
  onSeek: (angleDeg: number) => void;
  selectedCylinder: number;
}

export const FiringOrderTimeline: React.FC<FiringOrderTimelineProps> = ({
  masterAngleDeg,
  firingOrder,
  onSeek,
  selectedCylinder,
}) => {
  const currentAngle = ((masterAngleDeg % 720) + 720) % 720;
  const playheadPercent = (currentAngle / 720) * 100;

  // Quad intervals (4 strokes of 180° = 720°)
  const quadrants = [
    { start: 0, end: 180, label: '0° – 180° (Stroke 1)', rev: 'Revolution 1' },
    { start: 180, end: 360, label: '180° – 360° (Stroke 2)', rev: 'Revolution 1' },
    { start: 360, end: 540, label: '360° – 540° (Stroke 3)', rev: 'Revolution 2' },
    { start: 540, end: 720, label: '540° – 720° (Stroke 4)', rev: 'Revolution 2' },
  ];

  // Helper to get stroke for each cylinder in each quadrant
  const getCylinderStrokeAt = (cyl: 1 | 2 | 3 | 4, angle: number): StrokeType => {
    let delay = 0;
    if (firingOrder === '1-3-4-2') {
      if (cyl === 1) delay = 0;
      if (cyl === 3) delay = 180;
      if (cyl === 4) delay = 360;
      if (cyl === 2) delay = 540;
    } else {
      if (cyl === 1) delay = 0;
      if (cyl === 2) delay = 180;
      if (cyl === 4) delay = 360;
      if (cyl === 3) delay = 540;
    }

    const cAngle = ((angle - delay) % 720 + 720) % 720;
    if (cAngle < 180) return 'power';
    if (cAngle < 360) return 'exhaust';
    if (cAngle < 540) return 'intake';
    return 'compression';
  };

  // Determine currently firing cylinder
  const activeFiringCyl =
    currentAngle < 180
      ? 1
      : currentAngle < 360
      ? (firingOrder === '1-3-4-2' ? 3 : 2)
      : currentAngle < 540
      ? 4
      : (firingOrder === '1-3-4-2' ? 2 : 3);

  const firingList = firingOrder === '1-3-4-2' ? [1, 3, 4, 2] : [1, 2, 4, 3];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl backdrop-blur-sm">
      {/* Header & Firing Sequence Callout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-wide">
              720° Four-Stroke Sequence & Firing Matrix
            </span>
            <span className="text-xs text-slate-400 font-mono">2 Full Crank Revolutions</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Every 180° of crankshaft rotation triggers a power stroke in a dedicated cylinder, providing continuous torque.
          </p>
        </div>

        {/* Firing Order Flow Badges */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono pr-1">Firing Flow:</span>
          {firingList.map((cyl, idx) => {
            const isCurrent = activeFiringCyl === cyl;
            return (
              <React.Fragment key={cyl}>
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${
                    isCurrent
                      ? 'bg-red-500/30 text-red-300 border border-red-500/50 shadow-sm shadow-red-500/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {isCurrent && <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-spin" />}
                  <span>Cyl {cyl}</span>
                </div>
                {idx < 3 && <ArrowRight className="w-3 h-3 text-slate-600" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 720° Interactive Gantt Timeline */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Angle Ruler Header */}
          <div className="grid grid-cols-4 gap-1 mb-2 text-xs font-mono text-slate-400">
            {quadrants.map((q) => (
              <div
                key={q.start}
                className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-300">{q.label}</span>
                  <span className="text-[10px] text-slate-500">{q.rev}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>{q.start}°</span>
                  <span>{q.end}°</span>
                </div>
              </div>
            ))}
          </div>

          {/* Matrix Body with 4 Cylinders Rows */}
          <div className="relative space-y-2 py-2">
            {/* Live Playhead Needle */}
            <div
              className="absolute top-0 bottom-0 z-20 w-0.5 bg-amber-400 shadow-[0_0_10px_#f59e0b] pointer-events-none transition-all duration-75"
              style={{ left: `${playheadPercent}%` }}
            >
              <div className="w-3 h-3 -translate-x-[5px] -top-1 bg-amber-400 rotate-45 shadow-md shadow-amber-500/50" />
            </div>

            {/* 4 Rows */}
            {([1, 2, 3, 4] as const).map((cylNum) => {
              const isSelected = selectedCylinder === cylNum;
              return (
                <div key={cylNum} className="flex items-center gap-2">
                  {/* Row Label */}
                  <div
                    className={`w-24 shrink-0 px-2 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-between border ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span>CYL #{cylNum}</span>
                    {cylNum === 1 || cylNum === 4 ? (
                      <span className="text-[9px] font-normal text-slate-500">Outer</span>
                    ) : (
                      <span className="text-[9px] font-normal text-slate-500">Inner</span>
                    )}
                  </div>

                  {/* 4 Quadrants for this Cylinder */}
                  <div className="grid grid-cols-4 gap-1.5 flex-1 h-10">
                    {quadrants.map((quad) => {
                      const stroke = getCylinderStrokeAt(cylNum, quad.start + 10);
                      const meta = STROKE_METAS[stroke];
                      const isPower = stroke === 'power';

                      return (
                        <button
                          key={quad.start}
                          onClick={() => onSeek(quad.start + 10)}
                          className={`relative h-full rounded-lg border text-left px-2.5 py-1.5 transition-all hover:brightness-125 flex items-center justify-between group ${meta.bgClass} ${meta.borderClass}`}
                        >
                          <div className="flex items-center gap-1.5">
                            {isPower && (
                              <Sparkles className="w-3 h-3 text-red-400 animate-pulse shrink-0" />
                            )}
                            <span
                              className={`text-[11px] font-semibold tracking-wide uppercase ${meta.textClass}`}
                            >
                              {stroke}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono text-slate-400 opacity-60 group-hover:opacity-100">
                            {meta.pistonDirection === 'down' ? '▼ TDC→BDC' : '▲ BDC→TDC'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Engineering Insight Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Continuous Torque Delivery:</strong> Because 720° / 4 cylinders = 180°, there is zero overlap gap between power strokes. One piston is always delivering mechanical drive.
          </span>
        </div>
        <span className="text-slate-500 font-mono text-[11px] whitespace-nowrap">
          Click any block to jump crank playhead
        </span>
      </div>
    </div>
  );
};
