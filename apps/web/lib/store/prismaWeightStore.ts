/* eslint-env es2020 */

import { PrismaClient } from '@prisma/client';
import { sortWeightEntries, toKgLb, type Unit, type WeightEntry, type WeightStore } from './weightStore';

const globalForPrisma = globalThis as typeof globalThis & {
  __weight_prisma__?: PrismaClient;
};

const getClient = () => {
  if (!globalForPrisma.__weight_prisma__) {
    globalForPrisma.__weight_prisma__ = new PrismaClient();
  }

  return globalForPrisma.__weight_prisma__;
};

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
  private client: PrismaClient;

  constructor(client: PrismaClient = getClient()) {
    this.client = client;
  }

  async list(): Promise<WeightEntry[]> {
    const results = await this.client.weightEntry.findMany({
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
    const { value, unit, readingDate, readingTime, enteredUnit } = input;
    const { kg, lb } = toKgLb(value, unit);

    const created = await this.client.weightEntry.create({
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
    await this.client.weightEntry.delete({ where: { id } });
  }
}
