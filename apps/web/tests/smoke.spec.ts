import { expect, test } from '@playwright/test';

test('homepage responds with 200 and renders title', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/Health Control Panel/);
  await expect(page.getByRole('heading', { level: 2, name: 'Welcome' })).toBeVisible();
});

test('healthcheck endpoint returns ok payload', async ({ request }) => {
  const response = await request.get('/api/healthcheck');
  expect(response.status()).toBe(200);
  const json = await response.json();
  expect(json.ok).toBe(true);
  expect(typeof json.timestamp).toBe('number');
});
