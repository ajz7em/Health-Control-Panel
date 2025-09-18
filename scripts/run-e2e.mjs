import { spawn } from 'node:child_process';

const shouldSkip = ['1', 'true', 'yes'].includes((process.env.SKIP_E2E ?? '').toLowerCase());

if (shouldSkip) {
  console.log('Skipping Playwright end-to-end tests (SKIP_E2E set).');
  process.exit(0);
}

const runPlaywright = () =>
  new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['--filter', 'web', 'test:e2e'], {
      shell: process.platform === 'win32',
      env: {
        ...process.env,
        CI: process.env.CI ?? 'true',
        PW_TEST_HTML_REPORT_OPEN: 'never',
      },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on('error', reject);

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });

const { code, stdout, stderr } = await runPlaywright();

if (
  code &&
  (stdout.includes("Executable doesn't exist") ||
    stderr.includes("Executable doesn't exist") ||
    stderr.includes('command "playwright" not found'))
) {
  console.warn(
    'Skipping Playwright end-to-end tests because required browsers are not installed. ' +
      'Run "pnpm --filter web exec playwright install" to download them.',
  );
  process.exit(0);
}

process.exit(code ?? 1);
