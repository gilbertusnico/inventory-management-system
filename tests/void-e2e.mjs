// ============================================
// E2E TEST — Alur Void/Hapus Transaksi (multi-warehouse)
// Menggunakan handler ASLI (src/handlers.js) di dalam JSDOM
// ============================================
import { JSDOM } from 'jsdom';
import { pathToFileURL } from 'url';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div><div id="pageContent"></div><div id="toastContainer"></div><div id="breadcrumb"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
// localStorage harus KOSONG agar seed data dipakai (initFromStorage)
dom.window.localStorage.clear();

// ============================================
// IMPOR MODUL ASLI
// ============================================
const h = await import(pathToFileURL(process.cwd() + '/src/handlers.js').href);
const d = await import(pathToFileURL(process.cwd() + '/src/data.js').href);

const { handleDelete } = h;
const { getProductStock, getProduct, getWarehouse, barangMasuk, barangKeluar, stockAdjustments, stockTransfers } = d;

// ============================================
// HELPERS
// ============================================
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stock = (pid, wid) => { const ps = getProductStock(pid, wid); return ps ? ps.stock : 0; };
const modalOpen = () => !!document.querySelector('.modal-overlay');
const modalBodyText = () => document.querySelector('.modal-body')?.textContent || '';
const lastToast = () => {
  const toasts = document.querySelectorAll('#toastContainer .toast');
  if (!toasts.length) return null;
  const t = toasts[toasts.length - 1];
  return { type: t.className.includes('error') ? 'error' : t.className.includes('info') ? 'info' : 'success', msg: t.querySelector('.toast-message')?.textContent || '' };
};
const openDelete = async (action, id) => { handleDelete(action, id); await sleep(70); };
const clickConfirm = async () => {
  const btn = document.getElementById('confirmDelete');
  if (!btn) return false;
  btn.click();
  await sleep(110); // saveAndRefresh → reRender + toast(80ms)
  return true;
};

let pass = 0, fail = 0;
const check = (label, cond, extra) => {
  console.log((cond ? '  ✅ ' : '  ❌ ') + label + (extra ? '  [' + extra + ']' : ''));
  cond ? pass++ : fail++;
};

console.log('========================================');
console.log('TEST 1 — Void BM #1 (AMAN: stok cukup)');
console.log('========================================');
// BM#1: WH2 (Gudang Jakarta), prod1 qty10 (stok 12), prod2 qty5 (stok 8)
{
  const before1 = stock(1, 2), before2 = stock(2, 2);
  await openDelete('delete-bm', 1);
  check('Modal konfirmasi muncul', modalOpen());
  check('Tidak ada toast error', !lastToast() || lastToast().type !== 'error');
  check('Stok BELUM berubah sebelum konfirmasi', stock(1, 2) === before1 && stock(2, 2) === before2);
  const body = modalBodyText();
  check('Info teks spesifik: stok akan berkurang', body.includes('stok berkurang'));
  check('Tombol "Ya, Hapus" tersedia', !!document.getElementById('confirmDelete'));
  const clicked = await clickConfirm();
  check('Konfirmasi diklik & selesai', clicked);
  check('Stok prod1 WH2 berkurang 12→2', stock(1, 2) === before1 - 10, 'stok=' + stock(1, 2));
  check('Stok prod2 WH2 berkurang 8→3', stock(2, 2) === before2 - 5, 'stok=' + stock(2, 2));
  check('BM #1 dihapus dari daftar', !barangMasuk.find((x) => x.id === 1));
  const t = lastToast();
  check('Toast sukses muncul', t && t.type === 'success');
}

console.log('========================================');
console.log('TEST 2 — Void BM #2 (TIDAK AMAN: stok tidak cukup)');
console.log('========================================');
// BM#2: WH1 (Gudang Medan), prod3 qty20 (stok 25), prod4 qty15 (stok 2 → <15 → BLOCK)
{
  await openDelete('delete-bm', 2);
  check('Modal konfirmasi TIDAK muncul (diblokir)', !modalOpen());
  const t = lastToast();
  check('Toast ERROR muncul', t && t.type === 'error');
  check('Pesan menyebut nama produk (Mouse Wireless Logitech)', t && t.msg.includes('Mouse Wireless Logitech'));
  check('Pesan menyebut angka stok (2) & qty (15)', t && t.msg.includes('2 pcs') && t.msg.includes('15 pcs'));
  check('Pesan menyebut gudang (Gudang Medan)', t && t.msg.includes('Gudang Medan'));
  check('Stok TIDAK berubah (25 & 2)', stock(3, 1) === 25 && stock(4, 1) === 2);
  check('BM #2 MASIH ada di daftar', !!barangMasuk.find((x) => x.id === 2));
}

console.log('========================================');
console.log('TEST 3 — Void BM #6 (TIDAK AMAN: stok terkuras oleh transaksi lain)');
console.log('========================================');
// Setelah Test 1, stok prod1 WH2 = 2. BM#6: WH2, prod1 qty5 → 2 < 5 → BLOCK
{
  check('Prasyarat: stok prod1 WH2 = 2', stock(1, 2) === 2, 'stok=' + stock(1, 2));
  await openDelete('delete-bm', 6);
  check('Modal TIDAK muncul', !modalOpen());
  const t = lastToast();
  check('Toast ERROR muncul dengan nama produk', t && t.type === 'error' && t.msg.includes('Laptop ThinkPad X1'));
  check('Stok tetap 2 (tidak negatif)', stock(1, 2) === 2);
  check('BM #6 MASIH ada', !!barangMasuk.find((x) => x.id === 6));
}

console.log('========================================');
console.log('TEST 4 — Void BK #1 (AMAN: stok bertambah)');
console.log('========================================');
// BK#1: WH2, prod1 qty1, prod3 qty2. Void → +1 & +2 (selalu aman)
{
  await openDelete('delete-bk', 1);
  check('Modal konfirmasi muncul', modalOpen());
  check('Info teks spesifik: stok bertambah', modalBodyText().includes('stok bertambah'));
  await clickConfirm();
  check('Stok prod1 WH2 bertambah 2→3', stock(1, 2) === 3, 'stok=' + stock(1, 2));
  check('Stok prod3 WH2 dibuat 0→2', stock(3, 2) === 2, 'stok=' + stock(3, 2));
  check('BK #1 dihapus dari daftar', !barangKeluar.find((x) => x.id === 1));
}

console.log('========================================');
console.log('TEST 5 — Void SA #5 (kembali ke stok sistem)');
console.log('========================================');
// SA#5: prod3 WH1, sistem 23, fisik 25. Void → setStock(23)
{
  check('Prasyarat: stok prod3 WH1 = 25', stock(3, 1) === 25, 'stok=' + stock(3, 1));
  await openDelete('delete-sa', 5);
  check('Modal konfirmasi muncul', modalOpen());
  check('Info teks spesifik: kembali ke stok sistem', modalBodyText().includes('stok sistem'));
  await clickConfirm();
  check('Stok prod3 WH1 kembali ke 23', stock(3, 1) === 23, 'stok=' + stock(3, 1));
  check('SA #5 dihapus dari daftar', !stockAdjustments.find((x) => x.id === 5));
}

console.log('========================================');
console.log('TEST 6 — Void ST #1 (TIDAK AMAN: stok gudang tujuan = 0)');
console.log('========================================');
// ST#1: WH2→WH1, prod1 qty2, prod2 qty1. Stok WH1: prod1=0, prod2=0 → BLOCK
{
  check('Prasyarat: stok tujuan WH1 = 0', stock(1, 1) === 0 && stock(2, 1) === 0);
  await openDelete('delete-st', 1);
  check('Modal TIDAK muncul', !modalOpen());
  const t = lastToast();
  check('Toast ERROR muncul', t && t.type === 'error');
  check('Pesan menyebut "Transfer Stok" & nama produk', t && t.msg.includes('Transfer Stok') && t.msg.includes('Laptop ThinkPad X1'));
  check('Pesan menyebut gudang tujuan (Gudang Medan)', t && t.msg.includes('Gudang Medan'));
  check('Stok asal & tujuan TIDAK berubah', stock(1, 2) === 3 && stock(1, 1) === 0);
  check('ST #1 MASIH ada', !!stockTransfers.find((x) => x.id === 1));
}

console.log('========================================');
console.log('TEST 7 — Void ST #1 (AMAN: stok tujuan dicukupkan dulu)');
console.log('========================================');
// Tambah stok tujuan lalu void → +qty di asal (WH2), -qty di tujuan (WH1)
{
  d.addStock(1, 1, 2); // prod1 WH1: 0→2
  d.addStock(2, 1, 1); // prod2 WH1: 0→1
  await openDelete('delete-st', 1);
  check('Modal konfirmasi muncul', modalOpen());
  check('Info teks spesifik: void transfer', modalBodyText().includes('void transfer'));
  await clickConfirm();
  check('Stok prod1 WH2 kembali +2 (3→5)', stock(1, 2) === 5, 'stok=' + stock(1, 2));
  check('Stok prod2 WH2 kembali +1 (3→4)', stock(2, 2) === 4, 'stok=' + stock(2, 2));
  check('Stok prod1 WH1 ditarik -2 (2→0)', stock(1, 1) === 0, 'stok=' + stock(1, 1));
  check('Stok prod2 WH1 ditarik -1 (1→0)', stock(2, 1) === 0, 'stok=' + stock(2, 1));
  check('Tidak ada stok NEGATIF', stock(1, 1) >= 0 && stock(2, 1) >= 0 && stock(1, 2) >= 0);
  check('ST #1 dihapus dari daftar', !stockTransfers.find((x) => x.id === 1));
}

console.log('========================================');
console.log('TEST 8 — Void ST #2 & #3 (kondisi nyata: stok tujuan 0 → diblokir)');
console.log('========================================');
{
  // ST#2: WH2→WH3, prod8 qty20, prod14 qty50. Stok prod8 WH3 = 0 → BLOCK
  await openDelete('delete-st', 2);
  check('ST#2: modal TIDAK muncul', !modalOpen());
  const t2 = lastToast();
  check('ST#2: toast error (Screen Protector)', t2 && t2.type === 'error' && t2.msg.includes('Screen Protector Tempered Glass'));
  check('ST#2: tetap ada di daftar', !!stockTransfers.find((x) => x.id === 2));

  // ST#3: WH1→WH2, prod7 qty5. Stok prod7 WH2 = 0 → BLOCK
  await openDelete('delete-st', 3);
  check('ST#3: modal TIDAK muncul', !modalOpen());
  const t3 = lastToast();
  check('ST#3: toast error (USB-C Hub)', t3 && t3.type === 'error' && t3.msg.includes('USB-C Hub'));
  check('ST#3: tetap ada di daftar', !!stockTransfers.find((x) => x.id === 3));
}

console.log('');
console.log('========================================');
console.log('RINGKASAN: ' + pass + ' passed, ' + fail + ' failed');
console.log('========================================');
process.exit(fail > 0 ? 1 : 0);
