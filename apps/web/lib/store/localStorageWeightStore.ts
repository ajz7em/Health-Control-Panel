import { sortWeightEntries, type WeightEntry, type WeightStore } from './shared';

const STORAGE_KEY = 'hcp:weights';

let memoryEntries: WeightEntry[] = [];

function hasBrowserStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
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
    const parsed = JSON.parse(raw) as WeightEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((entry): entry is WeightEntry =>
        Boolean(
          entry &&
            typeof entry.id === 'string' &&
            typeof entry.weight === 'number' &&
            typeof entry.unit === 'string' &&
            typeof entry.loggedAt === 'string',
        ),
      )
      .map((entry) => ({ ...entry, note: entry.note ?? null }));
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
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
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
      const nextEntry: WeightEntry = {
        id: createId(),
        weight: entry.weight,
        unit: entry.unit,
        loggedAt: entry.loggedAt,
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

      const updated: WeightEntry = {
        ...entries[index],
        ...partial,
        note: partial.note ?? entries[index].note ?? null,
      };

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
