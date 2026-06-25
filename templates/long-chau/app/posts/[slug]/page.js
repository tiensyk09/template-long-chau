import Link from 'next/link';
import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PostSidebarClient from '@/components/PostSidebarClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const articles = await query("SELECT * FROM posts WHERE slug = ? AND status = 'published'", [slug]);
  const article = articles[0];
  if (!article) return { title: 'Bài viết không tìm thấy | FPT Long Châu' };

  // Fetch site fallback title
  const siteTitleRow = await query('SELECT `value` FROM settings WHERE `key` = ?', ['site_title']);
  const siteTitleSuffix = siteTitleRow[0]?.value || 'FPT Long Châu';

  return {
    title: article.meta_title || `${article.title} | ${siteTitleSuffix}`,
    description: article.meta_description || article.summary || article.content?.replace(/<[^>]*>/g, '').substring(0, 150) || '',
    keywords: article.meta_keywords || ''
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const articles = await query("SELECT * FROM posts WHERE slug = ? AND status = 'published'", [slug]);
  const article = articles[0];
  if (!article) notFound();

  // Increment views
  try {
    await query('UPDATE posts SET views = views + 1 WHERE id = ?', [article.id]);
  } catch (err) {
    console.error('Failed to update views count:', err);
  }

  // Recent other updates
  const recentUpdates = await query(
    "SELECT id, title, slug, image, created_at FROM posts WHERE status = 'published' AND id != ? ORDER BY created_at DESC LIMIT 5",
    [article.id]
  );

  // Suggested products - fetch a pool of 12 products and pick 3 randomly to avoid DB dialect issues (MySQL vs SQLite D1)
  let suggestedProducts = [];
  try {
    const productsPool = await query(
      "SELECT id, name, slug, price, original_price, thumbnail, unit FROM products ORDER BY id DESC LIMIT 12"
    );
    if (productsPool && productsPool.length > 0) {
      suggestedProducts = [...productsPool]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    }
  } catch (err) {
    console.error('Failed to fetch suggested products:', err);
  }

  return (
    <div style={{ backgroundColor: '#f0f5ff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation Header */}
      <Header />

      {/* Main Container */}
      <div style={{ flex: 1, width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Breadcrumbs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '16px 0',
          fontSize: '13px',
          color: 'var(--lc-muted)'
        }}>
          <Link href="/" className="lc-breadcrumb-link">Trang chủ</Link>
          <span>/</span>
          <span style={{ color: 'var(--lc-blue)' }}>Góc sức khỏe</span>
          <span>/</span>
          <span style={{
            color: 'var(--lc-text)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '240px'
          }}>{article.title}</span>
        </div>

        {/* Dynamic Detail Layout */}
        <div className="lc-detail-layout" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '24px',
          paddingBottom: '60px'
        }}>
          {/* Main article body */}
          <main style={{
            minWidth: 0,
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
          }}>
            <article>
              {/* Category tag */}
              <span style={{
                display: 'inline-block',
                background: 'var(--lc-blue-light)',
                color: 'var(--lc-blue)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '16px'
              }}>
                Góc Sức Khỏe
              </span>
              
              {/* Article Title */}
              <h1 style={{
                fontSize: '28px',
                fontWeight: '800',
                lineHeight: '1.4',
                marginBottom: '16px',
                color: 'var(--lc-text)',
                letterSpacing: '-0.02em'
              }}>
                {article.title}
              </h1>

              {/* Meta bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '12.5px',
                color: 'var(--lc-muted)',
                marginBottom: '24px',
                borderBottom: '1px solid var(--lc-border)',
                paddingBottom: '16px',
                flexWrap: 'wrap'
              }}>
                <span>📅 {new Date(article.created_at).toLocaleDateString('vi-VN', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}</span>
                <span>•</span>
                <span>👤 Dược sĩ Long Châu</span>
                <span>•</span>
                <span>👁️ {(article.views + 1).toLocaleString()} lượt xem</span>
              </div>

              {/* Featured image */}
              {article.image && (
                <div style={{
                  width: '100%',
                  maxHeight: '420px',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  border: '1px solid var(--lc-border)',
                  marginBottom: '28px'
                }}>
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    style={{ width: '100%', height: 'auto', maxHeight: '420px', objectFit: 'cover', display: 'block' }} 
                  />
                </div>
              )}

              {/* Summary box */}
              {article.summary && (
                <div style={{
                  fontSize: '15px',
                  lineHeight: '1.6',
                  color: 'var(--lc-text)',
                  borderLeft: '4px solid var(--lc-blue)',
                  backgroundColor: 'var(--lc-blue-light)',
                  padding: '16px 20px',
                  borderRadius: '0 8px 8px 0',
                  marginBottom: '28px',
                  fontStyle: 'italic',
                  fontWeight: 500
                }}>
                  {article.summary}
                </div>
              )}

              {/* HTML content body */}
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </article>
          </main>

          {/* Sidebar */}
          <PostSidebarClient 
            recentUpdates={recentUpdates} 
            suggestedProducts={suggestedProducts} 
          />
        </div>
      </div>
      
      {/* Footer */}
      <Footer />

      {/* Static CSS for article elements */}
      <style dangerouslySetInnerHTML={{ __html: `
        .lc-breadcrumb-link {
          color: var(--lc-muted);
          transition: color 0.2s;
        }
        .lc-breadcrumb-link:hover {
          color: var(--lc-blue);
          text-decoration: underline;
        }
        
        /* Article content styling */
        .article-content {
          color: #374151; /* Dark grey */
          font-size: 15.5px;
          line-height: 1.8;
        }
        .article-content p {
          margin-bottom: 20px;
        }
        .article-content h2 {
          color: var(--lc-blue-dark);
          font-size: 20px;
          font-weight: 700;
          margin-top: 32px;
          margin-bottom: 12px;
        }
        .article-content h3 {
          color: var(--lc-text);
          font-size: 17px;
          font-weight: 700;
          margin-top: 28px;
          margin-bottom: 10px;
        }
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 24px 0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
        }
        .article-content ul {
          list-style-type: disc;
          margin-left: 24px;
          margin-bottom: 20px;
        }
        .article-content ol {
          list-style-type: decimal;
          margin-left: 24px;
          margin-bottom: 20px;
        }
        .article-content li {
          margin-bottom: 8px;
        }
        .article-content strong {
          color: var(--lc-text);
          font-weight: 600;
        }
        .article-content blockquote {
          border-left: 4px solid var(--lc-blue);
          background-color: var(--lc-blue-light);
          padding: 12px 18px;
          margin: 20px 0;
          border-radius: 4px;
          font-style: italic;
        }
        
        @media (max-width: 992px) {
          .lc-detail-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
}
