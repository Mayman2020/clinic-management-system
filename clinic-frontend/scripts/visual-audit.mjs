import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import path from 'path';

const BASE = 'http://127.0.0.1:4310';
const OUT = path.resolve('visual-audit-screenshots');

function fakeJwt() {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 86400 * 30,
    sub: 'admin',
    role: 'ADMIN'
  })).toString('base64url');
  return `${header}.${payload}.dev-signature`;
}

const MOCK_USER = {
  id: 1,
  username: 'admin',
  fullName: 'System Administrator',
  role: 'ADMIN',
  activeRole: 'ADMIN',
  mustChangePassword: false,
  permissions: {}
};

const PUBLIC_ROUTES = ['/auth/login', '/auth/forgot-password', '/queue/tv'];

const ADMIN_ROUTES = [
  '/admin/dashboard',
  '/admin/reception',
  '/admin/patients',
  '/admin/doctors',
  '/admin/appointments',
  '/admin/calendar',
  '/admin/queue',
  '/admin/consultation',
  '/admin/prescription',
  '/admin/lab',
  '/admin/radiology',
  '/admin/billing',
  '/admin/billing/payments',
  '/admin/insurance',
  '/admin/reports',
  '/admin/audit-logs',
  '/admin/settings',
  '/admin/branches',
  '/admin/permissions',
  '/admin/users',
  '/admin/profile',
  '/admin/notifications',
];

async function shot(page, route) {
  const name = route.replace(/\//g, '_').replace(/^_/, '') || 'root';
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
  console.log('OK', route);
}

async function seedAuth(page) {
  const token = fakeJwt();
  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('cm_access_token', token);
    localStorage.setItem('cm_refresh_token', token);
    localStorage.setItem('cm_current_user', JSON.stringify(user));
    localStorage.setItem('cm_lang', 'ar');
  }, { token, user: MOCK_USER });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  for (const route of PUBLIC_ROUTES) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(2500);
    await shot(page, route);
    await page.close();
  }

  const adminPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await seedAuth(adminPage);
  await adminPage.goto(`${BASE}/admin/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await adminPage.waitForTimeout(2000);

  if (!adminPage.url().includes('/admin/')) {
    console.log('Mock auth failed, URL:', adminPage.url());
  } else {
    for (const route of ADMIN_ROUTES) {
      try {
        await adminPage.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
        await adminPage.waitForSelector('app-page-header, .page-shell, .estate-card', { timeout: 15000 }).catch(() => {});
        await adminPage.waitForTimeout(1500);
        await shot(adminPage, route);
      } catch (e) {
        console.log('FAIL', route, e.message);
      }
    }
  }
  await adminPage.close();
  await browser.close();
  console.log('Screenshots saved to', OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
