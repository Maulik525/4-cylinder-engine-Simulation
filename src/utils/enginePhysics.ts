import { CylinderState, EngineSpecs, FiringOrder, StrokeType } from '../types/engine';

export const DEFAULT_ENGINE_SPECS: EngineSpecs = {
  boreMm: 84,
  strokeMm: 90,
  conRodMm: 145,
  compressionRatio: 10.5,
  displacementCc: 1995,
  clearanceVolumeCc: 52.5,
};

/**
 * Exact slider-crank kinematic formula:
 * Returns normalized piston distance from TDC (0 = TDC, 1 = BDC)
 * thetaRad: crank throw angle from TDC (0 at top, pi at bottom)
 */
export function calculateSliderCrankNormalized(
  thetaRad: number,
  conRodMm: number = DEFAULT_ENGINE_SPECS.conRodMm,
  strokeMm: number = DEFAULT_ENGINE_SPECS.strokeMm
): { pistonY: number; rodAngleDeg: number } {
  const r = strokeMm / 2; // crank radius (45mm)
  const l = conRodMm; // connecting rod length (145mm)

  // rod angle from vertical: sin(phi) = (r / l) * sin(theta)
  const sinPhi = (r / l) * Math.sin(thetaRad);
  const clampedSin = Math.max(-1, Math.min(1, sinPhi));
  const phi = Math.asin(clampedSin);

  // Distance from crank center to wrist pin:
  // x = r * cos(theta) + l * cos(phi)
  // At TDC (theta = 0): x_tdc = r + l
  // At BDC (theta = pi): x_bdc = -r + l = l - r
  // Total stroke = x_tdc - x_bdc = 2 * r
  const x = r * Math.cos(thetaRad) + l * Math.cos(phi);
  const xTdc = r + l;
  const stroke = 2 * r;

  // Normalized distance from TDC: 0 at TDC, 1 at BDC
  const pistonY = Math.max(0, Math.min(1, (xTdc - x) / stroke));

  return {
    pistonY,
    rodAngleDeg: (phi * 180) / Math.PI,
  };
}

/**
 * Returns cycle angle (0 to 720) for a cylinder based on master crank angle and firing order
 * Convention:
 * 0° to 180°: POWER
 * 180° to 360°: EXHAUST
 * 360° to 540°: INTAKE
 * 540° to 720°: COMPRESSION
 */
export function getCylinderCycleAngle(
  cylinderNum: 1 | 2 | 3 | 4,
  masterAngleDeg: number,
  firingOrder: FiringOrder = '1-3-4-2'
): number {
  const normMaster = ((masterAngleDeg % 720) + 720) % 720;

  // Firing order defines when each cylinder reaches Power Stroke (0° in its own cycle)
  let fireDelayDeg = 0;
  if (firingOrder === '1-3-4-2') {
    switch (cylinderNum) {
      case 1:
        fireDelayDeg = 0;
        break;
      case 3:
        fireDelayDeg = 180;
        break;
      case 4:
        fireDelayDeg = 360;
        break;
      case 2:
        fireDelayDeg = 540;
        break;
    }
  } else {
    // 1-2-4-3
    switch (cylinderNum) {
      case 1:
        fireDelayDeg = 0;
        break;
      case 2:
        fireDelayDeg = 180;
        break;
      case 4:
        fireDelayDeg = 360;
        break;
      case 3:
        fireDelayDeg = 540;
        break;
    }
  }

  // Cyl cycle angle is master angle shifted by firing delay
  const cycleDeg = ((normMaster - fireDelayDeg) % 720 + 720) % 720;
  return cycleDeg;
}

/**
 * Computes the full state of a cylinder at a given cycle angle
 */
export function computeCylinderState(
  cylinderNum: 1 | 2 | 3 | 4,
  masterAngleDeg: number,
  firingOrder: FiringOrder = '1-3-4-2',
  specs: EngineSpecs = DEFAULT_ENGINE_SPECS
): CylinderState {
  const cycleDeg = getCylinderCycleAngle(cylinderNum, masterAngleDeg, firingOrder);

  // Stroke identification
  let stroke: StrokeType;
  let strokeDegrees: number;

  if (cycleDeg < 180) {
    stroke = 'power';
    strokeDegrees = cycleDeg;
  } else if (cycleDeg < 360) {
    stroke = 'exhaust';
    strokeDegrees = cycleDeg - 180;
  } else if (cycleDeg < 540) {
    stroke = 'intake';
    strokeDegrees = cycleDeg - 360;
  } else {
    stroke = 'compression';
    strokeDegrees = cycleDeg - 540;
  }

  const strokeProgress = strokeDegrees / 180;

  // Physical Crank Throw Angle:
  // Flat-plane inline-4:
  // Cylinders 1 & 4 share throw 0°/360°
  // Cylinders 2 & 3 share throw 180°
  const crankThrowAngleDeg =
    cylinderNum === 1 || cylinderNum === 4
      ? ((masterAngleDeg % 360) + 360) % 360
      : ((masterAngleDeg + 180) % 360 + 360) % 360;

  const crankRad = (crankThrowAngleDeg * Math.PI) / 180;
  const { pistonY, rodAngleDeg } = calculateSliderCrankNormalized(
    crankRad,
    specs.conRodMm,
    specs.strokeMm
  );

  // Piston velocity: positive downwards, negative upwards
  // dv/dtheta ~ sin(theta) + (lambda / 2) * sin(2*theta)
  const lambda = (specs.strokeMm / 2) / specs.conRodMm;
  const pistonVelocity = Math.sin(crankRad) + (lambda / 2) * Math.sin(2 * crankRad);

  // Valve Lifts (cam profile modeled as smooth half-sinusoid)
  let intakeValveLift = 0;
  let exhaustValveLift = 0;

  if (stroke === 'intake') {
    // Valve starts opening slightly before TDC and seals shortly after BDC
    // Smooth bell curve over 0 to 180
    intakeValveLift = Math.sin(strokeProgress * Math.PI);
  }

  if (stroke === 'exhaust') {
    // Exhaust valve open during exhaust stroke
    exhaustValveLift = Math.sin(strokeProgress * Math.PI);
  }

  // Spark occurs right before and during the beginning of power stroke
  // from 715° (5° before TDC) to 12°
  const isSparking = cycleDeg >= 714 || cycleDeg <= 12;

  // Thermodynamic calculations (Pressure, Temp, Volume)
  const singleDispCc = specs.displacementCc / 4;
  const gasVolumeCc = specs.clearanceVolumeCc + pistonY * singleDispCc;

  let pressureBar = 1.0;
  let tempCelsius = 35;

  if (stroke === 'intake') {
    pressureBar = 0.85 + 0.15 * Math.sin(strokeProgress * Math.PI); // slight depression
    tempCelsius = 30 + strokeProgress * 15;
  } else if (stroke === 'compression') {
    // Polytropic compression P = P0 * (Vmax / V)^1.35
    const compRatioCurrent = (specs.clearanceVolumeCc + singleDispCc) / Math.max(gasVolumeCc, 1);
    pressureBar = 1.0 * Math.pow(compRatioCurrent, 1.32);
    tempCelsius = 40 + Math.pow(compRatioCurrent, 0.35) * 220;
  } else if (stroke === 'power') {
    // Peak pressure around 10-15° after spark (~60 bar), expanding down
    if (strokeProgress < 0.1) {
      // rapid explosion rise
      const t = strokeProgress / 0.1;
      pressureBar = 16 + t * 48; // jumps to ~64 bar
      tempCelsius = 500 + t * 1650; // jumps to ~2150°C
    } else {
      // adiabatic expansion
      const expProgress = (strokeProgress - 0.1) / 0.9;
      pressureBar = 64 * Math.pow(1 - expProgress * 0.75, 2.2);
      tempCelsius = 2150 * (1 - expProgress * 0.65);
    }
  } else if (stroke === 'exhaust') {
    // Blowdown rapidly drops to ~1.3 bar
    const expProgress = Math.min(1, strokeProgress * 2);
    pressureBar = 4.5 * (1 - expProgress * 0.7) + 1.2;
    tempCelsius = 750 * (1 - strokeProgress * 0.45);
  }

  return {
    cylinderNumber: cylinderNum,
    stroke,
    strokeProgress,
    strokeDegrees,
    cycleDegrees: cycleDeg,
    pistonY,
    pistonVelocity,
    intakeValveLift: Math.max(0, Math.min(1, intakeValveLift)),
    exhaustValveLift: Math.max(0, Math.min(1, exhaustValveLift)),
    isSparking,
    pressureBar: Math.round(pressureBar * 10) / 10,
    tempCelsius: Math.round(tempCelsius),
    gasVolumeCc: Math.round(gasVolumeCc * 10) / 10,
    crankThrowAngleDeg,
    rodAngleDeg,
  };
}

/**
 * Returns ideal Otto cycle coordinates for P-V indicator diagram
 */
export function getIdealOttoCyclePoints(specs: EngineSpecs = DEFAULT_ENGINE_SPECS): {
  state1: { v: number; p: number }; // BDC intake / start compression
  state2: { v: number; p: number }; // TDC compressed
  state3: { v: number; p: number }; // TDC combustion peak
  state4: { v: number; p: number }; // BDC expansion end
} {
  const singleDispCc = specs.displacementCc / 4;
  const vMax = specs.clearanceVolumeCc + singleDispCc;
  const vMin = specs.clearanceVolumeCc;

  return {
    state1: { v: vMax, p: 1.0 },
    state2: { v: vMin, p: 18.0 },
    state3: { v: vMin, p: 62.0 },
    state4: { v: vMax, p: 4.2 },
  };
}
