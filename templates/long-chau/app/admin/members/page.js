'use client';
import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import '@/app/admin/admin.css';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ role: 'member', tier: 'Free', active: true });
  const [msg, setMsg] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);
    try {
      const res = await fetch('/api/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      } else {
        const data = await res.json();
        setMsg({ type: 'error', text: data.error || 'Failed to load member list' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Server connection error' });
    } finally {
      setLoading(false);
    }
  }

  function startEdit(member) {
    setEditingId(member.id);
    setEditForm({
      role: member.role || 'member',
      tier: member.tier || 'Free',
      active: !!member.active
    });
  }

  async function saveEdit(id) {
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'Member updated successfully' });
        setEditingId(null);
        loadMembers();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to update member' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Server connection error' });
    } finally {
      setTimeout(() => setMsg(null), 3000);
    }
  }

  async function deleteMember(id) {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'Member account deleted' });
        loadMembers();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to delete member' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Server connection error' });
    } finally {
      setDeleting(null);
      setTimeout(() => setMsg(null), 3000);
    }
  }

  const roleLabels = { admin: 'Admin', mod: 'Mod', member: 'Member' };
  const tierLabels = { Free: 'Free Developer', Pro: 'Pro Taste-1', Enterprise: 'Enterprise Team' };

  return (
    <AdminShell title="Member Directory & Tier Ranks">
      {msg && (
        <div className={`adm-alert adm-alert-${msg.type === 'success' ? 'success' : 'error'}`}>
          {msg.text}
        </div>
      )}

      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title">👥 All Registered Users ({members.length})</div>
        </div>

        <div className="adm-table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--admin-muted)' }}>Loading directory...</div>
          ) : members.length === 0 ? (
            <div className="adm-empty">
              <div className="adm-empty-icon">👥</div>
              <div className="adm-empty-text">No registered members found</div>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Display Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Tier Rank</th>
                  <th>System Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => {
                  const isEditing = editingId === m.id;
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: '600' }}>{m.display_name}</td>
                      <td style={{ fontFamily: 'var(--admin-mono-font)', fontSize: '13px' }}>{m.username}</td>
                      <td>{m.email}</td>
                      <td>
                        {isEditing ? (
                          <select
                            className="adm-filter-select"
                            value={editForm.tier}
                            onChange={e => setEditForm({ ...editForm, tier: e.target.value })}
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            <option value="Free">Free Plan</option>
                            <option value="Pro">Pro Plan</option>
                            <option value="Enterprise">Enterprise Plan</option>
                          </select>
                        ) : (
                          <span className="tier-tag">{m.tier}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            className="adm-filter-select"
                            value={editForm.role}
                            onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            <option value="member">Member</option>
                            <option value="mod">Mod</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`badge ${m.role === 'admin' ? 'badge-red' : m.role === 'mod' ? 'badge-blue' : 'badge-green'}`}>
                            {roleLabels[m.role] || m.role}
                          </span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={editForm.active}
                              onChange={e => setEditForm({ ...editForm, active: e.target.checked })}
                            />
                            <span className="toggle-slider" />
                          </label>
                        ) : (
                          <span className={`badge ${m.active ? 'badge-green' : 'badge-red'}`} style={{ opacity: m.active ? 1 : 0.6 }}>
                            {m.active ? 'Active' : 'Suspended'}
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--admin-muted)', fontSize: '12px' }}>
                        {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-primary btn-sm" onClick={() => saveEdit(m.id)}>Save</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-secondary btn-sm btn-icon" title="Edit" onClick={() => startEdit(m)}>✏️</button>
                            <button
                              className="btn btn-danger btn-sm btn-icon"
                              title="Delete"
                              disabled={deleting === m.id}
                              onClick={() => deleteMember(m.id)}
                            >
                              {deleting === m.id ? '...' : '🗑️'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
