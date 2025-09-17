import { z } from 'zod';

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/u, 'Expected ISO-8601 calendar date (YYYY-MM-DD).');

export const DailyIntakeEntrySchema = z.object({
  date: isoDateString,
  meal: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  item: z.string().min(1),
  calories: z.number().nonnegative(),
  proteinGrams: z.number().nonnegative().default(0),
  carbsGrams: z.number().nonnegative().default(0),
  fatGrams: z.number().nonnegative().default(0),
  sodiumMg: z.number().nonnegative().default(0),
});

export type DailyIntakeEntry = z.infer<typeof DailyIntakeEntrySchema>;

export const DailyBodyMetricsSchema = z.object({
  date: isoDateString,
  weightKg: z.number().positive().max(400),
  bodyFatPercentage: z.number().min(0).max(75).optional(),
  restingHeartRate: z.number().int().min(20).max(220).optional(),
});

export type DailyBodyMetrics = z.infer<typeof DailyBodyMetricsSchema>;

export const OnboardingProfileSchema = z.object({
  email: z.string().email(),
  birthDate: isoDateString,
  sex: z.enum(['male', 'female']),
  heightCm: z.number().positive().max(272),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'intense']),
  goals: z.array(z.enum(['lose', 'maintain', 'gain'])).min(1),
});

export type OnboardingProfile = z.infer<typeof OnboardingProfileSchema>;
