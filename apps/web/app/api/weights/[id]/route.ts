import { NextResponse } from 'next/server';

import {
  isValidIsoTimestamp,
  isValidLocalDate,
  isValidLocalTime,
  makeWeightStore,
  type WeightEntry,
} from '../../../../lib/store/serverFactory';

type PatchPayload = Partial<WeightEntry>;

function parsePartialPayload(data: unknown): Partial<Omit<WeightEntry, 'id'>> | null {
  if (typeof data !== 'object' || data === null) {
    return null;
  }

  const payload = data as PatchPayload;
  const result: Partial<Omit<WeightEntry, 'id'>> = {};

  if (
    Object.prototype.hasOwnProperty.call(payload, 'kg') ||
    Object.prototype.hasOwnProperty.call(payload, 'lb') ||
    Object.prototype.hasOwnProperty.call(payload, 'enteredUnit')
  ) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'readingDate')) {
    if (typeof payload.readingDate !== 'string' || !isValidLocalDate(payload.readingDate)) {
      return null;
    }
    result.readingDate = payload.readingDate;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'readingTime')) {
    const value = payload.readingTime;
    if (value === null || typeof value === 'undefined') {
      result.readingTime = null;
    } else if (typeof value === 'string' && isValidLocalTime(value)) {
      result.readingTime = value;
    } else {
      return null;
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'createdAtIso')) {
    if (typeof payload.createdAtIso !== 'string' || !isValidIsoTimestamp(payload.createdAtIso)) {
      return null;
    }
    result.createdAtIso = payload.createdAtIso;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'note')) {
    const value = payload.note;
    if (value !== null && typeof value !== 'string') {
      return null;
    }
    result.note = value ?? null;
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
