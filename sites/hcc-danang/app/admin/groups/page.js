'use client';
import { useState, useEffect } from 'react';
import AdminShell from '../../../components/admin/AdminShell';

export default function GroupsPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name:'' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState(null);

  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    setLoading(true);
    const res = await fetch('/api/categories');
    if (res.ok) { const d = await res.json(); setCategories(d.categories); }
    setLoading(false);
  }

  function showMsg(type, txt) { setMsg({type,text:txt}); setTimeout(() => setMsg(null), 3000); }

  async function handleSave(e) {
    e.preventDefault(); setError('');
    if (!form.name.trim()) { setError('Tên danh mục không được trống'); return; }
    setSaving(true);
    const res = editCat
      ? await fetch(`/api/categories/${editCat.id}`, {
          method:'PUT', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ name: form.name }),
        })
      : await fetch('/api/categories', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ name: form.name }),
        });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Lỗi'); setSaving(false); return; }
    showMsg('success', editCat ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục mới');
    setShowModal(false); setForm({ name:'' }); setEditCat(null);
    loadCategories();
    setSaving(false);
  }

  async function toggleActive(cat) {
    await fetch(`/api/categories/${cat.id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ active: !cat.active }),
    });
    loadCategories();
  }

  async function deleteCat(cat) {
    if (!confirm(`Xóa danh mục "${cat.name}"? Các bài viết thuộc danh mục này sẽ bị ảnh hưởng.`)) return;
    const res = await fetch(`/api/categories/${cat.id}`, { method:'DELETE' });
    if (res.ok) { showMsg('success','Đã xóa danh mục'); loadCategories(); }
    else showMsg('error','Không thể xóa danh mục');
  }

  function openEdit(cat) {
    setEditCat(cat); setForm({ name: cat.name });
    setError(''); setShowModal(true);
  }

  function openCreate() {
    setEditCat(null); setForm({ name:'' });
    setError(''); setShowModal(true);
  }

  const slugify = (name) => name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-');

  return (
    <AdminShell title="Quản lý Danh mục">
      {msg && <div className={`adm-alert adm-alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title">🗂️ Danh sách danh mục ({categories.length})</div>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Thêm danh mục</button>
        </div>

        {loading ? (
          <div style={{padding:40,textAlign:'center',color:'#9ca3af'}}>Đang tải...</div>
        ) : categories.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon">🗂️</div>
            <div className="adm-empty-text">Chưa có danh mục nào</div>
            <button className="btn btn-primary" style={{marginTop:16}} onClick={openCreate}>Tạo danh mục</button>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Thứ tự</th>
                  <th>Tên danh mục</th>
                  <th>Slug (URL)</th>
                  <th>Số bài viết</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => (
                  <tr key={cat.id}>
                    <td style={{textAlign:'center',color:'#9ca3af',fontWeight:600}}>#{cat.sort_order || i+1}</td>
                    <td>
                      <div style={{fontWeight:600,color:'#1f2937'}}>{cat.name}</div>
                    </td>
                    <td>
                      <code style={{fontSize:12,color:'#6b7280',background:'#f8fafc',padding:'2px 8px',borderRadius:4}}>
                        {cat.slug}
                      </code>
                    </td>
                    <td style={{textAlign:'center'}}>
                      <span className="badge badge-blue">{cat.post_count || 0}</span>
                    </td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={!!cat.active} onChange={() => toggleActive(cat)} />
                          <span className="toggle-slider" />
                        </label>
                        <span className={`badge ${cat.active ? 'badge-green' : 'badge-gray'}`}>
                          {cat.active ? 'Hiển thị' : 'Ẩn'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(cat)} title="Sửa">✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteCat(cat)} title="Xóa">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview slug */}
      {form.name && (
        <div className="adm-alert adm-alert-info" style={{display:'inline-flex',marginTop:-8}}>
          Slug sẽ là: <code style={{marginLeft:8,background:'rgba(255,255,255,0.3)',padding:'0 8px',borderRadius:4}}>
            {slugify(form.name)}
          </code>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal" style={{maxWidth:440}}>
            <div className="adm-modal-header">
              <div className="adm-modal-title">{editCat ? '✏️ Sửa danh mục' : '+ Thêm danh mục mới'}</div>
              <button className="adm-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="adm-modal-body">
                {error && <div className="adm-alert adm-alert-error">⚠️ {error}</div>}
                <div className="adm-form-group">
                  <label className="adm-label">Tên danh mục <span>*</span></label>
                  <input
                    className="adm-input"
                    placeholder="VD: Hoạt động Đảng ủy"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    required autoFocus
                  />
                </div>
                {form.name && (
                  <div className="adm-input-hint">
                    Slug (URL): <strong>{slugify(form.name)}</strong>
                  </div>
                )}
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '...' : editCat ? 'Cập nhật' : 'Tạo danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
