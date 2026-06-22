document.addEventListener('DOMContentLoaded', function() {
  // KPI
  var totalProduk = products.length;
  var totalSupplier = suppliers.length;
  var totalGudang = warehouses.length;
  var totalStok = products.reduce(function(s, p) { return s + p.stock; }, 0);
  var lowStockCount = getLowStockProducts().length;

  document.getElementById('kpiTotalProduk').textContent = totalProduk;
  document.getElementById('kpiTotalSupplier').textContent = totalSupplier;
  document.getElementById('kpiTotalGudang').textContent = totalGudang;
  document.getElementById('kpiTotalStok').textContent = totalStok;

  var lowLabel = document.getElementById('kpiLowStockLabel');
  if (lowLabel) lowLabel.textContent = lowStockCount + ' produk di bawah min';
  var stokChange = document.getElementById('kpiStokChange');
  if (stokChange && lowStockCount > 0) {
    stokChange.classList.remove('up');
    stokChange.classList.add('down');
    stokChange.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg> <span>' + lowStockCount + ' produk di bawah min</span>';
  }

  // Low stock list
  var lowStock = getLowStockProducts();
  var lowList = document.getElementById('lowStockList');
  var lowSub = document.getElementById('lowStockSubtitle');
  if (lowSub) lowSub.textContent = lowStock.length + ' produk di bawah stok minimum';
  if (lowList) {
    if (lowStock.length === 0) {
      lowList.innerHTML = '<p style="text-align:center;padding:20px;color:#22c55e;font-weight:500">Semua stok aman</p>';
    } else {
      lowList.innerHTML = lowStock.map(function(p) {
        return '<div class="alert-item"><span class="alert-item-name">' + p.name + '</span><span class="alert-item-stock">' + p.stock + ' / ' + p.minStock + '</span></div>';
      }).join('');
    }
  }

  // Activity list
  var activityList = document.getElementById('activityList');
  if (activityList) {
    var activities = [];
    barangMasuk.forEach(function(bm) {
      activities.push({ date: bm.date, text: 'Barang masuk dari <strong>' + (getSupplier(bm.supplierId) || {}).name + '</strong>', type: 'green' });
    });
    barangKeluar.forEach(function(bk) {
      activities.push({ date: bk.date, text: 'Barang keluar ke <strong>' + bk.penerima + '</strong>', type: 'blue' });
    });
    activities.sort(function(a, b) { return b.date.localeCompare(a.date); });
    activities = activities.slice(0, 8);
    activityList.innerHTML = activities.map(function(a) {
      return '<div class="activity-item">' +
        '<div class="activity-dot ' + a.type + '"></div>' +
        '<div class="activity-content">' +
          '<div class="activity-text">' + a.text + '</div>' +
          '<div class="activity-time">' + formatDate(a.date) + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  // Charts
  setTimeout(function() {
    var movement = getMonthlyMovement();
    createBarChartCustom('chartMovement', movement);
    createDonutChart('chartDistribution', getStockDistribution(), { size: 180 });
  }, 100);
});
