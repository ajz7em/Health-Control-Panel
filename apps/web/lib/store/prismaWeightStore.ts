import {
  assertValidIsoTimestamp,
  assertValidLocalDate,
  assertValidLocalTime,
  isUnit,
  isoTimestampToDate,
  sortWeightEntries,
  toKgLb,
  type Unit,
  type WeightEntry,
  type WeightStore,
} from './shared';

type PrismaWeightRecord = {
  id: string;
  kg: number;
  lb: number;
  enteredUnit: Unit;
  readingDate: string;
  readingTime: string | null;
  createdAt: Date | string;
  note?: string | null;
};

type PrismaWeightDelegate = {
  findMany(_args?: unknown): Promise<PrismaWeightRecord[]>;
  create(_args: { data: PrismaWeightCreateInput }): Promise<PrismaWeightRecord>;
  update(_args: {
    where: { id: string };
    data: PrismaWeightUpdateInput;
  }): Promise<PrismaWeightRecord>;
  delete(_args: { where: { id: string } }): Promise<PrismaWeightRecord>;
};

type PrismaWeightCreateInput = {
  kg: number;
  lb: number;
  enteredUnit: Unit;
  readingDate: string;
  readingTime: string | null;
  createdAt: Date;
  note?: string | null;
};

type PrismaWeightUpdateInput = Partial<Omit<PrismaWeightCreateInput, 'createdAt'>> & {
  createdAt?: Date;
};

let prismaClient: unknown | null = null;

async function getClient(): Promise<unknown> {
  if (!prismaClient) {
    const { PrismaClient } = await import('@prisma/client');
    prismaClient = new PrismaClient();
  }

  return prismaClient;
}

function getDelegate(client: unknown): PrismaWeightDelegate {
  const delegate = (client as { weightEntry?: PrismaWeightDelegate }).weightEntry;

  if (!delegate) {
    throw new Error('WeightEntry model is not defined in the Prisma schema.');
  }

  return delegate;
}

function normalizeWeights(
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

function getCreatedAtIso(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    return assertValidIsoTimestamp(value);
  }

  throw new Error('Invalid createdAt value on weight entry record.');
}

function mapRecord(record: PrismaWeightRecord): WeightEntry {
  return {
    id: record.id,
    kg: record.kg,
    lb: record.lb,
    enteredUnit: record.enteredUnit,
    readingDate: record.readingDate,
    readingTime: record.readingTime ?? null,
    createdAtIso: getCreatedAtIso(record.createdAt),
    note: record.note ?? null,
  };
}

export async function createPrismaWeightStore(): Promise<WeightStore> {
  const client = await getClient();
  const delegate = getDelegate(client);

  return {
    async list() {
      const records = await delegate.findMany({ orderBy: { createdAt: 'desc' } });
      return sortWeightEntries(records.map(mapRecord));
    },

    async create(entry) {
      const weights = normalizeWeights(entry);
      const readingDate = assertValidLocalDate(entry.readingDate);
      const readingTime =
        typeof entry.readingTime === 'undefined' || entry.readingTime === null
          ? null
          : assertValidLocalTime(entry.readingTime);
      const record = await delegate.create({
        data: {
          kg: weights.kg,
          lb: weights.lb,
          enteredUnit: weights.enteredUnit,
          readingDate,
          readingTime,
          createdAt: isoTimestampToDate(entry.createdAtIso),
          note: entry.note ?? null,
        },
      });

      return mapRecord(record);
    },

    async update(id, partial) {
      const data: PrismaWeightUpdateInput = {};

      if (Object.prototype.hasOwnProperty.call(partial, 'kg')) {
        throw new Error('Updating weight values is not supported in the Prisma weight store yet.');
      }

      if (Object.prototype.hasOwnProperty.call(partial, 'lb')) {
        throw new Error('Updating weight values is not supported in the Prisma weight store yet.');
      }

      if (Object.prototype.hasOwnProperty.call(partial, 'enteredUnit')) {
        throw new Error('Updating weight values is not supported in the Prisma weight store yet.');
      }

      if (Object.prototype.hasOwnProperty.call(partial, 'readingDate')) {
        if (typeof partial.readingDate !== 'string') {
          throw new Error("readingDate must be a local date formatted as 'YYYY-MM-DD'");
        }
        data.readingDate = assertValidLocalDate(partial.readingDate);
      }

      if (Object.prototype.hasOwnProperty.call(partial, 'readingTime')) {
        const value = partial.readingTime;
        if (value === null || typeof value === 'undefined') {
          data.readingTime = null;
        } else {
          data.readingTime = assertValidLocalTime(value);
        }
      }

      if (Object.prototype.hasOwnProperty.call(partial, 'createdAtIso')) {
        if (typeof partial.createdAtIso !== 'string') {
          throw new Error(
            'createdAtIso must be an ISO 8601 UTC timestamp (e.g., 2023-01-01T12:00:00.000Z)',
          );
        }
        data.createdAt = isoTimestampToDate(partial.createdAtIso);
      }

      if (Object.prototype.hasOwnProperty.call(partial, 'note')) {
        const value = partial.note;
        if (value !== null && typeof value !== 'string') {
          throw new Error('note must be a string or null');
        }
        data.note = value ?? null;
      }

      if (Object.keys(data).length === 0) {
        throw new Error('No supported fields provided for update.');
      }

      const record = await delegate.update({
        where: { id },
        data,
      });

      return mapRecord(record);
    },

    async delete(id) {
      await delegate.delete({ where: { id } });
    },
  };
}
