export type Sex = 'male' | 'female';

/**
 * Calculates resting metabolic rate using the Mifflin–St Jeor equation.
 * All inputs are metric to avoid unit conversion ambiguity.
 */
export function rmrMifflinStJeor(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  ageYears: number,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  const adjustment = sex === 'male' ? 5 : -161;
  return Math.round(base + adjustment);
}

/**
 * Estimates calories burned from a metabolic equivalent (MET) activity.
 */
export function kcalFromMet(met: number, weightKg: number, hours: number): number {
  if (met < 0 || weightKg <= 0 || hours < 0) {
    throw new Error('MET, weight, and hours must be non-negative with weight > 0.');
  }

  return met * weightKg * hours;
}

/**
 * Approximates the thermic effect of food (TEF) as a percentage of intake.
 * Defaults to the commonly cited 10% multiplier.
 */
export function thermicEffectOfFood(totalCalories: number, tefRatio = 0.1): number {
  if (totalCalories < 0) {
    throw new Error('Total calories must be non-negative.');
  }

  if (tefRatio < 0 || tefRatio > 1) {
    throw new Error('TEF ratio must be between 0 and 1.');
  }

  return Math.round(totalCalories * tefRatio);
}
