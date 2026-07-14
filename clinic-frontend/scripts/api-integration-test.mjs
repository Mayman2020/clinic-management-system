/**
 * Clinic System — API ↔ frontend integration smoke test.
 * Usage: node scripts/api-integration-test.mjs [baseUrl]
 * Default: http://localhost:8086/api/v1
 */
const BASE = (process.argv[2] || 'http://localhost:8086/api/v1').replace(/\/$/, '');
const LOGIN = { username: 'admin', password: 'Dev@Local2026!' };

const results = [];
let token = '';
let branchId = 1;

function pass(name, detail = '') {
  results.push({ name, ok: true, detail });
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail = '') {
  results.push({ name, ok: false, detail });
  console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
}

async function request(method, path, { body, expect = [200, 201], auth = true, branch = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (branch && branchId) headers['X-Branch-Id'] = String(branchId);
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  let json = null;
  const text = await res.text();
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  const ok = expect.includes(res.status);
  return { ok, status: res.status, json, path, method };
}

async function check(name, method, path, opts = {}) {
  try {
    const r = await request(method, path, opts);
    if (r.ok) {
      pass(name, `${r.status}`);
      return r.json;
    }
    fail(name, `HTTP ${r.status} ${r.json?.message || ''}`.trim());
    return null;
  } catch (err) {
    fail(name, err.message);
    return null;
  }
}

async function main() {
  console.log(`\nClinic API Integration Test\nBase: ${BASE}\n`);

  const loginRes = await check('POST /auth/login', 'POST', '/auth/login', {
    body: LOGIN,
    auth: false,
    branch: false
  });
  token = loginRes?.data?.accessToken || loginRes?.data?.token || '';
  if (!token) {
    console.error('\nLogin failed — cannot continue.\n');
    process.exit(1);
  }

  const branches = await check('GET /branches', 'GET', '/branches');
  if (branches?.data?.content?.length) branchId = branches.data.content[0].id;
  else if (branches?.data?.length) branchId = branches.data[0].id;

  await check('GET /dashboard/stats', 'GET', `/dashboard/stats?branchId=${branchId}`);
  await check('GET /patients', 'GET', '/patients?page=0&size=5');
  await check('GET /patients search', 'GET', '/patients?page=0&size=5&q=test');
  await check('GET /doctors', 'GET', '/doctors?page=0&size=5');
  await check('GET /doctors search', 'GET', '/doctors?page=0&size=5&q=test');
  await check('GET /appointments', 'GET', '/appointments?page=0&size=5');
  await check('GET /appointments search', 'GET', '/appointments?page=0&size=5&q=test');
  await check('GET /consultations', 'GET', '/consultations?page=0&size=5');
  await check('GET /prescriptions', 'GET', '/prescriptions?page=0&size=5');
  await check('GET /lab/requests', 'GET', '/lab/requests?page=0&size=5');
  await check('GET /radiology/requests', 'GET', '/radiology/requests?page=0&size=5');
  await check('GET /billing/invoices', 'GET', '/billing/invoices?page=0&size=5');
  await check('GET /billing/invoices search', 'GET', '/billing/invoices?page=0&size=5&q=test');
  await check('GET /billing/payments', 'GET', '/billing/payments?page=0&size=5');
  await check('GET /billing/payments search', 'GET', '/billing/payments?page=0&size=5&q=test');
  await check('GET /insurance/providers', 'GET', '/insurance/providers?page=0&size=5');
  await check('GET /users', 'GET', '/users?page=0&size=5');
  await check('GET /users search', 'GET', '/users?page=0&size=5&q=test');
  await check('GET /notifications/my', 'GET', '/notifications/my?page=0&size=5');
  await check('GET /notifications/my/unread-count', 'GET', '/notifications/my/unread-count');
  await check('GET /audit-logs', 'GET', '/audit-logs?page=0&size=5');
  await check('GET /audit-logs search', 'GET', '/audit-logs?page=0&size=5&q=test');
  await check('GET /lookups/admin/by-type SPECIALTY', 'GET', '/lookups/admin/by-type?type=SPECIALTY');
  await check('GET /role-permissions/me', 'GET', '/role-permissions/me');
  await check('GET /queue/today', 'GET', `/queue/today?branchId=${branchId}`);
  await check('POST /auth/forgot-password', 'POST', '/auth/forgot-password', {
    body: { username: LOGIN.username },
    auth: false,
    branch: false
  });

  const passed = results.filter((r) => r.ok).length;
  const total = results.length;
  console.log(`\n${passed}/${total} passed\n`);
  process.exit(passed === total ? 0 : 1);
}

main();
