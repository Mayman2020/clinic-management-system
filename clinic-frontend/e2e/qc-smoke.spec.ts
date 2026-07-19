import { test, expect } from '@playwright/test';

const adminCreds = { username: 'admin', password: 'Dev@Local2026!' };

async function login(page: Parameters<typeof test>[0]['page']) {
  await page.goto('/auth/login');
  await page.waitForSelector('input[autocomplete="username"]', { timeout: 60_000 });
  await page.locator('input[autocomplete="username"]').fill(adminCreds.username);
  await page.locator('input[type="password"]').fill(adminCreds.password);
  await page.locator('button.login-submit').click();
  await page.waitForURL(/\/admin\/(dashboard|profile)/, { timeout: 30_000 });
}

test.describe('Clinic admin smoke', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/admin\/(dashboard|profile)/);
  });

  test('loads dashboard and core management routes', async ({ page }) => {
    await expect(page.locator('.page-shell').first()).toBeVisible();
    for (const route of ['patients', 'appointments', 'billing', 'reports', 'settings']) {
      await page.goto(`/admin/${route}`);
      await expect(page.locator('.page-shell')).toBeVisible();
    }
  });

  test('opens profile and notifications', async ({ page }) => {
    await page.goto('/admin/profile');
    await expect(page.locator('.pf-form').first()).toBeVisible();
    await page.goto('/admin/notifications');
    await expect(page.locator('.estate-card')).toBeVisible();
  });

  test('reports page shows KPI cards', async ({ page }) => {
    await page.goto('/admin/reports');
    await expect(page.locator('.reports-kpi')).toBeVisible();
    await expect(page.locator('.reports-grid')).toBeVisible();
  });

  test('consultation and queue routes load', async ({ page }) => {
    for (const route of ['consultation', 'queue', 'lab', 'radiology']) {
      await page.goto(`/admin/${route}`);
      await expect(page.locator('.page-shell')).toBeVisible();
    }
  });
});
