export const DEMO_STORAGE_KEY = 'fabians-demo-workspace-v1';
const VERSION = 1;
const clone = value => JSON.parse(JSON.stringify(value));
const money = value => Math.round(Number(value) * 100) / 100;
const dateKey = value => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const newestFirst = (a, b) => new Date(b.saleDate) - new Date(a.saleDate) || b.id - a.id;
const activeProducts = state => state.products.filter(product => !product.deletedAt);
const productView = product => ({ ...product, status: product.stock <= product.reorderLevel ? 'Low stock' : 'Healthy' });
const saleView = sale => ({
  id: sale.id, receipt_no: sale.receiptNo, total_items: sale.totalItems,
  total_amount: sale.totalAmount, sale_date: sale.saleDate, payment_method: sale.paymentMethod,
  status: sale.status, cashier_name: sale.cashier,
});

function receiptItem(product, quantity) {
  return { productId: product.id, name: product.name, barcode: product.barcode, category: product.category,
    quantity, unitPrice: product.salePrice, lineTotal: money(product.salePrice * quantity) };
}

function seedState(products, settings, now) {
  const state = {
    version: VERSION,
    products: products.map(product => ({ ...product, reorderLevel: product.reorderLevel ?? 3, buyPrice: product.buyPrice || 0, deletedAt: null })),
    settings: { ...settings, shopAddress: 'Sample branch - demo only', receiptFooter: 'Sample transaction. No payment was collected.', autoPrintReceipt: false },
    users: [
      { id: 1, name: 'Demo Owner', username: 'demo-owner', role: 'owner', isActive: true },
      { id: 2, name: 'Demo Admin', username: 'demo-admin', role: 'admin', isActive: true },
      { id: 3, name: 'Demo Cashier', username: 'demo-cashier', role: 'cashier', isActive: true },
    ],
    sales: [], activities: [], nextSaleId: 1001, nextActivityId: 1,
  };
  const ages = [135, 120, 102, 88, 73, 60, 45, 32, 21, 14, 10, 8, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 1, 0, 0, 0];
  // These receipts precede the opening stock snapshot; don't deduct stock twice.
  ages.forEach((days, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    date.setMinutes(date.getMinutes() - (4 - index % 4) * 12);
    const items = Array.from({ length: 1 + index % Math.min(3, products.length) }, (_, itemIndex) =>
      receiptItem(state.products[(index + itemIndex) % products.length], 1 + (index + itemIndex) % 2));
    const total = money(items.reduce((sum, item) => sum + item.lineTotal, 0));
    const paymentMethod = ['cash', 'gcash', 'card'][index % 3];
    const cashReceived = paymentMethod === 'cash' ? Math.ceil(total / 500) * 500 : total;
    const user = state.users[1 + index % 2];
    const id = state.nextSaleId++;
    const sale = { id, receiptNo: `DEMO-FC-${id}`, saleDate: date.toISOString(), cashier: user.name,
      paymentMethod, cashReceived, changeAmount: money(cashReceived - total), totalAmount: total,
      status: [8, 19].includes(index) ? 'voided' : 'paid', totalItems: items.reduce((sum, item) => sum + item.quantity, 0), items, isDemo: true };
    if (sale.status === 'voided') Object.assign(sale, { voidedAt: new Date(date.getTime() + 600000).toISOString(), voidedBy: 'Demo Owner', voidReason: 'Sample cancelled order' });
    state.sales.push(sale);
    logActivity(state, 'checkout', `Completed sample sale ${sale.receiptNo}`, date, user);
    if (sale.status === 'voided') logActivity(state, 'sale_void', `Voided sample sale ${sale.receiptNo}`, new Date(sale.voidedAt));
  });
  state.users.forEach((user, index) => {
    user.lastLoginAt = new Date(now.getTime() - (index + 1) * 3600000).toISOString();
    user.lastLogoutAt = new Date(now.getTime() - 86400000).toISOString();
    logActivity(state, 'login', 'Signed in to the sample workspace', new Date(user.lastLoginAt), user);
  });
  state.sales.sort(newestFirst);
  return state;
}

function logActivity(state, action, description, now, user = state.users[0]) {
  state.activities.unshift({ id: state.nextActivityId++, userId: user.id, userName: user.name, userRole: user.role, action, description, createdAt: now.toISOString() });
}

function parseDay(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) throw new Error('Choose a valid report date range.');
  const date = new Date(`${value}T00:00:00`);
  if (!Number.isFinite(date.getTime()) || dateKey(date) !== value) throw new Error('Choose a valid report date range.');
  return date;
}

function reportSummary(state, params, now) {
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 6);
  const from = params.get('from') || dateKey(weekStart);
  const to = params.get('to') || dateKey(now);
  const fromDate = parseDay(from);
  const toDate = parseDay(to);
  if (from > to || toDate - fromDate > 366 * 86400000) throw new Error('Choose a report range of 366 days or fewer.');
  const paid = state.sales.filter(sale => sale.status === 'paid');
  const inRange = sale => dateKey(sale.saleDate) >= from && dateKey(sale.saleDate) <= to;
  const selected = paid.filter(inRange);
  const revenue = money(selected.reduce((sum, sale) => sum + sale.totalAmount, 0));
  const rankProducts = receipts => {
    const totals = new Map();
    for (const sale of receipts) for (const item of sale.items) {
      const row = totals.get(item.productId) || { name: item.name, quantity: 0, revenue: 0 };
      row.quantity += item.quantity;
      row.revenue = money(row.revenue + item.lineTotal);
      totals.set(item.productId, row);
    }
    return [...totals.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  };
  const dailySales = [];
  for (const day = new Date(fromDate); day <= toDate; day.setDate(day.getDate() + 1)) {
    const receipts = selected.filter(sale => dateKey(sale.saleDate) === dateKey(day));
    dailySales.push({ label: day.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
      revenue: money(receipts.reduce((sum, sale) => sum + sale.totalAmount, 0)), transactions: receipts.length });
  }
  const monthlySales = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(toDate.getFullYear(), toDate.getMonth() - 5 + index, 1);
    const receipts = paid.filter(sale => dateKey(sale.saleDate).slice(0, 7) === dateKey(month).slice(0, 7));
    return { label: month.toLocaleDateString('en-PH', { month: 'short', year: 'numeric' }),
      revenue: money(receipts.reduce((sum, sale) => sum + sale.totalAmount, 0)), transactions: receipts.length };
  });
  const categoryStock = new Map();
  for (const product of activeProducts(state)) {
    const row = categoryStock.get(product.category) || { category: product.category, stock: 0, stockValue: 0 };
    row.stock += product.stock;
    row.stockValue = money(row.stockValue + product.stock * product.salePrice);
    categoryStock.set(product.category, row);
  }
  const categorySales = new Map();
  for (const sale of selected) for (const item of sale.items) categorySales.set(item.category, money((categorySales.get(item.category) || 0) + item.lineTotal));
  const selectedWeek = new Date(toDate);
  selectedWeek.setDate(selectedWeek.getDate() - 6);
  return {
    range: { from, to },
    overview: { revenue, transactions: selected.length, unitsSold: selected.reduce((sum, sale) => sum + sale.totalItems, 0), averageOrder: selected.length ? money(revenue / selected.length) : 0 },
    dailySales, monthlySales, topProducts: rankProducts(selected),
    weeklyBestSellers: rankProducts(paid.filter(sale => dateKey(sale.saleDate) >= dateKey(selectedWeek) && dateKey(sale.saleDate) <= to)),
    monthlyBestSellers: rankProducts(paid.filter(sale => dateKey(sale.saleDate).slice(0, 7) === to.slice(0, 7))),
    categoryStock: [...categoryStock.values()], categorySales: [...categorySales].map(([category, value]) => ({ category, revenue: value })),
    lowStock: activeProducts(state).filter(product => product.stock <= product.reorderLevel).map(product => ({ name: product.name, stock: product.stock, reorderLevel: product.reorderLevel })),
    recentSales: state.sales.filter(inRange).slice(0, 10),
  };
}

function positiveInteger(value, label, allowZero = false) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < (allowZero ? 0 : 1)) throw new Error(`${label} must be a ${allowZero ? 'nonnegative' : 'positive'} whole number.`);
  return number;
}

function checkout(state, body, now) {
  if (!Array.isArray(body.items) || !body.items.length) throw new Error('Add at least one item to the order.');
  const paymentMethod = body.paymentMethod || 'cash';
  if (!state.settings.enabledPaymentMethods.includes(paymentMethod)) throw new Error('This payment method is not enabled.');
  const quantities = new Map();
  for (const item of body.items) {
    const id = positiveInteger(item.productId, 'Product ID');
    const quantity = positiveInteger(item.quantity, 'Quantity');
    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }
  const items = [...quantities].map(([id, quantity]) => {
    const product = activeProducts(state).find(row => row.id === id);
    if (!product) throw new Error('A product in this order is no longer available.');
    if (quantity > product.stock) throw new Error(`Only ${product.stock} unit(s) of ${product.name} are available.`);
    return receiptItem(product, quantity);
  });
  const totalAmount = money(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const cashReceived = paymentMethod === 'cash' ? money(body.cashReceived) : totalAmount;
  if (!Number.isFinite(cashReceived) || cashReceived < totalAmount) throw new Error('Amount received is less than the order total.');
  const id = state.nextSaleId++;
  const sale = { id, receiptNo: `DEMO-FC-${id}`, saleDate: now.toISOString(), cashier: 'Demo Owner',
    paymentMethod, cashReceived, changeAmount: money(cashReceived - totalAmount), totalAmount,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0), items, status: 'paid', isDemo: true };
  for (const item of items) state.products.find(product => product.id === item.productId).stock -= item.quantity;
  state.sales.unshift(sale);
  state.sales.sort(newestFirst);
  logActivity(state, 'checkout', `Completed sample sale ${sale.receiptNo}`, now);
  return sale;
}

function validState(state) {
  return state?.version === VERSION && Array.isArray(state.products) && state.products.every(product => Number.isInteger(product.id) && Number.isFinite(product.stock))
    && Array.isArray(state.sales) && state.sales.every(sale => Number.isInteger(sale.id) && Array.isArray(sale.items) && Number.isFinite(sale.totalAmount))
    && Array.isArray(state.users) && state.users.length > 0 && Array.isArray(state.activities)
    && Array.isArray(state.settings?.enabledPaymentMethods) && Number.isInteger(state.nextSaleId) && Number.isInteger(state.nextActivityId);
}

// The demo has its own storage and API boundary. Unknown routes never use a server.
export function createDemoStore({ storage, products, settings, now = () => new Date() }) {
  function save(state) {
    try { storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state)); }
    catch { throw new Error('Demo data could not be saved. Allow browser storage or free some space, then try again.'); }
  }
  function read() {
    let raw;
    try { raw = storage.getItem(DEMO_STORAGE_KEY); }
    catch { throw new Error('Allow browser storage to use the offline demo.'); }
    try {
      const state = JSON.parse(raw);
      if (validState(state)) return state;
    } catch { /* Recreate only this demo's malformed or outdated storage. */ }
    const state = seedState(clone(products), clone(settings), now());
    save(state);
    return state;
  }

  function request(method, path, body = {}) {
    const url = new URL(path, 'https://demo.invalid');
    const route = url.pathname;
    let state = read();
    const time = now();
    let result;
    if (method === 'GET') {
      if (route === '/health') result = { databaseTime: time.toISOString(), demo: true };
      else if (route === '/products') result = activeProducts(state).map(productView);
      else if (route === '/products/deleted') result = state.products.filter(product => product.deletedAt).map(product => ({ ...productView(product),
        deletedByName: 'Demo Owner', daysRemaining: Math.max(0, state.settings.recycleRetentionDays - Math.floor((time - new Date(product.deletedAt)) / 86400000)) }));
      else if (route === '/sales') result = state.sales.map(saleView);
      else if (/^\/sales\/\d+$/.test(route)) {
        result = state.sales.find(sale => sale.id === Number(route.split('/')[2]));
        if (!result) throw new Error('Demo receipt not found. The sample data may have been reset.');
      } else if (route === '/settings') result = state.settings;
      else if (route === '/dashboard') result = {
        products: activeProducts(state).length, lowStock: activeProducts(state).filter(product => product.stock <= product.reorderLevel).length,
        todaySales: money(state.sales.filter(sale => sale.status === 'paid' && dateKey(sale.saleDate) === dateKey(time)).reduce((sum, sale) => sum + sale.totalAmount, 0)),
        activeUsers: state.users.filter(user => user.isActive).length,
      };
      else if (route === '/reports/summary') result = reportSummary(state, url.searchParams, time);
      else if (route === '/users/activity') {
        const role = url.searchParams.get('role');
        const activities = state.activities.filter(activity => !role || activity.userRole === role).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt) || b.id - a.id);
        result = { databaseTime: time.toISOString(), users: state.users.filter(user => !role || user.role === role).map(user => ({ ...user, activityCount: state.activities.filter(activity => activity.userId === user.id).length })), activities: activities.slice(0, 100) };
      }
    } else if (method === 'POST' && route === '/checkout') result = checkout(state, body, time);
    else if (method === 'POST' && /^\/sales\/\d+\/void$/.test(route)) {
      const sale = state.sales.find(row => row.id === Number(route.split('/')[2]));
      if (!sale) throw new Error('Demo receipt not found.');
      if (sale.status === 'voided') return clone(sale);
      const reason = String(body.reason || '').trim();
      if ((reason.length > 0 && reason.length < 3) || reason.length > 300) throw new Error('Enter a cancellation reason of 3 to 300 characters, or leave it blank.');
      for (const item of sale.items) {
        const product = state.products.find(row => row.id === item.productId);
        if (!product) throw new Error('This product was removed from the demo. Reset the demo to restore its sample records.');
        product.stock += item.quantity;
      }
      Object.assign(sale, { status: 'voided', voidedAt: time.toISOString(), voidedBy: 'Demo Owner', voidReason: reason });
      logActivity(state, 'sale_void', `Voided sample sale ${sale.receiptNo}`, time);
      result = sale;
    } else if (method === 'POST' && route === '/demo/reset') {
      state = seedState(clone(products), clone(settings), time);
      result = { reset: true };
    } else if (method === 'POST' && route === '/auth/logout') result = { success: true };
    else if (method === 'PATCH' && route === '/settings') {
      const allowed = Object.fromEntries(Object.keys(settings).filter(key => key in body).map(key => [key, body[key]]));
      if (allowed.enabledPaymentMethods && (!allowed.enabledPaymentMethods.length || allowed.enabledPaymentMethods.some(method => !['cash', 'gcash', 'card'].includes(method)))) throw new Error('Enable at least one supported payment method.');
      state.settings = { ...state.settings, ...allowed, updatedByName: 'Demo Owner', updatedAt: time.toISOString() };
      if (!state.settings.enabledPaymentMethods.includes(state.settings.defaultPaymentMethod)) state.settings.defaultPaymentMethod = state.settings.enabledPaymentMethods[0];
      logActivity(state, 'settings_update', 'Updated demo workspace settings', time);
      result = state.settings;
    } else if ((method === 'POST' && route === '/products') || (method === 'PATCH' && /^\/products\/\d+$/.test(route))) {
      const existing = method === 'PATCH' ? activeProducts(state).find(product => product.id === Number(route.split('/')[2])) : null;
      if (method === 'PATCH' && !existing) throw new Error('Product not found in demo inventory.');
      const name = String(body.name || '').trim();
      const barcode = String(body.barcode || '').trim();
      if (!name) throw new Error('Enter a product name.');
      if (barcode && state.products.some(product => product.id !== existing?.id && product.barcode === barcode)) throw new Error('This barcode already belongs to a product.');
      const salePrice = money(body.salePrice);
      const buyPrice = money(body.buyPrice || 0);
      if (!Number.isFinite(salePrice) || salePrice <= 0 || !Number.isFinite(buyPrice) || buyPrice < 0) throw new Error('Enter valid product prices.');
      const product = { ...existing, id: existing?.id ?? Math.max(0, ...state.products.map(row => row.id)) + 1, name, barcode,
        category: String(body.categoryName || 'Uncategorized').trim(), stock: positiveInteger(body.stock, 'Stock', true),
        reorderLevel: positiveInteger(body.reorderLevel ?? state.settings.defaultReorderLevel, 'Reorder level', true), salePrice, buyPrice,
        imageUrl: String(body.imageUrl || ''), deletedAt: null };
      if (existing) Object.assign(existing, product); else state.products.push(product);
      logActivity(state, existing ? 'product_update' : 'product_create', `${existing ? 'Updated' : 'Added'} demo product ${name}`, time);
      result = productView(product);
    } else if (method === 'DELETE' && /^\/products\/\d+$/.test(route)) {
      const product = activeProducts(state).find(row => row.id === Number(route.split('/')[2]));
      if (!product) throw new Error('Product not found in demo inventory.');
      product.deletedAt = time.toISOString();
      logActivity(state, 'product_delete', `Moved ${product.name} to the demo recycle bin`, time);
      result = { product };
    } else if (method === 'POST' && /^\/products\/\d+\/restore$/.test(route)) {
      const product = state.products.find(row => row.id === Number(route.split('/')[2]));
      if (!product?.deletedAt) throw new Error('Deleted demo product not found.');
      product.deletedAt = null;
      logActivity(state, 'product_restore', `Restored demo product ${product.name}`, time);
      result = productView(product);
    } else if (method === 'POST' && route === '/products/recycle-bin/purge-expired') {
      const expired = state.products.filter(product => product.deletedAt && time - new Date(product.deletedAt) >= state.settings.recycleRetentionDays * 86400000);
      state.products = state.products.filter(product => !expired.includes(product));
      result = { purged: expired.length };
    } else if (method === 'POST' && route === '/users') {
      if (!['admin', 'cashier'].includes(body.role)) throw new Error('Choose an admin or cashier role.');
      const username = String(body.username || '').trim();
      const name = String(body.name || '').trim();
      if (!name || !/^[A-Za-z0-9._-]{3,80}$/.test(username)) throw new Error('Enter a name and valid username.');
      if (state.users.some(user => user.username.toLowerCase() === username.toLowerCase())) throw new Error('That demo username already exists.');
      // A demo staff entry is not an authentication account; never store passwords.
      result = { id: Math.max(...state.users.map(user => user.id)) + 1, name, username, role: body.role, isActive: true, lastLoginAt: null, lastLogoutAt: null };
      state.users.push(result);
      logActivity(state, 'user_create', `Added sample staff entry ${name}`, time);
    }
    if (result === undefined) throw new Error('This action is not available in the offline demo.');
    if (method !== 'GET') save(state);
    return clone(result);
  }
  return { request };
}
