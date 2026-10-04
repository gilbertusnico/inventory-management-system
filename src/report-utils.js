// ============================================
// INVENTARIS — Report Utilities (shared)
// ============================================

// --- Date Range State ---
export function getDateRange() {
  return {
    from: window._dateFrom || '',
    to: window._dateTo || ''
  };
}

export function inRange(dateStr, from, to) {
  if (!from && !to) return true;
  if (!dateStr) return !from && !to;
  if (from && dateStr < from) return false;
  if (to && dateStr > to) return false;
  return true;
}

/** Get last (most recent) N items sorted by date descending */
export function getLatest(arr, n = 1) {
  if (!arr || arr.length === 0) return [];
  var sorted = [...arr].sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); });
  return sorted.slice(0, n);
}

/** Filter array by date range, return new copy */
export function filterByDate(arr, dateKey) {
  if (!dateKey) dateKey = 'date';
  var range = getDateRange();
  if (!range.from && !range.to) return arr;
  return arr.filter(function(item) {
    return inRange(item[dateKey], range.from, range.to);
  });
}

/** Build monthly series for chart (respects date range filter) */
export function buildMonthlySeries(records, valueFn) {
  if (!records || records.length === 0) {
    // Return 12 empty months if no filter, or empty array if filtered but no data
    var range = getDateRange();
    if (!range.from && !range.to) {
      var months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
      return months.map(function(m) { return { label: m, value: 0 }; });
    }
    return [];
  }
  var range = getDateRange();
  var sorted = [...records].sort(function(a,b) { return (a.date||'').localeCompare(b.date||''); });
  var firstDate = range.from || sorted[0].date;
  var lastDate = range.to || sorted[sorted.length - 1].date;

  var start = new Date(firstDate + 'T00:00:00');
  var end = new Date(lastDate + 'T00:00:00');

  var months = [];
  var cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    var y = cur.getFullYear();
    var m = cur.getMonth();
    var shortLabel = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][m];
    var showYear = (start.getFullYear() !== end.getFullYear());
    months.push({
      label: showYear ? shortLabel + ' ' + String(y).slice(-2) : shortLabel,
      year: y,
      month: m,
      value: 0
    });
    cur.setMonth(cur.getMonth() + 1);
  }

  // Aggregate actual data into month buckets
  records.forEach(function(rec) {
    if (!rec.date) return;
    var d = new Date(rec.date + 'T00:00:00');
    var m = d.getMonth();
    var y = d.getFullYear();
    for (var i = 0; i < months.length; i++) {
      if (months[i].year === y && months[i].month === m) {
        months[i].value += (valueFn ? valueFn(rec) : 1);
        break;
      }
    }
  });

  return months.map(function(m) { return { label: m.label, value: m.value }; });
}

/** Build paired monthly series for mutasi (masuk & keluar per bulan) */
export function buildMutasiSeries(masukRecords, keluarRecords) {
  var range = getDateRange();
  var all = [];
  masukRecords.forEach(function(r) { if (r.date) all.push(r.date); });
  keluarRecords.forEach(function(r) { if (r.date) all.push(r.date); });
  all.sort();

  if (all.length === 0) {
    if (!range.from && !range.to) {
      var months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
      return months.map(function(m) { return { label: m, masuk: 0, keluar: 0 }; });
    }
    if (!range.from || !range.to) return [];
    var emptyStart = new Date(range.from + 'T00:00:00');
    var emptyEnd = new Date(range.to + 'T00:00:00');
    var emptySeries = [];
    var emptyCursor = new Date(emptyStart.getFullYear(), emptyStart.getMonth(), 1);
    while (emptyCursor <= emptyEnd) {
      var emptyYear = emptyCursor.getFullYear();
      var emptyMonth = emptyCursor.getMonth();
      var emptyLabel = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][emptyMonth];
      if (emptyStart.getFullYear() !== emptyEnd.getFullYear()) {
        emptyLabel += ' ' + String(emptyYear).slice(-2);
      }
      emptySeries.push({ label: emptyLabel, masuk: 0, keluar: 0 });
      emptyCursor.setMonth(emptyCursor.getMonth() + 1);
    }
    return emptySeries;
  }

  var firstDate = range.from || all[0];
  var lastDate = range.to || all[all.length - 1];
  var start = new Date(firstDate + 'T00:00:00');
  var end = new Date(lastDate + 'T00:00:00');

  var months = [];
  var cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    var y = cur.getFullYear();
    var m = cur.getMonth();
    var shortLabel = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][m];
    var showYear = (start.getFullYear() !== end.getFullYear());
    months.push({
      label: showYear ? shortLabel + ' ' + String(y).slice(-2) : shortLabel,
      year: y, month: m, masuk: 0, keluar: 0
    });
    cur.setMonth(cur.getMonth() + 1);
  }

  function aggregate(records, key) {
    records.forEach(function(rec) {
      if (!rec.date) return;
      var d = new Date(rec.date + 'T00:00:00');
      var mm = d.getMonth(), yy = d.getFullYear();
      for (var i = 0; i < months.length; i++) {
        if (months[i].year === yy && months[i].month === mm) {
          var tot = rec.items.reduce(function(s, it) { return s + it.qty; }, 0);
          months[i][key] += tot;
          break;
        }
      }
    });
  }
  aggregate(masukRecords, 'masuk');
  aggregate(keluarRecords, 'keluar');

  return months;
}

// --- Shared Filter Bar HTML ---
export function reportFilterBar(reportType, rightSideHtml) {
  var range = getDateRange();
  var fromVal = range.from || '';
  var toVal = range.to || '';
  var hasFilter = !!(fromVal || toVal);

  return '<div class="report-filter-bar">' +
    '<div class="date-range-inputs">' +
      '<span class="date-label">Dari</span>' +
      '<input type="date" class="date-input" id="dateFrom" value="' + fromVal + '">' +
      '<span class="date-label">s/d</span>' +
      '<input type="date" class="date-input" id="dateTo" value="' + toVal + '">' +
      (hasFilter
        ? '<button class="btn btn-secondary btn-sm" data-report-action="reset-daterange" title="Reset filter">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Reset</button>'
        : '') +
    '</div>' +
    '<div class="report-actions">' +
      (rightSideHtml || '') +
      '<button class="btn btn-primary btn-sm" data-report-action="export-pdf" data-report="' + reportType + '">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' +
        ' Export PDF</button>' +
    '</div>' +
  '</div>';
}