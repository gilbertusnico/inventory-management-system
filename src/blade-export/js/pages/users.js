function reRenderTable() {
  var data = filterData(users, _searchTerm, ['name', 'email', 'role']);
  if (_currentSort.key) data = sortData(data, _currentSort.key, _currentSort.asc);
  var cols = [
    { label: 'Nama', key: 'name', render: function(r) { return '<strong>' + r.name + '</strong>'; } },
    { label: 'Email', key: 'email' },
    { label: 'Role', key: 'role', render: function(r) { return '<span class="badge badge-info">' + r.role + '</span>'; } },
    { label: 'Status', key: 'status', render: function(r) { return statusBadge(r.status); } },
    { label: 'Last Login', key: 'lastLogin', render: function(r) { return formatDate(r.lastLogin); } },
    { label: 'Aksi', key: null, render: function(r) {
      return '<div class="table-actions"><button class="btn-icon-sm" data-action="edit-user" data-id="' + r.id + '" title="Edit">' + icon('edit', 16) + '</button><button class="btn-icon-sm btn-icon-sm-danger" data-action="delete-user" data-id="' + r.id + '" title="Hapus">' + icon('trash', 16) + '</button></div>';
    }}
  ];
  var html = renderTable(data, cols, _currentPage);
  var container = document.getElementById('tableContainer');
  if (container) container.innerHTML = html;
}
document.addEventListener('DOMContentLoaded', function() { reRenderTable(); });