import {
  assertValidIsoTimestamp,
  assertValidLocalDate,
  assertValidLocalTime,
  getLocalDateParts,
  isUnit,
  isValidIsoTimestamp,
  isValidLocalDate,
  isValidLocalTime,
  isoTimestampToDate,
  sortWeightEntries,
  toKgLb,
  type Unit,
  type WeightEntry,
  type WeightStore,
} from './shared';

const STORAGE_KEY = 'hcp:weights';

let memoryEntries: WeightEntry[] = [];

type LegacyWeightEntry = {
  id: string;
  weight: number;
  unit: Unit;
  loggedAt: string;
  note?: string | null;
};

function hasBrowserStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeWeightsFromEntry(
  entry: Pick<WeightEntry, 'kg' | 'lb' | 'enteredUnit'>,
): Pick<WeightEntry, 'kg' | 'lb' | 'enteredUnit'> {
  if (!isUnit(entry.enteredUnit)) {
    throw new Error('enteredUnit must be kg or lb');
  }

  if (typeof entry.kg !== 'number' || !Number.isFinite(entry.kg)) {
    throw new Error('kg must be a finite number');
  }

  if (typeof entry.lb !== 'number' || !Number.isFinite(entry.lb)) {
    throw new Error('lb must be a finite number');
  }

  const measurementValue = entry.enteredUnit === 'kg' ? entry.kg : entry.lb;
  const weights = toKgLb(measurementValue, entry.enteredUnit);

  return { ...weights, enteredUnit: entry.enteredUnit };
}

function normalizeWeightsForUpdate(
  current: WeightEntry,
  partial: Partial<Omit<WeightEntry, 'id'>>,
): Pick<WeightEntry, 'kg' | 'lb' | 'enteredUnit'> {
  const hasKg = Object.prototype.hasOwnProperty.call(partial, 'kg');
  const hasLb = Object.prototype.hasOwnProperty.call(partial, 'lb');
  const hasEnteredUnit = Object.prototype.hasOwnProperty.call(partial, 'enteredUnit');

  if (!hasKg && !hasLb && !hasEnteredUnit) {
    return {
      kg: current.kg,
      lb: current.lb,
      enteredUnit: current.enteredUnit,
    };
  }

  const nextUnit = hasEnteredUnit ? partial.enteredUnit : current.enteredUnit;

  if (!isUnit(nextUnit)) {
    throw new Error('enteredUnit must be kg or lb');
  }

  if (nextUnit === 'kg') {
    if (hasKg) {
      const kg = partial.kg;
      if (typeof kg !== 'number' || !Number.isFinite(kg)) {
        throw new Error('kg must be a finite number');
      }
      const weights = toKgLb(kg, 'kg');
      return { ...weights, enteredUnit: nextUnit };
    }

    if (hasLb) {
      const lb = partial.lb;
      if (typeof lb !== 'number' || !Number.isFinite(lb)) {
        throw new Error('lb must be a finite number');
      }
      const weights = toKgLb(lb, 'lb');
      return { ...weights, enteredUnit: nextUnit };
    }

    const weights = toKgLb(current.kg, 'kg');
    return { ...weights, enteredUnit: nextUnit };
  }

  // nextUnit === 'lb'
  if (hasLb) {
    const lb = partial.lb;
    if (typeof lb !== 'number' || !Number.isFinite(lb)) {
      throw new Error('lb must be a finite number');
    }
    const weights = toKgLb(lb, 'lb');
    return { ...weights, enteredUnit: nextUnit };
  }

  if (hasKg) {
    const kg = partial.kg;
    if (typeof kg !== 'number' || !Number.isFinite(kg)) {
      throw new Error('kg must be a finite number');
    }
    const weights = toKgLb(kg, 'kg');
    return { ...weights, enteredUnit: nextUnit };
  }

  const weights = toKgLb(current.lb, nextUnit);
  return { ...weights, enteredUnit: nextUnit };
}

function normalizeEntry(raw: unknown): WeightEntry | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const candidate = raw as Partial<WeightEntry>;

  if (
    typeof candidate.id === 'string' &&
    typeof candidate.kg === 'number' &&
    Number.isFinite(candidate.kg) &&
    typeof candidate.lb === 'number' &&
    Number.isFinite(candidate.lb) &&
    isUnit(candidate.enteredUnit) &&
    typeof candidate.readingDate === 'string' &&
    isValidLocalDate(candidate.readingDate) &&
    typeof candidate.createdAtIso === 'string' &&
    isValidIsoTimestamp(candidate.createdAtIso)
  ) {
    if (
      typeof candidate.readingTime !== 'undefined' &&
      candidate.readingTime !== null &&
      (typeof candidate.readingTime !== 'string' ||
        !isValidLocalTime(candidate.readingTime))
    ) {
      return null;
    }

    if (typeof candidate.note !== 'undefined' && candidate.note !== null && typeof candidate.note !== 'string') {
      return null;
    }

    return {
      id: candidate.id,
      kg: candidate.kg,
      lb: candidate.lb,
      enteredUnit: candidate.enteredUnit,
      readingDate: candidate.readingDate,
      readingTime: candidate.readingTime ?? null,
      createdAtIso: candidate.createdAtIso,
      note: candidate.note ?? null,
    };
  }

  const legacy = raw as Partial<LegacyWeightEntry>;

  if (
    typeof legacy.id === 'string' &&
    typeof legacy.weight === 'number' &&
    Number.isFinite(legacy.weight) &&
    isUnit(legacy.unit) &&
    typeof legacy.loggedAt === 'string' &&
    isValidIsoTimestamp(legacy.loggedAt)
  ) {
    const loggedAtDate = isoTimestampToDate(legacy.loggedAt);
    const { readingDate, readingTime } = getLocalDateParts(loggedAtDate);
    const weights = toKgLb(legacy.weight, legacy.unit);

    return {
      id: legacy.id,
      kg: weights.kg,
      lb: weights.lb,
      enteredUnit: legacy.unit,
      readingDate,
      readingTime,
      createdAtIso: loggedAtDate.toISOString(),
      note: legacy.note ?? null,
    };
  }

  return null;
}

function readEntries(): WeightEntry[] {
  if (!hasBrowserStorage()) {
    return memoryEntries.slice();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => normalizeEntry(entry))
      .filter((entry): entry is WeightEntry => entry !== null);
  } catch {
    return [];
  }
}

function writeEntries(entries: WeightEntry[]): void {
  if (!hasBrowserStorage()) {
    memoryEntries = entries.slice();
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function createId(): string {
  if (typeof window !== 'undefined') {
    const randomUUID = window.crypto?.randomUUID;
    if (typeof randomUUID === 'function') {
      return randomUUID.call(window.crypto);
    }
  }

  return Math.random().toString(36).slice(2);
}

export function createLocalStorageWeightStore(): WeightStore {
  return {
    async list() {
      return sortWeightEntries(readEntries());
    },

    async create(entry) {
      const entries = readEntries();
      const weights = normalizeWeightsFromEntry(entry);
      const readingDate = assertValidLocalDate(entry.readingDate);
      const readingTime =
        typeof entry.readingTime === 'undefined' || entry.readingTime === null
          ? null
          : assertValidLocalTime(entry.readingTime);
      const createdAtIso = assertValidIsoTimestamp(entry.createdAtIso);

      const nextEntry: WeightEntry = {
        id: createId(),
        kg: weights.kg,
        lb: weights.lb,
        enteredUnit: weights.enteredUnit,
        readingDate,
        readingTime,
        createdAtIso,
        note: entry.note ?? null,
      };

      const nextEntries = [...entries, nextEntry];
      writeEntries(nextEntries);

      return nextEntry;
    },

    async update(id, partial) {
      const entries = readEntries();
      const index = entries.findIndex((entry) => entry.id === id);

      if (index === -1) {
        throw new Error(`Unable to update weight entry ${id}`);
      }

      const current = entries[index];
      const weights = normalizeWeightsForUpdate(current, partial);
      const updated: WeightEntry = {
        ...current,
        ...weights,
      };

      if (Object.prototype.hasOwnProperty.call(partial, 'readingDate')) {
        if (typeof partial.readingDate !== 'string') {
          throw new Error("readingDate must be a local date formatted as 'YYYY-MM-DD'");
        }
        updated.readingDate = assertValidLocalDate(partial.readingDate);
      }

      if (Object.prototype.hasOwnProperty.call(partial, 'readingTime')) {
        const value = partial.readingTime;
        if (value === null || typeof value === 'undefined') {
          updated.readingTime = null;
        } else {
          updated.readingTime = assertValidLocalTime(value);
        }
      }

      if (Object.prototype.hasOwnProperty.call(partial, 'createdAtIso')) {
        if (typeof partial.createdAtIso !== 'string') {
          throw new Error(
            'createdAtIso must be an ISO 8601 UTC timestamp (e.g., 2023-01-01T12:00:00.000Z)',
          );
        }
        updated.createdAtIso = assertValidIsoTimestamp(partial.createdAtIso);
      }

      if (Object.prototype.hasOwnProperty.call(partial, 'note')) {
        const value = partial.note;
        if (value !== null && typeof value !== 'string') {
          throw new Error('note must be a string or null');
        }
        updated.note = value ?? null;
      }

      const nextEntries = entries.slice();
      nextEntries[index] = updated;
      writeEntries(nextEntries);

      return updated;
    },

    async delete(id) {
      const entries = readEntries();
      const nextEntries = entries.filter((entry) => entry.id !== id);

      if (nextEntries.length === entries.length) {
        return;
      }

      writeEntries(nextEntries);
    },
  };
}
