function renderSOData() {
  var total = stockOpname.length;
  var sesuai = stockOpname.filter(function(r) { return r.sistem === r.fisik; }).length;
  var tidakSesuai = total - sesuai;
  var totalSelisih = stockOpname.reduce(function(s, r) { return s + Math.abs(r.sistem - r.fisik); }, 0);
  document.getElementById('soTotal').textContent = total;
  document.getElementById('soSesuai').textContent = sesuai;
  document.getElementById('soTidakSesuai').textContent = tidakSesuai;
  document.getElementById('soSelisih').textContent = totalSelisih;
}

function reRenderTable() {
  renderSOData();
  var data = filterData(stockOpname, _searchTerm, []);
  if (_currentSort.key) data = sortData(data, _currentSort.key, _currentSort.asc);
  var cols = [
    { label: 'Produk', key: 'productId', render: function(r) { var p = getProduct(r.productId); return p ? p.name : '-'; } },
    { label: 'Gudang', key: 'warehouseId', render: function(r) { return (getWarehouse(r.warehouseId) || {}).name || '-'; } },
    { label: 'Stok Sistem', key: 'sistem', render: function(r) { return '<span style="font-weight:600">' + r.sistem + '</span>'; } },
    { label: 'Stok Fisik', key: 'fisik', render: function(r) { return '<span style="font-weight:600">' + r.fisik + '</span>'; } },
    { label: 'Selisih', key: null, render: function(r) {
      var sel = r.fisik - r.sistem;
      var cls = sel < 0 ? 'style="color:#ef4444;font-weight:600"' : sel > 0 ? 'style="color:#22c55e;font-weight:600"' : 'style="color:#999"';
      return '<span ' + cls + '>' + (sel > 0 ? '+' : '') + sel + '</span>';
    }},
    { label: 'Status', key: null, render: function(r) {
      return r.sistem === r.fisik ? '<span class="badge badge-success">Sesuai</span>' : '<span class="badge badge-warning">Tidak Sesuai</span>';
    }},
  ];
  var html = renderTable(data, cols, _currentPage);
  var container = document.getElementById('tableContainer');
  if (container) container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() { reRenderTable(); });