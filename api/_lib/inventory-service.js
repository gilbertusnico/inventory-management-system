import { neon } from '@neondatabase/serverless';
import { verifyToken } from '@clerk/backend';
import {
  TokenVerificationError,
  TokenVerificationErrorReason,
} from '@clerk/backend/errors';

const schemaVersion = 'relational_schema_v1';
const legacyTables = [
  'categories',
  'suppliers',
  'warehouses',
  'products',
  'product_stocks',
  'barang_masuk',
  'barang_keluar',
  'stock_adjustments',
  'stock_transfers',
  'users',
];

let neonSql;
let schemaReady;

function getSql() {
  if (!process.env.DATABASE_URL) {
    const error = new Error('DATABASE_URL belum dikonfigurasi');
    error.status = 503;
    throw error;
  }
  if (!neonSql) neonSql = neon(process.env.DATABASE_URL);
  return neonSql;
}

async function hasTable(sql, table) {
  const rows = await sql`
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = ${table}
  `;
  return rows.length > 0;
}

async function readLegacySnapshot(sql) {
  for (const table of ['inventory_state', 'legacy_inventory_state_jsonb']) {
    if (await hasTable(sql, table)) {
      const rows = await sql.query('SELECT data FROM ' + table + ' WHERE id = 1');
      if (rows[0]?.data) return rows[0].data;
    }
  }

  const tables = await sql`
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'data'
      AND table_name = ANY(${legacyTables})
  `;
  if (!tables.length) return null;

  const tableNames = new Set(tables.map(function(row) { return row.table_name; }));
  const keyByTable = {
    categories: 'categories',
    suppliers: 'suppliers',
    warehouses: 'warehouses',
    products: 'products',
    product_stocks: 'productStocks',
    barang_masuk: 'barangMasuk',
    barang_keluar: 'barangKeluar',
    stock_adjustments: 'stockAdjustments',
    stock_transfers: 'stockTransfers',
    users: 'users',
  };
  const snapshot = Object.fromEntries(
    Object.values(keyByTable).map(function(key) { return [key, []]; })
  );
  snapshot.stockOpnameFisik = {};
  for (const table of legacyTables) {
    if (!tableNames.has(table)) continue;
    const rows = await sql.query('SELECT data FROM ' + table + ' ORDER BY id');
    snapshot[keyByTable[table]] = rows.map(function(row) { return row.data; });
  }
  return snapshot;
}

async function archiveLegacyTables(sql) {
  const columns = await sql`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ANY(${legacyTables})
  `;
  const legacyJsonTables = new Set(
    columns.filter(function(row) { return row.column_name === 'data'; })
      .map(function(row) { return row.table_name; })
  );
  const existing = new Set(columns.map(function(row) { return row.table_name; }));
  const queries = [];
  for (const table of legacyTables) {
    if (!legacyJsonTables.has(table)) continue;
    const archive = 'legacy_' + table + '_jsonb';
    if (existing.has(archive)) {
      throw new Error('Tabel arsip ' + archive + ' sudah ada; migrasi dihentikan agar data tidak tertimpa');
    }
    queries.push(sql.query('ALTER TABLE ' + table + ' RENAME TO ' + archive));
  }
  if (await hasTable(sql, 'inventory_state')) {
    if (await hasTable(sql, 'legacy_inventory_state_jsonb')) {
      throw new Error('Tabel arsip legacy_inventory_state_jsonb sudah ada; migrasi dihentikan agar data tidak tertimpa');
    }
    queries.push(sql`ALTER TABLE inventory_state RENAME TO legacy_inventory_state_jsonb`);
  }
  if (queries.length) await sql.transaction(queries);
}

function defineRelationalSchema(sql) {
  return [
    sql`CREATE TABLE IF NOT EXISTS categories (
      id integer PRIMARY KEY, name text NOT NULL, description text NOT NULL DEFAULT '',
      created_at text NOT NULL DEFAULT ''
    )`,
    sql`CREATE TABLE IF NOT EXISTS suppliers (
      id integer PRIMARY KEY, name text NOT NULL, pic text NOT NULL DEFAULT '',
      email text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '', created_at text NOT NULL DEFAULT ''
    )`,
    sql`CREATE TABLE IF NOT EXISTS warehouses (
      id integer PRIMARY KEY, code text NOT NULL, name text NOT NULL, location text NOT NULL DEFAULT '',
      status text NOT NULL DEFAULT '', created_at text NOT NULL DEFAULT ''
    )`,
    sql`CREATE TABLE IF NOT EXISTS products (
      id integer PRIMARY KEY, sku text NOT NULL UNIQUE, name text NOT NULL,
      category_id integer NOT NULL REFERENCES categories(id),
      supplier_id integer NOT NULL REFERENCES suppliers(id),
      price numeric(14, 2) NOT NULL CHECK (price >= 0),
      min_stock integer NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
      status text NOT NULL DEFAULT '', created_at text NOT NULL DEFAULT ''
    )`,
    sql`CREATE TABLE IF NOT EXISTS product_stocks (
      id integer PRIMARY KEY,
      product_id integer NOT NULL REFERENCES products(id),
      warehouse_id integer NOT NULL REFERENCES warehouses(id),
      stock integer NOT NULL CHECK (stock >= 0),
      UNIQUE (product_id, warehouse_id)
    )`,
    sql`CREATE TABLE IF NOT EXISTS barang_masuk (
      id integer PRIMARY KEY, date text NOT NULL,
      supplier_id integer NOT NULL REFERENCES suppliers(id),
      warehouse_id integer NOT NULL REFERENCES warehouses(id),
      ref text NOT NULL, note text NOT NULL DEFAULT ''
    )`,
    sql`CREATE TABLE IF NOT EXISTS barang_masuk_items (
      transaction_id integer NOT NULL REFERENCES barang_masuk(id) ON DELETE CASCADE,
      line_number integer NOT NULL,
      product_id integer NOT NULL REFERENCES products(id),
      qty integer NOT NULL CHECK (qty > 0),
      PRIMARY KEY (transaction_id, line_number)
    )`,
    sql`CREATE TABLE IF NOT EXISTS barang_keluar (
      id integer PRIMARY KEY, date text NOT NULL, penerima text NOT NULL,
      warehouse_id integer NOT NULL REFERENCES warehouses(id),
      ref text NOT NULL, note text NOT NULL DEFAULT ''
    )`,
    sql`CREATE TABLE IF NOT EXISTS barang_keluar_items (
      transaction_id integer NOT NULL REFERENCES barang_keluar(id) ON DELETE CASCADE,
      line_number integer NOT NULL,
      product_id integer NOT NULL REFERENCES products(id),
      qty integer NOT NULL CHECK (qty > 0),
      PRIMARY KEY (transaction_id, line_number)
    )`,
    sql`CREATE TABLE IF NOT EXISTS stock_adjustments (
      id integer PRIMARY KEY, date text NOT NULL,
      product_id integer NOT NULL REFERENCES products(id),
      warehouse_id integer NOT NULL REFERENCES warehouses(id),
      sistem integer NOT NULL, fisik integer NOT NULL, selisih integer NOT NULL,
      alasan text NOT NULL DEFAULT ''
    )`,
    sql`CREATE TABLE IF NOT EXISTS stock_transfers (
      id integer PRIMARY KEY, date text NOT NULL,
      from_warehouse_id integer NOT NULL REFERENCES warehouses(id),
      to_warehouse_id integer NOT NULL REFERENCES warehouses(id),
      ref text NOT NULL
    )`,
    sql`CREATE TABLE IF NOT EXISTS stock_transfer_items (
      transaction_id integer NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
      line_number integer NOT NULL,
      product_id integer NOT NULL REFERENCES products(id),
      qty integer NOT NULL CHECK (qty > 0),
      PRIMARY KEY (transaction_id, line_number)
    )`,
    sql`CREATE TABLE IF NOT EXISTS users (
      id integer PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE,
      role text NOT NULL, status text NOT NULL, last_login text NOT NULL DEFAULT '',
      created_at text NOT NULL DEFAULT ''
    )`,
    sql`CREATE TABLE IF NOT EXISTS stock_opname_fisik (
      product_id integer NOT NULL REFERENCES products(id),
      warehouse_id integer NOT NULL REFERENCES warehouses(id),
      fisik integer NOT NULL CHECK (fisik >= 0),
      PRIMARY KEY (product_id, warehouse_id)
    )`,
    sql`CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id)`,
    sql`CREATE INDEX IF NOT EXISTS products_supplier_id_idx ON products(supplier_id)`,
    sql`CREATE INDEX IF NOT EXISTS product_stocks_warehouse_id_idx ON product_stocks(warehouse_id)`,
    sql`CREATE INDEX IF NOT EXISTS barang_masuk_date_idx ON barang_masuk(date)`,
    sql`CREATE INDEX IF NOT EXISTS barang_keluar_date_idx ON barang_keluar(date)`,
    sql`CREATE INDEX IF NOT EXISTS stock_adjustments_date_idx ON stock_adjustments(date)`,
    sql`CREATE INDEX IF NOT EXISTS stock_transfers_date_idx ON stock_transfers(date)`,
  ];
}

async function getMigrationSnapshot(sql) {
  return readLegacySnapshot(sql);
}

function insertRows(sql, table, columns, rows) {
  if (!rows.length) return null;
  const names = columns.map(function(column) { return column[0]; }).join(', ');
  const definitions = columns.map(function(column) {
    return column[0] + ' ' + column[1];
  }).join(', ');
  const values = rows.map(function(row) {
    return Object.fromEntries(columns.map(function(column) {
      return [column[0], row[column[2]] ?? column[3] ?? null];
    }));
  });
  return sql.query(
    'INSERT INTO ' + table + ' (' + names + ') SELECT ' + names +
    ' FROM jsonb_to_recordset($1::jsonb) AS records(' + definitions + ')',
    [JSON.stringify(values)]
  );
}

function datasetRows(sql, table, columns, rows) {
  const query = insertRows(sql, table, columns, rows);
  return query ? [query] : [];
}

function itemRows(sql, table, transactions) {
  const rows = [];
  for (const transaction of transactions) {
    (transaction.items || []).forEach(function(item, index) {
      rows.push({
        transaction_id: transaction.id,
        line_number: index + 1,
        product_id: item.productId,
        qty: item.qty,
      });
    });
  }
  return datasetRows(sql, table, [
    ['transaction_id', 'integer', 'transaction_id'],
    ['line_number', 'integer', 'line_number'],
    ['product_id', 'integer', 'product_id'],
    ['qty', 'integer', 'qty'],
  ], rows);
}

async function replaceRelationalData(sql, data) {
  const queries = [
    'stock_opname_fisik', 'barang_masuk_items', 'barang_keluar_items', 'stock_transfer_items',
    'stock_adjustments', 'stock_transfers', 'barang_keluar', 'barang_masuk',
    'product_stocks', 'products', 'users', 'warehouses', 'suppliers', 'categories',
  ].map(function(table) { return sql.query('DELETE FROM ' + table); });

  const definitions = [
    ['categories', [['id', 'integer', 'id'], ['name', 'text', 'name'], ['description', 'text', 'description', ''], ['created_at', 'text', 'createdAt', '']]],
    ['suppliers', [['id', 'integer', 'id'], ['name', 'text', 'name'], ['pic', 'text', 'pic', ''], ['email', 'text', 'email', ''], ['phone', 'text', 'phone', ''], ['created_at', 'text', 'createdAt', '']]],
    ['warehouses', [['id', 'integer', 'id'], ['code', 'text', 'code'], ['name', 'text', 'name'], ['location', 'text', 'location', ''], ['status', 'text', 'status', ''], ['created_at', 'text', 'createdAt', '']]],
    ['products', [['id', 'integer', 'id'], ['sku', 'text', 'sku'], ['name', 'text', 'name'], ['category_id', 'integer', 'categoryId'], ['supplier_id', 'integer', 'supplierId'], ['price', 'numeric', 'price'], ['min_stock', 'integer', 'minStock', 0], ['status', 'text', 'status', ''], ['created_at', 'text', 'createdAt', '']]],
    ['product_stocks', [['id', 'integer', 'id'], ['product_id', 'integer', 'productId'], ['warehouse_id', 'integer', 'warehouseId'], ['stock', 'integer', 'stock']]],
    ['barang_masuk', [['id', 'integer', 'id'], ['date', 'text', 'date'], ['supplier_id', 'integer', 'supplierId'], ['warehouse_id', 'integer', 'warehouseId'], ['ref', 'text', 'ref'], ['note', 'text', 'note', '']]],
    ['barang_keluar', [['id', 'integer', 'id'], ['date', 'text', 'date'], ['penerima', 'text', 'penerima'], ['warehouse_id', 'integer', 'warehouseId'], ['ref', 'text', 'ref'], ['note', 'text', 'note', '']]],
    ['stock_adjustments', [['id', 'integer', 'id'], ['date', 'text', 'date'], ['product_id', 'integer', 'productId'], ['warehouse_id', 'integer', 'warehouseId'], ['sistem', 'integer', 'sistem'], ['fisik', 'integer', 'fisik'], ['selisih', 'integer', 'selisih'], ['alasan', 'text', 'alasan', '']]],
    ['stock_transfers', [['id', 'integer', 'id'], ['date', 'text', 'date'], ['from_warehouse_id', 'integer', 'fromWarehouseId'], ['to_warehouse_id', 'integer', 'toWarehouseId'], ['ref', 'text', 'ref']]],
    ['users', [['id', 'integer', 'id'], ['name', 'text', 'name'], ['email', 'text', 'email'], ['role', 'text', 'role'], ['status', 'text', 'status'], ['last_login', 'text', 'lastLogin', ''], ['created_at', 'text', 'createdAt', '']]],
  ];
  for (const [table, columns] of definitions) {
    queries.push(...datasetRows(sql, table, columns, data[{
      categories: 'categories', suppliers: 'suppliers', warehouses: 'warehouses',
      products: 'products', product_stocks: 'productStocks', barang_masuk: 'barangMasuk',
      barang_keluar: 'barangKeluar', stock_adjustments: 'stockAdjustments',
      stock_transfers: 'stockTransfers', users: 'users',
    }[table]]));
  }
  queries.push(...itemRows(sql, 'barang_masuk_items', data.barangMasuk));
  queries.push(...itemRows(sql, 'barang_keluar_items', data.barangKeluar));
  queries.push(...itemRows(sql, 'stock_transfer_items', data.stockTransfers));

  const opnameRows = Object.entries(data.stockOpnameFisik || {}).map(function([key, fisik]) {
    const [productId, warehouseId] = key.split('-').map(Number);
    return { product_id: productId, warehouse_id: warehouseId, fisik };
  });
  queries.push(...datasetRows(sql, 'stock_opname_fisik', [
    ['product_id', 'integer', 'product_id'],
    ['warehouse_id', 'integer', 'warehouse_id'],
    ['fisik', 'integer', 'fisik'],
  ], opnameRows));
  await sql.transaction(queries);
}

async function ensureSchema(sql) {
  if (!schemaReady) {
    schemaReady = (async function() {
      await sql`
        CREATE TABLE IF NOT EXISTS inventory_migrations (
          name text PRIMARY KEY,
          completed_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS inventory_meta (
          id integer PRIMARY KEY CHECK (id = 1),
          initialized boolean NOT NULL DEFAULT false
        )
      `;

      const migrations = await sql`SELECT 1 FROM inventory_migrations WHERE name = ${schemaVersion}`;
      if (!migrations.length) {
        const snapshot = await getMigrationSnapshot(sql);
        await archiveLegacyTables(sql);
        await sql.transaction(defineRelationalSchema(sql));
        if (snapshot) {
          await replaceRelationalData(sql, snapshot);
          await sql`
            INSERT INTO inventory_meta (id, initialized) VALUES (1, true)
            ON CONFLICT (id) DO UPDATE SET initialized = true
          `;
        }
        await sql`INSERT INTO inventory_migrations (name) VALUES (${schemaVersion})`;
      } else {
        await sql.transaction(defineRelationalSchema(sql));
      }
    })().catch(function(error) {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

async function readRelationalData(sql) {
  const [
    categories, suppliers, warehouses, products, stocks,
    inbound, inboundItems, outbound, outboundItems,
    adjustments, transfers, transferItems, users, opname,
  ] = await Promise.all([
    sql`SELECT id, name, description, created_at AS "createdAt" FROM categories ORDER BY id`,
    sql`SELECT id, name, pic, email, phone, created_at AS "createdAt" FROM suppliers ORDER BY id`,
    sql`SELECT id, code, name, location, status, created_at AS "createdAt" FROM warehouses ORDER BY id`,
    sql`SELECT id, sku, name, category_id AS "categoryId", supplier_id AS "supplierId", price::float8 AS price, min_stock AS "minStock", status, created_at AS "createdAt" FROM products ORDER BY id`,
    sql`SELECT id, product_id AS "productId", warehouse_id AS "warehouseId", stock FROM product_stocks ORDER BY id`,
    sql`SELECT id, date, supplier_id AS "supplierId", warehouse_id AS "warehouseId", ref, note FROM barang_masuk ORDER BY id`,
    sql`SELECT transaction_id, line_number, product_id AS "productId", qty FROM barang_masuk_items ORDER BY transaction_id, line_number`,
    sql`SELECT id, date, penerima, warehouse_id AS "warehouseId", ref, note FROM barang_keluar ORDER BY id`,
    sql`SELECT transaction_id, line_number, product_id AS "productId", qty FROM barang_keluar_items ORDER BY transaction_id, line_number`,
    sql`SELECT id, date, product_id AS "productId", warehouse_id AS "warehouseId", sistem, fisik, selisih, alasan FROM stock_adjustments ORDER BY id`,
    sql`SELECT id, date, from_warehouse_id AS "fromWarehouseId", to_warehouse_id AS "toWarehouseId", ref FROM stock_transfers ORDER BY id`,
    sql`SELECT transaction_id, line_number, product_id AS "productId", qty FROM stock_transfer_items ORDER BY transaction_id, line_number`,
    sql`SELECT id, name, email, role, status, last_login AS "lastLogin", created_at AS "createdAt" FROM users ORDER BY id`,
    sql`SELECT product_id, warehouse_id, fisik FROM stock_opname_fisik`,
  ]);

  function attachItems(headers, rows) {
    const itemsByTransaction = new Map();
    for (const row of rows) {
      if (!itemsByTransaction.has(row.transaction_id)) itemsByTransaction.set(row.transaction_id, []);
      itemsByTransaction.get(row.transaction_id).push({ productId: row.productId, qty: row.qty });
    }
    return headers.map(function(header) {
      return { ...header, items: itemsByTransaction.get(header.id) || [] };
    });
  }

  const stockOpnameFisik = {};
  for (const row of opname) {
    stockOpnameFisik[row.product_id + '-' + row.warehouse_id] = row.fisik;
  }
  return {
    categories, suppliers, warehouses, products, productStocks: stocks,
    barangMasuk: attachItems(inbound, inboundItems),
    barangKeluar: attachItems(outbound, outboundItems),
    stockAdjustments: adjustments,
    stockTransfers: attachItems(transfers, transferItems),
    users, stockOpnameFisik,
  };
}

function validateData(data) {
  return data && typeof data === 'object' && !Array.isArray(data) &&
    ['categories', 'suppliers', 'warehouses', 'products', 'productStocks', 'barangMasuk',
      'barangKeluar', 'stockAdjustments', 'stockTransfers', 'users']
      .every(function(key) { return Array.isArray(data[key]); }) &&
    data.stockOpnameFisik && typeof data.stockOpnameFisik === 'object' &&
    !Array.isArray(data.stockOpnameFisik);
}

function authorizedParties() {
  const parties = new Set([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]);
  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]) {
    if (host) parties.add('https://' + host.replace(/^https?:\/\//, ''));
  }
  for (const origin of (process.env.CLERK_AUTHORIZED_PARTIES || '').split(',')) {
    if (origin.trim()) parties.add(origin.trim());
  }
  return [...parties];
}

export function createInventoryApiHandler(tokenVerifier = verifyToken) {
  return async function handleInventoryApi(req, res) {
    try {
      const authorization = req.headers?.authorization || req.headers?.Authorization || '';
      const tokenMatch = /^Bearer\s+(.+)$/i.exec(authorization);
      if (!tokenMatch) {
        return res.status(401).json({ error: 'Autentikasi diperlukan' });
      }
      if (!process.env.CLERK_SECRET_KEY) {
        return res.status(503).json({ error: 'Autentikasi belum dikonfigurasi di server' });
      }
      try {
        await tokenVerifier(tokenMatch[1], {
          secretKey: process.env.CLERK_SECRET_KEY,
          authorizedParties: authorizedParties(),
        });
      } catch (error) {
        if (error instanceof TokenVerificationError) {
          const temporaryFailureReasons = [
            TokenVerificationErrorReason.InvalidSecretKey,
            TokenVerificationErrorReason.LocalJWKMissing,
            TokenVerificationErrorReason.RemoteJWKFailedToLoad,
            TokenVerificationErrorReason.RemoteJWKInvalid,
            TokenVerificationErrorReason.RemoteJWKMissing,
            TokenVerificationErrorReason.JWKFailedToResolve,
          ];
          if (temporaryFailureReasons.includes(error.reason)) {
            console.error('Clerk token verification unavailable:', error.reason);
            return res.status(503).json({ error: 'Layanan autentikasi sementara tidak tersedia' });
          }
          return res.status(401).json({ error: 'Sesi login tidak valid atau sudah berakhir' });
        }
        console.error('Clerk token verification failed:', error);
        return res.status(503).json({ error: 'Layanan autentikasi sementara tidak tersedia' });
      }

      const pathname = new URL(req.url, 'http://localhost').pathname.replace(/\/+$/, '') || '/';
      const method = req.method || 'GET';
      if (pathname === '/api/data' && method === 'GET') {
        const sql = getSql();
        await ensureSchema(sql);
        const rows = await sql`SELECT initialized FROM inventory_meta WHERE id = 1`;
        return res.status(200).json({ data: rows[0]?.initialized ? await readRelationalData(sql) : null });
      }

      if (pathname === '/api/data/initialize' && method === 'POST') {
        if (!validateData(req.body?.data)) {
          return res.status(400).json({ error: 'Format data inventaris tidak valid' });
        }
        const sql = getSql();
        await ensureSchema(sql);
        const state = await sql`SELECT initialized FROM inventory_meta WHERE id = 1`;
        if (!state[0]?.initialized) {
          await replaceRelationalData(sql, req.body.data);
          await sql`
            INSERT INTO inventory_meta (id, initialized) VALUES (1, true)
            ON CONFLICT (id) DO UPDATE SET initialized = true
          `;
        }
        return res.status(200).json({ data: await readRelationalData(sql) });
      }

      if (pathname === '/api/data' && method === 'PUT') {
        if (!validateData(req.body?.data)) {
          return res.status(400).json({ error: 'Format data inventaris tidak valid' });
        }
        const sql = getSql();
        await ensureSchema(sql);
        const state = await sql`SELECT initialized FROM inventory_meta WHERE id = 1`;
        if (!state[0]?.initialized) {
          return res.status(409).json({ error: 'Database belum diinisialisasi' });
        }
        await replaceRelationalData(sql, req.body.data);
        return res.status(200).json({ data: await readRelationalData(sql) });
      }

      if (pathname.startsWith('/api/')) {
        return res.status(404).json({ error: 'Endpoint API tidak ditemukan' });
      }
      return res.status(404).json({ error: 'Endpoint API tidak ditemukan' });
    } catch (error) {
      console.error('API error:', error);
      return res.status(error.status || 500).json({
        error: error.status === 503 ? error.message : 'Terjadi kesalahan saat mengakses database',
      });
    }
  };
}

export const handleInventoryApi = createInventoryApiHandler();
