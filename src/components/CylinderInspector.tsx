import React, { useState } from 'react';
import { CylinderState, STROKE_METAS } from '../types/engine';
import { DEFAULT_ENGINE_SPECS, getIdealOttoCyclePoints } from '../utils/enginePhysics';
import { Info, Gauge, Flame, Wind, Activity, Zap } from 'lucide-react';

interface CylinderInspectorProps {
  cylinderState: CylinderState;
  rpm: number;
  onSelectCylinder: (cylNum: number) => void;
}

export const CylinderInspector: React.FC<CylinderInspectorProps> = ({
  cylinderState,
  rpm,
  onSelectCylinder,
}) => {
  const [activePartInfo, setActivePartInfo] = useState<string | null>(null);

  const cyl = cylinderState;
  const meta = STROKE_METAS[cyl.stroke];
  const specs = DEFAULT_ENGINE_SPECS;

  // Piston linear speed v in m/s: (2 * strokeMm / 1000) * (rpm / 60) * factor
  const meanPistonSpeedMs = ((2 * (specs.strokeMm / 1000) * rpm) / 60).toFixed(2);
  const currentSpeedMs = (Number(meanPistonSpeedMs) * Math.abs(cyl.pistonVelocity)).toFixed(2);

  // Pressure in psi
  const pressurePsi = Math.round(cyl.pressureBar * 14.5038);
  const tempF = Math.round((cyl.tempCelsius * 9) / 5 + 32);

  // Otto Cycle Graph Calculations
  const otto = getIdealOttoCyclePoints(specs);
  const graphWidth = 320;
  const graphHeight = 200;
  const padding = 35;

  const vScale = (v: number) => {
    const minV = specs.clearanceVolumeCc;
    const maxV = specs.clearanceVolumeCc + specs.displacementCc / 4;
    return padding + ((v - minV) / (maxV - minV)) * (graphWidth - 2 * padding);
  };

  const pScale = (p: number) => {
    const minP = 0;
    const maxP = 70;
    return (
      graphHeight -
      padding -
      ((p - minP) / (maxP - minP)) * (graphHeight - 2 * padding)
    );
  };

  // Interactive component dictionary
  const partDescriptions: Record<string, { title: string; desc: string }> = {
    sparkPlug: {
      title: 'Spark Plug & Electrode',
      desc: 'Ignites the compressed air-fuel mixture with an 8,000–25,000 volt electric spark across a 0.8–1.1mm electrode gap at precisely timed ignition advance.',
    },
    intakeValve: {
      title: 'Intake Valve & Runner',
      desc: 'Poppet valve operated by the overhead intake camshaft. Opens during the intake stroke to admit atomized fuel and air charge into the vacuumed cylinder.',
    },
    exhaustValve: {
      title: 'Exhaust Valve & Runner',
      desc: 'Heat-resistant sodium-filled poppet valve. Opens during the exhaust stroke to vent superheated spent combustion gases into the exhaust manifold.',
    },
    pistonCrown: {
      title: 'Piston Crown & Combustion Chamber',
      desc: 'Specially contoured aluminum alloy crown engineered with valve relief pockets to form the compact pent-roof combustion chamber promoting fast flame travel.',
    },
    pistonRings: {
      title: 'Piston Rings (Set of 3)',
      desc: 'Top compression ring seals high-pressure combustion gas, second scraper ring manages cylinder oil film and pressure, bottom oil control ring regulates lubrication.',
    },
    wristPin: {
      title: 'Wrist Pin (Gudgeon Pin)',
      desc: 'Case-hardened steel pin connecting the piston to the small-end eye of the connecting rod, allowing high-speed angular pivoting.',
    },
    conRod: {
      title: 'Forged I-Beam Connecting Rod',
      desc: 'Translates high-load reciprocating linear thrust of the piston into rotating mechanical torque at the crankshaft pin.',
    },
    crankJournal: {
      title: 'Crankshaft Pin & Counterweight',
      desc: 'Precision balanced rotating crank throw with hydrodynamic pressurized oil film bearings and counterweights counteracting piston reciprocating mass.',
    },
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl backdrop-blur-sm">
      {/* Header with Cylinder Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-wide">
              Single-Cylinder Telemetry & Component Deep-Dive
            </span>
            <span className="text-xs text-slate-400 font-mono">Cylinder #{cyl.cylinderNumber}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time thermodynamic states, component anatomy callouts, and live Otto cycle indicator loop.
          </p>
        </div>

        {/* Cylinder Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {([1, 2, 3, 4] as const).map((num) => (
            <button
              key={num}
              onClick={() => onSelectCylinder(num)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                cyl.cylinderNumber === num
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cyl {num}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Anatomy Callout Map (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span className="font-semibold text-slate-300">Cylinder Cutaway Anatomy</span>
            <span>Hover or click parts to inspect</span>
          </div>

          {/* Anatomy Button Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(partDescriptions).map(([key, data]) => (
              <button
                key={key}
                onMouseEnter={() => setActivePartInfo(key)}
                onClick={() => setActivePartInfo(key)}
                className={`text-left p-2 rounded-xl border transition-all ${
                  activePartInfo === key
                    ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="font-medium text-slate-200 text-[11px] truncate">{data.title}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">Component callout</div>
              </button>
            ))}
          </div>

          {/* Active Part Detail Box */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 mt-1 min-h-[90px] flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-amber-300">
                {activePartInfo ? partDescriptions[activePartInfo].title : 'Interactive Component Inspector'}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {activePartInfo
                  ? partDescriptions[activePartInfo].desc
                  : 'Select any engine component above to learn how it survives extreme combustion heat, dynamic inertia, and gas sealing.'}
              </p>
            </div>
          </div>

          {/* Stroke Physics Summary */}
          <div className={`rounded-xl border p-3.5 ${meta.bgClass} ${meta.borderClass}`}>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${meta.textClass}`}>
                Current: {meta.name}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{meta.summary}</p>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{meta.valveStatus}</span>
              <span>Lift: {cyl.stroke === 'intake' ? `${(cyl.intakeValveLift * 10).toFixed(1)}mm` : cyl.stroke === 'exhaust' ? `${(cyl.exhaustValveLift * 10).toFixed(1)}mm` : '0.0mm (Sealed)'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Thermodynamic Telemetry & P-V Otto Diagram (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Pressure */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">
                Pressure
              </span>
              <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5 tabular-nums">
                {cyl.pressureBar.toFixed(1)}{' '}
                <span className="text-xs text-slate-400 font-normal">bar</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                {pressurePsi} psi
              </span>
            </div>

            {/* Temperature */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">
                Gas Temp
              </span>
              <div className="text-base sm:text-lg font-bold font-mono text-amber-400 mt-0.5 tabular-nums">
                {cyl.tempCelsius}° <span className="text-xs text-slate-400 font-normal">C</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                {tempF}° F
              </span>
            </div>

            {/* Chamber Volume */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">
                Gas Volume
              </span>
              <div className="text-base sm:text-lg font-bold font-mono text-sky-400 mt-0.5 tabular-nums">
                {cyl.gasVolumeCc.toFixed(1)}{' '}
                <span className="text-xs text-slate-400 font-normal">cc</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                Ratio {specs.compressionRatio}:1
              </span>
            </div>

            {/* Piston Speed */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">
                Piston Speed
              </span>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
                {currentSpeedMs}{' '}
                <span className="text-xs text-slate-400 font-normal">m/s</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                Mean: {meanPistonSpeedMs} m/s
              </span>
            </div>
          </div>

          {/* Live P-V Indicator (Pressure vs Volume) Diagram */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  Thermodynamic P-V Indicator Diagram (Otto Cycle)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Live operating point: ({cyl.gasVolumeCc.toFixed(0)} cc, {cyl.pressureBar.toFixed(1)} bar)
              </span>
            </div>

            <div className="relative w-full aspect-[320/190] overflow-hidden bg-slate-950 rounded-lg border border-slate-900">
              <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full select-none">
                {/* Axes */}
                <line
                  x1={padding}
                  y1={graphHeight - padding}
                  x2={graphWidth - 10}
                  y2={graphHeight - padding}
                  stroke="#475569"
                  strokeWidth="1.5"
                />
                <line
                  x1={padding}
                  y1={10}
                  x2={padding}
                  y2={graphHeight - padding}
                  stroke="#475569"
                  strokeWidth="1.5"
                />

                {/* Axis Labels */}
                <text
                  x={graphWidth - 30}
                  y={graphHeight - padding + 18}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  Volume V
                </text>
                <text
                  x="6"
                  y="20"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                  transform="rotate(-90 12,20)"
                >
                  Pressure P
                </text>

                {/* Grid guidelines */}
                <line
                  x1={vScale(otto.state2.v)}
                  y1={15}
                  x2={vScale(otto.state2.v)}
                  y2={graphHeight - padding}
                  stroke="#334155"
                  strokeDasharray="2 2"
                  strokeWidth="0.8"
                />
                <text
                  x={vScale(otto.state2.v) - 12}
                  y={graphHeight - padding + 14}
                  fill="#64748b"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  TDC (Vc)
                </text>

                <line
                  x1={vScale(otto.state1.v)}
                  y1={15}
                  x2={vScale(otto.state1.v)}
                  y2={graphHeight - padding}
                  stroke="#334155"
                  strokeDasharray="2 2"
                  strokeWidth="0.8"
                />
                <text
                  x={vScale(otto.state1.v) - 14}
                  y={graphHeight - padding + 14}
                  fill="#64748b"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  BDC (Vmax)
                </text>

                {/* Otto Cycle Theoretical Curve */}
                {/* 1 -> 2: Compression (Vmax -> Vc, P1 -> P2) */}
                <path
                  d={`M ${vScale(otto.state1.v)} ${pScale(otto.state1.p)} Q ${vScale(
                    (otto.state1.v + otto.state2.v) / 2
                  )} ${pScale(3.5)} ${vScale(otto.state2.v)} ${pScale(otto.state2.p)}`}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                />

                {/* 2 -> 3: Isochoric Combustion (P2 -> P3 at Vc) */}
                <line
                  x1={vScale(otto.state2.v)}
                  y1={pScale(otto.state2.p)}
                  x2={vScale(otto.state3.v)}
                  y2={pScale(otto.state3.p)}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                />

                {/* 3 -> 4: Expansion Power (Vc -> Vmax, P3 -> P4) */}
                <path
                  d={`M ${vScale(otto.state3.v)} ${pScale(otto.state3.p)} Q ${vScale(
                    (otto.state1.v + otto.state2.v) / 2
                  )} ${pScale(15)} ${vScale(otto.state4.v)} ${pScale(otto.state4.p)}`}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                />

                {/* 4 -> 1: Blowdown Exhaust (P4 -> P1 at Vmax) */}
                <line
                  x1={vScale(otto.state4.v)}
                  y1={pScale(otto.state4.p)}
                  x2={vScale(otto.state1.v)}
                  y2={pScale(otto.state1.p)}
                  stroke="#a855f7"
                  strokeWidth="2"
                />

                {/* Cycle Point Numbers */}
                <text x={vScale(otto.state1.v) + 4} y={pScale(otto.state1.p) + 4} fill="#94a3b8" fontSize="9" fontFamily="monospace">1</text>
                <text x={vScale(otto.state2.v) - 10} y={pScale(otto.state2.p)} fill="#d97706" fontSize="9" fontFamily="monospace">2</text>
                <text x={vScale(otto.state3.v) - 10} y={pScale(otto.state3.p) + 4} fill="#ef4444" fontSize="9" fontFamily="monospace">3</text>
                <text x={vScale(otto.state4.v) + 4} y={pScale(otto.state4.p) - 2} fill="#a855f7" fontSize="9" fontFamily="monospace">4</text>

                {/* Live Cylinder Coordinate Tracking Marker */}
                <circle
                  cx={vScale(cyl.gasVolumeCc)}
                  cy={pScale(cyl.pressureBar)}
                  r="7"
                  fill="#ffffff"
                  stroke={meta.color}
                  strokeWidth="3"
                  className="animate-pulse"
                />
                <circle
                  cx={vScale(cyl.gasVolumeCc)}
                  cy={pScale(cyl.pressureBar)}
                  r="14"
                  fill="none"
                  stroke={meta.color}
                  strokeWidth="1"
                  opacity="0.5"
                />
              </svg>
            </div>

            {/* P-V Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-amber-500 inline-block" />
                1→2: Compression
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-red-500 inline-block" />
                2→3: Ignition (Qin)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-orange-500 inline-block" />
                3→4: Power Stroke
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-purple-500 inline-block" />
                4→1: Exhaust Blowdown
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
