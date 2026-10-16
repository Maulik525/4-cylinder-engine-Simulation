import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { EngineInlineView } from './components/EngineInlineView';
import { PlaybackControls } from './components/PlaybackControls';
import { FiringOrderTimeline } from './components/FiringOrderTimeline';
import { CylinderInspector } from './components/CylinderInspector';
import { StrokeExplanationDeck } from './components/StrokeExplanationDeck';
import { FiringOrderKinematics } from './components/FiringOrderKinematics';
import { EngineQuiz } from './components/EngineQuiz';
import { WalkthroughModal } from './components/WalkthroughModal';
import { FiringOrder, StrokeType } from './types/engine';
import { computeCylinderState, DEFAULT_ENGINE_SPECS } from './utils/enginePhysics';
import { engineAudio } from './utils/engineAudio';
import { Zap, Flame, Wind, RefreshCw, Cpu, Gauge } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulation' | 'theory' | 'kinematics' | 'quiz'>('simulation');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [rpm, setRpm] = useState<number>(80); // default slow-motion speed for ideal visual clarity
  const [masterAngleDeg, setMasterAngleDeg] = useState<number>(0);
  const [firingOrder, setFiringOrder] = useState<FiringOrder>('1-3-4-2');
  const [selectedCylinder, setSelectedCylinder] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(false);

  const lastTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const prevSparkStatesRef = useRef<{ [key: number]: boolean }>({ 1: false, 2: false, 3: false, 4: false });

  // Compute states for all 4 cylinders
  const cylinderStates = ([1, 2, 3, 4] as const).map((num) =>
    computeCylinderState(num, masterAngleDeg, firingOrder, DEFAULT_ENGINE_SPECS)
  );

  const selectedCylinderState =
    cylinderStates.find((c) => c.cylinderNumber === selectedCylinder) || cylinderStates[0];

  // Sound sync
  useEffect(() => {
    engineAudio.setMuted(isMuted);
    if (!isMuted && isPlaying) {
      engineAudio.startSound(rpm);
    } else {
      engineAudio.stopSound();
    }
  }, [isMuted, isPlaying]);

  useEffect(() => {
    engineAudio.updateRpm(rpm);
  }, [rpm]);

  // Main animation loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    const animate = (time: number) => {
      if (lastTimeRef.current !== null) {
        const deltaSeconds = (time - lastTimeRef.current) / 1000;
        // masterAngle degrees per second = (RPM / 60) * 360
        const deltaDegrees = (rpm / 60) * 360 * deltaSeconds;
        setMasterAngleDeg((prev) => (prev + deltaDegrees) % 720);
      }
      lastTimeRef.current = time;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, rpm]);

  // Spark audio trigger detection
  useEffect(() => {
    cylinderStates.forEach((cyl) => {
      const prev = prevSparkStatesRef.current[cyl.cylinderNumber];
      if (cyl.isSparking && !prev && !isMuted) {
        engineAudio.triggerSparkPop();
      }
      prevSparkStatesRef.current[cyl.cylinderNumber] = cyl.isSparking;
    });
  }, [cylinderStates, isMuted]);

  // Stepping controls
  const handleStepAngle = (deltaDeg: number) => {
    setIsPlaying(false);
    setMasterAngleDeg((prev) => ((prev + deltaDeg) % 720 + 720) % 720);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setMasterAngleDeg(0);
    setSelectedCylinder(1);
  };

  const handleJumpToStroke = (stroke: StrokeType) => {
    setIsPlaying(false);
    // Find master angle where selected cylinder enters this stroke
    // Cycle angles: Power (0°), Exhaust (180°), Intake (360°), Compression (540°)
    let targetCycle = 0;
    if (stroke === 'power') targetCycle = 10;
    if (stroke === 'exhaust') targetCycle = 190;
    if (stroke === 'intake') targetCycle = 370;
    if (stroke === 'compression') targetCycle = 550;

    let delay = 0;
    if (firingOrder === '1-3-4-2') {
      if (selectedCylinder === 1) delay = 0;
      if (selectedCylinder === 3) delay = 180;
      if (selectedCylinder === 4) delay = 360;
      if (selectedCylinder === 2) delay = 540;
    } else {
      if (selectedCylinder === 1) delay = 0;
      if (selectedCylinder === 2) delay = 180;
      if (selectedCylinder === 4) delay = 360;
      if (selectedCylinder === 3) delay = 540;
    }

    const targetMaster = (targetCycle + delay) % 720;
    setMasterAngleDeg(targetMaster);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onReset={handleReset}
        onStartWalkthrough={() => setIsWalkthroughOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Hero Title & Specification Strip */}
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 lg:p-6 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                <span>FOUR-STROKE INTERNAL COMBUSTION ENGINE</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">OTTO THERMODYNAMIC CYCLE</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Working of a 4-Cylinder Engine & Firing Order
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Step-by-step physical simulation illustrating the intake, compression, power, and exhaust strokes across all four cylinders. Explore piston kinematics, valve timing, and continuous torque delivery via standard firing order 1-3-4-2.
              </p>
            </div>

            {/* Quick Engine Metrics Badge */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono shrink-0">
              <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase">Displacement</span>
                <span className="text-slate-200 font-bold">1,995 cc (2.0L)</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase">Compression</span>
                <span className="text-slate-200 font-bold">10.5 : 1</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase">Firing Interval</span>
                <span className="text-amber-400 font-bold">Every 180°</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase">Crank Configuration</span>
                <span className="text-sky-400 font-bold">Flat-Plane 180°</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab 1: Simulation View */}
        {activeTab === 'simulation' && (
          <div className="space-y-6">
            {/* Playback & RPM Controls */}
            <PlaybackControls
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              rpm={rpm}
              setRpm={setRpm}
              masterAngleDeg={masterAngleDeg}
              setMasterAngleDeg={setMasterAngleDeg}
              firingOrder={firingOrder}
              setFiringOrder={setFiringOrder}
              stepAngle={handleStepAngle}
            />

            {/* 4-Cylinder Inline Cutaway Visualizer */}
            <EngineInlineView
              cylinderStates={cylinderStates}
              selectedCylinder={selectedCylinder}
              onSelectCylinder={setSelectedCylinder}
              masterAngleDeg={masterAngleDeg}
            />

            {/* 720° Four-Stroke Sequence & Firing Matrix Timeline */}
            <FiringOrderTimeline
              masterAngleDeg={masterAngleDeg}
              firingOrder={firingOrder}
              onSeek={(deg) => {
                setIsPlaying(false);
                setMasterAngleDeg(deg);
              }}
              selectedCylinder={selectedCylinder}
            />

            {/* Deep-Dive Single Cylinder Telemetry & P-V Diagram */}
            <CylinderInspector
              cylinderState={selectedCylinderState}
              rpm={rpm}
              onSelectCylinder={setSelectedCylinder}
            />
          </div>
        )}

        {/* Tab 2: 4-Stroke Theory & Thermodynamics */}
        {activeTab === 'theory' && (
          <div className="space-y-6">
            <StrokeExplanationDeck
              onJumpToStroke={(stroke) => {
                handleJumpToStroke(stroke);
                setActiveTab('simulation');
              }}
              currentStrokes={cylinderStates.map((c) => c.stroke)}
            />

            {/* Deep-Dive Single Cylinder Inspector */}
            <CylinderInspector
              cylinderState={selectedCylinderState}
              rpm={rpm}
              onSelectCylinder={setSelectedCylinder}
            />
          </div>
        )}

        {/* Tab 3: Kinematics & Firing Order Balance */}
        {activeTab === 'kinematics' && (
          <div className="space-y-6">
            <FiringOrderKinematics
              masterAngleDeg={masterAngleDeg}
              firingOrder={firingOrder}
              setFiringOrder={setFiringOrder}
            />

            {/* Inline Engine View for reference */}
            <EngineInlineView
              cylinderStates={cylinderStates}
              selectedCylinder={selectedCylinder}
              onSelectCylinder={setSelectedCylinder}
              masterAngleDeg={masterAngleDeg}
            />
          </div>
        )}

        {/* Tab 4: Knowledge Check Quiz */}
        {activeTab === 'quiz' && (
          <div className="space-y-6">
            <EngineQuiz />
          </div>
        )}
      </main>

      {/* Interactive Walkthrough Modal */}
      <WalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
        onJumpToAngle={(angleDeg) => setMasterAngleDeg(angleDeg)}
        onSelectCylinder={(cylNum) => setSelectedCylinder(cylNum)}
        onSetRpm={(newRpm) => setRpm(newRpm)}
        onSetPlaying={(playing) => setIsPlaying(playing)}
      />

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950 px-4 py-6 text-center text-xs text-slate-500">
        <p>Four-Cylinder Four-Stroke Engine Simulator · Mechanical Kinematics & Otto Cycle</p>
      </footer>
    </div>
  );
}
