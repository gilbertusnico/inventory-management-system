document.addEventListener('DOMContentLoaded', function() {
  var permBody = document.getElementById('permBody');
  if (!permBody) return;
  var html = '';
  Object.keys(permissions).forEach(function(group) {
    html += '<tr class="perm-group"><td colspan="4">' + group + '</td></tr>';
    Object.keys(permissions[group]).forEach(function(perm) {
      html += '<tr><td>' + perm + '</td>';
      ['Owner', 'Admin', 'Staff'].forEach(function(role) {
        var val = permissions[group][perm][role];
        html += '<td>' + (val ? '<span class="perm-check">&#10003;</span>' : '<span class="perm-dash">&mdash;</span>') + '</td>';
      });
      html += '</tr>';
    });
  });
  permBody.innerHTML = html;
});
