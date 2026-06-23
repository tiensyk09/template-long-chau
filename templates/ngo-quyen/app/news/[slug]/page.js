import Link from 'next/link';
import { query } from '../../../lib/db';
import { notFound } from 'next/navigation';
import ArticleActions from '../../../components/ArticleActions';
import ImageGridLightbox from '../../../components/ImageGridLightbox';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const articles = await query('SELECT * FROM posts WHERE slug = ? AND status = "published"', [slug]);
  const article = articles[0];
  if (!article) return { title: 'Bài viết không tồn tại' };

  const finalTitle = article.seo_title || article.title;
  const finalDesc = article.seo_description || article.summary || '';

  return {
    title: `${finalTitle} | Trường Tiểu học Ngô Quyền`,
    description: finalDesc,
    openGraph: {
      title: finalTitle,
      description: finalDesc,
      images: article.image ? [article.image] : [],
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const articles = await query('SELECT * FROM posts WHERE slug = ? AND status = "published"', [slug]);
  const article = articles[0];
  if (!article) notFound();

  const attachments = await query(
    'SELECT * FROM post_attachments WHERE post_id = ? ORDER BY id DESC',
    [article.id]
  );

  const imageAttachments = attachments.filter(a => a.file_type === 'image');
  const docAttachments = attachments.filter(a => a.file_type !== 'image');

  // Related: same category first, then latest
  const related = await query(
    `SELECT * FROM posts 
     WHERE status = 'published' AND id != ? 
     ORDER BY (category_id = ?) DESC, created_at DESC 
     LIMIT 4`,
    [article.id, article.category_id || '']
  );

  // Sidebar news
  const sidebarNews = await query(
    `SELECT * FROM posts 
     WHERE status = 'published' AND id != ? 
     ORDER BY created_at DESC 
     LIMIT 5`,
    [article.id]
  );

  // Sidebar schedule
  const sidebarSchedule = await query(
    `SELECT * FROM posts 
     WHERE status = 'published' AND category_id = 'lich-lam-viec' AND id != ? 
     ORDER BY created_at DESC 
     LIMIT 3`,
    [article.id]
  );

  return (
    <div className="page-container">
      <div className="page-layout">
        {/* ─── MAIN ARTICLE ─── */}
        <main className="page-main">
          {/* Breadcrumb */}
          <nav className="breadcrumb-bar" aria-label="Breadcrumb">
            <Link href="/">Trang nhất</Link>
            <span>›</span>
            <Link href="/news">Tin Tức - Sự kiện</Link>
            <span>›</span>
            <Link href={`/news?cat=${article.category_id}`}>{article.category_name}</Link>
          </nav>

          {/* Article card */}
          <article className="art-card">
            {/* Category badge */}
            <div className="art-cat-badge">{article.category_name}</div>

            {/* Title */}
            <h1 className="art-title">{article.title}</h1>

            {/* Meta bar */}
            <div className="art-meta">
              <div className="art-meta-left">
                <span className="art-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {article.date_display}
                </span>
                <span className="art-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {article.author}
                </span>
                {article.views !== undefined && (
                  <span className="art-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {article.views.toLocaleString()} lượt xem
                  </span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="art-divider" />

            {/* Summary / lead */}
            {article.summary && (
              <p className="art-summary">{article.summary}</p>
            )}

            {/* Hero image */}
            {article.image && (
              <figure className="art-hero">
                <img
                  src={article.image}
                  alt={article.title}
                  loading="lazy"
                />
                <figcaption>{article.title}</figcaption>
              </figure>
            )}

            {/* Body content */}
            <div
              className="art-body"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags section */}
            {article.tags && article.tags.trim() && (
              <div className="art-tags" style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontWeight: '600', color: '#718096', fontSize: '13px', display: 'flex', alignItems: 'center' }}>🏷️ Thẻ:</span>
                {article.tags.split(',').map(tag => {
                  const cleanedTag = tag.trim();
                  if (!cleanedTag) return null;
                  return (
                    <Link
                      key={cleanedTag}
                      href={`/tag/${encodeURIComponent(cleanedTag)}`}
                      style={{
                        fontSize: '12px',
                        background: '#edf2f7',
                        color: '#4a5568',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                      }}
                      className="art-tag-link"
                    >
                      {cleanedTag}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Image attachments (Facebook style grid) */}
            {imageAttachments && imageAttachments.length > 0 && (
              <ImageGridLightbox images={imageAttachments} />
            )}

            {/* Document attachments */}
            {docAttachments && docAttachments.length > 0 && (
              <div className="art-attachments" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed #e2e8f0' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📎 TỆP ĐÍNH KÈM / TÀI LIỆU
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {docAttachments.map(file => (
                    <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #edf2f7' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <span style={{ fontSize: '20px' }}>
                          {file.file_type === 'pdf' ? '📕' : file.file_type === 'word' ? '📘' : file.file_type === 'excel' ? '📊' : '📎'}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: '600', fontSize: '13px', color: '#2d3748', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {file.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#718096' }}>
                            {file.file_size_label || `${(file.file_size / 1024).toFixed(1)} KB`}
                          </div>
                        </div>
                      </div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-download"
                        style={{
                          padding: '6px 12px',
                          background: 'var(--primary)',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: '600',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'background 0.2s'
                        }}
                      >
                        Tải về 📥
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer: author + source */}
            <div className="art-footer">
              <div className="art-footer-row">
                <span>Tác giả: <strong>{article.author}</strong></span>
                <span>Nguồn: <a href="mailto:thngoquyen@danang.edu.vn">thngoquyen@danang.edu.vn</a></span>
              </div>
            </div>

            {/* Share buttons — client component */}
            <ArticleActions slug={article.slug} title={article.title} />
          </article>

          {/* Back nav */}
          <div className="art-nav">
            <Link href="/news" className="art-nav-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Quay lại danh sách tin
            </Link>
          </div>

          {/* Related articles */}
          {related.length > 0 && (
            <section className="art-related">
              <div className="art-related-header">
                <span className="art-related-title">TIN LIÊN QUAN</span>
              </div>
              <div className="art-related-grid">
                {related.map(item => (
                  <Link key={item.id} href={`/news/${item.slug}`} className="art-rel-card">
                    <div className="art-rel-img">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="news-list-placeholder" style={{ height: '100%' }}>📰</div>
                      )}
                    </div>
                    <div className="art-rel-body">
                      <span className="art-rel-cat">{item.category_name}</span>
                      <span className="art-rel-ttl">{item.title}</span>
                      <span className="art-rel-date">{item.date_display}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* ─── SIDEBAR ─── */}
        <aside className="page-sidebar">
          {/* Categories */}
          <div className="sidebar-widget">
            <div className="sidebar-widget-header"><span>CHUYÊN MỤC</span></div>
            <div className="sidebar-widget-body" style={{ padding: 0 }}>
              <Link href="/news" className="sidebar-menu-link" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                Tất cả tin tức
              </Link>
              <Link href="/news?cat=hoat-dong-dang-uy" className="sidebar-menu-link">Tin tức - Sự kiện trường</Link>
              <Link href="/news?cat=chi-dao-dieu-hanh" className="sidebar-menu-link">Thông báo nhà trường</Link>
              <Link href="/news?cat=chinh-quyen-nha-nuoc" className="sidebar-menu-link">Hoạt động chuyên môn</Link>
              <Link href="/news?cat=mat-tran-doan-the" className="sidebar-menu-link">Phong trào Đoàn - Đội</Link>
              <Link href="/news?cat=cai-cach-hanh-chinh" className="sidebar-menu-link">Tuyển sinh lớp 1</Link>
              <Link href="/news?cat=chuyen-doi-so" className="sidebar-menu-link">Chuyển đổi số học đường</Link>
              <Link href="/news?cat=van-hoa-xa-hoi" className="sidebar-menu-link">Góc phụ huynh học sinh</Link>
              <Link href="/news?cat=kinh-te-moi-truong" className="sidebar-menu-link">Tài nguyên & Góc học tập</Link>
            </div>
          </div>

          {/* Latest news */}
          <div className="sidebar-widget" style={{ marginTop: 16 }}>
            <div className="sidebar-widget-header"><span>TIN MỚI NHẤT</span></div>
            <div className="sidebar-widget-body" style={{ padding: '10px 14px' }}>
              {sidebarNews.map(item => (
                <Link key={item.id} href={`/news/${item.slug}`} className="sidebar-news-link">
                  {item.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Schedule */}
          {sidebarSchedule.length > 0 && (
            <div className="sidebar-widget" style={{ marginTop: 16 }}>
              <div className="sidebar-widget-header"><span>LỊCH CÔNG TÁC</span></div>
              <div className="sidebar-widget-body" style={{ padding: '10px 14px' }}>
                {sidebarSchedule.map(item => (
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
