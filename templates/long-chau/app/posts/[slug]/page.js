import Link from 'next/link';
import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const articles = await query("SELECT * FROM posts WHERE slug = ? AND status = 'published'", [slug]);
  const article = articles[0];
  if (!article) return { title: 'Post Not Found | Command Code' };

  // Fetch site fallback title
  const siteTitleRow = await query('SELECT "value" FROM settings WHERE "key" = ?', ['site_title']);
  const siteTitleSuffix = siteTitleRow[0]?.value || 'Command Code';

  return {
    title: article.meta_title || `${article.title} | ${siteTitleSuffix}`,
    description: article.meta_description || article.summary || article.content?.substring(0, 150) || '',
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
    "SELECT id, title, slug, created_at FROM posts WHERE status = 'published' AND id != ? ORDER BY created_at DESC LIMIT 5",
    [article.id]
  );

  return (
    <div className="relative" style={{ minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="glow-bg"></div>
      <div className="noise-overlay"></div>

      <div className="app-container">
        {/* Navigation */}
        <Header />

        {/* Dynamic Detail Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '48px',
          padding: '60px 0 100px',
          textAlign: 'left'
        }}>
          {/* Main article body */}
          <main style={{ minWidth: 0 }}>
            {/* Back button */}
            <div style={{ marginBottom: '32px' }}>
              <Link href="/" style={{ color: 'var(--muted)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                ← Back to Homepage
              </Link>
            </div>

            <article>
              <span className="section-tag">// product updates</span>
              
              <h1 style={{
                fontSize: '40px',
                fontWeight: '800',
                lineHeight: '1.2',
                marginBottom: '16px',
                color: '#fff',
                letterSpacing: '-0.025em'
              }}>
                {article.title}
              </h1>

              {/* Meta bar */}
              <div style={{
                display: 'flex',
                gap: '16px',
                fontSize: '13px',
                color: 'var(--muted)',
                marginBottom: '32px',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '16px'
              }}>
                <span>📅 {new Date(article.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}</span>
                <span>•</span>
                <span>👤 By {article.author_name}</span>
                <span>•</span>
                <span>👁️ {(article.views + 1).toLocaleString()} views</span>
              </div>

              {/* Featured image */}
              {article.image && (
                <div style={{
                  width: '100%',
                  maxHeight: '400px',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  marginBottom: '32px'
                }}>
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover', display: 'block' }} 
                  />
                </div>
              )}

              {/* Summary box */}
              {article.summary && (
                <div style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: 'var(--foreground)',
                  borderLeft: '3px solid var(--primary)',
                  paddingLeft: '20px',
                  marginBottom: '36px',
                  fontStyle: 'italic'
                }}>
                  {article.summary}
                </div>
              )}

              {/* HTML content body */}
              <div 
                className="article-content"
                style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#d4d4d8'
                }}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </article>
          </main>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Recent Updates
              </h3>
              
              {recentUpdates.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>No other updates yet.</div>
              ) : (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', margin: 0, padding: 0 }}>
                  {recentUpdates.map(u => (
                    <li key={u.id}>
                      <Link href={`/posts/${u.slug}`} className="recent-update-link">
                        {u.title}
                      </Link>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
