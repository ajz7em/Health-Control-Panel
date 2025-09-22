import { NextResponse } from 'next/server';

import { makeWeightStore, type WeightEntry } from '../../../lib/store/serverFactory';
import {
  getLocalDateParts,
  isUnit,
  isValidLocalDate,
  toKgLb,
} from '../../../lib/store/shared';

type Mode = 'now' | 'backfill';

type PostPayload = {
  value?: unknown;
  unit?: unknown;
  mode?: unknown;
  readingDate?: unknown;
  note?: unknown;
};

function isMode(value: unknown): value is Mode {
  return value === 'now' || value === 'backfill';
}

function parsePayload(data: unknown): Omit<WeightEntry, 'id'> | null {
  if (typeof data !== 'object' || data === null) {
    return null;
  }

  const { value, unit, mode, readingDate, note } = data as PostPayload;

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  if (!isUnit(unit) || !isMode(mode)) {
    return null;
  }

  const now = new Date();
  const { kg, lb } = toKgLb(value, unit);

  let derivedReadingDate: string;
  let derivedReadingTime: string | null;

  if (mode === 'now') {
    const { readingDate: datePart, readingTime } = getLocalDateParts(now);
    derivedReadingDate = datePart;
    derivedReadingTime = readingTime;
  } else {
    if (typeof readingDate !== 'string' || !isValidLocalDate(readingDate)) {
      return null;
    }
    derivedReadingDate = readingDate;
    derivedReadingTime = null;
  }

  let noteValue: string | null = null;
  if (typeof note !== 'undefined') {
    if (note !== null && typeof note !== 'string') {
      return null;
    }
    noteValue = note ?? null;
  }

  return {
    kg,
    lb,
    enteredUnit: unit,
    readingDate: derivedReadingDate,
    readingTime: derivedReadingTime,
    createdAtIso: now.toISOString(),
    note: noteValue,
  };
}

export async function GET(): Promise<NextResponse<WeightEntry[] | { error: string }>> {
  try {
    const store = await makeWeightStore();
    const entries = await store.list();
    return NextResponse.json(entries);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request): Promise<NextResponse<WeightEntry | { error: string }>> {
  const payload = parsePayload(await request.json().catch(() => null));

  if (!payload) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }

  try {
    const store = await makeWeightStore();
    const entry = await store.create(payload);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
