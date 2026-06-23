'use client';
import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import '@/app/admin/admin.css';

export default function SettingsDashboard() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  // Form states
  const [seo, setSeo] = useState({
    site_title: '',
    site_description: '',
    site_keywords: ''
  });

  const [header, setHeader] = useState({
    logoText: 'DAILY KOREAN NEWS',
    logoIcon: '📰',
    links: []
  });

  const [footer, setFooter] = useState({
    copyright: '',
    columns: []
  });

  // Active settings tab: 'seo' | 'header' | 'footer'
  const [activeTab, setActiveTab] = useState('seo');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        const s = data.settings || {};

        setSeo({
          site_title: s.site_title || '',
          site_description: s.site_description || '',
          site_keywords: s.site_keywords || ''
        });

        let parsedLinks = [];
        try {
          if (s.header_links) parsedLinks = JSON.parse(s.header_links);
        } catch {}

        setHeader({
          logoText: s.header_logo_text || 'DAILY KOREAN NEWS',
          logoIcon: s.header_logo_icon || '📰',
          links: parsedLinks
        });

        let parsedCols = [];
        try {
          if (s.footer_columns) parsedCols = JSON.parse(s.footer_columns);
        } catch {}

        setFooter({
          copyright: s.footer_copyright || '',
          columns: parsedCols
        });
      } else {
        setMsg({ type: 'error', text: 'Failed to load system settings' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Network connection failed' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    const payload = {
      site_title: seo.site_title,
      site_description: seo.site_description,
      site_keywords: seo.site_keywords,
      header_logo_text: header.logoText,
      header_logo_icon: header.logoIcon,
      header_links: JSON.stringify(header.links),
      footer_copyright: footer.copyright,
      footer_columns: JSON.stringify(footer.columns)
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Global configuration settings saved successfully' });
      } else {
        const data = await res.json();
        setMsg({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Network connection failed' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMsg(null), 4000);
    }
  }

  // Header Links Helpers
  const addHeaderLink = () => {
    setHeader(prev => ({
      ...prev,
      links: [...prev.links, { label: 'New Link', href: '#' }]
    }));
  };

  const updateHeaderLink = (index, key, val) => {
    const updated = [...header.links];
    updated[index][key] = val;
    setHeader(prev => ({ ...prev, links: updated }));
  };

  const removeHeaderLink = (index) => {
    setHeader(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const moveHeaderLink = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= header.links.length) return;
    const updated = [...header.links];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    setHeader(prev => ({ ...prev, links: updated }));
  };

  // Footer Columns Helpers
  const addFooterCol = () => {
    setFooter(prev => ({
      ...prev,
      columns: [...prev.columns, { title: 'Product', links: [] }]
    }));
  };

  const updateFooterColTitle = (colIndex, title) => {
    const updated = [...footer.columns];
    updated[colIndex].title = title;
    setFooter(prev => ({ ...prev, columns: updated }));
  };

  const removeFooterCol = (colIndex) => {
    if (!confirm('Are you sure you want to delete this footer column?')) return;
    setFooter(prev => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== colIndex)
    }));
  };

  const addFooterColLink = (colIndex) => {
    const updated = [...footer.columns];
    if (!updated[colIndex].links) updated[colIndex].links = [];
    updated[colIndex].links.push({ label: 'New Link', href: '#' });
    setFooter(prev => ({ ...prev, columns: updated }));
  };

  const updateFooterColLink = (colIndex, linkIndex, key, val) => {
    const updated = [...footer.columns];
    updated[colIndex].links[linkIndex][key] = val;
    setFooter(prev => ({ ...prev, columns: updated }));
  };

  const removeFooterColLink = (colIndex, linkIndex) => {
    const updated = [...footer.columns];
    updated[colIndex].links = updated[colIndex].links.filter((_, i) => i !== linkIndex);
    setFooter(prev => ({ ...prev, columns: updated }));
  };

  return (
    <AdminShell title="⚙️ Global Site Configuration">
      {msg && (
        <div className={`adm-alert adm-alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '20px' }}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="adm-card" style={{ padding: 40, textAlign: 'center', color: 'var(--admin-muted)' }}>
          Loading system settings...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Tab Navigation Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('seo')}
              className="btn btn-secondary"
              style={{
                textAlign: 'left',
                justifyContent: 'flex-start',
                backgroundColor: activeTab === 'seo' ? 'var(--admin-primary)' : 'rgba(255,255,255,0.02)',
                color: activeTab === 'seo' ? '#fff' : 'var(--admin-muted)',
                borderColor: activeTab === 'seo' ? 'var(--admin-primary)' : 'var(--admin-border)'
              }}
            >
              🔍 Global SEO Setup
            </button>
            <button
              onClick={() => setActiveTab('header')}
              className="btn btn-secondary"
              style={{
                textAlign: 'left',
                justifyContent: 'flex-start',
                backgroundColor: activeTab === 'header' ? 'var(--admin-primary)' : 'rgba(255,255,255,0.02)',
                color: activeTab === 'header' ? '#fff' : 'var(--admin-muted)',
                borderColor: activeTab === 'header' ? 'var(--admin-primary)' : 'var(--admin-border)'
              }}
            >
              ⚡ Navigation Header
            </button>
            <button
              onClick={() => setActiveTab('footer')}
              className="btn btn-secondary"
              style={{
                textAlign: 'left',
                justifyContent: 'flex-start',
                backgroundColor: activeTab === 'footer' ? 'var(--admin-primary)' : 'rgba(255,255,255,0.02)',
                color: activeTab === 'footer' ? '#fff' : 'var(--admin-muted)',
                borderColor: activeTab === 'footer' ? 'var(--admin-primary)' : 'var(--admin-border)'
              }}
            >
              🏢 Footer Configuration
            </button>

            <button
              onClick={handleSaveSettings}
              disabled={submitting}
              className="btn btn-primary"
              style={{ marginTop: '24px', padding: '12px' }}
            >
              {submitting ? 'Saving...' : '💾 Save Settings'}
            </button>
          </div>

          {/* Configuration Form Card */}
          <div className="adm-card" style={{ marginBottom: 0 }}>
            
            {/* --- TAB: GLOBAL SEO --- */}
            {activeTab === 'seo' && (
              <div>
                <div className="adm-card-header">
                  <div className="adm-card-title">🔍 Global Site Information & SEO</div>
                </div>
                <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="adm-form-group">
                    <label className="adm-label">Global Meta Title</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={seo.site_title}
                      onChange={e => setSeo({ ...seo, site_title: e.target.value })}
                      placeholder="e.g. DAILY KOREAN NEWS"
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Global Meta Description</label>
                    <textarea
                      className="adm-textarea"
                      rows={4}
                      value={seo.site_description}
                      onChange={e => setSeo({ ...seo, site_description: e.target.value })}
                      placeholder="A short fallback description for pages lacking custom SEO tags..."
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Global Meta Keywords</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={seo.site_keywords}
                      onChange={e => setSeo({ ...seo, site_keywords: e.target.value })}
                      placeholder="e.g. daily korean news, news, report"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB: HEADER --- */}
            {activeTab === 'header' && (
              <div>
                <div className="adm-card-header">
                  <div className="adm-card-title">⚡ Navigation Header Settings</div>
                </div>
                <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="adm-form-group">
                      <label className="adm-label">Navbar Logo Text</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={header.logoText}
                        onChange={e => setHeader({ ...header, logoText: e.target.value })}
                      />
                    </div>
                    <div className="adm-form-group">
                      <label className="adm-label">Navbar Logo Icon (Unicode Emoji)</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={header.logoIcon}
                        onChange={e => setHeader({ ...header, logoIcon: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <label className="adm-label" style={{ marginBottom: 0 }}>Custom Navigation Links</label>
                      <button type="button" onClick={addHeaderLink} className="btn btn-secondary btn-sm">
                        + Add Custom Link
                      </button>
                    </div>

                    {header.links.length === 0 ? (
                      <div style={{ color: 'var(--admin-muted)', fontSize: '13px', textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', border: '1px dashed var(--admin-border)' }}>
                        No custom navbar links configured (only dynamic custom pages will display).
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {header.links.map((link, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                              type="text"
                              className="adm-input"
                              style={{ flex: 2 }}
                              placeholder="Link Text (e.g. Docs)"
                              value={link.label}
                              onChange={e => updateHeaderLink(idx, 'label', e.target.value)}
                            />
                            <input
                              type="text"
                              className="adm-input"
                              style={{ flex: 3 }}
                              placeholder="Href URL (e.g. /#pricing)"
                              value={link.href}
                              onChange={e => updateHeaderLink(idx, 'href', e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm btn-icon"
                                disabled={idx === 0}
                                onClick={() => moveHeaderLink(idx, -1)}
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm btn-icon"
                                disabled={idx === header.links.length - 1}
                                onClick={() => moveHeaderLink(idx, 1)}
                              >
                                ▼
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm btn-icon"
                                onClick={() => removeHeaderLink(idx)}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB: FOOTER --- */}
            {activeTab === 'footer' && (
              <div>
                <div className="adm-card-header">
                  <div className="adm-card-title">🏢 Global Footer Setup</div>
                </div>
                <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="adm-form-group">
                    <label className="adm-label">Copyright Notice Text</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={footer.copyright}
                      onChange={e => setFooter({ ...footer, copyright: e.target.value })}
                      placeholder="e.g. © 2026 DAILY KOREAN NEWS. All rights reserved."
                    />
                  </div>

                  <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <label className="adm-label" style={{ marginBottom: 0 }}>Footer Link Columns</label>
                      <button type="button" onClick={addFooterCol} className="btn btn-secondary btn-sm">
                        + Add New Column
                      </button>
                    </div>

                    {footer.columns.length === 0 ? (
                      <div style={{ color: 'var(--admin-muted)', fontSize: '13px', textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', border: '1px dashed var(--admin-border)' }}>
                        No footer link columns created.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {footer.columns.map((col, colIdx) => (
                          <div
                            key={colIdx}
                            style={{
                              border: '1px solid var(--admin-border)',
                              borderRadius: '8px',
                              padding: '16px',
                              backgroundColor: 'rgba(255,255,255,0.01)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                              <input
                                type="text"
                                className="adm-input"
                                style={{ fontWeight: '600', maxWidth: '300px' }}
                                placeholder="Column Title (e.g. Products)"
                                value={col.title}
                                onChange={e => updateFooterColTitle(colIdx, e.target.value)}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => removeFooterCol(colIdx)}
                              >
                                🗑️ Delete Column
                              </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '12px' }}>
                              {col.links?.map((link, linkIdx) => (
                                <div key={linkIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                  <input
                                    type="text"
                                    className="adm-input adm-input-sm"
                                    style={{ flex: 2 }}
                                    placeholder="Label"
                                    value={link.label}
                                    onChange={e => updateFooterColLink(colIdx, linkIdx, 'label', e.target.value)}
                                  />
                                  <input
                                    type="text"
                                    className="adm-input adm-input-sm"
                                    style={{ flex: 3 }}
                                    placeholder="Href URL"
                                    value={link.href}
                                    onChange={e => updateFooterColLink(colIdx, linkIdx, 'href', e.target.value)}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm btn-icon"
                                    style={{ padding: '4px 8px' }}
                                    onClick={() => removeFooterColLink(colIdx, linkIdx)}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}

                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ alignSelf: 'flex-start', marginTop: '6px', fontSize: '11px', padding: '4px 10px' }}
                                onClick={() => addFooterColLink(colIdx)}
                              >
                                + Add link item
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}
    </AdminShell>
  );
}
