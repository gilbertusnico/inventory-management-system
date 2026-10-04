# StockFolio

Inventory management app backed by Neon PostgreSQL.

## Run locally

1. Create a Neon project and copy its PostgreSQL connection string.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY`. Keep `.env` private; it is excluded from Git.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`.

Create a Clerk application and use its publishable key in `VITE_CLERK_PUBLISHABLE_KEY` and secret key in `CLERK_SECRET_KEY`. The public app requires users to sign in before the inventory is loaded; every API call independently verifies the Clerk session token. The Clerk secret key and Neon connection string are only used by the server and are never sent to the browser.

In Clerk, disable public sign-up and invite users from the Clerk Dashboard. The server trusts signed-in accounts for full inventory access; existing in-app user roles are not yet enforced as API permissions. The server creates relational tables on first API use. Records use typed PostgreSQL columns and foreign keys; transaction line items are stored in `barang_masuk_items`, `barang_keluar_items`, and `stock_transfer_items`. The schema is documented in `schema.sql`.

## Existing browser data

On first startup against an empty database, the app uploads existing `inventaris_*` data from that browser's `localStorage`. Any datasets without saved browser data are initialized with the built-in sample data. The app only removes the old local entries after the database confirms initialization. On an existing Neon database, the server migrates the previous JSONB snapshot into relational tables and archives the old JSONB tables as `legacy_*_jsonb`. Once migration finishes, the relational tables are authoritative and browser-local data is not used as a fallback.

## Production

Build and run with `npm run build` and `npm start`, with `DATABASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY` set in the deployment environment. Use private connection/secret keys and configure them as server-side secrets.

## Deploy to Vercel

1. Import the repository into Vercel. The Vite build outputs static files to `dist`; API functions are discovered from `api/`.
2. In **Project Settings → Environment Variables**, add `DATABASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY`. Only the Clerk publishable key should use the `VITE_` prefix.
3. Enable the variables for every environment that should use the app (Production and, if needed, Preview/Development). For a custom domain not supplied by Vercel's deployment environment, add its exact origin to `CLERK_AUTHORIZED_PARTIES` (comma-separated if there is more than one).
4. Redeploy after adding or changing the variable.
5. In Clerk, disable public sign-up and invite the people who should have access. Add the Vercel deployment URL and any custom domain to the Clerk application's allowed domains/origins.
6. Open the deployment and sign in with an invited account. An unauthenticated request to `/api/data` should return HTTP 401; the frontend calls the API on the same deployment.

`api/[...path].js` routes requests through the shared database API service. The local Express development server uses the same service. Clerk authentication protects all API routes; every invited account currently has full read/write access to inventory data.

## Transaction tests

Run `npm run test:transactions` to verify stock movements for incoming stock, outgoing stock, stock adjustments, inter-warehouse transfers, and stock-opname physical counts. Run `npm run test:master-reports` to verify master-data CRUD and report totals/date filters. Stock opname records physical-count history but does not change system stock; use a stock adjustment to apply the variance.

Run `npm run test:vercel-api` to test authentication, API routing, and payload validation.
Run `npm run test:dashboard` to verify custom dashboard movement date ranges, low-stock warehouse alerts, quick actions, and recent transaction/opname activity.
