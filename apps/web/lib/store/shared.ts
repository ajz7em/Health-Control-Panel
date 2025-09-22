export type Unit = 'kg' | 'lb';

export interface WeightEntry {
  id: string;
  kg: number; // 2dp
  lb: number; // 2dp
  enteredUnit: Unit; // how the user typed it
  readingDate: string; // 'YYYY-MM-DD' (local date)
  readingTime?: string | null; // 'HH:mm' for "Now"; null for backfills
  createdAtIso: string; // ISO UTC audit
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
const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_TIME = /^\d{2}:\d{2}$/;

export function isUnit(value: unknown): value is Unit {
  return value === 'kg' || value === 'lb';
}

export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

export function toKgLb(weight: number, unit: Unit): { kg: number; lb: number } {
  if (!Number.isFinite(weight)) {
    throw new Error('Weight value must be a finite number');
  }

  if (unit === 'kg') {
    return {
      kg: roundToTwoDecimals(weight),
      lb: roundToTwoDecimals(weight * KG_TO_LB),
    };
  }

  return {
    kg: roundToTwoDecimals(weight / KG_TO_LB),
    lb: roundToTwoDecimals(weight),
  };
}

export function isValidIsoTimestamp(value: string): boolean {
  if (!ISO_8601_UTC.test(value)) {
    return false;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
}

export function assertValidIsoTimestamp(value: string): string {
  if (!isValidIsoTimestamp(value)) {
    throw new Error(
      'createdAtIso must be an ISO 8601 UTC timestamp (e.g., 2023-01-01T12:00:00.000Z)',
    );
  }

  return value;
}

export function isoTimestampToDate(value: string): Date {
  return new Date(assertValidIsoTimestamp(value));
}

export function isValidLocalDate(value: string): boolean {
  if (!LOCAL_DATE.test(value)) {
    return false;
  }

  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function assertValidLocalDate(value: string): string {
  if (!isValidLocalDate(value)) {
    throw new Error("readingDate must be a local date formatted as 'YYYY-MM-DD'");
  }

  return value;
}

export function isValidLocalTime(value: string): boolean {
  if (!LOCAL_TIME.test(value)) {
    return false;
  }

  const [hourStr, minuteStr] = value.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return false;
  }

  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

export function assertValidLocalTime(value: string): string {
  if (!isValidLocalTime(value)) {
    throw new Error("readingTime must be formatted as 'HH:mm'");
  }

  return value;
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatLocalTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

export function getLocalDateParts(date: Date): { readingDate: string; readingTime: string } {
  return {
    readingDate: formatLocalDate(date),
    readingTime: formatLocalTime(date),
  };
}

export function sortWeightEntries(entries: Iterable<WeightEntry>): WeightEntry[] {
  return Array.from(entries).sort((a, b) => {
    const aValid = typeof a.createdAtIso === 'string' && isValidIsoTimestamp(a.createdAtIso);
    const bValid = typeof b.createdAtIso === 'string' && isValidIsoTimestamp(b.createdAtIso);

    if (aValid && bValid) {
      return b.createdAtIso.localeCompare(a.createdAtIso);
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
