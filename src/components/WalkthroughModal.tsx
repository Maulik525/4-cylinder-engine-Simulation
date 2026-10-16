import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, CheckCircle2, Play } from 'lucide-react';

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToAngle: (angleDeg: number) => void;
  onSelectCylinder: (cylNum: number) => void;
  onSetRpm: (rpm: number) => void;
  onSetPlaying: (playing: boolean) => void;
}

interface TourStep {
  title: string;
  subtitle: string;
  targetAngle: number;
  targetCylinder: number;
  recommendedRpm: number;
  content: string[];
  highlightTip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'The Flat-Plane Inline-4 Architecture',
    subtitle: 'Twin Paired Pistons (1 & 4 vs 2 & 3)',
    targetAngle: 0,
    targetCylinder: 1,
    recommendedRpm: 40,
    content: [
      'In an inline-4 engine, four vertical cylinders sit in a straight line over a single crankshaft.',
      'Notice the flat-plane crankshaft arrangement: Pistons 1 & 4 move up and down together in unison, while Pistons 2 & 3 are 180° opposite.',
      'Even though Pistons 1 & 4 move mechanically in lockstep, they are phased 360° apart in their combustion cycles!',
    ],
    highlightTip: 'Observe Cylinders 1 & 4 at Top Dead Center (TDC) while Cylinders 2 & 3 are at Bottom Dead Center (BDC).',
  },
  {
    title: 'Stroke 1: The Intake Stroke',
    subtitle: 'Induction of Fresh Air & Fuel Charge',
    targetAngle: 450, // Mid-intake for Cyl 1 (cycle angle 450) -> master 450
    targetCylinder: 1,
    recommendedRpm: 60,
    content: [
      'Look at the left valve (Intake Valve) on Cylinder 1: it is pushed downward into the combustion chamber by the camshaft lobe.',
      'As the piston descends from TDC to BDC, it creates a powerful depression (vacuum) of ~0.85 bar.',
      'This vacuum pulls in fresh atomized fuel and air from the intake runner.',
    ],
    highlightTip: 'Notice the blue swirl in the cylinder and the open left valve.',
  },
  {
    title: 'Stroke 2: The Compression Stroke',
    subtitle: 'Hermetic Sealing & Thermal Charge Priming',
    targetAngle: 630, // Mid-compression for Cyl 1 (cycle angle 630) -> master 630
    targetCylinder: 1,
    recommendedRpm: 60,
    content: [
      'Notice that BOTH the intake and exhaust valves are now tightly closed and sealed by heavy valve springs.',
      'The piston ascends from BDC back to TDC, compressing the trapped air-fuel mixture into the small clearance space above the crown.',
      'Pressure climbs to 16–18 bar, and gas temperature reaches ~450°C, fully vaporizing all fuel droplets.',
    ],
    highlightTip: 'Notice the deepening amber glow as the mixture is squeezed toward TDC.',
  },
  {
    title: 'Stroke 3: The Power Stroke (Combustion)',
    subtitle: 'Spark Ignition & High-Pressure Gas Expansion',
    targetAngle: 20, // Right after spark at TDC for Cyl 1
    targetCylinder: 1,
    recommendedRpm: 80,
    content: [
      'Just before TDC, the spark plug arcs with thousands of volts, igniting the vaporized fuel.',
      'A fiery flame front spreads across the combustion chamber, spiking internal pressure to 60–75+ bar!',
      'This violent pressure slams the piston downward from TDC to BDC, forcing the connecting rod to turn the crankshaft. This is the ONLY stroke that produces mechanical power!',
    ],
    highlightTip: 'Watch the brilliant combustion fireball force Piston 1 downward.',
  },
  {
    title: 'Stroke 4: The Exhaust Stroke',
    subtitle: 'Evacuation of Burnt Combustion Byproducts',
    targetAngle: 270, // Mid-exhaust for Cyl 1 (cycle angle 270) -> master 270
    targetCylinder: 1,
    recommendedRpm: 60,
    content: [
      'The right valve (Exhaust Valve) opens, while the intake valve remains sealed.',
      'Residual pressure blows out first, and the ascending piston pushes remaining exhaust gases out through the exhaust runner into the exhaust pipe.',
      'Once the piston reaches TDC, the exhaust valve closes and the cycle immediately loops back to Stroke 1 (Intake).',
    ],
    highlightTip: 'Notice the purple/grey exhaust gases rushing past the open right valve.',
  },
  {
    title: 'The Magic of Firing Order 1 - 3 - 4 - 2',
    subtitle: 'Continuous Power Delivery Without Pauses',
    targetAngle: 0,
    targetCylinder: 1,
    recommendedRpm: 120,
    content: [
      'Because one 4-stroke cycle takes 720° and there are 4 cylinders: 720° ÷ 4 = exactly 180°!',
      'Every 180° of rotation (half a crank turn), another cylinder fires: First 1, then 3, then 4, then 2.',
      'This alternating pattern distributes torque evenly across the crankshaft and guarantees uninterrupted, continuous propulsion!',
    ],
    highlightTip: 'Click "Run Simulation" below to see the continuous power wave in motion!',
  },
];

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({
  isOpen,
  onClose,
  onJumpToAngle,
  onSelectCylinder,
  onSetRpm,
  onSetPlaying,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStepIdx];
  const isFirst = currentStepIdx === 0;
  const isLast = currentStepIdx === TOUR_STEPS.length - 1;

  const goToStep = (idx: number) => {
    setCurrentStepIdx(idx);
    const target = TOUR_STEPS[idx];
    onJumpToAngle(target.targetAngle);
    onSelectCylinder(target.targetCylinder);
    onSetRpm(target.recommendedRpm);
  };

  const handleNext = () => {
    if (!isLast) {
      goToStep(currentStepIdx + 1);
    } else {
      onSetPlaying(true);
      onClose();
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      goToStep(currentStepIdx - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close walkthrough"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            Step {currentStepIdx + 1} of {TOUR_STEPS.length}
          </span>
          <span className="text-xs text-slate-400 font-mono">Guided Engine Tour</span>
        </div>

        {/* Step Title */}
        <h3 className="text-lg font-bold text-white mb-0.5">{step.title}</h3>
        <p className="text-xs text-slate-400 mb-4">{step.subtitle}</p>

        {/* Step Paragraphs */}
        <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          {step.content.map((p, i) => (
            <p key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>{p}</span>
            </p>
          ))}
        </div>

        {/* Tip Box */}
        <div className="mt-3 p-3 rounded-lg bg-sky-500/10 border border-sky-500/30 text-xs text-sky-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{step.highlightTip}</span>
        </div>

        {/* Navigation Controls */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-lg hover:bg-slate-800 flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToStep(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStepIdx
                    ? 'w-6 bg-amber-400'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`Jump to step ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <span>{isLast ? 'Run Simulation' : 'Next Step'}</span>
            {isLast ? <Play className="w-3.5 h-3.5 fill-current" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
