'use client';
import { useState, useEffect, useCallback } from 'react';
import AdminShell from '../../../components/admin/AdminShell';
import Link from 'next/link';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [categories, setCategories] = useState([]);
  const [deleting, setDeleting] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    loadPosts();
    loadCats();
  }, []);

  async function loadPosts() {
    setLoading(true);
    const res = await fetch('/api/posts');
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts);
    }
    setLoading(false);
  }

  async function loadCats() {
    const res = await fetch('/api/categories');
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories);
    }
  }

  async function toggleStatus(post) {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({...post, status: newStatus}),
    });
    loadPosts();
  }

  async function toggleFeatured(post) {
    await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({...post, featured: !post.featured}),
    });
    loadPosts();
  }

  async function deletePost(id) {
    if (!confirm('Xác nhận xóa bài viết này?')) return;
    setDeleting(id);
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMsg({type:'success', text:'Đã xóa bài viết'});
      loadPosts();
    } else {
      setMsg({type:'error', text:'Không có quyền xóa'});
    }
    setDeleting(null);
    setTimeout(() => setMsg(null), 3000);
  }

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.category_id === filterCat;
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <AdminShell title="Quản lý Bài viết">
      {msg && (
        <div className={`adm-alert adm-alert-${msg.type === 'success' ? 'success' : 'error'}`}>
          {msg.text}
        </div>
      )}

      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-card-title">📝 Danh sách bài viết ({filtered.length})</div>
          <Link href="/admin/posts/new" className="btn btn-primary btn-sm">+ Viết bài mới</Link>
        </div>

        {/* Toolbar */}
        <div style={{padding:'14px 22px', borderBottom:'1px solid var(--adm-border)'}}>
          <div className="adm-toolbar">
            <div className="adm-search-wrap">
              <span className="adm-search-icon">🔍</span>
              <input
                type="text" placeholder="Tìm kiếm bài viết..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="adm-filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">Tất cả danh mục</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="adm-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="published">Đã đăng</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="adm-table-wrap">
          {loading ? (
            <div style={{padding:40,textAlign:'center',color:'#9ca3af'}}>Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="adm-empty">
              <div className="adm-empty-icon">📄</div>
              <div className="adm-empty-text">Không có bài viết nào</div>
              <Link href="/admin/posts/new" className="btn btn-primary" style={{marginTop:16}}>Viết bài đầu tiên</Link>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Danh mục</th>
                  <th>Trạng thái</th>
                  <th>Nổi bật</th>
                  <th>Lượt xem</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(post => (
                  <tr key={post.id}>
                    <td className="title-cell">
                      <Link href={`/admin/posts/${post.id}`}>{post.title}</Link>
                      <div className="sub">{post.author}</div>
                    </td>
                    <td>
                      <span className="badge badge-blue" style={{fontSize:11}}>
                        {post.category_name || '—'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`badge ${post.status === 'published' ? 'badge-green' : 'badge-yellow'}`}
                        style={{cursor:'pointer',border:'none',fontFamily:'inherit'}}
                        onClick={() => toggleStatus(post)}
                        title="Click để đổi trạng thái"
                      >
                        {post.status === 'published' ? '✓ Đã đăng' : '○ Nháp'}
                      </button>
                    </td>
                    <td>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={!!post.featured} onChange={() => toggleFeatured(post)} />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td style={{fontWeight:600}}>{(post.views||0).toLocaleString('vi-VN')}</td>
                    <td style={{color:'#6b7280',fontSize:12}}>
                      {post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <Link href={`/admin/posts/${post.id}`} className="btn btn-secondary btn-sm btn-icon" title="Sửa">✏️</Link>
                        <a href={`/news/${post.slug}`} target="_blank" className="btn btn-secondary btn-sm btn-icon" title="Xem">👁️</a>
                        <button
                          className="btn btn-danger btn-sm btn-icon"
                          title="Xóa"
                          disabled={deleting === post.id}
                          onClick={() => deletePost(post.id)}
                        >
                          {deleting === post.id ? '...' : '🗑️'}
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
    </AdminShell>
  );
}
