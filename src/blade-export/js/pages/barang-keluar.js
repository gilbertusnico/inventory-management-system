function reRenderTable() {
  var data = filterData(barangKeluar, _searchTerm, ['ref', 'penerima']);
  if (_currentSort.key) data = sortData(data, _currentSort.key, _currentSort.asc);
  var cols = [
    { label: 'Tanggal', key: 'date', render: function(r) { return formatDate(r.date); } },
    { label: 'Penerima', key: 'penerima' },
    { label: 'Referensi', key: 'ref', render: function(r) { return r.ref || '-'; } },
    { label: 'Item', key: 'items', render: function(r) {
      return r.items.map(function(i) {
        var p = getProduct(i.productId);
        return '<div style="font-size:12px;color:#666">' + (p ? p.name : 'Produk#' + i.productId) + ' <strong>x' + i.qty + '</strong></div>';
      }).join('');
    }},
    { label: 'Catatan', key: 'note', render: function(r) { return r.note || '-'; } },
    { label: 'Aksi', key: null, render: function(r) {
      return '<div class="table-actions"><button class="btn-icon-sm" data-action="edit-bk" data-id="' + r.id + '" title="Edit">' + icon('edit', 16) + '</button><button class="btn-icon-sm btn-icon-sm-danger" data-action="delete-bk" data-id="' + r.id + '" title="Hapus">' + icon('trash', 16) + '</button></div>';
    }}
  ];
  var html = renderTable(data, cols, _currentPage);
  var container = document.getElementById('tableContainer');
  if (container) container.innerHTML = html;
}
document.addEventListener('DOMContentLoaded', function() { reRenderTable(); });