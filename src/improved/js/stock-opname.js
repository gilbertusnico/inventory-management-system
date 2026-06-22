function renderSOData() {
  var total = stockOpname.length;
  var sesuai = stockOpname.filter(function(r) { return r.sistem === r.fisik; }).length;
  var tidakSesuai = total - sesuai;
  var totalSelisih = stockOpname.reduce(function(s, r) { return s + Math.abs(r.sistem - r.fisik); }, 0);
  var soTotal = document.getElementById('soTotal');
  var soSesuai = document.getElementById('soSesuai');
  var soTidakSesuai = document.getElementById('soTidakSesuai');
  var soSelisih = document.getElementById('soSelisih');
  if (soTotal) soTotal.textContent = total;
  if (soSesuai) soSesuai.textContent = sesuai;
  if (soTidakSesuai) soTidakSesuai.textContent = tidakSesuai;
  if (soSelisih) soSelisih.textContent = totalSelisih;
}

function reRenderTable() {
  renderSOData();
  var data = stockOpname;
  if (_searchTerm) {
    data = stockOpname.filter(function(r) {
      var p = getProduct(r.productId);
      return p && p.name.toLowerCase().includes(_searchTerm.toLowerCase());
    });
  }
  if (_currentSort.key) data = sortData(data, _currentSort.key, _currentSort.asc);
  var cols = [
    { label: 'Produk', key: 'productId', render: function(r) { var p = getProduct(r.productId); return p ? '<strong>' + p.name + '</strong>' : '-'; } },
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
