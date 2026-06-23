'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { categories } from '../../data/news';

export default function NewsPage() {
  const [activeCat, setActiveCat] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts?status=published')
      .then(res => res.json())
      .then(data => {
        if (data.posts) setPosts(data.posts);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching news:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ padding: '80px 20px', textAlign: 'center', fontSize: '1.2rem', color: '#666' }}>
          Đang tải danh sách bài viết...
        </div>
      </div>
    );
  }

  const allNews = posts;
  const filtered = activeCat === 'all'
    ? allNews
    : allNews.filter(n => n.category_id === activeCat);

  // Sidebar: recent + schedule
  const recent = allNews.slice(0, 5);
  const schedule = allNews.filter(n => n.category_id === 'lich-lam-viec').slice(0, 3);

  return (
    <div className="page-container">
      <div className="page-layout">
        {/* ─── MAIN ─── */}
        <main className="page-main">
          {/* Breadcrumb */}
          <nav className="breadcrumb-bar" aria-label="Breadcrumb">
            <Link href="/">Trang nhất</Link>
            <span>›</span>
            <span>Tin Tức - Sự kiện</span>
          </nav>

          {/* Heading */}
          <div className="nl-header">
            <h1 className="nl-title">TIN TỨC - SỰ KIỆN</h1>
            <span className="nl-count">{filtered.length} bài viết</span>
          </div>

          {/* Category filter pills */}
          <div className="cat-filter">
            <button
              className={`cat-pill ${activeCat === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCat('all')}
            >Tất cả</button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`cat-pill ${activeCat === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCat(cat.id)}
              >{cat.name}</button>
            ))}
          </div>

          {/* News list */}
          {filtered.length === 0 ? (
            <div className="nl-empty">Chưa có bài viết trong chuyên mục này.</div>
          ) : (
            <div className="nl-list">
              {filtered.map((item, i) => (
                <article key={item.id} className={`nl-card ${i === 0 && activeCat === 'all' ? 'nl-card--featured' : ''}`}>
                  <Link href={`/news/${item.slug}`} className="nl-card-img-link">
                    <div className="nl-card-img">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          onError={(e) => { e.target.outerHTML = '<div class="news-list-placeholder">📰</div>'; }}
                        />
                      ) : (
                        <div className="news-list-placeholder">📰</div>
                      )}
                      {item.featured && <span className="nl-badge">Nổi bật</span>}
                    </div>
                  </Link>
                  <div className="nl-card-body">
                    <div className="nl-card-meta">
                      <span className="nl-cat-tag">{item.category_name}</span>
                      <span className="nl-date">📅 {item.date_display}</span>
                      {item.views && <span className="nl-views">👁 {item.views.toLocaleString()}</span>}
                    </div>
                    <Link href={`/news/${item.slug}`} className="nl-card-title">
                      {item.title}
                    </Link>
                    <p className="nl-card-summary">{item.summary}</p>
                    <Link href={`/news/${item.slug}`} className="nl-read-more">
                      Xem chi tiết <span>→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        {/* ─── SIDEBAR ─── */}
        <aside className="page-sidebar">
          {/* Search */}
          <div className="search-wrap" style={{ marginBottom: 20 }}>
            <input type="text" placeholder="Tìm kiếm tin tức..." className="search-input" />
            <button className="search-btn">Tìm</button>
          </div>

          {/* Categories */}
          <div className="sidebar-widget">
            <div className="sidebar-widget-header"><span>CHUYÊN MỤC</span></div>
            <div className="sidebar-widget-body" style={{ padding: 0 }}>
              <button
                onClick={() => setActiveCat('all')}
                className={`sidebar-cat-btn ${activeCat === 'all' ? 'active' : ''}`}
              >
                <span>Tất cả tin tức</span>
                <span className="sidebar-cat-count">{allNews.length}</span>
              </button>
              {categories.map(cat => {
                const count = allNews.filter(n => n.category_id === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCat(cat.id)}
                    className={`sidebar-cat-btn ${activeCat === cat.id ? 'active' : ''}`}
                  >
                    <span>{cat.name}</span>
                    <span className="sidebar-cat-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent news */}
          <div className="sidebar-widget" style={{ marginTop: 16 }}>
            <div className="sidebar-widget-header"><span>TIN MỚI NHẤT</span></div>
            <div className="sidebar-widget-body" style={{ padding: '10px 14px' }}>
              {recent.map(item => (
                <Link key={item.id} href={`/news/${item.slug}`} className="sidebar-news-link">
                  {item.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Schedule */}
          {schedule.length > 0 && (
            <div className="sidebar-widget" style={{ marginTop: 16 }}>
              <div className="sidebar-widget-header"><span>LỊCH LÀM VIỆC</span></div>
              <div className="sidebar-widget-body" style={{ padding: '10px 14px' }}>
                {schedule.map(item => (
                  <Link key={item.id} href={`/news/${item.slug}`} className="sidebar-news-link">
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="sidebar-widget" style={{ marginTop: 16 }}>
            <div className="sidebar-widget-header"><span>THỐNG KÊ TRUY CẬP</span></div>
            <div className="sidebar-widget-body">
              <div className="stat-row"><span>Hôm nay</span><span className="stat-num">3,293</span></div>
              <div className="stat-row"><span>Tháng này</span><span className="stat-num">28,541</span></div>
              <div className="stat-row"><span>Tổng lượt truy cập</span><span className="stat-num">1,067,367</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
