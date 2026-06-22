function reRenderTable() {
  var data = filterData(warehouses, _searchTerm, ['name', 'code', 'location']);
  if (_currentSort.key) data = sortData(data, _currentSort.key, _currentSort.asc);
  var cols = [
    { label: 'Kode', key: 'code', render: function(r) { return '<span style="font-family:monospace;font-weight:600">' + r.code + '</span>'; } },
    { label: 'Nama', key: 'name', render: function(r) { return '<strong>' + r.name + '</strong>'; } },
    { label: 'Lokasi', key: 'location' },
    { label: 'Jml Produk', key: 'count', sortable: true, render: function(r) { return '<span style="font-weight:600">' + r.count + '</span>'; } },
    { label: 'Total Stok', key: 'totalStock', sortable: true, render: function(r) { return '<span style="font-weight:600;color:#1144F9">' + (r.totalStock || 0) + '</span>'; } },
    { label: 'Aksi', key: null, render: function(r) {
      return '<div class="table-actions"><button class="btn-icon-sm" data-action="edit-gudang" data-id="' + r.id + '" title="Edit">' + icon('edit', 16) + '</button><button class="btn-icon-sm btn-icon-sm-danger" data-action="delete-gudang" data-id="' + r.id + '" title="Hapus">' + icon('trash', 16) + '</button></div>';
    }}
  ];
  var html = renderTable(data, cols, _currentPage);
  var container = document.getElementById('tableContainer');
  if (container) container.innerHTML = html;

document.addEventListener('DOMContentLoaded', function() { reRenderTable(); });