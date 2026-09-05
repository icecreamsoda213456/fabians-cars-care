import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { backup, DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

dotenv.config();

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendDirectory = path.resolve(moduleDirectory, '..');
const defaultDatabasePath = path.join(backendDirectory, 'data', 'fabians-pos.sqlite');
const databasePath = path.resolve(process.env.SQLITE_DB_PATH || defaultDatabasePath);
const schemaPath = path.join(backendDirectory, 'db', 'sqlite_schema.sql');
const seedPath = path.join(backendDirectory, 'db', 'seed.sql');

let database = null;
let transactionQueue = Promise.resolve();

const booleanColumns = new Set([
  'is_active',
  'auto_open_receipt',
  'auto_print_receipt',
  'barcode_auto_add',
  'cashier_void_reason_required',
]);

const jsonColumns = new Set([
  'metadata',
  'enabled_payment_methods',
  'common_bills',
]);

function toSqliteValue(value) {
  if (value === undefined) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value) || (value && typeof value === 'object')) {
    return JSON.stringify(value);
  }
  return value;
}

function decodeRow(row) {
  const decoded = { ...row };

  for (const [key, value] of Object.entries(decoded)) {
    if (booleanColumns.has(key) && value !== null) {
      decoded[key] = Boolean(value);
    }

    if (jsonColumns.has(key) && typeof value === 'string') {
      try {
        decoded[key] = JSON.parse(value);
      } catch {
        decoded[key] = key === 'metadata' ? {} : [];
      }
    }
  }

  return decoded;
}

function translateQuery(text, params) {
  const values = [];
  let sql = String(text)
    .replace(/\s+for\s+update\b/gi, '')
    .replace(/\bilike\b/gi, 'like')
    .replace(/\bnow\(\)/gi, "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");

  sql = sql.replace(/\$(\d+)(?:::[a-z_]+(?:\[\])?)?/gi, (_match, index) => {
    values.push(toSqliteValue(params[Number(index) - 1]));
    return '?';
  });

  sql = sql.replace(
    /::(?:bigint|int|integer|smallint|numeric|real|text|varchar|date|timestamptz|jsonb)\b/gi,
    ''
  );

  return { sql, values };
}

function mapSqliteError(error) {
  if (
    error?.code === 'ERR_SQLITE_ERROR'
    && /unique constraint failed/i.test(String(error.message))
  ) {
    error.code = '23505';
  }

  return error;
}

function executeQuery(text, params = []) {
  const db = getDatabase();
  const startedAt = Date.now();
  const { sql, values } = translateQuery(text, params);
  const trimmedSql = sql.trim();

  try {
    if (values.length === 0 && trimmedSql.split(';').filter(Boolean).length > 1) {
      db.exec(trimmedSql);
      return { rows: [], rowCount: 0 };
    }

    const statement = db.prepare(trimmedSql);
    const returnsRows = /^(select|with|pragma)\b/i.test(trimmedSql)
      || /\breturning\b/i.test(trimmedSql);

    if (returnsRows) {
      const rows = statement.all(...values).map(decodeRow);
      return { rows, rowCount: rows.length };
    }

    const result = statement.run(...values);
    return {
      rows: [],
      rowCount: Number(result.changes || 0),
      lastInsertRowid: Number(result.lastInsertRowid || 0),
    };
  } catch (error) {
    throw mapSqliteError(error);
  } finally {
    const duration = Date.now() - startedAt;
    if (duration > 750) {
      console.warn(`Slow SQLite query (${duration}ms): ${trimmedSql}`);
    }
  }
}

export function initializeDatabase({ seedIfEmpty = true } = {}) {
  if (database) return databasePath;

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  database = new DatabaseSync(databasePath, {
    timeout: 5000,
    enableForeignKeyConstraints: true,
  });
  database.exec(`
    pragma foreign_keys = on;
    pragma journal_mode = wal;
    pragma synchronous = normal;
    pragma busy_timeout = 5000;
  `);
  database.exec(fs.readFileSync(schemaPath, 'utf8'));

  if (seedIfEmpty) {
    const userCount = database.prepare('select count(*) as total from app_users').get().total;
    if (Number(userCount) === 0) {
      database.exec(fs.readFileSync(seedPath, 'utf8'));
    }
  }

  return databasePath;
}

export function getDatabase() {
  if (!database) initializeDatabase();
  return database;
}

export function getDatabasePath() {
  return databasePath;
}

export async function query(text, params = []) {
  return executeQuery(text, params);
}

export function withTransaction(work) {
  const runTransaction = async () => {
    const db = getDatabase();
    db.exec('begin immediate');

    try {
      const result = await work({ query });
      db.exec('commit');
      return result;
    } catch (error) {
      db.exec('rollback');
      throw error;
    }
  };

  const queuedTransaction = transactionQueue.then(runTransaction, runTransaction);
  transactionQueue = queuedTransaction.catch(() => undefined);
  return queuedTransaction;
}

export async function backupDatabase(destinationPath) {
  await transactionQueue;
  const db = getDatabase();
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  await backup(db, destinationPath);
  return destinationPath;
}

export async function closeDatabase() {
  await transactionQueue;
  if (!database) return;
  database.close();
  database = null;
}

export const pool = {
  end: closeDatabase,
};
