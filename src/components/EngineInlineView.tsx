import React from 'react';
import { CylinderState, STROKE_METAS } from '../types/engine';
import { ArrowDown, ArrowUp, Flame, Wind, Gauge, Sparkles } from 'lucide-react';

interface EngineInlineViewProps {
  cylinderStates: CylinderState[];
  selectedCylinder: number;
  onSelectCylinder: (cylNum: number) => void;
  masterAngleDeg: number;
}

export const EngineInlineView: React.FC<EngineInlineViewProps> = ({
  cylinderStates,
  selectedCylinder,
  onSelectCylinder,
  masterAngleDeg,
}) => {
  // SVG Dimensions per cylinder
  const cylWidth = 230;
  const cylHeight = 440;
  const strokeTravelPx = 70; // piston stroke visual travel
  const tdcY = 110; // piston crown Y at TDC
  const rodLengthPx = 135;
  const crankRadiusPx = strokeTravelPx / 2; // 35px
  const crankCenterY = tdcY + strokeTravelPx + rodLengthPx; // 110 + 70 + 135 = 315

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl backdrop-blur-sm">
      {/* Block Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-wide">Inline-4 Engine Block</span>
            <span className="text-xs text-slate-400 font-mono">180° Flat-Plane Crankshaft</span>
          </div>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400">Click any cylinder to inspect in deep-dive</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <span className="flex items-center gap-1.5 text-sky-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" />
            Intake
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
            Compression
          </span>
          <span className="flex items-center gap-1.5 text-red-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
            Power (Ignition)
          </span>
          <span className="flex items-center gap-1.5 text-purple-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" />
            Exhaust
          </span>
        </div>
      </div>

      {/* 4 Cylinders Horizontal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cylinderStates.map((cyl) => {
          const meta = STROKE_METAS[cyl.stroke];
          const isSelected = selectedCylinder === cyl.cylinderNumber;

          // Kinematic coordinates for this cylinder
          const pistonCurrentY = tdcY + cyl.pistonY * strokeTravelPx;
          const wristPinY = pistonCurrentY + 36;
          const wristPinX = cylWidth / 2;

          // Crankpin position:
          // crankThrowAngleDeg is angle from top (0 = top, 180 = bottom)
          const crankRad = (cyl.crankThrowAngleDeg * Math.PI) / 180;
          const crankPinX = wristPinX + crankRadiusPx * Math.sin(crankRad);
          const crankPinY = crankCenterY - crankRadiusPx * Math.cos(crankRad);

          // Valve lifts in pixels (max 12px)
          const intakeLiftPx = cyl.intakeValveLift * 12;
          const exhaustLiftPx = cyl.exhaustValveLift * 12;

          return (
            <div
              key={cyl.cylinderNumber}
              onClick={() => onSelectCylinder(cyl.cylinderNumber)}
              className={`relative cursor-pointer transition-all duration-200 rounded-xl border p-3 flex flex-col bg-slate-950/80 hover:border-slate-600 ${
                isSelected
                  ? 'border-amber-500/80 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10'
                  : 'border-slate-800/80'
              }`}
            >
              {/* Cylinder Info Badge Header */}
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/70">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-300">
                    CYL #{cyl.cylinderNumber}
                  </span>
                  {cyl.isSparking && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/30 px-1.5 py-0.5 rounded animate-pulse">
                      <Sparkles className="w-2.5 h-2.5" /> SPARK
                    </span>
                  )}
                </div>

                {/* Stroke Badge */}
                <div
                  className={`text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded border ${meta.bgClass} ${meta.textClass} ${meta.borderClass} flex items-center gap-1`}
                >
                  {cyl.stroke === 'power' && <Flame className="w-3 h-3 animate-bounce" />}
                  {cyl.stroke === 'intake' && <Wind className="w-3 h-3" />}
                  <span>{cyl.stroke}</span>
                </div>
              </div>

              {/* Sub-bar: Direction & Pressure */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-mono">
                <span className="flex items-center gap-1">
                  {cyl.pistonVelocity >= 0 ? (
                    <>
                      <ArrowDown className="w-3 h-3 text-sky-400" />
                      <span>Desc (TDC→BDC)</span>
                    </>
                  ) : (
                    <>
                      <ArrowUp className="w-3 h-3 text-amber-400" />
                      <span>Asc (BDC→TDC)</span>
                    </>
                  )}
                </span>
                <span className="text-slate-300 font-semibold">{cyl.pressureBar.toFixed(1)} bar</span>
              </div>

              {/* Cross-Section Graphic */}
              <div className="relative w-full aspect-[230/420] overflow-hidden rounded-lg bg-slate-950 border border-slate-900 flex items-center justify-center">
                <svg
                  viewBox={`0 0 ${cylWidth} ${cylHeight}`}
                  className="w-full h-full select-none"
                  style={{ willChange: 'transform' }}
                >
                  <defs>
                    {/* Metal cylinder wall gradient */}
                    <linearGradient id={`wallGrad-${cyl.cylinderNumber}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#334155" />
                      <stop offset="25%" stopColor="#64748b" />
                      <stop offset="50%" stopColor="#475569" />
                      <stop offset="75%" stopColor="#64748b" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>

                    {/* Piston Metal Gradient */}
                    <linearGradient id={`pistonGrad-${cyl.cylinderNumber}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#475569" />
                      <stop offset="20%" stopColor="#94a3b8" />
                      <stop offset="50%" stopColor="#cbd5e1" />
                      <stop offset="80%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#334155" />
                    </linearGradient>

                    {/* Con-rod Gradient */}
                    <linearGradient id={`rodGrad-${cyl.cylinderNumber}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#475569" />
                      <stop offset="50%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#334155" />
                    </linearGradient>

                    {/* Combustion Glow Gradient */}
                    <radialGradient
                      id={`fireGlow-${cyl.cylinderNumber}`}
                      cx="50%"
                      cy="20%"
                      r="65%"
                      fx="50%"
                      fy="15%"
                    >
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                      <stop offset="20%" stopColor="#fef08a" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="#f97316" stopOpacity="0.8" />
                      <stop offset="85%" stopColor="#dc2626" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#450a0a" stopOpacity="0.1" />
                    </radialGradient>

                    {/* Intake Air-Fuel Mist Gradient */}
                    <radialGradient
                      id={`intakeMist-${cyl.cylinderNumber}`}
                      cx="35%"
                      cy="20%"
                      r="70%"
                    >
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
                      <stop offset="50%" stopColor="#0284c7" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#0369a1" stopOpacity="0.05" />
                    </radialGradient>

                    {/* Compression Gradient */}
                    <linearGradient id={`compGrad-${cyl.cylinderNumber}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.75" />
                      <stop offset="100%" stopColor="#d97706" stopOpacity="0.3" />
                    </linearGradient>

                    {/* Exhaust Smoke Gradient */}
                    <radialGradient
                      id={`exhaustSmoke-${cyl.cylinderNumber}`}
                      cx="65%"
                      cy="25%"
                      r="65%"
                    >
                      <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
                      <stop offset="40%" stopColor="#71717a" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#3f3f46" stopOpacity="0.1" />
                    </radialGradient>
                  </defs>

                  {/* 1. Cylinder Block Walls & Head */}
                  {/* Left Cylinder Wall */}
                  <rect x="25" y="70" width="22" height="150" fill={`url(#wallGrad-${cyl.cylinderNumber})`} />
                  {/* Right Cylinder Wall */}
                  <rect x="183" y="70" width="22" height="150" fill={`url(#wallGrad-${cyl.cylinderNumber})`} />

                  {/* Cylinder Head Deck */}
                  <path
                    d="M 25 70 L 47 70 L 60 45 L 170 45 L 183 70 L 205 70 L 205 35 L 25 35 Z"
                    fill="#334155"
                    stroke="#1e293b"
                    strokeWidth="1"
                  />

                  {/* Intake Port (Left) */}
                  <path
                    d="M 0 32 Q 40 32 68 52 L 64 64 Q 35 48 0 48 Z"
                    fill={cyl.stroke === 'intake' ? '#0284c7' : '#1e293b'}
                    opacity={cyl.stroke === 'intake' ? 0.8 : 0.5}
                    stroke="#38bdf8"
                    strokeWidth={cyl.stroke === 'intake' ? 1.5 : 0.5}
                  />

                  {/* Exhaust Port (Right) */}
                  <path
                    d="M 230 32 Q 190 32 162 52 L 166 64 Q 195 48 230 48 Z"
                    fill={cyl.stroke === 'exhaust' ? '#9333ea' : '#1e293b'}
                    opacity={cyl.stroke === 'exhaust' ? 0.8 : 0.5}
                    stroke="#c084fc"
                    strokeWidth={cyl.stroke === 'exhaust' ? 1.5 : 0.5}
                  />

                  {/* Water Jacket Channels (Cooling) */}
                  <rect x="8" y="90" width="10" height="90" rx="3" fill="#0284c7" opacity="0.35" />
                  <rect x="212" y="90" width="10" height="90" rx="3" fill="#0284c7" opacity="0.35" />

                  {/* 2. Combustion Chamber Atmosphere (Between Head and Piston Crown) */}
                  <path
                    d={`M 47 70 L 60 52 L 170 52 L 183 70 L 183 ${pistonCurrentY} L 47 ${pistonCurrentY} Z`}
                    fill={
                      cyl.stroke === 'power'
                        ? `url(#fireGlow-${cyl.cylinderNumber})`
                        : cyl.stroke === 'intake'
                        ? `url(#intakeMist-${cyl.cylinderNumber})`
                        : cyl.stroke === 'compression'
                        ? `url(#compGrad-${cyl.cylinderNumber})`
                        : `url(#exhaustSmoke-${cyl.cylinderNumber})`
                    }
                  />

                  {/* Air-Fuel Inflow Arrows or Bursts */}
                  {cyl.stroke === 'intake' && (
                    <g className="animate-pulse">
                      <path
                        d="M 20 40 Q 55 42 70 65"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        strokeDasharray="4 2"
                      />
                      <circle cx="85" cy="80" r="3" fill="#7dd3fc" />
                      <circle cx="105" cy="90" r="2.5" fill="#bae6fd" />
                      <circle cx="125" cy="82" r="3" fill="#7dd3fc" />
                    </g>
                  )}

                  {/* Exhaust Outflow Arrows */}
                  {cyl.stroke === 'exhaust' && (
                    <g className="animate-pulse">
                      <path
                        d="M 160 65 Q 175 42 210 40"
                        fill="none"
                        stroke="#c084fc"
                        strokeWidth="3"
                        strokeDasharray="4 2"
                      />
                      <circle cx="150" cy="78" r="3" fill="#e9d5ff" />
                      <circle cx="130" cy="88" r="2.5" fill="#d8b4fe" />
                    </g>
                  )}

                  {/* Fire Explosion FX on Power */}
                  {cyl.stroke === 'power' && (
                    <g>
                      <circle
                        cx={cylWidth / 2}
                        cy="60"
                        r={Math.min(35, 12 + cyl.strokeProgress * 30)}
                        fill="none"
                        stroke="#fef08a"
                        strokeWidth="2"
                        opacity={Math.max(0, 1 - cyl.strokeProgress)}
                      />
                    </g>
                  )}

                  {/* 3. Valves (Intake left, Exhaust right) */}
                  {/* Intake Valve Shaft and Head */}
                  <g transform={`translate(0, ${intakeLiftPx})`}>
                    {/* Valve Stem */}
                    <rect x="73" y="10" width="5" height="42" fill="#cbd5e1" />
                    {/* Valve Head (Angle seated) */}
                    <polygon points="62,52 89,52 82,47 69,47" fill="#f8fafc" stroke="#64748b" strokeWidth="0.5" />
                    {/* Valve Spring */}
                    <path
                      d="M 70 20 L 81 23 L 70 26 L 81 29 L 70 32 L 81 35 L 70 38"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                    />
                  </g>

                  {/* Exhaust Valve Shaft and Head */}
                  <g transform={`translate(0, ${exhaustLiftPx})`}>
                    {/* Valve Stem */}
                    <rect x="152" y="10" width="5" height="42" fill="#cbd5e1" />
                    {/* Valve Head */}
                    <polygon points="141,52 168,52 161,47 148,47" fill="#f8fafc" stroke="#64748b" strokeWidth="0.5" />
                    {/* Valve Spring */}
                    <path
                      d="M 149 20 L 160 23 L 149 26 L 160 29 L 149 32 L 160 35 L 149 38"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                    />
                  </g>

                  {/* 4. Overhead Cam Lobes */}
                  {/* Intake Cam */}
                  <circle cx="75.5" cy="10" r="10" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
                  <path
                    d={`M 75.5 10 L ${75.5 + 7 * Math.cos(cyl.intakeValveLift * Math.PI)} ${
                      10 + 7 * Math.sin(cyl.intakeValveLift * Math.PI)
                    }`}
                    stroke="#f8fafc"
                    strokeWidth="3"
                  />

                  {/* Exhaust Cam */}
                  <circle cx="154.5" cy="10" r="10" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
                  <path
                    d={`M 154.5 10 L ${154.5 + 7 * Math.cos(cyl.exhaustValveLift * Math.PI)} ${
                      10 + 7 * Math.sin(cyl.exhaustValveLift * Math.PI)
                    }`}
                    stroke="#f8fafc"
                    strokeWidth="3"
                  />

                  {/* 5. Spark Plug at Chamber Dome (Center) */}
                  <rect x="110" y="8" width="10" height="24" fill="#e2e8f0" stroke="#475569" strokeWidth="0.5" />
                  <rect x="108" y="32" width="14" height="12" fill="#64748b" stroke="#334155" strokeWidth="0.5" />
                  {/* Ceramic Ribs */}
                  <line x1="108" y1="14" x2="122" y2="14" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="108" y1="20" x2="122" y2="20" stroke="#94a3b8" strokeWidth="1" />
                  {/* Spark Electrode */}
                  <line x1="115" y1="44" x2="115" y2="52" stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1="118" y1="50" x2="115" y2="50" stroke="#cbd5e1" strokeWidth="1.5" />

                  {/* Electric Spark Flash */}
                  {cyl.isSparking && (
                    <g>
                      <circle cx="115" cy="51" r="9" fill="#fef08a" opacity="0.9" />
                      <circle cx="115" cy="51" r="16" fill="#38bdf8" opacity="0.4" />
                      <path
                        d="M 113 49 L 115 52 L 114 53 L 116 55"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    </g>
                  )}

                  {/* 6. Piston Body */}
                  <g transform={`translate(0, ${pistonCurrentY - tdcY})`}>
                    {/* Crown */}
                    <rect
                      x="48"
                      y={tdcY}
                      width="134"
                      height="46"
                      rx="3"
                      fill={`url(#pistonGrad-${cyl.cylinderNumber})`}
                      stroke="#1e293b"
                      strokeWidth="1"
                    />

                    {/* Valve Reliefs on Crown */}
                    <path d="M 64 110 Q 75 113 86 110" fill="none" stroke="#475569" strokeWidth="1.5" />
                    <path d="M 144 110 Q 155 113 166 110" fill="none" stroke="#475569" strokeWidth="1.5" />

                    {/* 3 Piston Rings */}
                    <line x1="48" y1={tdcY + 7} x2="182" y2={tdcY + 7} stroke="#0f172a" strokeWidth="1.5" />
                    <line x1="48" y1={tdcY + 13} x2="182" y2={tdcY + 13} stroke="#0f172a" strokeWidth="1.5" />
                    <line x1="48" y1={tdcY + 19} x2="182" y2={tdcY + 19} stroke="#0f172a" strokeWidth="1.5" />

                    {/* Piston Skirt Cutout */}
                    <rect
                      x="54"
                      y={tdcY + 44}
                      width="122"
                      height="20"
                      fill="#334155"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />

                    {/* Wrist Pin */}
                    <circle cx={wristPinX} cy={tdcY + 36} r="10" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
                    <circle cx={wristPinX} cy={tdcY + 36} r="5" fill="#475569" />
                  </g>

                  {/* 7. Connecting Rod */}
                  {/* Con-rod drawn dynamically from wrist pin to crankpin */}
                  <g>
                    {/* Outer Rod Beam */}
                    <line
                      x1={wristPinX}
                      y1={wristPinY}
                      x2={crankPinX}
                      y2={crankPinY}
                      stroke={`url(#rodGrad-${cyl.cylinderNumber})`}
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    {/* Rod I-beam inner groove */}
                    <line
                      x1={wristPinX}
                      y1={wristPinY}
                      x2={crankPinX}
                      y2={crankPinY}
                      stroke="#1e293b"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />

                    {/* Small End Eye (Wrist Pin) */}
                    <circle cx={wristPinX} cy={wristPinY} r="12" fill="none" stroke="#64748b" strokeWidth="3" />

                    {/* Big End Rod Journal / Cap */}
                    <circle cx={crankPinX} cy={crankPinY} r="14" fill="#64748b" stroke="#334155" strokeWidth="2" />
                    <circle cx={crankPinX} cy={crankPinY} r="7" fill="#cbd5e1" />
                  </g>

                  {/* 8. Crankcase & Crankshaft Counterweight */}
                  {/* Crankcase Outline */}
                  <path
                    d={`M 30 ${crankCenterY - 45} Q 15 ${crankCenterY} 30 ${crankCenterY + 45} L 200 ${
                      crankCenterY + 45
                    } Q 215 ${crankCenterY} 200 ${crankCenterY - 45} Z`}
                    fill="none"
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    opacity="0.6"
                  />

                  {/* Rotating Counterweight Web */}
                  <g transform={`rotate(${cyl.crankThrowAngleDeg}, ${wristPinX}, ${crankCenterY})`}>
                    {/* Crank Throw Arm */}
                    <rect x={wristPinX - 10} y={crankCenterY - crankRadiusPx - 4} width="20" height="42" rx="5" fill="#475569" stroke="#64748b" strokeWidth="1" />
                    {/* Counterweight (Opposite side) */}
                    <path
                      d={`M ${wristPinX - 35} ${crankCenterY + 10} A 40 40 0 0 0 ${wristPinX + 35} ${
                        crankCenterY + 10
                      } L ${wristPinX + 18} ${crankCenterY} L ${wristPinX - 18} ${crankCenterY} Z`}
                      fill="#334155"
                      stroke="#64748b"
                      strokeWidth="1.5"
                    />
                  </g>

                  {/* Main Crankshaft Center Journal */}
                  <circle cx={wristPinX} cy={crankCenterY} r="12" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                  <circle cx={wristPinX} cy={crankCenterY} r="4" fill="#94a3b8" />

                  {/* TDC / BDC Reference Lines */}
                  <line x1="28" y1={tdcY} x2="44" y2={tdcY} stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
                  <text x="5" y={tdcY + 3} fill="#ef4444" fontSize="8" fontFamily="monospace">TDC</text>

                  <line x1="28" y1={tdcY + strokeTravelPx} x2="44" y2={tdcY + strokeTravelPx} stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
                  <text x="5" y={tdcY + strokeTravelPx + 3} fill="#38bdf8" fontSize="8" fontFamily="monospace">BDC</text>
                </svg>
              </div>

              {/* Bottom Quick Metric Card */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-900/90 rounded px-2 py-1.5 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Crank Angle</span>
                  <span className="text-white font-semibold">{Math.round(cyl.crankThrowAngleDeg)}°</span>
                </div>
                <div className="bg-slate-900/90 rounded px-2 py-1.5 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Temp</span>
                  <span className="text-amber-400 font-semibold">{cyl.tempCelsius}°C</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
