'use client';
import { useState, useEffect } from 'react';
import AdminShell from '../../../components/admin/AdminShell';

export default function PollsPage() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ question: '', options: ['', ''] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState(null);

  useEffect(() => { loadPolls(); }, []);

  async function loadPolls() {
    setLoading(true);
    const res = await fetch('/api/polls');
    if (res.ok) { const d = await res.json(); setPolls(d.polls); }
    setLoading(false);
  }

  async function toggleActive(poll) {
    await fetch(`/api/polls/${poll.id}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ active: !poll.active }),
    });
    loadPolls();
  }

  async function deletePoll(id) {
    if (!confirm('Xóa thăm dò ý kiến này?')) return;
    const res = await fetch(`/api/polls/${id}`, { method: 'DELETE' });
    if (res.ok) { setMsg({type:'success', text:'Đã xóa'}); loadPolls(); }
    else setMsg({type:'error', text:'Không có quyền'});
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleCreate(e) {
    e.preventDefault();
    const opts = form.options.filter(o => o.trim());
    if (opts.length < 2) { setError('Cần ít nhất 2 lựa chọn'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/polls', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ question: form.question, options: opts }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    setShowModal(false);
    setForm({ question: '', options: ['', ''] });
    loadPolls();
    setSaving(false);
  }

  function getTotalVotes(poll) {
    return poll.options?.reduce((s, o) => s + o.votes, 0) || 0;
  }

  return (
    <AdminShell title="Thăm dò Ý kiến">
      {msg && <div className={`adm-alert adm-alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title">📋 Danh sách thăm dò ({polls.length})</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Tạo thăm dò</button>
        </div>

        {loading ? (
          <div style={{padding:40,textAlign:'center',color:'#9ca3af'}}>Đang tải...</div>
        ) : polls.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon">📊</div>
            <div className="adm-empty-text">Chưa có thăm dò nào</div>
            <button className="btn btn-primary" style={{marginTop:16}} onClick={() => setShowModal(true)}>
              Tạo thăm dò đầu tiên
            </button>
          </div>
        ) : (
          <div style={{padding:'0 22px 22px'}}>
            {polls.map(poll => {
              const total = getTotalVotes(poll);
              return (
                <div key={poll.id} style={{
                  border:'1px solid var(--adm-border)',
                  borderRadius:12, padding:'18px 20px',
                  marginTop:16,
                  background: poll.active ? '#fff' : '#f8fafc',
                }}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:16}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:15,color:'#1f2937',marginBottom:4}}>
                        {poll.question}
                      </div>
                      <div style={{fontSize:12,color:'#9ca3af'}}>
                        {new Date(poll.created_at).toLocaleDateString('vi-VN')} · {total} lượt bình chọn
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <span className={`badge ${poll.active ? 'badge-green' : 'badge-gray'}`}>
                        {poll.active ? '● Đang mở' : '○ Đã đóng'}
                      </span>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={!!poll.active} onChange={() => toggleActive(poll)} />
                        <span className="toggle-slider" />
                      </label>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => deletePoll(poll.id)} title="Xóa">🗑️</button>
                    </div>
                  </div>

                  {/* Options + bars */}
                  {poll.options?.map(opt => {
                    const pct = total > 0 ? Math.round(opt.votes / total * 100) : 0;
                    return (
                      <div key={opt.id} className="poll-option-row">
                        <div className="poll-option-label">
                          <span>{opt.option_text}</span>
                          <span className="poll-option-pct">{opt.votes} phiếu ({pct}%)</span>
                        </div>
                        <div className="progress-bar-wrap">
                          <div className="progress-bar-fill" style={{width:`${pct}%`}} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal">
            <div className="adm-modal-header">
              <div className="adm-modal-title">📋 Tạo thăm dò mới</div>
              <button className="adm-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="adm-modal-body">
                {error && <div className="adm-alert adm-alert-error">⚠️ {error}</div>}
                <div className="adm-form-group">
                  <label className="adm-label">Câu hỏi <span>*</span></label>
                  <input
                    className="adm-input"
                    placeholder="Nhập câu hỏi thăm dò..."
                    value={form.question}
                    onChange={e => setForm({...form, question: e.target.value})}
                    required
                  />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Các lựa chọn <span>*</span></label>
                  {form.options.map((opt, i) => (
                    <div key={i} style={{display:'flex',gap:8,marginBottom:8}}>
                      <input
                        className="adm-input"
                        placeholder={`Lựa chọn ${i + 1}...`}
                        value={opt}
                        onChange={e => {
                          const opts = [...form.options];
                          opts[i] = e.target.value;
                          setForm({...form, options: opts});
                        }}
                      />
                      {form.options.length > 2 && (
                        <button type="button" className="btn btn-danger btn-icon"
                          onClick={() => setForm({...form, options: form.options.filter((_,j) => j !== i)})}>
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setForm({...form, options: [...form.options, '']})}
                    style={{marginTop:4}}
                  >
                    + Thêm lựa chọn
                  </button>
                </div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Đang tạo...' : 'Tạo thăm dò'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
