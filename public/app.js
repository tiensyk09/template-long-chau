/* ============================================================
   AutoWeb CMS — Frontend Application Logic
   ============================================================ */

'use strict';

// ============================================================
// UTILS
// ============================================================
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈' : '👁';
  btn.classList.toggle('active', isHidden);
  btn.title = isHidden ? 'Ẩn' : 'Hiện';
}

function slugify(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function generateRandomPassword(length = 12) {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specials = '!@#$%^&*';
  const allChars = lowercase + uppercase + numbers + specials;
  
  let password = '';
  // Guarantee at least one of each class to satisfy strict validation
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specials.charAt(Math.floor(Math.random() * specials.length));
  
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

// ============================================================
// STATE
// ============================================================
let allSites = [];
let allTemplates = [];
let allProfiles = [];
let selectedProfileId = null;
let currentThemeForCreate = null;
let currentSiteForLog = null;
let logEventSource = null;
let currentSiteForDelete = null;
let currentSiteForSettings = null;
let currentSiteForApi = null;
let currentSiteForCreds = null;
let currentSiteForAdmin = null;
let pollingInterval = null;

let currentUser = null;
let isRegisterMode = false;

// ============================================================
// AUTHENTICATION CLIENT LOGIC
// ============================================================
function isAdmin() {
  if (!currentUser) return false;
  // Fallback check based on email (useful if local storage role info is not yet populated or user is admin@tubecreate.com)
  if (currentUser.email && (currentUser.email === 'admin@tubecreate.com' || currentUser.email.toLowerCase().startsWith('admin@'))) {
    return true;
  }
  const roles = currentUser.roles || currentUser.role;
  if (!roles) return false;
  if (Array.isArray(roles)) {
    return roles.includes('admin');
  }
  if (typeof roles === 'string') {
    return roles.toLowerCase().includes('admin');
  }
  return false;
}

async function authFetch(url, options = {}) {
  options.headers = options.headers || {};
  if (currentUser && currentUser.email) {
    options.headers['X-User-Email'] = currentUser.email;
  }
  if (currentUser) {
    let roles = currentUser.roles || currentUser.role;
    // Set fallback roles in request header for backward compatibility
    if (!roles && currentUser.email && (currentUser.email === 'admin@tubecreate.com' || currentUser.email.toLowerCase().startsWith('admin@'))) {
      roles = 'admin';
    }
    if (roles) {
      options.headers['X-User-Roles'] = Array.isArray(roles) ? roles.join(',') : String(roles);
    }
  }
  return fetch(url, options);
}

function initAuth() {
  const user = localStorage.getItem('market_user');
  if (user) {
    try {
      currentUser = JSON.parse(user);
    } catch (e) {
      localStorage.removeItem('market_user');
    }
  }
  updateAuthUI();
  loadAll();
}

function updateAuthUI() {
  const profileWrap = document.getElementById('user-profile-wrap');
  const navSites = document.getElementById('nav-sites');
  const navConfig = document.getElementById('nav-config');
  
  if (!profileWrap) return;
  
  if (currentUser) {
    profileWrap.innerHTML = `
      <div class="user-info-text">
        <span class="user-info-name">${currentUser.name || currentUser.username || currentUser.email}</span>
        <span class="user-info-email">${currentUser.email}</span>
      </div>
      <button class="btn-logout" onclick="logoutUser()">Đăng xuất</button>
    `;
    if (navSites) navSites.style.display = '';
    if (navConfig) navConfig.style.display = '';
  } else {
    profileWrap.innerHTML = `
      <button class="user-profile-btn" onclick="openAuthModal()">🔑 Đăng nhập</button>
    `;
    if (navSites) navSites.style.display = 'none';
    if (navConfig) navConfig.style.display = 'none';
    switchTab('themes');
  }

  // Update Thêm Theme button visibility
  const btnAddTemplate = document.getElementById('btn-add-template');
  if (btnAddTemplate) {
    const activeTab = document.querySelector('.tab-panel.active')?.id;
    btnAddTemplate.style.display = (activeTab === 'tab-themes' && isAdmin()) ? 'inline-flex' : 'none';
  }
}

function logoutUser() {
  localStorage.removeItem('user_token');
  localStorage.removeItem('market_user');
  currentUser = null;
  allSites = [];
  allProfiles = [];
  updateStats();
  renderSites();
  renderProfiles();
  updateAuthUI();
  loadAll();
}

function openAuthModal() {
  isRegisterMode = false;
  document.getElementById('auth-form').reset();
  const errorMsg = document.getElementById('auth-error-msg');
  if (errorMsg) {
    errorMsg.style.display = 'none';
    errorMsg.textContent = '';
  }
  updateAuthModalView();
  openModal('auth-modal');
}

function updateAuthModalView() {
  const title = document.getElementById('auth-modal-title');
  const subtitle = document.getElementById('auth-modal-subtitle');
  const groupName = document.getElementById('auth-group-name');
  const groupUsername = document.getElementById('auth-group-username');
  const groupConfirmPassword = document.getElementById('auth-group-confirm-password');
  const submitText = document.getElementById('btn-submit-auth-text');
  const toggleText = document.getElementById('auth-toggle-text');
  const toggleLink = document.getElementById('auth-toggle-link');

  const nameInput = document.getElementById('auth-name');
  const usernameInput = document.getElementById('auth-username');
  const confirmPasswordInput = document.getElementById('auth-confirm-password');

  if (isRegisterMode) {
    title.textContent = '📝 Tạo tài khoản';
    subtitle.textContent = 'Đăng ký tài khoản để bắt đầu quản lý website';
    groupName.classList.remove('d-none');
    groupUsername.classList.remove('d-none');
    groupConfirmPassword.classList.remove('d-none');
    if (nameInput) nameInput.required = true;
    if (usernameInput) usernameInput.required = true;
    if (confirmPasswordInput) confirmPasswordInput.required = true;
    if (submitText) submitText.textContent = 'Đăng ký';
    if (toggleText) toggleText.textContent = 'Đã có tài khoản?';
    if (toggleLink) toggleLink.textContent = 'Đăng nhập';
  } else {
    title.textContent = '🔐 Đăng nhập';
    subtitle.textContent = 'Đăng nhập để quản lý website của bạn';
    groupName.classList.add('d-none');
    groupUsername.classList.add('d-none');
    groupConfirmPassword.classList.add('d-none');
    if (nameInput) nameInput.required = false;
    if (usernameInput) usernameInput.required = false;
    if (confirmPasswordInput) confirmPasswordInput.required = false;
    if (submitText) submitText.textContent = 'Đăng nhập';
    if (toggleText) toggleText.textContent = 'Chưa có tài khoản?';
    if (toggleLink) toggleLink.textContent = 'Đăng ký';
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const errorMsg = document.getElementById('auth-error-msg');
  errorMsg.style.display = 'none';
  errorMsg.textContent = '';

  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const submitBtn = document.getElementById('btn-submit-auth');
  const loader = submitBtn.querySelector('.btn-loader');

  let name = '', username = '';

  if (isRegisterMode) {
    name = document.getElementById('auth-name').value.trim();
    username = document.getElementById('auth-username').value.trim();
    const confirmPassword = document.getElementById('auth-confirm-password').value;

    if (!name || !username) {
      errorMsg.textContent = 'Vui lòng điền đầy đủ Họ tên và Tên đăng nhập.';
      errorMsg.style.display = 'block';
      return;
    }
    if (password !== confirmPassword) {
      errorMsg.textContent = 'Mật khẩu xác nhận không trùng khớp.';
      errorMsg.style.display = 'block';
      return;
    }
  }

  submitBtn.disabled = true;
  if (loader) loader.classList.remove('d-none');

  try {
    let apiUrl = 'https://api.tubecreate.com/api/user/validate-user.php';
    let payload = { email, password };

    if (isRegisterMode) {
      apiUrl = 'https://api.tubecreate.com/api/user/create-user.php';
      payload = { name, username, email, password, auto_verify: true };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok && (data.token || data.status === 'success' || data.success)) {
      if (data.token) {
        localStorage.setItem('user_token', data.token);
      }

      const userObj = {
        name: data.name || name || '',
        username: data.username || username || '',
        email: email
      };
      Object.assign(userObj, data); // Copy root properties (like roles)
      if (data.user) Object.assign(userObj, data.user); // Copy nested user details if present
      localStorage.setItem('market_user', JSON.stringify(userObj));
      currentUser = userObj;

      closeModal('auth-modal');
      updateAuthUI();
      await loadAll();
    } else if (response.ok && (data.success || data.status === 'success') && !data.token) {
      // Auto login after registration if no token returned
      isRegisterMode = false;
      document.getElementById('auth-email').value = email;
      document.getElementById('auth-password').value = password;
      await handleAuthSubmit(e);
    } else {
      throw new Error(data.message || data.error || (isRegisterMode ? 'Đăng ký thất bại' : 'Email hoặc mật khẩu không chính xác.'));
    }
  } catch (err) {
    errorMsg.textContent = err.message;
    errorMsg.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    if (loader) loader.classList.add('d-none');
  }
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  bindEvents();
  startPolling();
});

async function loadAll() {
  if (currentUser) {
    await Promise.all([loadTemplates(), loadSites(), loadProfiles(), loadStorageServers()]);
  } else {
    await Promise.all([loadTemplates(), loadStorageServers()]);
  }
}

function startPolling() {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(async () => {
    const hasDeploying = allSites.some(s => s.status === 'deploying');
    if (hasDeploying) {
      await loadSites(false);
    }
  }, 5000);
}

// ============================================================
// TAB NAVIGATION
// ============================================================
function switchTab(tab) {
  // Check auth
  if (!currentUser && tab !== 'themes') {
    openAuthModal();
    return;
  }

  // Update nav
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`nav-${tab}`)?.classList.add('active');

  // Update panels
  document.querySelectorAll('.tab-panel').forEach(el => el.classList.remove('active'));
  document.getElementById(`tab-${tab}`)?.classList.add('active');

  // Update topbar
  const titles = {
    themes:  ['Chọn Theme', 'Chọn giao diện để bắt đầu tạo website của bạn'],
    sites:   ['Websites', 'Quản lý toàn bộ website đã deploy lên Cloudflare'],
    config:  ['Cấu hình Cloudflare', 'Quản lý nhiều tài khoản Cloudflare API'],
    storage: ['Server Bucket', 'Quản lý các máy chủ lưu trữ MinIO / S3 riêng biệt cho hệ thống'],
  };
  if (titles[tab]) {
    document.getElementById('page-title').textContent = titles[tab][0];
    document.getElementById('page-subtitle').textContent = titles[tab][1];
  }

  // Show/hide topbar elements
  const searchWrap = document.getElementById('search-wrap');
  const btnAddProfile = document.getElementById('btn-add-cf-profile');
  const btnAddStorage = document.getElementById('btn-add-storage-server');
  const btnAddTemplate = document.getElementById('btn-add-template');
  
  if (searchWrap) searchWrap.style.display = tab === 'sites' ? 'block' : 'none';
  if (btnAddProfile) btnAddProfile.style.display = tab === 'config' ? 'inline-flex' : 'none';
  if (btnAddStorage) btnAddStorage.style.display = (tab === 'storage' && isAdmin()) ? 'inline-flex' : 'none';
  if (btnAddTemplate) {
    btnAddTemplate.style.display = (tab === 'themes' && isAdmin()) ? 'inline-flex' : 'none';
  }
}

// ============================================================
// TEMPLATES
// ============================================================
async function loadTemplates() {
  try {
    const res = await authFetch('/api/templates');
    allTemplates = await res.json();
    renderThemes();
  } catch (e) {
    console.error('Failed to load templates:', e);
  }
}

function renderThemes() {
  const grid = document.getElementById('themes-grid');
  if (!allTemplates.length) {
    grid.innerHTML = '<p class="empty-state">Không tìm thấy theme nào.</p>';
    return;
  }

  grid.innerHTML = allTemplates.map(t => {
    const siteCount = allSites.filter(s => s.template === t.id).length;
    return `
      <div class="theme-card" id="theme-card-${t.id}">
        <div class="theme-thumbnail-wrap">
          <img class="theme-thumbnail" src="${t.thumbnail}" alt="${t.name}" loading="lazy"
               onerror="this.style.background='#1c2030'; this.style.opacity='0.3'">
          <div class="theme-preview-overlay">
            <button class="btn-preview" onclick="previewTheme('${t.id}')">👁 Xem Demo</button>
          </div>
        </div>
        <div class="theme-info">
          <div class="theme-header">
            <div class="theme-name">${t.name}</div>
            <div class="theme-dot" style="background:${t.color}"></div>
          </div>
          <p class="theme-desc">${t.description}</p>
          <div class="theme-tags">
            ${t.tags.map(tag => `<span class="theme-tag">${tag}</span>`).join('')}
          </div>
          <div class="theme-footer">
            <span class="theme-site-count">🌐 ${siteCount} website đã tạo</span>
            <div style="display:flex; gap:8px;">
              ${isAdmin() ? `<button class="btn btn-ghost btn-sm" onclick="openEditTemplateModal('${t.id}')" style="padding: 6px 10px;">✏️ Sửa</button>` : ''}
              <button class="btn-create-from-theme" onclick="openCreateFromTheme('${t.id}')">
                + Tạo Website
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function previewTheme(themeId) {
  const theme = allTemplates.find(t => t.id === themeId);
  if (theme && theme.demoUrl) {
    window.open(theme.demoUrl, '_blank');
    return;
  }
  // Find a deployed site with this theme
  const site = allSites.find(s => s.template === themeId && s.status === 'active' && s.deployUrl);
  if (site) {
    window.open(site.deployUrl, '_blank');
  } else {
    alert('Chưa có website nào với theme này được deploy thành công để xem demo.');
  }
}

// ============================================================
// SITES
// ============================================================
async function loadSites(showRender = true) {
  try {
    const res = await authFetch('/api/sites');
    allSites = await res.json();
    if (showRender) {
      renderSites();
      updateStats();
      renderThemes(); // update counts
    } else {
      // Silently update stats and re-render if status changed
      updateStats();
      renderSites();
      renderThemes();
    }
  } catch (e) {
    console.error('Failed to load sites:', e);
  }
}

function updateStats() {
  const active    = allSites.filter(s => s.status === 'active').length;
  const deploying = allSites.filter(s => s.status === 'deploying').length;
  const failed    = allSites.filter(s => s.status === 'failed').length;
  const total     = allSites.length;

  document.getElementById('stat-active').textContent    = active;
  document.getElementById('stat-deploying').textContent = deploying;
  document.getElementById('stat-failed').textContent    = failed;

  document.getElementById('stat-total').textContent         = total;
  document.getElementById('stat-active-card').textContent   = active;
  document.getElementById('stat-deploying-card').textContent= deploying;
  document.getElementById('stat-failed-card').textContent   = failed;

  document.getElementById('nav-sites-count').textContent = total;
}

function renderSites() {
  const grid = document.getElementById('sites-grid');
  const emptyState = document.getElementById('empty-state');
  const searchQuery = document.getElementById('search-input').value.toLowerCase();

  const filtered = allSites.filter(s =>
    s.name.toLowerCase().includes(searchQuery) ||
    (s.template || '').toLowerCase().includes(searchQuery)
  );

  if (!allSites.length) {
    emptyState.style.display = '';
    // Remove existing cards but keep empty state
    Array.from(grid.children).forEach(el => {
      if (!el.classList.contains('empty-state')) el.remove();
    });
    return;
  }

  emptyState.style.display = 'none';

  // Remove cards that are no longer in the filtered list
  const filteredNames = new Set(filtered.map(s => s.name));
  Array.from(grid.children).forEach(el => {
    if (el.classList.contains('empty-state')) return;
    const name = el.id.replace('site-card-', '');
    if (!filteredNames.has(name)) {
      el.remove();
    }
  });

  // Add new cards or update changed ones in-place to avoid flickering
  filtered.forEach(site => {
    const existing = document.getElementById(`site-card-${site.name}`);
    if (existing) {
      const currentStatus = existing.getAttribute('data-status');
      const currentUrl = existing.getAttribute('data-url');
      if (currentStatus !== site.status || currentUrl !== (site.deployUrl || '')) {
        const card = createSiteCard(site);
        grid.replaceChild(card, existing);
      }
    } else {
      const card = createSiteCard(site);
      grid.appendChild(card);
    }
  });
}

function createSiteCard(site) {
  const el = document.createElement('div');
  el.className = 'site-card';
  el.id = `site-card-${site.name}`;
  el.setAttribute('data-status', site.status);
  el.setAttribute('data-url', site.deployUrl || '');

  const statusClass = {
    active: 'status-active',
    deploying: 'status-deploying',
    failed: 'status-failed'
  }[site.status] || 'status-failed';

  const statusLabel = {
    active: '✅ Hoạt động',
    deploying: '⚙️ Đang deploy…',
    failed: '❌ Thất bại'
  }[site.status] || 'Unknown';

  const templateLabel = {
    'ngo-quyen': '🏫 Ngô Quyền',
    'commandcode': '💻 CommandCode',
    'korean-news': '📰 Korean News'
  }[site.template] || site.template || '—';

  // Deploy type badge
  const deployTypeBadge = site.deployType === 'pages'
    ? `<span class="deploy-type-badge pages">📄 CF Pages</span>`
    : `<span class="deploy-type-badge workers">⚡ CF Workers</span>`;

  const createdAt = site.createdAt
    ? new Date(site.createdAt).toLocaleString('vi-VN')
    : '—';

  const deployUrl = site.deployUrl
    ? `<div class="site-url"><a href="${site.deployUrl}" target="_blank" rel="noopener">${site.deployUrl}</a></div>`
    : '';

  const displayTitle = site.title || site.name;
  const showSubName = site.title ? `<div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px;">${site.name}</div>` : '';

  el.innerHTML = `
    <div class="site-card-header">
      <div class="site-name-block">
        <div class="site-name">${displayTitle}</div>
        ${showSubName}
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
          <span class="site-template-badge">${templateLabel}</span>
          ${deployTypeBadge}
        </div>
      </div>
      <span class="site-status-badge ${statusClass}">${statusLabel}</span>
    </div>
    ${deployUrl}
    <div class="site-meta">📅 ${createdAt}</div>
    <div class="site-actions">
      ${site.status === 'active' ? `
        <button class="btn btn-ghost btn-sm" onclick="openAdminModal('${site.name}')">👤 Tài khoản Admin</button>
        <button class="btn btn-ghost btn-sm" onclick="openSettingsModal('${site.name}')">⚙️ Cài đặt</button>
        <button class="btn btn-ghost btn-sm" onclick="openApiModal('${site.name}')">🔑 API Key</button>
        <button class="btn btn-ghost btn-sm" onclick="openLogModal('${site.name}')">📋 Log</button>
      ` : ''}
      ${site.status === 'failed' ? `
        <button class="btn btn-primary btn-sm" onclick="reDeploySite('${site.name}')">🔄 Retry Deploy</button>
        <button class="btn btn-ghost btn-sm" onclick="openLogModal('${site.name}')">📋 Log</button>
      ` : ''}
      ${site.status === 'deploying' ? `
        <button class="btn btn-ghost btn-sm" onclick="openLogModal('${site.name}')">📋 Xem Log</button>
      ` : ''}
      <button class="btn btn-ghost btn-sm" onclick="openCredsModal('${site.name}')">🔧 CF Keys</button>
      <button class="btn btn-danger btn-sm" onclick="openDeleteModal('${site.name}')">🗑️ Xóa</button>
    </div>
  `;
  return el;
}


// ============================================================
// CF PROFILES
// ============================================================
async function loadProfiles() {
  try {
    const res = await authFetch('/api/cf-profiles');
    allProfiles = await res.json();
    renderProfiles();
    document.getElementById('nav-config-count').textContent = allProfiles.length;
  } catch (e) {
    console.error('Failed to load profiles:', e);
  }
}

function renderProfiles() {
  const list = document.getElementById('cf-profiles-list');
  const emptyState = document.getElementById('empty-profiles-state');

  if (!allProfiles.length) {
    list.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  list.innerHTML = allProfiles.map(p => {
    const authLabel = p.authType === 'token' ? 'API Token' : 'Global Key';
    const accountIdShort = p.accountId ? `${p.accountId.slice(0, 8)}…${p.accountId.slice(-4)}` : '—';
    const createdAt = p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '—';

    return `
      <div class="cf-profile-card" id="profile-card-${p.id}">
        <div class="cf-profile-header">
          <div class="cf-profile-name">🔑 ${p.name}</div>
          <span class="cf-profile-auth-badge">${authLabel}</span>
        </div>
        <div class="cf-profile-detail"><span>Account ID:</span>${accountIdShort}</div>
        ${p.email ? `<div class="cf-profile-detail"><span>Email:</span>${p.email}</div>` : ''}
        <div class="cf-profile-detail"><span>Thêm lúc:</span>${createdAt}</div>
        <div class="cf-profile-stat">
          <div class="cf-profile-stat-num">${p.websiteCount || 0}</div>
          <div class="cf-profile-stat-lbl">website đã sử dụng cấu hình này</div>
        </div>
        <div class="cf-profile-actions">
          <button class="btn btn-ghost btn-sm" onclick="openEditProfileModal('${p.id}')">✏️ Chỉnh sửa</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProfile('${p.id}', '${p.name}')">🗑️ Xóa</button>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// PROFILE MODAL — ADD / EDIT
// ============================================================
function openAddProfileModal() {
  document.getElementById('profile-modal-title').textContent = 'Thêm cấu hình Cloudflare';
  document.getElementById('btn-submit-profile').textContent = 'Lưu cấu hình';
  document.getElementById('profile-edit-id').value = '';
  document.getElementById('profile-form').reset();
  document.getElementById('profile-group-key').classList.remove('d-none');
  document.getElementById('profile-group-token').classList.add('d-none');
  openModal('profile-modal');
}

function openEditProfileModal(profileId) {
  const p = allProfiles.find(x => x.id === profileId);
  if (!p) return;

  document.getElementById('profile-modal-title').textContent = 'Chỉnh sửa cấu hình';
  document.getElementById('btn-submit-profile').textContent = 'Cập nhật';
  document.getElementById('profile-edit-id').value = p.id;
  document.getElementById('profile-name').value = p.name;
  document.getElementById('profile-account-id').value = p.accountId || '';
  document.getElementById('profile-auth-type').value = p.authType || 'key';
  document.getElementById('profile-api-key').value = '';   // Don't pre-fill secrets
  document.getElementById('profile-email').value = p.email || '';
  document.getElementById('profile-api-token').value = '';

  onProfileAuthTypeChange();
  openModal('profile-modal');
}

function onProfileAuthTypeChange() {
  const type = document.getElementById('profile-auth-type').value;
  document.getElementById('profile-group-key').classList.toggle('d-none', type === 'token');
  document.getElementById('profile-group-token').classList.toggle('d-none', type === 'key');
}

document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-profile');
  btn.disabled = true;
  btn.textContent = 'Đang lưu…';

  const editId = document.getElementById('profile-edit-id').value;
  const body = {
    name:      document.getElementById('profile-name').value,
    accountId: document.getElementById('profile-account-id').value,
    authType:  document.getElementById('profile-auth-type').value,
    apiKey:    document.getElementById('profile-api-key').value,
    email:     document.getElementById('profile-email').value,
    apiToken:  document.getElementById('profile-api-token').value,
  };

  try {
    const url = editId ? `/api/cf-profiles/${editId}` : '/api/cf-profiles';
    const method = editId ? 'PUT' : 'POST';
    const res = await authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
    closeModal('profile-modal');
    await loadProfiles();
  } catch (err) {
    alert('Lỗi: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = editId ? 'Cập nhật' : 'Lưu cấu hình';
  }
});

async function deleteProfile(profileId, name) {
  if (!confirm(`Xóa cấu hình "${name}"?`)) return;
  try {
    const res = await authFetch(`/api/cf-profiles/${profileId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
    await loadProfiles();
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}

// ============================================================
// STORAGE SERVERS MANAGEMENT & SELECTION
// ============================================================
let allStorageServers = [];

async function loadStorageServers() {
  try {
    const res = await authFetch('/api/storage-servers');
    allStorageServers = await res.json();
    renderStorageServersList();
    renderStorageServerOptions();
    const navCount = document.getElementById('nav-storage-count');
    if (navCount) navCount.textContent = allStorageServers.length;
  } catch (e) {
    console.error('Failed to load storage servers:', e);
  }
}

function renderStorageServersList() {
  const container = document.getElementById('storage-servers-list');
  const emptyState = document.getElementById('empty-storage-state');
  const btnAdd = document.getElementById('btn-add-storage-server');
  if (!container) return;

  if (btnAdd) btnAdd.style.display = isAdmin() ? 'inline-block' : 'none';

  if (!allStorageServers.length) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = allStorageServers.map(srv => {
    const typeIcon = srv.type === 'cloudflare_r2' ? '☁️' : (srv.type === 's3' ? '📦' : '🪣');
    const typeLabel = srv.type === 'cloudflare_r2' ? 'Cloudflare R2' : (srv.type === 's3' ? 'Amazon S3' : 'Server Bucket API');
    
    return `
      <div class="cf-profile-card" id="storage-card-${srv.id}">
        <div class="cf-profile-header">
          <div class="cf-profile-name">${typeIcon} ${srv.name}</div>
          <span class="cf-profile-auth-badge">${typeLabel}</span>
        </div>
        <div class="cf-profile-detail"><span>Endpoint:</span> <code>${srv.endpoint || 'Cloudflare Native'}</code></div>
        ${srv.description ? `<div class="cf-profile-detail"><span>Mô tả:</span> ${srv.description}</div>` : ''}
        ${isAdmin() ? `
          <div class="cf-profile-actions" style="margin-top: 12px;">
            <button class="btn btn-ghost btn-sm" onclick="openEditStorageServerModal('${srv.id}')">✏️ Sửa</button>
            ${!srv.isDefault ? `<button class="btn btn-danger btn-sm" onclick="deleteStorageServer('${srv.id}', '${srv.name}')">🗑️ Xóa</button>` : '<span style="font-size: 11px; color: var(--text-muted); padding: 4px 8px; font-style: italic;">(Mặc định)</span>'}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function renderStorageServerOptions() {
  const select = document.getElementById('site-storage-server-id');
  if (!select) return;

  if (!allStorageServers.length) {
    select.innerHTML = '<option value="storage_cf_r2">☁️ Cloudflare R2 (Khuyên dùng)</option><option value="storage_node_1">🪣 Server Bucket Mặc Định (5GB)</option>';
    return;
  }

  select.innerHTML = allStorageServers.map(srv => {
    const icon = srv.type === 'cloudflare_r2' ? '☁️' : (srv.type === 's3' ? '📦' : '🪣');
    return `<option value="${srv.id}">${icon} ${srv.name} (${srv.endpoint || 'Cloudflare'})</option>`;
  }).join('');

  onStorageServerChange();
}

async function onStorageServerChange() {
  const select = document.getElementById('site-storage-server-id');
  const helper = document.getElementById('bucket-type-helper');
  const quotaBox = document.getElementById('server-bucket-quota-info');
  if (!select) return;

  const selectedId = select.value;
  const srv = allStorageServers.find(s => s.id === selectedId) || allStorageServers[0];

  if (srv && srv.type === 'server_bucket') {
    if (helper) helper.textContent = `Lưu trữ trên máy chủ MinIO (${srv.endpoint}). Cấp sẵn 5GB cho tài khoản thường.`;
    if (quotaBox) {
      quotaBox.classList.remove('d-none');
      try {
        const res = await authFetch('/api/user/storage-quota');
        if (res.ok) {
          const data = await res.json();
          const usedText = document.getElementById('quota-used-text');
          const totalText = document.getElementById('quota-total-text');
          if (usedText) usedText.textContent = `${data.usedMB} MB`;
          if (totalText) totalText.textContent = `${data.quotaGB} GB`;
        }
      } catch (err) {}
    }
  } else {
    if (helper) helper.textContent = srv ? srv.description || `Lưu trữ phương tiện trên ${srv.name}` : 'Lưu trữ Cloudflare R2';
    if (quotaBox) quotaBox.classList.add('d-none');
  }
}
window.onStorageServerChange = onStorageServerChange;

function openAddStorageServerModal() {
  document.getElementById('storage-server-modal-title').textContent = 'Thêm Máy chủ Storage mới';
  document.getElementById('btn-submit-storage-server').textContent = 'Lưu Máy chủ';
  document.getElementById('storage-server-id').value = '';
  document.getElementById('storage-server-form').reset();
  openModal('storage-server-modal');
}

function openEditStorageServerModal(id) {
  const srv = allStorageServers.find(x => x.id === id);
  if (!srv) return;

  document.getElementById('storage-server-modal-title').textContent = 'Chỉnh sửa Máy chủ Storage';
  document.getElementById('btn-submit-storage-server').textContent = 'Cập nhật';
  document.getElementById('storage-server-id').value = srv.id;
  document.getElementById('storage-server-name').value = srv.name;
  document.getElementById('storage-server-type').value = srv.type || 'server_bucket';
  document.getElementById('storage-server-endpoint').value = srv.endpoint || '';
  document.getElementById('storage-server-apikey').value = srv.apiKey || '';
  document.getElementById('storage-server-desc').value = srv.description || '';

  openModal('storage-server-modal');
}

async function deleteStorageServer(id, name) {
  if (!confirm(`Xóa máy chủ storage "${name}"?`)) return;
  try {
    const res = await authFetch(`/api/storage-servers/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
    await loadStorageServers();
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}

document.getElementById('storage-server-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-storage-server');
  btn.disabled = true;
  btn.textContent = 'Đang lưu…';

  const editId = document.getElementById('storage-server-id').value;
  const body = {
    id:          editId,
    name:        document.getElementById('storage-server-name').value,
    type:        document.getElementById('storage-server-type').value,
    endpoint:    document.getElementById('storage-server-endpoint').value,
    apiKey:      document.getElementById('storage-server-apikey').value,
    description: document.getElementById('storage-server-desc').value,
  };

  try {
    const res = await authFetch('/api/storage-servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
    closeModal('storage-server-modal');
    await loadStorageServers();
  } catch (err) {
    alert('Lỗi: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = editId ? 'Cập nhật' : 'Lưu Máy chủ';
  }
});


// ============================================================
// CREATE MODAL — OPEN FROM THEME
// ============================================================
function openCreateFromTheme(themeId) {
  if (!currentUser) {
    openAuthModal();
    return;
  }
  currentThemeForCreate = themeId;
  const theme = allTemplates.find(t => t.id === themeId);

  // Update modal header
  document.getElementById('modal-theme-name-text').textContent = `Theme: ${theme?.name || themeId}`;
  
  const titleInput = document.getElementById('site-title');
  if (titleInput) titleInput.value = '';
  
  document.getElementById('site-name').value = '';
  
  const pwInput = document.getElementById('site-admin-password');
  if (pwInput) {
    pwInput.value = generateRandomPassword(12);
    pwInput.type = 'text';
  }
  const eyeBtn = pwInput?.nextElementSibling;
  if (eyeBtn) {
    eyeBtn.textContent = '👁';
    eyeBtn.classList.remove('active');
  }

  selectedProfileId = null;

  const bucketTypeSelect = document.getElementById('site-bucket-type');
  if (bucketTypeSelect) {
    bucketTypeSelect.value = 'r2';
    onBucketTypeChange();
  }

  // Render profile selector
  renderProfileSelector();

  openModal('create-modal');
}

function renderProfileSelector() {
  const container = document.getElementById('cf-profile-selector');
  const noWarn = document.getElementById('no-profiles-warning');
  const submitBtn = document.getElementById('btn-submit-create');

  if (!allProfiles.length) {
    container.innerHTML = '';
    noWarn.style.display = 'block';
    submitBtn.disabled = true;
    return;
  }

  noWarn.style.display = 'none';
  submitBtn.disabled = false;

  // Auto-select first profile
  if (!selectedProfileId) {
    selectedProfileId = allProfiles[0].id;
  }

  container.innerHTML = allProfiles.map(p => {
    const isSelected = p.id === selectedProfileId;
    const authLabel = p.authType === 'token' ? 'API Token' : 'Global Key';
    const accountIdShort = p.accountId ? `${p.accountId.slice(0, 8)}…${p.accountId.slice(-4)}` : '—';
    return `
      <div class="profile-radio-item ${isSelected ? 'selected' : ''}" onclick="selectProfile('${p.id}')">
        <input type="radio" name="cf-profile" value="${p.id}" ${isSelected ? 'checked' : ''}>
        <div class="profile-radio-dot"></div>
        <div class="profile-radio-info">
          <div class="profile-radio-name">${p.name}</div>
          <div class="profile-radio-detail">${accountIdShort} · ${authLabel}</div>
        </div>
        <span class="profile-radio-count">🌐 ${p.websiteCount || 0} sites</span>
      </div>
    `;
  }).join('');
}

function selectProfile(profileId) {
  selectedProfileId = profileId;
  // Update visual selection
  document.querySelectorAll('.profile-radio-item').forEach(el => {
    const isThis = el.getAttribute('onclick').includes(profileId);
    el.classList.toggle('selected', isThis);
  });
}

async function onBucketTypeChange() {
  const typeSelect = document.getElementById('site-bucket-type');
  const helper = document.getElementById('bucket-type-helper');
  const quotaBox = document.getElementById('server-bucket-quota-info');
  if (!typeSelect) return;

  const val = typeSelect.value;
  if (val === 'server') {
    if (helper) helper.textContent = 'Server Bucket: Lưu trữ dữ liệu trên máy chủ MinIO riêng do hệ thống cấp sẵn.';
    if (quotaBox) {
      quotaBox.classList.remove('d-none');
      try {
        const res = await authFetch('/api/user/storage-quota');
        if (res.ok) {
          const data = await res.json();
          const usedText = document.getElementById('quota-used-text');
          const totalText = document.getElementById('quota-total-text');
          if (usedText) usedText.textContent = `${data.usedMB} MB`;
          if (totalText) totalText.textContent = `${data.quotaGB} GB`;
        }
      } catch (err) {
        // Ignore fetch errors
      }
    }
  } else {
    if (helper) helper.textContent = 'Cloudflare R2: Lưu trữ trực tiếp trên tài khoản Cloudflare của bạn, không giới hạn bởi dung lượng hệ thống.';
    if (quotaBox) quotaBox.classList.add('d-none');
  }
}
window.onBucketTypeChange = onBucketTypeChange;

// ============================================================
// CREATE SITE FORM SUBMIT
// ============================================================
document.getElementById('create-site-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!selectedProfileId) {
    alert('Vui lòng chọn cấu hình Cloudflare trước khi tạo website.');
    return;
  }

  const btn = document.getElementById('btn-submit-create');
  const loader = btn.querySelector('.btn-loader');
  
  const adminPassword = document.getElementById('site-admin-password').value;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  if (!passwordRegex.test(adminPassword)) {
    alert('Mật khẩu Admin phải có tối thiểu 8 ký tự, chứa ít nhất 1 chữ hoa (A-Z) và 1 ký tự đặc biệt (ví dụ: !, @, #, $, %).');
    return;
  }

  const storageServerId = document.getElementById('site-storage-server-id')?.value || 'storage_cf_r2';

  btn.disabled = true;
  loader.classList.remove('d-none');

  const body = {
    title:           document.getElementById('site-title').value.trim(),
    name:            document.getElementById('site-name').value.trim(),
    adminPassword:   adminPassword,
    template:        currentThemeForCreate || 'ngo-quyen',
    cfProfileId:     selectedProfileId,
    storageServerId: storageServerId,
  };

  try {
    const res = await authFetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');

    closeModal('create-modal');
    await loadSites();
    await loadProfiles(); // update website counts

    // Switch to sites tab and open log
    switchTab('sites');
    setTimeout(() => openLogModal(body.name), 500);
  } catch (err) {
    alert('Lỗi: ' + err.message);
  } finally {
    btn.disabled = false;
    loader.classList.add('d-none');
  }
});

// ============================================================
// REDEPLOY
// ============================================================
async function reDeploySite(siteName) {
  const site = allSites.find(s => s.name === siteName);
  if (!site) return;

  const body = {
    name:     siteName,
    template: site.template,
    title:    site.title || siteName,
  };

  if (site.cfProfileId) {
    body.cfProfileId = site.cfProfileId;
  } else {
    body.accountId = site.accountId || '';
    body.apiKey    = site.apiKey    || '';
    body.email     = site.email     || '';
    body.apiToken  = site.apiToken  || '';
  }

  try {
    const res = await authFetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
    await loadSites();
    openLogModal(siteName);
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}

// ============================================================
// LOG MODAL (SSE)
// ============================================================
function openLogModal(siteName) {
  currentSiteForLog = siteName;
  document.getElementById('log-site-name').textContent = `Website: ${siteName}`;
  document.getElementById('terminal-content').innerHTML = '';
  document.getElementById('log-status-badge').textContent = 'Đang kết nối…';
  document.getElementById('log-status-badge').className = 'badge';

  const visitBtn = document.getElementById('btn-visit-site');
  if (visitBtn) {
    const site = allSites.find(s => s.name === siteName);
    if (site && site.status === 'active' && site.deployUrl) {
      visitBtn.href = site.deployUrl;
      visitBtn.classList.remove('d-none');
    } else {
      visitBtn.classList.add('d-none');
    }
  }

  openModal('log-modal');

  // Close previous SSE
  if (logEventSource) { logEventSource.close(); logEventSource = null; }

  const emailParam = currentUser && currentUser.email ? `?userEmail=${encodeURIComponent(currentUser.email)}` : '';
  logEventSource = new EventSource(`/api/sites/${siteName}/logs${emailParam}`);

  logEventSource.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    const terminal = document.getElementById('terminal-content');

    if (data.isHistory) {
      // Render history in bulk
      const lines = data.message.split('\n');
      lines.forEach(line => appendTerminalLine(terminal, line));
    } else {
      appendTerminalLine(terminal, data.message, data.isError);
    }

    terminal.scrollTop = terminal.scrollHeight;

    // Reload sites list if deployment finished/failed to fetch new status/URL
    if (data.message.includes('DEPLOYMENT SUCCESSFUL') || data.message.includes('DEPLOYMENT FAILED')) {
      await loadSites();
      await loadProfiles();
    }

    // Update status badge
    const site = allSites.find(s => s.name === siteName);
    updateLogBadge(site?.status);

    // Update visit button
    if (visitBtn) {
      if (site && site.status === 'active' && site.deployUrl) {
        visitBtn.href = site.deployUrl;
        visitBtn.classList.remove('d-none');
      } else {
        visitBtn.classList.add('d-none');
      }
    }
  };

  logEventSource.onerror = () => {
    document.getElementById('log-status-badge').textContent = 'Kết nối bị ngắt';
    logEventSource?.close();
    logEventSource = null;
  };
}

function appendTerminalLine(terminal, text, isError = false) {
  const span = document.createElement('span');
  span.className = isError ? 'log-error' : '';
  if (text.includes('DEPLOYMENT SUCCESSFUL') || text.includes('successfully')) {
    span.className = 'log-success';
  }
  span.textContent = text + (text.endsWith('\n') ? '' : '\n');
  terminal.appendChild(span);
}

function updateLogBadge(status) {
  const badge = document.getElementById('log-status-badge');
  const map = {
    active:    ['✅ Thành công', 'status-active'],
    deploying: ['⚙️ Đang deploy…', 'status-deploying'],
    failed:    ['❌ Thất bại', 'status-failed']
  };
  if (map[status]) {
    badge.textContent = map[status][0];
    badge.className = 'badge ' + map[status][1];
  }
}

// ============================================================
// DELETE MODAL
// ============================================================
function openDeleteModal(siteName) {
  currentSiteForDelete = siteName;
  document.getElementById('delete-site-name-text').textContent = siteName;
  document.getElementById('delete-site-name-hint').textContent = siteName;
  
  const confirmInput = document.getElementById('delete-confirm-name');
  if (confirmInput) {
    confirmInput.value = '';
    confirmInput.disabled = false;
  }
  
  const btn = document.getElementById('btn-confirm-delete');
  if (btn) {
    btn.disabled = true;
    const loader = btn.querySelector('.btn-loader');
    if (loader) loader.classList.add('d-none');
  }

  const cancelBtn = document.getElementById('btn-cancel-delete');
  if (cancelBtn) cancelBtn.disabled = false;

  const closeBtn = document.getElementById('btn-close-delete');
  if (closeBtn) closeBtn.disabled = false;

  const deleteCfCheckbox = document.getElementById('delete-cf-resources');
  if (deleteCfCheckbox) deleteCfCheckbox.disabled = false;

  openModal('delete-modal');
}

document.getElementById('btn-confirm-delete').addEventListener('click', async () => {
  if (!currentSiteForDelete) return;
  
  const confirmInput = document.getElementById('delete-confirm-name');
  if (confirmInput && confirmInput.value.trim() !== currentSiteForDelete) {
    alert('Tên website xác nhận không khớp.');
    return;
  }

  const btn = document.getElementById('btn-confirm-delete');
  const loader = btn.querySelector('.btn-loader');
  const cancelBtn = document.getElementById('btn-cancel-delete');
  const closeBtn = document.getElementById('btn-close-delete');
  const deleteCfCheckbox = document.getElementById('delete-cf-resources');

  const site = allSites.find(s => s.name === currentSiteForDelete);
  const deleteCloudflare = deleteCfCheckbox.checked;

  try {
    // Set loading state
    btn.disabled = true;
    loader.classList.remove('d-none');
    cancelBtn.disabled = true;
    closeBtn.disabled = true;
    deleteCfCheckbox.disabled = true;
    if (confirmInput) confirmInput.disabled = true;

    const res = await authFetch(`/api/sites/${currentSiteForDelete}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deleteCloudflareResources: deleteCloudflare,
        accountId: site?.accountId || '',
        apiKey:    site?.apiKey    || '',
        email:     site?.email     || '',
        apiToken:  site?.apiToken  || '',
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
    closeModal('delete-modal');
    await loadSites();
    await loadProfiles();
  } catch (err) {
    alert('Lỗi: ' + err.message);
  } finally {
    // Reset loading state
    loader.classList.add('d-none');
    cancelBtn.disabled = false;
    closeBtn.disabled = false;
    deleteCfCheckbox.disabled = false;
    if (confirmInput) {
      confirmInput.disabled = false;
      btn.disabled = (confirmInput.value.trim() !== currentSiteForDelete);
    } else {
      btn.disabled = false;
    }
  }
});

// ============================================================
// SETTINGS MODAL
// ============================================================
function openSettingsModal(siteName) {
  currentSiteForSettings = siteName;
  document.getElementById('settings-site-name-text').textContent = `Website: ${siteName}`;
  // Reset form
  document.getElementById('settings-form').reset();
  openModal('settings-modal');

  // Load current settings from D1
  authFetch(`/api/sites/${siteName}/settings`)
    .then(r => r.json())
    .then(data => {
      document.getElementById('settings-main-title').value     = data.header_main_title || '';
      document.getElementById('settings-upper-title').value    = data.header_upper_title || '';
      document.getElementById('settings-description').value    = data.header_description || '';
      document.getElementById('settings-seo-title').value      = data.homepage_seo_title || '';
      document.getElementById('settings-seo-description').value= data.homepage_seo_description || '';
      document.getElementById('settings-logo-url').value       = data.header_logo_url || '';
      document.getElementById('settings-banner-url').value     = data.header_banner_url || '';
    })
    .catch(err => console.error('Settings load error:', err));
}

document.getElementById('settings-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentSiteForSettings) return;

  const btn = document.getElementById('btn-submit-settings');
  const loader = btn.querySelector('.btn-loader');
  btn.disabled = true;
  loader.classList.remove('d-none');

  const body = {
    header_main_title:         document.getElementById('settings-main-title').value,
    header_upper_title:        document.getElementById('settings-upper-title').value,
    header_description:        document.getElementById('settings-description').value,
    homepage_seo_title:        document.getElementById('settings-seo-title').value,
    homepage_seo_description:  document.getElementById('settings-seo-description').value,
    header_logo_url:           document.getElementById('settings-logo-url').value,
    header_banner_url:         document.getElementById('settings-banner-url').value,
  };

  try {
    const res = await authFetch(`/api/sites/${currentSiteForSettings}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
    closeModal('settings-modal');
    alert('✅ Đã lưu cấu hình thành công!');
  } catch (err) {
    alert('Lỗi: ' + err.message);
  } finally {
    btn.disabled = false;
    loader.classList.add('d-none');
  }
});

// ============================================================
// API KEY MODAL
// ============================================================
function openApiModal(siteName) {
  currentSiteForApi = siteName;
  document.getElementById('api-site-name-text').textContent = `Website: ${siteName}`;
  document.getElementById('new-key-reveal-box').classList.add('d-none');
  document.getElementById('api-key-label').value = '';
  loadApiKeys(siteName);
  openModal('api-modal');
}

async function loadApiKeys(siteName) {
  try {
    const res = await authFetch(`/api/sites/${siteName}/api-keys`);
    const keys = await res.json();
    const tbody = document.getElementById('api-keys-table-body');
    if (!keys.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px">Chưa có API Key nào</td></tr>';
      return;
    }
    tbody.innerHTML = keys.map(k => `
      <tr>
        <td>${k.name}</td>
        <td><code style="font-family:var(--font-mono);font-size:11px">${k.username || '—'}</code></td>
        <td><code style="font-family:var(--font-mono);font-size:11px">${k.api_key?.slice(0, 12)}…</code></td>
        <td>${k.created_at ? new Date(k.created_at).toLocaleDateString('vi-VN') : '—'}</td>
        <td style="text-align:right">
          <button class="btn btn-danger btn-sm" onclick="deleteApiKey('${siteName}', ${k.id})">Xóa</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Load API keys error:', err);
  }
}

document.getElementById('create-api-key-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentSiteForApi) return;

  const btn = document.getElementById('btn-submit-api-key');
  btn.disabled = true;
  btn.textContent = 'Đang tạo…';

  try {
    const res = await authFetch(`/api/sites/${currentSiteForApi}/api-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label:    document.getElementById('api-key-label').value,
        username: document.getElementById('api-key-user').value,
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');

    // Show generated key
    document.getElementById('generated-key-display').value = data.api_key;
    document.getElementById('new-key-reveal-box').classList.remove('d-none');
    document.getElementById('api-key-label').value = '';
    loadApiKeys(currentSiteForApi);
  } catch (err) {
    alert('Lỗi: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Tạo Key';
  }
});

async function deleteApiKey(siteName, keyId) {
  if (!confirm('Xóa API Key này?')) return;
  try {
    const res = await authFetch(`/api/sites/${siteName}/api-keys/${keyId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
    loadApiKeys(siteName);
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}

function copyGeneratedApiKey() {
  const input = document.getElementById('generated-key-display');
  navigator.clipboard.writeText(input.value).then(() => {
    const btn = document.getElementById('btn-copy-key') || document.querySelector('[onclick="copyGeneratedApiKey()"]');
    if (btn) { const orig = btn.textContent; btn.textContent = '✅ Đã sao chép!'; setTimeout(() => btn.textContent = orig, 2000); }
  });
}

function switchApiTab(tabName) {
  document.getElementById('tab-manage-keys').classList.toggle('d-none', tabName !== 'manage-keys');
  document.getElementById('tab-api-examples').classList.toggle('d-none', tabName !== 'api-examples');
  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', (i === 0 && tabName === 'manage-keys') || (i === 1 && tabName === 'api-examples'));
  });
}

function switchExampleLang(lang) {
  ['curl', 'js', 'python'].forEach(l => {
    document.getElementById(`code-box-${l}`)?.classList.toggle('d-none', l !== lang);
    document.getElementById(`btn-ex-${l}`)?.classList.toggle('active', l === lang);
  });
}

function copyCodeContent(id) {
  const code = document.getElementById(id)?.textContent;
  if (code) navigator.clipboard.writeText(code).then(() => alert('Đã sao chép!'));
}

// ============================================================
// CREDENTIALS MODAL (per site)
// ============================================================
function openCredsModal(siteName) {
  currentSiteForCreds = siteName;
  const site = allSites.find(s => s.name === siteName);
  document.getElementById('creds-site-name-text').textContent = `Website: ${siteName}`;

  document.getElementById('creds-account-id').value = site?.accountId || '';
  document.getElementById('creds-api-key').value    = '';
  document.getElementById('creds-email').value      = site?.email     || '';
  document.getElementById('creds-api-token').value  = '';

  // Handle auth type display
  const authType = (site?.apiToken) ? 'token' : 'key';
  document.getElementById('creds-auth-type').value = authType;
  document.getElementById('creds-group-api-key').classList.toggle('d-none', authType === 'token');
  document.getElementById('creds-group-email').classList.toggle('d-none', authType === 'token');
  document.getElementById('creds-group-api-token').classList.toggle('d-none', authType === 'key');

  openModal('credentials-modal');
}

document.getElementById('creds-auth-type').addEventListener('change', function () {
  const isToken = this.value === 'token';
  document.getElementById('creds-group-api-key').classList.toggle('d-none', isToken);
  document.getElementById('creds-group-email').classList.toggle('d-none', isToken);
  document.getElementById('creds-group-api-token').classList.toggle('d-none', !isToken);
});

document.getElementById('creds-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentSiteForCreds) return;

  const body = {
    accountId: document.getElementById('creds-account-id').value,
    apiKey:    document.getElementById('creds-api-key').value,
    email:     document.getElementById('creds-email').value,
    apiToken:  document.getElementById('creds-api-token').value,
  };

  try {
    const res = await authFetch(`/api/sites/${currentSiteForCreds}/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
    closeModal('credentials-modal');
    await loadSites();
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
});

// ============================================================
// ADMIN MODAL (per site)
// ============================================================
function openAdminModal(siteName) {
  currentSiteForAdmin = siteName;
  const site = allSites.find(s => s.name === siteName);
  if (!site) return;

  document.getElementById('admin-site-name-text').textContent = `Website: ${siteName}`;
  
  const adminUrl = site.deployUrl ? `${site.deployUrl.replace(/\/$/, '')}/admin` : '';
  document.getElementById('admin-login-url').value = adminUrl;
  
  const visitLink = document.getElementById('admin-visit-link');
  if (visitLink) {
    visitLink.href = adminUrl || '#';
  }

  const currentPwField = document.getElementById('admin-current-password');
  if (site.adminPassword) {
    currentPwField.value = site.adminPassword;
    currentPwField.placeholder = '';
  } else {
    currentPwField.value = '';
    currentPwField.placeholder = 'Mật khẩu được tạo trước đó, không thể xem lại';
  }
  
  // Reset form
  document.getElementById('admin-new-password').value = '';
  document.getElementById('admin-confirm-password').value = '';
  
  // Reset visibility
  document.getElementById('admin-current-password').type = 'password';
  document.getElementById('admin-new-password').type = 'password';
  document.getElementById('admin-confirm-password').type = 'password';
  
  // Reset eye icons
  const currentEye = document.querySelector('#admin-current-password + .btn-eye');
  if (currentEye) {
    currentEye.textContent = '👁';
    currentEye.classList.remove('active');
  }
  const newEye = document.querySelector('#admin-new-password + .btn-eye');
  if (newEye) {
    newEye.textContent = '👁';
    newEye.classList.remove('active');
  }
  const confirmEye = document.querySelector('#admin-confirm-password + .btn-eye');
  if (confirmEye) {
    confirmEye.textContent = '👁';
    confirmEye.classList.remove('active');
  }

  openModal('admin-modal');
}

document.getElementById('change-password-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentSiteForAdmin) return;

  const newPassword = document.getElementById('admin-new-password').value;
  const confirmPassword = document.getElementById('admin-confirm-password').value;

  if (newPassword !== confirmPassword) {
    alert('Mật khẩu xác nhận không trùng khớp!');
    return;
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    alert('Mật khẩu mới phải có tối thiểu 8 ký tự, chứa ít nhất 1 chữ hoa (A-Z) và 1 ký tự đặc biệt.');
    return;
  }

  const btn = document.getElementById('btn-submit-change-pw');
  btn.disabled = true;
  btn.textContent = 'Đang đổi mật khẩu…';

  try {
    const res = await authFetch(`/api/sites/${currentSiteForAdmin}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');

    // Update in local state
    const site = allSites.find(s => s.name === currentSiteForAdmin);
    if (site) {
      site.adminPassword = newPassword;
    }
    
    alert('✅ Đổi mật khẩu Admin thành công!');
    closeModal('admin-modal');
    renderSites();
  } catch (err) {
    alert('Lỗi: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Lưu mật khẩu mới';
  }
});

// ============================================================
// TEMPLATE EDIT MODAL (Admin only)
// ============================================================
function openEditTemplateModal(templateId) {
  const t = allTemplates.find(x => x.id === templateId);
  if (!t) return;

  document.getElementById('template-modal-title').textContent = '✏️ Chỉnh sửa Theme';
  document.getElementById('btn-submit-template').textContent = 'Cập nhật Theme';

  const idGroup = document.getElementById('template-id-group');
  if (idGroup) idGroup.style.display = 'none';
  const idInput = document.getElementById('template-id');
  if (idInput) {
    idInput.required = false;
    idInput.value = t.id;
  }

  document.getElementById('template-edit-id').value = t.id;
  document.getElementById('template-name').value = t.name || '';
  document.getElementById('template-desc').value = t.description || '';
  document.getElementById('template-thumbnail').value = t.thumbnail || '';
  document.getElementById('template-demourl').value = t.demoUrl || '';
  document.getElementById('template-githuburl').value = t.githubUrl || '';
  document.getElementById('template-tags').value = Array.isArray(t.tags) ? t.tags.join(', ') : (t.tags || '');
  document.getElementById('template-color').value = t.color || '';

  const fileInput = document.getElementById('template-thumbnail-file');
  if (fileInput) fileInput.value = '';
  const previewWrap = document.getElementById('thumbnail-preview-wrap');
  if (previewWrap) previewWrap.style.display = 'none';
  const previewImg = document.getElementById('template-thumbnail-preview');
  if (previewImg) previewImg.src = '';

  openModal('template-modal');
}

function openCreateTemplateModal() {
  document.getElementById('template-modal-title').textContent = '➕ Thêm Theme mới';
  document.getElementById('btn-submit-template').textContent = 'Thêm Theme';

  const idGroup = document.getElementById('template-id-group');
  if (idGroup) idGroup.style.display = '';
  const idInput = document.getElementById('template-id');
  if (idInput) {
    idInput.required = true;
    idInput.value = '';
  }

  document.getElementById('template-edit-id').value = '';
  document.getElementById('template-name').value = '';
  document.getElementById('template-desc').value = '';
  document.getElementById('template-thumbnail').value = '';
  document.getElementById('template-demourl').value = '';
  document.getElementById('template-githuburl').value = '';
  document.getElementById('template-tags').value = '';
  document.getElementById('template-color').value = '';

  const fileInput = document.getElementById('template-thumbnail-file');
  if (fileInput) fileInput.value = '';
  const previewWrap = document.getElementById('thumbnail-preview-wrap');
  if (previewWrap) previewWrap.style.display = 'none';
  const previewImg = document.getElementById('template-thumbnail-preview');
  if (previewImg) previewImg.src = '';

  openModal('template-modal');
}

// ============================================================
// MODAL HELPERS
// ============================================================
function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// ============================================================
// EVENTS BINDING
// ============================================================
function bindEvents() {
  // Close modals on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el) closeModal(el.id);
    });
  });

  // Button closes
  const closes = {
    'btn-close-modal':    'create-modal',
    'btn-cancel-modal':   'create-modal',
    'btn-close-log':      'log-modal',
    'btn-close-log-footer':'log-modal',
    'btn-close-delete':   'delete-modal',
    'btn-cancel-delete':  'delete-modal',
    'btn-close-settings': 'settings-modal',
    'btn-cancel-settings':'settings-modal',
    'btn-close-api':      'api-modal',
    'btn-close-api-footer':'api-modal',
    'btn-close-creds':    'credentials-modal',
    'btn-cancel-creds':   'credentials-modal',
    'btn-close-profile':  'profile-modal',
    'btn-close-admin-modal': 'admin-modal',
    'btn-cancel-change-pw': 'admin-modal',
    'btn-close-auth':     'auth-modal',
    'btn-close-template': 'template-modal',
    'btn-cancel-template':'template-modal',
    'btn-close-storage-server': 'storage-server-modal',
    'btn-cancel-storage-server': 'storage-server-modal',
  };

  for (const [btnId, modalId] of Object.entries(closes)) {
    document.getElementById(btnId)?.addEventListener('click', () => {
      closeModal(modalId);
      if (modalId === 'log-modal') {
        logEventSource?.close();
        logEventSource = null;
      }
    });
  }

  // Log clear
  document.getElementById('btn-clear-log')?.addEventListener('click', () => {
    document.getElementById('terminal-content').innerHTML = '';
  });

  // Search
  document.getElementById('search-input')?.addEventListener('input', () => renderSites());

  // Auto-slugify site-name from site-title
  const titleInput = document.getElementById('site-title');
  const nameInput = document.getElementById('site-name');
  titleInput?.addEventListener('input', () => {
    nameInput.value = slugify(titleInput.value);
  });

  // Delete modal name confirmation
  const confirmInput = document.getElementById('delete-confirm-name');
  confirmInput?.addEventListener('input', (e) => {
    const btn = document.getElementById('btn-confirm-delete');
    if (btn && currentSiteForDelete) {
      btn.disabled = (e.target.value.trim() !== currentSiteForDelete);
    }
  });

  // Auth form submit
  document.getElementById('auth-form')?.addEventListener('submit', handleAuthSubmit);

  // Auth form register toggle
  document.getElementById('auth-toggle-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    updateAuthModalView();
  });

  // Handle thumbnail preview
  document.getElementById('template-thumbnail-file')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const previewWrap = document.getElementById('thumbnail-preview-wrap');
        const img = document.getElementById('template-thumbnail-preview');
        if (img) img.src = evt.target.result;
        if (previewWrap) previewWrap.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  // Template form submit
  document.getElementById('template-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-template');
    const isEdit = !!document.getElementById('template-edit-id').value;
    btn.disabled = true;
    btn.textContent = isEdit ? 'Đang cập nhật…' : 'Đang thêm mới…';

    const editId = document.getElementById('template-edit-id').value;
    const body = {
      name:        document.getElementById('template-name').value.trim(),
      description: document.getElementById('template-desc').value.trim(),
      thumbnail:   document.getElementById('template-thumbnail').value.trim(),
      demoUrl:     document.getElementById('template-demourl').value.trim(),
      githubUrl:   document.getElementById('template-githuburl').value.trim(),
      tags:        document.getElementById('template-tags').value.split(',').map(s => s.trim()).filter(Boolean),
      color:       document.getElementById('template-color').value.trim(),
    };

    try {
      // 1. Upload thumbnail file if selected
      const fileInput = document.getElementById('template-thumbnail-file');
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const uploadRes = await authFetch('/api/upload-thumbnail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, base64: base64Data })
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Lỗi tải ảnh lên');
        body.thumbnail = uploadData.url;
      }

      // 2. Perform template create or update
      let url = '/api/templates';
      let method = 'POST';

      if (isEdit) {
        url = `/api/templates/${editId}`;
        method = 'PUT';
      } else {
        body.id = document.getElementById('template-id').value.trim();
      }

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi lưu thông tin');
      
      closeModal('template-modal');
      await loadTemplates();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = isEdit ? 'Cập nhật Theme' : 'Thêm Theme';
    }
  });
}
