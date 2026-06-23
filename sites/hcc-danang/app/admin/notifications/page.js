'use client';
import { useState, useEffect } from 'react';
import AdminShell from '../../../components/admin/AdminShell';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { loadNotifs(); }, []);

  async function loadNotifs() {
    setLoading(true);
    const res = await fetch('/api/notifications');
    if (res.ok) { const d = await res.json(); setNotifications(d.notifications); }
    setLoading(false);
  }

  function showMsg(type, txt) { setMsg({type, text: txt}); setTimeout(() => setMsg(null), 3000); }

  async function toggleActive(notif) {
    await fetch(`/api/notifications/${notif.id}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ active: !notif.active }),
    });
    loadNotifs();
  }

  async function deleteNotif(id) {
    if (!confirm('Xóa thông báo này?')) return;
    const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    if (res.ok) { showMsg('success', 'Đã xóa thông báo'); loadNotifs(); }
    else showMsg('error', 'Không có quyền xóa');
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    if (editItem) {
      await fetch(`/api/notifications/${editItem.id}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ text_content: text }),
      });
      showMsg('success', 'Đã cập nhật thông báo');
    } else {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ text_content: text }),
      });
      showMsg('success', 'Đã thêm thông báo');
    }
    setShowModal(false); setText(''); setEditItem(null);
    loadNotifs();
    setSaving(false);
  }

  function openEdit(notif) { setEditItem(notif); setText(notif.text_content); setShowModal(true); }
  function openCreate() { setEditItem(null); setText(''); setShowModal(true); }

  return (
    <AdminShell title="Quản lý Thông báo">
      {msg && <div className={`adm-alert adm-alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

      <div className="adm-alert adm-alert-info" style={{marginBottom:16}}>
        💡 Các thông báo đang bật sẽ hiển thị trên thanh chạy (marquee) của trang chủ theo thứ tự ưu tiên.
      </div>

      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title">🔔 Danh sách thông báo ({notifications.length})</div>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Thêm thông báo</button>
        </div>

        {loading ? (
          <div style={{padding:40,textAlign:'center',color:'#9ca3af'}}>Đang tải...</div>
        ) : notifications.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon">🔔</div>
            <div className="adm-empty-text">Chưa có thông báo nào</div>
            <button className="btn btn-primary" style={{marginTop:16}} onClick={openCreate}>Thêm thông báo đầu tiên</button>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Ưu tiên</th>
                  <th>Nội dung thông báo</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map(notif => (
                  <tr key={notif.id}>
                    <td style={{textAlign:'center',fontWeight:700,color:'#6b7280'}}>#{notif.priority}</td>
                    <td style={{maxWidth:400}}>
                      <div style={{fontWeight:500,color:'#1f2937'}}>{notif.text_content}</div>
                    </td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={!!notif.active} onChange={() => toggleActive(notif)} />
                          <span className="toggle-slider" />
                        </label>
                        <span className={`badge ${notif.active ? 'badge-green' : 'badge-gray'}`}>
                          {notif.active ? 'Hiển thị' : 'Ẩn'}
                        </span>
                      </div>
                    </td>
                    <td style={{color:'#6b7280',fontSize:12}}>
                      {new Date(notif.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-secondary btn-sm btn-icon" title="Sửa" onClick={() => openEdit(notif)}>✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon" title="Xóa" onClick={() => deleteNotif(notif.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview */}
      {notifications.filter(n => n.active).length > 0 && (
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title">👁️ Xem trước marquee</div>
          </div>
          <div className="adm-card-body">
            <div style={{
              background:'#fff',
              border:'1px solid var(--adm-border)',
              borderRadius:8, padding:'10px 16px',
              overflow:'hidden', position:'relative'
            }}>
              <div style={{
                display:'inline-block',
                whiteSpace:'nowrap',
                animation:'ticker 30s linear infinite',
                color:'#c0392b', fontWeight:600, fontSize:14,
              }}>
                {notifications.filter(n => n.active).map(n => n.text_content).join('   ▸   ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal">
            <div className="adm-modal-header">
              <div className="adm-modal-title">{editItem ? '✏️ Sửa thông báo' : '+ Thêm thông báo'}</div>
              <button className="adm-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="adm-modal-body">
                <div className="adm-form-group">
                  <label className="adm-label">Nội dung thông báo <span>*</span></label>
                  <textarea
                    className="adm-input adm-textarea"
                    style={{minHeight:100}}
                    placeholder="Nhập nội dung thông báo..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    required
                    autoFocus
                  />
                  <div className="adm-input-hint">Thông báo sẽ hiển thị liên tục trên thanh chạy trang chủ.</div>
                </div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '...' : editItem ? 'Cập nhật' : 'Thêm thông báo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes ticker { from { transform:translateX(100%); } to { transform:translateX(-100%); } }`}</style>
    </AdminShell>
  );
}
