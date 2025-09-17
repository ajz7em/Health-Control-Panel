import { describe, expect, it } from 'vitest';

import { kcalFromMet, rmrMifflinStJeor, thermicEffectOfFood } from './index';

describe('rmrMifflinStJeor', () => {
  it('calculates the male resting metabolic rate', () => {
    expect(rmrMifflinStJeor('male', 82, 182, 33)).toBe(1842);
  });

  it('calculates the female resting metabolic rate', () => {
    expect(rmrMifflinStJeor('female', 70, 170, 29)).toBe(1457);
  });

  it('throws on invalid numeric input', () => {
    expect(() => rmrMifflinStJeor('male', Number.NaN, 180, 30)).toThrow();
  });
});

describe('kcalFromMet', () => {
  it('converts MET values to calories over time', () => {
    const calories = kcalFromMet(8.5, 70, 1.25);
    expect(Math.round(calories)).toBe(261);
  });

  it('rejects invalid values', () => {
    expect(() => kcalFromMet(-1, 70, 1)).toThrow();
  });
});

describe('thermicEffectOfFood', () => {
  it('estimates thermic effect of food with default ratio', () => {
    expect(thermicEffectOfFood(2200)).toBeCloseTo(220);
  });

  it('supports custom ratios', () => {
    expect(thermicEffectOfFood(1800, 0.12)).toBeCloseTo(216);
  });
});
