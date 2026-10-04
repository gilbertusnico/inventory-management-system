import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { pathToFileURL } from 'node:url';

process.env.TZ = 'Asia/Jakarta';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div><div id="pageContent"></div><div id="toastContainer"></div><div id="breadcrumb"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
globalThis.renderPage = () => {};

let persistedData = null;
globalThis.fetch = async (_url, options = {}) => {
  if (options.method === 'GET') return response({ data: persistedData });
  const { data } = JSON.parse(options.body);
  persistedData = structuredClone(data);
  return response({ data: persistedData });
};

function response(body) {
  return { ok: true, json: async () => body };
}

const moduleUrl = pathToFileURL(process.cwd() + '/src/data.js');
const data = await import(moduleUrl.href);
const handlers = await import(pathToFileURL(process.cwd() + '/src/handlers.js').href);
await data.initializeData();
assert.equal(data.getLocalDateString(new Date('2026-10-04T20:00:00.000Z')), '2026-10-05', 'local date does not roll back to the previous UTC day');

function replaceContents(target, rows) {
  target.splice(0, target.length, ...rows);
}

replaceContents(data.categories, [{ id: 1, name: 'Kategori' }]);
replaceContents(data.suppliers, [{ id: 1, name: 'Supplier' }]);
replaceContents(data.warehouses, [
  { id: 1, code: 'WH-1', name: 'Gudang 1' },
  { id: 2, code: 'WH-2', name: 'Gudang 2' },
  { id: 3, code: 'WH-3', name: 'Gudang 3' },
]);
replaceContents(data.products, [
  { id: 1, sku: 'SKU-1', name: 'Produk 1', categoryId: 1, supplierId: 1, price: 100, minStock: 1, status: 'Aktif', createdAt: '2026-01-01' },
  { id: 2, sku: 'SKU-2', name: 'Produk 2', categoryId: 1, supplierId: 1, price: 200, minStock: 1, status: 'Aktif', createdAt: '2026-01-01' },
]);
replaceContents(data.productStocks, [
  { id: 1, productId: 1, warehouseId: 1, stock: 10 },
  { id: 2, productId: 1, warehouseId: 2, stock: 4 },
  { id: 3, productId: 2, warehouseId: 1, stock: 3 },
  { id: 4, productId: 2, warehouseId: 3, stock: 8 },
]);
for (const rows of [data.barangMasuk, data.barangKeluar, data.stockAdjustments, data.stockTransfers]) {
  replaceContents(rows, []);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const stock = (productId, warehouseId) => data.getProductStock(productId, warehouseId)?.stock ?? 0;
const toastText = () => document.querySelector('#toastContainer .toast:last-child .toast-message')?.textContent || '';
const click = async (id) => {
  const element = document.getElementById(id);
  assert.ok(element, `Expected #${id} to exist`);
  element.click();
  await sleep(10);
};
const open = async (handler) => {
  handler();
  await sleep(70);
};
const save = async (buttonId) => {
  await click(buttonId);
  await sleep(150);
};
const casePassed = (name) => console.log(`PASS ${name}`);

console.log('TRANSACTION STOCK MOVEMENT TESTS');

await open(handlers.handleAddBarangMasuk);
await click('saveBm');
assert.equal(data.barangMasuk.length, 0, 'barang masuk requires at least one item');
assert.equal(stock(1, 2), 4, 'empty barang masuk must not change stock');
assert.match(toastText(), /minimal 1 item/);
document.querySelector('.modal-overlay')?.remove();
casePassed('Barang masuk without items is rejected without stock movement');

await open(handlers.handleAddBarangMasuk);
assert.equal(document.getElementById('bm_date').value, data.getLocalDateString(), 'barang masuk defaults to the local calendar date');
document.getElementById('bm_warehouse').value = '2';
document.getElementById('bm_date').value = '2026-02-03';
document.getElementById('bm_product').value = '1';
document.getElementById('bm_qty').value = '1.5';
await click('addBmItem');
assert.equal(window._bmItems.length, 0, 'fractional quantity is rejected');
assert.match(toastText(), /bilangan bulat/);
document.getElementById('bm_qty').value = '5';
await click('addBmItem');
document.getElementById('bm_product').value = '2';
document.getElementById('bm_qty').value = '2';
await click('addBmItem');
assert.equal(stock(1, 2), 4, 'stock must not change before save');
await save('saveBm');
assert.equal(stock(1, 2), 9, 'barang masuk adds received quantity');
assert.equal(stock(2, 2), 2, 'barang masuk creates stock for another product');
assert.equal(stock(1, 1), 10, 'barang masuk does not affect another warehouse');
assert.equal(data.barangMasuk.at(-1).date, '2026-02-03', 'barang masuk preserves the selected calendar date');
assert.deepEqual(data.barangMasuk.at(-1).items, [{ productId: 1, qty: 5 }, { productId: 2, qty: 2 }]);
casePassed('Barang masuk adds each line to selected warehouse and rejects fractional qty');

await open(handlers.handleAddBarangKeluar);
assert.equal(document.getElementById('bk_date').value, data.getLocalDateString(), 'barang keluar defaults to the local calendar date');
document.getElementById('bk_warehouse').value = '2';
document.getElementById('bk_date').value = '2026-02-04';
document.getElementById('bk_warehouse').dispatchEvent(new dom.window.Event('change'));
await sleep(5);
document.getElementById('bk_product').value = '1';
document.getElementById('bk_qty').value = '1.5';
await click('addBkItem');
assert.equal(window._bkItems, undefined, 'fractional quantity is rejected');
document.getElementById('bk_qty').value = '10';
await click('addBkItem');
assert.match(toastText(), /Stok tidak cukup/);
assert.equal(window._bkItems, undefined, 'insufficient quantity is not added');
assert.equal(stock(1, 2), 9, 'rejected barang keluar must not change stock');
document.getElementById('bk_qty').value = '9';
await click('addBkItem');
document.getElementById('bk_penerima').value = 'Penerima QA';
assert.equal(stock(1, 2), 9, 'barang keluar does not change stock before save');
await save('saveBk');
assert.equal(stock(1, 2), 0, 'barang keluar can consume exact available stock');
assert.equal(stock(1, 1), 10, 'barang keluar only affects selected warehouse');
assert.equal(data.barangKeluar.at(-1).date, '2026-02-04', 'barang keluar preserves the selected calendar date');
assert.deepEqual(data.barangKeluar.at(-1).items, [{ productId: 1, qty: 9 }]);
casePassed('Barang keluar rejects fractional/over-stock qty and permits exact depletion');

await open(handlers.handleAddStockAdjustment);
assert.equal(document.getElementById('sa_date').value, data.getLocalDateString(), 'stock adjustment defaults to the local calendar date');
document.getElementById('sa_warehouse').value = '1';
document.getElementById('sa_date').value = '2026-02-05';
document.getElementById('sa_warehouse').dispatchEvent(new dom.window.Event('change'));
await sleep(5);
document.getElementById('sa_product').value = '1';
document.getElementById('sa_product').dispatchEvent(new dom.window.Event('change'));
document.getElementById('sa_fisik').value = '-1';
await save('saveSa');
assert.equal(data.stockAdjustments.length, 0, 'negative physical stock is rejected');
assert.equal(stock(1, 1), 10, 'invalid adjustment must not change stock');
assert.match(document.querySelector('.field-error')?.textContent || '', /minimal 0/);
document.querySelector('.modal-overlay')?.remove();

await open(handlers.handleAddStockAdjustment);
document.getElementById('sa_warehouse').value = '1';
document.getElementById('sa_date').value = '2026-02-05';
document.getElementById('sa_warehouse').dispatchEvent(new dom.window.Event('change'));
await sleep(5);
document.getElementById('sa_product').value = '1';
document.getElementById('sa_product').dispatchEvent(new dom.window.Event('change'));
document.getElementById('sa_fisik').value = '0';
document.getElementById('sa_fisik').dispatchEvent(new dom.window.Event('input'));
assert.equal(document.getElementById('sa_selisih').value, '-10');
assert.equal(stock(1, 1), 10, 'adjustment only changes stock on save');
await save('saveSa');
assert.equal(stock(1, 1), 0, 'downward adjustment sets stock to physical count');
assert.equal(data.stockAdjustments.at(-1).selisih, -10);
assert.equal(data.stockAdjustments.at(-1).date, '2026-02-05', 'stock adjustment preserves the selected calendar date');
casePassed('Stock adjustment rejects negative count and sets lower physical count on save');

await open(handlers.handleAddStockAdjustment);
document.getElementById('sa_warehouse').value = '1';
document.getElementById('sa_warehouse').dispatchEvent(new dom.window.Event('change'));
await sleep(5);
document.getElementById('sa_product').value = '2';
document.getElementById('sa_product').dispatchEvent(new dom.window.Event('change'));
document.getElementById('sa_fisik').value = '7';
await save('saveSa');
assert.equal(stock(2, 1), 7, 'upward adjustment sets stock to physical count');
assert.equal(data.stockAdjustments.at(-1).selisih, 4);
casePassed('Stock adjustment increases stock and records signed difference');

const totalProduct2BeforeTransfer = data.getTotalStock(2);
await open(handlers.handleAddStockTransfer);
document.getElementById('st_from').value = '1';
document.getElementById('st_to').value = '1';
document.getElementById('st_product').value = '2';
document.getElementById('st_qty').value = '1';
await click('addStItem');
await save('saveSt');
assert.equal(data.stockTransfers.length, 0, 'same-warehouse transfer is rejected');
assert.equal(stock(2, 1), 7, 'rejected transfer does not deduct source stock');
assert.equal(stock(2, 2), 2, 'rejected transfer does not add destination stock');
assert.match(toastText(), /harus berbeda/);
document.querySelector('.modal-overlay')?.remove();
casePassed('Transfer between same warehouse is rejected without movement');

await open(handlers.handleAddStockTransfer);
document.getElementById('st_from').value = '1';
document.getElementById('st_to').value = '3';
document.getElementById('st_product').value = '2';
document.getElementById('st_qty').value = '1.5';
await click('addStItem');
assert.match(toastText(), /bilangan bulat/);
document.getElementById('st_qty').value = '8';
await click('addStItem');
assert.match(toastText(), /Stok tidak cukup/);
document.getElementById('st_qty').value = '7';
await click('addStItem');
assert.equal(stock(2, 1), 7, 'transfer does not move stock before save');
await save('saveSt');
assert.equal(stock(2, 1), 0, 'transfer deducts exact quantity from source');
assert.equal(stock(2, 3), 15, 'transfer adds exact quantity to destination');
assert.equal(data.getTotalStock(2), totalProduct2BeforeTransfer, 'transfer conserves total product stock');
assert.equal(stock(2, 2), 2, 'transfer does not affect a third warehouse');
casePassed('Transfer conserves total stock across warehouses and rejects excess/fractional qty');

const product2SystemStock = stock(2, 3);
await data.setStockOpnameFisik(2, 3, 12);
assert.equal(data.getStockOpname().find((row) => row.productId === 2 && row.warehouseId === 3).fisik, 12);
assert.equal(stock(2, 3), product2SystemStock, 'recording physical count does not silently adjust system stock');
assert.throws(() => data.setStockOpnameFisik(2, 3, -1), /bilangan bulat minimal 0/);
casePassed('Stock opname records physical count separately and leaves system stock unchanged');

assert.deepEqual(persistedData.productStocks, data.productStocks, 'saved snapshot contains final stock movements');
assert.equal(persistedData.stockOpnameFisik['2-3'], 12, 'saved snapshot contains stock opname count');
console.log('All transaction stock movement cases passed.');
