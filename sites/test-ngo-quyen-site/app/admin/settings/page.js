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

  useEffect(() => {
    loadConfig();
  }, []);

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

    </AdminShell>
  );
}
