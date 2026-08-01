// ============================================
// INVENTARIS — Configuration & Constants
// ============================================

export const APP_NAME = 'Inventaris';
export const ITEMS_PER_PAGE = 10;

export const ROUTES = {
  DASHBOARD: '#/dashboard',
  // Master Data
  PRODUK: '#/master-data/produk',
  KATEGORI: '#/master-data/kategori',
  SUPPLIER: '#/master-data/supplier',
  GUDANG: '#/master-data/gudang',
  // Inventory
  BARANG_MASUK: '#/inventory/barang-masuk',
  BARANG_KELUAR: '#/inventory/barang-keluar',
  STOCK_ADJ: '#/inventory/stock-adjustment',
  STOCK_TRANSFER: '#/inventory/stock-transfer',
  // Stock Opname
  STOCK_OPNAME: '#/stock-opname',
  // Reports
  REPORTS_STOK: '#/reports/stok-saat-ini',
  REPORTS_MASUK: '#/reports/barang-masuk',
  REPORTS_KELUAR: '#/reports/barang-keluar',
  REPORTS_MUTASI: '#/reports/mutasi-stok',
  // Users
  USERS: '#/users',
  ROLES: '#/roles',
};

export const ROUTE_LABELS = {
  '#/dashboard': { label: 'Dashboard', group: 'Dashboard' },
  '#/master-data/produk': { label: 'Produk', group: 'Master Data' },
  '#/master-data/kategori': { label: 'Kategori', group: 'Master Data' },
  '#/master-data/supplier': { label: 'Supplier', group: 'Master Data' },
  '#/master-data/gudang': { label: 'Gudang', group: 'Master Data' },
  '#/inventory/barang-masuk': { label: 'Barang Masuk', group: 'Inventory' },
  '#/inventory/barang-keluar': { label: 'Barang Keluar', group: 'Inventory' },
  '#/inventory/stock-adjustment': { label: 'Stock Adjustment', group: 'Inventory' },
  '#/inventory/stock-transfer': { label: 'Transfer Stok', group: 'Inventory' },
  '#/stock-opname': { label: 'Stock Opname', group: 'Stock Opname' },
  '#/reports/stok-saat-ini': { label: 'Stok Saat Ini', group: 'Laporan' },
  '#/reports/barang-masuk': { label: 'Laporan Barang Masuk', group: 'Laporan' },
  '#/reports/barang-keluar': { label: 'Laporan Barang Keluar', group: 'Laporan' },
  '#/reports/mutasi-stok': { label: 'Mutasi Stok', group: 'Laporan' },
  '#/users': { label: 'Users', group: 'Pengaturan' },
  '#/roles': { label: 'Roles & Permissions', group: 'Pengaturan' },
};

export const NAV_GROUPS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'master-data', label: 'Master Data', icon: 'database' },
  { id: 'inventory', label: 'Inventory', icon: 'package' },
  { id: 'stock-opname', label: 'Stock Opname', icon: 'clipboard' },
  { id: 'reports', label: 'Laporan', icon: 'chart' },
  // Menu Pengaturan (Users & Roles) disembunyikan dari sidebar — aktifkan kembali dengan menghapus komentar baris ini
  // { id: 'users', label: 'Pengaturan', icon: 'users' },
];
