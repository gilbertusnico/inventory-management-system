function reRenderTable() {
  var data = filterData(categories, _searchTerm, ['name', 'description']);
  if (_currentSort.key) data = sortData(data, _currentSort.key, _currentSort.asc);
  var cols = [
    { label: 'Nama', key: 'name', sortable: true, render: function(r) { return '<strong>' + r.name + '</strong>'; } },
    { label: 'Deskripsi', key: 'description' },
    { label: 'Jumlah Produk', key: 'count', render: function(r) { return '<span class="badge badge-info">' + r.count + ' produk</span>'; } },
    { label: 'Aksi', key: null, render: function(r) {
      return '<div class="table-actions"><button class="btn-icon-sm" data-action="edit-kategori" data-id="' + r.id + '" title="Edit">' + icon('edit', 16) + '</button><button class="btn-icon-sm btn-icon-sm-danger" data-action="delete-kategori" data-id="' + r.id + '" title="Hapus">' + icon('trash', 16) + '</button></div>';
    }},
  ];
  var html = renderTable(data, cols, _currentPage);
  var container = document.getElementById('tableContainer');
  if (container) container.innerHTML = html;
}
document.addEventListener('DOMContentLoaded', function() { reRenderTable(); });
