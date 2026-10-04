import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { TokenVerificationError, TokenVerificationErrorReason } from '@clerk/backend/errors';

const moduleUrl = pathToFileURL(process.cwd() + '/api/[...path].js');
const { default: handler } = await import(moduleUrl.href);
const serviceUrl = pathToFileURL(process.cwd() + '/api/_lib/inventory-service.js');
const { createInventoryApiHandler } = await import(serviceUrl.href);
process.env.CLERK_SECRET_KEY = 'sk_test_stub';
process.env.VERCEL_URL = 'stockfolio-preview.vercel.app';
const verifiedOptions = [];
const authenticatedHandler = createInventoryApiHandler(async (token, options) => {
  verifiedOptions.push({ token, options });
  if (token === 'invalid-token') {
    throw new TokenVerificationError({
      message: 'Invalid token',
      reason: TokenVerificationErrorReason.TokenInvalid,
    });
  }
  if (token === 'outage-token') {
    throw new TokenVerificationError({
      message: 'JWKS unavailable',
      reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad,
    });
  }
  return { sub: 'user_test_123' };
});

async function request(targetHandler, method, url, body, token) {
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
  };
  await targetHandler({
    method,
    url,
    body,
    headers: token ? { authorization: 'Bearer ' + token } : {},
  }, response);
  return response;
}

const unauthenticated = await request(handler, 'GET', '/api/data');
assert.equal(unauthenticated.statusCode, 401);
assert.deepEqual(unauthenticated.body, { error: 'Autentikasi diperlukan' });

const invalidToken = await request(authenticatedHandler, 'GET', '/api/data', undefined, 'invalid-token');
assert.equal(invalidToken.statusCode, 401);
assert.deepEqual(invalidToken.body, { error: 'Sesi login tidak valid atau sudah berakhir' });

const verifierUnavailable = await request(authenticatedHandler, 'GET', '/api/data', undefined, 'outage-token');
assert.equal(verifierUnavailable.statusCode, 503);
assert.deepEqual(verifierUnavailable.body, { error: 'Layanan autentikasi sementara tidak tersedia' });

delete process.env.CLERK_SECRET_KEY;
const missingSecret = await request(handler, 'GET', '/api/data', undefined, 'valid-token');
assert.equal(missingSecret.statusCode, 503);
assert.deepEqual(missingSecret.body, { error: 'Autentikasi belum dikonfigurasi di server' });
process.env.CLERK_SECRET_KEY = 'sk_test_stub';

const unknown = await request(authenticatedHandler, 'GET', '/api/not-a-route', undefined, 'valid-token');
assert.equal(unknown.statusCode, 404);
assert.deepEqual(unknown.body, { error: 'Endpoint API tidak ditemukan' });

const invalidInitialize = await request(authenticatedHandler, 'POST', '/api/data/initialize', { data: {} }, 'valid-token');
assert.equal(invalidInitialize.statusCode, 400);
assert.deepEqual(invalidInitialize.body, { error: 'Format data inventaris tidak valid' });

const invalidUpdate = await request(authenticatedHandler, 'PUT', '/api/data', { data: [] }, 'valid-token');
assert.equal(invalidUpdate.statusCode, 400);
assert.deepEqual(invalidUpdate.body, { error: 'Format data inventaris tidak valid' });

const unsupportedMethod = await request(authenticatedHandler, 'DELETE', '/api/data', undefined, 'valid-token');
assert.equal(unsupportedMethod.statusCode, 404);
assert.equal(verifiedOptions.length, 6);
assert.equal(verifiedOptions[2].options.secretKey, 'sk_test_stub');
assert.ok(verifiedOptions[2].options.authorizedParties.includes('https://stockfolio-preview.vercel.app'));

console.log('Vercel API authentication, routing, and validation tests passed');
