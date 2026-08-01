// ============================================
// INVENTARIS — Mock Data
// ============================================

var categories = [
  { id: 1, name: 'Elektronik', description: 'Produk elektronik dan perangkat listrik', count: 6 },
  { id: 2, name: 'Aksesoris', description: 'Aksesoris gadget dan komputer', count: 4 },
  { id: 3, name: 'Makanan', description: 'Makanan dan minuman ringan', count: 3 },
  { id: 4, name: 'Alat Tulis', description: 'ATK dan perlengkapan kantor', count: 4 },
  { id: 5, name: 'Peralatan Rumah', description: 'Perlengkapan rumah tangga', count: 3 },
];

var suppliers = [
  { id: 1, name: 'PT Elektronik Jaya', pic: 'Budi Santoso', email: 'budi@elektronikjaya.com', phone: '021-5550123' },
  { id: 2, name: 'CV Aksesoris Murah', pic: 'Siti Rahmawati', email: 'siti@aksesorismurah.com', phone: '021-5550124' },
  { id: 3, name: 'UD Sinar Jaya', pic: 'Ahmad Hidayat', email: 'ahmad@sinarjaya.com', phone: '021-5550125' },
  { id: 4, name: 'PT Mitra Abadi', pic: 'Dewi Lestari', email: 'dewi@mitraabadi.com', phone: '021-5550126' },
  { id: 5, name: 'CV Berkah Sentosa', pic: 'Rudi Hartono', email: 'rudi@berkahsentosa.com', phone: '021-5550127' },
];

var warehouses = [
  { id: 1, code: 'WH-MDN', name: 'Gudang Medan', location: 'Jl. Gatot Subroto No. 123, Medan', count: 8 },
  { id: 2, code: 'WH-JKT', name: 'Gudang Jakarta', location: 'Jl. Sudirman No. 45, Jakarta Pusat', count: 12 },
  { id: 3, code: 'WH-SBY', name: 'Gudang Surabaya', location: 'Jl. Ahmad Yani No. 78, Surabaya', count: 6 },
];

var products = [
  { id: 1, sku: 'ELE-001', name: 'Laptop ThinkPad X1', categoryId: 1, supplierId: 1, warehouseId: 2, price: 15000000, stock: 12, minStock: 5, status: 'Aktif' },
  { id: 2, sku: 'ELE-002', name: 'Monitor 27" 4K UHD', categoryId: 1, supplierId: 1, warehouseId: 2, price: 4500000, stock: 8, minStock: 3, status: 'Aktif' },
  { id: 3, sku: 'ELE-003', name: 'Keyboard Mechanical RGB', categoryId: 1, supplierId: 2, warehouseId: 1, price: 850000, stock: 25, minStock: 10, status: 'Aktif' },
  { id: 4, sku: 'ELE-004', name: 'Mouse Wireless Logitech', categoryId: 1, supplierId: 2, warehouseId: 1, price: 350000, stock: 2, minStock: 10, status: 'Aktif' },
  { id: 5, sku: 'ELE-005', name: 'Webcam HD 1080p', categoryId: 1, supplierId: 3, warehouseId: 3, price: 420000, stock: 15, minStock: 5, status: 'Aktif' },
  { id: 6, sku: 'ELE-006', name: 'Headset Bluetooth', categoryId: 1, supplierId: 3, warehouseId: 2, price: 650000, stock: 1, minStock: 8, status: 'Nonaktif' },
  { id: 7, sku: 'AKS-001', name: 'USB-C Hub 7-in-1', categoryId: 2, supplierId: 2, warehouseId: 1, price: 280000, stock: 30, minStock: 10, status: 'Aktif' },
  { id: 8, sku: 'AKS-002', name: 'Screen Protector Tempered Glass', categoryId: 2, supplierId: 4, warehouseId: 2, price: 55000, stock: 50, minStock: 20, status: 'Aktif' },
  { id: 9, sku: 'AKS-003', name: 'Laptop Sleeve 15.6"', categoryId: 2, supplierId: 4, warehouseId: 3, price: 120000, stock: 20, minStock: 10, status: 'Aktif' },
  { id: 10, sku: 'AKS-004', name: 'Cable Management Kit', categoryId: 2, supplierId: 5, warehouseId: 1, price: 75000, stock: 4, minStock: 15, status: 'Aktif' },
  { id: 11, sku: 'MKN-001', name: 'Kopi Arabica Premium 250g', categoryId: 3, supplierId: 5, warehouseId: 1, price: 85000, stock: 40, minStock: 15, status: 'Aktif' },
  { id: 12, sku: 'MKN-002', name: 'Biskuit Coklat 200g', categoryId: 3, supplierId: 5, warehouseId: 2, price: 25000, stock: 60, minStock: 30, status: 'Aktif' },
  { id: 13, sku: 'MKN-003', name: 'Minuman Isotonic 500ml', categoryId: 3, supplierId: 5, warehouseId: 3, price: 8000, stock: 120, minStock: 50, status: 'Aktif' },
  { id: 14, sku: 'ATK-001', name: 'Pulpen Gel Hitam 0.5mm', categoryId: 4, supplierId: 4, warehouseId: 2, price: 12000, stock: 200, minStock: 50, status: 'Aktif' },
  { id: 15, sku: 'ATK-002', name: 'Kertas HVS A4 80gsm (1rim)', categoryId: 4, supplierId: 4, warehouseId: 1, price: 55000, stock: 35, minStock: 10, status: 'Aktif' },
  { id: 16, sku: 'ATK-003', name: 'Sticky Notes 3x3" (5pcs)', categoryId: 4, supplierId: 4, warehouseId: 3, price: 18000, stock: 45, minStock: 20, status: 'Aktif' },
  { id: 17, sku: 'ATK-004', name: 'File Folder Letter Size', categoryId: 4, supplierId: 5, warehouseId: 2, price: 15000, stock: 3, minStock: 25, status: 'Aktif' },
  { id: 18, sku: 'RMT-001', name: 'Lampu LED 12W', categoryId: 5, supplierId: 3, warehouseId: 1, price: 45000, stock: 55, minStock: 20, status: 'Aktif' },
  { id: 19, sku: 'RMT-002', name: 'Kabel Listrik 3x1.5mm 10m', categoryId: 5, supplierId: 3, warehouseId: 2, price: 85000, stock: 18, minStock: 8, status: 'Aktif' },
  { id: 20, sku: 'RMT-003', name: 'Stop Kontak 4 Lubang', categoryId: 5, supplierId: 3, warehouseId: 3, price: 35000, stock: 28, minStock: 10, status: 'Aktif' },
];

var _now = new Date();
function daysAgo(n) {
  var d = new Date(_now);
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

var barangMasuk = [
  { id: 1, date: daysAgo(1), supplierId: 1, ref: 'PO-2024-001', items: [{ productId: 1, qty: 10 }, { productId: 2, qty: 5 }], note: 'Restock bulanan' },
  { id: 2, date: daysAgo(3), supplierId: 2, ref: 'PO-2024-002', items: [{ productId: 3, qty: 20 }, { productId: 4, qty: 15 }], note: '' },
  { id: 3, date: daysAgo(5), supplierId: 4, ref: 'PO-2024-003', items: [{ productId: 8, qty: 100 }, { productId: 14, qty: 200 }], note: 'Stok ATK' },
  { id: 4, date: daysAgo(7), supplierId: 5, ref: 'PO-2024-004', items: [{ productId: 11, qty: 30 }, { productId: 12, qty: 50 }], note: 'Pengadaan makanan' },
  { id: 5, date: daysAgo(10), supplierId: 3, ref: 'PO-2024-005', items: [{ productId: 5, qty: 20 }, { productId: 18, qty: 40 }], note: '' },
  { id: 6, date: daysAgo(14), supplierId: 1, ref: 'PO-2024-006', items: [{ productId: 1, qty: 5 }], note: 'Unit tambahan' },
];

var barangKeluar = [
  { id: 1, date: daysAgo(0), penerima: 'Dept. IT', items: [{ productId: 1, qty: 1 }, { productId: 3, qty: 2 }], ref: 'OUT-001', note: 'Kebutuhan IT' },
  { id: 2, date: daysAgo(2), penerima: 'Dept. Marketing', items: [{ productId: 7, qty: 3 }], ref: 'OUT-002', note: '' },
  { id: 3, date: daysAgo(4), penerima: 'Gudang Surabaya', items: [{ productId: 5, qty: 5 }], ref: 'OUT-003', note: 'Transfer antar cabang' },
  { id: 4, date: daysAgo(6), penerima: 'Customer A', items: [{ productId: 11, qty: 10 }, { productId: 12, qty: 20 }], ref: 'OUT-004', note: 'Pesanan customer' },
  { id: 5, date: daysAgo(9), penerima: 'Dept. HRD', items: [{ productId: 15, qty: 5 }, { productId: 14, qty: 30 }], ref: 'OUT-005', note: '' },
];

var stockAdjustments = [
  { id: 1, date: daysAgo(2), productId: 4, sistem: 5, fisik: 2, selisih: -3, alasan: 'Hilang' },
  { id: 2, date: daysAgo(5), productId: 10, sistem: 8, fisik: 4, selisih: -4, alasan: 'Rusak' },
  { id: 3, date: daysAgo(8), productId: 6, sistem: 1, fisik: 0, selisih: -1, alasan: 'Kadaluarsa' },
  { id: 4, date: daysAgo(12), productId: 17, sistem: 5, fisik: 3, selisih: -2, alasan: 'Hilang' },
  { id: 5, date: daysAgo(15), productId: 3, sistem: 23, fisik: 25, selisih: 2, alasan: 'Koreksi' },
];

var stockTransfers = [
  { id: 1, date: daysAgo(3), fromWarehouseId: 2, toWarehouseId: 1, items: [{ productId: 1, qty: 2 }, { productId: 2, qty: 1 }], ref: 'TRF-001' },
  { id: 2, date: daysAgo(8), fromWarehouseId: 2, toWarehouseId: 3, items: [{ productId: 8, qty: 20 }, { productId: 14, qty: 50 }], ref: 'TRF-002' },
  { id: 3, date: daysAgo(14), fromWarehouseId: 1, toWarehouseId: 2, items: [{ productId: 7, qty: 5 }], ref: 'TRF-003' },
];

var stockOpname = [
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

var users = [
  { id: 1, name: 'Admin User', email: 'admin@inventaris.com', role: 'Owner', status: 'Active', lastLogin: daysAgo(0) },
  { id: 2, name: 'Dewi Sartika', email: 'dewi@inventaris.com', role: 'Admin', status: 'Active', lastLogin: daysAgo(1) },
  { id: 3, name: 'Bayu Pratama', email: 'bayu@inventaris.com', role: 'Staff', status: 'Active', lastLogin: daysAgo(3) },
  { id: 4, name: 'Citra Ayu', email: 'citra@inventaris.com', role: 'Staff', status: 'Inactive', lastLogin: daysAgo(30) },
  { id: 5, name: 'Doni Saputra', email: 'doni@inventaris.com', role: 'Admin', status: 'Active', lastLogin: daysAgo(0) },
];

var permissions = {
  'Master Data': {
    Lihat: { Owner: true, Admin: true, Staff: true },
    Buat: { Owner: true, Admin: true, Staff: false },
    Edit: { Owner: true, Admin: true, Staff: false },
    Hapus: { Owner: true, Admin: false, Staff: false },
  },
  Inventory: {
    Lihat: { Owner: true, Admin: true, Staff: true },
    Buat: { Owner: true, Admin: true, Staff: true },
    Edit: { Owner: true, Admin: true, Staff: false },
    Hapus: { Owner: true, Admin: false, Staff: false },
  },
  Laporan: {
    Lihat: { Owner: true, Admin: true, Staff: true },
  },
  Pengaturan: {
    Lihat: { Owner: true, Admin: true, Staff: false },
    Buat: { Owner: true, Admin: false, Staff: false },
    Edit: { Owner: true, Admin: false, Staff: false },
    Hapus: { Owner: true, Admin: false, Staff: false },
  },
};

function getCategory(id) { return categories.find(function(c) { return c.id === id; }); }
function getSupplier(id) { return suppliers.find(function(s) { return s.id === id; }); }
function getWarehouse(id) { return warehouses.find(function(w) { return w.id === id; }); }
function getProduct(id) { return products.find(function(p) { return p.id === id; }); }
function getUser(id) { return users.find(function(u) { return u.id === id; }); }

function getProductsByWarehouse(warehouseId) {
  return products.filter(function(p) { return p.warehouseId === warehouseId; });
}

function getLowStockProducts() {
  return products.filter(function(p) { return p.status === 'Aktif' && p.stock < p.minStock; })
    .sort(function(a, b) { return (a.stock - a.minStock) - (b.stock - b.minStock); });
}

function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  var d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
}
