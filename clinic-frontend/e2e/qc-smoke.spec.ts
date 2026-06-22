import { test, expect } from '@playwright/test';

test.describe('Clinic admin smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[formControlName="username"]').fill('admin');
    await page.locator('input[formControlName="password"]').fill('admin123');
    await page.locator('button.login-submit').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('loads dashboard and key admin routes', async ({ page }) => {
    await expect(page.locator('app-page-header, .page-shell')).toBeVisible();
    const routes = ['patients', 'appointments', 'billing', 'settings'];
    for (const route of routes) {
      await page.goto(`/admin/${route}`);
      await expect(page.locator('.page-shell')).toBeVisible();
    }
  });

  test('opens profile and notifications', async ({ page }) => {
    await page.goto('/admin/profile');
    await expect(page.locator('.profile-form')).toBeVisible();
    await page.goto('/admin/notifications');
    await expect(page.locator('.estate-card')).toBeVisible();
  });
});
