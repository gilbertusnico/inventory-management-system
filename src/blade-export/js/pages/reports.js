document.addEventListener('DOMContentLoaded', function() {
  // Stock report
  var totalStock = products.reduce(function(s, p) { return s + p.stock; }, 0);
  var totalNilai = products.reduce(function(s, p) { return s + (p.price * p.stock); }, 0);
  var stokTotalProduk = document.getElementById('stokTotalProduk');
  var stokTotalItem = document.getElementById('stokTotalItem');
  var stokTotalNilai = document.getElementById('stokTotalNilai');
  if (stokTotalProduk) stokTotalProduk.textContent = products.length;
  if (stokTotalItem) stokTotalItem.textContent = totalStock;
  if (stokTotalNilai) stokTotalNilai.textContent = formatCurrency(totalNilai);

  // Barang Masuk report
  var lmTotal = document.getElementById('lmTotal');
  var lmRata = document.getElementById('lmRata');
  var lmTerakhir = document.getElementById('lmTerakhir');
  if (lmTotal) lmTotal.textContent = barangMasuk.reduce(function(s, bm) { return s + bm.items.reduce(function(si, i) { return si + i.qty; }, 0); }, 0) + ' item';
  if (lmRata) lmRata.textContent = Math.round(barangMasuk.reduce(function(s, bm) { return s + bm.items.length; }, 0) / 6) + ' item';
  if (lmTerakhir) lmTerakhir.textContent = barangMasuk.length + ' transaksi';

  // Barang Keluar report
  var lkTotal = document.getElementById('lkTotal');
  var lkRata = document.getElementById('lkRata');
  var lkTerakhir = document.getElementById('lkTerakhir');
  if (lkTotal) lkTotal.textContent = barangKeluar.reduce(function(s, bk) { return s + bk.items.reduce(function(si, i) { return si + i.qty; }, 0); }, 0) + ' item';
  if (lkRata) lkRata.textContent = Math.round(barangKeluar.reduce(function(s, bk) { return s + bk.items.length; }, 0) / 6) + ' item';
  if (lkTerakhir) lkTerakhir.textContent = barangKeluar.length + ' transaksi';

  // Mutasi Stok
  var totalBM = barangMasuk.reduce(function(s, bm) { return s + bm.items.reduce(function(si, i) { return si + i.qty; }, 0); }, 0);
  var totalBK = barangKeluar.reduce(function(s, bk) { return s + bk.items.reduce(function(si, i) { return si + i.qty; }, 0); }, 0);
  var mutasiMasuk = document.getElementById('mutasiMasuk');
  var mutasiKeluar = document.getElementById('mutasiKeluar');
  var mutasiSelisih = document.getElementById('mutasiSelisih');
  if (mutasiMasuk) mutasiMasuk.textContent = totalBM;
  if (mutasiKeluar) mutasiKeluar.textContent = totalBK;
  if (mutasiSelisih) mutasiSelisih.textContent = totalBM - totalBK;

  // Stock report table
  if (document.getElementById('stokTotalProduk')) {
    window.reRenderTable = function() {
      var data = filterData(products, _searchTerm, ['name', 'sku']);
      if (_currentSort.key) data = sortData(data, _currentSort.key, _currentSort.asc);
      var cols = [
        { label: 'SKU', key: 'sku' },
        { label: 'Produk', key: 'name', render: function(r) { return '<strong>' + r.name + '</strong>'; } },
        { label: 'Kategori', key: 'categoryId', render: function(r) { return (getCategory(r.categoryId) || {}).name || '-'; } },
        { label: 'Gudang', key: 'warehouseId', render: function(r) { return (getWarehouse(r.warehouseId) || {}).name || '-'; } },
        { label: 'Stok', key: 'stock', render: function(r) { return '<span style="font-weight:600">' + r.stock + '</span>'; } },
        { label: 'Harga', key: 'price', render: function(r) { return formatCurrency(r.price); } },
        { label: 'Total Nilai', key: null, render: function(r) { return formatCurrency(r.price * r.stock); } },
      ];
      var html = renderTable(data, cols, _currentPage);
      var container = document.getElementById('tableContainer');
      if (container) container.innerHTML = html;
    };
    reRenderTable();
  }

  // Charts
  setTimeout(function() {
    var c1 = document.getElementById('reportChart');
    if (c1) createBarChart('reportChart', getMonthlyReportData('masuk'), { barColor: '#1144F9' });
    var c2 = document.getElementById('mutasiChart');
    if (c2) createLineChart('mutasiChart', getMonthlyReportData('mutasi'), { lineColor: '#8b5cf6' });
  }, 100);
});