import { NextResponse } from 'next/server';

import {
  isValidLoggedAt,
  makeWeightStore,
  type Unit,
  type WeightEntry,
} from '../../../lib/store/serverFactory';

function isUnit(value: unknown): value is Unit {
  return value === 'kg' || value === 'lb';
}

function parsePayload(data: unknown): Omit<WeightEntry, 'id'> | null {
  if (typeof data !== 'object' || data === null) {
    return null;
  }

  const { weight, unit, loggedAt, note } = data as Partial<WeightEntry>;

  if (!isUnit(unit) || typeof loggedAt !== 'string' || !isValidLoggedAt(loggedAt)) {
    return null;
  }

  if (typeof weight !== 'number' || !Number.isFinite(weight)) {
    return null;
  }

  return {
    weight,
    unit,
    loggedAt,
    note: note ?? null,
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
