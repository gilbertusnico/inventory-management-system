CREATE TABLE IF NOT EXISTS inventory_meta (
  id integer PRIMARY KEY CHECK (id = 1),
  initialized boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS inventory_migrations (
  name text PRIMARY KEY,
  completed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id integer PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS suppliers (
  id integer PRIMARY KEY,
  name text NOT NULL,
  pic text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  created_at text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS warehouses (
  id integer PRIMARY KEY,
  code text NOT NULL,
  name text NOT NULL,
  location text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT '',
  created_at text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS products (
  id integer PRIMARY KEY,
  sku text NOT NULL UNIQUE,
  name text NOT NULL,
  category_id integer NOT NULL REFERENCES categories(id),
  supplier_id integer NOT NULL REFERENCES suppliers(id),
  price numeric(14, 2) NOT NULL CHECK (price >= 0),
  min_stock integer NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  status text NOT NULL DEFAULT '',
  created_at text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS product_stocks (
  id integer PRIMARY KEY,
  product_id integer NOT NULL REFERENCES products(id),
  warehouse_id integer NOT NULL REFERENCES warehouses(id),
  stock integer NOT NULL CHECK (stock >= 0),
  UNIQUE (product_id, warehouse_id)
);

CREATE TABLE IF NOT EXISTS barang_masuk (
  id integer PRIMARY KEY,
  date text NOT NULL,
  supplier_id integer NOT NULL REFERENCES suppliers(id),
  warehouse_id integer NOT NULL REFERENCES warehouses(id),
  ref text NOT NULL,
  note text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS barang_masuk_items (
  transaction_id integer NOT NULL REFERENCES barang_masuk(id) ON DELETE CASCADE,
  line_number integer NOT NULL,
  product_id integer NOT NULL REFERENCES products(id),
  qty integer NOT NULL CHECK (qty > 0),
  PRIMARY KEY (transaction_id, line_number)
);

CREATE TABLE IF NOT EXISTS barang_keluar (
  id integer PRIMARY KEY,
  date text NOT NULL,
  penerima text NOT NULL,
  warehouse_id integer NOT NULL REFERENCES warehouses(id),
  ref text NOT NULL,
  note text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS barang_keluar_items (
  transaction_id integer NOT NULL REFERENCES barang_keluar(id) ON DELETE CASCADE,
  line_number integer NOT NULL,
  product_id integer NOT NULL REFERENCES products(id),
  qty integer NOT NULL CHECK (qty > 0),
  PRIMARY KEY (transaction_id, line_number)
);

CREATE TABLE IF NOT EXISTS stock_adjustments (
  id integer PRIMARY KEY,
  date text NOT NULL,
  product_id integer NOT NULL REFERENCES products(id),
  warehouse_id integer NOT NULL REFERENCES warehouses(id),
  sistem integer NOT NULL,
  fisik integer NOT NULL,
  selisih integer NOT NULL,
  alasan text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS stock_transfers (
  id integer PRIMARY KEY,
  date text NOT NULL,
  from_warehouse_id integer NOT NULL REFERENCES warehouses(id),
  to_warehouse_id integer NOT NULL REFERENCES warehouses(id),
  ref text NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_transfer_items (
  transaction_id integer NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
  line_number integer NOT NULL,
  product_id integer NOT NULL REFERENCES products(id),
  qty integer NOT NULL CHECK (qty > 0),
  PRIMARY KEY (transaction_id, line_number)
);

CREATE TABLE IF NOT EXISTS users (
  id integer PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL,
  status text NOT NULL,
  last_login text NOT NULL DEFAULT '',
  created_at text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS stock_opname_fisik (
  product_id integer NOT NULL REFERENCES products(id),
  warehouse_id integer NOT NULL REFERENCES warehouses(id),
  fisik integer NOT NULL CHECK (fisik >= 0),
  PRIMARY KEY (product_id, warehouse_id)
);

CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_supplier_id_idx ON products(supplier_id);
CREATE INDEX IF NOT EXISTS product_stocks_warehouse_id_idx ON product_stocks(warehouse_id);
CREATE INDEX IF NOT EXISTS barang_masuk_date_idx ON barang_masuk(date);
CREATE INDEX IF NOT EXISTS barang_keluar_date_idx ON barang_keluar(date);
CREATE INDEX IF NOT EXISTS stock_adjustments_date_idx ON stock_adjustments(date);
CREATE INDEX IF NOT EXISTS stock_transfers_date_idx ON stock_transfers(date);
