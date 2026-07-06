// ============================================
// INVENTARIS — CRUD Handlers (multi-warehouse)
// ============================================
import { icon } from './icons.js';
import { products, categories, suppliers, warehouses, barangMasuk, barangKeluar, stockAdjustments, stockTransfers, users, productStocks, getProduct, getBarangMasuk, getBarangKeluar, getWarehouse, getSupplier, getProductStock, getTotalStock, addStock, setStock, saveAllData, getNextRef, formatDate } from './data.js';
import { showModal, closeModal, showToast } from './pages.js';

window.closeModal = closeModal;
window.showToast = showToast;

function nextId(arr) {
  if (!arr || arr.length === 0) return 1;
  var max = 0;
  for (var i = 0; i < arr.length; i++) { if (arr[i].id > max) max = arr[i].id; }
  return max + 1;
}
function getCurrentRoute() { return (window.location.hash || '#/dashboard').split('?')[0]; }
function reRender() { if (typeof renderPage === 'function') renderPage(getCurrentRoute()); else window.location.reload(); }

// Save + reRender BEFORE closing modal to avoid white flash
function saveAndRefresh(msg) {
  saveAllData();
  reRender();
  closeModal();
  setTimeout(function() { showToast(msg || 'Data berhasil disimpan', 'success'); }, 80);
}

// ======================
// MASTER DATA ADD: PRODUK
// ======================
export function handleAddMaster(type) {
  if (type === 'add-produk') {
    var catOpts = categories.map(function(c) { return '<option value="' + c.id + '">' + c.name + '</option>'; }).join('');
    var supOpts = suppliers.map(function(s) { return '<option value="' + s.id + '">' + s.name + '</option>'; }).join('');
    var whOpts = warehouses.map(function(w) { return '<option value="' + w.id + '">' + w.name + '</option>'; }).join('');
    showModal('Tambah Produk Baru',
      '<div class="form-grid">' +
        '<div class="form-group"><label class="form-label">Nama Produk <span class="required">*</span></label><input class="form-input" id="f_name" placeholder="Nama produk"></div>' +
        '<div class="form-group"><label class="form-label">SKU <span class="required">*</span></label><input class="form-input" id="f_sku" placeholder="Contoh: ELE-001"></div>' +
        '<div class="form-group"><label class="form-label">Kategori <span class="required">*</span></label><select class="form-select" id="f_category">' + catOpts + '</select></div>' +
        '<div class="form-group"><label class="form-label">Supplier <span class="required">*</span></label><select class="form-select" id="f_supplier">' + supOpts + '</select></div>' +
        '<div class="form-group"><label class="form-label">Harga <span class="required">*</span></label><input class="form-input" id="f_price" type="number" placeholder="Harga jual"></div>' +
        '<div class="form-group"><label class="form-label">Min. Stok</label><input class="form-input" id="f_minStock" type="number" value="5"></div>' +
        '<div class="form-group"><label class="form-label">Status</label><select class="form-select" id="f_status"><option value="Aktif">Aktif</option><option value="Nonaktif">Nonaktif</option></select></div>' +
      '</div>' +
      '<div style="margin-top:16px;border-top:1px solid #e5e7eb;padding-top:12px"><strong style="font-size:13px">Stok Awal</strong></div>' +
      '<div class="form-grid" style="margin-top:8px">' +
        '<div class="form-group"><label class="form-label">Gudang</label><select class="form-select" id="f_warehouse">' + whOpts + '</select></div>' +
        '<div class="form-group"><label class="form-label">Stok Awal</label><input class="form-input" id="f_stock" type="number" value="0"></div>' +
      '</div>',
      '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveMaster">Simpan</button>');
    setTimeout(function() {
      var saveBtn = document.getElementById('saveMaster');
      if (saveBtn) {
        saveBtn.addEventListener('click', function() {
          var newId = nextId(products);
          var whId = parseInt(document.getElementById('f_warehouse') ? document.getElementById('f_warehouse').value : 1) || 1;
          var stok = parseInt(document.getElementById('f_stock') ? document.getElementById('f_stock').value : 0) || 0;
          products.push({
            id: newId,
            sku: (document.getElementById('f_sku') ? document.getElementById('f_sku').value : '') || 'NEW-' + String(newId).padStart(3, '0'),
            name: (document.getElementById('f_name') ? document.getElementById('f_name').value : '') || 'Produk Baru',
            categoryId: parseInt(document.getElementById('f_category') ? document.getElementById('f_category').value : 1) || 1,
            supplierId: parseInt(document.getElementById('f_supplier') ? document.getElementById('f_supplier').value : 1) || 1,
            price: parseInt(document.getElementById('f_price') ? document.getElementById('f_price').value : 0) || 0,
            minStock: parseInt(document.getElementById('f_minStock') ? document.getElementById('f_minStock').value : 5) || 5,
            status: (document.getElementById('f_status') ? document.getElementById('f_status').value : '') || 'Aktif',
            createdAt: new Date().toISOString().split('T')[0]
          });
          // Add initial stock for the selected warehouse
          setStock(newId, whId, stok);
          saveAndRefresh('Produk berhasil ditambahkan');
        });
      }
    }, 50);
  }
}

// ======================
// KATEGORI
// ======================
export function handleAddKategori() {
  showModal('Tambah Kategori',
    '<div class="form-grid full">' +
      '<div class="form-group"><label class="form-label">Nama Kategori <span class="required">*</span></label><input class="form-input" id="k_name" placeholder="Nama kategori"></div>' +
      '<div class="form-group"><label class="form-label">Deskripsi</label><textarea class="form-textarea" id="k_desc" rows="3" placeholder="Deskripsi kategori"></textarea></div>' +
    '</div>',
    '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveKategori">Simpan</button>');
  setTimeout(function() {
    var saveBtn = document.getElementById('saveKategori');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        categories.push({
          id: nextId(categories),
          name: (document.getElementById('k_name') ? document.getElementById('k_name').value : '') || 'Kategori Baru',
          description: (document.getElementById('k_desc') ? document.getElementById('k_desc').value : '') || '',
          createdAt: new Date().toISOString().split('T')[0]
        });
        saveAndRefresh('Kategori berhasil ditambahkan');
      });
    }
  }, 50);
}

// ======================
// SUPPLIER
// ======================
export function handleAddSupplier() {
  showModal('Tambah Supplier',
    '<div class="form-grid">' +
      '<div class="form-group"><label class="form-label">Nama Supplier <span class="required">*</span></label><input class="form-input" id="s_name" placeholder="Nama perusahaan"></div>' +
      '<div class="form-group"><label class="form-label">PIC <span class="required">*</span></label><input class="form-input" id="s_pic" placeholder="Nama PIC"></div>' +
      '<div class="form-group"><label class="form-label">Email</label><input class="form-input" id="s_email" type="email" placeholder="email@perusahaan.com"></div>' +
      '<div class="form-group"><label class="form-label">Telepon</label><input class="form-input" id="s_phone" placeholder="021-5550123"></div>' +
    '</div>',
    '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveSupplier">Simpan</button>');
  setTimeout(function() {
    var saveBtn = document.getElementById('saveSupplier');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        suppliers.push({
          id: nextId(suppliers),
          name: (document.getElementById('s_name') ? document.getElementById('s_name').value : '') || 'Supplier Baru',
          pic: (document.getElementById('s_pic') ? document.getElementById('s_pic').value : '') || '',
          email: (document.getElementById('s_email') ? document.getElementById('s_email').value : '') || '',
          phone: (document.getElementById('s_phone') ? document.getElementById('s_phone').value : '') || '',
          createdAt: new Date().toISOString().split('T')[0]
        });
        saveAndRefresh('Supplier berhasil ditambahkan');
      });
    }
  }, 50);
}

// ======================
// GUDANG
// ======================
export function handleAddGudang() {
  showModal('Tambah Gudang',
    '<div class="form-grid">' +
      '<div class="form-group"><label class="form-label">Kode Gudang <span class="required">*</span></label><input class="form-input" id="g_code" placeholder="WH-XXX"></div>' +
      '<div class="form-group"><label class="form-label">Nama Gudang <span class="required">*</span></label><input class="form-input" id="g_name" placeholder="Nama gudang"></div>' +
      '<div class="form-group full"><label class="form-label">Lokasi <span class="required">*</span></label><input class="form-input" id="g_location" placeholder="Alamat lengkap"></div>' +
    '</div>',
    '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveGudang">Simpan</button>');
  setTimeout(function() {
    var saveBtn = document.getElementById('saveGudang');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var newId = nextId(warehouses);
        warehouses.push({
          id: newId,
          code: (document.getElementById('g_code') ? document.getElementById('g_code').value : '') || 'WH-' + String(newId).padStart(3, '0'),
          name: (document.getElementById('g_name') ? document.getElementById('g_name').value : '') || 'Gudang Baru',
          location: (document.getElementById('g_location') ? document.getElementById('g_location').value : '') || '',
          createdAt: new Date().toISOString().split('T')[0]
        });
        saveAndRefresh('Gudang berhasil ditambahkan');
      });
    }
  }, 50);
}

// ======================
// BARANG MASUK (with warehouse selection)
// ======================
export function handleAddBarangMasuk() {
  var supOpts = suppliers.map(function(s) { return '<option value="' + s.id + '">' + s.name + '</option>'; }).join('');
  var whOpts = warehouses.map(function(w) { return '<option value="' + w.id + '">' + w.name + '</option>'; }).join('');
  var prodOpts = products.map(function(p) {
    var total = getTotalStock(p.id);
    return '<option value="' + p.id + '">' + p.name + ' (total stok: ' + total + ')</option>';
  }).join('');
  var today = new Date().toISOString().split('T')[0];

  showModal('Barang Masuk Baru',
    '<div class="form-grid">' +
      '<div class="form-group"><label class="form-label">Tanggal <span class="required">*</span></label><input class="form-input" id="bm_date" type="date" value="' + today + '"></div>' +
      '<div class="form-group"><label class="form-label">Supplier <span class="required">*</span></label><select class="form-select" id="bm_supplier">' + supOpts + '</select></div>' +
      '<div class="form-group"><label class="form-label">Gudang Tujuan <span class="required">*</span></label><select class="form-select" id="bm_warehouse">' + whOpts + '</select></div>' +
      '<div class="form-group"><label class="form-label">No. Referensi</label><input class="form-input" id="bm_ref" placeholder="PO-2024-XXX"></div>' +
      '<div class="form-group"><label class="form-label">Catatan</label><textarea class="form-textarea" id="bm_note" rows="2"></textarea></div>' +
    '</div><div style="margin-top:16px">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
        '<div style="flex:1"><select class="form-select" id="bm_product" style="width:100%">' + prodOpts + '</select></div>' +
        '<div style="max-width:80px"><input class="form-input" id="bm_qty" type="number" placeholder="Qty" value="1" style="width:70px"></div>' +
        '<button class="btn btn-primary btn-sm" id="addBmItem" style="white-space:nowrap">' + icon('plus', 14) + ' Tambah</button>' +
      '</div>' +
      '<div id="bmItems" style="font-size:13px;color:#666;padding:6px 0;min-height:24px">Belum ada item</div>' +
    '</div>',
    '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveBm">Simpan</button>');

  window._bmItems = [];

  setTimeout(function() {
    var addBtn = document.getElementById('addBmItem');
    if (addBtn) {
      addBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var pid = parseInt(document.getElementById('bm_product')?.value);
        var qty = parseInt(document.getElementById('bm_qty')?.value) || 1;
        if (!pid) { showToast('Pilih produk dulu', 'error'); return; }
        if (!getProduct(pid)) { showToast('Produk tidak ditemukan', 'error'); return; }
        if (window._bmItems.find(function(i) { return i.productId == pid; })) {
          showToast('Produk sudah ditambahkan', 'info'); return;
        }
        window._bmItems.push({ productId: pid, qty: qty });
        document.getElementById('bmItems').innerHTML = window._bmItems.map(function(i) {
          var p2 = getProduct(i.productId);
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;margin:2px 0;border-radius:4px;background:#f9fafb">' +
            '<span style="font-weight:500">' + (p2 ? p2.name : '# ' + i.productId) + '</span>' +
            '<span style="font-weight:600;color:#1144F9">' + i.qty + ' pcs</span></div>';
        }).join('');
      });
    }
  }, 50);

  setTimeout(function() {
    var saveBtn = document.getElementById('saveBm');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var items = window._bmItems || [];
        if (items.length === 0) { showToast('Tambahkan minimal 1 item', 'error'); return; }
        var whId = parseInt(document.getElementById('bm_warehouse')?.value) || 1;
        for (var i = 0; i < items.length; i++) {
          addStock(items[i].productId, whId, items[i].qty);
        }
        barangMasuk.push({
          id: nextId(barangMasuk),
          date: document.getElementById('bm_date')?.value || today,
          supplierId: parseInt(document.getElementById('bm_supplier')?.value) || 1,
          warehouseId: whId,
          ref: document.getElementById('bm_ref')?.value || getNextRef('bm'),
          items: items.slice(),
          note: document.getElementById('bm_note')?.value || ''
        });
        window._bmItems = null;
        saveAndRefresh('Barang masuk berhasil dicatat. Stok produk bertambah.');
      });
    }
  }, 50);
}

// ======================
// BARANG KELUAR (with warehouse selection)
// ======================
export function handleAddBarangKeluar() {
  var whOpts = warehouses.map(function(w) { return '<option value="' + w.id + '">' + w.name + '</option>'; }).join('');
  var today = new Date().toISOString().split('T')[0];

  showModal('Barang Keluar Baru',
    '<div class="form-grid">' +
      '<div class="form-group"><label class="form-label">Tanggal <span class="required">*</span></label><input class="form-input" id="bk_date" type="date" value="' + today + '"></div>' +
      '<div class="form-group"><label class="form-label">Penerima/PIC <span class="required">*</span></label><input class="form-input" id="bk_penerima" placeholder="Nama penerima"></div>' +
      '<div class="form-group"><label class="form-label">Gudang Asal <span class="required">*</span></label><select class="form-select" id="bk_warehouse">' + whOpts + '</select></div>' +
      '<div class="form-group"><label class="form-label">No. Referensi</label><input class="form-input" id="bk_ref" placeholder="OUT-XXX"></div>' +
      '<div class="form-group"><label class="form-label">Catatan</label><textarea class="form-textarea" id="bk_note" rows="2"></textarea></div>' +
    '</div><div style="margin-top:16px" id="bkProdSection">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
        '<div style="flex:1"><select class="form-select" id="bk_product" style="width:100%"></select></div>' +
        '<div style="max-width:80px"><input class="form-input" id="bk_qty" type="number" placeholder="Qty" value="1" style="width:70px"></div>' +
        '<button class="btn btn-primary btn-sm" id="addBkItem" style="white-space:nowrap">' + icon('plus', 14) + ' Tambah</button>' +
      '</div>' +
      '<div id="bkItems" style="font-size:13px;color:#666;padding:6px 0;min-height:24px">Belum ada item</div>' +
    '</div>',
    '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveBk">Simpan</button>');

  function updateBkProducts() {
    var whId = parseInt(document.getElementById('bk_warehouse')?.value);
    var sel = document.getElementById('bk_product');
    if (!sel || !whId) return;
    var stocks = productStocks.filter(function(ps) { return ps.warehouseId === whId; });
    sel.innerHTML = stocks.map(function(ps) {
      var p = getProduct(ps.productId);
      return p ? '<option value="' + p.id + '">' + p.name + ' (stok: ' + ps.stock + ')</option>' : '';
    }).join('');
  }

  setTimeout(function() {
    var whSelect = document.getElementById('bk_warehouse');
    if (whSelect) { whSelect.addEventListener('change', updateBkProducts); updateBkProducts(); }

    var addBtn = document.getElementById('addBkItem');
    if (addBtn) {
      addBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var pid = parseInt(document.getElementById('bk_product')?.value);
        var qty = parseInt(document.getElementById('bk_qty')?.value) || 1;
        var whId = parseInt(document.getElementById('bk_warehouse')?.value);
        if (!pid) { showToast('Pilih produk dulu', 'error'); return; }
        var ps = getProductStock(pid, whId);
        if (!ps || ps.stock < qty) { showToast('Stok tidak cukup', 'error'); return; }
        if (window._bkItems?.find(function(i) { return i.productId == pid; })) { showToast('Produk sudah ditambahkan', 'info'); return; }
        if (!window._bkItems) window._bkItems = [];
        window._bkItems.push({ productId: pid, qty: qty });
        document.getElementById('bkItems').innerHTML = window._bkItems.map(function(i) {
          var p2 = getProduct(i.productId);
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;margin:2px 0;border-radius:4px;background:#f9fafb">' +
            '<span style="font-weight:500">' + (p2 ? p2.name : '# ' + i.productId) + '</span>' +
            '<span style="font-weight:600;color:#f59e0b">' + i.qty + ' pcs</span></div>';
        }).join('');
      });
    }

    var saveBtn = document.getElementById('saveBk');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var items = window._bkItems || [];
        if (items.length === 0) { showToast('Tambahkan minimal 1 item', 'error'); return; }
        var whId = parseInt(document.getElementById('bk_warehouse')?.value) || 1;
        for (var i = 0; i < items.length; i++) {
          addStock(items[i].productId, whId, -items[i].qty);
        }
        barangKeluar.push({
          id: nextId(barangKeluar),
          date: document.getElementById('bk_date')?.value || today,
          penerima: document.getElementById('bk_penerima')?.value || '-',
          warehouseId: whId,
          items: items.slice(),
          ref: document.getElementById('bk_ref')?.value || getNextRef('bk'),
          note: document.getElementById('bk_note')?.value || ''
        });
        window._bkItems = null;
        saveAndRefresh('Barang keluar berhasil dicatat. Stok produk berkurang.');
      });
    }
  }, 50);
}

// ======================
// STOCK ADJUSTMENT (per warehouse)
// ======================
export function handleAddStockAdjustment() {
  var whOpts = warehouses.map(function(w) { return '<option value="' + w.id + '">' + w.name + '</option>'; }).join('');
  var today = new Date().toISOString().split('T')[0];

  showModal('Stock Adjustment Baru',
    '<div class="form-grid">' +
      '<div class="form-group"><label class="form-label">Tanggal <span class="required">*</span></label><input class="form-input" id="sa_date" type="date" value="' + today + '"></div>' +
      '<div class="form-group"><label class="form-label">Gudang <span class="required">*</span></label><select class="form-select" id="sa_warehouse">' + whOpts + '</select></div>' +
      '<div class="form-group"><label class="form-label">Produk <span class="required">*</span></label><select class="form-select" id="sa_product"></select></div>' +
      '<div class="form-group"><label class="form-label">Stok Sistem</label><input class="form-input" id="sa_sistem" type="number" readonly></div>' +
      '<div class="form-group"><label class="form-label">Stok Fisik <span class="required">*</span></label><input class="form-input" id="sa_fisik" type="number" placeholder="Stok fisik"></div>' +
      '<div class="form-group"><label class="form-label">Selisih</label><input class="form-input" id="sa_selisih" type="number" readonly></div>' +
      '<div class="form-group"><label class="form-label">Alasan <span class="required">*</span></label><select class="form-select" id="sa_alasan">' +
        '<option value="Rusak">Rusak</option><option value="Hilang">Hilang</option><option value="Kadaluarsa">Kadaluarsa</option><option value="Koreksi">Koreksi Stok</option>' +
      '</select></div>' +
    '</div>',
    '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveSa">Simpan</button>', true);

  setTimeout(function() {
    var whSelect = document.getElementById('sa_warehouse');
    var prodSelect = document.getElementById('sa_product');
    function updateSaProducts() {
      var whId = parseInt(whSelect?.value);
      if (!prodSelect || !whId) return;
      var stocks = productStocks.filter(function(ps) { return ps.warehouseId === whId; });
      prodSelect.innerHTML = stocks.map(function(ps) {
        var p = getProduct(ps.productId);
        return p ? '<option value="' + p.id + '">' + p.name + ' (stok: ' + ps.stock + ')</option>' : '';
      }).join('');
      updateSaSistem();
    }
    function updateSaSistem() {
      var whId = parseInt(whSelect?.value);
      var pid = parseInt(prodSelect?.value);
      if (whId && pid) {
        var ps = getProductStock(pid, whId);
        document.getElementById('sa_sistem').value = ps ? ps.stock : 0;
      }
    }
    if (whSelect) whSelect.addEventListener('change', updateSaProducts);
    if (prodSelect) prodSelect.addEventListener('change', updateSaSistem);
    updateSaProducts();

    var fisikInput = document.getElementById('sa_fisik');
    if (fisikInput) {
      fisikInput.addEventListener('input', function() {
        var sistem = parseInt(document.getElementById('sa_sistem').value) || 0;
        var fisik = parseInt(this.value) || 0;
        document.getElementById('sa_selisih').value = fisik - sistem;
      });
    }

    var saveBtn = document.getElementById('saveSa');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var whId = parseInt(document.getElementById('sa_warehouse')?.value) || 1;
        var productId = parseInt(document.getElementById('sa_product')?.value) || 1;
        var fisik = parseInt(document.getElementById('sa_fisik')?.value) || 0;
        var sistem = parseInt(document.getElementById('sa_sistem')?.value) || 0;
        stockAdjustments.push({
          id: nextId(stockAdjustments),
          date: document.getElementById('sa_date')?.value || today,
          productId: productId,
          warehouseId: whId,
          sistem: sistem,
          fisik: fisik,
          selisih: fisik - sistem,
          alasan: document.getElementById('sa_alasan')?.value || 'Koreksi'
        });
        setStock(productId, whId, fisik);
        saveAndRefresh('Adjustment stok berhasil disimpan.');
      });
    }
  }, 50);
}

// ======================
// STOCK TRANSFER (proper multi-warehouse)
// ======================
export function handleAddStockTransfer() {
  var whOpts = warehouses.map(function(w) { return '<option value="' + w.id + '">' + w.name + '</option>'; }).join('');
  var firstWhId = warehouses.length > 0 ? warehouses[0].id : 0;

  showModal('Transfer Stok Baru',
    '<div class="form-grid">' +
      '<div class="form-group"><label class="form-label">Gudang Asal <span class="required">*</span></label><select class="form-select" id="st_from">' + whOpts + '</select></div>' +
      '<div class="form-group"><label class="form-label">Gudang Tujuan <span class="required">*</span></label><select class="form-select" id="st_to">' + whOpts + '</select></div>' +
    '</div><div style="margin-top:16px">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
        '<div style="flex:1"><select class="form-select" id="st_product" style="width:100%"></select></div>' +
        '<div style="max-width:80px"><input class="form-input" id="st_qty" type="number" placeholder="Qty" value="1" style="width:70px"></div>' +
        '<button class="btn btn-primary btn-sm" id="addStItem" style="white-space:nowrap">' + icon('plus', 14) + ' Tambah</button>' +
      '</div>' +
      '<div id="stItems" style="font-size:13px;color:#666;padding:6px 0;min-height:24px">Belum ada item</div>' +
    '</div>',
    '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveSt">Simpan</button>');

  setTimeout(function() {
    var fromSelect = document.getElementById('st_from');
    var prodSelect = document.getElementById('st_product');
    function updateStProducts() {
      var whId = parseInt(fromSelect?.value);
      if (!prodSelect || !whId) return;
      var stocks = productStocks.filter(function(ps) { return ps.warehouseId === whId; });
      prodSelect.innerHTML = stocks.map(function(ps) {
        var p = getProduct(ps.productId);
        return p ? '<option value="' + p.id + '">' + p.name + ' (stok: ' + ps.stock + ')</option>' : '';
      }).join('');
    }
    if (fromSelect) fromSelect.addEventListener('change', updateStProducts);
    updateStProducts();

    var items = [];
    var addBtn = document.getElementById('addStItem');
    if (addBtn) {
      addBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var pid = parseInt(document.getElementById('st_product')?.value);
        var qty = parseInt(document.getElementById('st_qty')?.value) || 1;
        var fromWhId = parseInt(document.getElementById('st_from')?.value);
        if (!pid || !fromWhId) { showToast('Pilih produk dulu', 'error'); return; }
        var ps = getProductStock(pid, fromWhId);
        if (!ps || ps.stock < qty) { showToast('Stok tidak cukup', 'error'); return; }
        if (items.find(function(i) { return i.productId == pid; })) { showToast('Produk sudah ditambahkan', 'info'); return; }
        items.push({ productId: pid, qty: qty });
        document.getElementById('stItems').innerHTML = items.map(function(i) {
          var p2 = getProduct(i.productId);
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;margin:2px 0;border-radius:4px;background:#f9fafb">' +
            '<span style="font-weight:500">' + (p2 ? p2.name : '# ' + i.productId) + '</span>' +
            '<span style="font-weight:600;color:#8b5cf6">' + i.qty + ' pcs</span></div>';
        }).join('');
      });
    }

    var saveBtn = document.getElementById('saveSt');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        if (items.length === 0) { showToast('Tambahkan minimal 1 item', 'error'); return; }
        var fromWhId = parseInt(document.getElementById('st_from')?.value) || 1;
        var toWhId = parseInt(document.getElementById('st_to')?.value) || 2;
        if (fromWhId === toWhId) { showToast('Gudang asal dan tujuan harus berbeda', 'error'); return; }
        for (var i = 0; i < items.length; i++) {
          addStock(items[i].productId, fromWhId, -items[i].qty);
          addStock(items[i].productId, toWhId, items[i].qty);
        }
        var newId = nextId(stockTransfers);
        stockTransfers.push({
          id: newId,
          date: new Date().toISOString().split('T')[0],
          fromWarehouseId: fromWhId,
          toWarehouseId: toWhId,
          items: items.slice(),
          ref: 'TRF-' + String(newId).padStart(3, '0')
        });
        saveAndRefresh('Transfer stok berhasil disimpan.');
      });
    }
  }, 50);
}

// ======================
// USER
// ======================
export function handleAddUser() {
  showModal('Tambah User',
    '<div class="form-grid">' +
      '<div class="form-group"><label class="form-label">Nama <span class="required">*</span></label><input class="form-input" id="u_name" placeholder="Nama lengkap"></div>' +
      '<div class="form-group"><label class="form-label">Email <span class="required">*</span></label><input class="form-input" id="u_email" type="email" placeholder="email@domain.com"></div>' +
      '<div class="form-group"><label class="form-label">Password <span class="required">*</span></label><input class="form-input" id="u_password" type="password" placeholder="Min. 6 karakter"></div>' +
      '<div class="form-group"><label class="form-label">Role <span class="required">*</span></label><select class="form-select" id="u_role"><option value="Owner">Owner</option><option value="Admin">Admin</option><option value="Staff">Staff</option></select></div>' +
      '<div class="form-group"><label class="form-label">Status</label><select class="form-select" id="u_status"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>' +
    '</div>',
    '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveUser">Simpan</button>');
  setTimeout(function() {
    var saveBtn = document.getElementById('saveUser');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        users.push({
          id: nextId(users),
          name: document.getElementById('u_name')?.value || 'User Baru',
          email: document.getElementById('u_email')?.value || '',
          role: document.getElementById('u_role')?.value || 'Staff',
          status: document.getElementById('u_status')?.value || 'Active',
          lastLogin: '-',
          createdAt: new Date().toISOString().split('T')[0]
        });
        saveAndRefresh('User berhasil ditambahkan');
      });
    }
  }, 50);
}

// ======================
// DETAIL MODAL
// ======================
export function handleDetail(action, id) {
  var type = action.replace('detail-', '');
  id = parseInt(id);
  var item, itemsHtml, i, p, wh;

  if (type === 'bm') {
    item = getBarangMasuk(id);
    if (!item) { showToast('Data tidak ditemukan', 'error'); return; }
    wh = getWarehouse(item.warehouseId);
    itemsHtml = item.items.map(function(it) {
      p = getProduct(it.productId);
      return '<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">' + (p ? p.name : '#' + it.productId) + '</td>' +
        '<td style="padding:6px 8px;text-align:right;font-weight:600;border-bottom:1px solid #e5e7eb">' + it.qty + '</td></tr>';
    }).join('');
    showModal('Detail Barang Masuk',
      '<div style="font-size:13px">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">' +
          '<div><strong>Tanggal:</strong> ' + formatDate(item.date) + '</div>' +
          '<div><strong>Referensi:</strong> ' + (item.ref || '-') + '</div>' +
          '<div><strong>Supplier:</strong> ' + (getSupplier(item.supplierId)?.name || '-') + '</div>' +
          '<div><strong>Gudang:</strong> ' + (wh ? wh.name : '-') + '</div>' +
          '<div><strong>Catatan:</strong> ' + (item.note || '-') + '</div>' +
        '</div>' +
        '<table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f9fafb"><th style="padding:6px 8px;text-align:left;border-bottom:1px solid #e5e7eb">Produk</th><th style="padding:6px 8px;text-align:right;border-bottom:1px solid #e5e7eb">Qty</th></tr></thead><tbody>' + itemsHtml + '</tbody></table>' +
      '</div>', '<button class="btn btn-secondary" onclick="closeModal()">Tutup</button>', true);
  } else if (type === 'bk') {
    item = getBarangKeluar(id);
    if (!item) { showToast('Data tidak ditemukan', 'error'); return; }
    wh = getWarehouse(item.warehouseId);
    itemsHtml = item.items.map(function(it) {
      p = getProduct(it.productId);
      return '<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">' + (p ? p.name : '#' + it.productId) + '</td>' +
        '<td style="padding:6px 8px;text-align:right;font-weight:600;border-bottom:1px solid #e5e7eb">' + it.qty + '</td></tr>';
    }).join('');
    showModal('Detail Barang Keluar',
      '<div style="font-size:13px">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">' +
          '<div><strong>Tanggal:</strong> ' + formatDate(item.date) + '</div>' +
          '<div><strong>Referensi:</strong> ' + (item.ref || '-') + '</div>' +
          '<div><strong>Penerima:</strong> ' + item.penerima + '</div>' +
          '<div><strong>Gudang:</strong> ' + (wh ? wh.name : '-') + '</div>' +
          '<div><strong>Catatan:</strong> ' + (item.note || '-') + '</div>' +
        '</div>' +
        '<table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f9fafb"><th style="padding:6px 8px;text-align:left;border-bottom:1px solid #e5e7eb">Produk</th><th style="padding:6px 8px;text-align:right;border-bottom:1px solid #e5e7eb">Qty</th></tr></thead><tbody>' + itemsHtml + '</tbody></table>' +
      '</div>', '<button class="btn btn-secondary" onclick="closeModal()">Tutup</button>', true);
  } else if (type === 'st') {
    item = stockTransfers.find(function(x) { return x.id === id; });
    if (!item) { showToast('Data tidak ditemukan', 'error'); return; }
    itemsHtml = item.items.map(function(it) {
      p = getProduct(it.productId);
      return '<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">' + (p ? p.name : '#' + it.productId) + '</td>' +
        '<td style="padding:6px 8px;text-align:right;font-weight:600;border-bottom:1px solid #e5e7eb">' + it.qty + '</td></tr>';
    }).join('');
    showModal('Detail Transfer Stok',
      '<div style="font-size:13px">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">' +
          '<div><strong>Tanggal:</strong> ' + formatDate(item.date) + '</div>' +
          '<div><strong>Referensi:</strong> ' + (item.ref || '-') + '</div>' +
          '<div><strong>Dari Gudang:</strong> ' + (getWarehouse(item.fromWarehouseId)?.name || '-') + '</div>' +
          '<div><strong>Ke Gudang:</strong> ' + (getWarehouse(item.toWarehouseId)?.name || '-') + '</div>' +
        '</div>' +
        '<table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f9fafb"><th style="padding:6px 8px;text-align:left;border-bottom:1px solid #e5e7eb">Produk</th><th style="padding:6px 8px;text-align:right;border-bottom:1px solid #e5e7eb">Qty</th></tr></thead><tbody>' + itemsHtml + '</tbody></table>' +
      '</div>', '<button class="btn btn-secondary" onclick="closeModal()">Tutup</button>', true);
  }
}

// ======================
// EDIT HANDLER (no warehouseId in product master)
// ======================
export function handleEdit(action, id) {
  var type = action.replace('edit-', '');
  id = parseInt(id);
  var item, title, fields;

  if (type === 'produk') {
    item = getProduct(id);
    if (!item) { showToast('Produk tidak ditemukan', 'error'); return; }
    title = 'Edit Produk';
    var catOpts = categories.map(function(c) { return '<option value="' + c.id + '"' + (c.id === item.categoryId ? ' selected' : '') + '>' + c.name + '</option>'; }).join('');
    var supOpts = suppliers.map(function(s) { return '<option value="' + s.id + '"' + (s.id === item.supplierId ? ' selected' : '') + '>' + s.name + '</option>'; }).join('');
    fields = '<div class="form-grid">' +
      '<div class="form-group"><label class="form-label">Nama Produk</label><input class="form-input" id="f_name" value="' + (item.name || '').replace(/"/g, '&quot;') + '"></div>' +
      '<div class="form-group"><label class="form-label">SKU</label><input class="form-input" id="f_sku" value="' + (item.sku || '').replace(/"/g, '&quot;') + '"></div>' +
      '<div class="form-group"><label class="form-label">Kategori</label><select class="form-select" id="f_category">' + catOpts + '</select></div>' +
      '<div class="form-group"><label class="form-label">Supplier</label><select class="form-select" id="f_supplier">' + supOpts + '</select></div>' +
      '<div class="form-group"><label class="form-label">Harga</label><input class="form-input" id="f_price" type="number" value="' + (item.price || 0) + '"></div>' +
      '<div class="form-group"><label class="form-label">Min. Stok</label><input class="form-input" id="f_minStock" type="number" value="' + (item.minStock || 5) + '"></div>' +
      '<div class="form-group"><label class="form-label">Status</label><select class="form-select" id="f_status"><option value="Aktif"' + (item.status === 'Aktif' ? ' selected' : '') + '>Aktif</option><option value="Nonaktif"' + (item.status === 'Nonaktif' ? ' selected' : '') + '>Nonaktif</option></select></div>' +
    '</div>';
  } else if (type === 'kategori') {
    item = categories.find(function(c) { return c.id == id; });
    if (!item) { showToast('Kategori tidak ditemukan', 'error'); return; }
    title = 'Edit Kategori';
    fields = '<div class="form-grid full"><div class="form-group"><label class="form-label">Nama Kategori</label><input class="form-input" id="k_name" value="' + (item.name || '').replace(/"/g, '&quot;') + '"></div><div class="form-group"><label class="form-label">Deskripsi</label><textarea class="form-textarea" id="k_desc" rows="3">' + (item.description || '').replace(/"/g, '&quot;') + '</textarea></div></div>';
  } else if (type === 'supplier') {
    item = suppliers.find(function(s) { return s.id == id; });
    if (!item) { showToast('Supplier tidak ditemukan', 'error'); return; }
    title = 'Edit Supplier';
    fields = '<div class="form-grid"><div class="form-group"><label class="form-label">Nama Supplier</label><input class="form-input" id="s_name" value="' + (item.name || '').replace(/"/g, '&quot;') + '"></div><div class="form-group"><label class="form-label">PIC</label><input class="form-input" id="s_pic" value="' + (item.pic || '').replace(/"/g, '&quot;') + '"></div><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="s_email" value="' + (item.email || '').replace(/"/g, '&quot;') + '"></div><div class="form-group"><label class="form-label">Telepon</label><input class="form-input" id="s_phone" value="' + (item.phone || '').replace(/"/g, '&quot;') + '"></div></div>';
  } else if (type === 'gudang') {
    item = warehouses.find(function(w) { return w.id == id; });
    if (!item) { showToast('Gudang tidak ditemukan', 'error'); return; }
    title = 'Edit Gudang';
    fields = '<div class="form-grid"><div class="form-group"><label class="form-label">Kode Gudang</label><input class="form-input" id="g_code" value="' + (item.code || '').replace(/"/g, '&quot;') + '"></div><div class="form-group"><label class="form-label">Nama Gudang</label><input class="form-input" id="g_name" value="' + (item.name || '').replace(/"/g, '&quot;') + '"></div><div class="form-group full"><label class="form-label">Lokasi</label><input class="form-input" id="g_location" value="' + (item.location || '').replace(/"/g, '&quot;') + '"></div></div>';
  } else if (type === 'user') {
    item = users.find(function(u) { return u.id == id; });
    if (!item) { showToast('User tidak ditemukan', 'error'); return; }
    title = 'Edit User';
    fields = '<div class="form-grid"><div class="form-group"><label class="form-label">Nama</label><input class="form-input" id="u_name" value="' + (item.name || '').replace(/"/g, '&quot;') + '"></div><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="u_email" value="' + (item.email || '').replace(/"/g, '&quot;') + '"></div><div class="form-group"><label class="form-label">Role</label><select class="form-select" id="u_role"><option value="Owner"' + (item.role === 'Owner' ? ' selected' : '') + '>Owner</option><option value="Admin"' + (item.role === 'Admin' ? ' selected' : '') + '>Admin</option><option value="Staff"' + (item.role === 'Staff' ? ' selected' : '') + '>Staff</option></select></div><div class="form-group"><label class="form-label">Status</label><select class="form-select" id="u_status"><option value="Active"' + (item.status === 'Active' ? ' selected' : '') + '>Active</option><option value="Inactive"' + (item.status === 'Inactive' ? ' selected' : '') + '>Inactive</option></select></div></div>';
  } else {
    showToast('Edit tidak tersedia untuk entitas ini', 'info');
    return;
  }

  showModal(title, fields,
    '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveEdit">Simpan Perubahan</button>');

  setTimeout(function() {
    var saveBtn = document.getElementById('saveEdit');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        if (type === 'produk') {
          item.name = document.getElementById('f_name')?.value || item.name;
          item.sku = document.getElementById('f_sku')?.value || item.sku;
          item.categoryId = parseInt(document.getElementById('f_category')?.value) || item.categoryId;
          item.supplierId = parseInt(document.getElementById('f_supplier')?.value) || item.supplierId;
          item.price = parseInt(document.getElementById('f_price')?.value) || item.price;
          item.minStock = parseInt(document.getElementById('f_minStock')?.value) || item.minStock;
          item.status = document.getElementById('f_status')?.value || item.status;
        } else if (type === 'kategori') {
          item.name = document.getElementById('k_name')?.value || item.name;
          item.description = document.getElementById('k_desc')?.value || item.description;
        } else if (type === 'supplier') {
          item.name = document.getElementById('s_name')?.value || item.name;
          item.pic = document.getElementById('s_pic')?.value || item.pic;
          item.email = document.getElementById('s_email')?.value || item.email;
          item.phone = document.getElementById('s_phone')?.value || item.phone;
        } else if (type === 'gudang') {
          item.code = document.getElementById('g_code')?.value || item.code;
          item.name = document.getElementById('g_name')?.value || item.name;
          item.location = document.getElementById('g_location')?.value || item.location;
        } else if (type === 'user') {
          item.name = document.getElementById('u_name')?.value || item.name;
          item.email = document.getElementById('u_email')?.value || item.email;
          item.role = document.getElementById('u_role')?.value || item.role;
          item.status = document.getElementById('u_status')?.value || item.status;
        }
        saveAndRefresh('"' + (item.name || 'Item') + '" berhasil diperbarui');
      });
    }
  }, 50);
}

// ======================
// DELETE HANDLER (multi-warehouse stock reversal)
// ======================
export function handleDelete(action, id) {
  var type = action.replace('delete-', '');
  id = parseInt(id);
  var name = '';
  var dataMap = {
    'produk': products, 'kategori': categories, 'supplier': suppliers,
    'gudang': warehouses, 'user': users, 'bm': barangMasuk,
    'bk': barangKeluar, 'sa': stockAdjustments, 'st': stockTransfers
  };
  var nameMap = {
    'produk': function() { var x = getProduct(id); return x ? x.name : null; },
    'kategori': function() { var x = categories.find(function(c) { return c.id == id; }); return x ? x.name : null; },
    'supplier': function() { var x = suppliers.find(function(s) { return s.id == id; }); return x ? x.name : null; },
    'gudang': function() { var x = warehouses.find(function(w) { return w.id == id; }); return x ? x.name : null; },
    'user': function() { var x = users.find(function(u) { return u.id == id; }); return x ? x.name : null; },
    'bm': function() { return 'Barang Masuk #' + id; },
    'bk': function() { return 'Barang Keluar #' + id; },
    'sa': function() { return 'Stock Adjustment #' + id; },
    'st': function() { return 'Transfer Stok #' + id; },
  };
  name = nameMap[type] ? nameMap[type]() : ('Item #' + id);
  var arr = dataMap[type];
  if (!arr) { showToast('Hapus tidak dikenali', 'error'); return; }

  showModal('Konfirmasi Hapus',
    '<p style="font-size:14px;line-height:1.6">Apakah Anda yakin ingin menghapus <strong>' + (name || 'item') + '</strong>?<br><span style="color:#999">Tindakan ini tidak dapat dibatalkan.</span></p>',
    '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-danger" id="confirmDelete">Ya, Hapus</button>');

  setTimeout(function() {
    var confirmBtn = document.getElementById('confirmDelete');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function() {
        // Reverse stock changes
        if (type === 'produk') {
          // Remove all stock entries for this product
          for (var i = productStocks.length - 1; i >= 0; i--) {
            if (productStocks[i].productId === id) productStocks.splice(i, 1);
          }
        } else if (type === 'bm') {
          var bm = barangMasuk.find(function(x) { return x.id == id; });
          if (bm) {
            for (var i = 0; i < bm.items.length; i++) {
              addStock(bm.items[i].productId, bm.warehouseId, -bm.items[i].qty);
            }
          }
        } else if (type === 'bk') {
          var bk = barangKeluar.find(function(x) { return x.id == id; });
          if (bk) {
            for (var i = 0; i < bk.items.length; i++) {
              addStock(bk.items[i].productId, bk.warehouseId, bk.items[i].qty);
            }
          }
        } else if (type === 'sa') {
          var sa = stockAdjustments.find(function(x) { return x.id == id; });
          if (sa) setStock(sa.productId, sa.warehouseId, sa.sistem);
        }
        // Remove item
        var idx = arr.findIndex(function(item) { return item.id == id; });
        if (idx !== -1) arr.splice(idx, 1);
        saveAndRefresh('"' + (name || 'Item') + '" berhasil dihapus');
      });
    }
  }, 50);
}
