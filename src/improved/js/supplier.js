function reRenderTable() {
  var data = filterData(suppliers, _searchTerm, ['name', 'pic', 'email']);
  if (_currentSort.key) data = sortData(data, _currentSort.key, _currentSort.asc);
  var cols = [
    { label: 'Nama', key: 'name', sortable: true, render: function(r) { return '<strong>' + r.name + '</strong>'; } },
    { label: 'PIC', key: 'pic' },
    { label: 'Email', key: 'email', render: function(r) { return '<a href="mailto:' + r.email + '" style="color:#3b82f6">' + r.email + '</a>'; } },
    { label: 'Telepon', key: 'phone', render: function(r) { return r.phone; } },
    { label: 'Aksi', key: null, render: function(r) {
      return '<div class="table-actions"><button class="btn-icon-sm" data-action="edit-supplier" data-id="' + r.id + '" title="Edit">' + icon('edit', 16) + '</button><button class="btn-icon-sm btn-icon-sm-danger" data-action="delete-supplier" data-id="' + r.id + '" title="Hapus">' + icon('trash', 16) + '</button></div>';
    }},
  ];
  var html = renderTable(data, cols, _currentPage);
  var container = document.getElementById('tableContainer');
  if (container) container.innerHTML = html;
}
document.addEventListener('DOMContentLoaded', function() { reRenderTable(); });
