import React, { useState } from 'react';
import { StrokeType, STROKE_METAS } from '../types/engine';
import { Wind, Flame, Compass, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';

interface StrokeExplanationDeckProps {
  onJumpToStroke: (stroke: StrokeType) => void;
  currentStrokes: StrokeType[];
}

export const StrokeExplanationDeck: React.FC<StrokeExplanationDeckProps> = ({
  onJumpToStroke,
  currentStrokes,
}) => {
  const [selectedStroke, setSelectedStroke] = useState<StrokeType>('intake');

  const strokeDetails: Record<
    StrokeType,
    {
      title: string;
      kicker: string;
      crankDegrees: string;
      pistonMotion: string;
      intakeValve: string;
      exhaustValve: string;
      pressureRange: string;
      tempRange: string;
      physicsPrinciple: string;
      deepExplanation: string[];
      engineeringNotes: string;
    }
  > = {
    intake: {
      title: 'Intake Stroke',
      kicker: 'Induction & Cylinder Charging',
      crankDegrees: '0° to 180° (Stroke 1)',
      pistonMotion: 'Top Dead Center (TDC) → Bottom Dead Center (BDC)',
      intakeValve: 'OPEN (Cam lobe depresses valve down)',
      exhaustValve: 'CLOSED (Hermetically seated)',
      pressureRange: '0.80 – 0.95 bar (Manifold Depression)',
      tempRange: '30°C – 45°C',
      physicsPrinciple: "Boyle's Law & Bernoulli Pressure Differential",
      deepExplanation: [
        'As the piston descends from TDC to BDC, the combustion chamber volume increases from 52.5 cc to 551 cc. This volumetric expansion creates a partial vacuum (depression) inside the cylinder.',
        'Atmospheric pressure (or turbo boost) forces the incoming charge of atomized air and fuel through the opened intake valve at velocities exceeding 60–100 m/s.',
        'Swirl and tumble port designs generate controlled turbulence to ensure homogeneous mixing of fuel droplets before the intake valve snaps shut.',
      ],
      engineeringNotes:
        'Volumetric efficiency (VE) measures how completely the cylinder fills with fresh air. High-performance dual overhead cam (DOHC) engines achieve over 95% VE at peak torque.',
    },
    compression: {
      title: 'Compression Stroke',
      kicker: 'Thermal Priming & Density Spike',
      crankDegrees: '180° to 360° (Stroke 2)',
      pistonMotion: 'Bottom Dead Center (BDC) → Top Dead Center (TDC)',
      intakeValve: 'CLOSED (Sealed against seat)',
      exhaustValve: 'CLOSED (Sealed against seat)',
      pressureRange: '1.0 bar → 16–18 bar (TDC peak)',
      tempRange: '45°C → 450°C–500°C',
      physicsPrinciple: 'Adiabatic Compression: P · V^γ = Constant (γ ≈ 1.35)',
      deepExplanation: [
        'Both the intake and exhaust valves are clamped shut by high-tension valve springs. The rising piston forces the trapped air-fuel mixture into the compact clearance volume.',
        'Squeezing the air-fuel mixture by a factor of 10.5:1 excites gas molecules, dramatically increasing both pressure and temperature.',
        'Heating the fuel vaporizes microscopic fuel droplets, ensuring rapid, complete flame propagation when the spark plug fires.',
      ],
      engineeringNotes:
        'Octane rating (e.g. 91, 93 AKI) determines fuel resistance to auto-ignition (engine knock). High compression requires higher octane to prevent premature detonation before spark.',
    },
    power: {
      title: 'Power Stroke (Combustion)',
      kicker: 'Chemical to Mechanical Energy Conversion',
      crankDegrees: '360° to 540° (Stroke 3)',
      pistonMotion: 'Top Dead Center (TDC) → Bottom Dead Center (BDC)',
      intakeValve: 'CLOSED (Withstands peak combustion pressure)',
      exhaustValve: 'CLOSED (Withstands high temperature)',
      pressureRange: '60 – 75+ bar peak → 4 bar at BDC',
      tempRange: '2,000°C – 2,500°C peak flame front',
      physicsPrinciple: 'Isochoric Heat Addition & Isentropic Gas Expansion',
      deepExplanation: [
        'At ~5° to 10° before TDC, the engine control unit (ECU) triggers the spark plug. An electric arc ignites the compressed fuel vapor.',
        'A controlled turbulent flame front sweeps across the combustion chamber at ~20–30 m/s, rapidly superheating the trapped gas and generating immense downward force on the piston crown (often over 35,000 Newtons).',
        'This downward linear thrust forces the connecting rod down, turning the crankshaft journal and delivering mechanical drive torque to the flywheel.',
      ],
      engineeringNotes:
        'The power stroke is the only stroke that produces positive mechanical work. The other three strokes consume kinetic flywheel energy to operate.',
    },
    exhaust: {
      title: 'Exhaust Stroke',
      kicker: 'Post-Combustion Gas Scavenging',
      crankDegrees: '540° to 720° (Stroke 4)',
      pistonMotion: 'Bottom Dead Center (BDC) → Top Dead Center (TDC)',
      intakeValve: 'CLOSED (Prepares for next cycle)',
      exhaustValve: 'OPEN (Cam lifts valve off seat)',
      pressureRange: '4.5 bar (Initial blowdown) → 1.1 bar',
      tempRange: '800°C → 400°C',
      physicsPrinciple: 'Pressure Blowdown & Inertial Gas Scavenging',
      deepExplanation: [
        'Before the piston even reaches BDC, the exhaust valve opens. The residual 4–5 bar pressure causes the superheated gas to rush out on its own (exhaust blowdown).',
        'As the piston sweeps upward back to TDC, it pushes the remaining spent exhaust products (CO2, H2O, N2) out through the exhaust runner into the manifold.',
        'Toward the end of the stroke, the intake valve begins cracking open slightly before the exhaust valve fully closes (Valve Overlap). The momentum of the rushing exhaust creates a vacuum that pulls in the first rush of fresh intake charge.',
      ],
      engineeringNotes:
        'Tuned header length uses pressure pulses reflecting from the collector to assist in pulling the final burnt gases out of the cylinder (exhaust scavenging effect).',
    },
  };

  const current = strokeDetails[selectedStroke];
  const meta = STROKE_METAS[selectedStroke];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl backdrop-blur-sm">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-2">
        <div>
          <span className="text-sm font-bold text-white tracking-wide">
            Four-Stroke Cycle (Otto Cycle) Deep Dive
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            Understand the mechanical, fluid, and thermodynamic principles governing each 180° phase.
          </p>
        </div>

        {/* Quick jump to stroke buttons */}
        <button
          onClick={() => onJumpToStroke(selectedStroke)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Jump Simulation to {meta.name}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Stroke Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {(['intake', 'compression', 'power', 'exhaust'] as StrokeType[]).map((stroke) => {
          const sMeta = STROKE_METAS[stroke];
          const isSelected = selectedStroke === stroke;
          // Count how many cylinders currently on this stroke
          const activeInEngine = currentStrokes.filter((s) => s === stroke).length;

          return (
            <button
              key={stroke}
              onClick={() => setSelectedStroke(stroke)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? `${sMeta.bgClass} ${sMeta.borderClass} ring-1 ring-amber-500/30 shadow-md`
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono uppercase font-bold ${sMeta.textClass}`}>
                  {sMeta.label}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {activeInEngine > 0 && `(Cyl active)`}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">{sMeta.name}</div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{sMeta.shortDesc}</div>
            </button>
          );
        })}
      </div>

      {/* Detailed Card for Selected Stroke */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Physics & Step-by-Step explanation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold uppercase font-mono px-2 py-0.5 rounded border ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}>
                {current.kicker}
              </span>
              <span className="text-xs text-slate-500 font-mono">{current.crankDegrees}</span>
            </div>

            <h3 className="text-base font-bold text-white mb-2">{current.title}</h3>

            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              {current.deepExplanation.map((paragraph, i) => (
                <p key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{paragraph}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Engineering Insight Callout */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block mb-0.5">Engineering Principle:</span>
              <p className="text-slate-300 leading-relaxed">{current.engineeringNotes}</p>
            </div>
          </div>
        </div>

        {/* Right: Technical Matrix & Parameters (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block border-b border-slate-800 pb-2">
            Mechanical & Thermodynamic Specs
          </span>

          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Piston Motion</span>
              <span className="text-white font-medium text-right">{current.pistonMotion}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Intake Valve</span>
              <span className="text-sky-400 font-medium text-right">{current.intakeValve}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Exhaust Valve</span>
              <span className="text-purple-400 font-medium text-right">{current.exhaustValve}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Cylinder Pressure</span>
              <span className="text-amber-400 font-medium text-right">{current.pressureRange}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Gas Temperature</span>
              <span className="text-red-400 font-medium text-right">{current.tempRange}</span>
            </div>

            <div className="flex justify-between py-1 pt-2">
              <span className="text-slate-400">Governing Law</span>
              <span className="text-emerald-400 font-medium text-right text-[11px]">
                {current.physicsPrinciple}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
