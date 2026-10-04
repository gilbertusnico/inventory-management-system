import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { pathToFileURL } from 'node:url';

const dom = new JSDOM('', { url: 'http://localhost/' });
globalThis.localStorage = dom.window.localStorage;

const legacyProducts = [{ id: 99, sku: 'MIG-001', name: 'Produk Migrasi' }];
localStorage.setItem('inventaris_products', JSON.stringify(legacyProducts));
localStorage.setItem('inventaris_stockOpnameFisik', JSON.stringify({ '99-1': 7 }));

let databaseData = null;
const requests = [];
globalThis.fetch = async (url, options) => {
  const method = options.method;
  requests.push({ url, method, authorization: options.headers.Authorization });
  if (method === 'GET') return response({ data: databaseData });
  const body = JSON.parse(options.body);
  if (url.endsWith('/initialize')) databaseData = body.data;
  if (method === 'PUT') databaseData = body.data;
  return response({ data: databaseData });
};

function response(body) {
  return { ok: true, json: async () => body };
}

const moduleUrl = pathToFileURL(process.cwd() + '/src/data.js');
moduleUrl.searchParams.set('test', 'database-migration');
const data = await import(moduleUrl.href);
data.setAuthTokenProvider(async () => 'test-session-token');

await data.initializeData();
assert.deepEqual(data.products, legacyProducts, 'local product data is copied to database state');
assert.equal(databaseData.stockOpnameFisik['99-1'], 7, 'stock opname counts are migrated');
assert.equal(localStorage.getItem('inventaris_products'), null, 'legacy values are removed after successful initialization');
assert.equal(localStorage.getItem('inventaris_stockOpnameFisik'), null, 'legacy stock opname values are removed');

data.products.push({ id: 100, sku: 'MIG-002' });
await data.saveAllData();
assert.ok(databaseData.products.some((product) => product.id === 100), 'later changes are saved to the database');
assert.deepEqual(requests.map(({ method }) => method), ['GET', 'POST', 'PUT']);
assert.ok(requests.every(({ authorization }) => authorization === 'Bearer test-session-token'), 'database requests include the active Clerk session token');

console.log('Database migration test passed');
