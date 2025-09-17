import { spawnSync } from 'node:child_process';

const shouldSkip = ['1', 'true', 'yes'].includes((process.env.SKIP_E2E ?? '').toLowerCase());

if (shouldSkip) {
  console.log('Skipping Playwright end-to-end tests (SKIP_E2E set).');
  process.exit(0);
}

const result = spawnSync('pnpm', ['--filter', 'web', 'test:e2e'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
