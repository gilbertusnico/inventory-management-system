function reRenderTable() {
  var data = filterData(stockTransfers, _searchTerm, ['ref']);
  if (_currentSort.key) data = sortData(data, _currentSort.key, _currentSort.asc);
  var cols = [
    { label: 'Tanggal', key: 'date', sortable: true, render: function(r) { return formatDate(r.date); } },
    { label: 'Dari Gudang', key: 'fromWarehouseId', render: function(r) { var w = getWarehouse(r.fromWarehouseId); return w ? w.name : '-'; } },
    { label: 'Ke Gudang', key: 'toWarehouseId', render: function(r) { var w = getWarehouse(r.toWarehouseId); return w ? w.name : '-'; } },
    { label: 'Referensi', key: 'ref', render: function(r) { return '<span class="badge badge-neutral">' + r.ref + '</span>'; } },
    { label: 'Item', key: null, render: function(r) {
      return r.items.map(function(i) { var p = getProduct(i.productId); return (p ? p.name : '?') + ' x' + i.qty; }).join(', ');
    }},
    { label: 'Aksi', key: null, render: function(r) {
      return '<div class="table-actions"><button class="btn-icon-sm" title="Lihat">' + icon('edit', 16) + '</button><button class="btn-icon-sm btn-icon-sm-danger" title="Hapus">' + icon('trash', 16) + '</button></div>';
    }},
  ];
  var html = renderTable(data, cols, _currentPage);
  var container = document.getElementById('tableContainer');
  if (container) container.innerHTML = html;
}
document.addEventListener('DOMContentLoaded', function() { reRenderTable(); });
