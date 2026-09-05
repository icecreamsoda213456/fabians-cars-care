import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test, { after, before } from 'node:test';

const testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'fabians-pos-'));
const testDatabasePath = path.join(testDirectory, 'test.sqlite');

process.env.APP_ENV = 'test';
process.env.PORT = '0';
process.env.SQLITE_DB_PATH = testDatabasePath;
process.env.JWT_SECRET = 'fabians-pos-test-secret-that-is-longer-than-32-characters';

let baseUrl;
let stopServer;
let ownerToken;
let cashierToken;

async function request(pathname, {
  method = 'GET',
  token,
  body,
  expectedStatus = 200,
} = {}) {
  const response = await fetch(`${baseUrl}/api${pathname}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => ({}));
  assert.equal(
    response.status,
    expectedStatus,
    `${method} ${pathname}: ${JSON.stringify(data)}`
  );
  return data;
}

async function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: { username, password },
  });
}

before(async () => {
  const serverModule = await import('../src/server.js');
  stopServer = serverModule.stopServer;
  const server = await serverModule.startServer({ listenPort: 0 });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;

  ownerToken = (await login('joey', 'joey12345')).token;
  cashierToken = (await login('cashier', 'cashier123')).token;
});

after(async () => {
  await stopServer?.();
  fs.rmSync(testDirectory, { recursive: true, force: true });
});

test('health and SQLite settings are available offline', async () => {
  const health = await request('/health');
  assert.equal(health.ok, true);
  assert.equal(health.databaseEngine, 'SQLite');
  assert.equal(health.storageMode, 'local-offline');
  assert.ok(!Number.isNaN(new Date(health.databaseTime).getTime()));

  const settings = await request('/settings', { token: ownerToken });
  assert.deepEqual(settings.enabledPaymentMethods, ['cash', 'gcash', 'card']);
  assert.deepEqual(settings.commonBills, [100, 200, 500, 1000]);

  const saved = await request('/settings', {
    method: 'PATCH',
    token: ownerToken,
    body: {
      ...settings,
      receiptFooter: 'Offline SQLite test receipt',
    },
  });
  assert.equal(saved.receiptFooter, 'Offline SQLite test receipt');
});

test('product create, edit, soft delete, and restore preserve API contracts', async () => {
  const created = await request('/products', {
    method: 'POST',
    token: ownerToken,
    expectedStatus: 201,
    body: {
      name: 'SQLite Test Filter',
      barcode: 'SQLITE-TEST-001',
      categoryName: 'Test Parts',
      stock: 4,
      reorderLevel: 1,
      buyPrice: 80,
      salePrice: 120,
      imageUrl: '/product-images/oil-filter.svg',
    },
  });
  assert.equal(created.stock, 4);

  const updated = await request(`/products/${created.id}`, {
    method: 'PATCH',
    token: ownerToken,
    body: {
      ...created,
      name: 'SQLite Test Filter Updated',
      barcode: 'SQLITE-TEST-002',
      stock: 6,
      salePrice: 135,
      imageUrl: created.imageUrl,
    },
  });
  assert.equal(updated.name, 'SQLite Test Filter Updated');
  assert.equal(updated.stock, 6);
  assert.equal(updated.salePrice, 135);

  await request(`/products/${created.id}`, {
    method: 'DELETE',
    token: ownerToken,
  });
  const deleted = await request('/products/deleted', { token: ownerToken });
  assert.ok(deleted.some((product) => product.id === created.id));

  const restored = await request(`/products/${created.id}/restore`, {
    method: 'POST',
    token: ownerToken,
    body: {},
  });
  assert.equal(restored.id, created.id);
});

test('checkout, receipt, cashier void policy, and stock restoration are atomic', async () => {
  const products = await request('/products?search=4971295131204');
  const product = products[0];
  assert.ok(product);
  const originalStock = product.stock;

  const receipt = await request('/checkout', {
    method: 'POST',
    token: cashierToken,
    expectedStatus: 201,
    body: {
      paymentMethod: 'cash',
      cashReceived: 500,
      items: [{ productId: product.id, quantity: 1 }],
    },
  });
  assert.equal(receipt.status, 'paid');
  assert.equal(receipt.changeAmount, 500 - receipt.totalAmount);
  assert.equal(receipt.totalItems, 1);

  const afterSale = (await request('/products?search=4971295131204'))[0];
  assert.equal(afterSale.stock, originalStock - 1);

  await request(`/sales/${receipt.id}/void`, {
    method: 'POST',
    token: cashierToken,
    body: { reason: '' },
    expectedStatus: 400,
  });

  const voided = await request(`/sales/${receipt.id}/void`, {
    method: 'POST',
    token: cashierToken,
    body: { reason: 'Customer cancelled purchase' },
  });
  assert.equal(voided.status, 'voided');
  assert.equal(voided.voidReason, 'Customer cancelled purchase');

  const afterVoid = (await request('/products?search=4971295131204'))[0];
  assert.equal(afterVoid.stock, originalStock);

  await request(`/sales/${receipt.id}/void`, {
    method: 'POST',
    token: ownerToken,
    body: { reason: '' },
    expectedStatus: 409,
  });
});

test('reports and owner audit reflect local SQLite activity', async () => {
  const today = new Date().toISOString().slice(0, 10);
  const report = await request(`/reports/summary?from=${today}&to=${today}`);
  assert.equal(report.range.from, today);
  assert.equal(report.range.to, today);
  assert.equal(report.dailySales.length, 1);
  assert.equal(report.monthlySales.length, 1);

  const activity = await request('/users/activity?limit=250', {
    token: ownerToken,
  });
  assert.ok(activity.activities.some((entry) => entry.action === 'sale_completed'));
  assert.ok(activity.activities.some((entry) => entry.action === 'sale_voided'));
});
