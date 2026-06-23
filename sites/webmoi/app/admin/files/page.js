'use client';
import { useState, useEffect, useRef } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { encodeId } from '@/lib/obfuscator';

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
  const [filterFolder, setFilterFolder] = useState(''); // Category slug
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
    if (file.size > 10 * 1024 * 1024) {
      showMsg('error', 'File size exceeds limit (Max 10MB)');
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
      showMsg('error', 'Missing file details');
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
      showMsg('success', '✅ File uploaded successfully!');
      setShowModal(false);
      setForm({ name: '', url: '', folder: 'general', type: 'image', description: '', is_public: 1 });
      setImgPreview('');
      loadFiles();
    } else {
      const d = await res.json();
      showMsg('error', d.error || 'Upload failed');
    }
    setUploading(false);
  }

  async function deleteFile(id, isAttach = false) {
    if (!confirm(isAttach ? 'Remove this attached file?' : 'Delete this file?')) return;
    const url = isAttach ? `/api/attachments/${id}` : `/api/files/${id}`;
    const res = await fetch(url, { method: 'DELETE' });
    if (res.ok) {
      showMsg('success', 'File deleted successfully');
      if (isAttach) loadAttachments();
      else loadFiles();
    } else {
      showMsg('error', 'Failed to delete file');
    }
  }

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
      showMsg('success', editingCatId ? 'Category updated' : 'New category created');
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
    if (!confirm('Delete this category? Files inside will be moved to general.')) return;
    const res = await fetch(`/api/file-categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showMsg('success', 'Category deleted');
      loadCategories();
      loadFiles();
    } else {
      const d = await res.json();
      showMsg('error', d.error);
    }
  }

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
      showMsg('success', '✅ Changes saved!');
      setShowEditModal(false);
      if (isAttach) loadAttachments();
      else loadFiles();
    } else {
      const d = await res.json();
      showMsg('error', d.error || 'Failed to update file details');
    }
  }

  function openShareModal(file, isAttach = false) {
    setSharingFile({ ...file, isAttach });
    setShowShareModal(true);
  }

  const postCategories = [...new Set(attachments.map(a => a.post_title || 'Changelog Attachments'))];

  const filtered = files.filter(f => {
    const matchType = !filterType || f.file_type === filterType;
    const matchFolder = !filterFolder || f.folder === filterFolder;
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchFolder && matchSearch;
  });

  const filteredAttachments = attachments.filter(a => {
    const matchType = !filterType || a.file_type === filterType;
    const matchFolder = !filterFolder || (a.post_title || 'Changelog Attachments') === filterFolder;
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchFolder && matchSearch;
  });

  const currentList = activeTab === 'library' ? filtered : filteredAttachments;

  return (
    <AdminShell title="Files & Assets Manager">
      {msg && <div className={`adm-alert adm-alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

      {/* Tabs */}
      <div className="adm-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          className={`btn ${activeTab === 'library' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('library'); setFilterFolder(''); }}
        >
          📁 Assets Library
        </button>
        <button
          className={`btn ${activeTab === 'attachments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('attachments'); setFilterFolder(''); }}
        >
          📎 Post Attachments
        </button>
      </div>

      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title">
            {activeTab === 'library' ? '📁 Assets Library' : '📎 Post Attachments'} ({currentList.length})
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('grid')}>⊞ Grid</button>
            <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('list')}>☰ List</button>
            {activeTab === 'library' && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowCatModal(true)}>🗂️ Categories</button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>↑ Upload File</button>
              </>
            )}
          </div>
        </div>

        <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--admin-border)' }}>
          <div className="adm-toolbar">
            <div className="adm-search-wrap">
              <span className="adm-search-icon">🔍</span>
              <input type="text" placeholder="Search files by name..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="adm-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="image">🖼️ Images</option>
              <option value="video">🎬 Videos</option>
              <option value="pdf">📕 PDF</option>
              <option value="word">📘 Word docs</option>
              <option value="excel">📊 Excel spreadsheets</option>
              <option value="powerpoint">📙 PowerPoint</option>
              <option value="archive">📦 Archives</option>
              <option value="audio">🎵 Audio files</option>
              <option value="text">📄 Text files</option>
              <option value="other">📎 Others</option>
            </select>

            {activeTab === 'library' ? (
              <select className="adm-filter-select" value={filterFolder} onChange={e => setFilterFolder(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            ) : (
              <select className="adm-filter-select" value={filterFolder} onChange={e => setFilterFolder(e.target.value)}>
                <option value="">All Articles</option>
                {postCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div style={{ padding: 22 }}>
          {((activeTab === 'library' && loading) || (activeTab === 'attachments' && loadingAttachments)) ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--admin-muted)' }}>Loading files...</div>
          ) : currentList.length === 0 ? (
            <div className="adm-empty">
              <div className="adm-empty-icon">📁</div>
              <div className="adm-empty-text">No files found matching filters</div>
              {activeTab === 'library' && (
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>Upload Your First Asset</button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="file-grid">
              {currentList.map(file => {
                const isAttach = activeTab === 'attachments';
                const fileIcon = FILE_ICONS[file.file_type] || '📎';
                const catInfo = isAttach 
                  ? 'Attachment' 
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
                      <div className="file-meta" style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>
                        {isAttach ? formatSize(file.file_size) : file.file_size} · {catInfo}
                      </div>

                      {isAttach && file.post_title && (
                        <div style={{ fontSize: '10.5px', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', padding: '4px 8px', borderRadius: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 4 }} title={file.post_title}>
                          Post: {file.post_title}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: '11px' }}>
                        <span style={{ color: 'var(--admin-secondary)', fontWeight: '600' }}>📥 {file.downloads || 0} downloads</span>
                        <span className={`badge ${file.is_public === 0 ? 'badge-private' : 'badge-public'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                          {file.is_public === 0 ? 'Private' : 'Public'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, padding: '4px 0', fontSize: '11px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                          onClick={() => openShareModal(file, isAttach)}
                        >
                          🔗 Share
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
                  <th>File Name</th>
                  <th>Type</th>
                  {activeTab === 'library' ? <th>Category</th> : <th>Linked Changelog</th>}
                  <th>Size</th>
                  <th>Downloads</th>
                  <th>Privacy</th>
                  <th>Uploaded Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map(file => {
                  const isAttach = activeTab === 'attachments';
                  const fileIcon = FILE_ICONS[file.file_type] || '📎';
                  const catInfo = isAttach 
                    ? 'Attachment' 
                    : (categories.find(c => c.slug === file.folder)?.name || file.folder);

                  return (
                    <tr key={file.id}>
                      <td className="title-cell">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 20 }}>{fileIcon}</span>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{file.name}</div>
                            {file.description && (
                              <div style={{ fontSize: 11, color: 'var(--admin-muted)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                            <a href={`/admin/posts/${file.post_id}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--admin-primary)', fontSize: 12, textDecoration: 'underline' }}>
                              {file.post_title}
                            </a>
                          ) : 'No linked post'
                        ) : catInfo}
                      </td>
                      <td style={{ color: 'var(--admin-muted)' }}>
                        {isAttach ? formatSize(file.file_size) : file.file_size}
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--admin-secondary)' }}>{file.downloads || 0}</td>
                      <td>
                        <span className={`badge ${file.is_public === 0 ? 'badge-private' : 'badge-public'}`}>
                          {file.is_public === 0 ? '🔒 Private' : '🔓 Public'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--admin-muted)', fontSize: 12 }}>
                        {new Date(file.uploaded_at || file.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openShareModal(file, isAttach)} title="Share">🔗</button>
                          <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEditModal(file, isAttach)} title="Edit">✏️</button>
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm btn-icon" title="View">👁️</a>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteFile(file.id, isAttach)} title="Delete">🗑️</button>
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
        <div className="adm-modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="adm-modal" style={{ background: '#0e0e11', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '24px', width: '500px', maxWidth: '90%' }}>
            <div className="adm-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div className="adm-modal-title" style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>📤 Upload New Asset</div>
              <button className="adm-modal-close" onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--admin-muted)', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="adm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="adm-form-group">
                  <label className="adm-label">Select local file</label>
                  <div className="img-upload-zone" onClick={() => fileRef.current?.click()}>
                    <div className="img-upload-icon">📁</div>
                    <div className="img-upload-text">Click to browse file<br />
                      <span style={{ fontSize: 11 }}>Images, PDF, Documents, Code — Max 10MB</span>
                    </div>
                  </div>
                  <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFileInput} />
                </div>

                {imgPreview && (
                  <div className="img-preview" style={{ marginBottom: 12 }}>
                    <img src={imgPreview} alt="Preview" />
                  </div>
                )}

                <div className="adm-form-group">
                  <label className="adm-label">Or enter direct URL</label>
                  <input className="adm-input" placeholder="https://..." value={form.url}
                    onChange={e => { setForm({ ...form, url: e.target.value }); setImgPreview(e.target.value); }} />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="adm-form-group" style={{ flex: 1 }}>
                    <label className="adm-label">Display Name *</label>
                    <input className="adm-input" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="adm-form-group" style={{ flex: 1 }}>
                    <label className="adm-label">Storage Category</label>
                    <select className="adm-select" value={form.folder}
                      onChange={e => setForm({ ...form, folder: e.target.value })}>
                      {categories.map(c => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">File Type</label>
                  <select className="adm-select" value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="image">🖼️ Image</option>
                    <option value="video">🎬 Video</option>
                    <option value="pdf">📕 PDF</option>
                    <option value="word">📘 Word Doc</option>
                    <option value="excel">📊 Excel Sheet</option>
                    <option value="powerpoint">📙 PowerPoint</option>
                    <option value="archive">📦 Compressed Archive</option>
                    <option value="audio">🎵 Audio</option>
                    <option value="text">📄 Text Document</option>
                    <option value="other">📎 Other</option>
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Description</label>
                  <textarea className="adm-textarea" style={{ minHeight: 60 }} placeholder="Write a short description..." value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>

                <div className="adm-form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <input type="checkbox" id="upload-is-public" checked={form.is_public === 1}
                    onChange={e => setForm({ ...form, is_public: e.target.checked ? 1 : 0 })} style={{ width: 'auto', margin: 0 }} />
                  <label htmlFor="upload-is-public" className="adm-label" style={{ marginBottom: 0, cursor: 'pointer', fontSize: 13 }}>Share publicly (Allow visitors to download)</label>
                </div>
              </div>
              <div className="adm-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : '📤 Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit File Metadata modal */}
      {showEditModal && editingFile && (
        <div className="adm-modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="adm-modal" style={{ background: '#0e0e11', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '24px', width: '500px', maxWidth: '95%' }}>
            <div className="adm-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div className="adm-modal-title" style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>✏️ Edit Asset Metadata</div>
              <button className="adm-modal-close" onClick={() => setShowEditModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--admin-muted)', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleEditFile}>
              <div className="adm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="adm-form-group">
                  <label className="adm-label">Display Name *</label>
                  <input className="adm-input" value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>

                {!editingFile.isAttach ? (
                  <>
                    <div className="adm-form-group">
                      <label className="adm-label">Storage Category</label>
                      <select className="adm-select" value={editForm.folder}
                        onChange={e => setEditForm({ ...editForm, folder: e.target.value })}>
                        {categories.map(c => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="adm-form-group">
                      <label className="adm-label">Description</label>
                      <textarea className="adm-textarea" style={{ minHeight: 60 }} value={editForm.description}
                        onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                    </div>
                  </>
                ) : (
                  <div className="adm-form-group">
                    <label className="adm-label" style={{ color: 'var(--admin-muted)' }}>* Attached post assets inherit categories from their containing article.</label>
                  </div>
                )}

                <div className="adm-form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <input type="checkbox" id="edit-is-public" checked={editForm.is_public === 1}
                    onChange={e => setEditForm({ ...editForm, is_public: e.target.checked ? 1 : 0 })} style={{ width: 'auto', margin: 0 }} />
                  <label htmlFor="edit-is-public" className="adm-label" style={{ marginBottom: 0, cursor: 'pointer', fontSize: 13 }}>Share publicly (Allow visitors to download)</label>
                </div>
              </div>
              <div className="adm-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Links modal */}
      {showShareModal && sharingFile && (
        <div className="adm-modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="adm-modal" style={{ background: '#0e0e11', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '24px', width: '500px', maxWidth: '95%' }}>
            <div className="adm-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div className="adm-modal-title" style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>🔗 Share Asset: {sharingFile.name}</div>
              <button className="adm-modal-close" onClick={() => setShowShareModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--admin-muted)', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <div className="adm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Direct file URL */}
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-label" style={{ fontWeight: 600 }}>Direct URL</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="adm-input" readOnly value={sharingFile.url} />
                  <button className="btn btn-secondary" onClick={() => {
                    navigator.clipboard.writeText(sharingFile.url);
                    showMsg('success', 'Copied Direct URL!');
                  }}>Copy</button>
                </div>
                <p style={{ marginTop: 4, fontSize: '11px', color: 'var(--admin-danger)', lineHeight: '1.4' }}>
                  ⚠️ Direct link to the asset on the storage server. Use this only for image/media source embeds.
                </p>
              </div>

              {/* Public Download Page URL */}
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-label" style={{ fontWeight: 600 }}>Public Download Gateway Page</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="adm-input" readOnly value={`${window.location.origin}/download/${encodeId(sharingFile.isAttach ? 'a' : 'f', sharingFile.id)}`} />
                  <button className="btn btn-primary" onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/download/${encodeId(sharingFile.isAttach ? 'a' : 'f', sharingFile.id)}`);
                    showMsg('success', 'Copied Public Download Page link!');
                  }}>Copy</button>
                </div>
                <p style={{ marginTop: 4, fontSize: '11px', color: 'var(--admin-secondary)', lineHeight: '1.4' }}>
                  ✅ <strong>Recommended:</strong> Send this link for public user downloads. It masks target files and validates temporary download tokens.
                </p>
              </div>

              {/* HTML Embed Codes */}
              <div className="adm-form-group" style={{ marginBottom: 0 }}>
                <label className="adm-label" style={{ fontWeight: 600 }}>HTML Embed Snippet</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="adm-input" readOnly value={
                    sharingFile.file_type === 'image'
                      ? `<img src="${sharingFile.url}" alt="${sharingFile.name}" style="max-width:100%; border-radius:8px;" />`
                      : sharingFile.file_type === 'video'
                        ? `<video src="${sharingFile.url}" controls style="max-width:100%; border-radius:8px;"></video>`
                        : `<a href="${window.location.origin}/download/${encodeId(sharingFile.isAttach ? 'a' : 'f', sharingFile.id)}" target="_blank">📎 Download ${sharingFile.name}</a>`
                  } />
                  <button className="btn btn-secondary" onClick={() => {
                    const embedCode = sharingFile.file_type === 'image'
                      ? `<img src="${sharingFile.url}" alt="${sharingFile.name}" style="max-width:100%; border-radius:8px;" />`
                      : sharingFile.file_type === 'video'
                        ? `<video src="${sharingFile.url}" controls style="max-width:100%; border-radius:8px;"></video>`
                        : `<a href="${window.location.origin}/download/${encodeId(sharingFile.isAttach ? 'a' : 'f', sharingFile.id)}" target="_blank">📎 Download ${sharingFile.name}</a>`;
                    navigator.clipboard.writeText(embedCode);
                    showMsg('success', 'Copied HTML Embed Code!');
                  }}>Copy</button>
                </div>
              </div>
            </div>
            <div className="adm-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowShareModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager modal */}
      {showCatModal && (
        <div className="adm-modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="adm-modal" style={{ background: '#0e0e11', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '24px', width: '600px', maxWidth: '95%' }}>
            <div className="adm-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div className="adm-modal-title" style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>🗂️ Manage File Categories</div>
              <button className="adm-modal-close" onClick={() => setShowCatModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--admin-muted)', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            <div className="adm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Form add/edit categories */}
              <form onSubmit={handleCatSubmit} style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 8, border: '1px solid var(--admin-border)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: 'var(--admin-primary)' }}>
                  {editingCatId ? '✏️ Update Category' : '➕ Add New Category'}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="adm-form-group" style={{ marginBottom: 0, flex: 1 }}>
                    <label className="adm-label" style={{ fontSize: 11 }}>Category Name *</label>
                    <input className="adm-input" style={{ fontSize: 12 }} placeholder="Tutorials, Screenshots, etc..." value={catForm.name} onChange={e => {
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
                    <label className="adm-label" style={{ fontSize: 11 }}>Slug URL *</label>
                    <input className="adm-input" style={{ fontSize: 12 }} placeholder="category-slug" value={catForm.slug} onChange={e => {
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
                    }}>Cancel</button>
                  )}
                  <button type="submit" className="btn btn-primary btn-sm">
                    {editingCatId ? 'Update' : 'Add Category'}
                  </button>
                </div>
              </form>

              <div className="adm-divider" style={{ margin: '8px 0', borderTop: '1px solid var(--admin-border)' }} />

              <div style={{ fontWeight: 600, fontSize: 13 }}>Stored Categories ({categories.length})</div>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--admin-border)', borderRadius: 6 }}>
                <table className="adm-table" style={{ margin: 0 }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.4)' }}>
                      <th style={{ padding: '8px 12px', fontSize: 12 }}>Name</th>
                      <th style={{ padding: '8px 12px', fontSize: 12 }}>Slug</th>
                      <th style={{ padding: '8px 12px', fontSize: 12, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(c => (
                      <tr key={c.id}>
                        <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600 }}>{c.name}</td>
                        <td style={{ padding: '8px 12px', fontSize: 12, color: 'var(--admin-muted)' }}>{c.slug}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                          <button className="btn btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: 11, marginRight: 4 }} onClick={() => {
                            setEditingCatId(c.id);
                            setCatForm({ name: c.name, slug: c.slug });
                          }}>Edit</button>
                          {c.slug !== 'general' && (
                            <button className="btn btn-danger btn-sm" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => deleteCategory(c.id)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="adm-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCatModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
