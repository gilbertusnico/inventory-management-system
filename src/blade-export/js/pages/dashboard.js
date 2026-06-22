// ============================================
// INVENTARIS — Dashboard Page Script
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  var totalStock = products.reduce(function(s, p) { return s + p.stock; }, 0);
  var lowStock = getLowStockProducts();

  document.getElementById('kpiTotalProduk').textContent = products.length;
  document.getElementById('kpiTotalSupplier').textContent = suppliers.length;
  document.getElementById('kpiTotalGudang').textContent = warehouses.length;
  document.getElementById('kpiTotalStok').textContent = totalStock;

  var kpiStokChange = document.getElementById('kpiStokChange');
  var lowStockLabel = document.getElementById('kpiLowStockLabel');
  lowStockLabel.textContent = lowStock.length + ' produk di bawah min';
  if (lowStock.length > 0) {
    kpiStokChange.className = 'kpi-card-change down';
  }

  document.getElementById('lowStockSubtitle').textContent = lowStock.length + ' produk di bawah stok minimum';
  var lowStockList = document.getElementById('lowStockList');
  if (lowStock.length > 0) {
    lowStockList.innerHTML = lowStock.slice(0, 6).map(function(p) {
      return '<div class="alert-item">' +
        '<span class="alert-item-name">' + p.name + '</span>' +
        '<div><span class="alert-item-stock">' + p.stock + '</span> <span style="font-size:11px;color:#999">/ ' + p.minStock + '</span></div>' +
      '</div>';
    }).join('');
  } else {
    lowStockList.innerHTML = '<p style="text-align:center;padding:20px;color:#999">Semua stok aman ✅</p>';
  }

  var activityList = document.getElementById('activityList');
  var html = '';
  barangMasuk.slice(0, 3).forEach(function(t) {
    html += '<div class="activity-item">' +
      '<div class="activity-dot green"></div>' +
      '<div class="activity-content">' +
        '<div class="activity-text"><strong>Barang Masuk</strong> — ' + t.items.length + ' item (' + formatDate(t.date) + ')</div>' +
        '<div class="activity-time">' + (t.ref || 'No ref') + '</div>' +
      '</div></div>';
  });
  barangKeluar.slice(0, 3).forEach(function(t) {
    html += '<div class="activity-item">' +
      '<div class="activity-dot blue"></div>' +
      '<div class="activity-content">' +
        '<div class="activity-text"><strong>Barang Keluar</strong> — ' + t.penerima + ' (' + formatDate(t.date) + ')</div>' +
        '<div class="activity-time">' + (t.ref || 'No ref') + '</div>' +
      '</div></div>';
  });
  activityList.innerHTML = html;

  setTimeout(function() {
    var movement = getMonthlyMovement();
    var mw = (document.getElementById('chartMovement')?.clientWidth) || 600;
    createBarChartCustom('chartMovement', movement, mw);
    createDonutChart('chartDistribution', getStockDistribution(), { size: 180, strokeWidth: 32 });
  }, 100);
});