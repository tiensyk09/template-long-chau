'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import '@/app/admin/admin.css';

export default function NewPostPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', summary: '', content: '', status: 'draft' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/admin/posts');
      } else {
        setError(data.error || 'Failed to create changelog');
      }
    } catch {
      setError('Server connection failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell title="Create New Changelog">
      {error && (
        <div className="adm-alert adm-alert-error">
          ⚠️ {error}
        </div>
      )}

      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title">📝 Changelog Details</div>
          <Link href="/admin/posts" className="btn btn-secondary btn-sm">Cancel</Link>
        </div>

        <form onSubmit={handleSubmit} className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="adm-form-group">
            <label className="adm-label">Title <span style={{ color: 'var(--admin-danger)' }}>*</span></label>
            <input
              type="text"
              className="adm-input"
              placeholder="e.g. Command Code v2.0 - Learning Taste-1"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="adm-form-group">
            <label className="adm-label">Short Summary</label>
            <input
              type="text"
              className="adm-input"
              placeholder="A brief 1-sentence summary of this changelog update..."
              value={form.summary}
              onChange={e => setForm({ ...form, summary: e.target.value })}
            />
          </div>

          <div className="adm-form-group">
            <label className="adm-label">Content Body (Markdown / Text)</label>
            <textarea
              className="adm-textarea"
              rows={12}
              placeholder="Write the details of the update. Markdown is supported..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
            />
          </div>

          <div className="adm-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={form.status === 'published'}
                onChange={e => setForm({ ...form, status: e.target.checked ? 'published' : 'draft' })}
              />
              <span className="toggle-slider" />
            </label>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              {form.status === 'published' ? '🚀 Publish Immediately' : '○ Save as Draft'}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '20px', display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Changelog'}
            </button>
            <Link href="/admin/posts" className="btn btn-secondary">Back to List</Link>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
