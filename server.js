import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleInventoryApi } from './api/_lib/inventory-service.js';

const app = express();
const port = Number(process.env.PORT) || 3000;
const root = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: '5mb' }));
app.all('/api/*', function(req, res) {
  req.url = req.originalUrl;
  handleInventoryApi(req, res);
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(root, 'dist')));
  app.use(function(req, res) {
    res.sendFile(path.join(root, 'dist', 'index.html'));
  });
} else {
  const vite = await createViteServer({
    configFile: path.join(root, 'vite.config.ts'),
    server: { middlewareMode: true, hmr: false },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', function() {
  console.log('StockFolio server berjalan di port ' + port);
});
