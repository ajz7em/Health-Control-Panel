import Decimal from 'decimal.js';

import { isDemoModeEnabled } from '../env';

export type Unit = 'KG' | 'LB';

export type WeightEntry = {
  id: string;
  kg: number;
  lb: number;
  readingDate: string;
  readingTime?: string | null;
  createdAt: string;
  enteredUnit: Unit;
};

export type WeightStore = {
  list(): Promise<WeightEntry[]>;
  add(
    // eslint-disable-next-line no-unused-vars
    input: Omit<WeightEntry, 'id' | 'createdAt' | 'kg' | 'lb'> & {
      value: number;
      unit: Unit;
    },
  ): Promise<WeightEntry>;
  remove(
    // eslint-disable-next-line no-unused-vars
    id: string,
  ): Promise<void>;
};

const LB_PER_KG = new Decimal('2.2046226218');

export const toKgLb = (value: number, unit: Unit) => {
  if (unit === 'KG') {
    const kg = new Decimal(value);
    const lb = kg.mul(LB_PER_KG);
    return {
      kg: Number(kg.toDecimalPlaces(2)),
      lb: Number(lb.toDecimalPlaces(2)),
    };
  }

  const lb = new Decimal(value);
  const kg = lb.div(LB_PER_KG);
  return {
    kg: Number(kg.toDecimalPlaces(2)),
    lb: Number(lb.toDecimalPlaces(2)),
  };
};

export const sortWeightEntries = (entries: WeightEntry[]) => {
  return [...entries].sort((a, b) => {
    if (a.readingDate === b.readingDate) {
      const aTime = a.readingTime ?? null;
      const bTime = b.readingTime ?? null;

      if (aTime === bTime) {
        return a.createdAt.localeCompare(b.createdAt);
      }

      if (aTime === null) {
        return 1;
      }

      if (bTime === null) {
        return -1;
      }

      return aTime.localeCompare(bTime);
    }

    return a.readingDate.localeCompare(b.readingDate);
  });
};

export async function makeWeightStore(): Promise<WeightStore> {
  if (isDemoModeEnabled()) {
    const { LocalStorageWeightStore } = await import('./localStorageWeightStore');
    return new LocalStorageWeightStore();
  }

  const { PrismaWeightStore } = await import('./prismaWeightStore');
  return new PrismaWeightStore();
}
