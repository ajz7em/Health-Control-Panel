/* eslint-env es2020 */

import { toISO_UTC } from '../time';
import { sortWeightEntries, toKgLb, type Unit, type WeightEntry, type WeightStore } from './weightStore';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const STORAGE_KEY = 'health.weight.v1';
const SAVE_DEBOUNCE_MS = 80;

const getMemoryStorage = (): StorageLike => {
  const globalObject = globalThis as typeof globalThis & {
    __weight_demo_memory_storage__?: StorageLike;
  };

  if (!globalObject.__weight_demo_memory_storage__) {
    const data = new Map<string, string>();
    globalObject.__weight_demo_memory_storage__ = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => {
        data.set(key, value);
      },
      removeItem: (key: string) => {
        data.delete(key);
      },
    };
  }

  return globalObject.__weight_demo_memory_storage__!;
};

const getStorage = (): StorageLike => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }

  return getMemoryStorage();
};

const safeParseEntries = (raw: string | null): WeightEntry[] => {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as WeightEntry[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((entry) => ({
      ...entry,
      readingTime: entry.readingTime ?? null,
    }));
  } catch (error) {
    console.warn('Failed to parse stored weights; clearing the demo store.', error);
    return [];
  }
};

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 11);
};

export class LocalStorageWeightStore implements WeightStore {
  private storage: StorageLike;
  private entries: WeightEntry[];
  private pendingSave: ReturnType<typeof setTimeout> | null = null;

  constructor(storage: StorageLike = getStorage()) {
    this.storage = storage;
    this.entries = sortWeightEntries(safeParseEntries(this.storage.getItem(STORAGE_KEY)));
  }

  async list(): Promise<WeightEntry[]> {
    return sortWeightEntries(this.entries);
  }

  async add(
    input: Omit<WeightEntry, 'id' | 'createdAt' | 'kg' | 'lb'> & { value: number; unit: Unit },
  ): Promise<WeightEntry> {
    const { value, unit, readingDate, readingTime, enteredUnit } = input;
    const { kg, lb } = toKgLb(value, unit);

    const entry: WeightEntry = {
      id: createId(),
      kg,
      lb,
      readingDate,
      readingTime: readingTime ?? null,
      createdAt: toISO_UTC(new Date()),
      enteredUnit,
    };

    this.entries = sortWeightEntries([...this.entries, entry]);
    this.scheduleSave();
    return entry;
  }

  async remove(id: string): Promise<void> {
    this.entries = this.entries.filter((entry) => entry.id !== id);
    this.scheduleSave();
  }

  private scheduleSave() {
    if (this.pendingSave) {
      clearTimeout(this.pendingSave);
    }

    this.pendingSave = setTimeout(() => {
      try {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
      } catch (error) {
        console.warn('Failed to persist weight entries to localStorage.', error);
      } finally {
        this.pendingSave = null;
      }
    }, SAVE_DEBOUNCE_MS);
  }
}
