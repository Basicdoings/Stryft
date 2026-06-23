/**
 * Stryft Timeline Prediction Engine
 * 
 * Ported from apps/morph-demo/app.js biological prediction system.
 * Computes zone-specific morph weights and physiological predictions
 * from onboarding biometric data.
 * 
 * All morph values are strictly clamped to [0.0, 1.0] per PRD safeguard.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BiometricProfile {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  timelineWeeks: 8 | 12 | 16;
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  caloricStrategy: 'deficit' | 'maintenance' | 'surplus';
  primaryGoalZone: 'abs' | 'glutes' | 'v-taper' | 'hourglass' | 'arms' | 'thighs';
  secondaryGoalZone?: string | null;
}

export interface ZoneMorphWeights {
  abs: number;
  glutes: number;
  vTaper: number;
  arms: number;
  legs: number;
}

export interface PredictionResult {
  /** Efficiency coefficient (0.0–1.0), reduced by sleep/caloric penalties */
  efficiencyScore: number;
  /** Zone-specific morph weights for bone-scaling system */
  zoneMorphs: ZoneMorphWeights;
  /** Estimated lean muscle gain in kg */
  expectedMuscleGainKg: number;
  /** Estimated waist circumference change in cm */
  waistChangeCm: number;
  /** Estimated body fat percentage change */
  bodyFatChangePct: number;
  /** Human-readable penalty descriptions */
  penalties: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Weekly muscle gain limits by experience tier (lbs) */
const WEEKLY_MUSCLE_GAIN_LBS: Record<string, number> = {
  beginner: 0.50,
  intermediate: 0.25,
  advanced: 0.125,
};

/** Sleep quality recovery penalties */
const SLEEP_PENALTIES: Record<string, number> = {
  poor: -0.15,
  fair: -0.05,
  good: 0,
  excellent: 0,
};

/** Caloric strategy multipliers */
const CALORIC_MULTIPLIERS: Record<string, number> = {
  deficit: 0.60,
  maintenance: 1.00,
  surplus: 1.15,
};

/** Caloric strategy efficiency penalties */
const CALORIC_PENALTIES: Record<string, number> = {
  deficit: -0.10,
  maintenance: 0,
  surplus: 0,
};

/**
 * Goal zone → morph weight distribution.
 * Primary zone gets 0.85–0.95, secondary zones get supporting values.
 * Mirrors the preset system from morph-demo/app.js.
 */
const ZONE_PRESETS: Record<string, ZoneMorphWeights> = {
  abs:       { abs: 0.85, glutes: 0.20, vTaper: 0.40, arms: 0.30, legs: 0.20 },
  glutes:    { abs: 0.40, glutes: 0.90, vTaper: 0.15, arms: 0.15, legs: 0.60 },
  'v-taper': { abs: 0.60, glutes: 0.30, vTaper: 0.95, arms: 0.80, legs: 0.40 },
  hourglass: { abs: 0.50, glutes: 0.85, vTaper: 0.30, arms: 0.20, legs: 0.50 },
  arms:      { abs: 0.30, glutes: 0.20, vTaper: 0.50, arms: 0.90, legs: 0.25 },
  thighs:    { abs: 0.25, glutes: 0.50, vTaper: 0.15, arms: 0.15, legs: 0.90 },
};

// ─── Core Engine ──────────────────────────────────────────────────────────────

/** Clamp value strictly to [0.0, 1.0] — PRD safeguard requirement */
function clamp01(value: number): number {
  return Math.max(0.0, Math.min(value, 1.0));
}

/**
 * Compute the full timeline prediction from a biometric profile.
 * 
 * This is the main entry point — pass the user's onboarding data,
 * get back morph weights + physiological predictions.
 */
export function calculateTimelinePredictions(profile: BiometricProfile): PredictionResult {
  const penalties: string[] = [];

  // 1. Compute efficiency coefficient
  let efficiency = 1.00;

  const sleepPenalty = SLEEP_PENALTIES[profile.sleepQuality] ?? 0;
  if (sleepPenalty < 0) {
    efficiency += sleepPenalty;
    penalties.push(
      `${profile.sleepQuality === 'poor' ? 'Poor' : 'Fair'} sleep quality reduces recovery by ${Math.abs(sleepPenalty * 100)}%.`
    );
  }

  const caloricPenalty = CALORIC_PENALTIES[profile.caloricStrategy] ?? 0;
  if (caloricPenalty < 0) {
    efficiency += caloricPenalty;
    penalties.push('Caloric deficit restricts muscle growth potential (-10%).');
  }

  efficiency = clamp01(efficiency);

  // 2. Compute zone morph weights based on goal zone
  const basePreset = ZONE_PRESETS[profile.primaryGoalZone] ?? ZONE_PRESETS.abs;

  // Scale by efficiency and timeline (longer = more transformation)
  const timelineScale = profile.timelineWeeks / 16; // Normalize to max timeline
  const morphScale = efficiency * timelineScale;

  const zoneMorphs: ZoneMorphWeights = {
    abs: clamp01(basePreset.abs * morphScale),
    glutes: clamp01(basePreset.glutes * morphScale),
    vTaper: clamp01(basePreset.vTaper * morphScale),
    arms: clamp01(basePreset.arms * morphScale),
    legs: clamp01(basePreset.legs * morphScale),
  };

  // 3. Compute physiological predictions (ported from morph-demo)
  const weeklyGainLbs = WEEKLY_MUSCLE_GAIN_LBS[profile.fitnessLevel] ?? 0.25;
  const totalIdealGainLbs = weeklyGainLbs * profile.timelineWeeks;
  const caloricMult = CALORIC_MULTIPLIERS[profile.caloricStrategy] ?? 1.0;
  const muscleGainLbs = totalIdealGainLbs * efficiency * caloricMult;

  // Morph intensity contribution (same formula as morph-demo)
  const morphIntensity =
    zoneMorphs.abs * 0.1 +
    zoneMorphs.glutes * 0.2 +
    zoneMorphs.vTaper * 0.15 +
    zoneMorphs.arms * 0.15 +
    zoneMorphs.legs * 0.2;

  const expectedMuscleGainKg = (muscleGainLbs + morphIntensity * 4.0) * 0.453592;

  // Waist and body fat changes depend on caloric strategy
  let waistChangeCm: number;
  let bodyFatChangePct: number;

  if (profile.caloricStrategy === 'deficit') {
    waistChangeCm = -0.5 * profile.timelineWeeks * efficiency - zoneMorphs.abs * 2.0;
    bodyFatChangePct = -0.3 * profile.timelineWeeks * efficiency - zoneMorphs.abs * 1.5;
  } else if (profile.caloricStrategy === 'maintenance') {
    waistChangeCm = -0.1 * profile.timelineWeeks * efficiency - zoneMorphs.abs * 0.8;
    bodyFatChangePct = -0.08 * profile.timelineWeeks * efficiency - zoneMorphs.abs * 0.6;
  } else {
    // surplus
    waistChangeCm = 0.08 * profile.timelineWeeks - zoneMorphs.abs * 0.4;
    bodyFatChangePct = 0.04 * profile.timelineWeeks - zoneMorphs.abs * 0.2;
  }

  return {
    efficiencyScore: parseFloat(efficiency.toFixed(2)),
    zoneMorphs,
    expectedMuscleGainKg: parseFloat(expectedMuscleGainKg.toFixed(2)),
    waistChangeCm: parseFloat(waistChangeCm.toFixed(1)),
    bodyFatChangePct: parseFloat(bodyFatChangePct.toFixed(1)),
    penalties,
  };
}

/**
 * Apply a scenario multiplier to a prediction result's zone morphs.
 * Used by the Future Self screen's Conservative/Likely/Best toggles.
 */
export function applyScenarioFactor(
  zoneMorphs: ZoneMorphWeights,
  factor: number,
): ZoneMorphWeights {
  return {
    abs: clamp01(zoneMorphs.abs * factor),
    glutes: clamp01(zoneMorphs.glutes * factor),
    vTaper: clamp01(zoneMorphs.vTaper * factor),
    arms: clamp01(zoneMorphs.arms * factor),
    legs: clamp01(zoneMorphs.legs * factor),
  };
}
