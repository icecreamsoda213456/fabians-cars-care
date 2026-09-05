import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { fileURLToPath } from 'node:url';

dotenv.config();

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendDirectory = path.resolve(moduleDirectory, '..');
const targetArgument = process.argv.find((argument) => argument.startsWith('--target='));
const targetPath = path.resolve(
  targetArgument?.slice('--target='.length)
    || path.join(backendDirectory, 'data', 'fabians-pos.import.sqlite')
);

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required for the one-time PostgreSQL import');
}

if (fs.existsSync(targetPath)) {
  throw new Error(`Import target already exists: ${targetPath}`);
}

process.env.SQLITE_DB_PATH = targetPath;

const { Pool } = pg;
const sourcePool = new Pool({ connectionString: process.env.DATABASE_URL });
const {
  closeDatabase,
  initializeDatabase,
  query,
  withTransaction,
} = await import('./db.js');

const tableSpecs = [
  {
    name: 'app_users',
    columns: [
      'id',
      'name',
      'username',
      'password_hash',
      'role',
      'is_active',
      'last_login_at',
      'created_at',
      'updated_at',
    ],
  },
  {
    name: 'pos_settings',
    columns: [
      'id',
      'shop_name',
      'shop_address',
      'contact_number',
      'tin',
      'shop_logo_url',
      'receipt_footer',
      'receipt_paper_size',
      'auto_open_receipt',
      'auto_print_receipt',
      'enabled_payment_methods',
      'default_payment_method',
      'common_bills',
      'barcode_auto_add',
      'default_reorder_level',
      'recycle_retention_days',
      'inactivity_timeout_minutes',
      'cashier_void_reason_required',
      'updated_by',
      'created_at',
      'updated_at',
    ],
  },
  {
    name: 'categories',
    columns: ['id', 'name', 'description', 'created_at'],
  },
  {
    name: 'products',
    columns: [
      'id',
      'sku',
      'barcode',
      'name',
      'category_id',
      'stock_on_hand',
      'reorder_level',
      'buy_price',
      'sale_price',
      'image_url',
      'is_active',
      'deleted_at',
      'deleted_by',
      'purged_at',
      'created_at',
      'updated_at',
    ],
  },
  {
    name: 'sales',
    columns: [
      'id',
      'receipt_no',
      'cashier_id',
      'sale_date',
      'total_amount',
      'payment_method',
      'cash_received',
      'change_amount',
      'status',
      'voided_at',
      'voided_by',
      'void_reason',
    ],
  },
  {
    name: 'sale_items',
    columns: ['id', 'sale_id', 'product_id', 'quantity', 'unit_price', 'line_total'],
  },
  {
    name: 'stock_movements',
    columns: [
      'id',
      'product_id',
      'movement_type',
      'quantity',
      'reference_type',
      'reference_id',
      'notes',
      'created_by',
      'created_at',
    ],
  },
  {
    name: 'user_activity_logs',
    columns: [
      'id',
      'user_id',
      'user_name',
      'user_role',
      'action',
      'entity_type',
      'entity_id',
      'description',
      'metadata',
      'created_at',
    ],
  },
];

function normalizeImportedValue(value) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'bigint') return Number(value);
  return value;
}

async function readSourceRows(spec) {
  const result = await sourcePool.query(
    `select ${spec.columns.join(', ')} from ${spec.name} order by id`
  );
  return result.rows;
}

async function insertRows(client, spec, rows) {
  if (spec.name === 'pos_settings') {
    await client.query('delete from pos_settings');
  }

  const placeholders = spec.columns.map((_, index) => `$${index + 1}`).join(', ');
  const insertSql = `
    insert into ${spec.name} (${spec.columns.join(', ')})
    values (${placeholders})
  `;

  for (const row of rows) {
    await client.query(
      insertSql,
      spec.columns.map((column) => normalizeImportedValue(row[column]))
    );
  }
}

async function collectVerificationCounts(execute) {
  const counts = {};
  for (const spec of tableSpecs) {
    const result = await execute(`select count(*) as total from ${spec.name}`);
    counts[spec.name] = Number(result.rows[0].total);
  }
  return counts;
}

try {
  initializeDatabase({ seedIfEmpty: false });
  const sourceRows = new Map();

  for (const spec of tableSpecs) {
    sourceRows.set(spec.name, await readSourceRows(spec));
  }

  await withTransaction(async (client) => {
    for (const spec of tableSpecs) {
      await insertRows(client, spec, sourceRows.get(spec.name));
    }

    await client.query(
      `insert into database_meta (key, value, updated_at)
       values ('postgres_imported_at', $1, $1)
       on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at`,
      [new Date().toISOString()]
    );
  });

  const sourceCounts = Object.fromEntries(
    tableSpecs.map((spec) => [spec.name, sourceRows.get(spec.name).length])
  );
  const targetCounts = await collectVerificationCounts(query);
  const mismatches = tableSpecs.filter(
    (spec) => sourceCounts[spec.name] !== targetCounts[spec.name]
  );

  if (mismatches.length > 0) {
    throw new Error(
      `Verification failed for: ${mismatches.map((spec) => spec.name).join(', ')}`
    );
  }

  const sourceStock = await sourcePool.query(
    'select coalesce(sum(stock_on_hand), 0)::numeric as total from products'
  );
  const targetStock = await query(
    'select coalesce(sum(stock_on_hand), 0) as total from products'
  );
  const sourceSales = await sourcePool.query(
    `select coalesce(sum(total_amount), 0)::numeric as total
     from sales
     where status = 'paid'`
  );
  const targetSales = await query(
    `select coalesce(sum(total_amount), 0) as total
     from sales
     where status = 'paid'`
  );

  if (Number(sourceStock.rows[0].total) !== Number(targetStock.rows[0].total)) {
    throw new Error('Stock-total verification failed');
  }
  if (Number(sourceSales.rows[0].total) !== Number(targetSales.rows[0].total)) {
    throw new Error('Paid-sales-total verification failed');
  }

  console.log(JSON.stringify({
    ok: true,
    targetPath,
    counts: targetCounts,
    stockOnHand: Number(targetStock.rows[0].total),
    paidSalesTotal: Number(targetSales.rows[0].total),
  }, null, 2));
} finally {
  await sourcePool.end();
  await closeDatabase();
}
