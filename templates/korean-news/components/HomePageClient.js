'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePageClient({ initialLayout, initialChangelogs }) {
  const [changelogs] = useState(initialChangelogs || []);
  const [activeTab, setActiveTab] = useState('latest');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [featureIndex, setFeatureIndex] = useState(0);

  const [email, setEmail] = useState('');
  const [signupStatus, setSignupStatus] = useState({ type: '', message: '' });
  const [signupLoading, setSignupLoading] = useState(false);

  // Rotate breaking news ticker
  useEffect(() => {
    if (changelogs.length === 0) return;
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % changelogs.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [changelogs]);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setSignupStatus({ type: 'error', message: '올바른 이메일 주소를 입력해주세요!' });
      return;
    }

    setSignupLoading(true);
    setSignupStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSignupStatus({ type: 'success', message: '구독 신청이 완료되었습니다! 최신 뉴스를 보내드리겠습니다.' });
        setEmail('');
      } else {
        setSignupStatus({ type: 'error', message: data.error || '오류가 발생했습니다.' });
      }
    } catch (err) {
      setSignupStatus({ type: 'error', message: '서버 연결에 실패했습니다.' });
    } finally {
      setSignupLoading(false);
    }
  };

  const getLatestPosts = () => {
    return changelogs.slice(0, 5);
  };

  const getPopularPosts = () => {
    return [...changelogs].sort((a, b) => b.views - a.views).slice(0, 5);
  };

  const leftColumnPosts = activeTab === 'latest' ? getLatestPosts() : getPopularPosts();
  const rightColumnPosts = [...changelogs].sort((a, b) => b.views - a.views).slice(0, 4);
  const bottomGridPosts = changelogs.slice(1, 5);

  const activeFeaturePost = changelogs[featureIndex] || null;

  const navigateFeature = (direction) => {
    if (changelogs.length === 0) return;
    if (direction === 'prev') {
      setFeatureIndex(prev => (prev - 1 + changelogs.length) % changelogs.length);
    } else {
      setFeatureIndex(prev => (prev + 1) % changelogs.length);
    }
  };

  return (
    <div id="top" style={{ position: 'relative' }}>
      <Header />

      {/* 1. Breaking News Ticker Bar */}
      {changelogs.length > 0 && (
        <section className="breaking-news-bar">
          <div className="app-container" style={{ display: 'flex', width: '100%', height: '100%' }}>
            <div className="breaking-label">
              <span>⚡</span>
              <span>속보</span>
            </div>
            <div className="ticker-content-wrapper">
              <div className="ticker-item">
                <span className="ticker-date">
                  [{new Date(changelogs[tickerIndex].created_at).toLocaleDateString('ko-KR', {
                    month: '2-digit', day: '2-digit'
                  })}]
                </span>
                <Link href={`/posts/${changelogs[tickerIndex].slug}`} style={{ textDecoration: 'none' }}>
                  {changelogs[tickerIndex].title}
                </Link>
              </div>
            </div>
            <div className="ticker-controls">
              <button className="ticker-btn" onClick={() => setTickerIndex(prev => (prev - 1 + changelogs.length) % changelogs.length)}>◀</button>
              <button className="ticker-btn" onClick={() => setTickerIndex(prev => (prev + 1) % changelogs.length)}>▶</button>
            </div>
          </div>
        </section>
      )}

      <main className="app-container">
        {changelogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--muted)' }}>
            <span style={{ fontSize: '48px' }}>📰</span>
            <p style={{ marginTop: '16px', fontSize: '15px' }}>등록된 뉴스가 없습니다. 관리자 대시보드에서 기사를 추가해 주세요.</p>
          </div>
        ) : (
          <>
            {/* 2. Three-column newspaper layout grid */}
            <section className="main-news-grid">
              
              {/* Left column: tabs latest/popular */}
              <div className="news-col-left">
                <div className="tab-headers">
                  <button 
                    className={`tab-btn ${activeTab === 'latest' ? 'active' : ''}`}
                    onClick={() => setActiveTab('latest')}
                  >
                    최신 뉴스
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'popular' ? 'active' : ''}`}
                    onClick={() => setActiveTab('popular')}
                  >
                    인기 뉴스
                  </button>
                </div>
                
                <div className="tab-content">
                  {leftColumnPosts.map(post => (
                    <div key={post.id} className="list-news-item">
                      {post.image && (
                        <Link href={`/posts/${post.slug}`} className="list-news-thumb">
                          <img src={post.image} alt={post.title} loading="lazy" />
                        </Link>
                      )}
                      <div className="list-news-detail">
                        <Link href={`/posts/${post.slug}`} className="list-news-title">
                          {post.title}
                        </Link>
                        <div className="list-news-meta">
                          <span>📅 {new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                          <span>👁️ {post.views}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center column: feature slide post */}
              <div className="news-col-center">
                <div className="block-title-row">
                  <h3>주요 뉴스</h3>
                </div>
                {activeFeaturePost && (
                  <div className="feature-card-large">
                    <div className="feature-img-wrapper">
                      <img src={activeFeaturePost.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600&auto=format&fit=crop'} alt={activeFeaturePost.title} />
                    </div>
                    <div className="feature-overlay">
                      <span className="category-badge">종합</span>
                      <h2 className="feature-title">
                        <Link href={`/posts/${activeFeaturePost.slug}`} style={{ color: '#fff' }}>
                          {activeFeaturePost.title}
                        </Link>
                      </h2>
                      <div className="feature-meta">
                        <span>By {activeFeaturePost.author_name || 'Admin'}</span>
                        <span>📅 {new Date(activeFeaturePost.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}</span>
                      </div>
                    </div>
                    
                    <div className="feature-nav">
                      <button className="nav-arrow" onClick={() => navigateFeature('prev')}>◀</button>
                      <button className="nav-arrow" onClick={() => navigateFeature('next')}>▶</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right column: rank list */}
              <div className="news-col-right">
                <div className="block-title-row">
                  <h3>실시간 인기</h3>
                </div>
                <div className="rank-list">
                  {rightColumnPosts.map((post, index) => (
                    <div key={post.id} className="rank-item">
                      <div className="rank-detail">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`rank-badge ${index < 2 ? 'top-rank' : ''}`}>
                            {index + 1}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            {new Date(post.created_at).toLocaleDateString('ko-KR', {
                              month: '2-digit', day: '2-digit'
                            })}
                          </span>
                        </div>
                        <Link href={`/posts/${post.slug}`} className="rank-title">
                          {post.title}
                        </Link>
                      </div>
                      {post.image && (
                        <Link href={`/posts/${post.slug}`} className="rank-thumb">
                          <img src={post.image} alt={post.title} loading="lazy" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </section>

            {/* 3. Bottom Grid Section: larger post view */}
            <section className="bottom-news-section">
              <div className="block-title-row">
                <h3>더 많은 뉴스</h3>
              </div>
              
              <div className="bottom-grid">
                {bottomGridPosts.map(post => (
                  <div key={post.id} className="bottom-card">
                    {post.image && (
                      <Link href={`/posts/${post.slug}`} className="bottom-card-thumb">
                        <img src={post.image} alt={post.title} loading="lazy" />
                      </Link>
                    )}
                    <div className="bottom-card-info">
                      <div>
                        <div className="bottom-card-cat">일반</div>
                        <h4 className="bottom-card-title">
                          <Link href={`/posts/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h4>
                        <div className="bottom-card-meta">
                          <span>By {post.author_name || 'Admin'}</span>
                          <span>•</span>
                          <span>{new Date(post.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}</span>
                        </div>
                      </div>
                      <p className="bottom-card-excerpt">
                        {post.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* 4. Newsletter Sign-up Section */}
        <section id="newsletter" style={{ padding: '60px 0', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ maxWidth: '550px', margin: '0 auto' }}>
            <span style={{ fontSize: '32px' }}>✉️</span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '12px', marginBottom: '8px' }}>이메일 뉴스레터 구독</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
              DAILY KOREAN NEWS의 가장 영향력 있는 뉴스 기사들과 속보 분석을 가장 빠르게 이메일로 받아보세요.
            </p>
            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <input
                type="email"
                placeholder="이메일 주소를 입력해주세요..."
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '12px 16px',
                  color: 'var(--foreground)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button type="submit" className="subscribe-btn" style={{ borderRadius: '4px', padding: '12px 24px' }} disabled={signupLoading}>
                {signupLoading ? '전송중...' : '구독하기'}
              </button>
            </form>
            {signupStatus.message && (
              <div
                style={{
                  fontSize: '13px',
                  color: signupStatus.type === 'success' ? '#10b981' : '#ef4444',
                  marginTop: '12px'
                }}
              >
                {signupStatus.message}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
