import { NextResponse } from 'next/server';

import {
  isValidLoggedAt,
  makeWeightStore,
  type Unit,
  type WeightEntry,
} from '../../../../lib/store/serverFactory';

function isUnit(value: unknown): value is Unit {
  return value === 'kg' || value === 'lb';
}

function parsePartialPayload(data: unknown): Partial<Omit<WeightEntry, 'id'>> | null {
  if (typeof data !== 'object' || data === null) {
    return null;
  }

  const { weight, unit, loggedAt, note } = data as Partial<WeightEntry>;
  const result: Partial<Omit<WeightEntry, 'id'>> = {};

  if (typeof weight !== 'undefined') {
    if (typeof weight !== 'number' || !Number.isFinite(weight)) {
      return null;
    }
    result.weight = weight;
  }

  if (typeof unit !== 'undefined') {
    if (!isUnit(unit)) {
      return null;
    }
    result.unit = unit;
  }

  if (typeof loggedAt !== 'undefined') {
    if (typeof loggedAt !== 'string' || !isValidLoggedAt(loggedAt)) {
      return null;
    }
    result.loggedAt = loggedAt;
  }

  if (typeof note !== 'undefined') {
    if (note !== null && typeof note !== 'string') {
      return null;
    }
    result.note = note ?? null;
  }

  return Object.keys(result).length > 0 ? result : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse<WeightEntry | { error: string }>> {
  const updates = parsePartialPayload(await request.json().catch(() => null));

  if (!updates) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }

  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: 'Missing weight entry identifier' }, { status: 400 });
  }

  try {
    const store = await makeWeightStore();
    const entry = await store.update(id, updates);
    return NextResponse.json(entry);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse<null | { error: string }>> {
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: 'Missing weight entry identifier' }, { status: 400 });
  }

  try {
    const store = await makeWeightStore();
    await store.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
