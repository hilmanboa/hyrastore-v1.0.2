document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // --- PENGATURAN APLIKASI ---
    // ===================================================================
    const CONFIG = {
        ADMIN_PASSWORD: 'haeraniboa', 
        HEADER_IMAGE_URL: 'https://i.postimg.cc/gJFgD3Gd/Whats-App-Image-2025-07-30-at-04-29-34.jpg',
        WHATSAPP_NUMBER: '6285161231424',
        SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzhj5lsLSCvKdxeA_0YnDkDpsiUZwWLUWAY6raMqpr_1eEa8SGTh6rMETEtxiCf_xfw3Q/exec',
        ICONS: {
            admin: 'https://images.icon-icons.com/2136/PNG/96/google_admin_icon_131692.png',
            theme_light: 'https://images.icon-icons.com/1370/PNG/512/if-weather-3-2682848_90785.png',
            theme_dark: 'https://images.icon-icons.com/1152/PNG/512/1486506258-moon-night-astronomy-nature-moon-phase-sleep_81483.png',
            home: 'https://images.icon-icons.com/317/PNG/512/house-icon_34406.png',
            cart: 'https://images.icon-icons.com/259/PNG/128/ic_shopping_cart_128_28698.png',
            notifications: 'https://images.icon-icons.com/497/PNG/256/bell-christmas-icon_icon-icons.com_48920.png',
        }
    };
    
    // ===================================================================
    // --- KODE APLIKASI ---
    // ===================================================================

    let allProducts = [], allCategories = [], notifications = [], cart = [], currentProduct = null, allHistory = [];
    const mainContent = document.getElementById('main-content');
    const adminPage = document.getElementById('admin-page');
    const productList = document.getElementById('product-list');
    const storeHeader = document.getElementById('store-header');
    let notifTimeout;

    async function initializeApp() {
        renderStaticIcons();
        updateHeaderImage();
        renderSkeletonLoader();
        try {
            const response = await fetch(`${CONFIG.SCRIPT_URL}?action=getInitialData`);
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            
            const initialData = await response.json();
            allProducts = Array.isArray(initialData.products) ? initialData.products : [];
            allCategories = Array.isArray(initialData.categories) ? initialData.categories : [];
            notifications = Array.isArray(initialData.notifications) ? initialData.notifications : [];
            
            renderDynamicCategories();
            
            const firstCategoryEl = document.querySelector('.category-item');
            if (firstCategoryEl) {
                firstCategoryEl.click();
            } else {
                productList.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">Belum ada produk atau kategori yang ditambahkan.</p>';
            }

            setupNotificationSlider();
            sessionStorage.setItem('initialData', JSON.stringify(initialData));
            
            setupStickyCategories(); 

        } catch (error) {
            console.error('Error initializing app:', error);
            productList.innerHTML = `<p style="text-align:center; grid-column: 1 / -1;">Gagal memuat data. Periksa koneksi dan coba lagi.</p>`;
        }
    }
    
    function initializeFromCache() {
        const cachedData = sessionStorage.getItem('initialData');
        if (cachedData) {
            try {
                const initialData = JSON.parse(cachedData);
                allProducts = Array.isArray(initialData.products) ? initialData.products : [];
                allCategories = Array.isArray(initialData.categories) ? initialData.categories : [];
                notifications = Array.isArray(initialData.notifications) ? initialData.notifications : [];
                
                renderStaticIcons();
                updateHeaderImage();
                renderDynamicCategories();
                
                const firstCategoryEl = document.querySelector('.category-item');
                if (firstCategoryEl) {
                    firstCategoryEl.click();
                } else {
                     productList.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">Belum ada produk atau kategori.</p>';
                }

                setupNotificationSlider();
                initializeAppWithoutLoader();
                
                setupStickyCategories();

            } catch (error) {
                sessionStorage.removeItem('initialData');
                initializeApp();
            }
        } else {
            initializeApp();
        }
    }

    async function initializeAppWithoutLoader() {
        try {
            const response = await fetch(`${CONFIG.SCRIPT_URL}?action=getInitialData`);
            if (!response.ok) return;
            const freshData = await response.json();
            if (JSON.stringify(freshData) !== sessionStorage.getItem('initialData')) {
                sessionStorage.setItem('initialData', JSON.stringify(freshData));
                console.log('Data di belakang layar telah diperbarui.');
            }
        } catch (error) {
            console.error('Gagal memperbarui data di belakang layar:', error);
        }
    }
    
    function setupStickyCategories() {
        const categorySection = document.querySelector('.category-section');
        const topBar = document.querySelector('.top-bar');

        if (!categorySection || !topBar) return;
        
        const topBarHeight = topBar.offsetHeight;
        // Atur posisi 'top' untuk .category-section agar pas di bawah top-bar
        categorySection.style.top = `${topBarHeight}px`;

        // Dengan metode CSS baru, JavaScript tidak perlu lagi melakukan apa-apa.
        // Cukup pastikan 'top' nya benar. CSS akan menangani sisanya.
    }
    
    function adjustCategoryAlignment() {
        const container = document.getElementById('category-icons-container');
        if (!container) return;
        const isOverflowing = container.scrollWidth > container.clientWidth;
        container.style.justifyContent = isOverflowing ? 'flex-start' : 'center';
    }

    function renderDynamicCategories() {
        const createImg = (url, alt) => `<img src="${url}" alt="${alt}" class="icon-img" onerror="this.style.display='none'">`;
        const categoryContainer = document.getElementById('category-icons-container');
        categoryContainer.innerHTML = '';

        if (!allCategories || allCategories.length === 0) {
            adjustCategoryAlignment();
            return;
        }

        const sortedCategories = [...allCategories].sort((a, b) => a.Urutan - b.Urutan);

        sortedCategories.forEach((cat) => {
            const catName = cat['Nama Kategori'];
            const iconUrl = cat['URL Ikon'];
            if (!catName) return;

            const item = document.createElement('div');
            item.className = 'category-item';
            item.dataset.category = catName;
            item.innerHTML = `<div class="icon">${createImg(iconUrl, catName)}</div><span>${catName}</span>`;
            
            item.addEventListener('click', () => {
                categoryContainer.querySelectorAll('.category-item').forEach(c => c.classList.remove('active'));
                item.classList.add('active');
                renderProducts(catName);
            });
            categoryContainer.appendChild(item);
        });
        
        setTimeout(adjustCategoryAlignment, 0);
    }
    
    // Sisa kode di bawah ini sama persis seperti sebelumnya...
    function renderStaticIcons() { const createImg = (url, alt) => `<img src="${url}" alt="${alt}" class="icon-img">`; document.getElementById('admin-icon-container').innerHTML = createImg(CONFIG.ICONS.admin, 'Admin'); document.getElementById('theme-toggle').innerHTML = createImg(CONFIG.ICONS.theme_light, 'Light Mode'); document.getElementById('home-btn').querySelector('.icon').innerHTML = createImg(CONFIG.ICONS.home, 'Home'); document.getElementById('cart-btn').querySelector('.icon').innerHTML = createImg(CONFIG.ICONS.cart, 'Cart'); document.getElementById('notif-btn').querySelector('.icon').innerHTML = createImg(CONFIG.ICONS.notifications, 'Notifications'); }
    function renderSkeletonLoader() { productList.innerHTML = ''; for (let i = 0; i < 6; i++) { const skeletonCard = document.createElement('div'); skeletonCard.className = 'skeleton-card'; skeletonCard.innerHTML = `<div class="skeleton-img"></div><div class="skeleton-text"></div><div class="skeleton-text" style="width: 60%;"></div>`; productList.appendChild(skeletonCard); } }
    function renderProducts(category) { productList.innerHTML = ''; const filtered = allProducts.filter(p => p.Kategori === category); if (filtered.length === 0) { productList.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">Tidak ada produk dalam kategori ini.</p>'; return; } filtered.forEach(product => { const card = document.createElement('div'); card.className = 'product-card'; const productId = `${product.Nama}-${product.Kategori}`.replace(/\s+/g, '-'); card.dataset.productId = productId; card.innerHTML = `<img src="${product.Gambar}" alt="${product.Nama}" loading="lazy"><div class="info"><h3>${product.Nama}</h3><div class="price-container"><p>Rp ${Number(product.Harga).toLocaleString('id-ID')}</p><button class="add-to-cart-icon-btn" data-product-id="${productId}">+</button></div></div>`; card.addEventListener('click', (e) => { if (e.target.matches('.add-to-cart-icon-btn')) return; const hasVariations = product.Variasi && String(product.Variasi).split(',').filter(v => v.trim() !== '').length > 0; if (hasVariations) { openProductModal(product); } else { addProductToCart(product); triggerFlyToCartAnimation(card.querySelector('img')); } }); productList.appendChild(card); }); }
    function updateHeaderImage() { if (CONFIG.HEADER_IMAGE_URL) { storeHeader.style.backgroundImage = `url('${CONFIG.HEADER_IMAGE_URL}')`; } }
    function openProductModal(product) { if (!product) return; currentProduct = product; document.getElementById('modal-product-image').src = product.Gambar; document.getElementById('modal-product-name').textContent = product.Nama; const v = document.getElementById('variant-select'); const vs = product.Variasi ? String(product.Variasi).split(',') : []; const vg = document.getElementById('modal-product-variants'); if (vs.length > 0 && vs[0].trim() !== '') { vg.style.display = 'block'; v.innerHTML = vs.map(vr => `<option value="${vr.trim()}">${vr.trim()}</option>`).join(''); } else { vg.style.display = 'none'; } document.getElementById('product-modal').style.display = 'flex'; }
    function handleAddToCart() { if (!currentProduct) return; const v = document.getElementById('variant-select'); const sv = v.parentElement.style.display !== 'none' ? v.value : ''; const exist = cart.find(i => i.nama === currentProduct.Nama && i.variasi === sv); if (exist) { exist.qty++; } else { cart.push({ nama: currentProduct.Nama, harga: Number(currentProduct.Harga), gambar: currentProduct.Gambar, kategori: currentProduct.Kategori, variasi: sv, qty: 1 }); } document.getElementById('product-modal').style.display = 'none'; updateCartUI(); }
    function updateCartUI() { const badge = document.getElementById('cart-badge'); const list = document.getElementById('cart-items-list'); const totalEl = document.getElementById('cart-total'); const totalItems = cart.reduce((s, i) => s + i.qty, 0); let totalAmount = 0; badge.textContent = totalItems; if (totalItems > 0) { badge.classList.add('active'); } else { badge.classList.remove('active'); } list.innerHTML = ''; if (cart.length === 0) { list.innerHTML = '<p>Keranjang kosong.</p>'; } else { cart.forEach((item, index) => { totalAmount += item.harga * item.qty; list.innerHTML += `<div class="cart-item" style="display:flex;align-items:center;margin-bottom:15px;"><img src="${item.gambar}" style="width:60px;height:60px;border-radius:8px;object-fit:cover" alt="${item.nama}"><div style="flex-grow:1;margin-left:10px;"><strong>${item.nama}</strong> ${item.variasi ? `(${item.variasi})` : ''}<br><small>Rp ${item.harga.toLocaleString('id-ID')}</small></div><div style="display:flex;align-items:center;"><button class="qty-btn" data-index="${index}" data-change="-1">-</button><input value="${item.qty}" style="width:40px;text-align:center" readonly><button class="qty-btn" data-index="${index}" data-change="1">+</button></div></div>`; }); } totalEl.textContent = `Rp ${totalAmount.toLocaleString('id-ID')}`; }
    function updateCartQuantity(i, c) { if (cart[i]) { cart[i].qty += c; if (cart[i].qty <= 0) { cart.splice(i, 1); } updateCartUI(); } }
    function sendOrder() { if (cart.length === 0) return; const t = cart.reduce((s, i) => s + i.harga * i.qty, 0); const n = document.getElementById('cart-notes').value; let m = `Hallo Dapur Doa Umi x Risoles Hyra, Saya Mau Pesan:\n\n`; cart.forEach(i => { m += `*${i.nama}* ${i.variasi ? `(${i.variasi})` : ''}\n- Jumlah: ${i.qty} x Rp ${i.harga.toLocaleString('id-ID')}\n\n`; }); m += `*Total Pembayaran: Rp ${t.toLocaleString('id-ID')}*\n`; if (n) m += `*Catatan:* ${n}`; const u = `https://api.whatsapp.com/send?phone=${CONFIG.WHATSAPP_NUMBER}&text=${encodeURIComponent(m)}`; window.open(u, '_blank'); const d = { items: [...cart], catatan: n }; cart = []; document.getElementById('cart-notes').value = ''; updateCartUI(); document.getElementById('cart-modal').style.display = 'none'; fetch(CONFIG.SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'saveTransaction', data: d }) }); }
    function addProductToCart(product) { if (!product) return; const existingItem = cart.find(item => item.nama === product.Nama && !item.variasi); if (existingItem) { existingItem.qty++; } else { cart.push({ nama: product.Nama, harga: Number(product.Harga), gambar: product.Gambar, kategori: product.Kategori, variasi: '', qty: 1 }); } updateCartUI(); }
    function triggerFlyToCartAnimation(startElement) { const cartBtn = document.getElementById('cart-btn'); const endRect = cartBtn.getBoundingClientRect(); const startRect = startElement.getBoundingClientRect(); const flyEl = document.createElement('div'); flyEl.className = 'fly-to-cart-element'; document.body.appendChild(flyEl); flyEl.style.left = `${startRect.left + startRect.width / 2}px`; flyEl.style.top = `${startRect.top + startRect.height / 2}px`; const endX = endRect.left + endRect.width / 2 - startRect.left - startRect.width / 2; const endY = endRect.top + endRect.height / 2 - startRect.top - startRect.height / 2; flyEl.style.setProperty('--cart-end-x', `${endX}px`); flyEl.style.setProperty('--cart-end-y', `${endY}px`); flyEl.addEventListener('animationend', () => { flyEl.remove(); }); }
    function setupNotificationSlider() { if (!notifications || notifications.length === 0) { document.getElementById('notification-bar').style.display = 'none'; return; } const bar = document.getElementById('notification-bar'); const slider = document.getElementById('notification-slider'); const counter = document.getElementById('notif-counter'); const controls = document.getElementById('notif-controls'); const prevBtn = document.getElementById('notif-prev'); const nextBtn = document.getElementById('notif-next'); slider.innerHTML = ''; notifications.forEach(notif => { const slide = document.createElement('div'); slide.className = 'notification-slide'; slide.innerHTML = `<div class="notification-content-wrapper"><h4>${notif.Judul}</h4><p>${notif.Isi}</p></div>`; slider.appendChild(slide); }); let currentNotifIndex = 0; if (notifications.length > 1) { counter.style.display = 'block'; controls.style.display = 'flex'; } else { counter.style.display = 'none'; controls.style.display = 'none'; } nextBtn.addEventListener('click', () => { currentNotifIndex = (currentNotifIndex + 1) % notifications.length; showNotification(currentNotifIndex); }); prevBtn.addEventListener('click', () => { currentNotifIndex = (currentNotifIndex - 1 + notifications.length) % notifications.length; showNotification(currentNotifIndex); }); showNotification(0); }
    function showNotification(index) { const bar = document.getElementById('notification-bar'); const slider = document.getElementById('notification-slider'); const counter = document.getElementById('notif-counter'); if (notifications.length === 0) return; const offset = -index * 100; slider.style.transform = `translateX(${offset}%)`; if (notifications.length > 1) { counter.textContent = `${index + 1}/${notifications.length}`; } bar.style.display = 'block'; setTimeout(() => bar.classList.add('visible'), 50); clearTimeout(notifTimeout); notifTimeout = setTimeout(() => { const nextIndex = index + 1; if (nextIndex < notifications.length) { showNotification(nextIndex); } else { bar.classList.remove('visible'); setTimeout(() => bar.style.display = 'none', 500); } }, 5000); }
    const adminFormModal = document.getElementById('admin-form-modal');
    async function showAdminPanel() { const p = prompt("Masukkan kata sandi admin:"); if (p === CONFIG.ADMIN_PASSWORD) { mainContent.style.display = 'none'; adminPage.style.display = 'block'; adminPage.innerHTML = '<h2>Memuat...</h2>'; try { const h = await fetch(`${CONFIG.SCRIPT_URL}?action=getHistory`); allHistory = await h.json(); renderAdminPage(); } catch (e) { adminPage.innerHTML = '<h2>Gagal memuat riwayat.</h2>'; } } else if (p !== null) { alert("Kata sandi salah!"); } }
    function renderAdminPage() { const a = adminPage; a.innerHTML = `<h1>Panel Admin</h1><div id="admin-tabs"><div class="admin-tab active" data-tab="transaksi">Pesanan Baru</div><div class="admin-tab" data-tab="pesanan">Selesai & Batal</div><div class="admin-tab" data-tab="produk">Produk</div><div class="admin-tab" data-tab="notifikasi">Notifikasi</div></div><div id="admin-content" style="min-height:300px;"><div id="tab-transaksi" class="admin-tab-content active"></div><div id="tab-pesanan" class="admin-tab-content"></div><div id="tab-produk" class="admin-tab-content"></div><div id="tab-notifikasi" class="admin-tab-content"></div></div><button class="btn-secondary" id="exit-admin-btn" style="margin-top:20px;">Kembali</button>`; renderAdminOrders(); renderAdminProducts(); renderAdminNotifications(); a.querySelectorAll('.admin-tab').forEach(t => t.addEventListener('click', e => { a.querySelectorAll('.admin-tab, .admin-tab-content').forEach(el => el.classList.remove('active')); e.target.classList.add('active'); a.querySelector(`#tab-${e.target.dataset.tab}`).classList.add('active'); })); document.getElementById('exit-admin-btn').addEventListener('click', () => { mainContent.style.display = 'block'; a.style.display = 'none'; initializeFromCache(); }); }
    function renderAdminProducts() { const c = document.getElementById('tab-produk'); let t = `<table class="admin-table"><thead><tr><th>Nama</th><th>Kategori</th><th>Aksi</th></tr></thead><tbody>`; allProducts.forEach((p, i) => { t += `<tr><td>${p.Nama}</td><td>${p.Kategori}</td><td><button onclick="openProductForm('edit',${i})">Edit</button><button onclick="deleteProduct(${i})">Hapus</button></td></tr>` }); t += `</tbody></table>`; c.innerHTML = t + '<button onclick="openProductForm(\'add\')">Tambah</button> <button class="btn-save" onclick="saveDataToSheet(event, \'Produk\')">Simpan ke Sheet</button>'; }
    window.openProductForm = (m, i = null) => { const p = m === 'edit' ? allProducts[i] : { Nama: '', Kategori: '', Harga: '', Gambar: '', Variasi: '' }; adminFormModal.querySelector('h3').textContent = m === 'edit' ? 'Edit Produk' : 'Tambah Produk'; adminFormModal.querySelector('#admin-form-content').innerHTML = `<div class="form-group"><label>Nama</label><input id="form-nama" value="${p.Nama}"></div><div class="form-group"><label>Kategori</label><input id="form-kategori" value="${p.Kategori}"></div><div class="form-group"><label>Harga</label><input id="form-harga" type="number" value="${p.Harga}"></div><div class="form-group"><label>URL Gambar</label><input id="form-gambar" value="${p.Gambar}"></div><div class="form-group"><label>Variasi (koma)</label><input id="form-variasi" value="${p.Variasi}"></div>`; adminFormModal.querySelector('#admin-form-save-btn').onclick = () => saveProductForm(m, i); adminFormModal.style.display = 'flex'; };
    function saveProductForm(m, i) { const uP = { Nama: document.getElementById('form-nama').value, Kategori: document.getElementById('form-kategori').value, Harga: parseInt(document.getElementById('form-harga').value) || 0, Gambar: document.getElementById('form-gambar').value, Variasi: document.getElementById('form-variasi').value }; if (m === 'edit') { allProducts[i] = uP; } else { allProducts.push(uP); } adminFormModal.style.display = 'none'; renderAdminProducts(); };
    window.deleteProduct = (i) => { if (confirm(`Hapus ${allProducts[i].Nama}?`)) { allProducts.splice(i, 1); renderAdminProducts(); } };
    function renderAdminNotifications() { const c = document.getElementById('tab-notifikasi'); let t = `<table class="admin-table"><thead><tr><th>Judul</th><th>Isi</th><th>Aksi</th></tr></thead><tbody>`; notifications.forEach((n, i) => { t += `<tr><td>${n.Judul}</td><td>${n.Isi}</td><td><button onclick="openNotificationForm('edit',${i})">Edit</button><button onclick="deleteNotification(${i})">Hapus</button></td></tr>` }); t += `</tbody></table>`; c.innerHTML = t + '<button onclick="openNotificationForm(\'add\')">Tambah</button> <button class="btn-save" onclick="saveDataToSheet(event, \'Notifikasi\')">Simpan ke Sheet</button>'; }
    window.openNotificationForm = (m, i = null) => { const n = m === 'edit' ? notifications[i] : { Judul: '', Isi: '' }; adminFormModal.querySelector('h3').textContent = m === 'edit' ? 'Edit Notif' : 'Tambah'; adminFormModal.querySelector('#admin-form-content').innerHTML = `<div class="form-group"><label>Judul</label><input id="form-judul" value="${n.Judul}"></div><div class="form-group"><label>Isi</label><textarea id="form-isi">${n.Isi}</textarea></div>`; adminFormModal.querySelector('#admin-form-save-btn').onclick = () => saveNotificationForm(m, i); adminFormModal.style.display = 'flex'; };
    function saveNotificationForm(m, i) { const uN = { Judul: document.getElementById('form-judul').value, Isi: document.getElementById('form-isi').value }; if (m === 'edit') { notifications[i] = uN; } else { notifications.push(uN); } adminFormModal.style.display = 'none'; renderAdminNotifications(); };
    window.deleteNotification = (i) => { if (confirm(`Hapus ${notifications[i].Judul}?`)) { notifications.splice(i, 1); renderAdminNotifications(); } };
    window.saveDataToSheet = async (event, s) => { const b = event.target; b.disabled = true; b.textContent = 'Menyimpan...'; let d, h; if (s === 'Produk') { d = allProducts; h = ['Nama', 'Kategori', 'Harga', 'Gambar', 'Variasi']; } else { d = notifications; h = ['Judul', 'Isi']; } const a = d.map(o => h.map(hd => o[hd] || '')); try { const r = await fetch(CONFIG.SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'saveSheetData', sheetName: s, data: a }) }); const rs = await r.json(); if (rs.status !== 'success') throw new Error(rs.message); alert(`${s} berhasil disimpan!`); } catch (e) { alert(`Gagal: ${e.message}`); } finally { b.disabled = false; b.textContent = 'Simpan ke Sheet'; } };
    function renderAdminOrders() { const nC = document.getElementById('tab-transaksi'), fC = document.getElementById('tab-pesanan'); nC.innerHTML = ''; fC.innerHTML = '<h3>Selesai</h3><div id="completed-orders"></div><h3>Batal</h3><div id="canceled-orders"></div>'; const o = allHistory.reduce((a, i) => { a[i.ID_Pesanan] = a[i.ID_Pesanan] || []; a[i.ID_Pesanan].push(i); return a; }, {}); if (Object.keys(o).length === 0) { nC.innerHTML = '<p>Belum ada pesanan.</p>'; fC.querySelector('#completed-orders').innerHTML = '<p>Belum ada riwayat pesanan.</p>'; fC.querySelector('#canceled-orders').innerHTML = '<p>Belum ada riwayat pesanan.</p>'; return; } const sO = Object.keys(o).sort((a, b) => b - a); let n = 0, c = 0, x = 0; for (const oId of sO) { const i = o[oId], fI = i[0], s = fI.Status; let t = 0; let iH = ''; i.forEach(it => { t += it.TotalHarga; iH += `<div style="font-size:0.9em;">- ${it.NamaProduk} ${it.Variasi ? `(${it.Variasi})` : ''} x ${it.Qty}</div>`; }); const oC = document.createElement('div'); oC.className = 'order-card'; oC.style = "background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:15px;margin-bottom:15px;"; oC.innerHTML = `<div style="font-weight:bold;margin-bottom:10px;display:flex;justify-content:space-between;"><span>ID: ${oId}</span><span style="font-size:0.8em">${new Date(fI.Timestamp).toLocaleString('id-ID')}</span></div><div>${iH}</div><div style="margin-top:10px;border-top:1px dashed var(--border-color);padding-top:10px;"><div><strong>Catatan:</strong> ${fI.Catatan || '-'}</div><div><strong>Total Pesanan: Rp ${t.toLocaleString('id-ID')}</strong></div><div style="margin-top:10px;">${s === 'Baru' ? `<button class="btn-save" onclick="handleOrderStatusUpdate(event,'${oId}','Selesai')">Selesai</button><button class="btn-danger" onclick="handleOrderStatusUpdate(event,'${oId}','Batal')">Batal</button>` : `Status: <strong>${s}</strong>`}</div></div>`; if (s === 'Baru') { nC.appendChild(oC); n++; } else if (s === 'Selesai') { document.getElementById('completed-orders').appendChild(oC); c++; } else if (s === 'Batal') { document.getElementById('canceled-orders').appendChild(oC); x++; } } if (n === 0) nC.innerHTML = '<p>Tidak ada pesanan baru.</p>'; if (c === 0) document.getElementById('completed-orders').innerHTML = '<p>Tidak ada.</p>'; if (x === 0) document.getElementById('canceled-orders').innerHTML = '<p>Tidak ada.</p>'; }
    window.handleOrderStatusUpdate = async (e, o, n) => { if (!confirm(`Yakin ubah status?`)) return; e.target.disabled = true; try { const r = await fetch(CONFIG.SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'updateOrderStatus', orderId: o, newStatus: n }) }); const rs = await r.json(); if (rs.status !== 'success') throw new Error(rs.message); allHistory.forEach(i => { if (i.ID_Pesanan == o) i.Status = n }); renderAdminOrders(); } catch (err) { alert('Gagal update status'); } };
    
    const themeToggleBtn = document.getElementById('theme-toggle');
    themeToggleBtn.addEventListener('click', () => { document.body.classList.toggle('dark-mode'); const isDarkMode = document.body.classList.contains('dark-mode'); const createImg = (url, alt) => `<img src="${url}" alt="${alt}" class="icon-img">`; themeToggleBtn.innerHTML = isDarkMode ? createImg(CONFIG.ICONS.theme_dark, 'Dark Mode') : createImg(CONFIG.ICONS.theme_light, 'Light Mode'); });
    document.getElementById('admin-icon-container').addEventListener('click', showAdminPanel);
    document.getElementById('home-btn').addEventListener('click', () => { mainContent.style.display = 'block'; adminPage.style.display = 'none'; });
    document.getElementById('cart-btn').addEventListener('click', () => document.getElementById('cart-modal').style.display = 'flex');
    document.getElementById('notif-btn').addEventListener('click', () => { document.getElementById('notification-content').innerHTML = notifications.length > 0 ? notifications.map(n => `<h3>${n.Judul}</h3><p>${n.Isi}</p><hr>`).join('') : '<p>Tidak ada info.</p>'; document.getElementById('notification-modal').style.display = 'flex' });
    document.getElementById('add-to-cart-btn').addEventListener('click', handleAddToCart);
    document.getElementById('order-whatsapp-btn').addEventListener('click', sendOrder);
    document.getElementById('cart-items-list').addEventListener('click', e => { if (e.target.classList.contains('qty-btn')) { const i = parseInt(e.target.dataset.index); const c = parseInt(e.target.dataset.change); updateCartQuantity(i, c); } });
    document.getElementById('close-modal-btn').addEventListener('click', () => document.getElementById('product-modal').style.display = 'none');
    document.getElementById('close-cart-btn').addEventListener('click', () => document.getElementById('cart-modal').style.display = 'none');
    document.getElementById('close-notif-btn').addEventListener('click', () => document.getElementById('notification-modal').style.display = 'none');
    document.getElementById('admin-form-close-btn').addEventListener('click', () => document.getElementById('admin-form-modal').style.display = 'none');
    productList.addEventListener('click', (e) => {
        if (e.target.matches('.add-to-cart-icon-btn')) {
            e.stopPropagation();
            const productId = e.target.dataset.productId;
            const product = allProducts.find(p => `${p.Nama}-${p.Kategori}`.replace(/\s+/g, '-') === productId);
            if (product) {
                const hasVariations = product.Variasi && String(product.Variasi).split(',').filter(v => v.trim() !== '').length > 0;
                if (hasVariations) {
                    openProductModal(product);
                } else {
                    addProductToCart(product);
                    triggerFlyToCartAnimation(e.target);
                }
            }
        }
    });

    window.addEventListener('resize', adjustCategoryAlignment);
    initializeFromCache();
});
