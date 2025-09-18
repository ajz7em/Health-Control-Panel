/* eslint-env es2020 */

import { sortWeightEntries, toKgLb, type Unit, type WeightEntry, type WeightStore } from './weightStore';

type DecimalLike = { toNumber(): number };

type WeightEntryRecord = {
  id: string;
  kg: DecimalLike;
  lb: DecimalLike;
  readingDate: string;
  readingTime: string | null;
  enteredUnit: string;
  createdAt: Date;
};

/* eslint-disable no-unused-vars */
type PrismaWeightDelegate = {
  findMany(_args: {
    orderBy: Array<{ readingDate?: 'asc' | 'desc'; readingTime?: 'asc' | 'desc'; createdAt?: 'asc' | 'desc' }>;
  }): Promise<WeightEntryRecord[]>;
  create(_args: {
    data: {
      kg: number;
      lb: number;
      readingDate: string;
      readingTime: string | null;
      enteredUnit: string;
    };
  }): Promise<WeightEntryRecord>;
  delete(_args: { where: { id: string } }): Promise<void>;
};
/* eslint-enable no-unused-vars */

type PrismaClientLike = {
  weightEntry: PrismaWeightDelegate;
};

const globalForPrisma = globalThis as typeof globalThis & {
  __weight_prisma__?: PrismaClientLike;
};

type PrismaModule = { PrismaClient: new () => PrismaClientLike };

const getClient = async (): Promise<PrismaClientLike> => {
  if (!globalForPrisma.__weight_prisma__) {
    const prismaModule = (await import('@prisma/client')) as unknown as PrismaModule;
    const PrismaClientConstructor = prismaModule.PrismaClient;
    globalForPrisma.__weight_prisma__ = new PrismaClientConstructor();
  }

  return globalForPrisma.__weight_prisma__;
};

const toWeightEntry = (record: WeightEntryRecord): WeightEntry => ({
  id: record.id,
  kg: record.kg.toNumber(),
  lb: record.lb.toNumber(),
  readingDate: record.readingDate,
  readingTime: record.readingTime ?? null,
  enteredUnit: record.enteredUnit as Unit,
  createdAt: record.createdAt.toISOString(),
});

export class PrismaWeightStore implements WeightStore {
  private readonly clientPromise: Promise<PrismaClientLike>;

  constructor(client?: PrismaClientLike) {
    this.clientPromise = client ? Promise.resolve(client) : getClient();
  }

  async list(): Promise<WeightEntry[]> {
    const client = await this.clientPromise;
    const results = await client.weightEntry.findMany({
      orderBy: [
        { readingDate: 'asc' },
        { readingTime: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return sortWeightEntries(results.map((record: WeightEntryRecord) => toWeightEntry(record)));
  }

  async add(
    input: Omit<WeightEntry, 'id' | 'createdAt' | 'kg' | 'lb'> & { value: number; unit: Unit },
  ): Promise<WeightEntry> {
    const client = await this.clientPromise;
    const { value, unit, readingDate, readingTime, enteredUnit } = input;
    const { kg, lb } = toKgLb(value, unit);

    const created = await client.weightEntry.create({
      data: {
        kg,
        lb,
        readingDate,
        readingTime: readingTime ?? null,
        enteredUnit,
      },
    });

    return toWeightEntry(created);
  }

  async remove(id: string): Promise<void> {
    const client = await this.clientPromise;
    await client.weightEntry.delete({ where: { id } });
  }
}
