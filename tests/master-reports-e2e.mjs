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
globalThis.renderPage = () => {};

let persistedSnapshot;
globalThis.fetch = async (_url, options = {}) => {
  if (options.method === 'GET') return response({ data: persistedSnapshot });
  persistedSnapshot = structuredClone(JSON.parse(options.body).data);
  return response({ data: persistedSnapshot });
};

function response(body) {
  return { ok: true, json: async () => body };
}

const data = await import(pathToFileURL(process.cwd() + '/src/data.js').href);
const handlers = await import(pathToFileURL(process.cwd() + '/src/handlers.js').href);
const pages = await import(pathToFileURL(process.cwd() + '/src/pages.js').href);
const reportUtils = await import(pathToFileURL(process.cwd() + '/src/report-utils.js').href);
const reportExport = await import(pathToFileURL(process.cwd() + '/src/export.js').href);
await data.initializeData();

const sleep = (ms = 70) => new Promise((resolve) => setTimeout(resolve, ms));
const stockRows = [
  { id: 1, productId: 1, warehouseId: 1, stock: 10 },
  { id: 2, productId: 1, warehouseId: 2, stock: 5 },
  { id: 3, productId: 2, warehouseId: 1, stock: 4 },
];

function replace(target, rows) {
  target.splice(0, target.length, ...rows);
}

replace(data.categories, [
  { id: 1, name: 'Existing category', description: 'in use', count: 1, createdAt: '2026-01-01' },
  { id: 2, name: 'Unused category', description: 'remove me', count: 0, createdAt: '2026-01-02' },
]);
replace(data.suppliers, [
  { id: 1, name: 'Existing supplier', pic: 'PIC', email: 'existing@example.com', phone: '111', createdAt: '2026-01-01' },
  { id: 2, name: 'Unused supplier', pic: 'PIC', email: 'unused@example.com', phone: '222', createdAt: '2026-01-02' },
]);
replace(data.warehouses, [
  { id: 1, code: 'WH-1', name: 'Warehouse 1', location: 'One', status: 'Aktif', count: 2, totalStock: 14, createdAt: '2026-01-01' },
  { id: 2, code: 'WH-2', name: 'Warehouse 2', location: 'Two', status: 'Aktif', count: 1, totalStock: 5, createdAt: '2026-01-02' },
  { id: 3, code: 'WH-3', name: 'Unused warehouse', location: 'Three', status: 'Aktif', count: 0, totalStock: 0, createdAt: '2026-01-03' },
]);
replace(data.products, [
  { id: 1, sku: 'SKU-A', name: 'Product A', categoryId: 1, supplierId: 1, price: 2, minStock: 1, status: 'Aktif', createdAt: '2026-01-10' },
  { id: 2, sku: 'SKU-B', name: 'Product B', categoryId: 1, supplierId: 1, price: 10, minStock: 1, status: 'Aktif', createdAt: '2026-02-10' },
]);
replace(data.productStocks, stockRows);
replace(data.barangMasuk, [
  { id: 1, date: '2026-01-15', supplierId: 1, warehouseId: 1, ref: 'IN-JAN', note: '', items: [{ productId: 1, qty: 2 }, { productId: 2, qty: 3 }] },
  { id: 2, date: '2026-02-15', supplierId: 2, warehouseId: 2, ref: 'IN-FEB', note: '', items: [{ productId: 1, qty: 1 }] },
]);
replace(data.barangKeluar, [
  { id: 1, date: '2026-01-20', penerima: 'January Dept', warehouseId: 1, ref: 'OUT-JAN', note: '', items: [{ productId: 1, qty: 4 }] },
  { id: 2, date: '2026-02-20', penerima: 'February Dept', warehouseId: 2, ref: 'OUT-FEB', note: '', items: [{ productId: 2, qty: 2 }] },
]);
replace(data.stockAdjustments, []);
replace(data.stockTransfers, []);
data.updateCounts();

const toastText = () => document.querySelector('#toastContainer .toast:last-child .toast-message')?.textContent || '';
async function click(id) {
  const element = document.getElementById(id);
  assert.ok(element, `Expected #${id}`);
  element.click();
  await sleep(15);
}
async function clickSave(id) {
  await click(id);
  await sleep(20);
}
async function confirmDelete(type, id) {
  handlers.handleDelete('delete-' + type, id);
  await sleep();
  const confirm = document.getElementById('confirmDelete');
  assert.ok(confirm, `Delete confirmation expected for ${type} #${id}`);
  confirm.click();
  await sleep(30);
}
function summaryValues(html) {
  document.getElementById('pageContent').innerHTML = html;
  return [...document.querySelectorAll('.summary-card')].map((card) => ({
    label: card.querySelector('.summary-card-label')?.textContent.trim(),
    value: card.querySelector('.summary-card-value')?.textContent.trim().replace(/\u00a0/g, ' '),
  }));
}

console.log('MASTER DATA CRUD TESTS');

handlers.handleAddKategori();
await sleep();
await clickSave('saveKategori');
assert.equal(data.categories.length, 2, 'blank category name is rejected');
assert.match(document.querySelector('.field-error')?.textContent || '', /wajib diisi/);
document.querySelector('.modal-overlay')?.remove();

handlers.handleAddKategori();
await sleep();
document.getElementById('k_name').value = 'QA category';
document.getElementById('k_desc').value = 'created by test';
await clickSave('saveKategori');
const newCategory = data.categories.find((item) => item.name === 'QA category');
assert.ok(newCategory, 'category create');
handlers.handleEdit('edit-kategori', newCategory.id);
await sleep();
document.getElementById('k_name').value = 'QA category edited';
document.getElementById('k_desc').value = '';
await clickSave('saveEdit');
assert.equal(newCategory.name, 'QA category edited');
assert.equal(newCategory.description, '', 'editing can clear optional description');
data.updateCounts();
assert.match(pages.renderKategori(), /QA category edited/);
assert.match(pages.renderKategori(), /edit-kategori/);
await confirmDelete('kategori', newCategory.id);
assert.ok(!data.categories.some((item) => item.id === newCategory.id), 'category delete');
casePassed('Category create/edit/clear optional field/delete');

handlers.handleAddSupplier();
await sleep();
document.getElementById('s_name').value = 'Invalid supplier';
document.getElementById('s_pic').value = 'QA PIC';
document.getElementById('s_email').value = 'not-an-email';
await clickSave('saveSupplier');
assert.ok(!data.suppliers.some((item) => item.name === 'Invalid supplier'), 'invalid optional email is rejected');
assert.match(document.querySelector('.field-error')?.textContent || '', /Email tidak valid/);
document.querySelector('.modal-overlay')?.remove();

handlers.handleAddSupplier();
await sleep();
document.getElementById('s_name').value = 'QA supplier';
document.getElementById('s_pic').value = 'QA PIC';
document.getElementById('s_email').value = 'qa@example.com';
document.getElementById('s_phone').value = '123';
await clickSave('saveSupplier');
const newSupplier = data.suppliers.find((item) => item.name === 'QA supplier');
assert.ok(newSupplier, 'supplier create');
handlers.handleEdit('edit-supplier', newSupplier.id);
await sleep();
document.getElementById('s_name').value = 'QA supplier edited';
document.getElementById('s_pic').value = 'QA PIC';
document.getElementById('s_email').value = '';
document.getElementById('s_phone').value = '';
await clickSave('saveEdit');
assert.equal(newSupplier.name, 'QA supplier edited');
assert.equal(newSupplier.email, '', 'editing can clear supplier email');
assert.equal(newSupplier.phone, '', 'editing can clear supplier phone');
assert.match(pages.renderSupplier(), /QA supplier edited/);
assert.match(pages.renderSupplier(), /edit-supplier/);
await confirmDelete('supplier', newSupplier.id);
assert.ok(!data.suppliers.some((item) => item.id === newSupplier.id), 'supplier delete');
casePassed('Supplier create/edit/clear optional contacts/delete');

handlers.handleAddGudang();
await sleep();
document.getElementById('g_code').value = 'WH-QA';
document.getElementById('g_name').value = 'QA warehouse';
document.getElementById('g_location').value = 'QA address';
await clickSave('saveGudang');
const newWarehouse = data.warehouses.find((item) => item.code === 'WH-QA');
assert.ok(newWarehouse, 'warehouse create');
handlers.handleEdit('edit-gudang', newWarehouse.id);
await sleep();
document.getElementById('g_code').value = 'WH-QA-2';
document.getElementById('g_name').value = 'QA warehouse edited';
document.getElementById('g_location').value = 'QA address updated';
document.getElementById('g_status').value = 'Nonaktif';
await clickSave('saveEdit');
assert.equal(newWarehouse.code, 'WH-QA-2');
assert.equal(newWarehouse.status, 'Nonaktif');
assert.match(pages.renderGudang(), /QA warehouse edited/);
assert.match(pages.renderGudang(), /edit-gudang/);
await confirmDelete('gudang', newWarehouse.id);
assert.ok(!data.warehouses.some((item) => item.id === newWarehouse.id), 'warehouse delete');
casePassed('Warehouse create/edit/status/delete');

handlers.handleAddMaster('add-produk');
await sleep();
document.getElementById('f_name').value = 'Invalid QA product';
document.getElementById('f_sku').value = 'SKU-QA';
document.getElementById('f_price').value = '-1';
await clickSave('saveMaster');
assert.ok(!data.products.some((item) => item.sku === 'SKU-QA'), 'negative price is rejected');
assert.match(document.querySelector('.field-error')?.textContent || '', /minimal 0/);
document.querySelector('.modal-overlay')?.remove();

handlers.handleAddMaster('add-produk');
await sleep();
document.getElementById('f_name').value = 'QA product';
document.getElementById('f_sku').value = 'SKU-QA';
document.getElementById('f_category').value = '2';
document.getElementById('f_supplier').value = '2';
document.getElementById('f_price').value = '123.45';
document.getElementById('f_minStock').value = '0';
document.getElementById('f_stock').value = '0';
document.getElementById('f_warehouse').value = '3';
await clickSave('saveMaster');
const newProduct = data.products.find((item) => item.sku === 'SKU-QA');
assert.ok(newProduct, 'product create');
assert.equal(newProduct.price, 123.45, 'decimal product price retained');
assert.equal(newProduct.minStock, 0, 'zero minimum stock retained on create');
assert.equal(data.getProductStock(newProduct.id, 3).stock, 0, 'zero initial stock retained');
assert.match(pages.renderProduk(), /SKU-QA/);
assert.match(pages.renderProduk(), /edit-produk/);
const countBeforeDuplicateSku = data.products.length;
handlers.handleAddMaster('add-produk');
await sleep();
document.getElementById('f_name').value = 'Duplicate product';
document.getElementById('f_sku').value = 'SKU-A';
document.getElementById('f_price').value = '1';
await clickSave('saveMaster');
assert.equal(data.products.length, countBeforeDuplicateSku, 'duplicate SKU is rejected before persistence');
assert.match(document.querySelector('.field-error')?.textContent || '', /SKU sudah digunakan/);
document.querySelector('.modal-overlay')?.remove();
handlers.handleEdit('edit-produk', newProduct.id);
await sleep();
document.getElementById('f_name').value = 'QA product edited';
document.getElementById('f_sku').value = 'SKU-QA-EDIT';
document.getElementById('f_category').value = '2';
document.getElementById('f_supplier').value = '2';
document.getElementById('f_price').value = '0';
document.getElementById('f_minStock').value = '0';
await clickSave('saveEdit');
assert.equal(newProduct.name, 'QA product edited');
assert.equal(newProduct.price, 0, 'zero price retained on edit');
assert.equal(newProduct.minStock, 0, 'zero minimum stock retained on edit');
assert.equal(data.getProductStock(newProduct.id, 3).stock, 0, 'editing master does not change stock');
document.getElementById('pageContent').innerHTML = pages.renderProduk();
assert.match(document.getElementById('pageContent').textContent, /QA product edited/);
await confirmDelete('produk', newProduct.id);
assert.ok(!data.products.some((item) => item.id === newProduct.id), 'product delete');
assert.equal(data.getProductStock(newProduct.id, 3), undefined, 'product delete removes its stock rows');
casePassed('Product create/edit zero values/delete and stock row cleanup');

for (const [type, id] of [['kategori', 1], ['supplier', 1], ['gudang', 1], ['produk', 1]]) {
  const list = { kategori: data.categories, supplier: data.suppliers, gudang: data.warehouses, produk: data.products }[type];
  const count = list.length;
  handlers.handleDelete('delete-' + type, id);
  assert.equal(list.length, count, `${type} with references remains`);
  assert.equal(document.getElementById('confirmDelete'), null, `${type} with references cannot open destructive confirmation`);
  assert.match(toastText(), /masih digunakan/);
}
casePassed('Referenced category/supplier/warehouse/product deletion is safely blocked');

console.log('REPORT CALCULATION TESTS');
window._searchTerm = '';
window._dateFrom = '';
window._dateTo = '';
let summary = summaryValues(pages.renderReportStok());
assert.deepEqual(summary.map((item) => item.value), ['2', '19', 'Rp 70'], 'all-stock SKU count, quantity, and valuation');

window._searchTerm = 'SKU-A';
summary = summaryValues(pages.renderReportStok());
assert.deepEqual(summary.map((item) => item.value), ['1', '15', 'Rp 30'], 'stock KPIs follow visible search results');

window._searchTerm = '';
window._dateFrom = '2026-01-01';
window._dateTo = '2026-01-31';
summary = summaryValues(pages.renderReportStok());
assert.deepEqual(summary.map((item) => item.value), ['1', '15', 'Rp 30'], 'stock KPIs follow inclusive product date filter');

window._dateFrom = '';
window._dateTo = '';
summary = summaryValues(pages.renderReportMasuk());
assert.deepEqual(summary.map((item) => item.value), ['6 item', '2 transaksi', '1 item']);
summary = summaryValues(pages.renderReportKeluar()).map((item) => item.value);
assert.deepEqual(summary, ['6 item', '2 transaksi', '2 item']);
casePassed('Incoming/outgoing report totals, transaction count, and latest transaction qty');

window._searchTerm = 'IN-JAN';
summary = summaryValues(pages.renderReportMasuk());
assert.deepEqual(summary.map((item) => item.value), ['6 item', '2 transaksi', '1 item'], 'search narrows report detail without changing date-scope KPIs');
assert.equal(document.querySelectorAll('.report-table-card tbody tr').length, 1, 'search filters incoming report rows');
window._searchTerm = '';
window._dateFrom = '2026-01-01';
window._dateTo = '2026-01-31';
summary = summaryValues(pages.renderReportMasuk());
assert.deepEqual(summary.map((item) => item.value), ['5 item', '1 transaksi', '5 item']);
summary = summaryValues(pages.renderReportKeluar());
assert.deepEqual(summary.map((item) => item.value), ['4 item', '1 transaksi', '4 item']);
window._dateFrom = '';
window._dateTo = '';
casePassed('Incoming/outgoing report date bounds and table-only search behavior');

summary = summaryValues(pages.renderReportMutasi());
assert.deepEqual(summary.map((item) => item.value), ['6', '6', '+0'], 'movement report totals and net');
assert.match(document.querySelector('.report-table-card').textContent, /Jan/);
assert.match(document.querySelector('.report-table-card').textContent, /5 item/);
assert.match(document.querySelector('.report-table-card').textContent, /4 item/);
assert.match(document.querySelector('.report-table-card').textContent, /Feb/);
casePassed('Movement report month buckets and totals match independently calculated transaction quantities');

window._dateFrom = '2026-01-01';
window._dateTo = '2026-01-31';
summary = summaryValues(pages.renderReportMutasi());
assert.deepEqual(summary.map((item) => item.value), ['5', '4', '+1'], 'date-filtered movement totals');
window._dateFrom = '2026-03-01';
window._dateTo = '2026-04-30';
summaryValues(pages.renderReportMutasi());
assert.match(document.querySelector('.report-table-card').textContent, /Mar/);
assert.match(document.querySelector('.report-table-card').textContent, /Apr/);
assert.match(document.querySelector('.report-table-card').textContent, /0 item/);

window._dateFrom = '';
window._dateTo = '';
assert.deepEqual(
  reportUtils.buildMutasiSeries([], []).map((month) => month.label),
  ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
);
window._dateFrom = '2026-03-01';
window._dateTo = '2026-04-30';
assert.deepEqual(
  reportUtils.buildMutasiSeries([], []).map((month) => month.label),
  ['Mar','Apr'],
  'empty movement range uses requested months, not whole calendar year'
);
casePassed('Movement report date filters, empty ranges, and monthly buckets');

function exportText(type) {
  const generatedPdf = reportExport.buildReportPDF(type);
  assert.ok(generatedPdf, `${type} PDF is generated`);
  return generatedPdf.internal.pages.slice(1).flat().join('\n');
}

window._dateFrom = '2026-01-01';
window._dateTo = '2026-01-31';
window._searchTerm = 'SKU-A';
let pdfText = exportText('stok');
assert.match(pdfText, /Semua Produk/);
assert.match(pdfText, /SKU-A/);
assert.doesNotMatch(pdfText, /SKU-B/);
assert.match(pdfText, /Rp 30/);

window._searchTerm = '';
pdfText = exportText('masuk');
assert.match(pdfText, /IN-JAN/);
assert.doesNotMatch(pdfText, /IN-FEB/);
assert.match(pdfText, /5 item/);
pdfText = exportText('keluar');
assert.match(pdfText, /OUT-JAN/);
assert.doesNotMatch(pdfText, /OUT-FEB/);
assert.match(pdfText, /4 item/);
pdfText = exportText('mutasi');
assert.match(pdfText, /5 item/);
assert.match(pdfText, /4 item/);
assert.match(pdfText, /\+1/);
casePassed('All four PDF exports preserve report date/search filters and correct totals');

console.log('All master-data CRUD and report calculation cases passed.');

function casePassed(name) {
  console.log(`PASS ${name}`);
}
