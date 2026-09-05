import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getDatabasePath,
  initializeDatabase,
  pool,
  query,
  withTransaction,
} from './db.js';

dotenv.config();

function readIntegerEnvironment(name, fallback, minimum, maximum) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value >= minimum && value <= maximum ? value : fallback;
}

const app = express();
const port = Number(process.env.PORT || 4000);
const appEnvironment = String(process.env.APP_ENV || process.env.NODE_ENV || 'development').toLowerCase();
const isProduction = appEnvironment === 'production';
const configuredJwtSecret = String(process.env.JWT_SECRET || '').trim();
const weakJwtSecrets = new Set(['dev-secret', 'change-this-secret', 'password', 'secret']);
const jwtSecretIsWeak = configuredJwtSecret.length < 32 || weakJwtSecrets.has(configuredJwtSecret);
const loginMaxAttempts = readIntegerEnvironment('LOGIN_MAX_ATTEMPTS', 5, 3, 20);
const loginWindowMs = readIntegerEnvironment('LOGIN_WINDOW_MS', 10 * 60 * 1000, 60 * 1000, 24 * 60 * 60 * 1000);
const loginLockMs = readIntegerEnvironment('LOGIN_LOCK_MS', 60 * 1000, 10 * 1000, 60 * 60 * 1000);
const loginAttempts = new Map();
const dummyPasswordHash = '$2a$10$pW4eqdpMbJbD9jN0kwxr6e/MBnK/agCIZebPw3Wg8Fb6gUPOTBZRu';

if (isProduction && jwtSecretIsWeak) {
  throw new Error('JWT_SECRET must be set to a unique value of at least 32 characters in production');
}

if (!isProduction && jwtSecretIsWeak) {
  console.warn('JWT_SECRET is using a development placeholder. Replace it before production.');
}

const jwtSecret = configuredJwtSecret || 'fabians-local-development-secret-only';

app.disable('x-powered-by');
app.use(cors({ origin: ['http://127.0.0.1:5173', 'http://127.0.0.1:4173'], credentials: true }));
app.use(express.json({ limit: '8mb' }));
app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
  });
  next();
});

function asyncRoute(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function loginAttemptKey(req, username) {
  return `${req.ip || req.socket?.remoteAddress || 'unknown'}:${username.toLowerCase()}`;
}

function getLoginRetryAfter(key, now = Date.now()) {
  const attempt = loginAttempts.get(key);
  if (!attempt) return 0;

  if (attempt.lockedUntil > now) {
    return Math.max(Math.ceil((attempt.lockedUntil - now) / 1000), 1);
  }

  if (attempt.lockedUntil || now - attempt.windowStartedAt >= loginWindowMs) {
    loginAttempts.delete(key);
  }

  return 0;
}

function recordFailedLogin(key, now = Date.now()) {
  let attempt = loginAttempts.get(key);

  if (!attempt || now - attempt.windowStartedAt >= loginWindowMs) {
    attempt = { failures: 0, windowStartedAt: now, lockedUntil: 0 };
  }

  attempt.failures += 1;
  if (attempt.failures >= loginMaxAttempts) {
    attempt.lockedUntil = now + loginLockMs;
  }
  loginAttempts.set(key, attempt);

  if (loginAttempts.size > 1000) {
    for (const [storedKey, storedAttempt] of loginAttempts) {
      const expired = storedAttempt.lockedUntil
        ? storedAttempt.lockedUntil <= now
        : now - storedAttempt.windowStartedAt >= loginWindowMs;
      if (expired) loginAttempts.delete(storedKey);
    }
  }

  return attempt.lockedUntil > now
    ? Math.max(Math.ceil((attempt.lockedUntil - now) / 1000), 1)
    : 0;
}

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid session' });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }

    return next();
  };
}

function normalizeProduct(row) {
  return {
    id: row.id,
    sku: row.sku,
    barcode: row.barcode,
    name: row.name,
    category: row.category_name,
    stock: Number(row.stock_on_hand),
    reorderLevel: Number(row.reorder_level),
    buyPrice: Number(row.buy_price),
    salePrice: Number(row.sale_price),
    imageUrl: row.image_url || '',
    status: Number(row.stock_on_hand) <= Number(row.reorder_level) ? 'Low stock' : 'Healthy',
  };
}

function normalizeDeletedProduct(row) {
  return {
    ...normalizeProduct(row),
    status: 'Deleted',
    deletedAt: row.deleted_at,
    purgeAfter: row.purge_after,
    deletedBy: row.deleted_by_name || 'Unknown user',
    daysRemaining: Math.max(Number(row.days_remaining || 0), 0),
  };
}

function requestError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function requestAuditMetadata(req) {
  return {
    ipAddress: req.ip || req.socket?.remoteAddress || null,
    userAgent: String(req.get('user-agent') || '').slice(0, 300) || null,
  };
}

async function recordActivity(executor, actor, {
  action,
  description,
  entityType = null,
  entityId = null,
  metadata = {},
}) {
  const execute = executor?.query ? executor.query.bind(executor) : query;
  await execute(
    `insert into user_activity_logs
       (user_id, user_name, user_role, action, entity_type, entity_id, description, metadata)
     values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
    [
      actor.id,
      actor.name,
      actor.role,
      action,
      entityType,
      entityId,
      description,
      JSON.stringify(metadata),
    ]
  );
}

function normalizeReceipt(sale, items = []) {
  const normalizedItems = items.map((item) => ({
    productId: Number(item.product_id),
    name: item.name,
    barcode: item.barcode || '',
    quantity: Number(item.quantity),
    unitPrice: Number(item.unit_price),
    lineTotal: Number(item.line_total),
  }));

  return {
    id: Number(sale.id),
    receiptNo: sale.receipt_no,
    saleDate: sale.sale_date,
    cashier: sale.cashier_name || 'Unknown cashier',
    paymentMethod: sale.payment_method,
    cashReceived: Number(sale.cash_received),
    changeAmount: Number(sale.change_amount),
    totalAmount: Number(sale.total_amount),
    status: sale.status,
    voidedAt: sale.voided_at || null,
    voidedBy: sale.voided_by_name || null,
    voidReason: sale.void_reason || '',
    totalItems: normalizedItems.reduce((total, item) => total + item.quantity, 0),
    items: normalizedItems,
  };
}

const supportedPaymentMethods = ['cash', 'gcash', 'card'];

function normalizePosSettings(row) {
  const parseList = (value, fallback) => {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return fallback;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  };

  return {
    id: Number(row.id || 1),
    shopName: row.shop_name || "Fabian's Car Care",
    shopAddress: row.shop_address || '',
    contactNumber: row.contact_number || '',
    tin: row.tin || '',
    shopLogoUrl: row.shop_logo_url || '',
    receiptFooter: row.receipt_footer || "Thank you for choosing Fabian's Car Care.",
    receiptPaperSize: row.receipt_paper_size || '80mm',
    autoOpenReceipt: Boolean(row.auto_open_receipt),
    autoPrintReceipt: Boolean(row.auto_print_receipt),
    enabledPaymentMethods: parseList(
      row.enabled_payment_methods,
      [...supportedPaymentMethods]
    ),
    defaultPaymentMethod: row.default_payment_method || 'cash',
    commonBills: parseList(row.common_bills, [100, 200, 500, 1000]).map(Number),
    barcodeAutoAdd: Boolean(row.barcode_auto_add),
    defaultReorderLevel: Number(row.default_reorder_level ?? 3),
    recycleRetentionDays: Number(row.recycle_retention_days ?? 30),
    inactivityTimeoutMinutes: Number(row.inactivity_timeout_minutes ?? 30),
    cashierVoidReasonRequired: Boolean(row.cashier_void_reason_required),
    updatedBy: row.updated_by ? Number(row.updated_by) : null,
    updatedByName: row.updated_by_name || null,
    updatedAt: row.updated_at || null,
  };
}

async function readPosSettings(executor = null) {
  const execute = executor?.query ? executor.query.bind(executor) : query;
  const result = await execute(
    `select s.*, u.name as updated_by_name
     from pos_settings s
     left join app_users u on u.id = s.updated_by
     where s.id = 1`
  );

  if (!result.rows[0]) {
    throw requestError(500, 'POS settings are not initialized');
  }

  return normalizePosSettings(result.rows[0]);
}

function validatePosSettings(body) {
  const readText = (key, label, maxLength, { required = false } = {}) => {
    const value = typeof body?.[key] === 'string' ? body[key].trim() : '';
    if (required && value.length < 2) {
      throw requestError(400, `${label} must contain at least 2 characters`);
    }
    if (value.length > maxLength) {
      throw requestError(400, `${label} must not exceed ${maxLength} characters`);
    }
    return value;
  };
  const readBoolean = (key, label) => {
    if (typeof body?.[key] !== 'boolean') {
      throw requestError(400, `${label} must be enabled or disabled`);
    }
    return body[key];
  };
  const readInteger = (key, label, minimum, maximum) => {
    const value = Number(body?.[key]);
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
      throw requestError(400, `${label} must be between ${minimum} and ${maximum}`);
    }
    return value;
  };

  const shopName = readText('shopName', 'Shop name', 120, { required: true });
  const shopAddress = readText('shopAddress', 'Shop address', 240);
  const contactNumber = readText('contactNumber', 'Contact number', 40);
  const tin = readText('tin', 'TIN', 40);
  const shopLogoUrl = readText('shopLogoUrl', 'Shop logo', 2_800_000);
  const receiptFooter = readText('receiptFooter', 'Receipt footer', 240);
  const receiptPaperSize = String(body?.receiptPaperSize || '').toLowerCase();
  const autoOpenReceipt = readBoolean('autoOpenReceipt', 'Auto-open receipt');
  const autoPrintReceipt = readBoolean('autoPrintReceipt', 'Auto-print receipt');

  if (shopLogoUrl && !/^data:image\/(png|jpe?g|webp);base64,/i.test(shopLogoUrl)) {
    throw requestError(400, 'Shop logo must be an uploaded PNG, JPG, or WebP image');
  }
  if (!['58mm', '80mm', 'a4'].includes(receiptPaperSize)) {
    throw requestError(400, 'Receipt paper size must be 58mm, 80mm, or A4');
  }
  if (autoPrintReceipt && !autoOpenReceipt) {
    throw requestError(400, 'Auto-print requires auto-open receipt to be enabled');
  }

  if (!Array.isArray(body?.enabledPaymentMethods)) {
    throw requestError(400, 'Select at least one payment method');
  }
  const enabledPaymentMethods = [...new Set(
    body.enabledPaymentMethods.map((method) => String(method).toLowerCase())
  )];
  if (
    enabledPaymentMethods.length < 1
    || enabledPaymentMethods.some((method) => !supportedPaymentMethods.includes(method))
  ) {
    throw requestError(400, 'Payment methods may only include Cash, GCash, and Card');
  }

  const defaultPaymentMethod = String(body?.defaultPaymentMethod || '').toLowerCase();
  if (!enabledPaymentMethods.includes(defaultPaymentMethod)) {
    throw requestError(400, 'Default payment method must be enabled');
  }

  if (!Array.isArray(body?.commonBills)) {
    throw requestError(400, 'Common bills must be a list');
  }
  const commonBills = [...new Set(body.commonBills.map(Number))].sort((first, second) => first - second);
  if (
    commonBills.length < 1
    || commonBills.length > 6
    || commonBills.some((amount) => !Number.isInteger(amount) || amount < 1 || amount > 100_000)
  ) {
    throw requestError(400, 'Enter 1 to 6 common bill amounts between 1 and 100,000');
  }

  return {
    shopName,
    shopAddress,
    contactNumber,
    tin,
    shopLogoUrl,
    receiptFooter,
    receiptPaperSize,
    autoOpenReceipt,
    autoPrintReceipt,
    enabledPaymentMethods,
    defaultPaymentMethod,
    commonBills,
    barcodeAutoAdd: readBoolean('barcodeAutoAdd', 'Barcode auto-add'),
    defaultReorderLevel: readInteger('defaultReorderLevel', 'Default reorder level', 0, 9999),
    recycleRetentionDays: readInteger('recycleRetentionDays', 'Recycle retention', 1, 365),
    inactivityTimeoutMinutes: readInteger('inactivityTimeoutMinutes', 'Inactivity timeout', 5, 720),
    cashierVoidReasonRequired: readBoolean(
      'cashierVoidReasonRequired',
      'Cashier cancellation reason'
    ),
  };
}

function validateProductUpdate(body) {
  const name = String(body.name || '').trim();
  const barcode = String(body.barcode || '').trim();
  const stock = Number(body.stock);
  const salePrice = Number(body.salePrice);
  const imageUrl = String(body.imageUrl || '').trim();

  if (!name) throw new Error('Product name is required');
  if (!barcode) throw new Error('Barcode is required');
  if (!Number.isInteger(stock) || stock < 0) throw new Error('Stock must be a whole number of zero or more');
  if (!Number.isFinite(salePrice) || salePrice < 0) throw new Error('Valid product price is required');

  validateProductImage(imageUrl);

  return { name, barcode, stock, salePrice, imageUrl };
}

function validateProductImage(imageUrl) {
  if (!imageUrl) return;
  const isUploadedImage = /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(imageUrl);
  const isPublicAsset = imageUrl.startsWith('/product-images/');

  if (!isUploadedImage && !isPublicAsset) {
    throw new Error('Product image must be an uploaded image file');
  }

  if (imageUrl.length > 6_500_000) {
    throw new Error('Product image is too large. Use an image below 5MB');
  }
}

function validateNewProduct(body, defaultReorderLevel = 3) {
  const name = String(body.name || '').trim();
  const barcode = String(body.barcode || '').trim();
  const categoryName = String(body.categoryName || '').trim();
  const stock = Number(body.stock || 0);
  const reorderLevel = Number(body.reorderLevel ?? defaultReorderLevel);
  const buyPrice = Number(body.buyPrice || 0);
  const salePrice = Number(body.salePrice);
  const imageUrl = String(body.imageUrl || '').trim();

  if (!name) throw new Error('Product name is required');
  if (!barcode) throw new Error('Barcode is required');
  if (!Number.isFinite(stock) || stock < 0) throw new Error('Valid stock is required');
  if (!Number.isFinite(reorderLevel) || reorderLevel < 0) throw new Error('Valid reorder level is required');
  if (!Number.isFinite(buyPrice) || buyPrice < 0) throw new Error('Valid buy price is required');
  if (!Number.isFinite(salePrice) || salePrice < 0) throw new Error('Valid selling price is required');
  if (!imageUrl) throw new Error('Product image is required');
  validateProductImage(imageUrl);

  return { name, barcode, categoryName, stock, reorderLevel, buyPrice, salePrice, imageUrl };
}

async function ensureProductRecycleBinSchema() {
  initializeDatabase();
}

async function ensureSalesVoidSchema() {
  initializeDatabase();
}

async function ensureUserActivitySchema() {
  initializeDatabase();
}

async function ensurePosSettingsSchema() {
  initializeDatabase();
}

async function purgeExpiredDeletedProducts() {
  const settings = await readPosSettings();
  const result = await query(
    `update products
     set purged_at = now(),
         updated_at = now()
     where is_active = false
       and deleted_at is not null
       and purged_at is null
       and datetime(deleted_at) < datetime('now', '-' || $1 || ' days')
     returning id, name`,
    [settings.recycleRetentionDays]
  );

  return result.rows;
}

async function ensureDefaultProductImages() {
  await query(`
    update products set image_url = '/product-images/oil-filter.svg' where barcode = '4971295131204' and coalesce(image_url, '') = '';
    update products set image_url = '/product-images/yamalube.svg' where barcode = '90793AP42900' and coalesce(image_url, '') = '';
    update products set image_url = '/product-images/petron-oil.svg' where barcode = '4806505973629' and coalesce(image_url, '') = '';
    update products set image_url = '/product-images/repsol-oil.svg' where barcode = '8886351385063' and coalesce(image_url, '') = '';
    update products set image_url = '/product-images/spray-paint.svg' where barcode = '8850747502228' and coalesce(image_url, '') = '';
  `);
}

app.get('/api/health', asyncRoute(async (_req, res) => {
  const db = await query('select now() as now');
  res.json({
    ok: true,
    databaseTime: db.rows[0].now,
    databaseEngine: 'SQLite',
    storageMode: 'local-offline',
  });
}));

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  res.set('Cache-Control', 'no-store');

  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (username.length > 100 || password.length > 200) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const attemptKey = loginAttemptKey(req, username);
  const retryAfter = getLoginRetryAfter(attemptKey);
  if (retryAfter > 0) {
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({ error: 'Too many sign-in attempts. Please wait before trying again.' });
  }

  const result = await query(
    `select id, name, username, password_hash, role
     from app_users
     where username = $1 and is_active = true
     limit 1`,
    [username]
  );

  const user = result.rows[0];
  const passwordMatches = await bcrypt.compare(password, user?.password_hash || dummyPasswordHash);
  if (!user || !passwordMatches) {
    const lockRetryAfter = recordFailedLogin(attemptKey);
    if (lockRetryAfter > 0) {
      res.set('Retry-After', String(lockRetryAfter));
      return res.status(429).json({ error: 'Too many sign-in attempts. Please wait before trying again.' });
    }
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  loginAttempts.delete(attemptKey);

  await withTransaction(async (client) => {
    await client.query(
      `update app_users
       set last_login_at = now(),
           updated_at = now()
       where id = $1`,
      [user.id]
    );
    await recordActivity(client, user, {
      action: 'login',
      description: 'Signed in to the POS',
      entityType: 'session',
      metadata: requestAuditMetadata(req),
    });
  });

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, jwtSecret, { expiresIn: '8h' });
  return res.json({ token, user: { id: user.id, name: user.name, username: user.username, role: user.role } });
}));

app.post('/api/auth/logout', requireAuth, asyncRoute(async (req, res) => {
  await recordActivity(null, req.user, {
    action: 'logout',
    description: 'Signed out of the POS',
    entityType: 'session',
    metadata: requestAuditMetadata(req),
  });

  return res.json({ ok: true });
}));

app.get('/api/settings', requireAuth, asyncRoute(async (_req, res) => {
  res.set('Cache-Control', 'no-store');
  return res.json(await readPosSettings());
}));

app.patch(
  '/api/settings',
  requireAuth,
  requireRole(['owner', 'admin']),
  asyncRoute(async (req, res) => {
    const settings = validatePosSettings(req.body);
    const savedSettings = await withTransaction(async (client) => {
      const previousSettings = await readPosSettings(client);
      await client.query(
        `update pos_settings
         set shop_name = $1,
             shop_address = $2,
             contact_number = $3,
             tin = $4,
             shop_logo_url = $5,
             receipt_footer = $6,
             receipt_paper_size = $7,
             auto_open_receipt = $8,
             auto_print_receipt = $9,
             enabled_payment_methods = $10::text[],
             default_payment_method = $11,
             common_bills = $12::integer[],
             barcode_auto_add = $13,
             default_reorder_level = $14,
             recycle_retention_days = $15,
             inactivity_timeout_minutes = $16,
             cashier_void_reason_required = $17,
             updated_by = $18,
             updated_at = now()
         where id = 1`,
        [
          settings.shopName,
          settings.shopAddress,
          settings.contactNumber,
          settings.tin,
          settings.shopLogoUrl,
          settings.receiptFooter,
          settings.receiptPaperSize,
          settings.autoOpenReceipt,
          settings.autoPrintReceipt,
          settings.enabledPaymentMethods,
          settings.defaultPaymentMethod,
          settings.commonBills,
          settings.barcodeAutoAdd,
          settings.defaultReorderLevel,
          settings.recycleRetentionDays,
          settings.inactivityTimeoutMinutes,
          settings.cashierVoidReasonRequired,
          req.user.id,
        ]
      );

      const changedKeys = Object.keys(settings).filter(
        (key) => JSON.stringify(previousSettings[key]) !== JSON.stringify(settings[key])
      );
      await recordActivity(client, req.user, {
        action: 'settings_updated',
        description: changedKeys.length
          ? `Updated POS settings: ${changedKeys.join(', ')}`
          : 'Saved POS settings without changes',
        entityType: 'pos_settings',
        entityId: 1,
        metadata: {
          changedKeys,
          ...requestAuditMetadata(req),
        },
      });

      return readPosSettings(client);
    });

    return res.json(savedSettings);
  })
);

app.post('/api/users', requireAuth, requireRole(['owner']), asyncRoute(async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const username = typeof req.body?.username === 'string'
    ? req.body.username.trim().toLowerCase()
    : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const role = typeof req.body?.role === 'string' ? req.body.role.trim().toLowerCase() : '';

  if (name.length < 2 || name.length > 120) {
    return res.status(400).json({ error: 'Name must be between 2 and 120 characters' });
  }

  if (!/^[a-z0-9._-]{3,80}$/.test(username)) {
    return res.status(400).json({
      error: 'Username must be 3-80 characters using letters, numbers, dots, underscores, or hyphens',
    });
  }

  const passwordBytes = Buffer.byteLength(password, 'utf8');
  if (password.length < 8 || passwordBytes > 72 || !/[a-z]/i.test(password) || !/\d/.test(password)) {
    return res.status(400).json({
      error: 'Password must be 8-72 characters and include at least one letter and one number',
    });
  }

  if (!['admin', 'cashier'].includes(role)) {
    return res.status(400).json({ error: 'Only Admin and Cashier accounts can be created' });
  }

  const existingUser = await query(
    'select id from app_users where lower(username) = lower($1) limit 1',
    [username]
  );
  if (existingUser.rowCount > 0) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const createdUser = await withTransaction(async (client) => {
      const result = await client.query(
        `insert into app_users (name, username, password_hash, role)
         values ($1, $2, $3, $4)
         returning id, name, username, role, is_active, created_at`,
        [name, username, passwordHash, role]
      );
      const user = result.rows[0];

      await recordActivity(client, req.user, {
        action: 'account_created',
        description: `Created ${role} account for ${name} (@${username})`,
        entityType: 'user',
        entityId: user.id,
        metadata: {
          targetName: name,
          targetUsername: username,
          targetRole: role,
          ...requestAuditMetadata(req),
        },
      });

      return user;
    });

    return res.status(201).json({
      id: Number(createdUser.id),
      name: createdUser.name,
      username: createdUser.username,
      role: createdUser.role,
      isActive: createdUser.is_active,
      createdAt: createdUser.created_at,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    throw error;
  }
}));

app.get('/api/users/activity', requireAuth, requireRole(['owner']), asyncRoute(async (req, res) => {
  const requestedRole = String(req.query.role || '').toLowerCase();
  const role = ['admin', 'cashier'].includes(requestedRole) ? requestedRole : null;
  const requestedLimit = Number(req.query.limit);
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 250)
    : 100;

  const [usersResult, activitiesResult, databaseTimeResult] = await Promise.all([
    query(
      `select
         u.id,
         u.name,
         u.username,
         u.role,
         u.is_active,
         coalesce(
           max(l.created_at) filter (where l.action = 'login'),
           u.last_login_at
         ) as last_login_at,
         max(l.created_at) filter (where l.action = 'logout') as last_logout_at,
         max(l.created_at) as last_activity_at,
         count(l.id)::int as activity_count
       from app_users u
       left join user_activity_logs l on l.user_id = u.id
       where u.role in ('admin', 'cashier')
       group by u.id
       order by
         case u.role when 'admin' then 1 else 2 end,
         u.name`
    ),
    query(
      `select
         id,
         user_id,
         user_name,
         user_role,
         action,
         entity_type,
         entity_id,
         description,
         metadata,
         created_at
       from user_activity_logs
       where (user_role in ('admin', 'cashier') or action = 'account_created')
         and (
           $1::varchar is null
           or user_role = $1
           or (
             action = 'account_created'
             and json_extract(metadata, '$.targetRole') = $1
           )
         )
       order by created_at desc, id desc
       limit $2`,
      [role, limit]
    ),
    query('select now() as now'),
  ]);

  return res.json({
    users: usersResult.rows.map((user) => ({
      id: Number(user.id),
      name: user.name,
      username: user.username,
      role: user.role,
      isActive: user.is_active,
      lastLoginAt: user.last_login_at,
      lastLogoutAt: user.last_logout_at,
      lastActivityAt: user.last_activity_at,
      activityCount: Number(user.activity_count),
    })),
    activities: activitiesResult.rows.map((activity) => ({
      id: Number(activity.id),
      userId: activity.user_id ? Number(activity.user_id) : null,
      userName: activity.user_name,
      userRole: activity.user_role,
      action: activity.action,
      entityType: activity.entity_type,
      entityId: activity.entity_id ? Number(activity.entity_id) : null,
      description: activity.description,
      metadata: activity.metadata || {},
      createdAt: activity.created_at,
    })),
    role: role || 'all',
    databaseTime: databaseTimeResult.rows[0].now,
  });
}));

app.get('/api/dashboard', asyncRoute(async (_req, res) => {
  const [products, lowStock, salesToday, users] = await Promise.all([
    query('select count(*)::int as total from products where is_active = true'),
    query('select count(*)::int as total from products where is_active = true and stock_on_hand <= reorder_level'),
    query(`select coalesce(sum(total_amount), 0)::numeric as total
           from sales
           where status = 'paid'
             and date(sale_date, 'localtime') = date('now', 'localtime')`),
    query('select count(*)::int as total from app_users where is_active = true'),
  ]);

  res.json({
    products: products.rows[0].total,
    lowStock: lowStock.rows[0].total,
    todaySales: Number(salesToday.rows[0].total),
    activeUsers: users.rows[0].total,
  });
}));

app.get('/api/categories', asyncRoute(async (_req, res) => {
  const result = await query('select id, name from categories order by name');
  res.json(result.rows);
}));

app.get('/api/products', asyncRoute(async (req, res) => {
  const search = String(req.query.search || '').trim();
  const params = [];
  let where = 'where p.is_active = true';

  if (search) {
    params.push(`%${search}%`);
    where += ` and (p.name ilike $1 or p.barcode ilike $1 or p.sku ilike $1 or c.name ilike $1)`;
  }

  const result = await query(
    `select p.*, c.name as category_name
     from products p
     left join categories c on c.id = p.category_id
     ${where}
     order by p.name`,
    params
  );

  res.json(result.rows.map(normalizeProduct));
}));

app.get('/api/products/deleted', requireAuth, requireRole(['owner']), asyncRoute(async (_req, res) => {
  const settings = await readPosSettings();
  const result = await query(
    `select p.*, c.name as category_name, u.name as deleted_by_name
     from products p
     left join categories c on c.id = p.category_id
     left join app_users u on u.id = p.deleted_by
     where p.is_active = false and p.deleted_at is not null and p.purged_at is null
     order by p.deleted_at desc`
  );

  const retentionMilliseconds = settings.recycleRetentionDays * 24 * 60 * 60 * 1000;
  const now = Date.now();
  res.json(result.rows.map((row) => {
    const deletedAt = new Date(row.deleted_at).getTime();
    const purgeAt = Number.isFinite(deletedAt) ? deletedAt + retentionMilliseconds : now;
    return normalizeDeletedProduct({
      ...row,
      purge_after: new Date(purgeAt).toISOString(),
      days_remaining: Math.max(Math.ceil((purgeAt - now) / (24 * 60 * 60 * 1000)), 0),
    });
  }));
}));

app.post('/api/products', requireAuth, requireRole(['owner', 'admin']), asyncRoute(async (req, res) => {
  const settings = await readPosSettings();
  const productData = validateNewProduct(req.body, settings.defaultReorderLevel);
  const product = await withTransaction(async (client) => {
    let categoryId = null;

    if (productData.categoryName) {
      const category = await client.query(
        `insert into categories (name)
         values ($1)
         on conflict (name) do update set name = excluded.name
         returning id`,
        [productData.categoryName]
      );
      categoryId = category.rows[0].id;
    }

    const sku = String(req.body.sku || `PRD-${Date.now()}`).trim();
    const result = await client.query(
      `insert into products (sku, barcode, name, category_id, stock_on_hand, reorder_level, buy_price, sale_price, image_url)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       returning *`,
      [
        sku,
        productData.barcode,
        productData.name,
        categoryId,
        productData.stock,
        productData.reorderLevel,
        productData.buyPrice,
        productData.salePrice,
        productData.imageUrl,
      ]
    );

    const createdProduct = result.rows[0];
    await recordActivity(client, req.user, {
      action: 'product_created',
      description: `Added product ${createdProduct.name}`,
      entityType: 'product',
      entityId: createdProduct.id,
      metadata: {
        barcode: createdProduct.barcode,
        stock: Number(createdProduct.stock_on_hand),
        salePrice: Number(createdProduct.sale_price),
      },
    });

    return createdProduct;
  });

  const normalizedProduct = await query(
    `select p.*, c.name as category_name
     from products p
     left join categories c on c.id = p.category_id
     where p.id = $1`,
    [product.id]
  );

  res.status(201).json(normalizeProduct(normalizedProduct.rows[0]));
}));

app.patch('/api/products/:id', requireAuth, requireRole(['owner', 'admin']), asyncRoute(async (req, res) => {
  const productId = Number(req.params.id);
  const { name, barcode, stock, salePrice, imageUrl } = validateProductUpdate(req.body);

  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  const product = await withTransaction(async (client) => {
    const currentResult = await client.query(
      `select id, name, stock_on_hand
       from products
       where id = $1 and is_active = true
       for update`,
      [productId]
    );
    const currentProduct = currentResult.rows[0];

    if (!currentProduct) {
      throw requestError(404, 'Active product not found');
    }

    const previousStock = Number(currentProduct.stock_on_hand);
    const stockAdjustment = stock - previousStock;

    await client.query(
      `update products
       set name = $1,
           barcode = $2,
           stock_on_hand = $3,
           sale_price = $4,
           image_url = $5,
           updated_at = now()
       where id = $6`,
      [name, barcode, stock, salePrice, imageUrl, productId]
    );

    if (stockAdjustment !== 0) {
      await client.query(
        `insert into stock_movements
           (product_id, movement_type, quantity, reference_type, reference_id, notes, created_by)
         values ($1, 'adjustment', $2, 'product_edit', $1, $3, $4)`,
        [
          productId,
          stockAdjustment,
          `Manual stock edit for ${currentProduct.name}: ${previousStock} to ${stock}`,
          req.user.id,
        ]
      );
    }

    await recordActivity(client, req.user, {
      action: stockAdjustment === 0 ? 'product_updated' : 'stock_adjusted',
      description: stockAdjustment === 0
        ? `Updated product ${name}`
        : `Updated ${name} stock from ${previousStock} to ${stock}`,
      entityType: 'product',
      entityId: productId,
      metadata: {
        previousName: currentProduct.name,
        name,
        previousStock,
        stock,
        stockAdjustment,
        salePrice,
      },
    });

    const updatedResult = await client.query(
      `select p.*, c.name as category_name
       from products p
       left join categories c on c.id = p.category_id
       where p.id = $1`,
      [productId]
    );

    return updatedResult.rows[0];
  });

  return res.json(normalizeProduct(product));
}));

app.delete('/api/products/:id', requireAuth, requireRole(['owner', 'admin']), asyncRoute(async (req, res) => {
  const productId = Number(req.params.id);
  const settings = await readPosSettings();

  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  const product = await withTransaction(async (client) => {
    const result = await client.query(
      `update products
       set is_active = false,
           deleted_at = now(),
           deleted_by = $1,
           purged_at = null,
           updated_at = now()
       where id = $2 and is_active = true
       returning id, name, deleted_at`,
      [req.user.id, productId]
    );
    const deletedProduct = result.rows[0]
      ? {
        ...result.rows[0],
        purge_after: new Date(
          new Date(result.rows[0].deleted_at).getTime()
            + settings.recycleRetentionDays * 24 * 60 * 60 * 1000
        ).toISOString(),
      }
      : null;

    if (!deletedProduct) {
      throw requestError(404, 'Active product not found');
    }

    await recordActivity(client, req.user, {
      action: 'product_deleted',
      description: `Moved ${deletedProduct.name} to the recycle bin`,
      entityType: 'product',
      entityId: deletedProduct.id,
      metadata: { purgeAfter: deletedProduct.purge_after },
    });

    return deletedProduct;
  });

  return res.json({
    message: 'Product moved to recycle bin',
    product,
  });
}));

app.post('/api/products/:id/restore', requireAuth, requireRole(['owner']), asyncRoute(async (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  const product = await withTransaction(async (client) => {
    const result = await client.query(
      `update products
       set is_active = true,
           deleted_at = null,
           deleted_by = null,
           purged_at = null,
           updated_at = now()
       where id = $1 and is_active = false and deleted_at is not null and purged_at is null
       returning *`,
      [productId]
    );
    const restoredProduct = result.rows[0];

    if (!restoredProduct) {
      throw requestError(404, 'Deleted product not found');
    }

    await recordActivity(client, req.user, {
      action: 'product_restored',
      description: `Restored ${restoredProduct.name} from the recycle bin`,
      entityType: 'product',
      entityId: restoredProduct.id,
    });

    const normalizedResult = await client.query(
      `select p.*, c.name as category_name
       from products p
       left join categories c on c.id = p.category_id
       where p.id = $1`,
      [productId]
    );

    return normalizedResult.rows[0];
  });

  return res.json(normalizeProduct(product));
}));

app.post('/api/products/recycle-bin/purge-expired', requireAuth, requireRole(['owner']), asyncRoute(async (req, res) => {
  const products = await purgeExpiredDeletedProducts();
  await recordActivity(null, req.user, {
    action: 'recycle_bin_purged',
    description: `Purged ${products.length} expired product(s) from the recycle bin`,
    entityType: 'recycle_bin',
    metadata: { productIds: products.map((product) => Number(product.id)) },
  });

  return res.json({ purged: products.length, products });
}));

app.get('/api/sales', requireAuth, asyncRoute(async (_req, res) => {
  const result = await query(
    `select s.id, s.receipt_no, s.sale_date, s.total_amount, s.payment_method, s.status,
            s.cash_received, s.change_amount, s.voided_at, s.void_reason,
            coalesce(u.name, 'Unknown cashier') as cashier_name,
            vu.name as voided_by_name,
            coalesce((select sum(si.quantity) from sale_items si where si.sale_id = s.id), 0)::int as total_items
     from sales s
     left join app_users u on u.id = s.cashier_id
     left join app_users vu on vu.id = s.voided_by
     order by s.sale_date desc
     limit 50`
  );

  res.json(result.rows);
}));

app.get('/api/sales/:id', requireAuth, asyncRoute(async (req, res) => {
  const saleId = Number(req.params.id);

  if (!Number.isInteger(saleId)) {
    return res.status(400).json({ error: 'Invalid sale id' });
  }

  const [saleResult, itemResult] = await Promise.all([
    query(
      `select s.*, coalesce(u.name, 'Unknown cashier') as cashier_name,
              vu.name as voided_by_name
       from sales s
       left join app_users u on u.id = s.cashier_id
       left join app_users vu on vu.id = s.voided_by
       where s.id = $1`,
      [saleId]
    ),
    query(
      `select si.product_id, p.name, p.barcode, si.quantity, si.unit_price, si.line_total
       from sale_items si
       join products p on p.id = si.product_id
       where si.sale_id = $1
       order by si.id`,
      [saleId]
    ),
  ]);

  if (!saleResult.rows[0]) {
    return res.status(404).json({ error: 'Sale not found' });
  }

  return res.json(normalizeReceipt(saleResult.rows[0], itemResult.rows));
}));

app.post(
  '/api/sales/:id/void',
  requireAuth,
  requireRole(['owner', 'admin', 'cashier']),
  asyncRoute(async (req, res) => {
    const saleId = Number(req.params.id);
    const reason = String(req.body.reason || '').trim();
    const settings = await readPosSettings();
    const reasonIsOptional = req.user.role === 'owner'
      || (req.user.role === 'cashier' && !settings.cashierVoidReasonRequired);

    if (!Number.isInteger(saleId)) {
      return res.status(400).json({ error: 'Invalid sale id' });
    }

    if (reason.length > 300) {
      return res.status(400).json({ error: 'Cancellation reason must not exceed 300 characters' });
    }

    if (!reasonIsOptional && reason.length < 3) {
      return res.status(400).json({ error: 'Cashier and admin accounts must provide a cancellation reason' });
    }

    if (reasonIsOptional && reason.length > 0 && reason.length < 3) {
      return res.status(400).json({ error: 'Leave the reason blank or enter at least 3 characters' });
    }

    const voidedReceipt = await withTransaction(async (client) => {
      const saleResult = await client.query(
        `select *
         from sales
         where id = $1
         for update`,
        [saleId]
      );
      const sale = saleResult.rows[0];

      if (!sale) {
        throw requestError(404, 'Sale not found');
      }

      if (sale.status !== 'paid') {
        throw requestError(409, `Receipt ${sale.receipt_no} is already ${sale.status}`);
      }

      const itemResult = await client.query(
        `select si.product_id, p.name, p.barcode, si.quantity, si.unit_price, si.line_total
         from sale_items si
         join products p on p.id = si.product_id
         where si.sale_id = $1
         order by si.id`,
        [saleId]
      );

      for (const item of itemResult.rows) {
        await client.query(
          `update products
           set stock_on_hand = stock_on_hand + $1,
               updated_at = now()
           where id = $2`,
          [item.quantity, item.product_id]
        );
        await client.query(
          `insert into stock_movements
             (product_id, movement_type, quantity, reference_type, reference_id, notes, created_by)
           values ($1, 'return', $2, 'sale_void', $3, $4, $5)`,
          [
            item.product_id,
            item.quantity,
            saleId,
            reason
              ? `Restored from voided receipt ${sale.receipt_no}: ${reason}`
              : `Restored from owner-authorized void ${sale.receipt_no}; no reason provided`,
            req.user.id,
          ]
        );
      }

      const updatedSaleResult = await client.query(
        `update sales
         set status = 'voided',
             voided_at = now(),
             voided_by = $2,
             void_reason = $3
         where id = $1
         returning *`,
        [saleId, req.user.id, reason || null]
      );
      const cashierResult = await client.query(
        `select name from app_users where id = $1`,
        [sale.cashier_id]
      );

      await recordActivity(client, req.user, {
        action: 'sale_voided',
        description: `Voided receipt ${sale.receipt_no} and restored ${itemResult.rows.length} product line(s)`,
        entityType: 'sale',
        entityId: saleId,
        metadata: {
          receiptNo: sale.receipt_no,
          reason: reason || null,
          totalAmount: Number(sale.total_amount),
          restoredUnits: itemResult.rows.reduce((total, item) => total + Number(item.quantity), 0),
        },
      });

      return normalizeReceipt(
        {
          ...updatedSaleResult.rows[0],
          cashier_name: cashierResult.rows[0]?.name || 'Unknown cashier',
          voided_by_name: req.user.name,
        },
        itemResult.rows
      );
    });

    return res.json(voidedReceipt);
  })
);

function shiftCalendarDate(dateString, days) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function monthStart(dateString) {
  return `${dateString.slice(0, 7)}-01`;
}

function nextMonthStart(dateString) {
  const date = new Date(`${monthStart(dateString)}T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + 1);
  return date.toISOString().slice(0, 10);
}

function enumerateCalendarDays(fromDate, toDate) {
  const days = [];
  for (let day = fromDate; day <= toDate; day = shiftCalendarDate(day, 1)) {
    days.push(day);
  }
  return days;
}

function enumerateCalendarMonths(fromDate, toDate) {
  const months = [];
  for (
    let month = monthStart(fromDate);
    month <= monthStart(toDate);
    month = nextMonthStart(month)
  ) {
    months.push(month.slice(0, 7));
  }
  return months;
}

function formatReportDay(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(`${dateString}T00:00:00.000Z`));
}

function formatReportMonth(monthKey) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${monthKey}-01T00:00:00.000Z`));
}

app.get('/api/reports/summary', asyncRoute(async (req, res) => {
  const fromDate = /^\d{4}-\d{2}-\d{2}$/.test(String(req.query.from || ''))
    ? String(req.query.from)
    : shiftCalendarDate(new Date().toISOString().slice(0, 10), -6);
  const toDate = /^\d{4}-\d{2}-\d{2}$/.test(String(req.query.to || ''))
    ? String(req.query.to)
    : new Date().toISOString().slice(0, 10);

  if (fromDate > toDate) {
    throw requestError(400, 'Report start date must not be after the end date');
  }

  const dateParams = [fromDate, toDate];
  const weeklyFrom = fromDate > shiftCalendarDate(toDate, -6)
    ? fromDate
    : shiftCalendarDate(toDate, -6);
  const selectedMonthStart = monthStart(toDate);
  const selectedMonthEnd = shiftCalendarDate(nextMonthStart(toDate), -1);

  const [
    overview,
    dailySalesResult,
    topProducts,
    categoryStock,
    categorySales,
    weeklyBestSellers,
    monthlyBestSellers,
    monthlySalesResult,
    lowStock,
    recentSales,
  ] = await Promise.all([
    query(
      `with filtered_sales as (
         select *
         from sales
         where status = 'paid'
           and date(sale_date, 'localtime') between $1 and $2
       )
       select
         coalesce(sum(fs.total_amount), 0) as revenue,
         count(fs.id) as transactions,
         coalesce((
           select sum(si.quantity)
           from sale_items si
           join filtered_sales filtered on filtered.id = si.sale_id
         ), 0) as units_sold,
         coalesce(avg(fs.total_amount), 0) as average_order
       from filtered_sales fs`,
      dateParams
    ),
    query(
      `select
         date(sale_date, 'localtime') as period,
         coalesce(sum(total_amount), 0) as revenue,
         count(id) as transactions
       from sales
       where status = 'paid'
         and date(sale_date, 'localtime') between $1 and $2
       group by period
       order by period`,
      dateParams
    ),
    query(
      `select
         p.name,
         coalesce(sum(case when s.id is not null then si.quantity else 0 end), 0) as quantity,
         coalesce(sum(case when s.id is not null then si.line_total else 0 end), 0) as revenue
       from products p
       left join sale_items si on si.product_id = p.id
       left join sales s on s.id = si.sale_id
        and s.status = 'paid'
        and date(s.sale_date, 'localtime') between $1 and $2
       where p.is_active = true
       group by p.id
       order by revenue desc, quantity desc, p.name
       limit 6`,
      dateParams
    ),
    query(
      `select
         coalesce(c.name, 'Uncategorized') as category,
         coalesce(sum(p.stock_on_hand), 0) as stock,
         coalesce(sum(p.stock_on_hand * p.sale_price), 0) as stock_value
       from products p
       left join categories c on c.id = p.category_id
       where p.is_active = true
       group by c.name
       order by stock_value desc`
    ),
    query(
      `select
         coalesce(c.name, 'Uncategorized') as category,
         coalesce(sum(si.line_total), 0) as revenue
       from sales s
       join sale_items si on si.sale_id = s.id
       join products p on p.id = si.product_id
       left join categories c on c.id = p.category_id
       where s.status = 'paid'
         and date(s.sale_date, 'localtime') between $1 and $2
       group by c.name
       order by revenue desc`,
      dateParams
    ),
    query(
      `select
         p.name,
         coalesce(sum(si.quantity), 0) as quantity,
         coalesce(sum(si.line_total), 0) as revenue
       from sales s
       join sale_items si on si.sale_id = s.id
       join products p on p.id = si.product_id
       where s.status = 'paid'
         and date(s.sale_date, 'localtime') between $1 and $2
       group by p.id
       order by quantity desc, revenue desc, p.name
       limit 6`,
      [weeklyFrom, toDate]
    ),
    query(
      `select
         p.name,
         coalesce(sum(si.quantity), 0) as quantity,
         coalesce(sum(si.line_total), 0) as revenue
       from sales s
       join sale_items si on si.sale_id = s.id
       join products p on p.id = si.product_id
       where s.status = 'paid'
         and date(s.sale_date, 'localtime') between $1 and $2
       group by p.id
       order by quantity desc, revenue desc, p.name
       limit 6`,
      [selectedMonthStart, selectedMonthEnd]
    ),
    query(
      `select
         substr(date(sale_date, 'localtime'), 1, 7) as period,
         coalesce(sum(total_amount), 0) as revenue,
         count(id) as transactions
       from sales
       where status = 'paid'
         and date(sale_date, 'localtime') between $1 and $2
       group by period
       order by period`,
      dateParams
    ),
    query(
      `select p.name, p.stock_on_hand, p.reorder_level
       from products p
       where p.is_active = true and p.stock_on_hand <= p.reorder_level
       order by p.stock_on_hand asc, p.name
       limit 8`
    ),
    query(
      `select receipt_no, sale_date, total_amount, payment_method, status
       from sales
       where date(sale_date, 'localtime') between $1 and $2
       order by sale_date desc
       limit 8`,
      dateParams
    ),
  ]);

  const dailySalesByPeriod = new Map(
    dailySalesResult.rows.map((row) => [row.period, row])
  );
  const monthlySalesByPeriod = new Map(
    monthlySalesResult.rows.map((row) => [row.period, row])
  );

  res.json({
    range: { from: fromDate, to: toDate },
    overview: {
      revenue: Number(overview.rows[0].revenue),
      transactions: Number(overview.rows[0].transactions),
      unitsSold: Number(overview.rows[0].units_sold),
      averageOrder: Number(overview.rows[0].average_order),
    },
    dailySales: enumerateCalendarDays(fromDate, toDate).map((period) => {
      const row = dailySalesByPeriod.get(period);
      return {
        label: formatReportDay(period),
        revenue: Number(row?.revenue || 0),
        transactions: Number(row?.transactions || 0),
      };
    }),
    topProducts: topProducts.rows.map((row) => ({
      name: row.name,
      quantity: Number(row.quantity),
      revenue: Number(row.revenue),
    })),
    categoryStock: categoryStock.rows.map((row) => ({
      category: row.category,
      stock: Number(row.stock),
      stockValue: Number(row.stock_value),
    })),
    categorySales: categorySales.rows.map((row) => ({
      category: row.category,
      revenue: Number(row.revenue),
    })),
    weeklyBestSellers: weeklyBestSellers.rows.map((row) => ({
      name: row.name,
      quantity: Number(row.quantity),
      revenue: Number(row.revenue),
    })),
    monthlyBestSellers: monthlyBestSellers.rows.map((row) => ({
      name: row.name,
      quantity: Number(row.quantity),
      revenue: Number(row.revenue),
    })),
    monthlySales: enumerateCalendarMonths(fromDate, toDate).map((period) => {
      const row = monthlySalesByPeriod.get(period);
      return {
        label: formatReportMonth(period),
        revenue: Number(row?.revenue || 0),
        transactions: Number(row?.transactions || 0),
      };
    }),
    lowStock: lowStock.rows.map((row) => ({
      name: row.name,
      stock: Number(row.stock_on_hand),
      reorderLevel: Number(row.reorder_level),
    })),
    recentSales: recentSales.rows.map((row) => ({
      receiptNo: row.receipt_no,
      saleDate: row.sale_date,
      totalAmount: Number(row.total_amount),
      paymentMethod: row.payment_method,
      status: row.status,
    })),
  });
}));

app.post('/api/checkout', requireAuth, asyncRoute(async (req, res) => {
  const { items, paymentMethod = 'cash', cashReceived = 0 } = req.body;
  const settings = await readPosSettings();

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Checkout needs at least one item' });
  }

  const normalizedPaymentMethod = String(paymentMethod).toLowerCase();
  if (!settings.enabledPaymentMethods.includes(normalizedPaymentMethod)) {
    return res.status(400).json({ error: 'This payment method is disabled in POS settings' });
  }

  const requestedItems = new Map();
  for (const item of items) {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);

    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Each checkout item needs a valid product and quantity' });
    }

    requestedItems.set(productId, (requestedItems.get(productId) || 0) + quantity);
  }

  const tenderedAmount = Number(cashReceived);
  if (!Number.isFinite(tenderedAmount) || tenderedAmount < 0) {
    return res.status(400).json({ error: 'Enter a valid amount received' });
  }

  const receipt = await withTransaction(async (client) => {
    let total = 0;
    const checkedItems = [];

    for (const [productId, quantity] of requestedItems) {
      const productResult = await client.query(
        `select id, name, barcode, stock_on_hand, sale_price
         from products
         where id = $1 and is_active = true
         for update`,
        [productId]
      );
      const product = productResult.rows[0];

      if (!product) throw requestError(404, `Product ${productId} not found`);
      if (Number(product.stock_on_hand) < quantity) {
        throw requestError(409, `${product.name} only has ${product.stock_on_hand} item(s) in stock`);
      }

      const lineTotal = Math.round(Number(product.sale_price) * quantity * 100) / 100;
      total = Math.round((total + lineTotal) * 100) / 100;
      checkedItems.push({ product, quantity, unitPrice: Number(product.sale_price), lineTotal });
    }

    const actualCashReceived = normalizedPaymentMethod === 'cash' ? tenderedAmount : total;
    if (normalizedPaymentMethod === 'cash' && actualCashReceived < total) {
      throw requestError(400, `Amount received is short by ${total - actualCashReceived}`);
    }

    const receiptNo = `FC-${Date.now()}`;
    const saleResult = await client.query(
      `insert into sales (receipt_no, cashier_id, total_amount, payment_method, cash_received, change_amount)
       values ($1, $2, $3, $4, $5, $6)
       returning *`,
      [
        receiptNo,
        req.user.id,
        total,
        normalizedPaymentMethod,
        actualCashReceived,
        Math.round(Math.max(actualCashReceived - total, 0) * 100) / 100,
      ]
    );

    for (const item of checkedItems) {
      await client.query(
        `insert into sale_items (sale_id, product_id, quantity, unit_price, line_total)
         values ($1, $2, $3, $4, $5)`,
        [saleResult.rows[0].id, item.product.id, item.quantity, item.unitPrice, item.lineTotal]
      );
      await client.query(
        `update products set stock_on_hand = stock_on_hand - $1, updated_at = now() where id = $2`,
        [item.quantity, item.product.id]
      );
      await client.query(
        `insert into stock_movements (product_id, movement_type, quantity, reference_type, reference_id, notes, created_by)
         values ($1, 'sale', $2, 'sale', $3, $4, $5)`,
        [item.product.id, -item.quantity, saleResult.rows[0].id, `Sold on ${receiptNo}`, req.user.id]
      );
    }

    const receiptItems = checkedItems.map((item) => ({
      product_id: item.product.id,
      name: item.product.name,
      barcode: item.product.barcode,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      line_total: item.lineTotal,
    }));

    await recordActivity(client, req.user, {
      action: 'sale_completed',
      description: `Completed sale ${receiptNo} for PHP ${total.toFixed(2)}`,
      entityType: 'sale',
      entityId: saleResult.rows[0].id,
      metadata: {
        receiptNo,
        paymentMethod: normalizedPaymentMethod,
        totalAmount: total,
        totalUnits: checkedItems.reduce((sum, item) => sum + item.quantity, 0),
      },
    });

    return normalizeReceipt(
      { ...saleResult.rows[0], cashier_name: req.user.name },
      receiptItems
    );
  });

  res.status(201).json(receipt);
}));

const serverModuleDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultFrontendDistDirectory = path.resolve(
  serverModuleDirectory,
  '..',
  '..',
  'frontend',
  'dist'
);
const frontendDistDirectory = path.resolve(
  process.env.FRONTEND_DIST_DIR || defaultFrontendDistDirectory
);
const frontendIndexPath = path.join(frontendDistDirectory, 'index.html');

if (fs.existsSync(frontendIndexPath)) {
  app.use(express.static(frontendDistDirectory, {
    index: false,
    maxAge: isProduction ? '1d' : 0,
  }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      next();
      return;
    }
    res.sendFile(frontendIndexPath);
  });
}

app.use((error, _req, res, _next) => {
  console.error(error);
  const requestedStatus = Number(error.status);
  const status = Number.isInteger(requestedStatus) && requestedStatus >= 400 && requestedStatus < 600
    ? requestedStatus
    : 500;
  const message = status >= 500 ? 'Server error' : (error.message || 'Request failed');
  res.status(status).json({ error: message });
});

let serverInstance = null;
let purgeTimer = null;

async function prepareDatabase() {
  await ensureProductRecycleBinSchema();
  await ensureSalesVoidSchema();
  await ensureUserActivitySchema();
  await ensurePosSettingsSchema();
  await ensureDefaultProductImages();
  await purgeExpiredDeletedProducts();
}

export async function startServer({ listenPort = port, host = '127.0.0.1' } = {}) {
  if (serverInstance) return serverInstance;

  await prepareDatabase();
  serverInstance = await new Promise((resolve, reject) => {
    const server = app.listen(listenPort, host, () => resolve(server));
    server.once('error', reject);
  });

  purgeTimer = setInterval(() => {
    purgeExpiredDeletedProducts().catch((error) => {
      console.error('Failed to purge expired deleted products', error);
    });
  }, 60 * 60 * 1000);
  purgeTimer.unref?.();

  const address = serverInstance.address();
  const activePort = typeof address === 'object' && address ? address.port : listenPort;
  console.log(
    `Fabian's Car Care POS running on http://${host}:${activePort} with SQLite (${getDatabasePath()})`
  );
  return serverInstance;
}

export async function stopServer() {
  if (purgeTimer) {
    clearInterval(purgeTimer);
    purgeTimer = null;
  }

  if (serverInstance) {
    const server = serverInstance;
    serverInstance = null;
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }

  await pool.end();
}

const isDirectRun = process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  startServer().catch((error) => {
    console.error('Failed to start Fabian\'s Car Care POS', error);
    process.exitCode = 1;
  });

  process.once('SIGINT', async () => {
    await stopServer();
    process.exit(0);
  });
}
