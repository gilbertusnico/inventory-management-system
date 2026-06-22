// ============================================
// INVENTARIS — App Logic (Sidebar, Navigation)
// ============================================
// Load this AFTER helpers.js

// Collapse sidebar on mobile for EVERY page load (before DOMContentLoaded)
(function() {
  var s = document.getElementById('sidebar');
  if (s && window.innerWidth <= 768) s.classList.add('collapsed');
})();

document.addEventListener('DOMContentLoaded', function() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');

  // --- Menu Toggle ---
  var menuToggle = document.getElementById('menuToggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleSidebar(sidebar, overlay);
    });
  }

  // --- Sidebar Close ---
  var sidebarClose = document.getElementById('sidebarClose');
  if (sidebarClose) {
    sidebarClose.addEventListener('click', function(e) {
      e.stopPropagation();
      closeSidebar(sidebar, overlay);
    });
  }

  // --- Overlay Click ---
  if (overlay) {
    overlay.addEventListener('click', function() {
      closeSidebar(sidebar, overlay);
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

  // --- Pagination ---
  app.addEventListener('click', function(e) {
    var pageBtn = e.target.closest('.pagination-btn');
    if (pageBtn && !pageBtn.disabled) {
      var page = parseInt(pageBtn.dataset.page);
      if (page > 0) {
        _currentPage = page;
        if (typeof reRenderTable === 'function') reRenderTable();
      }
    }
  });

  // --- Sort ---
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
      if (typeof reRenderTable === 'function') reRenderTable();
    }
  });

  // --- Table Search ---
  app.addEventListener('input', function(e) {
    var searchInput = e.target.closest('#tableSearch');
    if (searchInput) {
      _searchTerm = searchInput.value;
      _currentPage = 1;
      clearTimeout(window._searchTimer);
      window._searchTimer = setTimeout(function() {
        if (typeof reRenderTable === 'function') reRenderTable();
      }, 300);
    }
  });

  // --- Data-action buttons ---
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
    else if (action.startsWith('edit-')) {
      handleEdit(action, id);
    }
    else if (action.startsWith('delete-')) {
      handleDelete(action, id);
    }
  });

  // --- Specific button IDs ---
  var addProdukBtn = document.getElementById('addProdukBtn');
  if (addProdukBtn) {
    addProdukBtn.addEventListener('click', function() { handleAddMaster('add-produk'); });
  }

  // --- Close sidebar on nav click (mobile) ---
  var sidebarNav = document.getElementById('sidebarNav');
  if (sidebarNav) {
    sidebarNav.addEventListener('click', function(e) {
      var navItem = e.target.closest('.nav-item');
      if (navItem && window.innerWidth <= 768) {
        closeSidebar(sidebar, overlay);
      }
    });
  }

  // --- Handle resize ---
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (window.innerWidth > 768 && sidebar && overlay) {
        sidebar.classList.remove('collapsed');
        overlay.classList.remove('open');
      }
    }, 200);
  });

  var exportBtns = document.querySelectorAll('#exportBtn, #exportReport');
  exportBtns.forEach(function(el) {
    el.addEventListener('click', function() { showToast('Laporan akan di-export dalam format PDF', 'info'); });
  });
});

// ======================
// SIDEBAR HELPERS
// ======================
function toggleSidebar(sidebar, overlay) {
  if (!sidebar) return;
  var isMobile = window.innerWidth <= 768;
  if (isMobile) {
    sidebar.classList.toggle('collapsed');
    if (overlay) {
      if (!sidebar.classList.contains('collapsed')) {
        overlay.classList.add('open');
      } else {
        overlay.classList.remove('open');
      }
    }
  } else {
    sidebar.classList.toggle('collapsed');
  }
}

function closeSidebar(sidebar, overlay) {
  if (!sidebar) return;
  sidebar.classList.add('collapsed');
  if (overlay) overlay.classList.remove('open');
}

// ======================
// UTILITY: Generate next ID
// ======================
function nextId(arr) {
  if (!arr || arr.length === 0) return 1;
  var max = 0;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id > max) max = arr[i].id;
  }
  return max + 1;
}

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
      if (saveBtn) {
        saveBtn.addEventListener('click', function() {
          var newId = nextId(products);
          products.push({
            id: newId,
            sku: (document.getElementById('f_sku') ? document.getElementById('f_sku').value : '') || 'NEW-' + newId,
            name: (document.getElementById('f_name') ? document.getElementById('f_name').value : '') || 'Produk Baru',
            categoryId: parseInt(document.getElementById('f_category') ? document.getElementById('f_category').value : 1) || 1,
            supplierId: parseInt(document.getElementById('f_supplier') ? document.getElementById('f_supplier').value : 1) || 1,
            warehouseId: parseInt(document.getElementById('f_warehouse') ? document.getElementById('f_warehouse').value : 1) || 1,
            price: 0,
            stock: 0,
            minStock: parseInt(document.getElementById('f_minStock') ? document.getElementById('f_minStock').value : 5) || 5,
            status: (document.getElementById('f_status') ? document.getElementById('f_status').value : '') || 'Aktif'
          });
          saveAllData();
          closeModal();
          showToast('Produk berhasil ditambahkan', 'success');
          if (typeof reRenderTable === 'function') reRenderTable();
        });
      }
    }, 50);
  } else if (type === 'add-kategori') {
    showModal('Tambah Kategori', '<div class="form-grid full">' +
      '<div class="form-group"><label class="form-label">Nama Kategori <span class="required">*</span></label><input class="form-input" id="f_name" placeholder="Nama kategori"></div>' +
      '<div class="form-group"><label class="form-label">Deskripsi</label><textarea class="form-textarea" id="f_desc" rows="3" placeholder="Deskripsi kategori"></textarea></div>' +
    '</div>', '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveMaster">Simpan</button>');
    setTimeout(function() {
      var saveBtn = document.getElementById('saveMaster');
      if (saveBtn) {
        saveBtn.addEventListener('click', function() {
          categories.push({
            id: nextId(categories),
            name: (document.getElementById('f_name') ? document.getElementById('f_name').value : '') || 'Kategori Baru',
            description: (document.getElementById('f_desc') ? document.getElementById('f_desc').value : '') || '',
            count: 0
          });
          saveAllData();
          closeModal();
          showToast('Kategori berhasil ditambahkan', 'success');
          if (typeof reRenderTable === 'function') reRenderTable();
        });
      }
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
      if (saveBtn) {
        saveBtn.addEventListener('click', function() {
          suppliers.push({
            id: nextId(suppliers),
            name: (document.getElementById('f_name') ? document.getElementById('f_name').value : '') || 'Supplier Baru',
            pic: (document.getElementById('f_pic') ? document.getElementById('f_pic').value : '') || '',
            email: (document.getElementById('f_email') ? document.getElementById('f_email').value : '') || '',
            phone: (document.getElementById('f_phone') ? document.getElementById('f_phone').value : '') || ''
          });
          saveAllData();
          closeModal();
          showToast('Supplier berhasil ditambahkan', 'success');
          if (typeof reRenderTable === 'function') reRenderTable();
        });
      }
    }, 50);
  } else if (type === 'add-gudang') {
    showModal('Tambah Gudang', '<div class="form-grid">' +
      '<div class="form-group"><label class="form-label">Kode Gudang <span class="required">*</span></label><input class="form-input" id="f_code" placeholder="WH-XXX"></div>' +
      '<div class="form-group"><label class="form-label">Nama Gudang <span class="required">*</span></label><input class="form-input" id="f_name" placeholder="Nama gudang"></div>' +
      '<div class="form-group full"><label class="form-label">Lokasi <span class="required">*</span></label><input class="form-input" id="f_location" placeholder="Alamat lengkap"></div>' +
    '</div>', '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveMaster">Simpan</button>');
    setTimeout(function() {
      var saveBtn = document.getElementById('saveMaster');
      if (saveBtn) {
        saveBtn.addEventListener('click', function() {
          var newId = nextId(warehouses);
          warehouses.push({
            id: newId,
            code: (document.getElementById('f_code') ? document.getElementById('f_code').value : '') || 'WH-' + String(newId).padStart(3, '0'),
            name: (document.getElementById('f_name') ? document.getElementById('f_name').value : '') || 'Gudang Baru',
            location: (document.getElementById('f_location') ? document.getElementById('f_location').value : '') || '',
            count: 0
          });
          saveAllData();
          closeModal();
          showToast('Gudang berhasil ditambahkan', 'success');
          if (typeof reRenderTable === 'function') reRenderTable();
        });
      }
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
        if (p && !items.find(function(i) { return i.productId == p.id; })) {
          items.push({ productId: parseInt(pid), qty: qty });
          var bmItems = document.getElementById('bmItems');
          if (bmItems) {
            bmItems.innerHTML = items.map(function(i) {
              var p2 = products.find(function(pr) { return pr.id == i.productId; });
              return '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f0f0f0"><span>' + (p2 ? p2.name : 'Item #' + i.productId) + '</span><span style="font-weight:600">' + i.qty + ' pcs</span></div>';
            }).join('');
          }
        }
      });
    }
    var saveBtn = document.getElementById('saveBm');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var newId = nextId(barangMasuk);
        barangMasuk.push({
          id: newId,
          date: (document.getElementById('bm_date') ? document.getElementById('bm_date').value : '') || today,
          supplierId: parseInt(document.getElementById('bm_supplier') ? document.getElementById('bm_supplier').value : 1) || 1,
          ref: (document.getElementById('bm_ref') ? document.getElementById('bm_ref').value : '') || 'PO-' + newId,
          items: items,
          note: ''
        });
        saveAllData();
        closeModal();
        showToast('Barang masuk berhasil dicatat', 'success');
        if (typeof reRenderTable === 'function') reRenderTable();
      });
    }
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
        if (p && !items.find(function(i) { return i.productId == p.id; })) {
          items.push({ productId: parseInt(pid), qty: qty });
          var bkItems = document.getElementById('bkItems');
          if (bkItems) {
            bkItems.innerHTML = items.map(function(i) {
              var p2 = products.find(function(pr) { return pr.id == i.productId; });
              return '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f0f0f0"><span>' + (p2 ? p2.name : 'Item #' + i.productId) + '</span><span style="font-weight:600">' + i.qty + ' pcs</span></div>';
            }).join('');
          }
        }
      });
    }
    var saveBtn = document.getElementById('saveBk');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var newId = nextId(barangKeluar);
        barangKeluar.push({
          id: newId,
          date: (document.getElementById('bk_date') ? document.getElementById('bk_date').value : '') || today,
          penerima: (document.getElementById('bk_penerima') ? document.getElementById('bk_penerima').value : '') || '-',
          items: items,
          ref: (document.getElementById('bk_ref') ? document.getElementById('bk_ref').value : '') || 'OUT-' + newId,
          note: (document.getElementById('bk_note') ? document.getElementById('bk_note').value : '') || ''
        });
        saveAllData();
        closeModal();
        showToast('Barang keluar berhasil dicatat', 'success');
        if (typeof reRenderTable === 'function') reRenderTable();
      });
    }
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
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var newId = nextId(stockAdjustments);
        var productId = parseInt(document.getElementById('sa_product') ? document.getElementById('sa_product').value : 1) || 1;
        var fisik = parseInt(document.getElementById('sa_fisik') ? document.getElementById('sa_fisik').value : 0) || 0;
        var sistem = parseInt(document.getElementById('sa_sistem') ? document.getElementById('sa_sistem').value : 0) || 0;
        stockAdjustments.push({
          id: newId,
          date: (document.getElementById('sa_date') ? document.getElementById('sa_date').value : '') || today,
          productId: productId,
          sistem: sistem,
          fisik: fisik,
          selisih: fisik - sistem,
          alasan: (document.getElementById('sa_alasan') ? document.getElementById('sa_alasan').value : '') || 'Koreksi'
        });
        var p = products.find(function(pr) { return pr.id == productId; });
        if (p) p.stock = fisik;
        saveAllData();
        closeModal();
        showToast('Adjustment stok berhasil disimpan', 'success');
        if (typeof reRenderTable === 'function') reRenderTable();
      });
    }
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
        if (p && !items.find(function(i) { return i.productId == p.id; })) {
          items.push({ productId: parseInt(pid), qty: qty });
          var stItems = document.getElementById('stItems');
          if (stItems) {
            stItems.innerHTML = items.map(function(i) {
              var p2 = products.find(function(pr) { return pr.id == i.productId; });
              return '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f0f0f0"><span>' + (p2 ? p2.name : 'Item #' + i.productId) + '</span><span style="font-weight:600">' + i.qty + ' pcs</span></div>';
            }).join('');
          }
        }
      });
    }
    var saveBtn = document.getElementById('saveSt');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var newId = nextId(stockTransfers);
        stockTransfers.push({
          id: newId,
          date: new Date().toISOString().split('T')[0],
          fromWarehouseId: parseInt(document.getElementById('st_from') ? document.getElementById('st_from').value : 1) || 1,
          toWarehouseId: parseInt(document.getElementById('st_to') ? document.getElementById('st_to').value : 2) || 2,
          items: items,
          ref: 'TRF-' + String(newId).padStart(3, '0')
        });
        saveAllData();
        closeModal();
        showToast('Transfer stok berhasil disimpan', 'success');
        if (typeof reRenderTable === 'function') reRenderTable();
      });
    }
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
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        users.push({
          id: nextId(users),
          name: (document.getElementById('u_name') ? document.getElementById('u_name').value : '') || 'User Baru',
          email: (document.getElementById('u_email') ? document.getElementById('u_email').value : '') || '',
          role: (document.getElementById('u_role') ? document.getElementById('u_role').value : '') || 'Staff',
          status: (document.getElementById('u_status') ? document.getElementById('u_status').value : '') || 'Active',
          lastLogin: '-'
        });
        saveAllData();
        closeModal();
        showToast('User berhasil ditambahkan', 'success');
        if (typeof reRenderTable === 'function') reRenderTable();
      });
    }
  }, 50);
}

// ======================
// EDIT & DELETE HANDLERS
// ======================
function buildEditFields(action, item) {
  var type = action.replace('edit-', '');
  var fields = '';
  if (type === 'produk') {
    var catOpts = categories.map(function(c) { return '<option value="' + c.id + '"' + (c.id === item.categoryId ? ' selected' : '') + '>' + c.name + '</option>'; }).join('');
    var supOpts = suppliers.map(function(s) { return '<option value="' + s.id + '"' + (s.id === item.supplierId ? ' selected' : '') + '>' + s.name + '</option>'; }).join('');
    var whOpts = warehouses.map(function(w) { return '<option value="' + w.id + '"' + (w.id === item.warehouseId ? ' selected' : '') + '>' + w.name + '</option>'; }).join('');
    fields = '<div class="form-grid">' +
      '<div class="form-group"><label class="form-label">Nama Produk</label><input class="form-input" id="f_name" value="' + item.name.replace(/"/g, '&quot;') + '"></div>' +
      '<div class="form-group"><label class="form-label">SKU</label><input class="form-input" id="f_sku" value="' + item.sku.replace(/"/g, '&quot;') + '"></div>' +
      '<div class="form-group"><label class="form-label">Kategori</label><select class="form-select" id="f_category">' + catOpts + '</select></div>' +
      '<div class="form-group"><label class="form-label">Supplier</label><select class="form-select" id="f_supplier">' + supOpts + '</select></div>' +
      '<div class="form-group"><label class="form-label">Gudang</label><select class="form-select" id="f_warehouse">' + whOpts + '</select></div>' +
      '<div class="form-group"><label class="form-label">Min. Stok</label><input class="form-input" id="f_minStock" type="number" value="' + item.minStock + '"></div>' +
      '<div class="form-group"><label class="form-label">Status</label><select class="form-select" id="f_status"><option value="Aktif"' + (item.status === 'Aktif' ? ' selected' : '') + '>Aktif</option><option value="Nonaktif"' + (item.status === 'Nonaktif' ? ' selected' : '') + '>Nonaktif</option></select></div>' +
    '</div>';
  } else if (type === 'kategori') {
    fields = '<div class="form-grid full">' +
      '<div class="form-group"><label class="form-label">Nama Kategori</label><input class="form-input" id="f_name" value="' + item.name.replace(/"/g, '&quot;') + '"></div>' +
      '<div class="form-group"><label class="form-label">Deskripsi</label><textarea class="form-textarea" id="f_desc" rows="3">' + (item.description || '').replace(/"/g, '&quot;') + '</textarea></div>' +
    '</div>';
  } else if (type === 'supplier') {
    fields = '<div class="form-grid">' +
      '<div class="form-group"><label class="form-label">Nama Supplier</label><input class="form-input" id="f_name" value="' + item.name.replace(/"/g, '&quot;') + '"></div>' +
      '<div class="form-group"><label class="form-label">PIC</label><input class="form-input" id="f_pic" value="' + (item.pic || '').replace(/"/g, '&quot;') + '"></div>' +
      '<div class="form-group"><label class="form-label">Email</label><input class="form-input" id="f_email" value="' + (item.email || '').replace(/"/g, '&quot;') + '"></div>' +
      '<div class="form-group"><label class="form-label">Telepon</label><input class="form-input" id="f_phone" value="' + (item.phone || '').replace(/"/g, '&quot;') + '"></div>' +
    '</div>';
  } else if (type === 'gudang') {
    fields = '<div class="form-grid">' +
      '<div class="form-group"><label class="form-label">Kode Gudang</label><input class="form-input" id="f_code" value="' + (item.code || '').replace(/"/g, '&quot;') + '"></div>' +
      '<div class="form-group"><label class="form-label">Nama Gudang</label><input class="form-input" id="f_name" value="' + item.name.replace(/"/g, '&quot;') + '"></div>' +
      '<div class="form-group full"><label class="form-label">Lokasi</label><input class="form-input" id="f_location" value="' + (item.location || '').replace(/"/g, '&quot;') + '"></div>' +
    '</div>';
  } else if (type === 'user') {
    fields = '<div class="form-grid">' +
      '<div class="form-group"><label class="form-label">Nama</label><input class="form-input" id="u_name" value="' + item.name.replace(/"/g, '&quot;') + '"></div>' +
      '<div class="form-group"><label class="form-label">Email</label><input class="form-input" id="u_email" value="' + (item.email || '').replace(/"/g, '&quot;') + '"></div>' +
      '<div class="form-group"><label class="form-label">Role</label><select class="form-select" id="u_role"><option value="Owner"' + (item.role === 'Owner' ? ' selected' : '') + '>Owner</option><option value="Admin"' + (item.role === 'Admin' ? ' selected' : '') + '>Admin</option><option value="Staff"' + (item.role === 'Staff' ? ' selected' : '') + '>Staff</option></select></div>' +
      '<div class="form-group"><label class="form-label">Status</label><select class="form-select" id="u_status"><option value="Active"' + (item.status === 'Active' ? ' selected' : '') + '>Active</option><option value="Inactive"' + (item.status === 'Inactive' ? ' selected' : '') + '>Inactive</option></select></div>' +
    '</div>';
  }
  return fields;
}

function handleEdit(action, id) {
  var entityMap = {
    'edit-produk': { data: products, label: 'Produk' },
    'edit-kategori': { data: categories, label: 'Kategori' },
    'edit-supplier': { data: suppliers, label: 'Supplier' },
    'edit-gudang': { data: warehouses, label: 'Gudang' },
    'edit-user': { data: users, label: 'User' },
  };
  var info = entityMap[action];
  if (!info) { showToast('Edit tidak tersedia untuk entitas ini', 'info'); return; }
  var item = info.data.find(function(d) { return d.id == id; });
  if (!item) { showToast('Data tidak ditemukan', 'error'); return; }

  var fields = buildEditFields(action, item);
  showModal('Edit ' + info.label, fields,
    '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-primary" id="saveEdit">Simpan Perubahan</button>');

  setTimeout(function() {
    var saveBtn = document.getElementById('saveEdit');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        if (action === 'edit-produk') {
          item.name = (document.getElementById('f_name') ? document.getElementById('f_name').value : '') || item.name;
          item.sku = (document.getElementById('f_sku') ? document.getElementById('f_sku').value : '') || item.sku;
          item.categoryId = parseInt(document.getElementById('f_category') ? document.getElementById('f_category').value : item.categoryId) || item.categoryId;
          item.supplierId = parseInt(document.getElementById('f_supplier') ? document.getElementById('f_supplier').value : item.supplierId) || item.supplierId;
          item.warehouseId = parseInt(document.getElementById('f_warehouse') ? document.getElementById('f_warehouse').value : item.warehouseId) || item.warehouseId;
          item.minStock = parseInt(document.getElementById('f_minStock') ? document.getElementById('f_minStock').value : item.minStock) || item.minStock;
          item.status = (document.getElementById('f_status') ? document.getElementById('f_status').value : '') || item.status;
        } else if (action === 'edit-kategori') {
          item.name = (document.getElementById('f_name') ? document.getElementById('f_name').value : '') || item.name;
          item.description = (document.getElementById('f_desc') ? document.getElementById('f_desc').value : '') || item.description;
        } else if (action === 'edit-supplier') {
          item.name = (document.getElementById('f_name') ? document.getElementById('f_name').value : '') || item.name;
          item.pic = (document.getElementById('f_pic') ? document.getElementById('f_pic').value : '') || item.pic;
          item.email = (document.getElementById('f_email') ? document.getElementById('f_email').value : '') || item.email;
          item.phone = (document.getElementById('f_phone') ? document.getElementById('f_phone').value : '') || item.phone;
        } else if (action === 'edit-gudang') {
          item.code = (document.getElementById('f_code') ? document.getElementById('f_code').value : '') || item.code;
          item.name = (document.getElementById('f_name') ? document.getElementById('f_name').value : '') || item.name;
          item.location = (document.getElementById('f_location') ? document.getElementById('f_location').value : '') || item.location;
        } else if (action === 'edit-user') {
          item.name = (document.getElementById('u_name') ? document.getElementById('u_name').value : '') || item.name;
          item.email = (document.getElementById('u_email') ? document.getElementById('u_email').value : '') || item.email;
          item.role = (document.getElementById('u_role') ? document.getElementById('u_role').value : '') || item.role;
          item.status = (document.getElementById('u_status') ? document.getElementById('u_status').value : '') || item.status;
        }
        closeModal();
        showToast('"' + item.name + '" berhasil diperbarui', 'success');
        saveAllData();
        if (typeof reRenderTable === 'function') reRenderTable();
      });
    }
  }, 50);
}

function handleDelete(action, id) {
  var entityMap = {
    'delete-produk': { data: products, nameKey: 'name', label: 'Produk' },
    'delete-kategori': { data: categories, nameKey: 'name', label: 'Kategori' },
    'delete-supplier': { data: suppliers, nameKey: 'name', label: 'Supplier' },
    'delete-gudang': { data: warehouses, nameKey: 'name', label: 'Gudang' },
    'delete-user': { data: users, nameKey: 'name', label: 'User' },
    'delete-bm': { data: barangMasuk, nameKey: 'ref', label: 'Barang Masuk' },
    'delete-bk': { data: barangKeluar, nameKey: 'ref', label: 'Barang Keluar' },
    'delete-sa': { data: stockAdjustments, nameKey: 'id', label: 'Stock Adjustment' },
    'delete-st': { data: stockTransfers, nameKey: 'ref', label: 'Transfer Stok' },
  };
  var info = entityMap[action];
  if (!info) { showToast('Hapus tidak dikenali', 'error'); return; }
  var item = info.data.find(function(d) { return d.id == id; });
  if (!item) { showToast('Data tidak ditemukan', 'error'); return; }
  var name = item[info.nameKey] || ('Item #' + id);

  showModal('Konfirmasi Hapus',
    '<p style="font-size:14px;line-height:1.6">Apakah Anda yakin ingin menghapus <strong>' + name + '</strong>?<br><span style="color:#999">Tindakan ini tidak dapat dibatalkan.</span></p>',
    '<button class="btn btn-secondary" onclick="closeModal()">Batal</button><button class="btn btn-danger" id="confirmDelete">Ya, Hapus</button>');

  setTimeout(function() {
    var confirmBtn = document.getElementById('confirmDelete');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function() {
        var idx = info.data.findIndex(function(d) { return d.id == id; });
        if (idx !== -1) info.data.splice(idx, 1);
        closeModal();
        showToast('"' + name + '" berhasil dihapus', 'success');
        saveAllData();
        if (typeof reRenderTable === 'function') reRenderTable();
      });
    }
  }, 50);
}
