import { sortWeightEntries, type Unit, type WeightEntry, type WeightStore } from './shared';

type PrismaWeightRecord = {
  id: string;
  weight: number;
  unit: Unit;
  loggedAt: Date;
  note?: string | null;
};

type PrismaWeightDelegate = {
  findMany(_args?: unknown): Promise<PrismaWeightRecord[]>;
  create(_args: { data: PrismaWeightCreateInput }): Promise<PrismaWeightRecord>;
  update(_args: { where: { id: string }; data: PrismaWeightUpdateInput }): Promise<PrismaWeightRecord>;
  delete(_args: { where: { id: string } }): Promise<PrismaWeightRecord>;
};

type PrismaWeightCreateInput = {
  weight: number;
  unit: Unit;
  loggedAt: Date;
  note?: string | null;
};

type PrismaWeightUpdateInput = Partial<PrismaWeightCreateInput>;

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

function mapRecord(record: PrismaWeightRecord): WeightEntry {
  return {
    id: record.id,
    weight: record.weight,
    unit: record.unit,
    loggedAt: record.loggedAt.toISOString(),
    note: record.note ?? null,
  };
}

export async function createPrismaWeightStore(): Promise<WeightStore> {
  const client = await getClient();
  const delegate = getDelegate(client);

  return {
    async list() {
      const records = await delegate.findMany({ orderBy: { loggedAt: 'desc' } });
      return sortWeightEntries(records.map(mapRecord));
    },

    async create(entry) {
      const record = await delegate.create({
        data: {
          weight: entry.weight,
          unit: entry.unit,
          loggedAt: new Date(entry.loggedAt),
          note: entry.note ?? null,
        },
      });

      return mapRecord(record);
    },

    async update(id, partial) {
      const record = await delegate.update({
        where: { id },
        data: {
          ...('weight' in partial ? { weight: partial.weight } : {}),
          ...('unit' in partial ? { unit: partial.unit as Unit } : {}),
          ...('loggedAt' in partial && partial.loggedAt
            ? { loggedAt: new Date(partial.loggedAt) }
            : {}),
          ...('note' in partial ? { note: partial.note ?? null } : {}),
        },
      });

      return mapRecord(record);
    },

    async delete(id) {
      await delegate.delete({ where: { id } });
    },
  };
}
