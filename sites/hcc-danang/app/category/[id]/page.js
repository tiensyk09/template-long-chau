import Link from 'next/link';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  let title = 'Chuyên mục | Cổng thông tin điện tử';
  let description = 'Cập nhật tin tức mới nhất theo chuyên mục';

  try {
    const settings = await query('SELECT * FROM settings');
    const config = {};
    settings.forEach(r => {
      config[r.key] = r.value || '';
    });

    const cats = await query('SELECT name FROM categories WHERE id = ?', [id]);
    if (cats.length > 0) {
      const siteTitle = config.homepage_seo_title || 'Cổng thông tin';
      title = `${cats[0].name} | ${siteTitle}`;
    }
  } catch (err) {
    console.error('generateMetadata error:', err.message);
  }

  return { title, description };
}

export default async function CategoryPage({ params }) {
  const { id } = await params;

  const categoryResult = await query('SELECT * FROM categories WHERE id = ?', [id]);
  const categoryName = categoryResult.length > 0 ? categoryResult[0].name : 'Chuyên mục';

  const posts = await query('SELECT * FROM posts WHERE status = "published" AND category_id = ? ORDER BY created_at DESC', [id]);
  const categories = await query('SELECT * FROM categories ORDER BY sort_order ASC');
  const allPosts = await query('SELECT * FROM posts WHERE status = "published" ORDER BY created_at DESC');

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
            <span>{categoryName}</span>
          </nav>

          <div className="nl-header">
            <h1 className="nl-title">CHUYÊN MỤC: {categoryName.toUpperCase()}</h1>
            <span className="nl-count">{posts.length} bài viết</span>
          </div>

          {posts.length === 0 ? (
            <div className="nl-empty">Chưa có bài viết trong chuyên mục này.</div>
          ) : (
            <div className="nl-list">
              {posts.map((item) => (
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
                  <Link
                    key={cat.id}
                    href={`/category/${cat.id}`}
                    className={`sidebar-cat-btn ${id === cat.id ? 'active' : ''}`}
                  >
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
