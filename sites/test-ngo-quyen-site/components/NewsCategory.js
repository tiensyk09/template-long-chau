'use client';
import Link from 'next/link';

export default function NewsCategory({ title, leftItems = [], rightItems = [], accentColor = '#d32f2f' }) {
  const leftFeatured = leftItems[0];
  const leftSub = leftItems.slice(1, 3);
  const rightFeatured = rightItems[0];
  const rightSub = rightItems.slice(1, 3);

  return (
    <div className="news-category-row">
      {/* Left Column */}
      <div className="news-col">
        <div className="news-col-header" style={{ backgroundColor: accentColor }}>
          <Link href="/news" className="news-col-title">{title[0]}</Link>
        </div>
        {leftFeatured && (
          <div className="news-featured">
            <div className="news-featured-thumb">
              {leftFeatured.image ? (
                <img src={leftFeatured.image} alt={leftFeatured.title} onError={(e) => { e.target.style.display='none'; }} />
              ) : (
                <div className="thumb-placeholder-lg">📰</div>
              )}
            </div>
            <div className="news-featured-body">
              <Link href={`/news/${leftFeatured.slug}`} className="news-featured-title">
                {leftFeatured.title}
              </Link>
              <p className="news-featured-summary">{leftFeatured.summary?.substring(0, 120)}...</p>
            </div>
          </div>
        )}
        {leftSub.map((item) => (
          <div key={item.id} className="news-sub-item">
            <span className="news-bullet">▸</span>
            <Link href={`/news/${item.slug}`} className="news-sub-title">{item.title}</Link>
          </div>
        ))}
      </div>

      {/* Right Column */}
      <div className="news-col">
        <div className="news-col-header" style={{ backgroundColor: '#1a6bb5' }}>
          <Link href="/news" className="news-col-title">{title[1]}</Link>
        </div>
        {rightFeatured && (
          <div className="news-featured">
            <div className="news-featured-thumb">
              {rightFeatured.image ? (
                <img src={rightFeatured.image} alt={rightFeatured.title} onError={(e) => { e.target.style.display='none'; }} />
              ) : (
                <div className="thumb-placeholder-lg">📰</div>
              )}
            </div>
            <div className="news-featured-body">
              <Link href={`/news/${rightFeatured.slug}`} className="news-featured-title">
                {rightFeatured.title}
              </Link>
              <p className="news-featured-summary">{rightFeatured.summary?.substring(0, 120)}...</p>
            </div>
          </div>
        )}
        {rightSub.map((item) => (
          <div key={item.id} className="news-sub-item">
            <span className="news-bullet">▸</span>
            <Link href={`/news/${item.slug}`} className="news-sub-title">{item.title}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
