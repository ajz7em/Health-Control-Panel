export type Sex = 'male' | 'female';

const SEX_OFFSETS: Record<Sex, number> = {
  male: 5,
  female: -161,
};

/**
 * Estimate resting metabolic rate using the Mifflin-St Jeor equation.
 *
 * The result is rounded to the nearest whole calorie to match the precision
 * typically reported by nutrition trackers.
 */
export function rmrMifflinStJeor(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm) || !Number.isFinite(age)) {
    throw new Error('Invalid numeric input provided to rmrMifflinStJeor');
  }

  if (!SEX_OFFSETS[sex]) {
    throw new Error(`Unsupported sex provided to rmrMifflinStJeor: ${sex}`);
  }

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age + SEX_OFFSETS[sex];
  return Math.round(base);
}

/**
 * Convert MET values to calories burned over a duration (in hours).
 */
export function kcalFromMet(met: number, weightKg: number, hours: number): number {
  if (!Number.isFinite(met) || !Number.isFinite(weightKg) || !Number.isFinite(hours)) {
    throw new Error('Invalid numeric input provided to kcalFromMet');
  }

  if (met < 0 || weightKg <= 0 || hours < 0) {
    throw new Error('Inputs to kcalFromMet must be non-negative and weight positive');
  }

  const caloriesPerMinute = (met * weightKg * 3.5) / 200;
  return caloriesPerMinute * hours * 60;
}

/**
 * Estimate calories spent on the thermic effect of food (TEF).
 */
export function thermicEffectOfFood(totalCalories: number, ratio = 0.1): number {
  if (!Number.isFinite(totalCalories) || !Number.isFinite(ratio)) {
    throw new Error('Invalid numeric input provided to thermicEffectOfFood');
  }

  if (totalCalories < 0 || ratio < 0) {
    throw new Error('Inputs to thermicEffectOfFood must be non-negative');
  }

  return totalCalories * ratio;
}
