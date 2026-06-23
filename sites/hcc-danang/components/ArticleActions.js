'use client';

export default function ArticleActions({ slug, title }) {
  const pageUrl = typeof window !== 'undefined'
    ? window.location.href
    : `https://taytravachhvn.gov.vn/news/${slug}`;

  return (
    <div className="art-share">
      <span className="art-share-label">Chia sẻ:</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="art-share-btn art-share-fb"
        title="Chia sẻ Facebook"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>
        Facebook
      </a>
      <button
        className="art-share-btn art-share-print"
        onClick={() => window.print()}
        title="In trang"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 6 2 18 2 18 9"/>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
        In bài
      </button>
    </div>
  );
}
