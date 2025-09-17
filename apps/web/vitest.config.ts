import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: [],
    exclude: [...configDefaults.exclude, 'tests/**/*.spec.ts'],
  },
});
