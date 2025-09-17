import { describe, expect, it } from 'vitest';
import {
  DailyBodyMetricsSchema,
  DailyIntakeEntrySchema,
  OnboardingProfileSchema,
} from '../index';

describe('DailyIntakeEntrySchema', () => {
  it('parses a minimal entry and fills defaults', () => {
    const parsed = DailyIntakeEntrySchema.parse({
      date: '2024-03-28',
      meal: 'breakfast',
      item: 'Oatmeal',
      calories: 320,
    });

    expect(parsed.proteinGrams).toBe(0);
    expect(parsed.calories).toBe(320);
  });

  it('rejects invalid dates', () => {
    expect(() =>
      DailyIntakeEntrySchema.parse({
        date: '03-28-2024',
        meal: 'lunch',
        item: 'Salad',
        calories: 250,
      }),
    ).toThrow();
  });
});

describe('DailyBodyMetricsSchema', () => {
  it('accepts optional biomarkers', () => {
    const parsed = DailyBodyMetricsSchema.parse({
      date: '2024-03-28',
      weightKg: 72.4,
      bodyFatPercentage: 21.3,
      restingHeartRate: 58,
    });

    expect(parsed.weightKg).toBeCloseTo(72.4);
  });
});

describe('OnboardingProfileSchema', () => {
  it('requires at least one goal', () => {
    expect(() =>
      OnboardingProfileSchema.parse({
        email: 'user@example.com',
        birthDate: '1990-02-01',
        sex: 'female',
        heightCm: 165,
        activityLevel: 'moderate',
        goals: [],
      }),
    ).toThrow();
  });

  it('parses a valid profile', () => {
    const profile = OnboardingProfileSchema.parse({
      email: 'user@example.com',
      birthDate: '1990-02-01',
      sex: 'female',
      heightCm: 165,
      activityLevel: 'moderate',
      goals: ['maintain'],
    });

    expect(profile.email).toBe('user@example.com');
  });
});
