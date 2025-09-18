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
  create(_entry: Omit<WeightEntry, 'id'>): Promise<WeightEntry>;
  update(_id: string, _entry: Partial<Omit<WeightEntry, 'id'>>): Promise<WeightEntry>;
  delete(_id: string): Promise<void>;
}

const KG_TO_LB = 2.2046226218;
const ISO_8601_UTC =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

export function isValidLoggedAt(loggedAt: string): boolean {
  if (!ISO_8601_UTC.test(loggedAt)) {
    return false;
  }

  const timestamp = Date.parse(loggedAt);
  return Number.isFinite(timestamp);
}

export function assertValidLoggedAt(loggedAt: string): string {
  if (!isValidLoggedAt(loggedAt)) {
    throw new Error(
      "loggedAt must be an ISO 8601 UTC timestamp (e.g., 2023-01-01T12:00:00.000Z)",
    );
  }

  return loggedAt;
}

export function loggedAtToDate(loggedAt: string): Date {
  return new Date(assertValidLoggedAt(loggedAt));
}

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
    const aValid = isValidLoggedAt(a.loggedAt);
    const bValid = isValidLoggedAt(b.loggedAt);

    if (aValid && bValid) {
      return b.loggedAt.localeCompare(a.loggedAt);
    }

    if (aValid) {
      return -1;
    }

    if (bValid) {
      return 1;
    }

    return 0;
  });
}
