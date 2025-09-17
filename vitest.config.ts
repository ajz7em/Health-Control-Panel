import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    include: ['packages/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'lcov'],
    },
  },
});
