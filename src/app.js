// ============================================
// INVENTARIS — Main Application Entry
// ============================================
import { icon } from './icons.js';
import { products, categories, suppliers, warehouses, barangMasuk, barangKeluar, stockAdjustments, stockTransfers, users, getCategory, getSupplier, getWarehouse, getProduct, getBarangMasuk, getBarangKeluar, updateCounts } from './data.js';
import { ROUTE_LABELS, NAV_GROUPS } from './config.js';
import { renderDashboard, renderProduk, renderKategori, renderSupplier, renderGudang, renderBarangMasuk, renderBarangKeluar, renderStockAdjustment, renderStockTransfer, renderStockOpname, renderReportStok, renderReportMasuk, renderReportKeluar, renderReportMutasi, renderUsers, renderRoles, showModal, closeModal, showToast } from './pages.js';
import { handleAddMaster, handleAddBarangMasuk, handleAddBarangKeluar, handleAddStockAdjustment, handleAddStockTransfer, handleAddUser, handleAddKategori, handleAddSupplier, handleAddGudang, handleEdit, handleDelete, handleDetail } from './handlers.js';

// ======================
// BUILD APP LAYOUT
// ======================
function buildLayout() {
  const root = document.getElementById('root');
  if (!root) return;
  const sidebarGroups = NAV_GROUPS.map(function(group) {
    // Dashboard & Stock Opname — direct nav items (no accordion)
    if (group.id === 'dashboard' || group.id === 'stock-opname') {
      var route = group.id === 'dashboard' ? '#/dashboard' : '#/stock-opname';
      return '<a class="nav-item" href="' + route + '" data-route="' + route + '" style="display:flex;align-items:center;gap:10px;padding:8px 10px;margin:1px 0;border-radius:6px;font-size:13px;font-weight:400;color:#8a8b91;white-space:nowrap">' + icon(group.icon) + '<span>' + group.label + '</span></a>';
    }
    return '<div class="nav-group' + (group.id === 'master-data' ? ' expanded' : '') + '">' +
      '<div class="nav-group-header" data-group="' + group.id + '">' +
        icon(group.icon) +
        '<span class="nav-group-label">' + group.label + '</span>' +
        '<svg class="nav-group-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>' +
      '</div>' +
      '<div class="nav-group-items"' + (group.id === 'master-data' ? ' style="max-height:500px"' : '') + '">' +
        getNavItems(group.id) +
      '</div>' +
    '</div>';
  }).join('');

  root.innerHTML = '<div class="app">' +
    '<aside class="sidebar" id="sidebar">' +
      '<div class="sidebar-header">' +
        '<div class="sidebar-logo">' +
          '<svg class="sidebar-logo-icon" viewBox="0 0 32 32" fill="none"><rect x="2" y="2" width="28" height="28" rx="8" fill="#1144F9"/><path d="M10 16h12M16 10v12" stroke="white" stroke-width="2.5" stroke-linecap="round"/><path d="M8 22V10a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H10a2 2 0 01-2-2z" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.1)"/></svg>' +
          '<span class="sidebar-logo-text">Inventaris</span>' +
        '</div>' +
        '<button class="sidebar-close-btn" id="sidebarClose" aria-label="Close sidebar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
      '</div>' +
      '<nav class="sidebar-nav" id="sidebarNav">' + sidebarGroups + '</nav>' +
      '<div class="sidebar-footer">' +
        '<div class="sidebar-user"><div class="sidebar-user-avatar">A</div><div class="sidebar-user-info"><div class="sidebar-user-name">Admin User</div><div class="sidebar-user-role">Owner</div></div></div>' +
      '</div>' +
    '</aside>' +
    '<div class="sidebar-overlay" id="sidebarOverlay"></div>' +
    '<div class="main">' +
      '<header class="top-header" id="topHeader">' +
        '<div class="breadcrumb" id="breadcrumb">' +
          '<button class="menu-toggle-btn" id="menuToggle" aria-label="Open menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>' +
          '<span class="breadcrumb-item">Dashboard</span>' +
        '</div>' +
      '</header>' +
      '<main class="page-content" id="pageContent"></main>' +
    '</div>' +
  '</div>' +
  '<div class="toast-container" id="toastContainer"></div>';
}

function getNavItems(groupId) {
  var map = {
    'master-data': [
      { route: '#/master-data/produk', label: 'Produk' },
      { route: '#/master-data/kategori', label: 'Kategori' },
      { route: '#/master-data/supplier', label: 'Supplier' },
      { route: '#/master-data/gudang', label: 'Gudang' },
    ],
    'inventory': [
      { route: '#/inventory/barang-masuk', label: 'Barang Masuk' },
      { route: '#/inventory/barang-keluar', label: 'Barang Keluar' },
      { route: '#/inventory/stock-adjustment', label: 'Stock Adj.' },
      { route: '#/inventory/stock-transfer', label: 'Transfer Stok' },
    ],
    'reports': [
      { route: '#/reports/stok-saat-ini', label: 'Stok Saat Ini' },
      { route: '#/reports/barang-masuk', label: 'Barang Masuk' },
      { route: '#/reports/barang-keluar', label: 'Barang Keluar' },
      { route: '#/reports/mutasi-stok', label: 'Mutasi Stok' },
    ],
    'users': [
      { route: '#/users', label: 'Users' },
      { route: '#/roles', label: 'Roles & Permissions' },
    ],
  };
  var items = map[groupId] || [];
  return items.map(function(item) {
    return '<a class="nav-item" href="' + item.route + '" data-route="' + item.route + '">' + item.label + '</a>';
  }).join('');
}

// ======================
// ROUTER
// ======================
function navigate(route) {
  if (!route || route === '#') route = '#/dashboard';
  // Reset pagination, sort, and search on navigation
  window._currentPage = 1;
  window._currentSort = { key: null, asc: true };
  window._searchTerm = '';
  window.location.hash = route;
}

function getCurrentRoute() {
  return (window.location.hash || '#/dashboard').split('?')[0];
}

function renderPage(route) {
  var pageContent = document.getElementById('pageContent');
  if (!pageContent) return;

  var cleanRoute = route.split('?')[0];

  // Update active nav
  document.querySelectorAll('.nav-item').forEach(function(el) {
    el.classList.toggle('active', el.dataset.route === cleanRoute);
  });

  // Update breadcrumb
  updateBreadcrumb(cleanRoute);

  // Update dynamic counts (category & warehouse product counts)
  updateCounts();

  // Render correct page
  var html = '';
  switch (cleanRoute) {
    case '#/dashboard': html = renderDashboard(); break;
    case '#/master-data/produk': html = renderProduk(); break;
    case '#/master-data/kategori': html = renderKategori(); break;
    case '#/master-data/supplier': html = renderSupplier(); break;
    case '#/master-data/gudang': html = renderGudang(); break;
    case '#/inventory/barang-masuk': html = renderBarangMasuk(); break;
    case '#/inventory/barang-keluar': html = renderBarangKeluar(); break;
    case '#/inventory/stock-adjustment': html = renderStockAdjustment(); break;
    case '#/inventory/stock-transfer': html = renderStockTransfer(); break;
    case '#/stock-opname': html = renderStockOpname(); break;
    case '#/reports/stok-saat-ini': html = renderReportStok(); break;
    case '#/reports/barang-masuk': html = renderReportMasuk(); break;
    case '#/reports/barang-keluar': html = renderReportKeluar(); break;
    case '#/reports/mutasi-stok': html = renderReportMutasi(); break;
    case '#/users': html = renderUsers(); break;
    case '#/roles': html = renderRoles(); break;
    default: html = renderDashboard();
  }
  pageContent.innerHTML = html;
}

function updateBreadcrumb(route) {
  var info = ROUTE_LABELS[route];
  var breadcrumb = document.getElementById('breadcrumb');
  if (!breadcrumb) return;
  var toggleBtn = breadcrumb.querySelector('.menu-toggle-btn');
  var menuBtn = toggleBtn ? toggleBtn.outerHTML : '<button class="menu-toggle-btn" id="menuToggle" aria-label="Open menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>';
  if (info) {
    var crumbs = info.group === info.label
      ? '<span class="breadcrumb-item">' + info.label + '</span>'
      : '<span class="breadcrumb-item">' + info.group + '</span><span class="breadcrumb-item">' + info.label + '</span>';
    breadcrumb.innerHTML = menuBtn + crumbs;
  } else {
    breadcrumb.innerHTML = menuBtn + route.replace('#/', '').split('/').map(function(p) {
      return '<span class="breadcrumb-item">' + p.charAt(0).toUpperCase() + p.slice(1) + '</span>';
    }).join('');
  }
}

function setupEvents() {
  var app = document.getElementById('root');

  // Nav group toggle
  app.addEventListener('click', function(e) {
    var header = e.target.closest('.nav-group-header');
    if (header) {
      var group = header.closest('.nav-group');
      if (group) {
        group.classList.toggle('expanded');
        var items = group.querySelector('.nav-group-items');
        if (items) items.style.maxHeight = group.classList.contains('expanded') ? items.scrollHeight + 'px' : '0';
      }
    }
  });

  // Nav item click (navigate)
  app.addEventListener('click', function(e) {
    var navItem = e.target.closest('.nav-item');
    if (navItem && navItem.dataset.route) {
      e.preventDefault();
      navigate(navItem.dataset.route);
      if (window.innerWidth <= 768) closeSidebar();
    }
  });

  // Column sorting
  app.addEventListener('click', function(e) {
    var th = e.target.closest('th.sortable');
    if (th && th.dataset.sort) {
      var key = th.dataset.sort;
      if (window._currentSort && window._currentSort.key === key) {
        window._currentSort.asc = !window._currentSort.asc;
      } else {
        window._currentSort = { key: key, asc: true };
      }
      window._currentPage = 1;
      renderPage(getCurrentRoute());
    }
  });

  // Pagination
  app.addEventListener('click', function(e) {
    var pageBtn = e.target.closest('.pagination-btn');
    if (pageBtn && !pageBtn.disabled) {
      var page = parseInt(pageBtn.dataset.page);
      if (page > 0) {
        window._currentPage = page;
        renderPage(getCurrentRoute());
      }
    }
  });

  // Data-action buttons
  app.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.dataset.action;
    var id = btn.dataset.id;

    if (action === 'add-produk') handleAddMaster('add-produk');
    else if (action === 'add-kategori') handleAddKategori();
    else if (action === 'add-supplier') handleAddSupplier();
    else if (action === 'add-gudang') handleAddGudang();
    else if (action === 'add-bm') handleAddBarangMasuk();
    else if (action === 'add-bk') handleAddBarangKeluar();
    else if (action === 'add-sa') handleAddStockAdjustment();
    else if (action === 'add-st') handleAddStockTransfer();
    else if (action === 'add-user') handleAddUser();
    else if (action === 'export-btn') showToast('Laporan sedang diproses', 'info');
    else if (action.startsWith('edit-')) handleEdit(action, id);
    else if (action.startsWith('delete-')) handleDelete(action, id);
    else if (action.startsWith('detail-')) handleDetail(action, id);
  });

  // Report actions (data-report-action)
  app.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-report-action]');
    if (!btn) return;
    var reportAction = btn.dataset.reportAction;
    var reportType = btn.dataset.report;

    if (reportAction === 'export-pdf') {
      if (reportType) {
        import('./export.js').then(function(mod) {
          mod.exportReportPDF(reportType);
        }).catch(function() {
          showToast('Gagal memuat PDF exporter', 'error');
        });
      }
    } else if (reportAction === 'reset-daterange') {
      window._dateFrom = '';
      window._dateTo = '';
      window._currentPage = 1;
      renderPage(getCurrentRoute());
    }
  });

  // Date range inputs — auto-apply on change
  app.addEventListener('change', function(e) {
    var input = e.target.closest('#dateFrom, #dateTo');
    if (!input) return;
    window._dateFrom = document.getElementById('dateFrom')?.value || '';
    window._dateTo = document.getElementById('dateTo')?.value || '';
    window._currentPage = 1;
    renderPage(getCurrentRoute());
  });

  // Sidebar toggle
  app.addEventListener('click', function(e) {
    var toggle = e.target.closest('#menuToggle');
    if (!toggle) return;
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    if (!sidebar) return;
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('mobile-open');
      if (overlay) overlay.classList.toggle('active');
      document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
    } else {
      sidebar.classList.toggle('collapsed');
    }
  });

  document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
  document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);

  window.addEventListener('resize', function() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    if (window.innerWidth > 768 && sidebar) {
      sidebar.classList.remove('mobile-open');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Table search
  app.addEventListener('input', function(e) {
    var searchInput = e.target.closest('#tableSearch');
    if (searchInput) {
      window._searchTerm = searchInput.value;
      window._currentPage = 1;
      clearTimeout(window._searchTimer);
      window._searchTimer = setTimeout(function() { renderPage(getCurrentRoute()); }, 300);
    }
  });
}

function closeSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  if (sidebar) {
    sidebar.classList.remove('mobile-open');
    if (window.innerWidth > 768) sidebar.classList.add('collapsed');
  }
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ======================
// INITIALIZE
// ======================
function init() {
  buildLayout();
  window.addEventListener('hashchange', function() { renderPage(getCurrentRoute()); });
  setupEvents();
  renderPage(getCurrentRoute());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}