// ============================================
// INVENTARIS — SVG Chart Renderers
// ============================================
import { warehouses, productStocks, products, barangMasuk, barangKeluar } from './data.js';

export function createBarChart(containerId, data, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const { width = container.clientWidth || 600, height = 280, barColor = '#1144F9', labelColor = '#999' } = options;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.max(8, Math.min(36, chartW / data.length - 8));
  const gap = (chartW - barWidth * data.length) / (data.length + 1);

  let bars = '';
  let labels = '';
  let gridLines = '';

  for (let i = 0; i < 5; i++) {
    const yVal = (maxVal / 4) * (4 - i);
    const y = pad.top + (chartH / 4) * i;
    gridLines += `<line x1="${pad.left}" y1="${y}" x2="${pad.left + chartW}" y2="${y}" stroke="#f0f0f0" stroke-width="1"/>`;
    gridLines += `<text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="${labelColor}">${formatShort(yVal)}</text>`;
  }

  data.forEach((d, i) => {
    const x = pad.left + gap + i * (barWidth + gap);
    const barH = (d.value / maxVal) * chartH;
    const y = pad.top + chartH - barH;
    const color = d.color || barColor;
    bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="3" fill="${color}" opacity="0.85">
      <title>${d.label}: ${d.value}</title>
    </rect>`;
    bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="3" fill="transparent" class="bar-hover" data-value="${d.value}" data-label="${d.label}"/>`;
    labels += `<text x="${x + barWidth / 2}" y="${pad.top + chartH + 18}" text-anchor="middle" font-size="9" fill="${labelColor}">${d.label.substring(0, 3)}</text>`;
  });

  container.innerHTML = `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible">
    ${gridLines}
    ${bars}
    ${labels}
    <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top + chartH}" stroke="#e5e7eb" stroke-width="1"/>
    <line x1="${pad.left}" y1="${pad.top + chartH}" x2="${pad.left + chartW}" y2="${pad.top + chartH}" stroke="#e5e7eb" stroke-width="1"/>
  </svg>`;
}

export function createDonutChart(containerId, data, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const { size = 200, strokeWidth = 36 } = options;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const colors = ['#1144F9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
  let cumulative = 0;
  let segments = '';
  let legendItems = '';

  data.forEach((d, i) => {
    const pct = d.value / total;
    const angle = pct * 360;
    const color = d.color || colors[i % colors.length];
    const offset = (cumulative / 100) * 283;
    const len = (pct * 283);
    segments += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"
      stroke-dasharray="${len} ${283 - len}" stroke-dashoffset="-${offset}" transform="rotate(-90 ${cx} ${cy})" opacity="0.85"/>`;
    cumulative += pct * 100;
    legendItems += `<div class="chart-legend-item" style="display:flex;align-items:center;gap:6px;font-size:12px;color:#666;margin:3px 0">
      <span style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0"></span>
      <span>${d.label}</span>
      <span style="margin-left:auto;font-weight:600;color:#111">${Math.round(pct * 100)}%</span>
    </div>`;
  });

  container.innerHTML = `<div style="display:flex;align-items:center;gap:24px;height:100%">
    <div style="position:relative;flex-shrink:0">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f0f0f0" stroke-width="${strokeWidth}"/>
        ${segments}
      </svg>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center">
        <div style="font-size:24px;font-weight:700;color:#111">${total}</div>
        <div style="font-size:11px;color:#999">Total</div>
      </div>
    </div>
    <div style="flex:1;min-width:0">${legendItems}</div>
  </div>`;
}

export function createLineChart(containerId, data, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const { width = container.clientWidth || 600, height = 280, lineColor = '#1144F9', labelColor = '#999' } = options;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const maxVal = Math.max(...data.map(d => d.value), 1);

  let points = '';
  let labels = '';
  let gridLines = '';
  let dots = '';

  for (let i = 0; i < 5; i++) {
    const yVal = (maxVal / 4) * (4 - i);
    const y = pad.top + (chartH / 4) * i;
    gridLines += `<line x1="${pad.left}" y1="${y}" x2="${pad.left + chartW}" y2="${y}" stroke="#f0f0f0" stroke-width="1"/>`;
    gridLines += `<text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="${labelColor}">${formatShort(yVal)}</text>`;
  }

  const stepX = data.length > 1 ? chartW / (data.length - 1) : 0;

  let pathD = '';
  data.forEach((d, i) => {
    const x = pad.left + i * stepX;
    const y = pad.top + chartH - (d.value / maxVal) * chartH;
    if (i === 0) pathD += `M ${x} ${y}`;
    else {
      const prevX = pad.left + (i - 1) * stepX;
      const prevY = pad.top + chartH - (data[i - 1].value / maxVal) * chartH;
      const cpx = (prevX + x) / 2;
      pathD += ` C ${cpx} ${prevY}, ${cpx} ${y}, ${x} ${y}`;
    }
    dots += `<circle cx="${x}" cy="${y}" r="3" fill="${lineColor}" stroke="white" stroke-width="2">
      <title>${d.label}: ${d.value}</title>
    </circle>`;
    dots += `<circle cx="${x}" cy="${y}" r="8" fill="transparent" class="dot-hover" data-value="${d.value}" data-label="${d.label}"/>`;
    labels += `<text x="${x}" y="${pad.top + chartH + 18}" text-anchor="middle" font-size="9" fill="${labelColor}">${d.label.substring(0, 3)}</text>`;
  });

  const areaD = pathD + ` L ${pad.left + (data.length - 1) * stepX} ${pad.top + chartH} L ${pad.left} ${pad.top + chartH} Z`;

  container.innerHTML = `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible">
    ${gridLines}
    <path d="${areaD}" fill="url(#areaGrad)" opacity="0.15"/>
    <defs>
      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${lineColor}"/>
        <stop offset="100%" stop-color="${lineColor}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${pathD}" fill="none" stroke="${lineColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    ${dots}
    ${labels}
    <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top + chartH}" stroke="#e5e7eb" stroke-width="1"/>
    <line x1="${pad.left}" y1="${pad.top + chartH}" x2="${pad.left + chartW}" y2="${pad.top + chartH}" stroke="#e5e7eb" stroke-width="1"/>
  </svg>`;
}

function formatShort(val) {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
  return val.toString();
}

// Monthly inventory movement data for dashboard
export function getMonthlyMovement() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  var masuk = months.map(function() { return 0; });
  var keluar = months.map(function() { return 0; });
  if (typeof barangMasuk !== 'undefined') {
    barangMasuk.forEach(function(t) {
      var m = new Date(t.date + 'T00:00:00').getMonth();
      t.items.forEach(function(it) { masuk[m] += it.qty; });
    });
  }
  if (typeof barangKeluar !== 'undefined') {
    barangKeluar.forEach(function(t) {
      var m = new Date(t.date + 'T00:00:00').getMonth();
      t.items.forEach(function(it) { keluar[m] += it.qty; });
    });
  }
  return months.map(function(m, i) { return { label: m, masuk: masuk[i], keluar: keluar[i] }; });
}

export function getStockDistribution() {
  if (!warehouses || warehouses.length === 0) {
    return [{ label: 'Belum ada gudang', value: 1, color: '#ccc' }];
  }
  var colors = ['#1144F9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'];
  return warehouses.map(function(w, i) {
    var total = 0;
    for (var j = 0; j < productStocks.length; j++) {
      if (productStocks[j].warehouseId === w.id) total += productStocks[j].stock;
    }
    return { label: w.name, value: total || 1, color: colors[i % colors.length] };
  });
}

export function getMonthlyReportData(type) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  var masuk = months.map(function() { return 0; });
  var keluar = months.map(function() { return 0; });
  if (typeof barangMasuk !== 'undefined') {
    barangMasuk.forEach(function(t) {
      var m = new Date(t.date + 'T00:00:00').getMonth();
      t.items.forEach(function(it) { masuk[m] += it.qty; });
    });
  }
  if (typeof barangKeluar !== 'undefined') {
    barangKeluar.forEach(function(t) {
      var m = new Date(t.date + 'T00:00:00').getMonth();
      t.items.forEach(function(it) { keluar[m] += it.qty; });
    });
  }
  if (type === 'masuk') return months.map((m, i) => ({ label: m, value: masuk[i] }));
  if (type === 'keluar') return months.map((m, i) => ({ label: m, value: keluar[i] }));
  return months.map((m, i) => ({ label: m, value: masuk[i] - keluar[i] }));
}
