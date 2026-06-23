'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import '@/app/admin/admin.css';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({ title: '', summary: '', content: '', status: 'draft' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadPost();
  }, []);

  async function loadPost() {
    try {
      const res = await fetch(`/api/posts/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          title: data.post.title || '',
          summary: data.post.summary || '',
          content: data.post.content || '',
          status: data.post.status || 'draft'
        });
      } else {
        setError('Post not found');
      }
    } catch {
      setError('Connection to server failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      const res = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/admin/posts');
      } else {
        setError(data.error || 'Failed to update post');
      }
    } catch {
      setError('Server connection failed');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <AdminShell title="Loading post details...">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(139, 92, 246, 0.2)', borderTopColor: 'var(--admin-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Edit Changelog Post">
      {error && (
        <div className="adm-alert adm-alert-error">
          ⚠️ {error}
        </div>
      )}

      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title">✏️ Edit Details</div>
          <Link href="/admin/posts" className="btn btn-secondary btn-sm">Cancel</Link>
        </div>

        <form onSubmit={handleSubmit} className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="adm-form-group">
            <label className="adm-label">Title <span style={{ color: 'var(--admin-danger)' }}>*</span></label>
            <input
              type="text"
              className="adm-input"
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
              value={form.summary}
              onChange={e => setForm({ ...form, summary: e.target.value })}
            />
          </div>

          <div className="adm-form-group">
            <label className="adm-label">Content Body (Markdown / Text)</label>
            <textarea
              className="adm-textarea"
              rows={12}
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
              {form.status === 'published' ? '🚀 Published' : '○ Save as Draft'}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '20px', display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={updating}>
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/admin/posts" className="btn btn-secondary">Back to List</Link>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
