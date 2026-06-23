'use client';
import { useState, useEffect, useRef } from 'react';
import AdminShell from '../../../components/admin/AdminShell';
import { encodeId } from '../../../lib/obfuscator';

const FILE_ICONS = {
  image: '🖼️',
  video: '🎬',
  document: '📄',
  pdf: '📕',
  excel: '📊',
  word: '📘',
  powerpoint: '📙',
  archive: '📦',
  audio: '🎵',
  text: '📄',
  other: '📎'
};

function getFileType(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
  if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
  if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio';
  if (['txt', 'md'].includes(ext)) return 'text';
  return 'other';
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  const size = parseInt(bytes);
  if (isNaN(size)) return bytes;
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
  return (size / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function FilesPage() {
  // Tabs
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'attachments'

  // Data states
  const [files, setFiles] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [categories, setCategories] = useState([]);

  // Load states
  const [loading, setLoading] = useState(true);
  const [loadingAttachments, setLoadingAttachments] = useState(false);

  // Filters & UI states
  const [filterType, setFilterType] = useState('');
  const [filterFolder, setFilterFolder] = useState(''); // Category slug or post category name
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [msg, setMsg] = useState(null);

  // Upload modal states
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', folder: 'general', type: 'image', description: '', is_public: 1 });
  const [imgPreview, setImgPreview] = useState('');
  const fileRef = useRef(null);

  // Category Manager states
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', slug: '' });
  const [editingCatId, setEditingCatId] = useState(null);

  // Edit File states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', folder: 'general', description: '', is_public: 1 });

  // Share Modal states
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingFile, setSharingFile] = useState(null);

  useEffect(() => {
    loadFiles();
    loadAttachments();
    loadCategories();
  }, []);

  async function loadFiles() {
    setLoading(true);
    const res = await fetch('/api/files');
    if (res.ok) {
      const d = await res.json();
      setFiles(d.files || []);
    }
    setLoading(false);
  }

  async function loadAttachments() {
    setLoadingAttachments(true);
    const res = await fetch('/api/attachments?all=true');
    if (res.ok) {
      const d = await res.json();
      setAttachments(d.attachments || []);
    }
    setLoadingAttachments(false);
  }

  async function loadCategories() {
    const res = await fetch('/api/file-categories');
    if (res.ok) {
      const d = await res.json();
      setCategories(d.categories || []);
    }
  }

  function showMsg(type, txt) {
    setMsg({ type, text: txt });
    setTimeout(() => setMsg(null), 3000);
  }

  function handleFileInput(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showMsg('error', 'File quá lớn (tối đa 5MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target.result;
      const type = getFileType(file.name);
      setForm(prev => ({
        ...prev,
        name: file.name,
        url,
        type
      }));
      if (type === 'image') setImgPreview(url);
    };
    reader.readAsDataURL(file);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!form.url || !form.name) {
      showMsg('error', 'Thiếu thông tin file');
      return;
    }
    setUploading(true);
    const sizeKB = form.url.startsWith('data:') ? Math.round(form.url.length * 0.75 / 1024) + 'KB' : 'N/A';
    const res = await fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, file_size: sizeKB }),
    });
    if (res.ok) {
      showMsg('success', '✅ Upload thành công!');
      setShowModal(false);
      setForm({ name: '', url: '', folder: 'general', type: 'image', description: '', is_public: 1 });
      setImgPreview('');
      loadFiles();
    } else {
      const d = await res.json();
      showMsg('error', d.error);
    }
    setUploading(false);
  }

  async function deleteFile(id, isAttach = false) {
    if (!confirm(isAttach ? 'Xóa tệp đính kèm này?' : 'Xóa file này?')) return;
    const url = isAttach ? `/api/attachments/${id}` : `/api/files/${id}`;
    const res = await fetch(url, { method: 'DELETE' });
    if (res.ok) {
      showMsg('success', 'Đã xóa tệp tin thành công');
      if (isAttach) loadAttachments();
      else loadFiles();
    } else {
      showMsg('error', 'Không thể xóa tệp tin này');
    }
  }

  // Category CRUD handlers
  async function handleCatSubmit(e) {
    e.preventDefault();
    if (!catForm.name || !catForm.slug) return;
    const url = editingCatId ? `/api/file-categories/${editingCatId}` : '/api/file-categories';
    const method = editingCatId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(catForm)
    });
    if (res.ok) {
      showMsg('success', editingCatId ? 'Cập nhật danh mục thành công' : 'Đã thêm danh mục mới');
      setCatForm({ name: '', slug: '' });
      setEditingCatId(null);
      loadCategories();
      loadFiles();
    } else {
      const d = await res.json();
      showMsg('error', d.error);
    }
  }

  async function deleteCategory(id) {
    if (!confirm('Xóa danh mục này? Các file thuộc danh mục sẽ chuyển về "Chưa phân loại" (general).')) return;
    const res = await fetch(`/api/file-categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showMsg('success', 'Đã xóa danh mục');
      loadCategories();
      loadFiles();
    } else {
      const d = await res.json();
      showMsg('error', d.error);
    }
  }

  // Edit File Metadata handlers
  function openEditModal(file, isAttach = false) {
    setEditingFile({ ...file, isAttach });
    setEditForm({
      name: file.name,
      folder: file.folder || 'general',
      description: file.description || '',
      is_public: file.is_public !== undefined ? file.is_public : 1
    });
    setShowEditModal(true);
  }

  async function handleEditFile(e) {
    e.preventDefault();
    if (!editForm.name) return;
    const isAttach = editingFile.isAttach;
    const url = isAttach ? `/api/attachments/${editingFile.id}` : `/api/files/${editingFile.id}`;
    const body = isAttach
      ? { name: editForm.name, is_public: editForm.is_public }
      : { name: editForm.name, folder: editForm.folder, description: editForm.description, is_public: editForm.is_public };

    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      showMsg('success', '✅ Đã lưu thay đổi!');
      setShowEditModal(false);
      if (isAttach) loadAttachments();
      else loadFiles();
    } else {
      const d = await res.json();
      showMsg('error', d.error || 'Cập nhật thất bại');
    }
  }

  // Share Toggles
  function openShareModal(file, isAttach = false) {
    setSharingFile({ ...file, isAttach });
    setShowShareModal(true);
  }

  // Filter computation
  const postCategories = [...new Set(attachments.map(a => a.post_category_name || 'Chưa phân loại'))];

  const filtered = files.filter(f => {
    const matchType = !filterType || f.file_type === filterType;
    const matchFolder = !filterFolder || f.folder === filterFolder;
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchFolder && matchSearch;
  });

  const filteredAttachments = attachments.filter(a => {
    const matchType = !filterType || a.file_type === filterType;
    const matchFolder = !filterFolder || (a.post_category_name || 'Chưa phân loại') === filterFolder;
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchFolder && matchSearch;
  });

  const currentList = activeTab === 'library' ? filtered : filteredAttachments;

  return (
    <AdminShell title="File & Tài nguyên">
      {msg && <div className={`adm-alert adm-alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

      {/* Tabs */}
      <div className="adm-tabs">
        <button
          className={`adm-tab-btn ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => { setActiveTab('library'); setFilterFolder(''); }}
        >
          📁 Thư viện file chính
        </button>
        <button
          className={`adm-tab-btn ${activeTab === 'attachments' ? 'active' : ''}`}
          onClick={() => { setActiveTab('attachments'); setFilterFolder(''); }}
        >
          📎 Tệp đính kèm bài viết
        </button>
      </div>

      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title">
            {activeTab === 'library' ? '📁 Thư viện file chính' : '📎 Tệp đính kèm bài viết'} ({currentList.length})
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('grid')}>⊞ Lưới</button>
            <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('list')}>☰ Danh sách</button>
            {activeTab === 'library' && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowCatModal(true)}>🗂️ Quản lý danh mục</button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>↑ Upload</button>
              </>
            )}
          </div>
        </div>

        <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--adm-border)' }}>
          <div className="adm-toolbar">
            <div className="adm-search-wrap">
              <span className="adm-search-icon">🔍</span>
              <input type="text" placeholder="Tìm kiếm file..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="adm-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">Tất cả loại</option>
              <option value="image">🖼️ Ảnh</option>
              <option value="video">🎬 Video</option>
              <option value="pdf">📕 PDF</option>
              <option value="word">📘 Word</option>
              <option value="excel">📊 Excel</option>
              <option value="powerpoint">📙 PowerPoint</option>
              <option value="archive">📦 Tệp nén</option>
              <option value="audio">🎵 Âm thanh</option>
              <option value="text">📄 Văn bản</option>
              <option value="other">📎 Khác</option>
            </select>

            {activeTab === 'library' ? (
              <select className="adm-filter-select" value={filterFolder} onChange={e => setFilterFolder(e.target.value)}>
                <option value="">Tất cả danh mục file</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            ) : (
              <select className="adm-filter-select" value={filterFolder} onChange={e => setFilterFolder(e.target.value)}>
                <option value="">Tất cả chuyên mục bài viết</option>
                {postCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div style={{ padding: 22 }}>
          {((activeTab === 'library' && loading) || (activeTab === 'attachments' && loadingAttachments)) ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Đang tải dữ liệu...</div>
          ) : currentList.length === 0 ? (
            <div className="adm-empty">
              <div className="adm-empty-icon">📁</div>
              <div className="adm-empty-text">Chưa tìm thấy tệp tin phù hợp</div>
              {activeTab === 'library' && (
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>Upload file đầu tiên</button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="file-grid">
              {currentList.map(file => {
                const isAttach = activeTab === 'attachments';
                const fileIcon = FILE_ICONS[file.file_type] || '📎';
                const catInfo = isAttach 
                  ? (file.post_category_name || 'Không xác định') 
                  : (categories.find(c => c.slug === file.folder)?.name || file.folder);

                return (
                  <div key={file.id} className="file-card">
                    <div className="file-thumb">
                      {file.file_type === 'image' ? (
                        <img src={file.url} alt={file.name} onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="file-icon">{fileIcon}</div>
                      )}
                    </div>
                    <div className="file-info" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div className="file-name" title={file.name} style={{ fontWeight: 700 }}>{file.name}</div>
                      <div className="file-meta" style={{ fontSize: '11px', color: '#6b7280' }}>
                        {isAttach ? formatSize(file.file_size) : file.file_size} · {catInfo}
                      </div>

                      {/* Display attached article name */}
                      {isAttach && file.post_title && (
                        <div style={{ fontSize: '10.5px', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 4 }} title={file.post_title}>
                          Bài: {file.post_title}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: '11px' }}>
                        <span style={{ color: '#16a34a', fontWeight: '600' }}>📥 {file.downloads || 0} tải</span>
                        <span className={`badge ${file.is_public === 0 ? 'badge-private' : 'badge-public'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                          {file.is_public === 0 ? 'Riêng tư' : 'Công khai'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, padding: '4px 0', fontSize: '11px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                          onClick={() => openShareModal(file, isAttach)}
                        >
                          🔗 Chia sẻ
                        </button>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEditModal(file, isAttach)}>✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteFile(file.id, isAttach)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Tên tệp</th>
                  <th>Loại</th>
                  {activeTab === 'library' ? <th>Danh mục</th> : <th>Đính kèm bài viết</th>}
                  <th>Kích thước</th>
                  <th>Lượt tải</th>
                  <th>Quyền chia sẻ</th>
                  <th>Ngày đăng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map(file => {
                  const isAttach = activeTab === 'attachments';
                  const fileIcon = FILE_ICONS[file.file_type] || '📎';
                  const catInfo = isAttach 
                    ? (file.post_category_name || 'Không xác định') 
                    : (categories.find(c => c.slug === file.folder)?.name || file.folder);

                  return (
                    <tr key={file.id}>
                      <td className="title-cell">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 20 }}>{fileIcon}</span>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1f2937' }}>{file.name}</div>
                            {file.description && (
                              <div style={{ fontSize: 11, color: '#9ca3af', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {file.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-blue">{file.file_type}</span></td>
                      <td>
                        {isAttach ? (
                          file.post_title ? (
                            <a href={`/admin/posts/${file.post_id}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--adm-primary)', fontSize: 12, textDecoration: 'underline' }}>
                              {file.post_title}
                            </a>
                          ) : 'Chưa gán bài viết'
                        ) : catInfo}
                      </td>
                      <td style={{ color: '#6b7280' }}>
                        {isAttach ? formatSize(file.file_size) : file.file_size}
                      </td>
                      <td style={{ fontWeight: '600', color: '#16a34a' }}>{file.downloads || 0}</td>
                      <td>
                        <span className={`badge ${file.is_public === 0 ? 'badge-private' : 'badge-public'}`}>
                          {file.is_public === 0 ? '🔒 Riêng tư' : '🔓 Công khai'}
                        </span>
                      </td>
                      <td style={{ color: '#6b7280', fontSize: 12 }}>
                        {new Date(file.uploaded_at || file.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openShareModal(file, isAttach)} title="Chia sẻ">🔗</button>
                          <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEditModal(file, isAttach)} title="Sửa">✏️</button>
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm btn-icon" title="Xem">👁️</a>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteFile(file.id, isAttach)} title="Xóa">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Upload modal */}
      {showModal && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal">
            <div className="adm-modal-header">
              <div className="adm-modal-title">📤 Tải Lên Tệp Mới</div>
              <button className="adm-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="adm-modal-body">
                <div className="adm-form-group">
                  <label className="adm-label">Chọn file từ máy tính</label>
                  <div className="img-upload-zone" onClick={() => fileRef.current?.click()}>
                    <div className="img-upload-icon">📁</div>
                    <div className="img-upload-text">Click hoặc kéo thả file vào đây<br />
                      <span style={{ fontSize: 11 }}>Ảnh, PDF, Word, Excel, Video — tối đa 5MB</span>
                    </div>
                  </div>
                  <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFileInput} />
                </div>

                {imgPreview && (
                  <div className="img-preview" style={{ marginBottom: 12 }}>
                    <img src={imgPreview} alt="Preview" />
                  </div>
                )}

                <div className="adm-divider" />

                <div className="adm-form-group">
                  <label className="adm-label">Hoặc nhập URL trực tiếp</label>
                  <input className="adm-input" placeholder="https://..." value={form.url}
                    onChange={e => { setForm({ ...form, url: e.target.value }); setImgPreview(e.target.value); }} />
                </div>

                <div className="adm-row">
                  <div className="adm-form-group" style={{ flex: 1 }}>
                    <label className="adm-label">Tên hiển thị <span>*</span></label>
                    <input className="adm-input" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="adm-form-group" style={{ flex: 1 }}>
                    <label className="adm-label">Danh mục lưu trữ</label>
                    <select className="adm-input adm-select" value={form.folder}
                      onChange={e => setForm({ ...form, folder: e.target.value })}>
                      {categories.map(c => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Loại file</label>
                  <select className="adm-input adm-select" value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="image">🖼️ Ảnh</option>
                    <option value="video">🎬 Video</option>
                    <option value="pdf">📕 PDF</option>
                    <option value="word">📘 Word</option>
                    <option value="excel">📊 Excel</option>
                    <option value="powerpoint">📙 PowerPoint</option>
                    <option value="archive">📦 Tệp nén</option>
                    <option value="audio">🎵 Âm thanh</option>
                    <option value="text">📄 Văn bản</option>
                    <option value="other">📎 Khác</option>
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Mô tả tệp tin</label>
                  <textarea className="adm-input adm-textarea" style={{ minHeight: 60 }} placeholder="Mô tả ngắn gọn nội dung file..." value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>

                <div className="adm-form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <input type="checkbox" id="upload-is-public" checked={form.is_public === 1}
                    onChange={e => setForm({ ...form, is_public: e.target.checked ? 1 : 0 })} style={{ width: 'auto', margin: 0 }} />
                  <label htmlFor="upload-is-public" className="adm-label" style={{ marginBottom: 0, cursor: 'pointer', fontSize: 13 }}>Chia sẻ công khai (Cho phép phụ huynh/học sinh tải về)</label>
                </div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Đang upload...' : '📤 Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit File Metadata modal */}
      {showEditModal && editingFile && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal">
            <div className="adm-modal-header">
              <div className="adm-modal-title">✏️ Chỉnh sửa thông tin tệp tin</div>
              <button className="adm-modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditFile}>
              <div className="adm-modal-body">
                <div className="adm-form-group">
                  <label className="adm-label">Tên hiển thị <span>*</span></label>
                  <input className="adm-input" value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>

                {!editingFile.isAttach ? (
                  <>
                    <div className="adm-form-group">
                      <label className="adm-label">Danh mục lưu trữ</label>
                      <select className="adm-input adm-select" value={editForm.folder}
                        onChange={e => setEditForm({ ...editForm, folder: e.target.value })}>
                        {categories.map(c => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="adm-form-group">
                      <label className="adm-label">Mô tả tệp tin</label>
                      <textarea className="adm-input adm-textarea" style={{ minHeight: 60 }} value={editForm.description}
                        onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                    </div>
                  </>
                ) : (
                  <div className="adm-form-group">
                    <label className="adm-label" style={{ color: '#6b7280' }}>* Lưu ý: Tệp đính kèm bài viết sẽ kế thừa chuyên mục từ bài viết chứa nó.</label>
                  </div>
                )}

                <div className="adm-form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <input type="checkbox" id="edit-is-public" checked={editForm.is_public === 1}
                    onChange={e => setEditForm({ ...editForm, is_public: e.target.checked ? 1 : 0 })} style={{ width: 'auto', margin: 0 }} />
                  <label htmlFor="edit-is-public" className="adm-label" style={{ marginBottom: 0, cursor: 'pointer', fontSize: 13 }}>Chia sẻ công khai (Cho phép phụ huynh/học sinh tải về)</label>
                </div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Links modal */}
      {showShareModal && sharingFile && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal" style={{ maxWidth: 500 }}>
            <div className="adm-modal-header">
              <div className="adm-modal-title">🔗 Chia sẻ tệp: {sharingFile.name}</div>
              <button className="adm-modal-close" onClick={() => setShowShareModal(false)}>×</button>
            </div>
            <div className="adm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Direct file URL */}
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-label" style={{ fontWeight: 600 }}>Link tải trực tiếp (Direct URL)</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="adm-input" readOnly value={sharingFile.url} />
                  <button className="btn btn-secondary" onClick={() => {
                    navigator.clipboard.writeText(sharingFile.url);
                    showMsg('success', 'Đã sao chép link trực tiếp!');
                  }}>Copy</button>
                </div>
                <p style={{ marginTop: 4, fontSize: '11px', color: '#dc2626', lineHeight: '1.4' }}>
                  ⚠️ <strong>Cảnh báo:</strong> Liên kết trực tiếp đến tệp tin trên máy chủ. Chỉ dùng làm nguồn để nhúng ảnh/video vào bài viết. <strong>KHÔNG</strong> gửi link này cho học sinh/phụ huynh tải trực tiếp để tránh lộ tài nguyên gốc và nguy cơ bị tấn công DDoS.
                </p>
              </div>

              {/* Public Download Page URL */}
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-label" style={{ fontWeight: 600 }}>Trang tải về công khai (Public Download Page)</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="adm-input" readOnly value={`${window.location.origin}/download/${encodeId(sharingFile.isAttach ? 'a' : 'f', sharingFile.id)}`} />
                  <button className="btn btn-primary" onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/download/${encodeId(sharingFile.isAttach ? 'a' : 'f', sharingFile.id)}`);
                    showMsg('success', 'Đã sao chép liên kết trang tải về công khai!');
                  }}>Copy</button>
                </div>
                <p style={{ marginTop: 4, fontSize: '11px', color: '#16a34a', lineHeight: '1.4' }}>
                  ✅ <strong>Khuyên dùng:</strong> Dùng để gửi chia sẻ cho học sinh/phụ huynh tải về. Hệ thống sẽ ẩn đường dẫn thật, mã hóa mã số tệp (ID) và tự động tạo liên kết tải tạm thời (hiệu lực 5 phút, tối đa 3 lần tải) để bảo vệ máy chủ.
                </p>
              </div>

              {/* HTML Embed Codes */}
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-label" style={{ fontWeight: 600 }}>Mã nhúng HTML (HTML Embed Code)</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="adm-input" readOnly value={
                    sharingFile.file_type === 'image'
                      ? `<img src="${sharingFile.url}" alt="${sharingFile.name}" style="max-width:100%; border-radius:8px;" />`
                      : sharingFile.file_type === 'video'
                        ? `<video src="${sharingFile.url}" controls style="max-width:100%; border-radius:8px;"></video>`
                        : `<a href="${window.location.origin}/download/${encodeId(sharingFile.isAttach ? 'a' : 'f', sharingFile.id)}" target="_blank">📎 Tải về ${sharingFile.name}</a>`
                  } />
                  <button className="btn btn-secondary" onClick={() => {
                    const embedCode = sharingFile.file_type === 'image'
                      ? `<img src="${sharingFile.url}" alt="${sharingFile.name}" style="max-width:100%; border-radius:8px;" />`
                      : sharingFile.file_type === 'video'
                        ? `<video src="${sharingFile.url}" controls style="max-width:100%; border-radius:8px;"></video>`
                        : `<a href="${window.location.origin}/download/${encodeId(sharingFile.isAttach ? 'a' : 'f', sharingFile.id)}" target="_blank">📎 Tải về ${sharingFile.name}</a>`;
                    navigator.clipboard.writeText(embedCode);
                    showMsg('success', 'Đã sao chép mã nhúng HTML!');
                  }}>Copy</button>
                </div>
                <p style={{ marginTop: 4, fontSize: '11px', color: '#4b5563', lineHeight: '1.4' }}>
                  ℹ️ Dùng để chèn trực tiếp mã nguồn HTML vào bài viết (thông qua nút Xem nguồn HTML của trình soạn thảo) để hiển thị nhanh ảnh, video hoặc liên kết tải tệp tin an toàn.
                </p>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowShareModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager modal */}
      {showCatModal && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal" style={{ maxWidth: 600 }}>
            <div className="adm-modal-header">
              <div className="adm-modal-title">🗂️ Quản lý danh mục file</div>
              <button className="adm-modal-close" onClick={() => setShowCatModal(false)}>×</button>
            </div>
            <div className="adm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Form thêm/sửa danh mục */}
              <form onSubmit={handleCatSubmit} style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #edf2f7' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: 'var(--adm-primary)' }}>
                  {editingCatId ? '✏️ Cập nhật danh mục' : '➕ Thêm danh mục mới'}
                </div>
                <div className="adm-row" style={{ gap: 10 }}>
                  <div className="adm-form-group" style={{ marginBottom: 0, flex: 1 }}>
                    <label className="adm-label" style={{ fontSize: 11 }}>Tên danh mục <span>*</span></label>
                    <input className="adm-input" style={{ fontSize: 12 }} placeholder="Tài liệu ôn tập, Ảnh dã ngoại..." value={catForm.name} onChange={e => {
                      const name = e.target.value;
                      const slug = name.toLowerCase()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                        .replace(/đ/g, 'd').replace(/Đ/g, 'd')
                        .replace(/[^a-z0-9\s-]/g, '')
                        .trim().replace(/\s+/g, '-');
                      setCatForm(prev => ({ ...prev, name, slug: editingCatId && catForm.slug === 'general' ? 'general' : slug }));
                    }} required />
                  </div>
                  <div className="adm-form-group" style={{ marginBottom: 0, flex: 1 }}>
                    <label className="adm-label" style={{ fontSize: 11 }}>Slug URL <span>*</span></label>
                    <input className="adm-input" style={{ fontSize: 12 }} placeholder="slug-danh-muc" value={catForm.slug} onChange={e => {
                      if (editingCatId && catForm.slug === 'general') return;
                      setCatForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-') }));
                    }} required disabled={editingCatId && catForm.slug === 'general'} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 12, justifyContent: 'flex-end' }}>
                  {editingCatId && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                      setEditingCatId(null);
                      setCatForm({ name: '', slug: '' });
                    }}>Hủy</button>
                  )}
                  <button type="submit" className="btn btn-primary btn-sm">
                    {editingCatId ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>

              <div className="adm-divider" style={{ margin: '8px 0' }} />

              <div style={{ fontWeight: 600, fontSize: 13 }}>Danh sách danh mục ({categories.length})</div>
              <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid var(--adm-border)', borderRadius: 6 }}>
                <table className="adm-table" style={{ margin: 0 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '8px 12px', fontSize: 12 }}>Tên danh mục</th>
                      <th style={{ padding: '8px 12px', fontSize: 12 }}>Slug</th>
                      <th style={{ padding: '8px 12px', fontSize: 12, textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(c => (
                      <tr key={c.id}>
                        <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600 }}>{c.name}</td>
                        <td style={{ padding: '8px 12px', fontSize: 12, color: '#6b7280' }}>{c.slug}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: 11, marginRight: 4 }} onClick={() => {
                            setEditingCatId(c.id);
                            setCatForm({ name: c.name, slug: c.slug });
                          }}>Sửa</button>
                          {c.slug !== 'general' && (
                            <button className="btn btn-danger btn-sm" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => deleteCategory(c.id)}>Xóa</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCatModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .adm-tabs {
          display: flex;
          gap: 16px;
          border-bottom: 2px solid var(--adm-border);
          margin-bottom: 20px;
        }
        .adm-tab-btn {
          padding: 12px 20px;
          font-weight: 600;
          font-size: 14.5px;
          border: none;
          background: none;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          outline: none;
        }
        .adm-tab-btn:hover {
          color: var(--adm-primary);
        }
        .adm-tab-btn.active {
          color: var(--adm-primary);
          border-bottom-color: var(--adm-primary);
        }
        .badge-private {
          background: #fef2f2 !important;
          color: #ef4444 !important;
        }
        .badge-public {
          background: #f0fdf4 !important;
          color: #16a34a !important;
        }
      `}</style>
    </AdminShell>
  );
}
