function reRenderTable() {
  var data = filterData(stockAdjustments, _searchTerm, ['alasan']);
  if (_currentSort.key) data = sortData(data, _currentSort.key, _currentSort.asc);
  var cols = [
    { label: 'Tanggal', key: 'date', sortable: true, render: function(r) { return formatDate(r.date); } },
    { label: 'Produk', key: 'productId', render: function(r) { var p = getProduct(r.productId); return p ? '<strong>' + p.name + '</strong>' : '-'; } },
    { label: 'Stok Sistem', key: 'sistem', render: function(r) { return '<span style="font-weight:600">' + r.sistem + '</span>'; } },
    { label: 'Stok Fisik', key: 'fisik', render: function(r) { return '<span style="font-weight:600">' + r.fisik + '</span>'; } },
    { label: 'Selisih', key: 'selisih', render: function(r) {
      var cls = r.selisih < 0 ? 'style="color:#ef4444;font-weight:600"' : r.selisih > 0 ? 'style="color:#22c55e;font-weight:600"' : 'style="color:#999"';
      return '<span ' + cls + '>' + (r.selisih > 0 ? '+' : '') + r.selisih + '</span>';
    }},
    { label: 'Alasan', key: 'alasan', render: function(r) { return '<span class="badge badge-warning">' + r.alasan + '</span>'; } },
    { label: 'Aksi', key: null, render: function(r) {
      return '<div class="table-actions"><button class="btn-icon-sm" title="Lihat">' + icon('edit', 16) + '</button><button class="btn-icon-sm btn-icon-sm-danger" title="Hapus">' + icon('trash', 16) + '</button></div>';
    }},
  ];
  var html = renderTable(data, cols, _currentPage);
  var container = document.getElementById('tableContainer');
  if (container) container.innerHTML = html;
}
document.addEventListener('DOMContentLoaded', function() { reRenderTable(); });
