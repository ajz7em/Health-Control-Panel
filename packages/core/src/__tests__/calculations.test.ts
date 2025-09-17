import { describe, expect, it } from 'vitest';
import { kcalFromMet, rmrMifflinStJeor, thermicEffectOfFood } from '../index';

describe('rmrMifflinStJeor', () => {
  it('returns expected RMR for a typical male profile', () => {
    expect(rmrMifflinStJeor('male', 85, 180, 35)).toBe(1805);
  });

  it('returns expected RMR for a typical female profile', () => {
    expect(rmrMifflinStJeor('female', 70, 170, 29)).toBe(1506);
  });
});

describe('kcalFromMet', () => {
  it('calculates calories burned from a MET value', () => {
    expect(kcalFromMet(8, 70, 1)).toBe(560);
  });

  it('rejects invalid input', () => {
    expect(() => kcalFromMet(-1, 70, 1)).toThrow();
  });
});

describe('thermicEffectOfFood', () => {
  it('defaults to a 10% multiplier', () => {
    expect(thermicEffectOfFood(2400)).toBe(240);
  });

  it('supports custom multipliers', () => {
    expect(thermicEffectOfFood(2000, 0.12)).toBe(240);
  });

  it('validates input bounds', () => {
    expect(() => thermicEffectOfFood(-1)).toThrow();
    expect(() => thermicEffectOfFood(2000, 1.2)).toThrow();
  });
});
