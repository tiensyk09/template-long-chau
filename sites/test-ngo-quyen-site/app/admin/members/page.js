'use client';
import { useState, useEffect } from 'react';
import AdminShell from '../../../components/admin/AdminShell';

const ROLES = ['admin', 'mod', 'member'];
const ROLE_LABELS = { admin: '👑 Quản trị viên', mod: '🛡️ Điều hành viên', member: '👤 Thành viên' };
const ROLE_BADGES = { admin: 'badge-red', mod: 'badge-blue', member: 'badge-green' };

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [form, setForm] = useState({ username:'', password:'', display_name:'', email:'', role:'member' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState(null);

  useEffect(() => { loadMembers(); }, []);

  async function loadMembers() {
    setLoading(true);
    const res = await fetch('/api/members');
    if (res.ok) { const d = await res.json(); setMembers(d.members); }
    setLoading(false);
  }

  function showMsg(type, txt) { setMsg({type, text:txt}); setTimeout(() => setMsg(null), 3000); }

  async function handleSave(e) {
    e.preventDefault(); setError('');
    if (!editMember && (!form.username || !form.password)) {
      setError('Cần nhập username và mật khẩu'); return;
    }
    setSaving(true);
    const res = editMember
      ? await fetch(`/api/members/${editMember.id}`, {
          method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form),
        })
      : await fetch('/api/members', {
          method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form),
        });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Lỗi'); setSaving(false); return; }
    showMsg('success', editMember ? 'Đã cập nhật thành viên' : 'Đã tạo thành viên');
    setShowModal(false); loadMembers();
    setSaving(false);
  }

  async function toggleActive(member) {
    await fetch(`/api/members/${member.id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ active: !member.active }),
    });
    loadMembers();
  }

  async function changeRole(member, role) {
    await fetch(`/api/members/${member.id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ role }),
    });
    loadMembers();
  }

  async function deleteMember(member) {
    if (!confirm(`Xóa thành viên "${member.display_name}"?`)) return;
    const res = await fetch(`/api/members/${member.id}`, { method:'DELETE' });
    if (res.ok) { showMsg('success','Đã xóa thành viên'); loadMembers(); }
    else { const d = await res.json(); showMsg('error', d.error || 'Không thể xóa'); }
  }

  function openCreate() {
    setEditMember(null);
    setForm({ username:'', password:'', display_name:'', email:'', role:'member' });
    setError(''); setShowModal(true);
  }

  function openEdit(m) {
    setEditMember(m);
    setForm({ display_name: m.display_name, email: m.email||'', role: m.role, password:'' });
    setError(''); setShowModal(true);
  }

  const filtered = members.filter(m => {
    const matchRole = !filterRole || m.role === filterRole;
    const matchSearch = !search || m.display_name.toLowerCase().includes(search.toLowerCase()) || m.username.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const initials = (name) => name ? name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : '?';

  return (
    <AdminShell title="Quản lý Thành viên">
      {msg && <div className={`adm-alert adm-alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title">👥 Thành viên ({filtered.length}/{members.length})</div>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Thêm thành viên</button>
        </div>

        <div style={{padding:'14px 22px', borderBottom:'1px solid var(--adm-border)'}}>
          <div className="adm-toolbar">
            <div className="adm-search-wrap">
              <span className="adm-search-icon">🔍</span>
              <input
                type="text" placeholder="Tìm theo tên, username..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="adm-filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="mod">Điều hành viên</option>
              <option value="member">Thành viên</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{padding:40,textAlign:'center',color:'#9ca3af'}}>Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon">👥</div>
            <div className="adm-empty-text">Không có thành viên nào</div>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Thành viên</th>
                  <th>Vai trò</th>
                  <th>Ngày tham gia</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(member => (
                  <tr key={member.id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{
                          width:36,height:36,borderRadius:'50%',flexShrink:0,
                          background:`linear-gradient(135deg, #c0392b, #7b1d0e)`,
                          display:'flex',alignItems:'center',justifyContent:'center',
                          color:'#fff',fontWeight:700,fontSize:13
                        }}>
                          {initials(member.display_name)}
                        </div>
                        <div>
                          <div style={{fontWeight:600,color:'#1f2937'}}>{member.display_name}</div>
                          <div style={{fontSize:12,color:'#9ca3af'}}>@{member.username} · {member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        className={`badge ${ROLE_BADGES[member.role]}`}
                        style={{cursor:'pointer',border:'none',fontFamily:'inherit',fontSize:11,fontWeight:700}}
                        value={member.role}
                        onChange={e => changeRole(member, e.target.value)}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                    </td>
                    <td style={{color:'#6b7280',fontSize:12}}>
                      {member.join_date ? new Date(member.join_date).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={!!member.active} onChange={() => toggleActive(member)} />
                          <span className="toggle-slider" />
                        </label>
                        <span className={`badge ${member.active ? 'badge-green' : 'badge-gray'}`}>
                          {member.active ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-secondary btn-sm btn-icon" title="Sửa" onClick={() => openEdit(member)}>✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon" title="Xóa" onClick={() => deleteMember(member)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal">
            <div className="adm-modal-header">
              <div className="adm-modal-title">{editMember ? '✏️ Sửa thành viên' : '+ Thêm thành viên'}</div>
              <button className="adm-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="adm-modal-body">
                {error && <div className="adm-alert adm-alert-error">⚠️ {error}</div>}
                {!editMember && (
                  <div className="adm-row">
                    <div className="adm-form-group">
                      <label className="adm-label">Username <span>*</span></label>
                      <input className="adm-input" value={form.username}
                        onChange={e => setForm({...form, username: e.target.value})} required />
                    </div>
                    <div className="adm-form-group">
                      <label className="adm-label">Mật khẩu <span>*</span></label>
                      <input className="adm-input" type="password" value={form.password}
                        onChange={e => setForm({...form, password: e.target.value})} required />
                    </div>
                  </div>
                )}
                {editMember && (
                  <div className="adm-form-group">
                    <label className="adm-label">Mật khẩu mới (để trống = giữ nguyên)</label>
                    <input className="adm-input" type="password" value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                      placeholder="Để trống nếu không thay đổi" />
                  </div>
                )}
                <div className="adm-row">
                  <div className="adm-form-group">
                    <label className="adm-label">Tên hiển thị</label>
                    <input className="adm-input" value={form.display_name}
                      onChange={e => setForm({...form, display_name: e.target.value})} />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Email</label>
                    <input className="adm-input" type="email" value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Vai trò</label>
                  <select className="adm-input adm-select" value={form.role}
                    onChange={e => setForm({...form, role: e.target.value})}>
                    {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '...' : editMember ? 'Cập nhật' : 'Tạo thành viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
