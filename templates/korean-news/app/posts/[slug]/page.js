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
  if (!article) return { title: 'Post Not Found | DAILY KOREAN NEWS' };

  const siteTitleRow = await query('SELECT "value" FROM settings WHERE "key" = ?', ['site_title']);
  const siteTitleSuffix = siteTitleRow[0]?.value || 'DAILY KOREAN NEWS';

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
    <div>
      <Header />

      <main className="app-container" style={{ minHeight: '80vh', padding: '32px 0' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link href="/" style={{ color: 'var(--muted)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            ← 홈으로 돌아가기
          </Link>
        </div>

        <div className="detail-container">
          <div className="detail-cat">종합</div>
          
          <h1 className="detail-title">
            {article.title}
          </h1>

          <div className="detail-meta">
            <span>By {article.author_name || 'Admin'}</span>
            <span>•</span>
            <span>📅 {new Date(article.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}</span>
            <span>•</span>
            <span>👁️ {article.views + 1} views</span>
          </div>

          {article.image && (
            <div className="detail-image">
              <img src={article.image} alt={article.title} />
            </div>
          )}

          {article.summary && (
            <div style={{
              fontSize: '15px',
              lineHeight: '1.6',
              color: 'var(--muted)',
              borderLeft: '3px solid var(--primary)',
              paddingLeft: '16px',
              marginBottom: '24px',
              fontStyle: 'italic'
            }}>
              {article.summary}
            </div>
          )}

          <div 
            className="detail-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
