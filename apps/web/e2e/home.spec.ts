import { test, expect } from '@playwright/test';

test('homepage has title and description', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: '나도하루' })).toBeVisible();
  await expect(page.getByText('일상을 공유하고 공감하는 소셜 플랫폼')).toBeVisible();
});
