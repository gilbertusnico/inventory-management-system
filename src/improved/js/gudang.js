function reRenderTable() {
  var data = filterData(warehouses, _searchTerm, ['code', 'name', 'location']);
  if (_currentSort.key) data = sortData(data, _currentSort.key, _currentSort.asc);
  var cols = [
    { label: 'Kode', key: 'code', sortable: true, render: function(r) { return '<strong>' + r.code + '</strong>'; } },
    { label: 'Nama', key: 'name', sortable: true },
    { label: 'Lokasi', key: 'location' },
    { label: 'Total Produk', key: 'count', render: function(r) { return '<span class="badge badge-info">' + r.count + ' produk</span>'; } },
    { label: 'Aksi', key: null, render: function(r) {
      return '<div class="table-actions"><button class="btn-icon-sm" data-action="edit-gudang" data-id="' + r.id + '" title="Edit">' + icon('edit', 16) + '</button><button class="btn-icon-sm btn-icon-sm-danger" data-action="delete-gudang" data-id="' + r.id + '" title="Hapus">' + icon('trash', 16) + '</button></div>';
    }},
  ];
  var html = renderTable(data, cols, _currentPage);
  var container = document.getElementById('tableContainer');
  if (container) container.innerHTML = html;
}
document.addEventListener('DOMContentLoaded', function() { reRenderTable(); });
