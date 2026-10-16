export type StrokeType = 'intake' | 'compression' | 'power' | 'exhaust';

export type FiringOrder = '1-3-4-2' | '1-2-4-3';

export interface CylinderState {
  cylinderNumber: 1 | 2 | 3 | 4;
  stroke: StrokeType;
  strokeProgress: number; // 0 to 1
  strokeDegrees: number; // 0 to 180
  cycleDegrees: number; // 0 to 720
  pistonY: number; // 0 at TDC, 1 at BDC
  pistonVelocity: number; // -1 to 1 (negative = ascending, positive = descending)
  intakeValveLift: number; // 0 closed, 1 fully open
  exhaustValveLift: number; // 0 closed, 1 fully open
  isSparking: boolean;
  pressureBar: number;
  tempCelsius: number;
  gasVolumeCc: number;
  crankThrowAngleDeg: number; // physical crankshaft journal angle 0 to 360
  rodAngleDeg: number; // connecting rod angle relative to vertical
}

export interface EngineSpecs {
  boreMm: number;
  strokeMm: number;
  conRodMm: number;
  compressionRatio: number;
  displacementCc: number;
  clearanceVolumeCc: number;
}

export interface StrokeMeta {
  type: StrokeType;
  label: string;
  name: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  glowClass: string;
  shortDesc: string;
  valveStatus: string;
  pistonDirection: 'down' | 'up';
  summary: string;
}

export const STROKE_METAS: Record<StrokeType, StrokeMeta> = {
  intake: {
    type: 'intake',
    label: 'Stroke 1',
    name: 'Intake Stroke',
    color: '#0284c7', // vibrant azure
    bgClass: 'bg-sky-500/15',
    textClass: 'text-sky-400',
    borderClass: 'border-sky-500/30',
    glowClass: 'shadow-sky-500/20',
    shortDesc: 'Air & fuel mixture drawn in as piston descends',
    valveStatus: 'Intake: Open · Exhaust: Closed',
    pistonDirection: 'down',
    summary: 'The intake valve opens while the exhaust valve remains sealed. As the piston travels downward from Top Dead Center (TDC) to Bottom Dead Center (BDC), it creates a low-pressure vacuum inside the cylinder bore, drawing in the fresh air-fuel mixture (or clean air in direct injection).'
  },
  compression: {
    type: 'compression',
    label: 'Stroke 2',
    name: 'Compression Stroke',
    color: '#d97706', // amber
    bgClass: 'bg-amber-500/15',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    glowClass: 'shadow-amber-500/20',
    shortDesc: 'Trapped mixture compressed into combustion chamber',
    valveStatus: 'Intake: Closed · Exhaust: Closed',
    pistonDirection: 'up',
    summary: 'Both valves seal hermetically. The piston ascends from BDC to TDC, squeezing the trapped charge into the small clearance volume above the piston crown. This increases cylinder pressure to ~12–16 bar and heats the vaporized fuel, preparing it for rapid, complete combustion.'
  },
  power: {
    type: 'power',
    label: 'Stroke 3',
    name: 'Power Stroke (Combustion)',
    color: '#ef4444', // fiery red/orange
    bgClass: 'bg-red-500/20',
    textClass: 'text-red-400',
    borderClass: 'border-red-500/40',
    glowClass: 'shadow-red-500/30',
    shortDesc: 'Spark ignites fuel; expanding gas drives piston downward',
    valveStatus: 'Intake: Closed · Exhaust: Closed',
    pistonDirection: 'down',
    summary: 'Just as the piston reaches TDC (spark timing ~5°-10° advance), the spark plug emits an electric arc. The fuel detonates in a controlled flame front, spiking cylinder pressure to 40–70+ bar and temperature to 2,000°C+. The violent expansion drives the piston down, turning the crankshaft and generating mechanical work.'
  },
  exhaust: {
    type: 'exhaust',
    label: 'Stroke 4',
    name: 'Exhaust Stroke',
    color: '#a855f7', // purple / hot exhaust
    bgClass: 'bg-purple-500/15',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/30',
    glowClass: 'shadow-purple-500/20',
    shortDesc: 'Spent burned combustion gases expelled out exhaust runner',
    valveStatus: 'Intake: Closed · Exhaust: Open',
    pistonDirection: 'up',
    summary: 'The exhaust valve opens as the piston reaches BDC. The piston ascends back to TDC, pushing spent post-combustion gases (CO2, H2O, N2) out through the exhaust port into the exhaust manifold and catalytic converter, scavenging the cylinder clean for the next intake stroke.'
  }
};
