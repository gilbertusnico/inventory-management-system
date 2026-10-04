// ============================================
// StockFolio — Export PDF Utilities
// ============================================
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import {
  categories, suppliers, warehouses,
  barangMasuk, barangKeluar,
  getProduct, getSupplier, getWarehouse, getCategory,
  getProductStockRows, formatDate
} from './data.js';
import { getDateRange, inRange, filterByDate, buildMutasiSeries } from './report-utils.js';

function header(doc, title, subtitle) {
  var w = doc.internal.pageSize.getWidth();
  // Top bar
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, w, 28, 'F');
  doc.setTextColor(255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('StockFolio', 14, 18);
  doc.setFontSize(9);
  doc.text(title + (subtitle ? ' - ' + subtitle : ''), w - 14, 18, { align: 'right' });

  // Period & print date
  var range = getDateRange();
  var period = (range.from || range.to)
    ? 'Periode: ' + (range.from || 'awal') + ' s/d ' + (range.to || 'sekarang')
    : 'Periode: Semua data';
  doc.setTextColor(102);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(period + ' | Cetak: ' + new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }), 14, 35);
  return 38; // startY
}

function summaryCard(doc, startY, items) {
  var w = doc.internal.pageSize.getWidth();
  var cardW = (w - 28 - 8) / 3;
  doc.setDrawColor(220);
  doc.setFontSize(8);
  items.forEach(function(item, i) {
    var x = 14 + i * (cardW + 4);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(x, startY, cardW, 28, 2, 2, 'F');
    doc.setDrawColor(224);
    doc.roundedRect(x, startY, cardW, 28, 2, 2, 'S');
    doc.setTextColor(102);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(item.label, x + 6, startY + 10);
    doc.setTextColor(17, 17, 17);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(String(item.value), x + 6, startY + 24);
  });
  return startY + 36;
}

function footer(doc, pageNumber) {
  var w = doc.internal.pageSize.getWidth();
  doc.setDrawColor(200);
  doc.line(14, doc.internal.pageSize.getHeight() - 18, w - 14, doc.internal.pageSize.getHeight() - 18);
  doc.setTextColor(150);
  doc.setFontSize(7);
  doc.text('StockFolio | Powered by  Overkreatif | Halaman ' + pageNumber, 14, doc.internal.pageSize.getHeight() - 10);
  doc.text('Dicetak ' + new Date().toLocaleString('id-ID'), w - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
}

function autoTableOptions(startY) {
  return {
    startY: startY,
    styles: { fontSize: 7.5, cellPadding: 3, textColor: [51, 51, 51], overflow: 'linebreak' },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    alternateRowStyles: { fillColor: [245, 247, 255] },
    margin: { left: 14, right: 14, top: 40, bottom: 22 },
    didDrawPage: function(data) {
      footer(data.doc, data.pageNumber);
    }
  };
}

// ======================
// EXPORT BY TYPE
// ======================

export function buildReportPDF(type) {
  var doc = new jsPDF('landscape');
  var startY, items, cols, title, subtitle, summaryItems;

  switch (type) {
    case 'stok':
      title = 'Laporan Stok Saat Ini';
      subtitle = 'Semua Produk';
      startY = header(doc, title, subtitle);
      var rows = getProductStockRows();
      var stockRange = getDateRange();
      if (stockRange.from || stockRange.to) {
        rows = rows.filter(function(row) {
          return inRange(row.createdAt, stockRange.from, stockRange.to);
        });
      }
      var stockSearch = (window._searchTerm || '').toLowerCase();
      if (stockSearch) {
        rows = rows.filter(function(row) {
          return row.name.toLowerCase().includes(stockSearch) ||
            row.sku.toLowerCase().includes(stockSearch);
        });
      }
      var totalSKU = new Set(rows.map(function(row) { return row.id; })).size;
      var totalItem = rows.reduce(function(s, r) { return s + r.stock; }, 0);
      var totalVal = rows.reduce(function(s, r) { return s + r.stock * r.price; }, 0);
      summaryItems = [
        { label: 'Total Produk (SKU)', value: totalSKU },
        { label: 'Total Item', value: totalItem },
        { label: 'Total Nilai', value: 'Rp ' + totalVal.toLocaleString('id-ID') }
      ];
      startY = summaryCard(doc, startY, summaryItems);
      cols = ['SKU', 'Produk', 'Kategori', 'Supplier', 'Gudang', 'Harga', 'Stok', 'Nilai'];
      items = rows.map(function(r) {
        var cat = getCategory(r.categoryId);
        var sup = getSupplier(r.supplierId);
        var wh = getWarehouse(r.warehouseId);
        var total = r.stock * r.price;
        return [
          r.sku,
          r.name,
          cat ? cat.name : '-',
          sup ? sup.name : '-',
          wh ? wh.name : '-',
          'Rp ' + (r.price || 0).toLocaleString('id-ID'),
          String(r.stock),
          'Rp ' + (total || 0).toLocaleString('id-ID')
        ];
      });
      autoTable(doc, Object.assign(autoTableOptions(startY), {
        columns: cols.map(function(c) { return { header: c, dataKey: c.toLowerCase() }; }),
        body: items.map(function(row) {
          return { sku: row[0], produk: row[1], kategori: row[2], supplier: row[3], gudang: row[4], harga: row[5], stok: row[6], nilai: row[7] };
        })
      }));
      break;

    case 'masuk':
      title = 'Laporan Barang Masuk';
      startY = header(doc, title, '');
      var filtered = filterByDate(barangMasuk);
      var totalQty = filtered.reduce(function(s, t) { return s + t.items.reduce(function(si, i) { return si + i.qty; }, 0); }, 0);
      var latest = filtered.length > 0 ? filtered.slice().sort(function(a,b) { return (b.date||'').localeCompare(a.date||''); })[0] : null;
      var latestQty = latest ? latest.items.reduce(function(s,i) { return s + i.qty; }, 0) : 0;
      summaryItems = [
        { label: 'Total Penerimaan', value: totalQty + ' item' },
        { label: 'Total Transaksi', value: filtered.length + ' transaksi' },
        { label: 'Terakhir', value: latest ? latestQty + ' item (' + formatDate(latest.date) + ')' : '-' }
      ];
      startY = summaryCard(doc, startY, summaryItems);
      cols = ['Tanggal', 'Referensi', 'Supplier', 'Gudang', 'Qty', 'Catatan'];
      items = filtered.sort(function(a,b) { return (b.date||'').localeCompare(a.date||''); }).map(function(t) {
        var sup = getSupplier(t.supplierId);
        var wh = getWarehouse(t.warehouseId);
        var qty = t.items.reduce(function(s,i) { return s + i.qty; }, 0);
        return [
          formatDate(t.date),
          t.ref || '-',
          sup ? sup.name : '-',
          wh ? wh.name : '-',
          String(qty) + ' item',
          t.note || '-'
        ];
      });
      autoTable(doc, Object.assign(autoTableOptions(startY), {
        head: [cols],
        body: items
      }));
      break;

    case 'keluar':
      title = 'Laporan Barang Keluar';
      startY = header(doc, title, '');
      var filteredK = filterByDate(barangKeluar);
      var totalQtyK = filteredK.reduce(function(s, t) { return s + t.items.reduce(function(si, i) { return si + i.qty; }, 0); }, 0);
      var latestK = filteredK.length > 0 ? filteredK.slice().sort(function(a,b) { return (b.date||'').localeCompare(a.date||''); })[0] : null;
      var latestQtyK = latestK ? latestK.items.reduce(function(s,i) { return s + i.qty; }, 0) : 0;
      summaryItems = [
        { label: 'Total Pengeluaran', value: totalQtyK + ' item' },
        { label: 'Total Transaksi', value: filteredK.length + ' transaksi' },
        { label: 'Terakhir', value: latestK ? latestQtyK + ' item (' + formatDate(latestK.date) + ')' : '-' }
      ];
      startY = summaryCard(doc, startY, summaryItems);
      cols = ['Tanggal', 'Referensi', 'Penerima', 'Gudang', 'Qty', 'Catatan'];
      items = filteredK.sort(function(a,b) { return (b.date||'').localeCompare(a.date||''); }).map(function(t) {
        var wh = getWarehouse(t.warehouseId);
        var qty = t.items.reduce(function(s,i) { return s + i.qty; }, 0);
        return [
          formatDate(t.date),
          t.ref || '-',
          t.penerima,
          wh ? wh.name : '-',
          String(qty) + ' item',
          t.note || '-'
        ];
      });
      autoTable(doc, Object.assign(autoTableOptions(startY), {
        head: [cols],
        body: items
      }));
      break;

    case 'mutasi':
      title = 'Laporan Mutasi Stok';
      startY = header(doc, title, '');
      var filteredM = filterByDate(barangMasuk);
      var filteredMK = filterByDate(barangKeluar);
      var totalMasuk = filteredM.reduce(function(s, t) { return s + t.items.reduce(function(si, i) { return si + i.qty; }, 0); }, 0);
      var totalKeluar = filteredMK.reduce(function(s, t) { return s + t.items.reduce(function(si, i) { return si + i.qty; }, 0); }, 0);
      var selisih = totalMasuk - totalKeluar;
      summaryItems = [
        { label: 'Total Barang Masuk', value: totalMasuk + ' item' },
        { label: 'Total Barang Keluar', value: totalKeluar + ' item' },
        { label: 'Selisih', value: (selisih >= 0 ? '+' : '') + selisih }
      ];
      startY = summaryCard(doc, startY, summaryItems);

      var series = buildMutasiSeries(filteredM, filteredMK);
      cols = ['Bulan', 'Barang Masuk', 'Barang Keluar', 'Selisih'];
      items = series.map(function(s) {
        var diff = s.masuk - s.keluar;
        return [
          s.label,
          String(s.masuk) + ' item',
          String(s.keluar) + ' item',
          (diff >= 0 ? '+' : '') + diff
        ];
      });
      autoTable(doc, Object.assign(autoTableOptions(startY), {
        head: [cols],
        body: items
      }));
      break;

    default:
      return;
  }

  return doc;
}

export function exportReportPDF(type) {
  var doc = buildReportPDF(type);
  if (doc) {
    doc.save('laporan-' + type + '-' + new Date().toISOString().split('T')[0] + '.pdf');
  }
}