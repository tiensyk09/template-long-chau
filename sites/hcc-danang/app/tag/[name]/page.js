import Link from 'next/link';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { name } = await params;
  const decodedTagName = decodeURIComponent(name);
  let title = `Thẻ: ${decodedTagName} | Cổng thông tin điện tử`;
  let description = `Các bài viết được gắn thẻ ${decodedTagName}`;

  try {
    const settings = await query('SELECT * FROM settings');
    const config = {};
    settings.forEach(r => {
      config[r.key] = r.value || '';
    });
    const siteTitle = config.homepage_seo_title || 'Cổng thông tin';
    title = `Thẻ: ${decodedTagName} | ${siteTitle}`;
  } catch (err) {
    console.error('generateMetadata error:', err.message);
  }

  return { title, description };
}

export default async function TagPage({ params }) {
  const { name } = await params;
  const decodedTagName = decodeURIComponent(name);

  // Fetch published posts containing this tag (using SQLite LIKE)
  const posts = await query(
    'SELECT * FROM posts WHERE status = "published" AND (tags LIKE ? OR tags LIKE ? OR tags = ?) ORDER BY created_at DESC',
    [`%,${decodedTagName},%`, `${decodedTagName},%`, decodedTagName]
  );
  
  let matchedPosts = posts;
  if (posts.length === 0) {
    matchedPosts = await query(
      'SELECT * FROM posts WHERE status = "published" AND tags LIKE ? ORDER BY created_at DESC',
      [`%${decodedTagName}%`]
    );
  }

  const allPosts = await query('SELECT * FROM posts WHERE status = "published" ORDER BY created_at DESC');
  const categories = await query('SELECT * FROM categories ORDER BY sort_order ASC');
  const recent = allPosts.slice(0, 5);

  return (
    <div className="page-container">
      <div className="page-layout">
        <main className="page-main">
          <nav className="breadcrumb-bar" aria-label="Breadcrumb">
            <Link href="/">Trang nhất</Link>
            <span>›</span>
            <Link href="/news">Tin Tức</Link>
            <span>›</span>
            <span>Thẻ</span>
            <span>›</span>
            <span>{decodedTagName}</span>
          </nav>

          <div className="nl-header">
            <h1 className="nl-title">THẺ: {decodedTagName.toUpperCase()}</h1>
            <span className="nl-count">{matchedPosts.length} bài viết</span>
          </div>

          {matchedPosts.length === 0 ? (
            <div className="nl-empty">Chưa có bài viết nào được gắn thẻ này.</div>
          ) : (
            <div className="nl-list">
              {matchedPosts.map((item) => (
                <article key={item.id} className="nl-card">
                  <Link href={`/news/${item.slug}`} className="nl-card-img-link">
                    <div className="nl-card-img">
                      {item.image ? (
                        <img src={item.image} alt={item.title} loading="lazy" />
                      ) : (
                        <div className="news-list-placeholder">📰</div>
                      )}
                      {item.featured ? <span className="nl-badge">Nổi bật</span> : null}
                    </div>
                  </Link>
                  <div className="nl-card-body">
                    <div className="nl-card-meta">
                      <span className="nl-cat-tag">{item.category_name}</span>
                      <span className="nl-date">📅 {item.date_display}</span>
                      {item.views !== undefined && <span className="nl-views">👁 {item.views.toLocaleString()}</span>}
                    </div>
                    <Link href={`/news/${item.slug}`} className="nl-card-title">{item.title}</Link>
                    <p className="nl-card-summary">{item.summary}</p>
                    <Link href={`/news/${item.slug}`} className="nl-read-more">Xem chi tiết <span>→</span></Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        <aside className="page-sidebar">
          <div className="sidebar-widget">
            <div className="sidebar-widget-header"><span>CHUYÊN MỤC</span></div>
            <div className="sidebar-widget-body" style={{ padding: 0 }}>
              <Link href="/news" className="sidebar-cat-btn">
                <span>Tất cả tin tức</span>
                <span className="sidebar-cat-count">{allPosts.length}</span>
              </Link>
              {categories.map(cat => {
                const count = allPosts.filter(n => n.category_id === cat.id).length;
                return (
                  <Link key={cat.id} href={`/category/${cat.id}`} className="sidebar-cat-btn">
                    <span>{cat.name}</span>
                    <span className="sidebar-cat-count">{count}</span>
                  </Link>
                );
              })}
            </div>
          </div>

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
        </aside>
      </div>
    </div>
  );
}
