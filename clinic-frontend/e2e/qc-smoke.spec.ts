import { test, expect } from '@playwright/test';

test.describe('Clinic admin smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForSelector('input[autocomplete="username"]', { timeout: 60_000 });
    await page.locator('input[autocomplete="username"]').fill('admin');
    const passwords = ['admin123', 'Admin1234!'];
    let loggedIn = false;
    for (const password of passwords) {
      await page.locator('input[type="password"]').fill(password);
      await page.locator('button.login-submit').click();
      try {
        await page.waitForURL(/\/admin\/(dashboard|profile)/, { timeout: 15_000 });
        loggedIn = true;
        break;
      } catch {
        await page.goto('/auth/login');
        await page.waitForSelector('input[autocomplete="username"]');
        await page.locator('input[autocomplete="username"]').fill('admin');
      }
    }
    if (!loggedIn) throw new Error('Login failed for admin');
    if (page.url().includes('/admin/profile')) {
      const pwdForm = page.locator('form').filter({ has: page.locator('input[formControlName="confirmPassword"]') });
      await pwdForm.locator('input[formControlName="currentPassword"]').fill('admin123');
      await pwdForm.locator('input[formControlName="newPassword"]').fill('Admin1234!');
      await pwdForm.locator('input[formControlName="confirmPassword"]').fill('Admin1234!');
      await pwdForm.locator('button[type="submit"]').click();
      await page.waitForURL(/\/admin\/dashboard/, { timeout: 60_000 }).catch(() => page.goto('/admin/dashboard'));
    }
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('loads dashboard and key admin routes', async ({ page }) => {
    await expect(page.locator('.page-shell').first()).toBeVisible();
    const routes = ['patients', 'appointments', 'billing', 'reports', 'settings'];
    for (const route of routes) {
      await page.goto(`/admin/${route}`);
      await expect(page.locator('.page-shell')).toBeVisible();
    }
  });

  test('opens profile and notifications', async ({ page }) => {
    await page.goto('/admin/profile');
    await expect(page.locator('.profile-form').first()).toBeVisible();
    await page.goto('/admin/notifications');
    await expect(page.locator('.estate-card')).toBeVisible();
  });

  test('reports page shows KPI cards', async ({ page }) => {
    await page.goto('/admin/reports');
    await expect(page.locator('.reports-kpi, .reports-grid')).toBeVisible();
  });

  test('consultation and queue routes load', async ({ page }) => {
    for (const route of ['consultation', 'queue', 'lab', 'radiology']) {
      await page.goto(`/admin/${route}`);
      await expect(page.locator('.page-shell')).toBeVisible();
    }
  });
});
