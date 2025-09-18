'use server';

import type { WeightStore } from './shared';

export type { Unit, WeightEntry, WeightStore } from './shared';
export { isValidLoggedAt, sortWeightEntries, toKgLb } from './shared';

async function loadLocalStore(): Promise<WeightStore> {
  const { createLocalStorageWeightStore } = await import('./localStorageWeightStore');
  return createLocalStorageWeightStore();
}

async function loadPrismaStore(): Promise<WeightStore> {
  const { createPrismaWeightStore } = await import('./prismaWeightStore');
  return createPrismaWeightStore();
}

function shouldFallbackToLocal(error: unknown): boolean {
  if (process.env.NEXT_RUNTIME === 'edge') {
    return true;
  }

  if (process.env.WEIGHT_STORE_STRATEGY === 'local') {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('weightentry model is not defined')) {
      return true;
    }

    if (message.includes('cannot find module') && message.includes('prisma')) {
      return true;
    }

    if (message.includes('prisma client is not a constructor')) {
      return true;
    }
  }

  return false;
}

export async function makeWeightStore(): Promise<WeightStore> {
  try {
    return await loadPrismaStore();
  } catch (error) {
    if (!shouldFallbackToLocal(error)) {
      throw error;
    }

    return loadLocalStore();
  }
}
