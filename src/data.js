// ============================================
// INVENTARIS — Data Layer
// ============================================

const _now = new Date();
function daysAgo(n) {
  var d = new Date(_now);
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// ============================================
// MASTER DATA
// ============================================

export const categories = [
  { id: 1, name: 'Elektronik', description: 'Produk elektronik dan perangkat listrik', createdAt: '2024-12-01' },
  { id: 2, name: 'Aksesoris', description: 'Aksesoris gadget dan komputer', createdAt: '2024-12-05' },
  { id: 3, name: 'Makanan', description: 'Makanan dan minuman ringan', createdAt: '2024-12-10' },
  { id: 4, name: 'Alat Tulis', description: 'ATK dan perlengkapan kantor', createdAt: '2024-12-15' },
  { id: 5, name: 'Perlengkapan Rumah', description: 'Perlengkapan rumah tangga dan listrik', createdAt: '2024-12-20' },
];

export const suppliers = [
  { id: 1, name: 'PT Elektronik Jaya', pic: 'Budi Santoso', email: 'budi@elektronikjaya.com', phone: '021-5550123', createdAt: '2024-12-01' },
  { id: 2, name: 'CV Aksesoris Murah', pic: 'Siti Rahmawati', email: 'siti@aksesorismurah.com', phone: '021-5550124', createdAt: '2024-12-08' },
  { id: 3, name: 'UD Sinar Jaya', pic: 'Ahmad Hidayat', email: 'ahmad@sinarjaya.com', phone: '021-5550125', createdAt: '2024-12-12' },
  { id: 4, name: 'PT Mitra Abadi', pic: 'Dewi Lestari', email: 'dewi@mitraabadi.com', phone: '021-5550126', createdAt: '2024-12-18' },
  { id: 5, name: 'CV Berkah Sentosa', pic: 'Rudi Hartono', email: 'rudi@berkahsentosa.com', phone: '021-5550127', createdAt: '2024-12-22' },
];

export const warehouses = [
  { id: 1, code: 'WH-MDN', name: 'Gudang Medan', location: 'Jl. Gatot Subroto No. 123, Medan', createdAt: '2024-12-02' },
  { id: 2, code: 'WH-JKT', name: 'Gudang Jakarta', location: 'Jl. Sudirman No. 45, Jakarta Pusat', createdAt: '2024-12-04' },
  { id: 3, code: 'WH-SBY', name: 'Gudang Surabaya', location: 'Jl. Pemuda No. 78, Surabaya', createdAt: '2024-12-06' },
];

// ============================================
// MASTER PRODUK (1 SKU = 1 entry)
// ============================================

export const products = [
  { id: 1, sku: 'ELE-001', name: 'Laptop ThinkPad X1', categoryId: 1, supplierId: 1, price: 15000000, minStock: 5, status: 'Aktif', createdAt: '2024-12-01' },
  { id: 2, sku: 'ELE-002', name: 'Monitor 27" 4K UHD', categoryId: 1, supplierId: 1, price: 4500000, minStock: 3, status: 'Aktif', createdAt: '2024-12-03' },
  { id: 3, sku: 'ELE-003', name: 'Keyboard Mechanical RGB', categoryId: 1, supplierId: 2, price: 850000, minStock: 10, status: 'Aktif', createdAt: '2024-12-05' },
  { id: 4, sku: 'ELE-004', name: 'Mouse Wireless Logitech', categoryId: 1, supplierId: 2, price: 350000, minStock: 10, status: 'Aktif', createdAt: '2024-12-07' },
  { id: 5, sku: 'ELE-005', name: 'Webcam HD 1080p', categoryId: 1, supplierId: 3, price: 420000, minStock: 5, status: 'Aktif', createdAt: '2024-12-09' },
  { id: 6, sku: 'ELE-006', name: 'Headset Bluetooth', categoryId: 1, supplierId: 3, price: 650000, minStock: 8, status: 'Nonaktif', createdAt: '2024-12-11' },
  { id: 7, sku: 'AKS-001', name: 'USB-C Hub 7-in-1', categoryId: 2, supplierId: 2, price: 280000, minStock: 10, status: 'Aktif', createdAt: '2024-12-13' },
  { id: 8, sku: 'AKS-002', name: 'Screen Protector Tempered Glass', categoryId: 2, supplierId: 4, price: 55000, minStock: 20, status: 'Aktif', createdAt: '2024-12-15' },
  { id: 9, sku: 'AKS-003', name: 'Laptop Sleeve 15.6"', categoryId: 2, supplierId: 4, price: 120000, minStock: 10, status: 'Aktif', createdAt: '2024-12-17' },
  { id: 10, sku: 'AKS-004', name: 'Cable Management Kit', categoryId: 2, supplierId: 5, price: 75000, minStock: 15, status: 'Aktif', createdAt: '2024-12-19' },
  { id: 11, sku: 'MKN-001', name: 'Kopi Arabica Premium 250g', categoryId: 3, supplierId: 5, price: 85000, minStock: 15, status: 'Aktif', createdAt: '2024-12-21' },
  { id: 12, sku: 'MKN-002', name: 'Biskuit Coklat 200g', categoryId: 3, supplierId: 5, price: 25000, minStock: 30, status: 'Aktif', createdAt: '2024-12-23' },
  { id: 13, sku: 'MKN-003', name: 'Minuman Isotonic 500ml', categoryId: 3, supplierId: 5, price: 8000, minStock: 50, status: 'Aktif', createdAt: '2024-12-25' },
  { id: 14, sku: 'ATK-001', name: 'Pulpen Gel Hitam 0.5mm', categoryId: 4, supplierId: 4, price: 12000, minStock: 50, status: 'Aktif', createdAt: '2024-12-27' },
  { id: 15, sku: 'ATK-002', name: 'Kertas HVS A4 80gsm (1rim)', categoryId: 4, supplierId: 4, price: 55000, minStock: 10, status: 'Aktif', createdAt: '2024-12-28' },
  { id: 16, sku: 'ATK-003', name: 'Sticky Notes 3x3" (5pcs)', categoryId: 4, supplierId: 4, price: 18000, minStock: 20, status: 'Aktif', createdAt: '2024-12-29' },
  { id: 17, sku: 'ATK-004', name: 'File Folder Letter Size', categoryId: 4, supplierId: 5, price: 15000, minStock: 25, status: 'Aktif', createdAt: '2024-12-30' },
  { id: 18, sku: 'RMT-001', name: 'Lampu LED 12W', categoryId: 5, supplierId: 3, price: 45000, minStock: 20, status: 'Aktif', createdAt: '2024-12-31' },
  { id: 19, sku: 'RMT-002', name: 'Kabel Listrik 3x1.5mm 10m', categoryId: 5, supplierId: 3, price: 85000, minStock: 8, status: 'Aktif', createdAt: '2025-01-02' },
  { id: 20, sku: 'RMT-003', name: 'Stop Kontak 4 Lubang', categoryId: 5, supplierId: 3, price: 35000, minStock: 10, status: 'Aktif', createdAt: '2025-01-05' },
];

// ============================================
// STOK PER GUDANG (multi-warehouse)
// ============================================

export const productStocks = [
  // Elektronik
  { id: 1, productId: 1, warehouseId: 2, stock: 12 },
  { id: 2, productId: 2, warehouseId: 2, stock: 8 },
  { id: 3, productId: 3, warehouseId: 1, stock: 25 },
  { id: 4, productId: 4, warehouseId: 1, stock: 2 },
  { id: 5, productId: 5, warehouseId: 3, stock: 15 },
  { id: 6, productId: 6, warehouseId: 2, stock: 1 },
  // Aksesoris
  { id: 7, productId: 7, warehouseId: 1, stock: 30 },
  { id: 8, productId: 8, warehouseId: 2, stock: 50 },
  { id: 9, productId: 9, warehouseId: 3, stock: 20 },
  { id: 10, productId: 10, warehouseId: 1, stock: 4 },
  // Makanan
  { id: 11, productId: 11, warehouseId: 1, stock: 40 },
  { id: 12, productId: 12, warehouseId: 2, stock: 60 },
  { id: 13, productId: 13, warehouseId: 3, stock: 120 },
  // Alat Tulis
  { id: 14, productId: 14, warehouseId: 2, stock: 200 },
  { id: 15, productId: 15, warehouseId: 1, stock: 35 },
  { id: 16, productId: 16, warehouseId: 3, stock: 45 },
  { id: 17, productId: 17, warehouseId: 2, stock: 3 },
  // Perlengkapan Rumah
  { id: 18, productId: 18, warehouseId: 1, stock: 55 },
  { id: 19, productId: 19, warehouseId: 2, stock: 18 },
  { id: 20, productId: 20, warehouseId: 3, stock: 28 },
];

// ============================================
// TRANSACTIONS
// ============================================

export const barangMasuk = [
  { id: 1, date: daysAgo(1), supplierId: 1, warehouseId: 2, ref: 'PO-2024-001', items: [{ productId: 1, qty: 10 }, { productId: 2, qty: 5 }], note: 'Restock bulanan' },
  { id: 2, date: daysAgo(3), supplierId: 2, warehouseId: 1, ref: 'PO-2024-002', items: [{ productId: 3, qty: 20 }, { productId: 4, qty: 15 }], note: '' },
  { id: 3, date: daysAgo(5), supplierId: 4, warehouseId: 2, ref: 'PO-2024-003', items: [{ productId: 8, qty: 100 }, { productId: 14, qty: 200 }], note: 'Stok ATK' },
  { id: 4, date: daysAgo(7), supplierId: 5, warehouseId: 1, ref: 'PO-2024-004', items: [{ productId: 11, qty: 30 }, { productId: 12, qty: 50 }], note: 'Pengadaan makanan' },
  { id: 5, date: daysAgo(10), supplierId: 3, warehouseId: 3, ref: 'PO-2024-005', items: [{ productId: 5, qty: 20 }, { productId: 18, qty: 40 }], note: '' },
  { id: 6, date: daysAgo(14), supplierId: 1, warehouseId: 2, ref: 'PO-2024-006', items: [{ productId: 1, qty: 5 }], note: 'Unit tambahan' },
];

export const barangKeluar = [
  { id: 1, date: daysAgo(0), penerima: 'Dept. IT', warehouseId: 2, items: [{ productId: 1, qty: 1 }, { productId: 3, qty: 2 }], ref: 'OUT-001', note: 'Kebutuhan IT' },
  { id: 2, date: daysAgo(2), penerima: 'Dept. Marketing', warehouseId: 1, items: [{ productId: 7, qty: 3 }], ref: 'OUT-002', note: '' },
  { id: 3, date: daysAgo(4), penerima: 'Gudang Surabaya', warehouseId: 3, items: [{ productId: 5, qty: 5 }], ref: 'OUT-003', note: 'Transfer antar cabang' },
  { id: 4, date: daysAgo(6), penerima: 'Customer A', warehouseId: 1, items: [{ productId: 11, qty: 10 }, { productId: 12, qty: 20 }], ref: 'OUT-004', note: 'Pesanan customer' },
  { id: 5, date: daysAgo(9), penerima: 'Dept. HRD', warehouseId: 2, items: [{ productId: 15, qty: 5 }, { productId: 14, qty: 30 }], ref: 'OUT-005', note: '' },
];

export const stockAdjustments = [
  { id: 1, date: daysAgo(2), productId: 4, warehouseId: 1, sistem: 2, fisik: 2, selisih: 0, alasan: 'Koreksi' },
  { id: 2, date: daysAgo(5), productId: 10, warehouseId: 1, sistem: 4, fisik: 4, selisih: 0, alasan: 'Koreksi' },
  { id: 3, date: daysAgo(8), productId: 6, warehouseId: 2, sistem: 1, fisik: 1, selisih: 0, alasan: 'Koreksi' },
  { id: 4, date: daysAgo(12), productId: 17, warehouseId: 2, sistem: 3, fisik: 3, selisih: 0, alasan: 'Koreksi' },
  { id: 5, date: daysAgo(15), productId: 3, warehouseId: 1, sistem: 23, fisik: 25, selisih: 2, alasan: 'Koreksi' },
];

export const stockTransfers = [
  { id: 1, date: daysAgo(3), fromWarehouseId: 2, toWarehouseId: 1, items: [{ productId: 1, qty: 2 }, { productId: 2, qty: 1 }], ref: 'TRF-001' },
  { id: 2, date: daysAgo(8), fromWarehouseId: 2, toWarehouseId: 3, items: [{ productId: 8, qty: 20 }, { productId: 14, qty: 50 }], ref: 'TRF-002' },
  { id: 3, date: daysAgo(14), fromWarehouseId: 1, toWarehouseId: 2, items: [{ productId: 7, qty: 5 }], ref: 'TRF-003' },
];

export const stockOpname = [
  { id: 1, productId: 1, warehouseId: 2, sistem: 12, fisik: 12 },
  { id: 2, productId: 2, warehouseId: 2, sistem: 8, fisik: 7 },
  { id: 3, productId: 3, warehouseId: 1, sistem: 25, fisik: 25 },
  { id: 4, productId: 4, warehouseId: 1, sistem: 2, fisik: 2 },
  { id: 5, productId: 5, warehouseId: 3, sistem: 15, fisik: 14 },
  { id: 6, productId: 7, warehouseId: 1, sistem: 30, fisik: 30 },
  { id: 7, productId: 8, warehouseId: 2, sistem: 50, fisik: 48 },
  { id: 8, productId: 10, warehouseId: 1, sistem: 4, fisik: 4 },
  { id: 9, productId: 11, warehouseId: 1, sistem: 40, fisik: 40 },
  { id: 10, productId: 14, warehouseId: 2, sistem: 200, fisik: 195 },
  { id: 11, productId: 15, warehouseId: 1, sistem: 35, fisik: 35 },
  { id: 12, productId: 17, warehouseId: 2, sistem: 3, fisik: 3 },
];

export const users = [
  { id: 1, name: 'Admin User', email: 'admin@inventaris.com', role: 'Owner', status: 'Active', lastLogin: daysAgo(0), createdAt: '2024-12-01' },
  { id: 2, name: 'Dewi Sartika', email: 'dewi@inventaris.com', role: 'Admin', status: 'Active', lastLogin: daysAgo(1), createdAt: '2024-12-05' },
  { id: 3, name: 'Bayu Pratama', email: 'bayu@inventaris.com', role: 'Staff', status: 'Active', lastLogin: daysAgo(3), createdAt: '2024-12-10' },
  { id: 4, name: 'Citra Ayu', email: 'citra@inventaris.com', role: 'Staff', status: 'Inactive', lastLogin: daysAgo(30), createdAt: '2024-12-15' },
  { id: 5, name: 'Doni Saputra', email: 'doni@inventaris.com', role: 'Admin', status: 'Active', lastLogin: daysAgo(0), createdAt: '2024-12-20' },
];

export const permissions = {
  'Master Data': { Lihat: { Owner: true, Admin: true, Staff: true }, Buat: { Owner: true, Admin: true, Staff: false }, Edit: { Owner: true, Admin: true, Staff: false }, Hapus: { Owner: true, Admin: false, Staff: false } },
  Inventory: { Lihat: { Owner: true, Admin: true, Staff: true }, Buat: { Owner: true, Admin: true, Staff: true }, Edit: { Owner: true, Admin: true, Staff: false }, Hapus: { Owner: true, Admin: false, Staff: false } },
  Laporan: { Lihat: { Owner: true, Admin: true, Staff: true } },
  Pengaturan: { Lihat: { Owner: true, Admin: true, Staff: false }, Buat: { Owner: true, Admin: false, Staff: false }, Edit: { Owner: true, Admin: false, Staff: false }, Hapus: { Owner: true, Admin: false, Staff: false } },
};

// ============================================
// HELPER FUNCTIONS — Stock / Lookup
// ============================================

export function getCategory(id) { return categories.find(function(c) { return c.id === id; }); }
export function getSupplier(id) { return suppliers.find(function(s) { return s.id === id; }); }
export function getWarehouse(id) { return warehouses.find(function(w) { return w.id === id; }); }
export function getProduct(id) { return products.find(function(p) { return p.id === id; }); }
export function getUser(id) { return users.find(function(u) { return u.id === id; }); }
export function getBarangMasuk(id) { return barangMasuk.find(function(b) { return b.id === id; }); }
export function getBarangKeluar(id) { return barangKeluar.find(function(b) { return b.id === id; }); }

// --- Stock helpers ---

/** Get stock record for a product in a specific warehouse */
export function getProductStock(productId, warehouseId) {
  return productStocks.find(function(ps) { return ps.productId === productId && ps.warehouseId === warehouseId; });
}

/** Get all stock records for a product (across all warehouses) */
export function getAllProductStocks(productId) {
  return productStocks.filter(function(ps) { return ps.productId === productId; });
}

/** Get total stock quantity for a product across all warehouses */
export function getTotalStock(productId) {
  return productStocks
    .filter(function(ps) { return ps.productId === productId; })
    .reduce(function(s, ps) { return s + ps.stock; }, 0);
}

/** Add stock delta (+/-) to a product in a warehouse. Creates entry if not exists */
export function addStock(productId, warehouseId, delta) {
  var existing = getProductStock(productId, warehouseId);
  if (existing) {
    existing.stock += delta;
    if (existing.stock < 0) existing.stock = 0;
  } else if (delta > 0) {
    productStocks.push({
      id: nextId(productStocks),
      productId: productId,
      warehouseId: warehouseId,
      stock: delta
    });
  }
}

/** Set exact stock for a product in a warehouse */
export function setStock(productId, warehouseId, newStock) {
  var existing = getProductStock(productId, warehouseId);
  if (existing) {
    existing.stock = Math.max(0, newStock);
  } else {
    productStocks.push({
      id: nextId(productStocks),
      productId: productId,
      warehouseId: warehouseId,
      stock: Math.max(0, newStock)
    });
  }
}

/** Get all product+stock rows for listing (joins products with productStocks) */
export function getProductStockRows() {
  var rows = [];
  for (var i = 0; i < productStocks.length; i++) {
    var ps = productStocks[i];
    var p = getProduct(ps.productId);
    if (p) {
      rows.push({
        id: p.id,
        sku: p.sku,
        name: p.name,
        categoryId: p.categoryId,
        supplierId: p.supplierId,
        warehouseId: ps.warehouseId,
        stock: ps.stock,
        price: p.price,
        minStock: p.minStock,
        status: p.status,
        createdAt: p.createdAt
      });
    }
  }
  return rows;
}

export function getProductsByWarehouse(warehouseId) {
  return productStocks
    .filter(function(ps) { return ps.warehouseId === warehouseId; })
    .map(function(ps) {
      var p = getProduct(ps.productId);
      return p ? { id: p.id, name: p.name, sku: p.sku, stock: ps.stock } : null;
    })
    .filter(function(r) { return r !== null; });
}

export function getLowStockProducts() {
  var result = [];
  for (var i = 0; i < productStocks.length; i++) {
    var ps = productStocks[i];
    var p = getProduct(ps.productId);
    if (p && p.status === 'Aktif' && ps.stock < p.minStock) {
      result.push({
        id: p.id,
        sku: p.sku,
        name: p.name,
        warehouseId: ps.warehouseId,
        stock: ps.stock,
        minStock: p.minStock
      });
    }
  }
  return result.sort(function(a, b) { return (a.stock - a.minStock) - (b.stock - b.minStock); });
}

export function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  var d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  var d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function getNextRef(type) {
  if (type === 'bm') {
    var maxNum = 0;
    for (var i = 0; i < barangMasuk.length; i++) {
      var ref = barangMasuk[i].ref || '';
      var num = parseInt(ref.replace(/[^0-9]/g, '')) || 0;
      if (num > maxNum) maxNum = num;
    }
    return 'PO-' + String(maxNum + 1).padStart(3, '0');
  }
  if (type === 'bk') {
    var maxNum = 0;
    for (var i = 0; i < barangKeluar.length; i++) {
      var ref = barangKeluar[i].ref || '';
      var num = parseInt(ref.replace(/[^0-9]/g, '')) || 0;
      if (num > maxNum) maxNum = num;
    }
    return 'OUT-' + String(maxNum + 1).padStart(3, '0');
  }
  return '';
}

// ============================================
// COUNTS UPDATE
// ============================================

export function updateCounts() {
  // Category counts
  for (var ci = 0; ci < categories.length; ci++) {
    var catId = categories[ci].id;
    var catProducts = products.filter(function(p) { return p.categoryId === catId; });
    categories[ci].count = catProducts.length;
    categories[ci].totalStock = catProducts.reduce(function(s, p) {
      return s + getTotalStock(p.id);
    }, 0);
  }
  // Warehouse counts
  for (var wi = 0; wi < warehouses.length; wi++) {
    var whId = warehouses[wi].id;
    var whStocks = productStocks.filter(function(ps) { return ps.warehouseId === whId; });
    warehouses[wi].count = whStocks.length;
    warehouses[wi].totalStock = whStocks.reduce(function(s, ps) { return s + ps.stock; }, 0);
  }
}

// ============================================
// LOCAL STORAGE PERSISTENCE
// ============================================

var STORAGE_PREFIX = 'inventaris_';
var ALL_DATASETS = [
  { key: 'categories', data: categories },
  { key: 'suppliers', data: suppliers },
  { key: 'warehouses', data: warehouses },
  { key: 'products', data: products },
  { key: 'productStocks', data: productStocks },
  { key: 'barangMasuk', data: barangMasuk },
  { key: 'barangKeluar', data: barangKeluar },
  { key: 'stockAdjustments', data: stockAdjustments },
  { key: 'stockTransfers', data: stockTransfers },
  { key: 'stockOpname', data: stockOpname },
  { key: 'users', data: users },
];

function initFromStorage() {
  var hasData = false;
  for (var i = 0; i < ALL_DATASETS.length; i++) {
    var ds = ALL_DATASETS[i];
    try {
      var saved = localStorage.getItem(STORAGE_PREFIX + ds.key);
      if (saved) {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          ds.data.length = 0;
          for (var j = 0; j < parsed.length; j++) {
            ds.data.push(parsed[j]);
          }
          hasData = true;
        }
      }
    } catch (e) {
      console.warn('Gagal memuat ' + ds.key + ' dari localStorage:', e);
    }
  }
  if (!hasData) {
    saveAllData();
  }
}

export function saveAllData() {
  for (var i = 0; i < ALL_DATASETS.length; i++) {
    var ds = ALL_DATASETS[i];
    try {
      localStorage.setItem(STORAGE_PREFIX + ds.key, JSON.stringify(ds.data));
    } catch (e) {
      console.warn('Gagal menyimpan ' + ds.key + ' ke localStorage:', e);
    }
  }
}

initFromStorage();

function nextId(arr) {
  if (!arr || arr.length === 0) return 1;
  var max = 0;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id > max) max = arr[i].id;
  }
  return max + 1;
}
