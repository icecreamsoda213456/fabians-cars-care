import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoStore, DEMO_STORAGE_KEY } from '../src/demo-store.js';

const now = () => new Date('2026-09-10T10:00:00+08:00');
const products = [
  { id: 105, name: 'Sample Oil Filter', barcode: 'FILTER', category: 'Filters', stock: 6, salePrice: 230, imageUrl: '' },
  { id: 121, name: 'Sample Oil', barcode: 'OIL', category: 'Oil', stock: 7, salePrice: 300, imageUrl: '' },
  { id: 131, name: 'Low Stock Oil', barcode: 'LOW', category: 'Oil', stock: 1, salePrice: 270, imageUrl: '' },
];
const settings = { shopName: "Fabian's Car Care", enabledPaymentMethods: ['cash', 'gcash', 'card'], defaultPaymentMethod: 'cash', defaultReorderLevel: 3, recycleRetentionDays: 30, autoOpenReceipt: true };
function fixture() {
  const values = new Map([['fabians-session', 'REAL-SESSION-UNCHANGED']]);
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  return { values, storage, store: createDemoStore({ storage, products, settings, now }) };
}
const saleBody = (quantity = 2, cashReceived = 500) => ({ items: [{ productId: 105, quantity }], paymentMethod: 'cash', cashReceived });

test('seeds 28 itemized receipts and staff history without modifying opening stock or real session', () => {
  const { store, values } = fixture();
  const sales = store.request('GET', '/sales');
  assert.equal(sales.length, 28);
  assert.equal(new Set(sales.map(sale => sale.id)).size, 28);
  for (const sale of sales) {
    const receipt = store.request('GET', `/sales/${sale.id}`);
    assert.match(receipt.receiptNo, /^DEMO-FC-/);
    assert.equal(receipt.isDemo, true);
    assert.ok(Number.isFinite(Date.parse(receipt.saleDate)));
    assert.ok(Date.parse(receipt.saleDate) <= now().getTime());
    assert.equal(receipt.totalAmount, receipt.items.reduce((sum, item) => sum + item.lineTotal, 0));
    assert.equal(receipt.totalItems, receipt.items.reduce((sum, item) => sum + item.quantity, 0));
  }
  assert.deepEqual(store.request('GET', '/products').map(product => product.stock), [6, 7, 1]);
  const activity = store.request('GET', '/users/activity');
  assert.equal(activity.users.length, 3);
  assert.ok(activity.activities.length > 28);
  assert.equal(values.get('fabians-session'), 'REAL-SESSION-UNCHANGED');
});

test('checkout persists an itemized receipt and keeps sales, stock, totals, and change consistent', () => {
  const { store, storage } = fixture();
  const previousTotal = store.request('GET', '/dashboard').todaySales;
  const receipt = store.request('POST', '/checkout', saleBody());
  assert.equal(receipt.totalAmount, 460);
  assert.equal(receipt.changeAmount, 40);
  assert.equal(store.request('GET', '/products')[0].stock, 4);
  assert.equal(store.request('GET', '/sales')[0].id, receipt.id);
  assert.equal(store.request('GET', '/dashboard').todaySales, previousTotal + 460);
  const reopened = createDemoStore({ storage, products, settings, now });
  assert.deepEqual(reopened.request('GET', `/sales/${receipt.id}`), receipt);
});

test('rejects invalid quantities, insufficient cash, duplicates over stock, and missing products atomically', () => {
  const { store, values } = fixture();
  store.request('GET', '/sales');
  const before = values.get(DEMO_STORAGE_KEY);
  for (const quantity of [0, -1, 1.5, 7, 'invalid']) assert.throws(() => store.request('POST', '/checkout', saleBody(quantity)));
  assert.throws(() => store.request('POST', '/checkout', saleBody(2, 459)));
  assert.throws(() => store.request('POST', '/checkout', { ...saleBody(), cashReceived: NaN }));
  assert.throws(() => store.request('POST', '/checkout', { ...saleBody(), items: [{ productId: 105, quantity: 4 }, { productId: 105, quantity: 4 }] }));
  assert.throws(() => store.request('POST', '/checkout', { ...saleBody(), items: [{ productId: 999, quantity: 1 }] }));
  assert.equal(values.get(DEMO_STORAGE_KEY), before);
});

test('combines duplicate order lines and supports noncash sample payments', () => {
  const { store } = fixture();
  const receipt = store.request('POST', '/checkout', { items: [{ productId: 105, quantity: 1 }, { productId: 105, quantity: 1 }], paymentMethod: 'gcash' });
  assert.equal(receipt.items.length, 1);
  assert.equal(receipt.totalItems, 2);
  assert.equal(receipt.cashReceived, 460);
  assert.equal(receipt.changeAmount, 0);
  assert.throws(() => store.request('POST', '/checkout', { ...saleBody(), paymentMethod: 'bitcoin' }));
});

test('void restores inventory exactly once and removes revenue, including when repeated from another tab', () => {
  const { store, storage } = fixture();
  const before = store.request('GET', '/dashboard').todaySales;
  const receipt = store.request('POST', '/checkout', saleBody());
  const secondTab = createDemoStore({ storage, products, settings, now });
  const result = secondTab.request('POST', `/sales/${receipt.id}/void`, { reason: 'Demo cancellation' });
  assert.equal(result.status, 'voided');
  store.request('POST', `/sales/${receipt.id}/void`, { reason: 'Demo cancellation' });
  assert.equal(store.request('GET', '/products')[0].stock, 6);
  assert.equal(store.request('GET', '/dashboard').todaySales, before);
  assert.equal(store.request('GET', '/users/activity').activities.filter(activity => activity.description === `Voided sample sale ${receipt.receiptNo}`).length, 1);
});

test('report filters reconcile totals, exclude voided sales, and show real empty periods', () => {
  const { store } = fixture();
  const report = store.request('GET', '/reports/summary?from=2026-09-04&to=2026-09-10');
  assert.equal(report.dailySales.length, 7);
  assert.equal(report.overview.revenue, report.dailySales.reduce((sum, day) => sum + day.revenue, 0));
  assert.equal(report.overview.revenue, report.categorySales.reduce((sum, category) => sum + category.revenue, 0));
  assert.equal(report.overview.transactions, report.dailySales.reduce((sum, day) => sum + day.transactions, 0));
  assert.equal(report.monthlySales.length, 6);
  const empty = store.request('GET', '/reports/summary?from=2020-01-01&to=2020-01-03');
  assert.equal(empty.overview.revenue, 0);
  assert.equal(empty.overview.averageOrder, 0);
  assert.deepEqual(empty.recentSales, []);
  assert.throws(() => store.request('GET', '/reports/summary?from=2026-02-30&to=2026-03-01'));
  assert.throws(() => store.request('GET', '/reports/summary?from=2026-09-10&to=2026-09-04'));
});

test('reset and malformed storage repair touch only the demo key', () => {
  const { store, values } = fixture();
  const receipt = store.request('POST', '/checkout', saleBody());
  store.request('POST', '/demo/reset');
  assert.equal(store.request('GET', '/sales').length, 28);
  assert.throws(() => store.request('GET', `/sales/${receipt.id}`), /not found/);
  values.set(DEMO_STORAGE_KEY, '{broken');
  assert.equal(store.request('GET', '/sales').length, 28);
  values.set(DEMO_STORAGE_KEY, JSON.stringify({ version: -1 }));
  assert.equal(store.request('GET', '/products').length, 3);
  assert.equal(values.get('fabians-session'), 'REAL-SESSION-UNCHANGED');
});

test('storage failure and unsupported routes never silently succeed', () => {
  const { store, storage, values } = fixture();
  store.request('GET', '/sales');
  const original = values.get(DEMO_STORAGE_KEY);
  storage.setItem = () => { throw new Error('Quota exceeded'); };
  assert.throws(() => store.request('POST', '/checkout', saleBody()), /could not be saved/);
  assert.equal(values.get(DEMO_STORAGE_KEY), original);
  assert.throws(() => store.request('GET', '/unsupported'), /not available/);
});

test('sample product edits preserve historical receipts and use the recycle bin', () => {
  const { store } = fixture();
  const receipt = store.request('POST', '/checkout', saleBody());
  store.request('PATCH', '/products/105', { name: 'Renamed demo filter', barcode: 'FILTER', categoryName: 'Filters', stock: 10, salePrice: 250 });
  assert.equal(store.request('GET', `/sales/${receipt.id}`).items[0].name, 'Sample Oil Filter');
  store.request('DELETE', '/products/105');
  assert.equal(store.request('GET', '/products').length, 2);
  assert.equal(store.request('GET', '/products/deleted').length, 1);
  store.request('POST', '/products/105/restore');
  assert.equal(store.request('GET', '/products').length, 3);
});

test('sample staff and settings changes persist, but passwords never do', () => {
  const { store, values } = fixture();
  store.request('POST', '/users', { name: 'Demo Tester', username: 'tester', role: 'cashier', password: 'NeverPersist123!' });
  assert.equal(store.request('GET', '/users/activity?role=cashier').users.length, 2);
  assert.ok(!values.get(DEMO_STORAGE_KEY).includes('NeverPersist123!'));
  store.request('PATCH', '/settings', { enabledPaymentMethods: ['card'] });
  assert.equal(store.request('GET', '/settings').defaultPaymentMethod, 'card');
  assert.throws(() => store.request('POST', '/checkout', saleBody()), /not enabled/);
});
