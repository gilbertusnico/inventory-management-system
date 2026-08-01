function reRenderTable() {
  var data = filterData(products, _searchTerm, ['name', 'sku', 'status']);
  if (_currentSort.key) data = sortData(data, _currentSort.key, _currentSort.asc);
  var cols = [
    { label: 'SKU', key: 'sku' },
    { label: 'Nama Produk', key: 'name', sortable: true, render: function(r) { return '<strong>' + r.name + '</strong>'; } },
    { label: 'Kategori', key: 'categoryId', render: function(r) { var c = getCategory(r.categoryId); return c ? c.name : '-'; } },
    { label: 'Supplier', key: 'supplierId', render: function(r) { var s = getSupplier(r.supplierId); return s ? s.name : '-'; } },
    { label: 'Gudang', key: 'warehouseId', render: function(r) { var w = getWarehouse(r.warehouseId); return w ? w.name : '-'; } },
    { label: 'Stok', key: 'stock', sortable: true, render: function(r) {
      var cls = r.stock < r.minStock ? 'style="color:#ef4444;font-weight:600"' : 'style="font-weight:600"';
      return '<span ' + cls + '>' + r.stock + '</span>';
    }},
    { label: 'Status', key: 'status', render: function(r) { return statusBadge(r.status); } },
    { label: 'Aksi', key: null, render: function(r) {
      return '<div class="table-actions"><button class="btn-icon-sm" data-action="edit-produk" data-id="' + r.id + '" title="Edit">' + icon('edit', 16) + '</button><button class="btn-icon-sm btn-icon-sm-danger" data-action="delete-produk" data-id="' + r.id + '" title="Hapus">' + icon('trash', 16) + '</button></div>';
    }},
  ];
  var html = renderTable(data, cols, _currentPage);
  var container = document.getElementById('tableContainer');
  if (container) container.innerHTML = html;
}
document.addEventListener('DOMContentLoaded', function() { reRenderTable(); });
