'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { bannerImages } from '../data/news';

const CDN = 'https://cdn.dongnai.gov.vn/uploads/budang/menu';
const shortcuts = [
  { label: 'Thời khóa biểu học tập',               img: `${CDN}/ic.png`,              href: '/news?cat=lich-lam-viec',  color: '#0077b6' },
  { label: 'Sở Giáo dục và Đào tạo Đà Nẵng',       img: `${CDN}/ic.png`,              href: 'https://danang.edu.vn', target:'_blank', color: '#0077b6' },
  { label: 'Đóng góp ý kiến xây dựng trường',      img: `${CDN}/ic1.png`,             href: '#',                        color: '#00897b' },
  { label: 'Tuyển sinh trực tuyến lớp 1',          img: `${CDN}/ic.png`,              href: '/news?cat=cai-cach-hanh-chinh', color: '#0077b6' },
  { label: 'Phòng Giáo dục và Đào tạo',            img: `${CDN}/ic2.png`,             href: '#',                        color: '#1565c0' },
  { label: 'Học liệu & Bài giảng E-learning',      img: `${CDN}/ic1.png`,             href: '/news?cat=kinh-te-moi-truong', color: '#00897b' },
  { label: 'Phong trào Đoàn - Đội',                img: `${CDN}/icon-co-dang2.png`,   href: '/news?cat=mat-tran-doan-the', color: '#c62828' },
  { label: 'Cổng thông tin phụ huynh',             img: `${CDN}/logo-hcc-bu-dang-moi.png`, href: '/news?cat=van-hoa-xa-hoi', color: '#1565c0' },
];

const quickLinks = [
  { label: 'Giới thiệu', href: '/gioi-thieu' },
  { label: 'Tin Tức - Sự kiện', href: '/news' },
  { label: 'Thông báo', href: '/news?cat=chi-dao-dieu-hanh' },
  { label: 'Tài nguyên học tập', href: '/news?cat=kinh-te-moi-truong' },
  { label: 'Góc Phụ huynh', href: '/news?cat=van-hoa-xa-hoi' },
  { label: 'Tuyển sinh đầu cấp', href: '/news?cat=cai-cach-hanh-chinh' },
  { label: 'Cơ cấu tổ chức', href: '/gioi-thieu' },
  { label: 'Hội đồng Sư phạm', href: '/gioi-thieu' },
];

const sidebarBanners = [
  { label: 'Cổng thông tin Sở GD&ĐT Đà Nẵng', icon: '🏛️', href: 'https://danang.edu.vn', bg: 'linear-gradient(135deg,#0d5bb5,#1a7ddb)' },
  { label: 'Trường Tiểu học Ngô Quyền - Góc Phụ huynh', icon: '🏫', href: '/news?cat=van-hoa-xa-hoi', bg: 'linear-gradient(135deg,#c8001a,#e31837)' },
  { label: 'Hộp thư điện tử nhà trường', icon: '📧', href: 'mailto:thngoquyen@danang.edu.vn', bg: 'linear-gradient(135deg,#e8a000,#f0b800)' },
  { label: 'Sơ đồ khuôn viên nhà trường', icon: '🗺️', href: '#', bg: 'linear-gradient(135deg,#059669,#22c55e)' },
];

const scheduleItems = [
  'Lịch công tác tuần của Ban Giám hiệu',
  'Thông báo lịch kiểm tra định kỳ học kỳ II',
  'Kế hoạch tuyển sinh lớp 1 năm học mới',
];

function NewsCategoryBlock({ title, categorySlug, headerClass = 'red', posts = [] }) {
  const items = posts.filter(n => n.category_id === categorySlug).slice(0, 3);
  const featured = items[0];
  const subs = items.slice(1);
  return (
    <div className="section-col">
      <div className={`section-header ${headerClass}`}>
        <Link href="/news">{title}</Link>
      </div>
      <div className="section-col-body">
        {featured ? (
          <div className="news-featured-item">
            <div className="news-featured-img-wrap">
              {featured.image ? (
                <img src={featured.image} alt={featured.title} loading="lazy" onError={(e) => { e.target.outerHTML = '<div class="news-featured-placeholder"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: "#0ea5e9", opacity: 0.5}}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>'; }} />
              ) : (
                <div className="news-featured-placeholder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0ea5e9', opacity: 0.5 }}>
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                </div>
              )}
            </div>
            <Link href={`/news/${featured.slug}`} className="news-featured-link">{featured.title}</Link>
            {featured.summary && <p className="news-excerpt">{featured.summary.substring(0, 110)}...</p>}
          </div>
        ) : null}
        <ul className="news-sub-list">
          {subs.map(item => (
            <li key={item.id}><Link href={`/news/${item.slug}`}>{item.title}</Link></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const defaultLeftLayout = [
  { id: 'block_tabbed_news', type: 'tabbed_news', title: 'Tin tức nổi bật', visible: true },
  { id: 'block_shortcuts', type: 'shortcuts', title: 'Liên kết nhanh', visible: true },
  { id: 'block_banner_slider', type: 'banner_slider', title: 'Banner giới thiệu', visible: true },
  { id: 'block_categories', type: 'categories', title: 'Danh mục tin tức', visible: true, configs: [
      { title: 'TIN TỨC - SỰ KIỆN', cat: 'hoat-dong-dang-uy', color: 'red' },
      { title: 'THÔNG BÁO NHÀ TRƯỜNG', cat: 'chi-dao-dieu-hanh', color: 'blue' },
      { title: 'HOẠT ĐỘNG CHUYÊN MÔN', cat: 'chinh-quyen-nha-nuoc', color: 'red' },
      { title: 'PHONG TRÀO ĐOÀN - ĐỘI', cat: 'mat-tran-doan-the', color: 'blue' },
      { title: 'TUYỂN SINH ĐẦU CẤP', cat: 'cai-cach-hanh-chinh', color: 'red' },
      { title: 'ỨNG DỤNG CNTT - CHUYỂN ĐỔI SỐ', cat: 'chuyen-doi-so', color: 'blue' },
      { title: 'TÀI NGUYÊN HỌC TẬP', cat: 'kinh-te-moi-truong', color: 'red' },
      { title: 'GÓC PHỤ HUYNH', cat: 'van-hoa-xa-hoi', color: 'blue' }
    ]
  }
];

const defaultRightLayout = [
  { id: 'block_search', type: 'search', title: 'Tìm kiếm', visible: true },
  { id: 'block_quick_links', type: 'quick_links', title: 'Liên kết nhanh', visible: true },
  { id: 'block_schedule', type: 'schedule', title: 'LỊCH CÔNG TÁC', visible: true },
  { id: 'block_notices', type: 'notices', title: 'THÔNG BÁO MỚI', visible: true },
  { id: 'block_sidebar_banners', type: 'sidebar_banners', title: 'Banner liên kết', visible: true, configs: [
      { label: 'Cổng thông tin Sở GD&ĐT Đà Nẵng', icon: '🏛️', href: 'https://danang.edu.vn', bg: 'linear-gradient(135deg,#0d5bb5,#1a7ddb)' },
      { label: 'Trường Tiểu học Ngô Quyền - Góc Phụ huynh', icon: '🏫', href: '/news?cat=van-hoa-xa-hoi', bg: 'linear-gradient(135deg,#c8001a,#e31837)' },
      { label: 'Hộp thư điện tử nhà trường', icon: '📧', href: 'mailto:thngoquyen@danang.edu.vn', bg: 'linear-gradient(135deg,#e8a000,#f0b800)' },
      { label: 'Sơ đồ khuôn viên nhà trường', icon: '🗺️', href: '#', bg: 'linear-gradient(135deg,#059669,#22c55e)' }
    ]
  },
  { id: 'block_survey', type: 'survey', title: 'THĂM DÒ Ý KIẾN', visible: true },
  { id: 'block_stats', type: 'stats', title: 'THỐNG KÊ TRUY CẬP', visible: true }
];

export default function HomePage() {
  const [tab, setTab] = useState('moi');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [slide, setSlide] = useState(0);
  const [posts, setPosts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [layoutBlocks, setLayoutBlocks] = useState({ left: defaultLeftLayout, right: defaultRightLayout });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/posts?status=published').then(res => res.json()),
      fetch('/api/banners').then(res => res.json()),
      fetch('/api/admin/theme-layout').then(res => res.json())
    ]).then(([postsData, bannersData, themeData]) => {
      if (postsData.posts) setPosts(postsData.posts);
      if (bannersData.banners) setBanners(bannersData.banners);
      if (themeData.success && themeData.config?.homepage_layout) {
        const layout = themeData.config.homepage_layout;
        if (layout.left && layout.right) {
          setLayoutBlocks(layout);
        } else if (Array.isArray(layout)) {
          setLayoutBlocks({ left: layout, right: defaultRightLayout });
        }
      }
    }).catch(err => {
      console.error('Error fetching homepage data:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const latest = posts.slice(0, 10);
  const featured = latest.filter(n => n.featured);
  // For hero: exclude "Lịch làm việc" articles (they have calendar graphics, not real photos)
  const heroPool = tab === 'moi'
    ? latest.filter(n => n.category_id !== 'lich-lam-viec')
    : featured.filter(n => n.category_id !== 'lich-lam-viec');
  const tabItems = tab === 'moi' ? latest : featured;
  const mainItem = heroPool[0]; // First article with real photo
  // Side list: remaining articles (including lich-lam-viec) except the hero
  const sideItems = tabItems.filter(n => n.id !== mainItem?.id).slice(0, 5);

  const activeBanners = banners.length > 0 ? banners : bannerImages.map(b => ({
    ...b,
    big_text: b.big || '',
    bg_color: b.bg || 'linear-gradient(135deg, #1a6bb5, #003380)'
  }));

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const t = setInterval(() => setSlide(s => (s + 1) % activeBanners.length), 4500);
    return () => clearInterval(t);
  }, [activeBanners.length]);

  const banner = activeBanners[slide] || activeBanners[0];

  return (
    <div className="main-container">
      {/* MAIN CONTENT */}
      <div className="main-content-col">
        {(layoutBlocks.left || [])
          .filter(b => b.visible !== false)
          .map(block => {
            // 1. Tabbed News Block
            if (block.type === 'tabbed_news') {
              if (loading) {
                return (
                  <div key={block.id} className="tab-box" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                      <div className="skeleton-pulse" style={{ width: 80, height: 32, borderRadius: 6 }} />
                      <div className="skeleton-pulse" style={{ width: 100, height: 32, borderRadius: 6 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexDirection: 'row', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1.3, minWidth: 280 }}>
                        <div className="skeleton-pulse" style={{ width: '100%', height: 260, borderRadius: 8 }} />
                        <div className="skeleton-pulse" style={{ width: '90%', height: 18, borderRadius: 4, marginTop: 12 }} />
                        <div className="skeleton-pulse" style={{ width: '60%', height: 14, borderRadius: 4, marginTop: 8 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} style={{ display: 'flex', gap: 10 }}>
                            <div className="skeleton-pulse" style={{ width: 60, height: 45, borderRadius: 6, flexShrink: 0 }} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <div className="skeleton-pulse" style={{ width: '100%', height: 12, borderRadius: 3 }} />
                              <div className="skeleton-pulse" style={{ width: '60%', height: 10, borderRadius: 3 }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div key={block.id} className="tab-box">
                  <div className="tab-header">
                    <button className={`tab-btn ${tab === 'moi' ? 'active' : ''}`} onClick={() => { setTab('moi'); setHoveredItem(null); }}>TIN MỚI</button>
                    <button className={`tab-btn ${tab === 'nhieu' ? 'active' : ''}`} onClick={() => { setTab('nhieu'); setHoveredItem(null); }}>TIN XEM NHIỀU</button>
                  </div>
                  <div className="tab-content">
                    {/* Featured image */}
                    <div className="featured-news-wrap">
                      <div className="featured-news-img-box">
                        {(hoveredItem?.image || mainItem?.image) ? (
                          <img
                            key={hoveredItem?.id || mainItem?.id}
                            src={hoveredItem?.image || mainItem?.image}
                            alt={hoveredItem?.title || mainItem?.title}
                            className="featured-news-img"
                            loading="lazy"
                            style={{ transition: 'opacity 0.25s ease' }}
                            onError={(e) => { 
                              e.target.outerHTML = '<div class="featured-placeholder"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: "#0ea5e9", opacity: 0.5}}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>'; 
                            }}
                          />
                        ) : (
                          <div className="featured-placeholder">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0ea5e9', opacity: 0.5 }}>
                              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                              <circle cx="9" cy="9" r="2"/>
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <Link href={(hoveredItem || mainItem) ? `/news/${(hoveredItem || mainItem).slug}` : '#'} className="featured-caption">
                        {hoveredItem?.title || mainItem?.title}
                      </Link>
                    </div>
                    {/* Side list */}
                    <div className="news-thumb-list">
                      {sideItems.map(item => (
                        <div
                          key={item.id}
                          className={`news-thumb-item${hoveredItem?.id === item.id ? ' hovered' : ''}`}
                          onMouseEnter={() => setHoveredItem(item)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <div className="thumb-img">
                            {item.image ? (
                              <img src={item.image} alt={item.title} loading="lazy" onError={(e) => { e.target.outerHTML = '<div class="thumb-placeholder"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: "#0ea5e9", opacity: 0.5}}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>'; }} />
                            ) : (
                              <div className="thumb-placeholder">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0ea5e9', opacity: 0.5 }}>
                                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                  <circle cx="9" cy="9" r="2"/>
                                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <Link href={`/news/${item.slug}`} className="thumb-title">{item.title}</Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            // 2. Shortcuts Grid
            if (block.type === 'shortcuts') {
              if (loading) {
                return (
                  <div key={block.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className="skeleton-pulse" style={{ height: 90, borderRadius: 10 }} />
                    ))}
                  </div>
                );
              }
              const items = block.configs || shortcuts;
              return (
                <div key={block.id} className="shortcut-grid">
                  {items.map((s, sIdx) => (
                    <a
                      key={sIdx}
                      href={s.href}
                      target={s.target || '_self'}
                      rel={s.target === '_blank' ? 'noopener noreferrer' : undefined}
                      className="shortcut-card"
                      style={{ '--sc-color': s.color || '#0077b6' }}
                    >
                      <div className="sc-icon-wrap">
                        <img src={s.img || 'https://cdn.dongnai.gov.vn/uploads/budang/menu/ic.png'} alt={s.label} className="sc-icon" />
                      </div>
                      <span className="sc-label">{s.label}</span>
                    </a>
                  ))}
                </div>
              );
            }

            // 3. Banner Slider
            if (block.type === 'banner_slider') {
              if (loading) {
                const skeletonHeight = block.configs?.height ? parseInt(block.configs.height) : 260;
                return (
                  <div key={block.id} className="skeleton-pulse" style={{ height: skeletonHeight, borderRadius: 12 }} />
                );
              }
              
              const blockBanners = (block.configs && block.configs.banners && block.configs.banners.length > 0)
                ? block.configs.banners
                : activeBanners;
                
              const sliderHeight = block.configs?.height ? parseInt(block.configs.height) : 260;
              const currentSlide = slide % blockBanners.length;
              const currentBanner = blockBanners[currentSlide] || blockBanners[0] || {};
              
              const imageUrl = currentBanner.image_url || currentBanner.image || '';
              const bigText = currentBanner.big_text || currentBanner.big || currentBanner.alt || '';
              const caption = currentBanner.caption || '';
              const bgColor = currentBanner.bg_color || currentBanner.bg || 'linear-gradient(135deg, #1a6bb5, #003380)';
              
              const fitMode = block.configs?.fitMode || 'cover';
              
              const isGradient = bgColor.startsWith('linear-gradient') || bgColor.includes('gradient');
              const finalBgColor = isGradient ? undefined : bgColor;
              const finalBgImage = imageUrl 
                ? `url(${imageUrl})` 
                : (isGradient ? bgColor : undefined);
              
              return (
                <div key={block.id} className="banner-slider" style={{ height: sliderHeight }}>
                  <div className="banner-slide" style={{ 
                    backgroundColor: finalBgColor,
                    backgroundImage: finalBgImage,
                    backgroundSize: fitMode,
                    backgroundRepeat: fitMode === 'contain' ? 'no-repeat' : undefined,
                    backgroundPosition: 'center',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div className="banner-slide-text" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)', padding: '20px' }}>
                      {bigText && <div className="banner-big" style={{ fontSize: sliderHeight > 300 ? '2.4rem' : '1.8rem' }}>{bigText}</div>}
                      {caption && <p className="banner-caption" style={{ fontSize: sliderHeight > 300 ? '1.15rem' : '0.95rem', margin: '8px auto 0' }}>{caption}</p>}
                    </div>
                  </div>
                  {blockBanners.length > 1 && (
                    <div className="banner-dots">
                      {blockBanners.map((_, i) => (
                        <button key={i} className={`banner-dot-btn ${i === currentSlide ? 'active' : ''}`} onClick={() => setSlide(i)} />
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // 4. Categories pairs block
            if (block.type === 'categories') {
              if (loading) {
                return (
                  <div key={block.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {[1, 2].map(i => (
                      <div key={i} className="skeleton-pulse" style={{ height: 200, borderRadius: 12 }} />
                    ))}
                  </div>
                );
              }
              const pairs = [];
              const configs = block.configs || [];
              for (let i = 0; i < configs.length; i += 2) {
                pairs.push(configs.slice(i, i + 2));
              }
              return (
                <div key={block.id} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {pairs.map((pair, pIdx) => (
                    <div key={pIdx} className="section-2col">
                      {pair.map((catCfg, cIdx) => (
                        <NewsCategoryBlock 
                          key={cIdx}
                          title={catCfg.title}
                          categorySlug={catCfg.cat}
                          headerClass={catCfg.color || 'red'}
                          posts={posts}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              );
            }

            // 5. Custom HTML/Text Block
            if (block.type === 'html') {
              return (
                <div key={block.id} className="news-section" style={{ background: '#ffffff', padding: 18, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: 20 }}>
                  {block.title && (
                    <div className="section-header" style={{ borderBottom: '2px solid var(--primary)', paddingBottom: 6, marginBottom: 16 }}>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                        {block.title}
                      </h2>
                    </div>
                  )}
                  <div 
                    className="custom-html-block-content"
                    dangerouslySetInnerHTML={{ __html: block.configs?.html || '' }}
                  />
                </div>
              );
            }

            return null;
          })}
      </div>

      {/* SIDEBAR */}
      <aside className="main-sidebar-col">
        {(layoutBlocks.right || [])
          .filter(b => b.visible !== false)
          .map(block => {
            // Search Block
            if (block.type === 'search') {
              return (
                <div key={block.id} className="search-wrap">
                  <input type="text" placeholder="Tìm kiếm..." className="search-input" />
                  <button className="search-btn">Tìm</button>
                </div>
              );
            }

            // Quick Links Block
            if (block.type === 'quick_links') {
              return (
                <div key={block.id} className="sidebar-widget">
                  {block.title && <div className="sidebar-widget-header"><span>{block.title}</span></div>}
                  <ul className="sidebar-menu">
                    {quickLinks.map(l => (
                      <li key={l.label}><Link href={l.href}>{l.label}</Link></li>
                    ))}
                  </ul>
                </div>
              );
            }

            // Schedule Block
            if (block.type === 'schedule') {
              return (
                <div key={block.id} className="sidebar-widget">
                  <div className="sidebar-widget-header"><span>{block.title || 'LỊCH CÔNG TÁC'}</span></div>
                  <div className="sidebar-widget-body">
                    {posts.filter(n => n.category_id === 'lich-lam-viec').slice(0, 3).length > 0 ? (
                      posts.filter(n => n.category_id === 'lich-lam-viec').slice(0, 3).map(p => (
                        <Link key={p.id} href={`/news/${p.slug}`} className="sidebar-news-link">{p.title}</Link>
                      ))
                    ) : (
                      scheduleItems.map((s, i) => (
                        <Link key={i} href="/news" className="sidebar-news-link">{s}</Link>
                      ))
                    )}
                  </div>
                </div>
              );
            }

            // Notices Block
            if (block.type === 'notices') {
              return (
                <div key={block.id} className="sidebar-widget">
                  <div className="sidebar-widget-header"><span>{block.title || 'THÔNG BÁO MỚI'}</span></div>
                  <div className="sidebar-widget-body">
                    {posts.filter(n => n.category_id === 'chi-dao-dieu-hanh' || n.category_id === 'thong-bao').slice(0, 3).length > 0 ? (
                      posts.filter(n => n.category_id === 'chi-dao-dieu-hanh' || n.category_id === 'thong-bao').slice(0, 3).map(p => (
                        <Link key={p.id} href={`/news/${p.slug}`} className="sidebar-news-link">{p.title}</Link>
                      ))
                    ) : (
                      <Link href="/news" className="sidebar-news-link">Thông báo tuyển sinh lớp 1 trực tuyến năm học mới</Link>
                    )}
                  </div>
                </div>
              );
            }

            // Sidebar Banners / Ads Block
            if (block.type === 'sidebar_banners') {
              const hasTitle = !!block.title;
              return (
                <div key={block.id} className={hasTitle ? "sidebar-widget" : ""} style={hasTitle ? {} : { marginBottom: 20 }}>
                  {hasTitle && <div className="sidebar-widget-header"><span>{block.title}</span></div>}
                  <div className={hasTitle ? "sidebar-widget-body" : ""} style={{ padding: hasTitle ? '12px' : '0' }}>
                    <div className="sidebar-banner-links" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(block.configs || sidebarBanners).map((b, idx) => {
                        if (b.imageUrl) {
                          return (
                            <a key={idx} href={b.href || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: 0 }}>
                              <img src={b.imageUrl} alt={b.label} style={{ width: '100%', borderRadius: 8, display: 'block', border: '1px solid var(--border)' }} />
                            </a>
                          );
                        }
                        return (
                          <a key={idx} href={b.href || '#'} target="_blank" rel="noopener noreferrer"
                            className="sidebar-banner-card" style={{ background: b.bg || 'linear-gradient(135deg,#0d5bb5,#1a7ddb)', marginBottom: 0 }}>
                            <span className="sidebar-banner-icon">{b.icon || '🏛️'}</span>
                            <span>{b.label}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            // Survey Block
            if (block.type === 'survey') {
              return (
                <div key={block.id} className="sidebar-widget">
                  <div className="sidebar-widget-header"><span>{block.title || 'THĂM DÒ Ý KIẾN'}</span></div>
                  <div className="sidebar-widget-body">
                    <p className="survey-question">Khảo sát ý kiến phụ huynh về các hoạt động bán trú</p>
                    <ul className="survey-opts">
                      <li><label><input type="radio" name="survey" /> Rất hài lòng</label></li>
                      <li><label><input type="radio" name="survey" /> Hài lòng</label></li>
                      <li><label><input type="radio" name="survey" /> Cần cải thiện</label></li>
                    </ul>
                    <div className="survey-btns">
                      <button className="btn-primary">Bình chọn</button>
                      <button className="btn-success">Kết quả</button>
                    </div>
                  </div>
                </div>
              );
            }

            // Stats Block
            if (block.type === 'stats') {
              return (
                <div key={block.id} className="sidebar-widget">
                  <div className="sidebar-widget-header"><span>{block.title || 'THỐNG KÊ TRUY CẬP'}</span></div>
                  <div className="sidebar-widget-body">
                    <div className="stat-row"><span>Hôm nay</span><span className="stat-num">3,293</span></div>
                    <div className="stat-row"><span>Tháng này</span><span className="stat-num">28,541</span></div>
                    <div className="stat-row"><span>Tổng lượt truy cập</span><span className="stat-num">1,067,367</span></div>
                  </div>
                </div>
              );
            }

            // Custom HTML/Text Block in sidebar
            if (block.type === 'html') {
              return (
                <div key={block.id} className="sidebar-widget">
                  {block.title && <div className="sidebar-widget-header"><span>{block.title}</span></div>}
                  <div className="sidebar-widget-body" style={{ padding: '12px' }}>
                    <div 
                      className="custom-html-block-content"
                      dangerouslySetInnerHTML={{ __html: block.configs?.html || '' }}
                    />
                  </div>
                </div>
              );
            }

            return null;
          })}
      </aside>
    </div>
  );
}
