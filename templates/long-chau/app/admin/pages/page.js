'use client';
import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import PageBuilder from '@/components/admin/PageBuilder';
import '@/app/admin/admin.css';

export default function PagesManagement() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  
  // Navigation tabs or active views: 'list' | 'create' | 'edit_settings' | 'edit_layout'
  const [view, setView] = useState('list');
  const [selectedPage, setSelectedPage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form states
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    status: 'published'
  });

  useEffect(() => {
    loadPages();
  }, []);

  async function loadPages() {
    setLoading(true);
    try {
      const res = await fetch('/api/pages');
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
      } else {
        const data = await res.json();
        setMsg({ type: 'error', text: data.error || 'Failed to load page list' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Server connection error' });
    } finally {
      setLoading(false);
    }
  }

  function handleCreateClick() {
    setForm({ title: '', slug: '', description: '', meta_title: '', meta_description: '', meta_keywords: '', status: 'published' });
    setView('create');
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'Page created successfully' });
        setView('list');
        loadPages();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to create page' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Server connection error' });
    } finally {
      setSubmitting(false);
    }
  }

  function handleEditSettingsClick(page) {
    setSelectedPage(page);
    setForm({
      title: page.title,
      slug: page.slug,
      description: page.description || '',
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      meta_keywords: page.meta_keywords || '',
      status: page.status || 'published'
    });
    setView('edit_settings');
  }

  async function handleUpdateSettings(e) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/pages/${selectedPage.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'Page settings updated successfully' });
        setView('list');
        loadPages();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to update page settings' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Server connection error' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditLayoutClick(page) {
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${page.slug}`);
      if (res.ok) {
        const data = await res.json();
        // Load the full page layout containing blocks list
        setSelectedPage(data.page);
        setView('edit_layout');
      } else {
        const data = await res.json();
        setMsg({ type: 'error', text: data.error || 'Failed to fetch page layout' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Server connection error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveLayout(blocksList) {
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/pages/${selectedPage.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layout: blocksList
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'Layout saved successfully' });
        setView('list');
        loadPages();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to save layout' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Server connection error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMsg(null), 4000);
    }
  }

  async function handleDeleteClick(page) {
    if (!confirm(`Are you sure you want to delete page '${page.title}'? This cannot be undone.`)) return;
    setDeletingId(page.id);
    try {
      const res = await fetch(`/api/pages/${page.slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'Page deleted successfully' });
        loadPages();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to delete page' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Server connection error' });
    } finally {
      setDeletingId(null);
      setTimeout(() => setMsg(null), 4000);
    }
  }

  return (
    <AdminShell title={view === 'edit_layout' ? `Design Layout: ${selectedPage?.title}` : 'Page Builder'}>
      {msg && (
        <div className={`adm-alert adm-alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '20px' }}>
          {msg.text}
        </div>
      )}

      {/* --- LIST VIEW --- */}
      {view === 'list' && (
        <div className="adm-card">
          <div className="adm-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="adm-card-title">📄 Dynamic Custom Pages ({pages.length})</div>
            <button className="btn btn-primary btn-sm" onClick={handleCreateClick}>
              + Create New Page
            </button>
          </div>

          <div className="adm-table-wrap">
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--admin-muted)' }}>Loading pages...</div>
            ) : pages.length === 0 ? (
              <div className="adm-empty">
                <div className="adm-empty-icon">📄</div>
                <div className="adm-empty-text">No custom pages created yet</div>
              </div>
            ) : (
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Page Title</th>
                    <th>Url Slug</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '600' }}>{p.title}</td>
                      <td style={{ fontFamily: 'var(--admin-mono-font)', fontSize: '13px', color: 'var(--primary)' }}>
                        /{p.slug}
                      </td>
                      <td style={{ color: 'var(--admin-muted)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.description || '—'}
                      </td>
                      <td>
                        <span className={`badge ${p.status === 'published' ? 'badge-green' : 'badge-red'}`} style={{ opacity: p.status === 'published' ? 1 : 0.6 }}>
                          {p.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--admin-muted)', fontSize: '12px' }}>
                        {p.updated_at ? new Date(p.updated_at).toLocaleString() : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-primary btn-sm" title="Edit layout blocks" onClick={() => handleEditLayoutClick(p)}>
                            🎨 Edit Blocks
                          </button>
                          <button className="btn btn-secondary btn-sm" title="Edit settings" onClick={() => handleEditSettingsClick(p)}>
                            ✏️ Settings
                          </button>
                          <button
                            className="btn btn-danger btn-sm btn-icon"
                            title="Delete"
                            disabled={deletingId === p.id}
                            onClick={() => handleDeleteClick(p)}
                          >
                            {deletingId === p.id ? '...' : '🗑️'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* --- CREATE / EDIT SETTINGS FORM VIEW --- */}
      {(view === 'create' || view === 'edit_settings') && (
        <div className="adm-card" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div className="adm-card-header">
            <div className="adm-card-title">
              {view === 'create' ? '✨ Create Dynamic Custom Page' : `✏️ Edit Settings: ${selectedPage?.title}`}
            </div>
          </div>
          <form onSubmit={view === 'create' ? handleCreateSubmit : handleUpdateSettings} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="adm-filter-label" style={{ display: 'block', marginBottom: '6px' }}>Page Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Developer Docs"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  color: 'var(--foreground)',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label className="adm-filter-label" style={{ display: 'block', marginBottom: '6px' }}>URL Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
                placeholder="e.g. docs (leave blank to auto-generate from title)"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  color: 'var(--foreground)',
                  outline: 'none',
                  fontFamily: 'var(--admin-mono-font)'
                }}
              />
            </div>

            <div>
              <label className="adm-filter-label" style={{ display: 'block', marginBottom: '6px' }}>SEO Description (General)</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="A short description of the page content..."
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  color: 'var(--foreground)',
                  outline: 'none',
                  height: '80px',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
              <h4 style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '12px' }}>🔍 Search Engine Optimization (SEO)</h4>
              
              <div style={{ marginBottom: '12px' }}>
                <label className="adm-filter-label" style={{ display: 'block', marginBottom: '6px' }}>Meta Search Title</label>
                <input
                  type="text"
                  value={form.meta_title}
                  onChange={e => setForm({ ...form, meta_title: e.target.value })}
                  placeholder="e.g. My Custom Page Title | Command Code"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    color: 'var(--foreground)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label className="adm-filter-label" style={{ display: 'block', marginBottom: '6px' }}>Meta Search Description</label>
                <textarea
                  value={form.meta_description}
                  onChange={e => setForm({ ...form, meta_description: e.target.value })}
                  placeholder="Detailed snippet that search engines display under the page title link..."
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    color: 'var(--foreground)',
                    outline: 'none',
                    height: '80px',
                    resize: 'none'
                  }}
                />
              </div>

              <div>
                <label className="adm-filter-label" style={{ display: 'block', marginBottom: '6px' }}>Meta Search Keywords</label>
                <input
                  type="text"
                  value={form.meta_keywords}
                  onChange={e => setForm({ ...form, meta_keywords: e.target.value })}
                  placeholder="e.g. documentation, api setup, codes"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    color: 'var(--foreground)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label className="adm-filter-label" style={{ display: 'block', marginBottom: '6px' }}>Status</label>
              <select
                className="adm-filter-select"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                style={{
                  width: '100%',
                  background: '#09090b',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  color: 'var(--foreground)',
                  outline: 'none'
                }}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Settings'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setView('list')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- EDIT LAYOUT VIEW --- */}
      {view === 'edit_layout' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setView('list')}>
              ← Back to Pages List
            </button>
          </div>
          <PageBuilder
            initialBlocks={selectedPage?.layout ? JSON.parse(selectedPage.layout) : []}
            onSave={handleSaveLayout}
            saving={submitting}
          />
        </div>
      )}
    </AdminShell>
  );
}
