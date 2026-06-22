// ============================================
// INVENTARIS — Shared UI Helpers
// ============================================
// Load this AFTER data.js

// --- Modal ---
function showModal(title, body, footer, wide) {
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.innerHTML = '<div class="modal' + (wide ? ' modal-wide' : '') + '">' +
    '<div class="modal-header">' +
      '<div class="modal-title">' + title + '</div>' +
      '<button class="modal-close" id="modalClose">' + icon('x', 18) + '</button>' +
    '</div>' +
    '<div class="modal-body">' + body + '</div>' +
    (footer ? '<div class="modal-footer">' + footer + '</div>' : '') +
  '</div>';
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeModal();
  });
  document.body.appendChild(overlay);
  setTimeout(function() {
    var closeBtn = document.getElementById('modalClose');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  }, 10);
}

function closeModal() {
  var el = document.querySelector('.modal-overlay');
  if (el) el.remove();
}

// --- Toast ---
function showToast(message, type) {
  if (type === undefined) type = 'success';
  var container = document.getElementById('toastContainer');
  if (!container) return;
  var icons = { success: icon('check', 18), error: icon('x', 18), info: icon('alertTriangle', 18) };
  var toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = '<span class="toast-icon">' + (icons[type] || icons.info) + '</span><span class="toast-message">' + message + '</span>';
  container.appendChild(toast);
  setTimeout(function() {
    toast.style.animation = 'slideOutRight 200ms ease forwards';
    setTimeout(function() { toast.remove(); }, 200);
  }, 3000);
}

// --- Status Badge ---
function statusBadge(status) {
  if (status === 'Aktif' || status === 'Active') return '<span class="badge badge-success">' + status + '</span>';
  if (status === 'Nonaktif' || status === 'Inactive') return '<span class="badge badge-danger">' + status + '</span>';
  return '<span class="badge badge-neutral">' + status + '</span>';
}

// --- Table Utilities ---
var _currentPage = 1;
var _currentSort = { key: null, asc: true };
var _searchTerm = '';

function sortData(arr, key, asc) {
  var copy = arr.slice();
  copy.sort(function(a, b) {
    var va = a[key] || '';
    var vb = b[key] || '';
    if (typeof va === 'string') return asc ? va.localeCompare(vb) : vb.localeCompare(va);
    return asc ? va - vb : vb - va;
  });
  return copy;
}

function filterData(arr, term, keys) {
  if (!term) return arr;
  if (keys === undefined) keys = ['name'];
  var t = term.toLowerCase();
  return arr.filter(function(item) {
    return keys.some(function(k) {
      return String(item[k] || '').toLowerCase().includes(t);
    });
  });
}

function renderPagination(total, page, perPage) {
  if (perPage === undefined) perPage = 10;
  var totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return '';
  var btns = '';
  btns += '<button class="pagination-btn" data-page="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + '>‹</button>';
  for (var i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      btns += '<button class="pagination-btn' + (i === page ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
    } else if (Math.abs(i - page) === 2) {
      btns += '<button class="pagination-btn" disabled>…</button>';
    }
  }
  btns += '<button class="pagination-btn" data-page="' + (page + 1) + '"' + (page >= totalPages ? ' disabled' : '') + '>›</button>';
  var start = (page - 1) * perPage + 1;
  var end = Math.min(page * perPage, total);
  return '<div class="pagination">' +
    '<div class="pagination-info">Menampilkan ' + start + '-' + end + ' dari ' + total + '</div>' +
    '<div class="pagination-buttons">' + btns + '</div>' +
  '</div>';
}

function renderTable(data, columns, page, perPage) {
  if (page === undefined) page = _currentPage;
  if (perPage === undefined) perPage = 10;
  var start = (page - 1) * perPage;
  var pageData = data.slice(start, start + perPage);
  var html = '<div class="table-container"><table><thead><tr>';
  columns.forEach(function(col) {
    var sortable = col.sortable ? ' class="sortable"' : '';
    var arrow = '';
    if (_currentSort && _currentSort.key === col.key) {
      arrow = _currentSort.asc ? ' ▲' : ' ▼';
    }
    html += '<th' + sortable + ' data-sort="' + (col.key || '') + '">' + col.label + arrow + '</th>';
  });
  html += '</tr></thead><tbody>';
  pageData.forEach(function(row) {
    html += '<tr>';
    columns.forEach(function(col) {
      html += '<td>' + (col.render ? col.render(row) : (row[col.key] !== undefined ? row[col.key] : '-')) + '</td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  html += renderPagination(data.length, page, perPage);
  return html;
}

// --- Chart Renderers ---
function createBarChart(containerId, data, options) {
  if (options === undefined) options = {};
  var container = document.getElementById(containerId);
  if (!container) return;
  var width = options.width || container.clientWidth || 600;
  var height = options.height || 280;
  var barColor = options.barColor || '#1144F9';
  var labelColor = options.labelColor || '#999';
  var pad = { top: 20, right: 20, bottom: 40, left: 50 };
  var chartW = width - pad.left - pad.right;
  var chartH = height - pad.top - pad.bottom;
  var maxVal = Math.max.apply(null, data.map(function(d) { return d.value; }).concat([1]));
  var barWidth = Math.max(8, Math.min(36, chartW / data.length - 8));
  var gap = (chartW - barWidth * data.length) / (data.length + 1);
  var bars = '', labels = '', gridLines = '';
  for (var i = 0; i < 5; i++) {
    var yVal = Math.round((maxVal / 4) * (4 - i));
    var y = pad.top + (chartH / 4) * i;
    gridLines += '<line x1="' + pad.left + '" y1="' + y + '" x2="' + (pad.left + chartW) + '" y2="' + y + '" stroke="#f0f0f0" stroke-width="1"/>';
    gridLines += '<text x="' + (pad.left - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="10" fill="' + labelColor + '">' + formatShort(yVal) + '</text>';
  }
  data.forEach(function(d, i) {
    var x = pad.left + gap + i * (barWidth + gap);
    var barH = (d.value / maxVal) * chartH;
    var y = pad.top + chartH - barH;
    var color = d.color || barColor;
    bars += '<rect x="' + x + '" y="' + y + '" width="' + barWidth + '" height="' + barH + '" rx="3" fill="' + color + '" opacity="0.85">' +
      '<title>' + d.label + ': ' + d.value + '</title></rect>';
    labels += '<text x="' + (x + barWidth / 2) + '" y="' + (pad.top + chartH + 18) + '" text-anchor="middle" font-size="9" fill="' + labelColor + '">' + d.label.substring(0, 3) + '</text>';
  });
  container.innerHTML = '<svg width="100%" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" style="overflow:visible">' +
    gridLines + bars + labels +
    '<line x1="' + pad.left + '" y1="' + pad.top + '" x2="' + pad.left + '" y2="' + (pad.top + chartH) + '" stroke="#e5e7eb" stroke-width="1"/>' +
    '<line x1="' + pad.left + '" y1="' + (pad.top + chartH) + '" x2="' + (pad.left + chartW) + '" y2="' + (pad.top + chartH) + '" stroke="#e5e7eb" stroke-width="1"/>' +
  '</svg>';
}

function createDonutChart(containerId, data, options) {
  if (options === undefined) options = {};
  var container = document.getElementById(containerId);
  if (!container) return;
  var size = options.size || 200;
  var strokeWidth = options.strokeWidth || 36;
  var cx = size / 2, cy = size / 2, r = (size - strokeWidth) / 2;
  var total = data.reduce(function(s, d) { return s + d.value; }, 0) || 1;
  var colors = ['#1144F9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
  var cumulative = 0, segments = '', legendItems = '';
  data.forEach(function(d, i) {
    var pct = d.value / total;
    var color = d.color || colors[i % colors.length];
    var offset = (cumulative / 100) * 283;
    var len = pct * 283;
    segments += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + strokeWidth + '"' +
      ' stroke-dasharray="' + len + ' ' + (283 - len) + '" stroke-dashoffset="-' + offset + '" transform="rotate(-90 ' + cx + ' ' + cy + ')" opacity="0.85"/>';
    cumulative += pct * 100;
    legendItems += '<div class="chart-legend-item" style="display:flex;align-items:center;gap:6px;font-size:12px;color:#666;margin:3px 0">' +
      '<span style="width:10px;height:10px;border-radius:50%;background:' + color + ';flex-shrink:0"></span>' +
      '<span>' + d.label + '</span>' +
      '<span style="margin-left:auto;font-weight:600;color:#111">' + Math.round(pct * 100) + '%</span></div>';
  });
  container.innerHTML = '<div style="display:flex;align-items:center;gap:24px;height:100%">' +
    '<div style="position:relative;flex-shrink:0">' +
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#f0f0f0" stroke-width="' + strokeWidth + '"/>' +
        segments +
      '</svg>' +
      '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center">' +
        '<div style="font-size:24px;font-weight:700;color:#111">' + total + '</div>' +
        '<div style="font-size:11px;color:#999">Total</div>' +
      '</div>' +
    '</div>' +
    '<div style="flex:1;min-width:0">' + legendItems + '</div></div>';
}

function createLineChart(containerId, data, options) {
  if (options === undefined) options = {};
  var container = document.getElementById(containerId);
  if (!container) return;
  var width = options.width || container.clientWidth || 600;
  var height = options.height || 280;
  var lineColor = options.lineColor || '#1144F9';
  var labelColor = options.labelColor || '#999';
  var pad = { top: 20, right: 20, bottom: 40, left: 50 };
  var chartW = width - pad.left - pad.right;
  var chartH = height - pad.top - pad.bottom;
  var maxVal = Math.max.apply(null, data.map(function(d) { return d.value; }).concat([1]));
  var points = '', labels = '', gridLines = '', dots = '';
  for (var i = 0; i < 5; i++) {
    var yVal = Math.round((maxVal / 4) * (4 - i));
    var y = pad.top + (chartH / 4) * i;
    gridLines += '<line x1="' + pad.left + '" y1="' + y + '" x2="' + (pad.left + chartW) + '" y2="' + y + '" stroke="#f0f0f0" stroke-width="1"/>';
    gridLines += '<text x="' + (pad.left - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="10" fill="' + labelColor + '">' + formatShort(yVal) + '</text>';
  }
  var stepX = data.length > 1 ? chartW / (data.length - 1) : 0;
  var pathD = '';
  data.forEach(function(d, i) {
    var x = pad.left + i * stepX;
    var y = pad.top + chartH - (d.value / maxVal) * chartH;
    if (i === 0) {
      pathD += 'M ' + x + ' ' + y;
    } else {
      var prevX = pad.left + (i - 1) * stepX;
      var prevY = pad.top + chartH - (data[i - 1].value / maxVal) * chartH;
      var cpx = (prevX + x) / 2;
      pathD += ' C ' + cpx + ' ' + prevY + ', ' + cpx + ' ' + y + ', ' + x + ' ' + y;
    }
    dots += '<circle cx="' + x + '" cy="' + y + '" r="3" fill="' + lineColor + '" stroke="white" stroke-width="2">' +
      '<title>' + d.label + ': ' + d.value + '</title></circle>';
    labels += '<text x="' + x + '" y="' + (pad.top + chartH + 18) + '" text-anchor="middle" font-size="9" fill="' + labelColor + '">' + d.label.substring(0, 3) + '</text>';
  });
  var areaD = pathD + ' L ' + (pad.left + (data.length - 1) * stepX) + ' ' + (pad.top + chartH) + ' L ' + pad.left + ' ' + (pad.top + chartH) + ' Z';
  container.innerHTML = '<svg width="100%" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" style="overflow:visible">' +
    gridLines +
    '<path d="' + areaD + '" fill="url(#areaGrad)" opacity="0.15"/>' +
    '<defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + lineColor + '"/>' +
      '<stop offset="100%" stop-color="' + lineColor + '" stop-opacity="0"/>' +
    '</linearGradient></defs>' +
    '<path d="' + pathD + '" fill="none" stroke="' + lineColor + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    dots + labels +
    '<line x1="' + pad.left + '" y1="' + pad.top + '" x2="' + (pad.left + chartW) + '" y2="' + pad.top + '" stroke="#e5e7eb" stroke-width="1"/>' +
    '<line x1="' + pad.left + '" y1="' + (pad.top + chartH) + '" x2="' + (pad.left + chartW) + '" y2="' + (pad.top + chartH) + '" stroke="#e5e7eb" stroke-width="1"/>' +
  '</svg>';
}

function formatShort(val) {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
  return val.toString();
}

// Dashboard chart data
function getMonthlyMovement() {
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  var masuk = [12, 18, 25, 15, 30, 22, 20, 28, 32, 18, 14, 26];
  var keluar = [8, 14, 20, 12, 25, 18, 16, 22, 28, 14, 10, 22];
  return months.map(function(m, i) { return { label: m, masuk: masuk[i], keluar: keluar[i] }; });
}

function getStockDistribution() {
  return [
    { label: 'Gudang Jakarta', value: 452, color: '#1144F9' },
    { label: 'Gudang Medan', value: 324, color: '#22c55e' },
    { label: 'Gudang Surabaya', value: 228, color: '#f59e0b' },
  ];
}

function getMonthlyReportData(type) {
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  if (type === 'masuk') return months.map(function(m, i) { return { label: m, value: Math.floor(Math.random() * 30 + 15 + i * 2) }; });
  if (type === 'keluar') return months.map(function(m, i) { return { label: m, value: Math.floor(Math.random() * 25 + 10 + i * 1.5) }; });
  return months.map(function(m, i) { return { label: m, value: Math.floor(Math.random() * 20 + 5 + i * 2) }; });
}

// Custom bar chart for dashboard (stacked)
function createBarChartCustom(containerId, movement, width) {
  var container = document.getElementById(containerId);
  if (!container) return;
  if (movement === null) movement = getMonthlyMovement();
  if (width === undefined) width = container.clientWidth || 600;
  var height = 260;
  var pad = { top: 20, right: 20, bottom: 40, left: 50 };
  var chartW = width - pad.left - pad.right;
  var chartH = height - pad.top - pad.bottom;
  var maxVal = Math.max.apply(null, movement.flatMap(function(m) { return [m.masuk, m.keluar]; }).concat([1]));
  var groupW = chartW / movement.length;
  var barW = Math.max(4, groupW * 0.3);
  var html = '', gridLines = '';
  for (var i = 0; i < 5; i++) {
    var yVal = Math.round((maxVal / 4) * (4 - i));
    var y = pad.top + (chartH / 4) * i;
    gridLines += '<line x1="' + pad.left + '" y1="' + y + '" x2="' + (pad.left + chartW) + '" y2="' + y + '" stroke="#f0f0f0" stroke-width="1"/>';
    gridLines += '<text x="' + (pad.left - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="10" fill="#999">' + yVal + '</text>';
  }
  movement.forEach(function(m, i) {
    var cx = pad.left + groupW * i + groupW / 2;
    var masukH = (m.masuk / maxVal) * chartH;
    var keluarH = (m.keluar / maxVal) * chartH;
    var x1 = cx - barW - 2;
    var x2 = cx + 2;
    html += '<rect x="' + x1 + '" y="' + (pad.top + chartH - masukH) + '" width="' + barW + '" height="' + masukH + '" rx="2" fill="#1144F9" opacity="0.85"><title>Masuk: ' + m.masuk + '</title></rect>';
    html += '<rect x="' + x2 + '" y="' + (pad.top + chartH - keluarH) + '" width="' + barW + '" height="' + keluarH + '" rx="2" fill="#22c55e" opacity="0.85"><title>Keluar: ' + m.keluar + '</title></rect>';
    html += '<text x="' + cx + '" y="' + (pad.top + chartH + 18) + '" text-anchor="middle" font-size="9" fill="#999">' + m.label + '</text>';
  });
  html += '<line x1="' + pad.left + '" y1="' + pad.top + '" x2="' + (pad.left + chartW) + '" y2="' + pad.top + '" stroke="#e5e7eb" stroke-width="1"/>' +
    '<line x1="' + pad.left + '" y1="' + (pad.top + chartH) + '" x2="' + (pad.left + chartW) + '" y2="' + (pad.top + chartH) + '" stroke="#e5e7eb" stroke-width="1"/>' +
    '<rect x="' + (pad.left + chartW - 140) + '" y="' + (pad.top + 4) + '" width="60" height="10" rx="2" fill="#1144F9" opacity="0.85"/>' +
    '<text x="' + (pad.left + chartW - 75) + '" y="' + (pad.top + 13) + '" font-size="10" fill="#666">Masuk</text>' +
    '<rect x="' + (pad.left + chartW - 60) + '" y="' + (pad.top + 4) + '" width="60" height="10" rx="2" fill="#22c55e" opacity="0.85"/>' +
    '<text x="' + (pad.left + chartW + 5) + '" y="' + (pad.top + 13) + '" font-size="10" fill="#666">Keluar</text>';
  container.innerHTML = '<svg width="100%" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" style="overflow:visible">' + gridLines + html + '</svg>';
}
