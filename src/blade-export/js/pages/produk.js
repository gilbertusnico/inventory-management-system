// ============================================
// INVENTARIS — Produk Page Script
// ============================================

function reRenderTable() {
  var data = filterData(products, _searchTerm, ['name', 'sku']);
  if (_currentSort.key) data = sortData(data, _currentSort.key, _currentSort.asc);
  var cols = [
    { label: 'SKU', key: 'sku', render: function(r) { return r.sku; } },
    { label: 'Nama Produk', key: 'name', render: function(r) { return '<strong>' + r.name + '</strong>'; } },
    { label: 'Kategori', key: 'categoryId', render: function(r) { return (getCategory(r.categoryId) || {}).name || '-'; } },
    { label: 'Supplier', key: 'supplierId', render: function(r) { return (getSupplier(r.supplierId) || {}).name || '-'; } },
    { label: 'Gudang', key: 'warehouseId', render: function(r) { return (getWarehouse(r.warehouseId) || {}).name || '-'; } },
    { label: 'Stok', key: 'stock', render: function(r) {
      var prod = products.find(function(p) { return p.id === r.id; });
      var isLow = prod && prod.stock < prod.minStock;
      return '<span style="font-weight:600' + (isLow ? ';color:#ef4444' : '') + '">' + r.stock + '</span>';
    }},
    { label: 'Status', key: 'status', render: function(r) { return statusBadge(r.status); } },
    { label: 'Aksi', key: null, render: function(r) {
      return '<div class="table-actions">' +
        '<button class="btn-icon-sm" data-action="edit-produk" data-id="' + r.id + '" title="Edit">' + icon('edit', 16) + '</button>' +
        '<button class="btn-icon-sm btn-icon-sm-danger" data-action="delete-produk" data-id="' + r.id + '" title="Hapus">' + icon('trash', 16) + '</button>' +
      '</div>';
    }},
  ];
  var html = renderTable(data, cols, _currentPage);
  var container = document.getElementById('tableContainer');
  if (container) container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
  reRenderTable();
});