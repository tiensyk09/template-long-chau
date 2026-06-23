'use client';
import { useState, useEffect, useRef } from 'react';
import AdminShell from '../../../components/admin/AdminShell';

const BG_PRESETS = [
  { label: 'Đỏ', value: 'linear-gradient(135deg,#c8001a,#e31837)' },
  { label: 'Xanh dương', value: 'linear-gradient(135deg,#0d5bb5,#1a7ddb)' },
  { label: 'Xanh lá', value: 'linear-gradient(135deg,#059669,#22c55e)' },
  { label: 'Vàng', value: 'linear-gradient(135deg,#e8a000,#f0b800)' },
  { label: 'Tím', value: 'linear-gradient(135deg,#7c3aed,#a855f7)' },
  { label: 'Đen', value: 'linear-gradient(135deg,#1e293b,#475569)' },
];

const EMPTY_FORM = {
  title: '', caption: '', big_text: '', image_url: '',
  link: '#', bg_color: BG_PRESETS[0].value, active: true, sort_order: 0,
};

function convertToWebP(file, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = ev => resolve(ev.target.result);
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1920;
        let width = img.width;
        let height = img.height;
        if (width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        resolve(webpDataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = event.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function renameToWebp(filename) {
  if (filename.toLowerCase().endsWith('.svg')) return filename;
  const dotIdx = filename.lastIndexOf('.');
  const baseName = dotIdx !== -1 ? filename.substring(0, dotIdx) : filename;
  return baseName + '.webp';
}

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imgPreview, setImgPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => { loadBanners(); }, []);

  async function loadBanners() {
    setLoading(true);
    const res = await fetch('/api/banners/all');
    if (res.ok) { const d = await res.json(); setBanners(d.banners || []); }
    setLoading(false);
  }

  function openNew() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setImgPreview('');
    setError('');
    setShowForm(true);
  }

  function openEdit(b) {
    setEditId(b.id);
    setForm({
      title: b.title, caption: b.caption || '', big_text: b.big_text || '',
      image_url: b.image_url || '', link: b.link || '#',
      bg_color: b.bg_color || BG_PRESETS[0].value,
      active: !!b.active, sort_order: b.sort_order || 0,
    });
    setImgPreview(b.image_url || '');
    setError('');
    setShowForm(true);
  }

  async function handleImgFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('Ảnh tối đa 10MB'); return; }
    setUploading(true);
    try {
      const dataUrl = await convertToWebP(file);
      const filename = renameToWebp(file.name);
      setImgPreview(dataUrl);
      const res = await fetch('/api/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, filename }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm(prev => ({ ...prev, image_url: data.url }));
        setImgPreview(data.url);
      } else {
        setForm(prev => ({ ...prev, image_url: dataUrl }));
      }
    } catch { setForm(prev => ({ ...prev, image_url: dataUrl })); }
    setUploading(false);
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Vui lòng nhập tiêu đề'); return; }
    setSaving(true); setError('');
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/banners/${editId}` : '/api/banners';
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Lỗi lưu'); return; }
    setSuccess(editId ? '✅ Đã cập nhật banner!' : '✅ Đã thêm banner mới!');
    setShowForm(false);
    loadBanners();
    setTimeout(() => setSuccess(''), 3000);
  }

  async function handleDelete(id, title) {
    if (!confirm(`Xóa banner "${title}"?`)) return;
    await fetch(`/api/banners/${id}`, { method: 'DELETE' });
    loadBanners();
  }

  async function toggleActive(b) {
    await fetch(`/api/banners/${b.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !b.active }),
    });
    setBanners(prev => prev.map(x => x.id === b.id ? { ...x, active: !x.active } : x));
  }

  return (
    <AdminShell title="Quản lý Banner">
      {/* Alert */}
      {success && <div className="adm-alert adm-alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      {/* Header */}
      <div className="adm-card" style={{ marginBottom: 16 }}>
        <div className="adm-card-header">
          <div>
            <div className="adm-card-title">🖼️ Danh sách Banner</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              Banner hiển thị trong slider trang chủ theo thứ tự ưu tiên
            </div>
          </div>
          <button className="btn btn-primary" onClick={openNew}>+ Thêm Banner</button>
        </div>
      </div>

      {/* Banner list */}
      {loading ? (
        <div className="adm-card adm-card-body" style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
          ⏳ Đang tải...
        </div>
      ) : banners.length === 0 ? (
        <div className="adm-card adm-card-body" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🖼️</div>
          <div style={{ color: '#6b7280' }}>Chưa có banner nào.</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openNew}>+ Thêm banner đầu tiên</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {banners.map((b, idx) => (
            <div key={b.id} className="adm-card">
              <div className="adm-card-body" style={{ padding: 14 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  {/* Preview */}
                  <div style={{
                    width: 200, height: 80, flexShrink: 0, borderRadius: 6, overflow: 'hidden',
                    background: b.bg_color, position: 'relative',
                  }}>
                    {b.image_url && (
                      <img src={b.image_url} alt={b.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                    )}
                    {b.big_text && (
                      <div style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 18,
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      }}>{b.big_text}</div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{b.title}</div>
                    {b.caption && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{b.caption}</div>}
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, display: 'flex', gap: 12 }}>
                      <span>🔗 {b.link || '#'}</span>
                      <span>📊 Thứ tự: {b.sort_order}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                    <label className="toggle-switch" title={b.active ? 'Đang hiện' : 'Đang ẩn'}>
                      <input type="checkbox" checked={!!b.active} onChange={() => toggleActive(b)} />
                      <span className="toggle-slider" />
                    </label>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(b)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id, b.title)}>🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="adm-modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="adm-modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">{editId ? '✏️ Chỉnh sửa Banner' : '+ Thêm Banner mới'}</h3>
              <button className="adm-modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="adm-modal-body">
              {error && <div className="adm-alert adm-alert-error" style={{ marginBottom: 12 }}>⚠️ {error}</div>}

              {/* Preview banner */}
              <div style={{
                width: '100%', height: 120, borderRadius: 8, marginBottom: 16, overflow: 'hidden',
                background: form.bg_color, position: 'relative', display: 'flex', alignItems: 'center',
              }}>
                {imgPreview && (
                  <img src={imgPreview} alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0.85 }} />
                )}
                <div style={{ position: 'relative', zIndex: 1, padding: '0 20px', color: '#fff' }}>
                  {form.big_text && <div style={{ fontWeight: 900, fontSize: 22, textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>{form.big_text}</div>}
                  {form.caption && <div style={{ fontSize: 13, marginTop: 4, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{form.caption}</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="adm-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="adm-label">Tiêu đề banner *</label>
                  <input className="adm-input" value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Chào mừng kỷ niệm 115 năm..." />
                </div>

                <div className="adm-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="adm-label">Chú thích hiển thị</label>
                  <input className="adm-input" value={form.caption}
                    onChange={e => setForm({ ...form, caption: e.target.value })}
                    placeholder="Văn bản nhỏ phía dưới ảnh..." />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Chữ lớn trung tâm</label>
                  <input className="adm-input" value={form.big_text}
                    onChange={e => setForm({ ...form, big_text: e.target.value })}
                    placeholder="115 NĂM" />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Liên kết khi click</label>
                  <input className="adm-input" value={form.link}
                    onChange={e => setForm({ ...form, link: e.target.value })}
                    placeholder="https:// hoặc /news/..." />
                </div>

                {/* Ảnh */}
                <div className="adm-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="adm-label">Ảnh banner</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <input className="adm-input" value={form.image_url}
                        onChange={e => { setForm({ ...form, image_url: e.target.value }); setImgPreview(e.target.value); }}
                        placeholder="URL ảnh hoặc chọn file bên dưới..." />
                    </div>
                    <button type="button" className="btn btn-secondary btn-sm"
                      style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                      onClick={() => imgRef.current?.click()}>
                      {uploading ? '⏳...' : '📷 Chọn file'}
                    </button>
                    <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImgFile} />
                  </div>
                </div>

                {/* Màu nền */}
                <div className="adm-form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="adm-label">Màu nền (khi không có ảnh hoặc ảnh trong suốt)</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    {BG_PRESETS.map(p => (
                      <button key={p.value} type="button"
                        onClick={() => setForm({ ...form, bg_color: p.value })}
                        style={{
                          width: 32, height: 32, borderRadius: 6, background: p.value, border: 'none',
                          cursor: 'pointer', outline: form.bg_color === p.value ? '3px solid #1e293b' : '2px solid transparent',
                          outlineOffset: 2,
                        }} title={p.label} />
                    ))}
                  </div>
                  <input className="adm-input" value={form.bg_color}
                    onChange={e => setForm({ ...form, bg_color: e.target.value })}
                    placeholder="linear-gradient(...) hoặc #hex" style={{ fontSize: 12 }} />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Thứ tự hiển thị</label>
                  <input className="adm-input" type="number" min="0" value={form.sort_order}
                    onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                </div>

                <div className="adm-form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 28 }}>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={form.active}
                      onChange={e => setForm({ ...form, active: e.target.checked })} />
                    <span className="toggle-slider" />
                  </label>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {form.active ? '✅ Hiển thị' : '⛔ Ẩn'}
                  </span>
                </div>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Đang lưu...' : (editId ? '💾 Cập nhật' : '+ Thêm Banner')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
