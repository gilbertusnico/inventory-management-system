// ============================================
// INVENTARIS — App Logic (Sidebar, Navigation)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // --- Sidebar Toggle ---
  var sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function() {
      var sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.toggle('collapsed');
    });
  }

  // --- Nav Group Toggle ---
  var app = document.getElementById('root');
  if (!app) return;

  app.addEventListener('click', function(e) {
    var header = e.target.closest('.nav-group-header');
    if (header) {
      var group = header.closest('.nav-group');
      if (group) {
        group.classList.toggle('expanded');
        var items = group.querySelector('.nav-group-items');
        if (items) {
          items.style.maxHeight = group.classList.contains('expanded') ? items.scrollHeight + 'px' : '0';
        }
      }
    }
  });

  // --- Pagination (delegated) ---
  app.addEventListener('click', function(e) {
    var pageBtn = e.target.closest('.pagination-btn');
    if (pageBtn && !pageBtn.disabled) {
      var page = parseInt(pageBtn.dataset.page);
      if (page > 0) {
        _currentPage = page;
        if (typeof reRenderTable === 'function') {
          reRenderTable();
        }
      }
    }
  });

  // --- Sort (delegated) ---
  app.addEventListener('click', function(e) {
    var th = e.target.closest('th.sortable');
    if (th && th.dataset.sort) {
      var key = th.dataset.sort;
      if (_currentSort && _currentSort.key === key) {
        _currentSort.asc = !_currentSort.asc;
      } else {
        _currentSort = { key: key, asc: true };
      }
      _currentPage = 1;
      if (typeof reRenderTable === 'function') {
        reRenderTable();
      }
    }
  });

  // --- Table Search (delegated) ---
  app.addEventListener('input', function(e) {
    var searchInput = e.target.closest('#tableSearch');
    if (searchInput) {
      _searchTerm = searchInput.value;
      _currentPage = 1;
      clearTimeout(window._searchTimer);
      window._searchTimer = setTimeout(function() {
        if (typeof reRenderTable === 'function') {
          reRenderTable();
        }
      }, 300);
    }
  });

  // --- Data-action buttons (delegated) ---
  app.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.dataset.action;
    var id = btn.dataset.id;

    if (action === 'add-produk') handleAddMaster('add-produk');
    else if (action === 'add-kategori') handleAddMaster('add-kategori');
    else if (action === 'add-supplier') handleAddMaster('add-supplier');
    else if (action === 'add-gudang') handleAddMaster('add-gudang');
    else if (action === 'add-bm') handleAddBarangMasuk();
    else if (action === 'add-bk') handleAddBarangKeluar();
    else if (action === 'add-sa') handleAddStockAdjustment();
    else if (action === 'add-st') handleAddStockTransfer();
    else if (action === 'add-user') handleAddUser();
    else if (action === 'export-btn' || action === 'export-report') {
      showToast('Laporan sedang diproses', 'info');
    }
  });

  // --- Specific button IDs ---
  var addProdukBtn = document.getElementById('addProdukBtn');
  if (addProdukBtn) {
    addProdukBtn.addEventListener('click', function() { handleAddMaster('add-produk'); });
  }

  var exportBtns = document.querySelectorAll('#exportBtn, #exportReport');
  exportBtns.forEach(function(el) {
    el.addEventListener('click', function() { showToast('Laporan akan di-export dalam format PDF', 'info'); });
  });
});

// ======================
// MODAL FORM HANDLERS
// ======================
function handleAddMaster(type) {
  var catOpts = categories.map(function(c) { return '<option value="' + c.id + '">' + c.name + '</option>'; }).join('');
  var supOpts = suppliers.map(function(s) { return '<option value="' + s.id + '">' + s.name + '</option>'; }).join('');
  var whOpts = warehouses.map(function(w) { return '<option value="' + w.id + '">' + w.name + '</option>'; }).join('');

  if (type === 'add-produk') {
    showModal('Tambah Produk Baru', '<div class="form-grid">' +
      '<div class="form-group"><label class="form-label">Nama Produk <span class="required">*</span></label><input class="form-input" id="f_name" placeholder="Nama produk"></div>' +
      '<div class="form-group"><label class="form-label">SKU <span class="required">*</span></label><input class="form-input" id="f_sku" placeholder="Contoh: ELE-001"></div>' +
      '<div class="form-group"><label class="form-label">Kategori <span class="required">*</span></label><select class="form-select" id="f_category">' + catOpts + '</select></div>' +
      '<div class="form-group"><label class="form-label">Supplier <span class="required">*</span></label><select class="form-select" id="f_supplier">' + supOpts + '</select></div>' +
      '<div class="form-group"><label class="form-label">Gudang <span class="required">*</span></label><select class="form-select" id="f_warehouse">' + whOpts + '</select></div>' +
      '<div class="form-group"><label class="form-label">Min. Stok</label><input class="form-input" id="f_minStock" type="number" value="5"></div>' +
      '<div class="form-group"><label class="form-label">Status</label><select class="form-select" id="f_status"><option value="Aktif">Aktif</option><option value="Nonaktif">Nonaktif</option></select></div>' +
    '</div>', '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveMaster">Simpan</button>');
    setTimeout(function() {
      var saveBtn = document.getElementById('saveMaster');
      if (saveBtn) saveBtn.addEventListener('click', function() { closeModal(); showToast('Produk berhasil ditambahkan', 'success'); });
    }, 50);
  } else if (type === 'add-kategori') {
    showModal('Tambah Kategori', '<div class="form-grid full">' +
      '<div class="form-group"><label class="form-label">Nama Kategori <span class="required">*</span></label><input class="form-input" id="f_name" placeholder="Nama kategori"></div>' +
      '<div class="form-group"><label class="form-label">Deskripsi</label><textarea class="form-textarea" id="f_desc" rows="3" placeholder="Deskripsi kategori"></textarea></div>' +
    '</div>', '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveMaster">Simpan</button>');
    setTimeout(function() {
      var saveBtn = document.getElementById('saveMaster');
      if (saveBtn) saveBtn.addEventListener('click', function() { closeModal(); showToast('Kategori berhasil ditambahkan', 'success'); });
    }, 50);
  } else if (type === 'add-supplier') {
    showModal('Tambah Supplier', '<div class="form-grid">' +
      '<div class="form-group"><label class="form-label">Nama Supplier <span class="required">*</span></label><input class="form-input" id="f_name" placeholder="Nama perusahaan"></div>' +
      '<div class="form-group"><label class="form-label">PIC <span class="required">*</span></label><input class="form-input" id="f_pic" placeholder="Nama PIC"></div>' +
      '<div class="form-group"><label class="form-label">Email</label><input class="form-input" id="f_email" type="email" placeholder="email@perusahaan.com"></div>' +
      '<div class="form-group"><label class="form-label">Telepon</label><input class="form-input" id="f_phone" placeholder="021-5550123"></div>' +
    '</div>', '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveMaster">Simpan</button>');
    setTimeout(function() {
      var saveBtn = document.getElementById('saveMaster');
      if (saveBtn) saveBtn.addEventListener('click', function() { closeModal(); showToast('Supplier berhasil ditambahkan', 'success'); });
    }, 50);
  } else if (type === 'add-gudang') {
    showModal('Tambah Gudang', '<div class="form-grid">' +
      '<div class="form-group"><label class="form-label">Kode Gudang <span class="required">*</span></label><input class="form-input" id="f_code" placeholder="WH-XXX"></div>' +
      '<div class="form-group"><label class="form-label">Nama Gudang <span class="required">*</span></label><input class="form-input" id="f_name" placeholder="Nama gudang"></div>' +
      '<div class="form-group full"><label class="form-label">Lokasi <span class="required">*</span></label><input class="form-input" id="f_location" placeholder="Alamat lengkap"></div>' +
    '</div>', '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveMaster">Simpan</button>');
    setTimeout(function() {
      var saveBtn = document.getElementById('saveMaster');
      if (saveBtn) saveBtn.addEventListener('click', function() { closeModal(); showToast('Gudang berhasil ditambahkan', 'success'); });
    }, 50);
  }
}

function handleAddBarangMasuk() {
  var supOpts = suppliers.map(function(s) { return '<option value="' + s.id + '">' + s.name + '</option>'; }).join('');
  var prodOpts = products.map(function(p) { return '<option value="' + p.id + '">' + p.name + '</option>'; }).join('');
  var today = new Date().toISOString().split('T')[0];

  showModal('Barang Masuk Baru', '<div class="form-grid">' +
    '<div class="form-group"><label class="form-label">Tanggal <span class="required">*</span></label><input class="form-input" id="bm_date" type="date" value="' + today + '"></div>' +
    '<div class="form-group"><label class="form-label">Supplier <span class="required">*</span></label><select class="form-select" id="bm_supplier">' + supOpts + '</select></div>' +
    '<div class="form-group"><label class="form-label">No. Referensi</label><input class="form-input" id="bm_ref" placeholder="PO-2024-XXX"></div>' +
  '</div><div style="margin-top:16px">' +
    '<div class="form-group"><label class="form-label">Item Barang</label></div>' +
    '<div class="form-row">' +
      '<div class="form-group"><select class="form-select" id="bm_product">' + prodOpts + '</select></div>' +
      '<div class="form-group" style="max-width:100px"><input class="form-input" id="bm_qty" type="number" placeholder="Qty" value="1"></div>' +
      '<button class="btn btn-primary btn-sm" id="addBmItem">' + icon('plus', 14) + '</button>' +
    '</div>' +
    '<div id="bmItems" style="font-size:13px;color:#666;padding:8px 0">Belum ada item ditambahkan</div>' +
  '</div>', '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveBm">Simpan</button>');

  setTimeout(function() {
    var items = [];
    var addBtn = document.getElementById('addBmItem');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        var pid = document.getElementById('bm_product') ? document.getElementById('bm_product').value : null;
        var qty = parseInt(document.getElementById('bm_qty') ? document.getElementById('bm_qty').value : 1) || 1;
        var p = products.find(function(pr) { return pr.id == pid; });
        if (p && !items.find(function(i) { return i.id === p.id; })) {
          items.push({ id: p.id, name: p.name, qty: qty });
          var bmItems = document.getElementById('bmItems');
          if (bmItems) {
            bmItems.innerHTML = items.map(function(i) {
              return '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f0f0f0"><span>' + i.name + '</span><span style="font-weight:600">' + i.qty + ' pcs</span></div>';
            }).join('');
          }
        }
      });
    }
    var saveBtn = document.getElementById('saveBm');
    if (saveBtn) saveBtn.addEventListener('click', function() { closeModal(); showToast('Barang masuk berhasil dicatat', 'success'); });
  }, 50);
}

function handleAddBarangKeluar() {
  var prodOpts = products.map(function(p) { return '<option value="' + p.id + '">' + p.name + '</option>'; }).join('');
  var today = new Date().toISOString().split('T')[0];

  showModal('Barang Keluar Baru', '<div class="form-grid">' +
    '<div class="form-group"><label class="form-label">Tanggal <span class="required">*</span></label><input class="form-input" id="bk_date" type="date" value="' + today + '"></div>' +
    '<div class="form-group"><label class="form-label">Penerima/PIC <span class="required">*</span></label><input class="form-input" id="bk_penerima" placeholder="Nama penerima"></div>' +
    '<div class="form-group"><label class="form-label">No. Referensi</label><input class="form-input" id="bk_ref" placeholder="OUT-XXX"></div>' +
    '<div class="form-group"><label class="form-label">Catatan</label><textarea class="form-textarea" id="bk_note" rows="2"></textarea></div>' +
  '</div><div style="margin-top:16px">' +
    '<div class="form-group"><label class="form-label">Item Barang</label></div>' +
    '<div class="form-row">' +
      '<div class="form-group"><select class="form-select" id="bk_product">' + prodOpts + '</select></div>' +
      '<div class="form-group" style="max-width:100px"><input class="form-input" id="bk_qty" type="number" placeholder="Qty" value="1"></div>' +
      '<button class="btn btn-primary btn-sm" id="addBkItem">' + icon('plus', 14) + '</button>' +
    '</div>' +
    '<div id="bkItems" style="font-size:13px;color:#666;padding:8px 0">Belum ada item ditambahkan</div>' +
  '</div>', '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveBk">Simpan</button>');

  setTimeout(function() {
    var items = [];
    var addBtn = document.getElementById('addBkItem');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        var pid = document.getElementById('bk_product') ? document.getElementById('bk_product').value : null;
        var qty = parseInt(document.getElementById('bk_qty') ? document.getElementById('bk_qty').value : 1) || 1;
        var p = products.find(function(pr) { return pr.id == pid; });
        if (p && !items.find(function(i) { return i.id === p.id; })) {
          items.push({ id: p.id, name: p.name, qty: qty });
          var bkItems = document.getElementById('bkItems');
          if (bkItems) {
            bkItems.innerHTML = items.map(function(i) {
              return '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f0f0f0"><span>' + i.name + '</span><span style="font-weight:600">' + i.qty + ' pcs</span></div>';
            }).join('');
          }
        }
      });
    }
    var saveBtn = document.getElementById('saveBk');
    if (saveBtn) saveBtn.addEventListener('click', function() { closeModal(); showToast('Barang keluar berhasil dicatat', 'success'); });
  }, 50);
}

function handleAddStockAdjustment() {
  var prodOpts = products.map(function(p) { return '<option value="' + p.id + '">' + p.name + ' (stok: ' + p.stock + ')</option>'; }).join('');
  var today = new Date().toISOString().split('T')[0];

  showModal('Stock Adjustment Baru', '<div class="form-grid">' +
    '<div class="form-group"><label class="form-label">Tanggal <span class="required">*</span></label><input class="form-input" id="sa_date" type="date" value="' + today + '"></div>' +
    '<div class="form-group"><label class="form-label">Produk <span class="required">*</span></label><select class="form-select" id="sa_product">' + prodOpts + '</select></div>' +
    '<div class="form-group"><label class="form-label">Stok Sistem</label><input class="form-input" id="sa_sistem" type="number" readonly></div>' +
    '<div class="form-group"><label class="form-label">Stok Fisik <span class="required">*</span></label><input class="form-input" id="sa_fisik" type="number" placeholder="Stok fisik"></div>' +
    '<div class="form-group"><label class="form-label">Selisih</label><input class="form-input" id="sa_selisih" type="number" readonly></div>' +
    '<div class="form-group"><label class="form-label">Alasan <span class="required">*</span></label><select class="form-select" id="sa_alasan">' +
      '<option value="Rusak">Rusak</option><option value="Hilang">Hilang</option><option value="Kadaluarsa">Kadaluarsa</option><option value="Koreksi">Koreksi Stok</option>' +
    '</select></div>' +
  '</div>', '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveSa">Simpan</button>');

  setTimeout(function() {
    var prodSelect = document.getElementById('sa_product');
    if (prodSelect) {
      prodSelect.addEventListener('change', function() {
        var p = products.find(function(pr) { return pr.id == this.value; }.bind(this));
        if (p) document.getElementById('sa_sistem').value = p.stock;
      });
    }
    var fisikInput = document.getElementById('sa_fisik');
    if (fisikInput) {
      fisikInput.addEventListener('input', function() {
        var sistem = parseInt(document.getElementById('sa_sistem').value) || 0;
        var fisik = parseInt(this.value) || 0;
        document.getElementById('sa_selisih').value = fisik - sistem;
      });
    }
    var saveBtn = document.getElementById('saveSa');
    if (saveBtn) saveBtn.addEventListener('click', function() { closeModal(); showToast('Adjustment stok berhasil disimpan', 'success'); });
  }, 50);
}

function handleAddStockTransfer() {
  var whOpts = warehouses.map(function(w) { return '<option value="' + w.id + '">' + w.name + '</option>'; }).join('');
  var prodOpts = products.map(function(p) { return '<option value="' + p.id + '">' + p.name + '</option>'; }).join('');

  showModal('Transfer Stok Baru', '<div class="form-grid">' +
    '<div class="form-group"><label class="form-label">Gudang Asal <span class="required">*</span></label><select class="form-select" id="st_from">' + whOpts + '</select></div>' +
    '<div class="form-group"><label class="form-label">Gudang Tujuan <span class="required">*</span></label><select class="form-select" id="st_to">' + whOpts + '</select></div>' +
  '</div><div style="margin-top:16px">' +
    '<div class="form-group"><label class="form-label">Item</label></div>' +
    '<div class="form-row">' +
      '<div class="form-group"><select class="form-select" id="st_product">' + prodOpts + '</select></div>' +
      '<div class="form-group" style="max-width:100px"><input class="form-input" id="st_qty" type="number" placeholder="Qty" value="1"></div>' +
      '<button class="btn btn-primary btn-sm" id="addStItem">' + icon('plus', 14) + '</button>' +
    '</div>' +
    '<div id="stItems" style="font-size:13px;color:#666;padding:8px 0">Belum ada item ditambahkan</div>' +
  '</div>', '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveSt">Simpan</button>');

  setTimeout(function() {
    var items = [];
    var addBtn = document.getElementById('addStItem');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        var pid = document.getElementById('st_product') ? document.getElementById('st_product').value : null;
        var qty = parseInt(document.getElementById('st_qty') ? document.getElementById('st_qty').value : 1) || 1;
        var p = products.find(function(pr) { return pr.id == pid; });
        if (p && !items.find(function(i) { return i.id === p.id; })) {
          items.push({ id: p.id, name: p.name, qty: qty });
          var stItems = document.getElementById('stItems');
          if (stItems) {
            stItems.innerHTML = items.map(function(i) {
              return '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f0f0f0"><span>' + i.name + '</span><span style="font-weight:600">' + i.qty + ' pcs</span></div>';
            }).join('');
          }
        }
      });
    }
    var saveBtn = document.getElementById('saveSt');
    if (saveBtn) saveBtn.addEventListener('click', function() { closeModal(); showToast('Transfer stok berhasil disimpan', 'success'); });
  }, 50);
}

function handleAddUser() {
  showModal('Tambah User', '<div class="form-grid">' +
    '<div class="form-group"><label class="form-label">Nama <span class="required">*</span></label><input class="form-input" id="u_name" placeholder="Nama lengkap"></div>' +
    '<div class="form-group"><label class="form-label">Email <span class="required">*</span></label><input class="form-input" id="u_email" type="email" placeholder="email@domain.com"></div>' +
    '<div class="form-group"><label class="form-label">Password <span class="required">*</span></label><input class="form-input" id="u_password" type="password" placeholder="Min. 6 karakter"></div>' +
    '<div class="form-group"><label class="form-label">Role <span class="required">*</span></label><select class="form-select" id="u_role"><option value="Owner">Owner</option><option value="Admin">Admin</option><option value="Staff">Staff</option></select></div>' +
    '<div class="form-group"><label class="form-label">Status</label><select class="form-select" id="u_status"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>' +
  '</div>', '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveUser">Simpan</button>');
  setTimeout(function() {
    var saveBtn = document.getElementById('saveUser');
    if (saveBtn) saveBtn.addEventListener('click', function() { closeModal(); showToast('User berhasil ditambahkan', 'success'); });
  }, 50);
}
