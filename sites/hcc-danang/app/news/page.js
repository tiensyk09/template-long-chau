import Link from 'next/link';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Generate server-side metadata dynamically based on active category
export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const cat = params.cat || 'all';

  const defaults = {
    catalogue_seo_title: 'Tin tức & Sự kiện | Trường Tiểu học Ngô Quyền',
    catalogue_seo_description: 'Cập nhật tin tức mới nhất, thông báo hoạt động dạy và học, phong trào Đoàn Đội của Trường Tiểu học Ngô Quyền',
  };

  let title = defaults.catalogue_seo_title;
  let description = defaults.catalogue_seo_description;

  try {
    const settings = await query('SELECT * FROM settings');
    const config = {};
    settings.forEach(r => {
      config[r.key] = r.value || '';
    });

    if (cat === 'all') {
      title = config.catalogue_seo_title || title;
      description = config.catalogue_seo_description || description;
    } else {
      const keyTitle = `seo_category_title_${cat}`;
      const keyDesc = `seo_category_desc_${cat}`;
      if (config[keyTitle]) {
        title = config[keyTitle];
      } else {
        const cats = await query('SELECT name FROM categories WHERE id = ?', [cat]);
        if (cats.length > 0) {
          title = `${cats[0].name} | Trường Tiểu học Ngô Quyền`;
        }
      }
      if (config[keyDesc]) {
        description = config[keyDesc];
      }
    }
  } catch (err) {
    console.error('generateMetadata error:', err.message);
  }

  return {
    title,
    description
  };
}

export default async function NewsPage({ searchParams }) {
  const params = await searchParams;
  const activeCat = params.cat || 'all';

  // Fetch data directly on the server side
  const posts = await query('SELECT * FROM posts WHERE status = "published" ORDER BY created_at DESC');
  const categories = await query('SELECT * FROM categories WHERE active = 1 ORDER BY sort_order ASC');

  const filtered = activeCat === 'all'
    ? posts
    : posts.filter(n => n.category_id === activeCat);

  // Sidebar widgets data
  const recent = posts.slice(0, 5);
  const schedule = posts.filter(n => n.category_id === 'lich-lam-viec').slice(0, 3);

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

          {/* Category filter pills using standard server Links */}
          <div className="cat-filter">
            <Link
              href="/news"
              className={`cat-pill ${activeCat === 'all' ? 'active' : ''}`}
            >Tất cả</Link>
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/news?cat=${cat.id}`}
                className={`cat-pill ${activeCat === cat.id ? 'active' : ''}`}
              >{cat.name}</Link>
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
                        />
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
          {/* Search widget */}
          <div className="search-wrap" style={{ marginBottom: 20 }}>
            <input type="text" placeholder="Tìm kiếm tin tức..." className="search-input" />
            <button className="search-btn">Tìm</button>
          </div>

          {/* Categories widget using Server Links */}
          <div className="sidebar-widget">
            <div className="sidebar-widget-header"><span>CHUYÊN MỤC</span></div>
            <div className="sidebar-widget-body" style={{ padding: 0 }}>
              <Link
                href="/news"
                className={`sidebar-cat-btn ${activeCat === 'all' ? 'active' : ''}`}
              >
                <span>Tất cả tin tức</span>
                <span className="sidebar-cat-count">{posts.length}</span>
              </Link>
              {categories.map(cat => {
                const count = posts.filter(n => n.category_id === cat.id).length;
                return (
                  <Link
                    key={cat.id}
                    href={`/news?cat=${cat.id}`}
                    className={`sidebar-cat-btn ${activeCat === cat.id ? 'active' : ''}`}
                  >
                    <span>{cat.name}</span>
                    <span className="sidebar-cat-count">{count}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent news widget */}
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

          {/* Schedule widget */}
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

          {/* Stats widget */}
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
