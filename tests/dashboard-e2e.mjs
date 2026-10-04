import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { pathToFileURL } from 'node:url';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div><div id="pageContent"></div><div id="toastContainer"></div><div id="breadcrumb"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let persistedSnapshot = null;
globalThis.fetch = async (_url, options = {}) => {
  if (options.method === 'GET') return response({ data: persistedSnapshot });
  persistedSnapshot = structuredClone(JSON.parse(options.body).data);
  return response({ data: persistedSnapshot });
};

function response(body) {
  return { ok: true, json: async () => body };
}

const data = await import(pathToFileURL(process.cwd() + '/src/data.js').href);
const charts = await import(pathToFileURL(process.cwd() + '/src/charts.js').href);
const pages = await import(pathToFileURL(process.cwd() + '/src/pages.js').href);
await data.initializeData();

data.barangMasuk.splice(0, data.barangMasuk.length,
  { id: 1, date: '2025-01-12', warehouseId: 1, items: [{ productId: 1, qty: 100 }] },
  { id: 2, date: '2025-08-12', warehouseId: 1, items: [{ productId: 1, qty: 2 }] },
  { id: 3, date: '2026-01-03', warehouseId: 1, items: [{ productId: 1, qty: 4 }] },
  { id: 4, date: '2026-08-12', warehouseId: 1, items: [{ productId: 1, qty: 200 }] },
);
data.barangKeluar.splice(0, data.barangKeluar.length,
  { id: 1, date: '2025-12-02', warehouseId: 1, penerima: 'Tim A', items: [{ productId: 1, qty: 3 }] },
);
const movement = charts.getMonthlyMovement('2025-08-15', '2026-01-10');
assert.deepEqual(movement.map((month) => month.label), ["Agu '25", "Sep '25", "Okt '25", "Nov '25", "Des '25", "Jan '26"]);
assert.equal(movement[0].masuk, 0, 'transactions before the selected start day are excluded');
assert.equal(movement[4].keluar, 3);
assert.equal(movement[5].masuk, 4);
assert.equal(movement.reduce((sum, month) => sum + month.masuk, 0), 4, 'transactions after the selected end day are excluded');
assert.deepEqual(charts.getMonthlyMovement('2026-02-01', '2026-01-31'), [], 'invalid date range has no chart buckets');

data.products.splice(0, data.products.length,
  { id: 1, sku: 'SKU-1', name: 'Test Product', categoryId: 1, supplierId: 1, price: 100, minStock: 5, status: 'Aktif', createdAt: '2025-01-01' },
);
data.warehouses.splice(0, data.warehouses.length,
  { id: 1, code: 'WH-1', name: 'Gudang Medan', status: 'Aktif', createdAt: '2025-01-01' },
);
data.productStocks.splice(0, data.productStocks.length,
  { id: 1, productId: 1, warehouseId: 1, stock: 2 },
);
data.categories.splice(0, data.categories.length, { id: 1, name: 'Kategori' });
data.suppliers.splice(0, data.suppliers.length, { id: 1, name: 'Supplier' });
data.stockAdjustments.splice(0, data.stockAdjustments.length,
  { id: 1, date: '2026-01-05', productId: 1, warehouseId: 1, sistem: 3, fisik: 2, selisih: -1, alasan: 'Rusak' },
);
data.stockTransfers.splice(0, data.stockTransfers.length,
  { id: 1, date: '2026-01-04', fromWarehouseId: 1, toWarehouseId: 1, ref: 'TRF-1', items: [{ productId: 1, qty: 1 }] },
);
data.stockOpnameActivities.splice(0, data.stockOpnameActivities.length,
  { id: 1, date: '2026-01-03', productId: 1, warehouseId: 1, sistem: 3, fisik: 2 },
);

window._dashboardMovementFrom = '2025-08-15';
window._dashboardMovementTo = '2026-01-10';
const dashboard = pages.renderDashboard();
for (const action of ['add-bm', 'add-bk', 'add-st']) {
  assert.ok(dashboard.includes('data-action="' + action + '"'), action + ' quick action is shown');
}
assert.ok(dashboard.includes('href="#/stock-opname"'), 'stock opname quick action navigates to its page');
assert.ok(dashboard.includes('id="dashboardMovementFrom" type="date" value="2025-08-15"'), 'dashboard exposes a custom start date');
assert.ok(dashboard.includes('id="dashboardMovementTo" type="date" value="2026-01-10"'), 'dashboard exposes a custom end date');
assert.match(dashboard, /Test Product[\s\S]*Gudang Medan/, 'low-stock alert includes warehouse location');
assert.match(dashboard, /class="alert-item" href="#\/stock-opname"/, 'low-stock alert links to stock opname');
assert.ok(dashboard.includes('Stock Adjustment'), 'recent activity includes stock adjustments');
assert.ok(dashboard.includes('Transfer Stok'), 'recent activity includes stock transfers');
assert.ok(dashboard.includes('Hasil Stock Opname'), 'recent activity includes stock opname results');
assert.ok(pages.renderStockOpname().includes('data-action="record-opname"'), 'stock opname rows can record a physical count');

const initialStockOpnameCount = data.stockOpnameActivities.length;
await data.setStockOpnameFisik(1, 1, 1);
assert.equal(data.stockOpnameActivities.length, initialStockOpnameCount + 1);
assert.equal(data.stockOpnameActivities.at(-1).sistem, 2);
assert.equal(data.stockOpnameActivities.at(-1).fisik, 1);
assert.equal(data.stockOpnameActivities.at(-1).date, data.getLocalDateString(), 'stock opname records the local calendar date');
assert.equal(persistedSnapshot.stockOpnameActivities.at(-1).fisik, 1, 'stock opname activity is persisted with the inventory snapshot');

console.log('Dashboard period, alerts, quick actions, and activities tests passed.');
