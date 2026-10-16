import React from 'react';
import { FiringOrder } from '../types/engine';
import { ShieldCheck, GitCompare, Zap, Layers, RefreshCw } from 'lucide-react';

interface FiringOrderKinematicsProps {
  masterAngleDeg: number;
  firingOrder: FiringOrder;
  setFiringOrder: (order: FiringOrder) => void;
}

export const FiringOrderKinematics: React.FC<FiringOrderKinematicsProps> = ({
  masterAngleDeg,
  firingOrder,
  setFiringOrder,
}) => {
  const crankAngleNorm = ((masterAngleDeg % 360) + 360) % 360;
  const crankRad = (crankAngleNorm * Math.PI) / 180;

  // Crank throw positions on a 160x160 circular dial
  const cx = 80;
  const cy = 80;
  const r = 50;

  // Outer throws (Cyl 1 & 4)
  const x14 = cx + r * Math.sin(crankRad);
  const y14 = cy - r * Math.cos(crankRad);

  // Inner throws (Cyl 2 & 3) - 180° opposed
  const x23 = cx - r * Math.sin(crankRad);
  const y23 = cy + r * Math.cos(crankRad);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl backdrop-blur-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <span className="text-sm font-bold text-white tracking-wide">
            Crankshaft Kinematics, Mechanical Balance & Firing Order
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            Why inline-4 engines use a 180° flat-plane crankshaft and alternate firing sequence 1-3-4-2.
          </p>
        </div>

        {/* Firing Order Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFiringOrder('1-3-4-2')}
            className={`px-3 py-1 rounded-lg font-mono font-bold transition-all ${
              firingOrder === '1-3-4-2'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1-3-4-2 (Industry Standard)
          </button>
          <button
            onClick={() => setFiringOrder('1-2-4-3')}
            className={`px-3 py-1 rounded-lg font-mono font-bold transition-all ${
              firingOrder === '1-2-4-3'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1-2-4-3 (Alternative)
          </button>
        </div>
      </div>

      {/* Main Grid: Rotating Crank Throw Dial + 3 Core Engineering Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Rotating Crankshaft Throw Visualizer (4 cols) */}
        <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
          <span className="text-xs font-bold text-slate-300 mb-1 font-mono">
            Flat-Plane Crankshaft (Front View)
          </span>
          <span className="text-[11px] text-slate-500 mb-3 font-mono">
            180° Opposed Throw Geometry
          </span>

          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg viewBox="0 0 160 160" className="w-full h-full select-none">
              {/* Crankcase Bore Outline */}
              <circle cx={cx} cy={cy} r="65" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
              <circle cx={cx} cy={cy} r="50" fill="none" stroke="#1e293b" strokeDasharray="3 3" />

              {/* TDC & BDC Markers */}
              <text x={cx - 10} y="22" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">
                TDC 0°
              </text>
              <text x={cx - 10} y="150" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">
                BDC 180°
              </text>

              {/* Main Crank Web Connecting Throw 1&4 to Throw 2&3 */}
              <line
                x1={x14}
                y1={y14}
                x2={x23}
                y2={y23}
                stroke="#64748b"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <line
                x1={x14}
                y1={y14}
                x2={x23}
                y2={y23}
                stroke="#94a3b8"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Center Main Journal */}
              <circle cx={cx} cy={cy} r="14" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
              <circle cx={cx} cy={cy} r="4" fill="#38bdf8" />

              {/* Outer Throws (Cyl 1 & 4) */}
              <circle cx={x14} cy={y14} r="10" fill="#f8fafc" stroke="#ef4444" strokeWidth="2.5" />
              <text x={x14 - 6} y={y14 + 3} fill="#0f172a" fontSize="8" fontFamily="monospace" fontWeight="bold">
                1&4
              </text>

              {/* Inner Throws (Cyl 2 & 3) */}
              <circle cx={x23} cy={y23} r="10" fill="#fef08a" stroke="#f59e0b" strokeWidth="2.5" />
              <text x={x23 - 6} y={y23 + 3} fill="#0f172a" fontSize="8" fontFamily="monospace" fontWeight="bold">
                2&3
              </text>
            </svg>
          </div>

          <div className="w-full mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="bg-slate-900 rounded p-1.5 border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">Cylinders 1 & 4</span>
              <span className="text-white font-bold">{Math.round(crankAngleNorm)}°</span>
            </div>
            <div className="bg-slate-900 rounded p-1.5 border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">Cylinders 2 & 3</span>
              <span className="text-amber-400 font-bold">{Math.round((crankAngleNorm + 180) % 360)}°</span>
            </div>
          </div>
        </div>

        {/* Right: 3 Core Engineering Principles (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Principle 1: Why Pair 1 & 4, and 2 & 3? */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                1. Perfect Primary Reciprocating Balance
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When Pistons 1 & 4 ascend upward toward TDC, Pistons 2 & 3 descend downward toward BDC with equal mass and velocity.
              Their first-order inertia forces (F_primary = m · r · ω² cos θ) cancel each other out completely.
              Furthermore, because the arrangement is symmetric around the engine center (Piston 1 mirrors 4, Piston 2 mirrors 3), there is zero end-to-end rocking couple!
            </p>
          </div>

          {/* Principle 2: Why Firing Order 1-3-4-2? */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                2. Torsional Load Distribution & Manifold Scavenging
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In a flat-plane crankshaft, firing order <strong className="text-amber-300 font-mono">1 → 3 → 4 → 2</strong> alternates combustion pressure evenly between the front half (Cyl 1, 2) and rear half (Cyl 3, 4) of the engine block.
              If an engine fired 1 → 2 → 3 → 4, the front crank bearings would suffer violent consecutive torque shocks, twisting the crankshaft into resonance and causing uneven air starvation in the intake plenum.
            </p>
          </div>

          {/* Principle 3: The Secondary Vibration Quirk */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Layers className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                3. Secondary Vibration & Lanchester Balance Shafts
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Due to connecting rod angularity ($\lambda = r/l$), a piston travels faster near TDC than near BDC.
              Consequently, Pistons 1 & 4 accelerate upward faster than Pistons 2 & 3 accelerate downward.
              This creates a secondary upward/downward force oscillation at twice engine speed ($2\omega$).
              Inline-4 engines larger than ~2.4 liters incorporate twin counter-rotating balance shafts spinning at $2\times$ engine RPM to cancel this vibration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
