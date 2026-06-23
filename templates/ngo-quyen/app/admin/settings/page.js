'use client';
import { useState, useEffect, useRef } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import JSZip from 'jszip';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'backup'
  
  // States for Cloudflare Config
  const [config, setConfig] = useState({
    cf_account_id: '',
    cf_api_token: '',
    cf_d1_database_id: '',
    cf_r2_bucket_name: '',
    cf_r2_public_url: '',
  });
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [configMsg, setConfigMsg] = useState({ type: '', text: '' });
  const [showToken, setShowToken] = useState(false);

  // States for Backup Export
  const [exportDb, setExportDb] = useState(true);
  const [exportFiles, setExportFiles] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState({ type: '', text: '' });

  // States for Backup Import
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState({ type: '', text: '' });
  const [importLogs, setImportLogs] = useState([]);
  const [confirmImport, setConfirmImport] = useState(false);
  const fileInputRef = useRef(null);

  // States for Application Passwords
  const [appPasswords, setAppPasswords] = useState([]);
  const [appPassLoading, setAppPassLoading] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [appPassMsg, setAppPassMsg] = useState({ type: '', text: '' });

  // States for general layout & SEO settings
  const [generalSettings, setGeneralSettings] = useState({
    header_phone: '',
    header_email: '',
    header_upper_title: '',
    header_main_title: '',
    header_description: '',
    footer_principal: '',
    footer_address: '',
    footer_tax_code: '',
    footer_status: '',
    footer_date_active: '',
    homepage_seo_title: '',
    homepage_seo_description: '',
    catalogue_seo_title: '',
    catalogue_seo_description: '',
    header_logo_url: '',
    header_banner_url: '',
  });
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [generalLoading, setGeneralLoading] = useState(false);
  const [generalSaving, setGeneralSaving] = useState(false);
  const [generalMsg, setGeneralMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (activeTab === 'general_settings') {
      loadGeneralSettings();
    }
  }, [activeTab]);

  async function loadGeneralSettings() {
    setGeneralLoading(true);
    setGeneralMsg({ type: '', text: '' });
    try {
      const [settingsRes, catsRes] = await Promise.all([
        fetch('/api/admin/general-settings'),
        fetch('/api/categories')
      ]);

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.settings) {
          setGeneralSettings(settingsData.settings);
        }
      } else {
        const err = await settingsRes.json();
        setGeneralMsg({ type: 'error', text: 'Không thể tải cấu hình: ' + (err.error || '') });
      }

      if (catsRes.ok) {
        const catsData = await catsRes.json();
        setCategoriesList(catsData.categories || []);
      }
    } catch (err) {
      setGeneralMsg({ type: 'error', text: 'Lỗi kết nối: ' + err.message });
    } finally {
      setGeneralLoading(false);
    }
  }

  async function handleSaveGeneralSettings(e) {
    e.preventDefault();
    setGeneralSaving(true);
    setGeneralMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/admin/general-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generalSettings),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneralMsg({ type: 'success', text: 'Đã lưu cấu hình Website thành công!' });
        loadGeneralSettings();
      } else {
        setGeneralMsg({ type: 'error', text: 'Lỗi lưu cấu hình: ' + data.error });
      }
    } catch (err) {
      setGeneralMsg({ type: 'error', text: 'Lỗi kết nối: ' + err.message });
    } finally {
      setGeneralSaving(false);
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    setGeneralMsg({ type: '', text: '' });

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl, filename: file.name }),
        });
        const data = await res.json();
        if (res.ok) {
          setGeneralSettings(prev => ({ ...prev, header_logo_url: data.url }));
          setGeneralMsg({ type: 'success', text: 'Đã tải ảnh logo lên thành công! Hãy bấm "Lưu cấu hình" để áp dụng.' });
        } else {
          setGeneralMsg({ type: 'error', text: 'Lỗi tải ảnh logo: ' + data.error });
        }
      } catch (err) {
        setGeneralMsg({ type: 'error', text: 'Lỗi kết nối: ' + err.message });
      } finally {
        setLogoUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleBannerUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerUploading(true);
    setGeneralMsg({ type: '', text: '' });

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl, filename: file.name }),
        });
        const data = await res.json();
        if (res.ok) {
          setGeneralSettings(prev => ({ ...prev, header_banner_url: data.url }));
          setGeneralMsg({ type: 'success', text: 'Đã tải ảnh banner lên thành công! Hãy bấm "Lưu cấu hình" để áp dụng.' });
        } else {
          setGeneralMsg({ type: 'error', text: 'Lỗi tải ảnh banner: ' + data.error });
        }
      } catch (err) {
        setGeneralMsg({ type: 'error', text: 'Lỗi kết nối: ' + err.message });
      } finally {
        setBannerUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    if (activeTab === 'app_passwords') {
      loadAppPasswords();
    }
  }, [activeTab]);

  async function loadAppPasswords() {
    setAppPassLoading(true);
    setAppPassMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/admin/app-passwords');
      if (res.ok) {
        const data = await res.json();
        setAppPasswords(data.passwords || []);
      } else {
        const errData = await res.json();
        setAppPassMsg({ type: 'error', text: 'Không thể tải mật khẩu ứng dụng: ' + (errData.error || '') });
      }
    } catch (err) {
      setAppPassMsg({ type: 'error', text: 'Lỗi kết nối: ' + err.message });
    } finally {
      setAppPassLoading(false);
    }
  }

  async function handleCreateAppPassword(e) {
    e.preventDefault();
    if (!newAppName.trim()) return;
    setAppPassMsg({ type: '', text: '' });
    setGeneratedPassword('');
    try {
      const res = await fetch('/api/admin/app-passwords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAppName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedPassword(data.password);
        loadAppPasswords();
        setAppPassMsg({ type: 'success', text: 'Đã tạo mật khẩu ứng dụng thành công!' });
      } else {
        setAppPassMsg({ type: 'error', text: 'Lỗi tạo mật khẩu: ' + (data.error || '') });
      }
    } catch (err) {
      setAppPassMsg({ type: 'error', text: 'Lỗi kết nối: ' + err.message });
    }
  }

  async function handleDeleteAppPassword(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa mật khẩu ứng dụng này? Các công cụ sử dụng mật khẩu này sẽ không thể kết nối qua API được nữa.')) {
      return;
    }
    setAppPassMsg({ type: '', text: '' });
    try {
      const res = await fetch(`/api/admin/app-passwords?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAppPassMsg({ type: 'success', text: 'Đã xóa mật khẩu ứng dụng thành công!' });
        loadAppPasswords();
      } else {
        const data = await res.json();
        setAppPassMsg({ type: 'error', text: 'Lỗi khi xóa: ' + (data.error || '') });
      }
    } catch (err) {
      setAppPassMsg({ type: 'error', text: 'Lỗi kết nối: ' + err.message });
    }
  }

  async function loadConfig() {
    setConfigLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setConfig(data.settings);
        }
      } else {
        const errData = await res.json();
        setConfigMsg({ type: 'error', text: 'Không thể tải cấu hình: ' + (errData.error || '') });
      }
    } catch (err) {
      setConfigMsg({ type: 'error', text: 'Lỗi kết nối: ' + err.message });
    } finally {
      setConfigLoading(false);
    }
  }

  async function handleSaveConfig(e) {
    e.preventDefault();
    setConfigSaving(true);
    setConfigMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok) {
        setConfigMsg({ type: 'success', text: 'Đã lưu cấu hình Cloudflare thành công!' });
        // Tải lại để hiển thị masked token đúng cách
        loadConfig();
      } else {
        setConfigMsg({ type: 'error', text: 'Lỗi lưu cấu hình: ' + data.error });
      }
    } catch (err) {
      setConfigMsg({ type: 'error', text: 'Lỗi kết nối: ' + err.message });
    } finally {
      setConfigSaving(false);
    }
  }

  async function handleExport() {
    if (!exportDb && !exportFiles) {
      setExportMsg({ type: 'error', text: 'Vui lòng chọn ít nhất một nội dung để sao lưu (CSDL hoặc Hình ảnh).' });
      return;
    }

    setExporting(true);
    setExportMsg({ type: 'info', text: 'Đang chuẩn bị trích xuất dữ liệu từ máy chủ...' });
    try {
      const queryParams = new URLSearchParams({
        include_db: exportDb,
        include_files: exportFiles,
      });

      const res = await fetch(`/api/admin/backup/export?${queryParams}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Xuất bản sao lưu thất bại');
      }

      const backupInfo = await res.json();
      if (!backupInfo.success) {
        throw new Error(backupInfo.error || 'Lỗi xử lý dữ liệu từ máy chủ');
      }

      // Tạo tệp ZIP ở phía Client (trình duyệt) để tránh quá tải giới hạn tài nguyên của Cloudflare Workers
      const zip = new JSZip();

      // 1. Lưu CSDL nếu được chọn
      if (exportDb && backupInfo.database_backup_json) {
        zip.file('database_backup.json', JSON.stringify(backupInfo.database_backup_json, null, 2));
        zip.file('database_backup.sql', backupInfo.database_backup_sql || '');
      }

      // 2. Tải & lưu hình ảnh/files tải lên nếu được chọn
      if (exportFiles && backupInfo.files && backupInfo.files.length > 0) {
        const uploadsFolder = zip.folder('uploads');
        const totalFiles = backupInfo.files.length;

        for (let i = 0; i < totalFiles; i++) {
          const url = backupInfo.files[i];
          const filename = url.split('/').pop();
          if (!filename) continue;

          setExportMsg({
            type: 'info',
            text: `Đang tải tệp tin (${i + 1}/${totalFiles}): ${filename}...`
          });

          try {
            const fileRes = await fetch(url);
            if (fileRes.ok) {
              const arrayBuffer = await fileRes.arrayBuffer();
              uploadsFolder.file(filename, arrayBuffer);
            } else {
              console.warn(`Lỗi khi tải file ${url}: status ${fileRes.status}`);
            }
          } catch (fileErr) {
            console.warn(`Không thể kết nối tải file ${url}:`, fileErr);
          }
        }
      }

      setExportMsg({ type: 'info', text: 'Đang nén và đóng gói tệp ZIP trên trình duyệt...' });

      // Nén zip ở client (phía trình duyệt có nhiều RAM/CPU và không giới hạn thời gian chạy)
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 5 }
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-ngoquyen-${timestamp}.zip`;

      // Download file kích hoạt ở client
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setExportMsg({ type: 'success', text: `Tải bản sao lưu thành công! Đã lưu file: ${filename}` });
    } catch (err) {
      setExportMsg({ type: 'error', text: 'Lỗi sao lưu: ' + err.message });
    } finally {
      setExporting(false);
    }
  }

  async function handleImportSubmit(e) {
    e.preventDefault();
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) {
      setImportMsg({ type: 'error', text: 'Vui lòng chọn tệp sao lưu (.zip).' });
      return;
    }

    // Yêu cầu xác nhận ghi đè dữ liệu trước khi làm
    setConfirmImport(true);
  }

  async function triggerImport() {
    setConfirmImport(false);
    setImporting(true);
    setImportMsg({ type: 'info', text: 'Đang phục hồi dữ liệu... Vui lòng không tắt trình duyệt.' });
    setImportLogs(['Bắt đầu đọc tệp sao lưu...']);

    try {
      const file = fileInputRef.current.files[0];
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/backup/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setImportMsg({ type: 'success', text: 'Khôi phục dữ liệu hệ thống hoàn tất!' });
        
        // Tạo logs chi tiết hiển thị cho người dùng
        const logs = [
          '✅ Đã giải nén tệp sao lưu ZIP.',
          `🧹 Đã làm sạch các bảng dữ liệu: ${data.stats.cleared.join(', ')}`,
        ];
        
        Object.entries(data.stats.inserted).forEach(([table, count]) => {
          logs.push(`📥 Bảng [${table}]: Khôi phục ${count} bản ghi.`);
        });

        logs.push(`🖼️ Khôi phục thành công ${data.stats.filesRestored} hình ảnh/tệp tin.`);
        logs.push('🎉 Quá trình khôi phục hoàn tất 100%!');
        setImportLogs(logs);

        // Reset input file
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setImportMsg({ type: 'error', text: 'Lỗi khôi phục: ' + (data.error || 'Lỗi không xác định') });
        setImportLogs(prev => [...prev, '❌ Quá trình khôi phục thất bại: ' + (data.error || '')]);
      }
    } catch (err) {
      setImportMsg({ type: 'error', text: 'Lỗi kết nối: ' + err.message });
      setImportLogs(prev => [...prev, '❌ Lỗi kết nối máy chủ: ' + err.message]);
    } finally {
      setImporting(false);
    }
  }

  return (
    <AdminShell title="Cấu hình & Sao lưu">
      
      {/* Tabs navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--adm-border)', paddingBottom: 12 }}>
        <button 
          className={`btn ${activeTab === 'config' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('config')}
        >
          ⚙️ Cấu hình API Cloudflare
        </button>
        <button 
          className={`btn ${activeTab === 'backup' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('backup')}
        >
          📦 Sao lưu & Phục hồi dữ liệu
        </button>
        <button 
          className={`btn ${activeTab === 'app_passwords' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('app_passwords')}
        >
          🔑 Mật khẩu ứng dụng (API)
        </button>
        <button 
          className={`btn ${activeTab === 'general_settings' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('general_settings')}
        >
          🎨 Giao diện & SEO
        </button>
      </div>

      {/* TAB 1: CLOUDFLARE CONFIG */}
      {activeTab === 'config' && (
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title">🔌 Thiết lập API và Tài nguyên lưu trữ (Cloudflare)</div>
          </div>
          <div className="adm-card-body">
            {configMsg.text && (
              <div className={`adm-alert adm-alert-${configMsg.type}`}>
                {configMsg.type === 'success' ? '✅' : '⚠️'} {configMsg.text}
              </div>
            )}

            {configLoading ? (
              <div>
                <div className="skeleton" style={{ height: 40, marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 40, marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 40, marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 40, marginBottom: 16 }} />
              </div>
            ) : (
              <form onSubmit={handleSaveConfig}>
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid #e2e8f0', fontSize: 13, lineHeight: 1.6 }}>
                  💡 <strong>Hướng dẫn:</strong> Các tham số dưới đây dùng để liên kết trang web với dịch vụ <strong>Cloudflare D1 (Database)</strong> và <strong>Cloudflare R2 (Storage)</strong>. Khi deploy sản phẩm thực tế trên Cloudflare Pages, hệ thống sẽ tự động dùng môi trường Worker bindings. Các cấu hình dưới đây được lưu trong cơ sở dữ liệu và phục vụ cho các thao tác đồng bộ, backup hoặc API bên thứ ba.
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Cloudflare Account ID</label>
                  <input 
                    type="text" 
                    className="adm-input" 
                    placeholder="Ví dụ: a1b2c3d4e5f6g7h8i9j0"
                    value={config.cf_account_id}
                    onChange={e => setConfig({ ...config, cf_account_id: e.target.value })}
                  />
                  <div className="adm-input-hint">ID tài khoản Cloudflare của bạn, tìm thấy ở thanh địa chỉ hoặc trang tổng quan dashboard.</div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Cloudflare API Token</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                      type={showToken ? 'text' : 'password'} 
                      className="adm-input" 
                      placeholder="Nhập Cloudflare API Token..."
                      value={config.cf_api_token}
                      onChange={e => setConfig({ ...config, cf_api_token: e.target.value })}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? '👁️ Ẩn' : '👁️ Hiện'}
                    </button>
                  </div>
                  <div className="adm-input-hint">API Token cần có quyền truy cập đọc/ghi D1 và R2. Nếu không thay đổi, token sẽ được giữ nguyên (dạng masked).</div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">D1 Database ID</label>
                  <input 
                    type="text" 
                    className="adm-input" 
                    placeholder="Ví dụ: 1c9e6f28-d762-4f5d-a2c8-4219ff7f58bf"
                    value={config.cf_d1_database_id}
                    onChange={e => setConfig({ ...config, cf_d1_database_id: e.target.value })}
                  />
                  <div className="adm-input-hint">ID (UUID) của cơ sở dữ liệu D1 liên kết với dự án.</div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">R2 Bucket Name</label>
                  <input 
                    type="text" 
                    className="adm-input" 
                    placeholder="Ví dụ: ngo-quyen"
                    value={config.cf_r2_bucket_name}
                    onChange={e => setConfig({ ...config, cf_r2_bucket_name: e.target.value })}
                  />
                  <div className="adm-input-hint">Tên Bucket của Cloudflare R2 dùng để lưu trữ hình ảnh và tệp tải lên.</div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">R2 Public URL (Tùy chọn)</label>
                  <input 
                    type="text" 
                    className="adm-input" 
                    placeholder="Ví dụ: https://pub-xxxxxxxxxxx.r2.dev hoặc CDN của riêng bạn"
                    value={config.cf_r2_public_url}
                    onChange={e => setConfig({ ...config, cf_r2_public_url: e.target.value })}
                  />
                  <div className="adm-input-hint">Đường dẫn công khai để truy cập file trên R2. Nếu để trống, hệ thống dùng API route fallback cục bộ `/api/uploads/`.</div>
                </div>

                <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                  <button type="submit" className="btn btn-primary" disabled={configSaving}>
                    {configSaving ? '正在保存...' : '💾 Lưu cấu hình'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={loadConfig} disabled={configSaving}>
                    🔄 Tải lại dữ liệu
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          
          {/* Export Section */}
          <div className="adm-card">
            <div className="adm-card-header">
              <div className="adm-card-title">📤 Sao lưu Hệ thống (Export ZIP)</div>
            </div>
            <div className="adm-card-body">
              {exportMsg.text && (
                <div className={`adm-alert adm-alert-${exportMsg.type === 'error' ? 'error' : exportMsg.type === 'success' ? 'success' : 'info'}`}>
                  {exportMsg.type === 'success' ? '✅' : 'ℹ️'} {exportMsg.text}
                </div>
              )}

              <p style={{ marginBottom: 16, fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>
                Tạo một bản sao lưu nén định dạng `.zip` chứa toàn bộ cơ sở dữ liệu dạng JSON/SQL và tất cả các ảnh/tệp tin đã được tải lên thư mục uploads hoặc R2 bucket của trường học.
              </p>

              <div className="adm-form-group" style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <label className="adm-label" style={{ marginBottom: 12 }}>Lựa chọn thành phần sao lưu:</label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input 
                      type="checkbox" 
                      checked={exportDb} 
                      onChange={e => setExportDb(e.target.checked)}
                      style={{ width: 16, height: 16 }}
                    />
                    💾 Cơ sở dữ liệu (Tất cả bài viết, người dùng, banner, thăm dò...)
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input 
                      type="checkbox" 
                      checked={exportFiles} 
                      onChange={e => setExportFiles(e.target.checked)}
                      style={{ width: 16, height: 16 }}
                    />
                    🖼️ Hình ảnh & tài liệu tải lên (Thư mục uploads)
                  </label>
                </div>
              </div>

              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', marginTop: 16 }}
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? '⚡ Đang nén & tạo ZIP...' : '⚡ Bắt đầu sao lưu và tải xuống'}
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="adm-card">
            <div className="adm-card-header" style={{ borderBottomColor: '#fecaca' }}>
              <div className="adm-card-title" style={{ color: '#dc2626' }}>📥 Phục hồi Hệ thống (Import ZIP)</div>
            </div>
            <div className="adm-card-body">
              {importMsg.text && (
                <div className={`adm-alert adm-alert-${importMsg.type}`}>
                  {importMsg.type === 'success' ? '✅' : '⚠️'} {importMsg.text}
                </div>
              )}

              <div className="adm-alert adm-alert-error" style={{ fontSize: 12.5, lineHeight: 1.5, marginBottom: 16 }}>
                🛑 <strong>CẢNH BÁO NGUY HIỂM:</strong> Việc khôi phục từ tệp tin sao lưu sẽ <strong>xoá toàn bộ dữ liệu hiện tại</strong> trong các bảng cơ sở dữ liệu và ghi đè bằng dữ liệu trong tệp ZIP. Vui lòng đảm bảo bạn đã sao lưu dữ liệu trước khi thực hiện hành động này.
              </div>

              <form onSubmit={handleImportSubmit}>
                <div className="adm-form-group">
                  <label className="adm-label">Chọn tệp sao lưu (.zip)</label>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="adm-input" 
                    accept=".zip"
                    required
                    disabled={importing}
                    style={{ padding: '8px 12px' }}
                  />
                  <div className="adm-input-hint">Tải lên tệp tin ZIP đã được tạo từ chức năng xuất dữ liệu của hệ thống.</div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-success" 
                  style={{ width: '100%', padding: '12px', background: '#dc2626', borderColor: '#b91c1c' }}
                  disabled={importing}
                >
                  {importing ? '⚡ Đang khôi phục dữ liệu...' : '⚠️ Thực hiện khôi phục hệ thống'}
                </button>
              </form>

              {/* Progress Logs */}
              {importLogs.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', marginBottom: 6 }}>Tiến trình khôi phục:</div>
                  <div style={{ 
                    background: '#0f172a', 
                    color: '#38bdf8', 
                    fontFamily: 'monospace', 
                    fontSize: 11.5, 
                    padding: '12px 16px', 
                    borderRadius: 8, 
                    maxHeight: 180, 
                    overflowY: 'auto',
                    border: '1px solid #1e293b',
                    lineHeight: 1.6
                  }}>
                    {importLogs.map((log, idx) => (
                      <div key={idx} style={{ color: log.startsWith('❌') ? '#ef4444' : log.startsWith('🎉') || log.startsWith('📥') || log.startsWith('✅') ? '#4ade80' : '#38bdf8' }}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* CONFIRM MODAL */}
      {confirmImport && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal" style={{ maxWidth: 460 }}>
            <div className="adm-modal-header" style={{ borderBottomColor: '#fee2e2' }}>
              <div className="adm-modal-title" style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}>
                ⚠️ Xác nhận khôi phục dữ liệu?
              </div>
              <button className="adm-modal-close" onClick={() => setConfirmImport(false)}>×</button>
            </div>
            <div className="adm-modal-body">
              <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.6, marginBottom: 12 }}>
                Bạn đang chuẩn bị khôi phục cơ sở dữ liệu từ tệp tin sao lưu. Hành động này sẽ:
              </p>
              <ul style={{ fontSize: 13, color: '#4b5563', paddingLeft: 20, marginBottom: 16, lineHeight: 1.7 }}>
                <li>❌ <strong>Xoá sạch</strong> các bài viết, cấu hình, danh mục, bình chọn hiện tại.</li>
                <li>🔄 Thay thế bằng dữ liệu lưu trữ từ tệp ZIP sao lưu.</li>
                <li>🖼️ Ghi đè hoặc thêm mới các ảnh/files tương ứng.</li>
              </ul>
              <div className="adm-alert adm-alert-error" style={{ fontSize: 12, margin: 0 }}>
                Hành động này <strong>KHÔNG THỂ HOÀN TÁC</strong>. Bạn có chắc chắn muốn tiếp tục?
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmImport(false)}>Huỷ bỏ</button>
              <button 
                className="btn" 
                style={{ background: '#dc2626', color: '#fff' }} 
                onClick={triggerImport}
              >
                Vẫn tiếp tục khôi phục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: APPLICATION PASSWORDS */}
      {activeTab === 'app_passwords' && (
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title">🔑 Mật khẩu ứng dụng (WordPress REST API Compatibility)</div>
          </div>
          <div className="adm-card-body">
            {appPassMsg.text && (
              <div className={`adm-alert adm-alert-${appPassMsg.type}`}>
                {appPassMsg.type === 'success' ? '✅' : '⚠️'} {appPassMsg.text}
              </div>
            )}

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid #e2e8f0', fontSize: 13, lineHeight: 1.6 }}>
              💡 <strong>Mật khẩu ứng dụng:</strong> Cho phép bạn cấp quyền cho các công cụ, ứng dụng bên thứ ba (như các plugin tự động đăng bài, Zapier, hoặc mã nguồn python/node) kết nối với cổng thông tin qua REST API tương thích với WordPress mà không cần sử dụng mật khẩu chính của tài khoản. Mật khẩu ứng dụng có độ dài 24 ký tự.
            </div>

            {/* Generated Password Display */}
            {generatedPassword && (
              <div style={{ background: '#ecfdf5', border: '1px solid #10b981', padding: 20, borderRadius: 8, marginBottom: 24 }}>
                <div style={{ fontWeight: 700, color: '#065f46', marginBottom: 8, fontSize: 14 }}>
                  Mật khẩu ứng dụng mới của bạn cho ứng dụng vừa tạo:
                </div>
                <div style={{ 
                  background: '#f0fdf4', 
                  border: '2px dashed #34d399', 
                  padding: '12px 18px', 
                  borderRadius: 6, 
                  fontFamily: 'monospace', 
                  fontSize: 22, 
                  fontWeight: 700, 
                  letterSpacing: '1px',
                  color: '#047857',
                  textAlign: 'center',
                  margin: '10px 0'
                }}>
                  {generatedPassword}
                </div>
                <div style={{ fontSize: 12, color: '#065f46', marginTop: 8 }}>
                  ⚠️ <strong>Quan trọng:</strong> Hãy sao chép mật khẩu này ngay bây giờ. Nó sẽ <strong>không được hiển thị lại</strong> sau khi bạn tải lại trang!
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 24 }}>
              {/* Form Create */}
              <div>
                <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>Tạo Mật khẩu Ứng dụng mới</h4>
                <form onSubmit={handleCreateAppPassword}>
                  <div className="adm-form-group">
                    <label className="adm-label" style={{ fontWeight: 600 }}>Tên ứng dụng / Thiết bị</label>
                    <input 
                      type="text" 
                      className="adm-input" 
                      placeholder="Ví dụ: Zapier, Auto-Poster, script Python..."
                      value={newAppName}
                      onChange={e => setNewAppName(e.target.value)}
                      required
                    />
                    <div className="adm-input-hint">Giúp bạn nhận biết mật khẩu này dùng cho công cụ nào.</div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    ➕ Tạo mật khẩu ứng dụng
                  </button>
                </form>
              </div>

              {/* List Passwords */}
              <div>
                <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>Mật khẩu Ứng dụng đang hoạt động</h4>
                {appPassLoading ? (
                  <div className="skeleton" style={{ height: 120 }} />
                ) : appPasswords.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', background: '#f9fafb', borderRadius: 8, color: '#6b7280', fontSize: 13, border: '1px dashed #e5e7eb' }}>
                    Chưa có mật khẩu ứng dụng nào được tạo.
                  </div>
                ) : (
                  <div className="adm-table-wrapper" style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                    <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Tên ứng dụng</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Ngày tạo</th>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Lần dùng cuối</th>
                          <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appPasswords.map(pass => (
                          <tr key={pass.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 600 }}>{pass.name}</td>
                            <td style={{ padding: '10px 12px', color: '#6b7280' }}>
                              {new Date(pass.created_at).toLocaleDateString('vi-VN')}
                            </td>
                            <td style={{ padding: '10px 12px', color: pass.last_used_at ? '#10b981' : '#9ca3af', fontWeight: pass.last_used_at ? 500 : 400 }}>
                              {pass.last_used_at ? new Date(pass.last_used_at).toLocaleString('vi-VN') : 'Chưa dùng'}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <button 
                                type="button" 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', color: '#dc2626', borderColor: '#fee2e2', background: '#fff' }}
                                onClick={() => handleDeleteAppPassword(pass.id)}
                              >
                                🗑️ Thu hồi
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GENERAL SETTINGS & SEO */}
      {activeTab === 'general_settings' && (
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title">🎨 Cấu hình Giao diện & SEO Website</div>
          </div>
          <div className="adm-card-body">
            {generalMsg.text && (
              <div className={`adm-alert adm-alert-${generalMsg.type}`}>
                {generalMsg.type === 'success' ? '✅' : '⚠️'} {generalMsg.text}
              </div>
            )}

            {generalLoading ? (
              <div>
                <div className="skeleton" style={{ height: 40, marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 40, marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 40, marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 40, marginBottom: 16 }} />
              </div>
            ) : (
              <form onSubmit={handleSaveGeneralSettings}>
                {/* ─── GROUP 1: HEADER & FOOTER ─── */}
                <h3 style={{ fontSize: 16, fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 16, color: 'var(--primary)' }}>
                  📞 Cấu hình Header & Footer
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="adm-form-group">
                    <label className="adm-label" style={{ fontWeight: 600 }}>Tiêu đề trên (Header Upper Title)</label>
                    <input 
                      type="text" 
                      className="adm-input" 
                      value={generalSettings.header_upper_title || ''}
                      onChange={e => setGeneralSettings({ ...generalSettings, header_upper_title: e.target.value })}
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label" style={{ fontWeight: 600 }}>Tiêu đề chính (Header Main Title)</label>
                    <input 
                      type="text" 
                      className="adm-input" 
                      value={generalSettings.header_main_title || ''}
                      onChange={e => setGeneralSettings({ ...generalSettings, header_main_title: e.target.value })}
                    />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label" style={{ fontWeight: 600 }}>Dòng mô tả Header (Header Description)</label>
                  <input 
                    type="text" 
                    className="adm-input" 
                    value={generalSettings.header_description || ''}
                    onChange={e => setGeneralSettings({ ...generalSettings, header_description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid #e2e8f0' }}>
                  <div className="adm-form-group" style={{ marginBottom: 0 }}>
                    <label className="adm-label" style={{ fontWeight: 600 }}>Ảnh Logo Website</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                      <div style={{ width: 64, height: 64, border: '1px solid #cbd5e1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', overflow: 'hidden' }}>
                        <img 
                          src={generalSettings.header_logo_url || "/logos/logo_ngo_quyen.png"} 
                          alt="Logo Preview" 
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          onError={(e) => { e.target.src = "https://upload.wikimedia.org/wikipedia/commons/4/47/Logo_TH_Ngo_Quyen.png"; }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={logoUploading}
                          style={{ display: 'none' }}
                          id="logo-upload-input"
                        />
                        <label 
                          htmlFor="logo-upload-input" 
                          className="btn btn-secondary" 
                          style={{ cursor: 'pointer', padding: '6px 12px', fontSize: 13, display: 'inline-block' }}
                        >
                          {logoUploading ? '⏳ Đang tải...' : '📁 Tải ảnh Logo mới'}
                        </label>
                        {generalSettings.header_logo_url && (
                          <button 
                            type="button" 
                            className="btn btn-secondary" 
                            style={{ marginLeft: 8, padding: '6px 12px', fontSize: 13, color: '#dc2626', borderColor: '#fee2e2' }}
                            onClick={() => setGeneralSettings(prev => ({ ...prev, header_logo_url: '' }))}
                          >
                            Xóa
                          </button>
                        )}
                        <div className="adm-input-hint" style={{ marginTop: 4 }}>Chấp nhận các định dạng ảnh phổ biến (PNG, JPG). Tối đa 10MB.</div>
                      </div>
                    </div>
                  </div>

                  <div className="adm-form-group" style={{ marginBottom: 0 }}>
                    <label className="adm-label" style={{ fontWeight: 600 }}>Ảnh Banner Header (Background)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                      <div style={{ width: 100, height: 64, border: '1px solid #cbd5e1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', overflow: 'hidden' }}>
                        <img 
                          src={generalSettings.header_banner_url || "/logos/bghead.jpg"} 
                          alt="Banner Preview" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleBannerUpload}
                          disabled={bannerUploading}
                          style={{ display: 'none' }}
                          id="banner-upload-input"
                        />
                        <label 
                          htmlFor="banner-upload-input" 
                          className="btn btn-secondary" 
                          style={{ cursor: 'pointer', padding: '6px 12px', fontSize: 13, display: 'inline-block' }}
                        >
                          {bannerUploading ? '⏳ Đang tải...' : '📁 Tải Banner mới'}
                        </label>
                        {generalSettings.header_banner_url && (
                          <button 
                            type="button" 
                            className="btn btn-secondary" 
                            style={{ marginLeft: 8, padding: '6px 12px', fontSize: 13, color: '#dc2626', borderColor: '#fee2e2' }}
                            onClick={() => setGeneralSettings(prev => ({ ...prev, header_banner_url: '' }))}
                          >
                            Xóa
                          </button>
                        )}
                        <div className="adm-input-hint" style={{ marginTop: 4 }}>Ảnh nền cho Header của Website. Tối đa 10MB.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="adm-form-group">
                    <label className="adm-label" style={{ fontWeight: 600 }}>Số điện thoại liên hệ</label>
                    <input 
                      type="text" 
                      className="adm-input" 
                      value={generalSettings.header_phone || ''}
                      onChange={e => setGeneralSettings({ ...generalSettings, header_phone: e.target.value })}
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label" style={{ fontWeight: 600 }}>Email liên hệ</label>
                    <input 
                      type="email" 
                      className="adm-input" 
                      value={generalSettings.header_email || ''}
                      onChange={e => setGeneralSettings({ ...generalSettings, header_email: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="adm-form-group">
                    <label className="adm-label" style={{ fontWeight: 600 }}>Hiệu trưởng / Người đại diện</label>
                    <input 
                      type="text" 
                      className="adm-input" 
                      value={generalSettings.footer_principal || ''}
                      onChange={e => setGeneralSettings({ ...generalSettings, footer_principal: e.target.value })}
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label" style={{ fontWeight: 600 }}>Địa chỉ trường</label>
                    <input 
                      type="text" 
                      className="adm-input" 
                      value={generalSettings.footer_address || ''}
                      onChange={e => setGeneralSettings({ ...generalSettings, footer_address: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div className="adm-form-group">
                    <label className="adm-label" style={{ fontWeight: 600 }}>Mã số thuế</label>
                    <input 
                      type="text" 
                      className="adm-input" 
                      value={generalSettings.footer_tax_code || ''}
                      onChange={e => setGeneralSettings({ ...generalSettings, footer_tax_code: e.target.value })}
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label" style={{ fontWeight: 600 }}>Tình trạng hoạt động</label>
                    <input 
                      type="text" 
                      className="adm-input" 
                      value={generalSettings.footer_status || ''}
                      onChange={e => setGeneralSettings({ ...generalSettings, footer_status: e.target.value })}
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label" style={{ fontWeight: 600 }}>Ngày hoạt động chính thức</label>
                    <input 
                      type="text" 
                      className="adm-input" 
                      value={generalSettings.footer_date_active || ''}
                      onChange={e => setGeneralSettings({ ...generalSettings, footer_date_active: e.target.value })}
                    />
                  </div>
                </div>

                {/* ─── GROUP 2: HOMEPAGE & NEWS PAGE SEO ─── */}
                <h3 style={{ fontSize: 16, fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginTop: 24, marginBottom: 16, color: 'var(--primary)' }}>
                  🔍 Cấu hình SEO Trang chủ & Trang tin tức
                </h3>
                
                <div style={{ background: '#f8fafc', padding: 16, border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 10 }}>SEO Trang chủ</h4>
                      <div className="adm-form-group">
                        <label className="adm-label" style={{ fontWeight: 600 }}>Tiêu đề SEO Trang chủ</label>
                        <input 
                          type="text" 
                          className="adm-input" 
                          value={generalSettings.homepage_seo_title || ''}
                          onChange={e => setGeneralSettings({ ...generalSettings, homepage_seo_title: e.target.value })}
                        />
                      </div>
                      <div className="adm-form-group">
                        <label className="adm-label" style={{ fontWeight: 600 }}>Mô tả SEO Trang chủ</label>
                        <textarea 
                          className="adm-input" 
                          rows={3}
                          value={generalSettings.homepage_seo_description || ''}
                          onChange={e => setGeneralSettings({ ...generalSettings, homepage_seo_description: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 10 }}>SEO Danh sách Tin tức (Tất cả tin)</h4>
                      <div className="adm-form-group">
                        <label className="adm-label" style={{ fontWeight: 600 }}>Tiêu đề SEO Trang tin tức</label>
                        <input 
                          type="text" 
                          className="adm-input" 
                          value={generalSettings.catalogue_seo_title || ''}
                          onChange={e => setGeneralSettings({ ...generalSettings, catalogue_seo_title: e.target.value })}
                        />
                      </div>
                      <div className="adm-form-group">
                        <label className="adm-label" style={{ fontWeight: 600 }}>Mô tả SEO Trang tin tức</label>
                        <textarea 
                          className="adm-input" 
                          rows={3}
                          value={generalSettings.catalogue_seo_description || ''}
                          onChange={e => setGeneralSettings({ ...generalSettings, catalogue_seo_description: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── GROUP 3: CATEGORIES SEO ─── */}
                <h3 style={{ fontSize: 16, fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginTop: 24, marginBottom: 16, color: 'var(--primary)' }}>
                  🗂️ Cấu hình SEO Chuyên mục bài viết
                </h3>
                <p style={{ fontSize: 12.5, color: '#64748b', marginBottom: 16 }}>
                  Nhập tiêu đề và mô tả SEO riêng biệt cho từng danh mục bài viết. Hệ thống sẽ áp dụng khi người dùng truy cập trang lọc tin tức theo danh mục tương ứng.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {categoriesList.map(cat => {
                    const titleKey = `seo_category_title_${cat.id}`;
                    const descKey = `seo_category_desc_${cat.id}`;
                    return (
                      <div key={cat.id} style={{ background: '#f8fafc', padding: 14, border: '1px solid #edf2f7', borderRadius: 8 }}>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13.5, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                          <span>📂 {cat.name}</span>
                          <span style={{ fontSize: 11, background: '#e2e8f0', padding: '2px 6px', borderRadius: 4, color: '#475569' }}>
                            {cat.id}
                          </span>
                        </div>
                        <div className="adm-form-group" style={{ marginBottom: 10 }}>
                          <label className="adm-label" style={{ fontSize: 12, marginBottom: 4 }}>Tiêu đề SEO</label>
                          <input 
                            type="text" 
                            className="adm-input" 
                            style={{ padding: '6px 10px', fontSize: 13 }}
                            placeholder={`Mặc định: ${cat.name} | Trường TH Ngô Quyền`}
                            value={generalSettings[titleKey] || ''}
                            onChange={e => setGeneralSettings({ ...generalSettings, [titleKey]: e.target.value })}
                          />
                        </div>
                        <div className="adm-form-group" style={{ marginBottom: 0 }}>
                          <label className="adm-label" style={{ fontSize: 12, marginBottom: 4 }}>Mô tả SEO</label>
                          <textarea 
                            className="adm-input" 
                            rows={2}
                            style={{ padding: '6px 10px', fontSize: 13 }}
                            placeholder={`Mô tả tóm tắt cho chuyên mục ${cat.name}...`}
                            value={generalSettings[descKey] || ''}
                            onChange={e => setGeneralSettings({ ...generalSettings, [descKey]: e.target.value })}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                  <button type="submit" className="btn btn-primary" disabled={generalSaving}>
                    {generalSaving ? 'Đang lưu...' : '💾 Lưu cấu hình Website'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={loadGeneralSettings} disabled={generalSaving}>
                    🔄 Tải lại dữ liệu
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </AdminShell>
  );
}
