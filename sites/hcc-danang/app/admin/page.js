'use client';
import { useState, useEffect } from 'react';
import AdminShell from '../../components/admin/AdminShell';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);
  const [initMsg, setInitMsg] = useState('');

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setDbReady(true);
      } else {
        setDbReady(false);
      }
    } catch {
      setDbReady(false);
    } finally {
      setLoading(false);
    }
  }

  async function initDb() {
    setInitMsg('Đang khởi tạo...');
    try {
      const res = await fetch('/api/admin/init');
      const data = await res.json();
      if (res.ok) {
        setInitMsg('✅ Khởi tạo thành công! Đang tải lại...');
        setTimeout(() => { loadStats(); setInitMsg(''); }, 1500);
      } else {
        setInitMsg('❌ Lỗi: ' + data.error);
      }
    } catch (err) {
      setInitMsg('❌ Lỗi kết nối: ' + err.message);
    }
  }

  const maxCat = stats?.byCategory?.reduce((m, c) => Math.max(m, c.count), 1) || 1;

  return (
    <AdminShell title="Dashboard">
      {/* DB Init banner */}
      {!dbReady && !loading && (
        <div className="adm-alert adm-alert-info" style={{marginBottom:20}}>
          🗄️ Cơ sở dữ liệu chưa được khởi tạo.
          <button className="btn btn-primary btn-sm" style={{marginLeft:12}} onClick={initDb}>
            Khởi tạo ngay
          </button>
          {initMsg && <span style={{marginLeft:10}}>{initMsg}</span>}
        </div>
      )}
      {initMsg && dbReady && (
        <div className="adm-alert adm-alert-success">{initMsg}</div>
      )}

      {loading ? (
        <div className="stat-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{width:50,height:50,borderRadius:12}} />
              <div style={{flex:1}}>
                <div className="skeleton" style={{width:'60%',height:26,marginBottom:6}} />
                <div className="skeleton" style={{width:'80%',height:14}} />
              </div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Stat cards */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon red">📝</div>
              <div className="stat-body">
                <div className="stat-value">{stats.posts.total}</div>
                <div className="stat-label">Tổng bài viết</div>
                <div className="stat-sub">{stats.posts.published} đã đăng · {stats.posts.draft} nháp</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue">👁️</div>
              <div className="stat-body">
                <div className="stat-value">{(stats.posts.totalViews||0).toLocaleString('vi-VN')}</div>
                <div className="stat-label">Lượt xem</div>
                <div className="stat-sub">Tổng tất cả bài viết</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">👥</div>
              <div className="stat-body">
                <div className="stat-value">{stats.members.total}</div>
                <div className="stat-label">Thành viên</div>
                <div className="stat-sub">{stats.members.admins} admin · {stats.members.mods} mod</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon yellow">📋</div>
              <div className="stat-body">
                <div className="stat-value">{stats.polls.total}</div>
                <div className="stat-label">Thăm dò ý kiến</div>
                <div className="stat-sub">{stats.polls.active} đang hoạt động</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">🔔</div>
              <div className="stat-body">
                <div className="stat-value">{stats.notifications.total}</div>
                <div className="stat-label">Thông báo</div>
                <div className="stat-sub">{stats.notifications.active} đang hiển thị</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">📁</div>
              <div className="stat-body">
                <div className="stat-value">{stats.files.total}</div>
                <div className="stat-label">File tải lên</div>
                <div className="stat-sub">{stats.categories.total} danh mục</div>
              </div>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            {/* Bài viết theo danh mục */}
            <div className="adm-card">
              <div className="adm-card-header">
                <div className="adm-card-title">📊 Bài viết theo danh mục</div>
              </div>
              <div className="adm-card-body">
                {stats.byCategory.length === 0 ? (
                  <div className="adm-empty"><div className="adm-empty-text">Chưa có dữ liệu</div></div>
                ) : (
                  <div className="css-chart">
                    {stats.byCategory.map((cat) => (
                      <div key={cat.name} className="chart-row">
                        <div className="chart-label" title={cat.name}>{cat.name}</div>
                        <div className="chart-bar-wrap">
                          <div className="chart-bar" style={{width: `${Math.round(cat.count / maxCat * 100)}%`}} />
                        </div>
                        <div className="chart-count">{cat.count}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bài viết gần đây */}
            <div className="adm-card">
              <div className="adm-card-header">
                <div className="adm-card-title">🕐 Bài viết mới nhất</div>
                <a href="/admin/posts" className="btn btn-secondary btn-sm">Xem tất cả</a>
              </div>
              <div className="adm-card-body" style={{padding:0}}>
                {stats.recentPosts.length === 0 ? (
                  <div className="adm-empty"><div className="adm-empty-text">Chưa có bài viết</div></div>
                ) : (
                  <ul style={{listStyle:'none'}}>
                    {stats.recentPosts.map((p, i) => (
                      <li key={p.id} style={{
                        padding:'13px 22px',
                        borderBottom: i < stats.recentPosts.length - 1 ? '1px solid #f1f5f9' : 'none',
                        display:'flex', alignItems:'center', gap:12
                      }}>
                        <div style={{flex:1,overflow:'hidden'}}>
                          <div style={{fontWeight:600,fontSize:13,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:'#1f2937'}}>
                            {p.title}
                          </div>
                          <div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>
                            {new Date(p.created_at).toLocaleDateString('vi-VN')} · {p.views} lượt xem
                          </div>
                        </div>
                        <span className={`badge ${p.status === 'published' ? 'badge-green' : 'badge-yellow'}`}>
                          {p.status === 'published' ? 'Đã đăng' : 'Nháp'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="adm-card" style={{marginTop:0}}>
            <div className="adm-card-header">
              <div className="adm-card-title">⚡ Thao tác nhanh</div>
            </div>
            <div className="adm-card-body">
              <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                <a href="/admin/posts/new" className="btn btn-primary">📝 Viết bài mới</a>
                <a href="/admin/notifications" className="btn btn-secondary">🔔 Thêm thông báo</a>
                <a href="/admin/polls" className="btn btn-secondary">📋 Tạo thăm dò</a>
                <a href="/admin/members" className="btn btn-secondary">👤 Thêm thành viên</a>
                <a href="/admin/files" className="btn btn-secondary">📁 Upload file</a>
                <button className="btn btn-secondary" onClick={initDb}>🔄 Seed dữ liệu mẫu</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="adm-card">
          <div className="adm-card-body">
            <div className="adm-empty">
              <div className="adm-empty-icon">🗄️</div>
              <div className="adm-empty-text">Không thể kết nối cơ sở dữ liệu</div>
              <div className="adm-empty-sub">Vui lòng kiểm tra kết nối MySQL hoặc khởi tạo DB</div>
              <button className="btn btn-primary" style={{marginTop:16}} onClick={initDb}>
                Khởi tạo Database
              </button>
              {initMsg && <div style={{marginTop:10,fontSize:13}}>{initMsg}</div>}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
