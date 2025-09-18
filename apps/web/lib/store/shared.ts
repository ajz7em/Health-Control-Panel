export type Unit = 'kg' | 'lb';

export interface WeightEntry {
  id: string;
  weight: number;
  unit: Unit;
  loggedAt: string;
  note?: string | null;
}

export interface WeightStore {
  list(): Promise<WeightEntry[]>;
  create(entry: Omit<WeightEntry, 'id'>): Promise<WeightEntry>;
  update(id: string, entry: Partial<Omit<WeightEntry, 'id'>>): Promise<WeightEntry>;
  delete(id: string): Promise<void>;
}

const KG_TO_LB = 2.2046226218;

export function toKgLb(weight: number, unit: Unit): { kg: number; lb: number } {
  if (!Number.isFinite(weight)) {
    throw new Error('Weight value must be a finite number');
  }

  if (unit === 'kg') {
    return { kg: weight, lb: Number((weight * KG_TO_LB).toFixed(2)) };
  }

  return { kg: Number((weight / KG_TO_LB).toFixed(2)), lb: weight };
}

export function sortWeightEntries(entries: Iterable<WeightEntry>): WeightEntry[] {
  return Array.from(entries).sort((a, b) => {
    const aTime = new Date(a.loggedAt).getTime();
    const bTime = new Date(b.loggedAt).getTime();

    return bTime - aTime;
  });
}
