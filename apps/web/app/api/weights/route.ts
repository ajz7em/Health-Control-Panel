import { NextResponse } from 'next/server';
import { makeWeightStore, sortWeightEntries } from '../../../lib/store/weightStore';
import { nowLocalNY } from '../../../lib/time';
import { weightCreateSchema } from '../../../lib/validation';

export async function GET() {
  const store = await makeWeightStore();
  const entries = await store.list();
  return NextResponse.json(sortWeightEntries(entries));
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = weightCreateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data = parsed.data;
  const store = await makeWeightStore();

  const { readingDate: todayDate, readingTime: currentTime } = nowLocalNY();

  let readingDate = todayDate;
  let readingTime: string | null = currentTime;

  if (data.mode === 'backfill') {
    readingDate = data.readingDate!;
    readingTime = null;

    if (readingDate > todayDate) {
      return NextResponse.json({ error: 'Backfilled dates cannot be in the future.' }, { status: 400 });
    }
  }

  const entry = await store.add({
    readingDate,
    readingTime,
    value: data.value,
    unit: data.unit,
    enteredUnit: data.unit,
  });

  return NextResponse.json(entry, { status: 201 });
}
