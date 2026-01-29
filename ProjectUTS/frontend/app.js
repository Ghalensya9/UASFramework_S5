/**
 * LibraFlow - Sistem Manajemen Perpustakaan
 * Frontend JavaScript Application
 * 
 * Fitur:
 * - Login/Register dengan JWT Authentication
 * - CRUD Buku, Anggota, Peminjaman
 * - Dashboard dengan statistik
 * - Real-time data fetching
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const ENDPOINTS = {
    login: `${API_BASE_URL}/auth/login/`,
    refresh: `${API_BASE_URL}/auth/refresh/`,
    register: `${API_BASE_URL}/auth/register/`,
    profile: `${API_BASE_URL}/auth/profile/`,
    dashboard: `${API_BASE_URL}/dashboard/`,
    buku: `${API_BASE_URL}/buku/`,
    anggota: `${API_BASE_URL}/anggota/`,
    peminjaman: `${API_BASE_URL}/peminjaman/`,
};


// =============================================================================
// STATE MANAGEMENT
// =============================================================================

let state = {
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    currentPage: 'dashboard',
    buku: [],
    anggota: [],
    peminjaman: [],
};


// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Make API request with authentication
 */
async function apiRequest(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (state.accessToken) {
        headers['Authorization'] = `Bearer ${state.accessToken}`;
    }

    try {
        const response = await fetch(url, { ...options, headers });

        // Handle 401 - try to refresh token
        if (response.status === 401 && state.refreshToken) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                headers['Authorization'] = `Bearer ${state.accessToken}`;
                return fetch(url, { ...options, headers });
            } else {
                logout();
                return response;
            }
        }

        return response;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken() {
    try {
        const response = await fetch(ENDPOINTS.refresh, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: state.refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            state.accessToken = data.access;
            localStorage.setItem('accessToken', data.access);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle',
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <p>${message}</p>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

/**
 * Format date to Indonesian format
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

/**
 * Get initials from name
 */
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Toggle password visibility
 */
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling?.querySelector('i') ||
        input.parentElement.querySelector('.toggle-password i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}


// =============================================================================
// AUTHENTICATION
// =============================================================================

/**
 * Handle login form submission
 */
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    errorDiv.classList.add('hidden');

    try {
        const response = await fetch(ENDPOINTS.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Store tokens
            state.accessToken = data.access;
            state.refreshToken = data.refresh;
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);

            // Get user profile
            await fetchUserProfile();

            // Show main app
            showMainApp();
            showToast('Login berhasil! Selamat datang.', 'success');
        } else {
            errorDiv.textContent = data.detail || 'Username atau password salah';
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Terjadi kesalahan. Pastikan server backend berjalan.';
        errorDiv.classList.remove('hidden');
    }
}

/**
 * Handle registration form submission
 */
async function handleRegister(event) {
    event.preventDefault();

    const formData = {
        username: document.getElementById('reg-username').value,
        password: document.getElementById('reg-password').value,
        email: document.getElementById('reg-email').value,
        first_name: document.getElementById('reg-firstname').value,
        last_name: document.getElementById('reg-lastname').value,
    };

    const errorDiv = document.getElementById('register-error');
    errorDiv.classList.add('hidden');

    try {
        const response = await fetch(ENDPOINTS.register, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
            hideRegisterForm();
            showToast('Registrasi berhasil! Silakan login.', 'success');
            document.getElementById('login-username').value = formData.username;
            document.getElementById('login-password').focus();
        } else {
            let errorMessage = 'Registrasi gagal. ';
            if (data.username) errorMessage += data.username.join(' ');
            if (data.password) errorMessage += data.password.join(' ');
            if (data.email) errorMessage += data.email.join(' ');

            errorDiv.textContent = errorMessage;
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Register error:', error);
        errorDiv.textContent = 'Terjadi kesalahan. Pastikan server backend berjalan.';
        errorDiv.classList.remove('hidden');
    }
}

/**
 * Fetch user profile
 */
async function fetchUserProfile() {
    try {
        const response = await apiRequest(ENDPOINTS.profile);
        if (response.ok) {
            state.user = await response.json();
            localStorage.setItem('user', JSON.stringify(state.user));
            updateUserDisplay();
        }
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
    }
}

/**
 * Update user display in sidebar
 */
function updateUserDisplay() {
    const displayName = document.getElementById('display-username');
    if (state.user) {
        displayName.textContent = state.user.first_name || state.user.username;
    }
}

/**
 * Logout user
 */
function logout() {
    state.accessToken = null;
    state.refreshToken = null;
    state.user = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('login-page').classList.remove('hidden');

    // Reset forms
    document.getElementById('login-form').reset();
    document.getElementById('login-error').classList.add('hidden');

    showToast('Anda telah logout.', 'info');
}

/**
 * Show register form modal
 */
function showRegisterForm() {
    document.getElementById('register-modal').classList.remove('hidden');
}

/**
 * Hide register form modal
 */
function hideRegisterForm() {
    document.getElementById('register-modal').classList.add('hidden');
    document.getElementById('register-form').reset();
    document.getElementById('register-error').classList.add('hidden');
}


// =============================================================================
// NAVIGATION
// =============================================================================

/**
 * Show main application (after login)
 */
function showMainApp() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    updateUserDisplay();
    loadDashboard();
}

/**
 * Navigate to a page
 */
function navigateTo(page) {
    state.currentPage = page;

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // Update content pages
    document.querySelectorAll('.content-page').forEach(p => {
        p.classList.toggle('active', p.id === `${page}-page`);
    });

    // Update page title
    const titles = {
        dashboard: ['Dashboard', 'Selamat datang di LibraFlow'],
        buku: ['Daftar Buku', 'Kelola koleksi buku perpustakaan'],
        anggota: ['Anggota', 'Kelola data anggota perpustakaan'],
        peminjaman: ['Peminjaman', 'Kelola transaksi peminjaman buku'],
    };

    document.getElementById('page-title').textContent = titles[page][0];
    document.getElementById('page-subtitle').textContent = titles[page][1];

    // Load data for the page
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'buku':
            loadBuku();
            break;
        case 'anggota':
            loadAnggota();
            break;
        case 'peminjaman':
            loadPeminjaman();
            break;
    }

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');
}

/**
 * Toggle sidebar on mobile
 */
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}


// =============================================================================
// MODAL FUNCTIONS
// =============================================================================

/**
 * Show modal
 */
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');

    // Load data for peminjaman modal
    if (modalId === 'peminjaman-modal') {
        loadPeminjamanFormData();
    }
}

/**
 * Hide modal
 */
function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');

    // Reset form
    const form = document.querySelector(`#${modalId} form`);
    if (form) {
        form.reset();
        const hiddenId = form.querySelector('input[type="hidden"]');
        if (hiddenId) hiddenId.value = '';
    }

    // Hide error messages
    const errorDiv = document.querySelector(`#${modalId} .error-message`);
    if (errorDiv) errorDiv.classList.add('hidden');
}


// =============================================================================
// DASHBOARD
// =============================================================================

/**
 * Load dashboard data
 */
async function loadDashboard() {
    try {
        const response = await apiRequest(ENDPOINTS.dashboard);
        if (response.ok) {
            const data = await response.json();

            // Update stats
            document.getElementById('stat-total-buku').textContent = data.total_buku;
            document.getElementById('stat-total-anggota').textContent = data.total_anggota;
            document.getElementById('stat-dipinjam').textContent = data.total_dipinjam;
            document.getElementById('stat-tersedia').textContent = data.buku_tersedia;

            // Load active loans
            loadActiveLoans();
        }
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        showToast('Gagal memuat dashboard', 'error');
    }
}

/**
 * Load active loans for dashboard
 */
async function loadActiveLoans() {
    try {
        const response = await apiRequest(`${ENDPOINTS.peminjaman}?status=aktif`);
        if (response.ok) {
            const data = await response.json();
            const container = document.getElementById('active-loans-list');

            if (data.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-check-circle"></i>
                        <p>Tidak ada peminjaman aktif</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = data.slice(0, 5).map(item => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="activity-info">
                        <h4>${item.buku_detail?.judul || 'Buku #' + item.buku}</h4>
                        <p>Dipinjam oleh ${item.anggota_detail?.nama || 'Anggota #' + item.anggota}</p>
                    </div>
                    <span class="activity-badge">${formatDate(item.tanggal_pinjam)}</span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load active loans:', error);
    }
}


// =============================================================================
// BUKU CRUD
// =============================================================================

/**
 * Load buku list
 */
async function loadBuku() {
    try {
        let url = ENDPOINTS.buku;
        const search = document.getElementById('buku-search')?.value;
        const filter = document.getElementById('buku-filter')?.value;

        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (filter) params.append('available', filter);

        if (params.toString()) url += `?${params.toString()}`;

        const response = await apiRequest(url);
        if (response.ok) {
            state.buku = await response.json();
            renderBukuTable();
        }
    } catch (error) {
        console.error('Failed to load buku:', error);
        showToast('Gagal memuat data buku', 'error');
    }
}

/**
 * Render buku table
 */
function renderBukuTable() {
    const tbody = document.getElementById('buku-tbody');

    if (state.buku.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted" style="padding: 40px;">
                    <i class="fas fa-book" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                    Tidak ada data buku
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = state.buku.map(buku => `
        <tr>
            <td>#${buku.id}</td>
            <td><strong>${buku.judul}</strong></td>
            <td>${buku.penulis}</td>
            <td>${buku.tahun}</td>
            <td>
                <span class="status-badge ${buku.is_available ? 'available' : 'borrowed'}">
                    <i class="fas ${buku.is_available ? 'fa-check' : 'fa-clock'}"></i>
                    ${buku.is_available ? 'Tersedia' : 'Dipinjam'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-icon" onclick="editBuku(${buku.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-icon btn-danger" onclick="confirmDeleteBuku(${buku.id}, '${buku.judul}')" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Search buku with debounce
 */
let bukuSearchTimeout;
function searchBuku() {
    clearTimeout(bukuSearchTimeout);
    bukuSearchTimeout = setTimeout(loadBuku, 300);
}

/**
 * Filter buku
 */
function filterBuku() {
    loadBuku();
}

/**
 * Handle buku form submission
 */
async function handleBukuSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('buku-id').value;
    const formData = {
        judul: document.getElementById('buku-judul').value,
        penulis: document.getElementById('buku-penulis').value,
        tahun: parseInt(document.getElementById('buku-tahun').value),
    };

    const errorDiv = document.getElementById('buku-error');
    errorDiv.classList.add('hidden');

    try {
        const url = id ? `${ENDPOINTS.buku}${id}/` : ENDPOINTS.buku;
        const method = id ? 'PUT' : 'POST';

        const response = await apiRequest(url, {
            method,
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            hideModal('buku-modal');
            loadBuku();
            loadDashboard();
            showToast(`Buku berhasil ${id ? 'diperbarui' : 'ditambahkan'}!`, 'success');
        } else {
            const data = await response.json();
            errorDiv.textContent = Object.values(data).flat().join(' ');
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Failed to save buku:', error);
        errorDiv.textContent = 'Terjadi kesalahan saat menyimpan data.';
        errorDiv.classList.remove('hidden');
    }
}

/**
 * Edit buku
 */
function editBuku(id) {
    const buku = state.buku.find(b => b.id === id);
    if (!buku) return;

    document.getElementById('buku-id').value = buku.id;
    document.getElementById('buku-judul').value = buku.judul;
    document.getElementById('buku-penulis').value = buku.penulis;
    document.getElementById('buku-tahun').value = buku.tahun;
    document.getElementById('buku-modal-title').innerHTML = '<i class="fas fa-edit"></i> Edit Buku';

    showModal('buku-modal');
}

/**
 * Confirm delete buku
 */
function confirmDeleteBuku(id, judul) {
    document.getElementById('delete-message').textContent =
        `Apakah Anda yakin ingin menghapus buku "${judul}"?`;
    document.getElementById('delete-confirm-btn').onclick = () => deleteBuku(id);
    showModal('delete-modal');
}

/**
 * Delete buku
 */
async function deleteBuku(id) {
    try {
        const response = await apiRequest(`${ENDPOINTS.buku}${id}/`, {
            method: 'DELETE',
        });

        if (response.ok) {
            hideModal('delete-modal');
            loadBuku();
            loadDashboard();
            showToast('Buku berhasil dihapus!', 'success');
        } else {
            showToast('Gagal menghapus buku', 'error');
        }
    } catch (error) {
        console.error('Failed to delete buku:', error);
        showToast('Terjadi kesalahan saat menghapus buku', 'error');
    }
}


// =============================================================================
// ANGGOTA CRUD
// =============================================================================

/**
 * Load anggota list
 */
async function loadAnggota() {
    try {
        let url = ENDPOINTS.anggota;
        const search = document.getElementById('anggota-search')?.value;

        if (search) url += `?search=${encodeURIComponent(search)}`;

        const response = await apiRequest(url);
        if (response.ok) {
            state.anggota = await response.json();
            renderAnggotaGrid();
        }
    } catch (error) {
        console.error('Failed to load anggota:', error);
        showToast('Gagal memuat data anggota', 'error');
    }
}

/**
 * Render anggota cards grid
 */
function renderAnggotaGrid() {
    const grid = document.getElementById('anggota-grid');

    if (state.anggota.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-users"></i>
                <p>Tidak ada data anggota</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = state.anggota.map(anggota => `
        <div class="member-card">
            <div class="member-header">
                <div class="member-avatar">${getInitials(anggota.nama)}</div>
                <div class="member-info">
                    <h4>${anggota.nama}</h4>
                    <p>${anggota.email}</p>
                </div>
            </div>
            <div class="member-stats">
                <div class="member-stat">
                    <span>${anggota.total_peminjaman || 0}</span>
                    <small>Total Pinjam</small>
                </div>
                <div class="member-stat">
                    <span>#${anggota.id}</span>
                    <small>ID Anggota</small>
                </div>
            </div>
            <div class="member-actions">
                <button class="btn btn-outline btn-sm" onclick="editAnggota(${anggota.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="confirmDeleteAnggota(${anggota.id}, '${anggota.nama}')">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Search anggota with debounce
 */
let anggotaSearchTimeout;
function searchAnggota() {
    clearTimeout(anggotaSearchTimeout);
    anggotaSearchTimeout = setTimeout(loadAnggota, 300);
}

/**
 * Handle anggota form submission
 */
async function handleAnggotaSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('anggota-id').value;
    const formData = {
        nama: document.getElementById('anggota-nama').value,
        email: document.getElementById('anggota-email').value,
    };

    const errorDiv = document.getElementById('anggota-error');
    errorDiv.classList.add('hidden');

    try {
        const url = id ? `${ENDPOINTS.anggota}${id}/` : ENDPOINTS.anggota;
        const method = id ? 'PUT' : 'POST';

        const response = await apiRequest(url, {
            method,
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            hideModal('anggota-modal');
            loadAnggota();
            loadDashboard();
            showToast(`Anggota berhasil ${id ? 'diperbarui' : 'ditambahkan'}!`, 'success');
        } else {
            const data = await response.json();
            errorDiv.textContent = Object.values(data).flat().join(' ');
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Failed to save anggota:', error);
        errorDiv.textContent = 'Terjadi kesalahan saat menyimpan data.';
        errorDiv.classList.remove('hidden');
    }
}

/**
 * Edit anggota
 */
function editAnggota(id) {
    const anggota = state.anggota.find(a => a.id === id);
    if (!anggota) return;

    document.getElementById('anggota-id').value = anggota.id;
    document.getElementById('anggota-nama').value = anggota.nama;
    document.getElementById('anggota-email').value = anggota.email;
    document.getElementById('anggota-modal-title').innerHTML = '<i class="fas fa-edit"></i> Edit Anggota';

    showModal('anggota-modal');
}

/**
 * Confirm delete anggota
 */
function confirmDeleteAnggota(id, nama) {
    document.getElementById('delete-message').textContent =
        `Apakah Anda yakin ingin menghapus anggota "${nama}"?`;
    document.getElementById('delete-confirm-btn').onclick = () => deleteAnggota(id);
    showModal('delete-modal');
}

/**
 * Delete anggota
 */
async function deleteAnggota(id) {
    try {
        const response = await apiRequest(`${ENDPOINTS.anggota}${id}/`, {
            method: 'DELETE',
        });

        if (response.ok) {
            hideModal('delete-modal');
            loadAnggota();
            loadDashboard();
            showToast('Anggota berhasil dihapus!', 'success');
        } else {
            showToast('Gagal menghapus anggota', 'error');
        }
    } catch (error) {
        console.error('Failed to delete anggota:', error);
        showToast('Terjadi kesalahan saat menghapus anggota', 'error');
    }
}


// =============================================================================
// PEMINJAMAN CRUD
// =============================================================================

/**
 * Load peminjaman list
 */
async function loadPeminjaman() {
    try {
        let url = ENDPOINTS.peminjaman;
        const filter = document.getElementById('peminjaman-filter')?.value;

        if (filter) url += `?status=${filter}`;

        const response = await apiRequest(url);
        if (response.ok) {
            state.peminjaman = await response.json();
            renderPeminjamanTable();
        }
    } catch (error) {
        console.error('Failed to load peminjaman:', error);
        showToast('Gagal memuat data peminjaman', 'error');
    }
}

/**
 * Render peminjaman table
 */
function renderPeminjamanTable() {
    const tbody = document.getElementById('peminjaman-tbody');

    if (state.peminjaman.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted" style="padding: 40px;">
                    <i class="fas fa-exchange-alt" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                    Tidak ada data peminjaman
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = state.peminjaman.map(p => `
        <tr>
            <td>#${p.id}</td>
            <td><strong>${p.buku_detail?.judul || 'Buku #' + p.buku}</strong></td>
            <td>${p.anggota_detail?.nama || 'Anggota #' + p.anggota}</td>
            <td>${formatDate(p.tanggal_pinjam)}</td>
            <td>${formatDate(p.tanggal_kembali)}</td>
            <td>
                <span class="status-badge ${p.status_peminjaman}">
                    <i class="fas ${p.status_peminjaman === 'aktif' ? 'fa-clock' : 'fa-check'}"></i>
                    ${p.status_peminjaman === 'aktif' ? 'Dipinjam' : 'Dikembalikan'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    ${p.status_peminjaman === 'aktif' ? `
                        <button class="btn btn-icon btn-success" onclick="kembalikanBuku(${p.id})" title="Kembalikan">
                            <i class="fas fa-undo"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-icon btn-danger" onclick="confirmDeletePeminjaman(${p.id})" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Filter peminjaman
 */
function filterPeminjaman() {
    loadPeminjaman();
}

/**
 * Load data for peminjaman form (buku and anggota options)
 */
async function loadPeminjamanFormData() {
    try {
        // Load available books
        const bukuResponse = await apiRequest(`${ENDPOINTS.buku}?available=true`);
        if (bukuResponse.ok) {
            const bukuList = await bukuResponse.json();
            const bukuSelect = document.getElementById('peminjaman-buku');
            bukuSelect.innerHTML = '<option value="">-- Pilih Buku --</option>' +
                bukuList.map(b => `<option value="${b.id}">${b.judul} - ${b.penulis}</option>`).join('');
        }

        // Load anggota
        const anggotaResponse = await apiRequest(ENDPOINTS.anggota);
        if (anggotaResponse.ok) {
            const anggotaList = await anggotaResponse.json();
            const anggotaSelect = document.getElementById('peminjaman-anggota');
            anggotaSelect.innerHTML = '<option value="">-- Pilih Anggota --</option>' +
                anggotaList.map(a => `<option value="${a.id}">${a.nama} (${a.email})</option>`).join('');
        }

        // Set default date to today
        document.getElementById('peminjaman-tanggal').value = new Date().toISOString().split('T')[0];
    } catch (error) {
        console.error('Failed to load peminjaman form data:', error);
    }
}

/**
 * Handle peminjaman form submission
 */
async function handlePeminjamanSubmit(event) {
    event.preventDefault();

    const formData = {
        buku: parseInt(document.getElementById('peminjaman-buku').value),
        anggota: parseInt(document.getElementById('peminjaman-anggota').value),
        tanggal_pinjam: document.getElementById('peminjaman-tanggal').value,
    };

    const errorDiv = document.getElementById('peminjaman-error');
    errorDiv.classList.add('hidden');

    try {
        const response = await apiRequest(ENDPOINTS.peminjaman, {
            method: 'POST',
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            hideModal('peminjaman-modal');
            loadPeminjaman();
            loadDashboard();
            showToast('Peminjaman berhasil dicatat!', 'success');
        } else {
            const data = await response.json();
            let errorMessage = '';
            if (typeof data === 'object') {
                errorMessage = Object.values(data).flat().join(' ');
            } else {
                errorMessage = data;
            }
            errorDiv.textContent = errorMessage;
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Failed to create peminjaman:', error);
        errorDiv.textContent = 'Terjadi kesalahan saat menyimpan data.';
        errorDiv.classList.remove('hidden');
    }
}

/**
 * Return book (kembalikan buku)
 */
async function kembalikanBuku(id) {
    try {
        const response = await apiRequest(`${ENDPOINTS.peminjaman}${id}/kembalikan/`, {
            method: 'POST',
        });

        if (response.ok) {
            loadPeminjaman();
            loadDashboard();
            showToast('Buku berhasil dikembalikan!', 'success');
        } else {
            const data = await response.json();
            showToast(data.error || 'Gagal mengembalikan buku', 'error');
        }
    } catch (error) {
        console.error('Failed to return book:', error);
        showToast('Terjadi kesalahan saat mengembalikan buku', 'error');
    }
}

/**
 * Confirm delete peminjaman
 */
function confirmDeletePeminjaman(id) {
    document.getElementById('delete-message').textContent =
        `Apakah Anda yakin ingin menghapus data peminjaman ini?`;
    document.getElementById('delete-confirm-btn').onclick = () => deletePeminjaman(id);
    showModal('delete-modal');
}

/**
 * Delete peminjaman
 */
async function deletePeminjaman(id) {
    try {
        const response = await apiRequest(`${ENDPOINTS.peminjaman}${id}/`, {
            method: 'DELETE',
        });

        if (response.ok) {
            hideModal('delete-modal');
            loadPeminjaman();
            loadDashboard();
            showToast('Data peminjaman berhasil dihapus!', 'success');
        } else {
            showToast('Gagal menghapus data peminjaman', 'error');
        }
    } catch (error) {
        console.error('Failed to delete peminjaman:', error);
        showToast('Terjadi kesalahan saat menghapus data', 'error');
    }
}


// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Hide loading overlay
    setTimeout(() => {
        document.getElementById('loading-overlay').classList.add('hidden');
    }, 1000);

    // Setup form event listeners
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('buku-form').addEventListener('submit', handleBukuSubmit);
    document.getElementById('anggota-form').addEventListener('submit', handleAnggotaSubmit);
    document.getElementById('peminjaman-form').addEventListener('submit', handlePeminjamanSubmit);

    // Setup navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.page);
        });
    });

    // Check if user is already logged in
    if (state.accessToken) {
        showMainApp();
    }

    // Reset modal titles when opening
    document.querySelectorAll('[onclick*="showModal"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const bukuTitle = document.getElementById('buku-modal-title');
            const anggotaTitle = document.getElementById('anggota-modal-title');
            if (bukuTitle) bukuTitle.innerHTML = '<i class="fas fa-book"></i> Tambah Buku Baru';
            if (anggotaTitle) anggotaTitle.innerHTML = '<i class="fas fa-user-plus"></i> Tambah Anggota Baru';
        });
    });

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                modal.classList.add('hidden');
            });
        }
    });
});
