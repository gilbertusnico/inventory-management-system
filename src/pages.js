// ============================================
// INVENTARIS — Page Renderers
// ============================================
import { icon } from './icons.js';
import { products, categories, suppliers, warehouses, barangMasuk, barangKeluar, stockAdjustments, stockTransfers, users, permissions, productStocks, getProductStockRows, getCategory, getSupplier, getWarehouse, getProduct, getUser, getBarangMasuk, getBarangKeluar, getLowStockProducts, getProductsByWarehouse, getTotalStock, getAllProductStocks, getStockOpname, formatCurrency, formatDate, formatDateTime } from './data.js';
import { createBarChart, createDonutChart, createLineChart, getMonthlyMovement, getStockDistribution } from './charts.js';
import { getDateRange, inRange, filterByDate, getLatest, buildMonthlySeries, buildMutasiSeries, reportFilterBar } from './report-utils.js';
function getPage() { return window._currentPage || 1; }
function getSort() { return window._currentSort || { key: null, asc: true }; }
function getSearch() { return window._searchTerm || ''; }

// Search input snippet for report pages (inside the report filter bar)
function reportSearch() {
  const term = getSearch();
  return '<div class="search-bar" style="width:220px">' +
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
    '<input type="text" class="search-input" placeholder="Cari..." id="tableSearch" value="' + term + '" style="font-size:12px">' +
  '</div>';
}

// Active filter badge (shows current date range on the page)
function reportRangeBadge() {
  var range = getDateRange();
  if (!range.from && !range.to) return '';
  return '<div class="report-range-badge">' + icon('calendar', 12) +
    ' Periode: <strong>' + (range.from || 'awal') + '</strong> s/d <strong>' + (range.to || 'sekarang') + '</strong></div>';
}

// ======================
// UTILITY HELPERS
// ======================
function renderPagination(total, page, perPage = 10) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return '';
  let btns = '';
  btns += `<button class="pagination-btn" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      btns += `<button class="pagination-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (Math.abs(i - page) === 2) {
      btns += `<button class="pagination-btn" disabled>…</button>`;
    }
  }
  btns += `<button class="pagination-btn" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>›</button>`;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  return `<div class="pagination">
    <div class="pagination-info">Menampilkan ${start}-${end} dari ${total}</div>
    <div class="pagination-buttons">${btns}</div>
  </div>`;
}

function sortData(arr, key, asc) {
  return [...arr].sort((a, b) => {
    const va = a[key] ?? '';
    const vb = b[key] ?? '';
    if (typeof va === 'string') return asc ? va.localeCompare(vb) : vb.localeCompare(va);
    return asc ? va - vb : vb - va;
  });
}

// Default sort by created date descending
function sortByNewest(arr, dateKey = 'createdAt') {
  return [...arr].sort((a, b) => {
    const da = a[dateKey] || '';
    const db = b[dateKey] || '';
    return db.localeCompare(da);
  });
}

function filterData(arr, term, keys = ['name']) {
  if (!term) return arr;
  const t = term.toLowerCase();
  return arr.filter(item => keys.some(k => String(item[k] ?? '').toLowerCase().includes(t)));
}

function statusBadge(status) {
  if (status === 'Aktif' || status === 'Active') return '<span class="badge badge-success">' + status + '</span>';
  if (status === 'Nonaktif' || status === 'Inactive') return '<span class="badge badge-danger">' + status + '</span>';
  return '<span class="badge badge-neutral">' + status + '</span>';
}

function pageHeader(title, subtitle, actions = '') {
  return `<div class="page-header">
    <div><h1 class="page-title">${title}</h1>${subtitle ? '<p class="page-subtitle">' + subtitle + '</p>' : ''}</div>
    <div class="page-actions">${actions}</div>
  </div>`;
}

function filterBar(extra = '') {
  const term = getSearch();
  return `<div class="filter-bar">
    <div class="search-bar" style="width:200px">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" class="search-input" placeholder="Cari..." id="tableSearch" value="${term}" style="font-size:12px">
    </div>
    ${extra}
  </div>`;
}

function renderTable(data, columns, page = 1, perPage = 10) {
  const sort = getSort();
  const start = (page - 1) * perPage;
  const pageData = data.slice(start, start + perPage);
  let html = '<div class="table-container"><table><thead><tr>';
  columns.forEach(col => {
    const sortable = col.sortable ? ' class="sortable"' : '';
    const arrow = sort.key === col.key ? (sort.asc ? ' ▲' : ' ▼') : '';
    html += `<th${sortable} data-sort="${col.key}">${col.label}${arrow}</th>`;
  });
  html += '</tr></thead><tbody>';
  if (data.length === 0) {
    html += '<tr><td colspan="' + columns.length + '" class="report-empty">Belum ada data pada periode ini — coba ubah rentang tanggal atau tambahkan transaksi baru.</td></tr>';
  } else {
    pageData.forEach(row => {
      html += '<tr>';
      columns.forEach(col => {
        html += `<td>${col.render ? col.render(row) : row[col.key] ?? '-'}</td>`;
      });
      html += '</tr>';
    });
  }
  html += '</tbody></table></div>';
  html += renderPagination(data.length, page, perPage);
  return html;
}

// ======================
// PAGE RENDERERS
// ======================

// --- DASHBOARD ---
export function renderDashboard() {
  const lowStock = getLowStockProducts();
  const movement = getMonthlyMovement();
  const dist = getStockDistribution();
  const totalStock = productStocks.reduce(function(s, ps) { return s + ps.stock; }, 0);

  // Hitung data aktual untuk KPI change indicators
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 3);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const newProducts = products.filter(p => p.createdAt && p.createdAt >= cutoffStr).length;
  const newSuppliers = suppliers.filter(s => s.createdAt && s.createdAt >= cutoffStr).length;
  const activeWh = warehouses.filter(w => (w.status || 'Aktif') === 'Aktif').length;
  const inactiveWh = warehouses.length - activeWh;

  function changeUp(text) {
    return `<div class="kpi-card-change up">${icon('arrowUp', 14)} ${text}</div>`;
  }
  function changeDown(text) {
    return `<div class="kpi-card-change down">${icon('arrowDown', 14)} ${text}</div>`;
  }

  const whChange = inactiveWh === 0
    ? changeUp('Aktif semua')
    : changeDown(inactiveWh === warehouses.length ? 'Semua nonaktif' : inactiveWh + ' nonaktif');

  const content = `
    ${pageHeader('Dashboard', 'Ringkasan inventaris dan aktivitas terkini')}
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-card-icon blue">${icon('box')}</div>
        <div class="kpi-card-content">
          <div class="kpi-card-label">Total Produk</div>
          <div class="kpi-card-value">${products.length}</div>
          ${newProducts > 0 ? changeUp('+' + newProducts + ' produk baru') : ''}
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-icon green">${icon('truck')}</div>
        <div class="kpi-card-content">
          <div class="kpi-card-label">Total Supplier</div>
          <div class="kpi-card-value">${suppliers.length}</div>
          ${newSuppliers > 0 ? changeUp('+' + newSuppliers + ' supplier baru') : ''}
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-icon yellow">${icon('building')}</div>
        <div class="kpi-card-content">
          <div class="kpi-card-label">Total Gudang</div>
          <div class="kpi-card-value">${warehouses.length}</div>
          ${whChange}
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-icon purple">${icon('package')}</div>
        <div class="kpi-card-content">
          <div class="kpi-card-label">Total Stok</div>
          <div class="kpi-card-value">${totalStock}</div>
          <div class="kpi-card-change ${lowStock.length > 0 ? 'down' : 'up'}">${icon(lowStock.length > 0 ? 'arrowDown' : 'arrowUp', 14)} ${lowStock.length} produk di bawah min</div>
        </div>
      </div>
    </div>
    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Pergerakan Inventaris</div>
            <div class="card-subtitle">Barang Masuk & Keluar per Bulan</div>
          </div>
        </div>
        <div class="chart-container" id="chartMovement">
          <svg width="100%" height="260" viewBox="0 0 600 260"><text x="300" y="130" text-anchor="middle" fill="#999" font-size="13">Memuat grafik...</text></svg>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Stok Menipis</div>
            <div class="card-subtitle">${lowStock.length} produk di bawah stok minimum</div>
          </div>
        </div>
        <div class="alert-list">
          ${lowStock.length > 0 ? lowStock.slice(0, 6).map(p => `
            <div class="alert-item">
              <span class="alert-item-name">${p.name}</span> 
              <div><span class="alert-item-stock">${p.stock}</span> <span style="font-size:11px;color:#999">/ ${p.minStock}</span></div>
            </div>
          `).join('') : '<p style="text-align:center;padding:20px;color:#999">Semua stok aman ✅</p>'}
        </div>
      </div>
    </div>
    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Distribusi Stok per Gudang</div>
            <div class="card-subtitle">Total stok berdasarkan lokasi</div>
          </div>
        </div>
        <div class="chart-container" id="chartDistribution" style="height:200px">
          <svg width="100%" height="200" viewBox="0 0 500 200"><text x="250" y="100" text-anchor="middle" fill="#999" font-size="13">Memuat grafik...</text></svg>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Aktivitas Terbaru</div>
            <div class="card-subtitle">Transaksi barang masuk & keluar</div>
          </div>
        </div>
        <div class="activity-list">
          ${[].concat(
            barangMasuk.map(t => ({ ...t, _type: 'masuk', _label: 'Barang Masuk', _detail: t.items.length + ' item' })),
            barangKeluar.map(t => ({ ...t, _type: 'keluar', _label: 'Barang Keluar', _detail: t.penerima }))
          ).sort(function(a, b) {
            return (b.date || '').localeCompare(a.date || '');
          }).slice(0, 5).map(function(t) {
            var dotColor = t._type === 'masuk' ? 'green' : 'blue';
            return '<div class="activity-item">' +
              '<div class="activity-dot ' + dotColor + '"></div>' +
              '<div class="activity-content">' +
                '<div class="activity-text"><strong>' + t._label + '</strong> — ' + t._detail + ' (' + formatDate(t.date) + ')</div>' +
                '<div class="activity-time">' + (t.ref || 'No ref') + '</div>' +
              '</div>' +
            '</div>';
          }).join('') || '<p style="text-align:center;padding:20px;color:#999">Belum ada transaksi</p>'}
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const moveContainer = document.getElementById('chartMovement');
    const mw = moveContainer?.clientWidth || 600;
    createBarChartCustom('chartMovement', movement, mw);
    createDonutChart('chartDistribution', dist, { size: 180, strokeWidth: 32 });
  }, 50);

  return content;
}

function createBarChartCustom(containerId, movement, width) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!movement || !movement.length) movement = getMonthlyMovement();
  const height = 260;
  const pad = { top: 34, right: 20, bottom: 40, left: 50 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const maxVal = Math.max(...movement.flatMap(m => [m.masuk, m.keluar]), 1);
  const groupW = chartW / movement.length;
  const barW = Math.max(4, groupW * 0.3);

  let html = '';
  let gridLines = '';
  for (let i = 0; i < 5; i++) {
    const yVal = Math.round((maxVal / 4) * (4 - i));
    const y = pad.top + (chartH / 4) * i;
    gridLines += `<line x1="${pad.left}" y1="${y}" x2="${pad.left + chartW}" y2="${y}" stroke="#f0f0f0" stroke-width="1"/>`;
    gridLines += `<text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#999">${yVal}</text>`;
  }

  movement.forEach((m, i) => {
    const cx = pad.left + groupW * i + groupW / 2;
    const masukH = (m.masuk / maxVal) * chartH;
    const keluarH = (m.keluar / maxVal) * chartH;
    const x1 = cx - barW - 2;
    const x2 = cx + 2;
    html += `<rect x="${x1}" y="${pad.top + chartH - masukH}" width="${barW}" height="${masukH}" rx="2" fill="#1144F9" opacity="0.85">
      <title>Masuk: ${m.masuk}</title></rect>`;
    html += `<rect x="${x2}" y="${pad.top + chartH - keluarH}" width="${barW}" height="${keluarH}" rx="2" fill="#22c55e" opacity="0.85">
      <title>Keluar: ${m.keluar}</title></rect>`;
    html += `<text x="${cx}" y="${pad.top + chartH + 18}" text-anchor="middle" font-size="9" fill="#999">${m.label}</text>`;
  });

  html += `<line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top + chartH}" stroke="#e5e7eb" stroke-width="1"/>
    <line x1="${pad.left}" y1="${pad.top + chartH}" x2="${pad.left + chartW}" y2="${pad.top + chartH}" stroke="#e5e7eb" stroke-width="1"/>` +
    // Legend (top-right, compact boxes with text)
    `<rect x="${pad.left + chartW - 118}" y="4" width="12" height="12" rx="2" fill="#1144F9" opacity="0.85"/>
    <text x="${pad.left + chartW - 102}" y="14" font-size="10" fill="#666">Masuk</text>
    <rect x="${pad.left + chartW - 52}" y="4" width="12" height="12" rx="2" fill="#22c55e" opacity="0.85"/>
    <text x="${pad.left + chartW - 36}" y="14" font-size="10" fill="#666">Keluar</text>`;

  container.innerHTML = `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible">${gridLines}${html}</svg>`;
}

// --- PRODUK LIST (multi-warehouse rows) ---
export function renderProduk() {
  let data = getProductStockRows();
  data = filterData(data, getSearch(), ['name', 'sku']);
  const sort = getSort();
  if (sort.key) {
    data = sortData(data, sort.key, sort.asc);
  } else {
    data = sortByNewest(data);
  }

  const cols = [
    { label: 'SKU', key: 'sku', sortable: true, render: r => r.sku },
    { label: 'Nama Produk', key: 'name', sortable: true, render: r => `<strong>${r.name}</strong>` },
    { label: 'Kategori', key: 'categoryId', render: r => getCategory(r.categoryId)?.name || '-' },
    { label: 'Supplier', key: 'supplierId', render: r => getSupplier(r.supplierId)?.name || '-' },
    { label: 'Gudang', key: 'warehouseId', render: r => getWarehouse(r.warehouseId)?.name || '-' },
    { label: 'Harga', key: 'price', sortable: true, render: r => formatCurrency(r.price) },
    { label: 'Stok', key: 'stock', sortable: true, render: r => {
      var isLow = r.stock < r.minStock;
      return '<span style="font-weight:600;' + (isLow ? 'color:#ef4444' : '') + '">' + r.stock + '</span>';
    }},
    { label: 'Status', key: 'status', render: r => statusBadge(r.status) },
    { label: 'Aksi', key: null, render: r => '<div class="table-actions">' +
      '<button class="btn-icon-sm" data-action="edit-produk" data-id="' + r.id + '" title="Edit">' + icon('edit', 16) + '</button>' +
      '<button class="btn-icon-sm btn-icon-sm-danger" data-action="delete-produk" data-id="' + r.id + '" title="Hapus">' + icon('trash', 16) + '</button>' +
    '</div>' },
  ];

  return pageHeader('Produk', 'Kelola daftar produk dan inventaris', '<button class="btn btn-primary" data-action="add-produk">' + icon('plus', 16) + ' Tambah Produk</button>') +
    filterBar('<button class="btn btn-secondary btn-sm" data-action="export-btn">' + icon('download', 14) + ' Export</button>') +
    renderTable(data, cols, getPage());
}

// --- KATEGORI ---
export function renderKategori() {
  let data = filterData(categories, getSearch(), ['name']);
  const sort = getSort();
  if (sort.key) {
    data = sortData(data, sort.key, sort.asc);
  } else {
    data = sortByNewest(data);
  }
  const cols = [
    { label: 'Nama', key: 'name', sortable: true, render: r => `<strong>${r.name}</strong>` },
    { label: 'Deskripsi', key: 'description', render: r => r.description || '-' },
    { label: 'Jumlah Produk', key: 'count', render: r => r.count },
    { label: 'Aksi', key: null, render: r => `<div class="table-actions">
      <button class="btn-icon-sm" data-action="edit-kategori" data-id="${r.id}" title="Edit">${icon('edit', 16)}</button>
      <button class="btn-icon-sm btn-icon-sm-danger" data-action="delete-kategori" data-id="${r.id}" title="Hapus">${icon('trash', 16)}</button>
    </div>` },
  ];
  return pageHeader('Kategori', 'Kelola kategori produk', `<button class="btn btn-primary" data-action="add-kategori">${icon('plus', 16)} Tambah Kategori</button>`) +
    filterBar() + renderTable(data, cols, getPage());
}

// --- SUPPLIER ---
export function renderSupplier() {
  let data = filterData(suppliers, getSearch(), ['name', 'pic', 'email']);
  const sort = getSort();
  if (sort.key) {
    data = sortData(data, sort.key, sort.asc);
  } else {
    data = sortByNewest(data);
  }
  const cols = [
    { label: 'Nama', key: 'name', sortable: true, render: r => `<strong>${r.name}</strong>` },
    { label: 'PIC', key: 'pic', render: r => r.pic },
    { label: 'Email', key: 'email', render: r => r.email },
    { label: 'Telepon', key: 'phone', render: r => r.phone },
    { label: 'Aksi', key: null, render: r => `<div class="table-actions">
      <button class="btn-icon-sm" data-action="edit-supplier" data-id="${r.id}" title="Edit">${icon('edit', 16)}</button>
      <button class="btn-icon-sm btn-icon-sm-danger" data-action="delete-supplier" data-id="${r.id}" title="Hapus">${icon('trash', 16)}</button>
    </div>` },
  ];
  return pageHeader('Supplier', 'Kelola data supplier/vendor', `<button class="btn btn-primary" data-action="add-supplier">${icon('plus', 16)} Tambah Supplier</button>`) +
    filterBar() + renderTable(data, cols, getPage());
}

// --- GUDANG ---
export function renderGudang() {
  let data = filterData(warehouses, getSearch(), ['name', 'code', 'location']);
  const sort = getSort();
  if (sort.key) {
    data = sortData(data, sort.key, sort.asc);
  } else {
    data = sortByNewest(data);
  }
  const cols = [
    { label: 'Kode', key: 'code', sortable: true, render: r => '<span style="font-family:monospace;font-weight:600">' + r.code + '</span>' },
    { label: 'Nama', key: 'name', sortable: true, render: r => '<strong>' + r.name + '</strong>' },
    { label: 'Lokasi', key: 'location', render: r => r.location },
    { label: 'Status', key: 'status', render: r => statusBadge(r.status || 'Aktif') },
    { label: 'Jml Produk', key: 'count', sortable: true, render: r => '<span style="font-weight:600">' + r.count + '</span>' },
    { label: 'Total Stok', key: 'totalStock', sortable: true, render: r => '<span style="font-weight:600;color:#1144F9">' + (r.totalStock || 0) + '</span>' },
    { label: 'Aksi', key: null, render: r => '<div class="table-actions">' +
      '<button class="btn-icon-sm" data-action="edit-gudang" data-id="' + r.id + '" title="Edit">' + icon('edit', 16) + '</button>' +
      '<button class="btn-icon-sm btn-icon-sm-danger" data-action="delete-gudang" data-id="' + r.id + '" title="Hapus">' + icon('trash', 16) + '</button>' +
    '</div>' },
  ];
  return pageHeader('Gudang', 'Kelola lokasi gudang dan penyimpanan', '<button class="btn btn-primary" data-action="add-gudang">' + icon('plus', 16) + ' Tambah Gudang</button>') +
    filterBar() + renderTable(data, cols, getPage());
}

// --- BARANG MASUK ---
export function renderBarangMasuk() {
  let data = [...barangMasuk];
  const sort = getSort();
  if (sort.key) {
    data = sortData(data, sort.key, sort.asc);
  } else {
    data = sortByNewest(data, 'date');
  }

  const cols = [
    { label: 'Tanggal', key: 'date', sortable: true, render: r => formatDate(r.date) },
    { label: 'Supplier', key: 'supplierId', render: r => getSupplier(r.supplierId)?.name || '-' },
    { label: 'Gudang', key: 'warehouseId', render: r => getWarehouse(r.warehouseId)?.name || '-' },
    { label: 'Referensi', key: 'ref', render: r => '<span style="font-family:monospace">' + (r.ref || '-') + '</span>' },
    { label: 'Item', key: 'items', render: r => r.items.reduce(function(s, i) { return s + i.qty; }, 0) + ' item' },
    { label: 'Catatan', key: 'note', render: r => r.note || '-' },
    { label: 'Aksi', key: null, render: r => '<div class="table-actions"><button class="btn-icon-sm" data-action="detail-bm" data-id="' + r.id + '" title="Detail">' + icon('box', 16) + '</button><button class="btn-icon-sm btn-icon-sm-danger" data-action="delete-bm" data-id="' + r.id + '" title="Hapus">' + icon('trash', 16) + '</button></div>' },
  ];
  return pageHeader('Barang Masuk', 'Catat penerimaan barang dari supplier', '<button class="btn btn-primary" data-action="add-bm">' + icon('plus', 16) + ' Barang Masuk Baru</button>') +
    filterBar() + renderTable(data, cols, getPage());
}

// --- BARANG KELUAR ---
export function renderBarangKeluar() {
  let data = [...barangKeluar];
  const sort = getSort();
  if (sort.key) {
    data = sortData(data, sort.key, sort.asc);
  } else {
    data = sortByNewest(data, 'date');
  }

  const cols = [
    { label: 'Tanggal', key: 'date', sortable: true, render: r => formatDate(r.date) },
    { label: 'Penerima', key: 'penerima', render: r => r.penerima },
    { label: 'Gudang', key: 'warehouseId', render: r => getWarehouse(r.warehouseId)?.name || '-' },
    { label: 'Referensi', key: 'ref', render: r => '<span style="font-family:monospace">' + (r.ref || '-') + '</span>' },
    { label: 'Item', key: 'items', render: r => r.items.reduce(function(s, i) { return s + i.qty; }, 0) + ' item' },
    { label: 'Catatan', key: 'note', render: r => r.note || '-' },
    { label: 'Aksi', key: null, render: r => '<div class="table-actions"><button class="btn-icon-sm" data-action="detail-bk" data-id="' + r.id + '" title="Detail">' + icon('box', 16) + '</button><button class="btn-icon-sm btn-icon-sm-danger" data-action="delete-bk" data-id="' + r.id + '" title="Hapus">' + icon('trash', 16) + '</button></div>' },
  ];
  return pageHeader('Barang Keluar', 'Catat pengeluaran barang', '<button class="btn btn-primary" data-action="add-bk">' + icon('plus', 16) + ' Barang Keluar Baru</button>') +
    filterBar() + renderTable(data, cols, getPage());
}

// --- STOCK ADJUSTMENT ---
export function renderStockAdjustment() {
  let data = [...stockAdjustments];
  const sort = getSort();
  if (sort.key) {
    data = sortData(data, sort.key, sort.asc);
  } else {
    data = sortByNewest(data, 'date');
  }

  const cols = [
    { label: 'Tanggal', key: 'date', sortable: true, render: r => formatDate(r.date) },
    { label: 'Produk', key: 'productId', render: r => getProduct(r.productId)?.name || '-' },
    { label: 'Gudang', key: 'warehouseId', render: r => getWarehouse(r.warehouseId)?.name || '-' },
    { label: 'Stok Sistem', key: 'sistem', render: r => r.sistem },
    { label: 'Stok Fisik', key: 'fisik', render: r => r.fisik },
    { label: 'Selisih', key: 'selisih', render: r => '<span style="font-weight:600;color:' + (r.selisih < 0 ? '#ef4444' : '#22c55e') + '">' + (r.selisih > 0 ? '+' : '') + r.selisih + '</span>' },
    { label: 'Alasan', key: 'alasan', render: r => r.alasan },
    { label: 'Aksi', key: null, render: r => '<div class="table-actions"><button class="btn-icon-sm btn-icon-sm-danger" data-action="delete-sa" data-id="' + r.id + '" title="Hapus">' + icon('trash', 16) + '</button></div>' },
  ];
  return pageHeader('Stock Adjustment', 'Koreksi stok karena rusak, hilang, atau kadaluarsa', `<button class="btn btn-primary" data-action="add-sa">${icon('plus', 16)} Adjustment Baru</button>`) +
    filterBar() + renderTable(data, cols, getPage());
}

// --- STOCK TRANSFER ---
export function renderStockTransfer() {
  let data = [...stockTransfers];
  const sort = getSort();
  if (sort.key) {
    data = sortData(data, sort.key, sort.asc);
  } else {
    data = sortByNewest(data, 'date');
  }

  const cols = [
    { label: 'Tanggal', key: 'date', sortable: true, render: r => formatDate(r.date) },
    { label: 'Dari Gudang', key: 'fromWarehouseId', render: r => getWarehouse(r.fromWarehouseId)?.name || '-' },
    { label: 'Ke Gudang', key: 'toWarehouseId', render: r => getWarehouse(r.toWarehouseId)?.name || '-' },
    { label: 'Referensi', key: 'ref', render: r => '<span style="font-family:monospace">' + (r.ref || '-') + '</span>' },
    { label: 'Item', key: 'items', render: r => r.items.reduce(function(s, i) { return s + i.qty; }, 0) + ' item' },
    { label: 'Aksi', key: null, render: r => '<div class="table-actions"><button class="btn-icon-sm" data-action="detail-st" data-id="' + r.id + '" title="Detail">' + icon('eye', 16) + '</button><button class="btn-icon-sm btn-icon-sm-danger" data-action="delete-st" data-id="' + r.id + '" title="Hapus">' + icon('trash', 16) + '</button></div>' },
  ];
  return pageHeader('Transfer Stok', 'Pindahkan stok antar gudang', '<button class="btn btn-primary" data-action="add-st">' + icon('plus', 16) + ' Transfer Baru</button>') +
    filterBar() + renderTable(data, cols, getPage());
}

// --- STOCK OPNAME ---
export function renderStockOpname() {
  let opnameData = getStockOpname();
  const search = getSearch();
  if (search) {
    const t = search.toLowerCase();
    opnameData = opnameData.filter(x =>
      (getProduct(x.productId)?.name || '').toLowerCase().includes(t) ||
      (getWarehouse(x.warehouseId)?.name || '').toLowerCase().includes(t)
    );
  }
  const totalItems = opnameData.length;
  const sesuai = opnameData.filter(s => s.sistem === s.fisik).length;
  const tidakSesuai = opnameData.filter(s => s.sistem !== s.fisik).length;
  const totalSelisih = opnameData.reduce((s, o) => s + Math.abs(o.sistem - o.fisik), 0);

  const cols = [
    { label: 'Produk', key: 'productId', render: r => getProduct(r.productId)?.name || '-' },
    { label: 'Gudang', key: 'warehouseId', render: r => getWarehouse(r.warehouseId)?.name || '-' },
    { label: 'Stok Sistem', key: 'sistem', render: r => r.sistem },
    { label: 'Stok Fisik', key: 'fisik', render: r => r.fisik },
    { label: 'Selisih', key: null, render: r => {
      const diff = r.fisik - r.sistem;
      if (diff === 0) return `<span style="color:#22c55e;font-weight:600">0</span>`;
      return `<span style="color:${diff < 0 ? '#ef4444' : '#f59e0b'};font-weight:600">${diff > 0 ? '+' : ''}${diff}</span>`;
    }},
    { label: 'Status', key: null, render: r => r.sistem === r.fisik
      ? '<span class="badge badge-success">✓ Sesuai</span>'
      : '<span class="badge badge-warning">⚠ Tidak Sesuai</span>' },
  ];

  return pageHeader('Stock Opname', 'Pencocokan stok fisik dengan sistem') +
    `<div class="summary-cards">
      <div class="summary-card">
        <div class="summary-card-label">Total Item</div>
        <div class="summary-card-value">${totalItems}</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Stok Sesuai</div>
        <div class="summary-card-value" style="color:#22c55e">${sesuai}</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Stok Tidak Sesuai</div>
        <div class="summary-card-value" style="color:#f59e0b">${tidakSesuai}</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Total Selisih</div>
        <div class="summary-card-value" style="color:#ef4444">${totalSelisih}</div>
      </div>
    </div>` +
    filterBar() + renderTable(opnameData, cols, getPage());
}

// --- REPORTS ---
export function renderReportStok() {
  const range = getDateRange();
  let data = getProductStockRows();
  // Date range filter: produk yang terdaftar dalam periode
  if (range.from || range.to) {
    data = data.filter(r => inRange(r.createdAt, range.from, range.to));
  }
  const search = getSearch();
  if (search) data = filterData(data, search, ['name', 'sku']);
  const sort = getSort();
  if (sort.key) {
    data = sortData(data, sort.key, sort.asc);
  } else {
    data = sortByNewest(data);
  }
  var totalValue = 0;
  var totalItems = 0;
  for (var i = 0; i < data.length; i++) {
    totalItems += data[i].stock;
    totalValue += data[i].stock * data[i].price;
  }

  const cols = [
    { label: 'SKU', key: 'sku', render: r => '<span style="font-family:monospace">' + r.sku + '</span>' },
    { label: 'Produk', key: 'name', sortable: true, render: r => '<strong>' + r.name + '</strong>' },
    { label: 'Kategori', key: 'categoryId', render: r => getCategory(r.categoryId)?.name || '-' },
    { label: 'Gudang', key: 'warehouseId', render: r => getWarehouse(r.warehouseId)?.name || '-' },
    { label: 'Stok', key: 'stock', sortable: true, render: r => r.stock },
    { label: 'Harga', key: 'price', render: r => formatCurrency(r.price) },
    { label: 'Total Nilai', key: null, render: r => formatCurrency(r.stock * r.price) },
  ];

  return pageHeader('Laporan Stok Saat Ini', 'Ringkasan stok dan nilai inventaris') +
    reportFilterBar('stok', reportSearch()) +
    reportRangeBadge() +
    '<div class="summary-cards">' +
      '<div class="summary-card"><div class="summary-card-label">Total Produk (SKU)</div><div class="summary-card-value">' + products.length + '</div></div>' +
      '<div class="summary-card"><div class="summary-card-label">Total Item</div><div class="summary-card-value">' + totalItems + '</div></div>' +
      '<div class="summary-card"><div class="summary-card-label">Total Nilai</div><div class="summary-card-value">' + formatCurrency(totalValue) + '</div></div>' +
    '</div>' +
    '<div class="report-table-card">' + renderTable(data, cols, getPage()) + '</div>';
}

export function renderReportMasuk() {
  let data = filterByDate(barangMasuk);
  const totalQty = data.reduce((s, t) => s + t.items.reduce((si, i) => si + i.qty, 0), 0);
  const latest = getLatest(data)[0];
  const latestQty = latest ? latest.items.reduce((s, i) => s + i.qty, 0) : 0;
  // Grafik dari data aktual yang sudah difilter
  const chartData = buildMonthlySeries(data, t => t.items.reduce((s, i) => s + i.qty, 0));

  // Search memfilter tabel detail saja
  const search = getSearch();
  let tableData = data;
  if (search) {
    const t = search.toLowerCase();
    tableData = data.filter(x =>
      (getSupplier(x.supplierId)?.name || '').toLowerCase().includes(t) ||
      (getWarehouse(x.warehouseId)?.name || '').toLowerCase().includes(t) ||
      (x.ref || '').toLowerCase().includes(t) ||
      (x.note || '').toLowerCase().includes(t)
    );
  }

  const cols = [
    { label: 'Tanggal', key: 'date', sortable: true, render: r => formatDate(r.date) },
    { label: 'Supplier', key: 'supplierId', render: r => getSupplier(r.supplierId)?.name || '-' },
    { label: 'Gudang', key: 'warehouseId', render: r => getWarehouse(r.warehouseId)?.name || '-' },
    { label: 'Referensi', key: 'ref', render: r => '<span style="font-family:monospace">' + (r.ref || '-') + '</span>' },
    { label: 'Item', key: 'items', render: r => r.items.reduce(function(s, i) { return s + i.qty; }, 0) + ' item' },
    { label: 'Catatan', key: 'note', render: r => r.note || '-' },
  ];
  const sorted = [...tableData].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const content = `
    ${pageHeader('Laporan Barang Masuk', 'Grafik dan data penerimaan barang')}
    ${reportFilterBar('masuk', reportSearch())}
    ${reportRangeBadge()}
    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-card-label">Total Penerimaan</div>
        <div class="summary-card-value">${totalQty} item</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Total Transaksi</div>
        <div class="summary-card-value">${data.length} transaksi</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Penerimaan Terakhir</div>
        <div class="summary-card-value">${latest ? latestQty + ' item' : '0 item'}</div>
        <div style="font-size:11px;color:#999;margin-top:2px">${latest ? formatDate(latest.date) : '-'}</div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Grafik Barang Masuk per Bulan</div></div>
      <div class="chart-container" id="reportChart"><svg width="100%" height="260" viewBox="0 0 600 260"><text x="300" y="130" text-anchor="middle" fill="#999" font-size="13">Memuat grafik...</text></svg></div>
    </div>
    <div class="report-table-card">${renderTable(sorted, cols, getPage())}</div>
  `;
  setTimeout(() => createBarChart('reportChart', chartData, { barColor: '#22c55e', height: 260 }), 50);
  return content;
}

export function renderReportKeluar() {
  let data = filterByDate(barangKeluar);
  const totalQty = data.reduce((s, t) => s + t.items.reduce((si, i) => si + i.qty, 0), 0);
  const latest = getLatest(data)[0];
  const latestQty = latest ? latest.items.reduce((s, i) => s + i.qty, 0) : 0;
  const chartData = buildMonthlySeries(data, t => t.items.reduce((s, i) => s + i.qty, 0));

  const search = getSearch();
  let tableData = data;
  if (search) {
    const t = search.toLowerCase();
    tableData = data.filter(x =>
      x.penerima.toLowerCase().includes(t) ||
      (getWarehouse(x.warehouseId)?.name || '').toLowerCase().includes(t) ||
      (x.ref || '').toLowerCase().includes(t) ||
      (x.note || '').toLowerCase().includes(t)
    );
  }

  const cols = [
    { label: 'Tanggal', key: 'date', sortable: true, render: r => formatDate(r.date) },
    { label: 'Penerima', key: 'penerima', render: r => r.penerima },
    { label: 'Gudang', key: 'warehouseId', render: r => getWarehouse(r.warehouseId)?.name || '-' },
    { label: 'Referensi', key: 'ref', render: r => '<span style="font-family:monospace">' + (r.ref || '-') + '</span>' },
    { label: 'Item', key: 'items', render: r => r.items.reduce(function(s, i) { return s + i.qty; }, 0) + ' item' },
    { label: 'Catatan', key: 'note', render: r => r.note || '-' },
  ];
  const sorted = [...tableData].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const content = `
    ${pageHeader('Laporan Barang Keluar', 'Grafik dan data pengeluaran barang')}
    ${reportFilterBar('keluar', reportSearch())}
    ${reportRangeBadge()}
    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-card-label">Total Pengeluaran</div>
        <div class="summary-card-value">${totalQty} item</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Total Transaksi</div>
        <div class="summary-card-value">${data.length} transaksi</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Pengeluaran Terakhir</div>
        <div class="summary-card-value">${latest ? latestQty + ' item' : '0 item'}</div>
        <div style="font-size:11px;color:#999;margin-top:2px">${latest ? formatDate(latest.date) : '-'}</div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Grafik Barang Keluar per Bulan</div></div>
      <div class="chart-container" id="reportChart"><svg width="100%" height="260" viewBox="0 0 600 260"><text x="300" y="130" text-anchor="middle" fill="#999" font-size="13">Memuat grafik...</text></svg></div>
    </div>
    <div class="report-table-card">${renderTable(sorted, cols, getPage())}</div>
  `;
  setTimeout(() => createBarChart('reportChart', chartData, { barColor: '#f59e0b', height: 260 }), 50);
  return content;
}

export function renderReportMutasi() {
  const masukData = filterByDate(barangMasuk);
  const keluarData = filterByDate(barangKeluar);
  const totalMasuk = masukData.reduce((s, t) => s + t.items.reduce((si, i) => si + i.qty, 0), 0);
  const totalKeluar = keluarData.reduce((s, t) => s + t.items.reduce((si, i) => si + i.qty, 0), 0);
  const selisih = totalMasuk - totalKeluar;
  const series = buildMutasiSeries(masukData, keluarData);

  const cols = [
    { label: 'Bulan', key: 'label', render: r => '<strong>' + r.label + '</strong>' },
    { label: 'Barang Masuk', key: 'masuk', sortable: true, render: r => r.masuk + ' item' },
    { label: 'Barang Keluar', key: 'keluar', sortable: true, render: r => r.keluar + ' item' },
    { label: 'Selisih', key: 'selisih', sortable: true, render: r => {
      const d = r.masuk - r.keluar;
      return '<span style="font-weight:600;color:' + (d < 0 ? '#ef4444' : '#22c55e') + '">' + (d >= 0 ? '+' : '') + d + '</span>';
    }},
  ];
  const rows = series.map(s => ({ label: s.label, masuk: s.masuk, keluar: s.keluar, selisih: s.masuk - s.keluar }));

  const content = `
    ${pageHeader('Laporan Mutasi Stok', 'Perbandingan barang masuk dan keluar')}
    ${reportFilterBar('mutasi', '')}
    ${reportRangeBadge()}
    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-card-label">Total Barang Masuk</div>
        <div class="summary-card-value" style="color:#22c55e">${totalMasuk}</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Total Barang Keluar</div>
        <div class="summary-card-value" style="color:#f59e0b">${totalKeluar}</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Selisih</div>
        <div class="summary-card-value" style="color:${selisih >= 0 ? '#22c55e' : '#ef4444'}">${selisih >= 0 ? '+' : ''}${selisih}</div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Perbandingan Bulanan</div></div>
      <div class="chart-container" id="mutasiChart"><svg width="100%" height="280" viewBox="0 0 600 280"><text x="300" y="140" text-anchor="middle" fill="#999" font-size="13">Memuat grafik...</text></svg></div>
    </div>
    <div class="report-table-card">${renderTable(rows, cols, getPage())}</div>
  `;
  setTimeout(() => {
    const mw = document.getElementById('mutasiChart')?.clientWidth || 600;
    createBarChartCustom('mutasiChart', series, mw);
  }, 50);
  return content;
}

export function renderUsers() {
  let data = filterData(users, getSearch(), ['name', 'email']);
  const sort = getSort();
  if (sort.key) {
    data = sortData(data, sort.key, sort.asc);
  } else {
    data = sortByNewest(data);
  }
  const cols = [
    { label: 'Nama', key: 'name', sortable: true, render: r => `<div style="display:flex;align-items:center;gap:8px">
      <div style="width:28px;height:28px;border-radius:6px;background:#1144F9;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0">${r.name.charAt(0)}</div>
      <div><strong>${r.name}</strong></div>
    </div>` },
    { label: 'Email', key: 'email', render: r => r.email },
    { label: 'Role', key: 'role', render: r => {
      if (r.role === 'Owner') return '<span class="badge badge-info">Owner</span>';
      if (r.role === 'Admin') return '<span class="badge badge-warning">Admin</span>';
      return '<span class="badge badge-neutral">Staff</span>';
    }},
    { label: 'Status', key: 'status', render: r => statusBadge(r.status) },
    { label: 'Last Login', key: 'lastLogin', render: r => formatDate(r.lastLogin) },
    { label: 'Aksi', key: null, render: r => `<div class="table-actions">
      <button class="btn-icon-sm" data-action="edit-user" data-id="${r.id}" title="Edit">${icon('edit', 16)}</button>
      <button class="btn-icon-sm btn-icon-sm-danger" data-action="delete-user" data-id="${r.id}" title="Hapus">${icon('trash', 16)}</button>
    </div>` },
  ];
  return pageHeader('Users', 'Kelola pengguna sistem', `<button class="btn btn-primary" data-action="add-user">${icon('plus', 16)} Tambah User</button>`) +
    filterBar() + renderTable(data, cols, getPage());
}
export function renderRoles() {
  const roles = ['Owner', 'Admin', 'Staff'];
  let html = `<div class="page-header">
    <div>
      <h1 class="page-title">Roles & Permissions</h1>
      <p class="page-subtitle">Atur hak akses setiap role pada modul sistem</p>
    </div>
  </div>
  <div class="card">
    <table class="perm-table">
      <thead>
        <tr>
          <th>Permission</th>
          ${roles.map(r => `<th class="role-${r.toLowerCase()}">${r}</th>`).join('')}
        </tr>
      </thead>
      <tbody>`;

  Object.entries(permissions).forEach(([module, actions]) => {
    html += `<tr class="perm-group"><td colspan="${roles.length + 1}">${module}</td></tr>`;
    Object.entries(actions).forEach(([action, roleMap]) => {
      html += `<tr><td>${action}</td>`;
      roles.forEach(role => {
        html += `<td>${roleMap[role] ? '<span class="perm-check">✓</span>' : '<span class="perm-dash">—</span>'}</td>`;
      });
      html += `</tr>`;
    });
  });

  html += '</tbody></table></div>';
  return html;
}

// ======================
// MODAL BUILDERS
// ======================
export function showModal(title, body, footer = '', wide = false) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.innerHTML = `<div class="modal ${wide ? 'modal-wide' : ''}">
    <div class="modal-header">
      <div class="modal-title">${title}</div>
      <button class="modal-close" id="modalClose">${icon('x', 18)}</button>
    </div>
    <div class="modal-body">${body}</div>
    ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
  </div>`;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.body.appendChild(overlay);
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
}

export function closeModal() {
  document.querySelector('.modal-overlay')?.remove();
}

export function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: icon('check', 18), error: icon('x', 18), info: icon('alertTriangle', 18) };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-message">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 200ms ease forwards';
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

// Make modal helpers globally accessible for inline onclick handlers
window.closeModal = closeModal;
window.showToast = showToast;
