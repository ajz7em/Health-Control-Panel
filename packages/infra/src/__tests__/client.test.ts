import { afterEach, describe, expect, it, vi } from 'vitest';

describe('Prisma client singleton', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('creates a single instance and reuses it on subsequent imports', async () => {
    const disconnectMock = vi.fn();
    const prismaCtor = vi.fn(() => ({ $disconnect: disconnectMock }));

    vi.mock('@prisma/client', () => ({
      PrismaClient: prismaCtor,
    }));

    const first = await import('../index');
    const second = await import('../index');

    expect(prismaCtor).toHaveBeenCalledTimes(1);
    expect(first.prisma).toBe(second.prisma);

    await first.disconnectPrisma();
    expect(disconnectMock).toHaveBeenCalled();
  });
});
