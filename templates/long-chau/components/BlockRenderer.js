'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function BlockRenderer({ blocks = [] }) {
  if (!Array.isArray(blocks)) return null;

  return (
    <div className="lc-sections-gap">
      {blocks
        .filter(b => b.visible !== false)
        .map(block => {
          switch (block.type) {
            case 'hero':
              return <HeroBlock key={block.id} configs={block.configs} />;
            case 'flashsale':
              return <FlashSaleBlock key={block.id} configs={block.configs} />;
            case 'categories':
              return <CategoriesBlock key={block.id} configs={block.configs} />;
            case 'healthchecks':
              return <HealthChecksBlock key={block.id} configs={block.configs} />;
            case 'audiences':
              return <AudiencesBlock key={block.id} configs={block.configs} />;
            case 'posts':
              return <RecentPostsBlock key={block.id} configs={block.configs} />;
            case 'brands':
              return <BrandsBlock key={block.id} configs={block.configs} />;
            case 'html':
              return <HtmlBlock key={block.id} configs={block.configs} />;
            default:
              return null;
          }
        })}
    </div>
  );
}

// ─── 1. HERO BLOCK ───────────────────────────────────────────
const HERO_SLIDES = [
  { img: '/images/Theme_layer_PC_1440_X704_05f6eb7774.png', bg: '#003d9e' },
  { img: '/images/Theme_layer_PC_1440_X704_1_f58428afe7.jpg', bg: '#004db3' },
  { img: '/images/Desk_1440x700_9737b7dfde.png', bg: '#003090' },
];

const SIDE_BANNERS = [
  '/images/Banner_Web_PC_805x246_132cc5d5a3.png',
  '/images/Banner_Web_PC_805x246_bee3a805e9.png',
];

const QUICK_ACTIONS = [
  { icon: '💊', title: 'Cần mua thuốc', sub: 'Đặt hàng nhanh chóng' },
  { icon: '👨‍⚕️', title: 'Tư vấn với Dược Sĩ', sub: 'Miễn phí 24/7' },
  { icon: '📋', title: 'Đơn của tôi', sub: 'Theo dõi đơn hàng' },
  { icon: '📍', title: 'Tìm nhà thuốc', sub: 'Gần tôi nhất' },
  { icon: '💉', title: 'Tiêm Vắc xin', sub: 'Đặt lịch tiêm chủng' },
  { icon: '🔍', title: 'Tra thuốc chính hãng', sub: 'Kiểm tra nguồn gốc' },
];

function HeroBlock({ configs = {} }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const totalSlides = HERO_SLIDES.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(`https://nhathuoclongchau.com.vn/tim-kiem?q=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  const prev = () => setCurrentSlide(p => (p - 1 + totalSlides) % totalSlides);
  const next = () => setCurrentSlide(p => (p + 1) % totalSlides);

  return (
    <div>
      {/* Hero slider + sidebar */}
      <div className="lc-hero-section">
        <div className="lc-hero-inner">
          {/* Main slider */}
          <div className="lc-hero-slider">
            {HERO_SLIDES.map((slide, i) => (
              <div key={i} className={`lc-hero-slide${i === currentSlide ? ' active' : ''}`}>
                <img
                  src={slide.img}
                  alt={`Banner ${i + 1}`}
                  style={{ backgroundColor: slide.bg }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = slide.bg;
                    e.target.parentElement.innerHTML = `
                      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#fff;gap:12px;padding:24px;text-align:center;">
                        <div style="font-size:48px;">💊</div>
                        <div style="font-size:28px;font-weight:900;letter-spacing:-0.5px;">${configs.title || 'Nhà thuốc FPT Long Châu'}</div>
                        <div style="font-size:14px;opacity:0.8;">${configs.description || 'Chuyên thuốc theo đơn · Tư vấn 24/7 · Giao hàng nhanh'}</div>
                      </div>`;
                  }}
                />
              </div>
            ))}
            <button className="lc-slider-btn prev" onClick={prev}>‹</button>
            <button className="lc-slider-btn next" onClick={next}>›</button>
            <div className="lc-slider-dots">
              {HERO_SLIDES.map((_, i) => (
                <div key={i} className={`lc-dot${i === currentSlide ? ' active' : ''}`} onClick={() => setCurrentSlide(i)} />
              ))}
            </div>
          </div>

          {/* Sidebar banners */}
          <div className="lc-hero-sidebar">
            {SIDE_BANNERS.map((src, i) => (
              <div key={i} className="lc-hero-side-banner">
                <img src={src} alt={`Side banner ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} onError={(e) => e.target.style.display='none'} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick action row */}
      <div className="lc-quick-actions">
        <div className="lc-quick-actions-inner">
          {QUICK_ACTIONS.map((action, i) => (
            <div key={i} className="lc-quick-action">
              <div className="lc-quick-action-icon">{action.icon}</div>
              <div className="lc-quick-action-text">
                <strong>{action.title}</strong>
                <span>{action.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 2. FLASH SALE BLOCK ─────────────────────────────────────
const FLASH_PRODUCTS = [
  {
    name: 'Sữa dinh dưỡng dành cho bệnh nhân gan Fohepta Vitadairy',
    price: 257000, salePrice: 205600, discount: '-20%',
    sold: 1, total: 400, unit: 'Hộp',
    img: '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png',
    flag: '🇻🇳',
  },
  {
    name: 'Sữa cân bằng dinh dưỡng Meiji Meibalance hương n...',
    price: 288000, salePrice: 233280, discount: '-19%',
    sold: 1, total: 100, unit: 'Lốc',
    img: '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png',
    flag: '🇯🇵',
  },
  {
    name: 'Sữa bổ sung dinh dưỡng đặc biệt cho người đái tháo đường Glucerna',
    price: 922000, salePrice: 842000, discount: '-80.000đ',
    sold: 6, total: 50, unit: 'Hộp',
    img: '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png',
    flag: '🇺🇸',
  },
  {
    name: 'Viên hỗ trợ phát triển não bộ sức khỏe cho mắt Brauer Baby & Kids',
    price: 486800, salePrice: 388800, discount: '-20%',
    sold: 5, total: 100, unit: 'Hộp',
    img: '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png',
    flag: '🇦🇺',
  },
  {
    name: 'Viên uống hỗ trợ giảm vết thâm, sạm New Nordic Skin Care Pigment Clear',
    price: 500000, salePrice: 400000, discount: '-20%',
    sold: 13, total: 100, unit: 'Hộp',
    img: '/images/vien_uong_giam_vet_tham_sam_tan_nhang_giup_da_sang_min_skin_care_pigment_clear_60v_new_nordic_00011057_2_d86c2004d6.jpg',
    flag: '🇰🇷',
  },
  {
    name: 'Sữa tăng cường sức khỏe khối cơ tăng miễn dịch Ensure Gold',
    price: 435000, salePrice: 385000, discount: '-50.000đ',
    sold: 13, total: 100, unit: 'Hộp',
    img: '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png',
    flag: '🇺🇸',
  },
];

const SALE_TIMES = [
  { time: '08:00 - 22:00, 25/06', status: 'Đang diễn ra', active: true },
  { time: '08:00 - 22:00, 26/06', status: 'Sắp diễn ra', active: false },
  { time: '08:00 - 22:00, 27/06', status: 'Sắp diễn ra', active: false },
  { time: '08:00 - 22:00, 28/06', status: 'Sắp diễn ra', active: false },
];

function FlashSaleBlock({ configs = {} }) {
  const [timeLeft, setTimeLeft] = useState(configs.duration || 43200);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const hrs = Math.floor(timeLeft / 3600).toString().padStart(2, '0');
  const mins = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  const products = (configs.items && configs.items.length > 0) ? configs.items.map((item, i) => ({
    ...FLASH_PRODUCTS[i % FLASH_PRODUCTS.length],
    ...item,
    img: item.image || FLASH_PRODUCTS[i % FLASH_PRODUCTS.length].img,
  })) : FLASH_PRODUCTS;

  return (
    <div className="lc-section-bg-white">
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        <div className="lc-flashsale-wrap" style={{ margin: 0, borderRadius: '16px', overflow: 'hidden' }}>
          {/* Flash Sale Header */}
          <div className="lc-flashsale-header">
            <div className="lc-flashsale-title">
              <div className="lc-flashsale-badge">
                <span className="lightning">⚡</span>
                FLASHSALE GIÁ TỐT
              </div>
            </div>
            <div className="lc-flashsale-timer">
              <span>Kết thúc sau</span>
              <div className="lc-timer-box">{hrs}</div>
              <span className="lc-timer-sep">:</span>
              <div className="lc-timer-box">{mins}</div>
              <span className="lc-timer-sep">:</span>
              <div className="lc-timer-box">{secs}</div>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', marginLeft: '12px', background: 'var(--lc-orange)', padding: '6px 14px', borderRadius: '20px', fontWeight: 700 }}>
                XEM NGAY →
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="lc-flashsale-tabs">
            {SALE_TIMES.map((tab, i) => (
              <div key={i} className={`lc-flashsale-tab${tab.active ? ' active' : ''}`}>
                <div className="tab-time">{tab.time}</div>
                <div className="tab-status">{tab.status}</div>
              </div>
            ))}
          </div>

          {/* Products */}
          <div className="lc-product-grid">
            {products.map((item, idx) => {
              const soldPercent = Math.round(((item.sold || 0) / (item.total || 100)) * 100);
              return (
                <div className="lc-product-card" key={idx}>
                  {item.flag && <div className="lc-product-flag">{item.flag}</div>}
                  {item.discount && <div className="lc-product-discount">{item.discount}</div>}
                  <div className="lc-product-img">
                    <img
                      src={item.img || item.image || '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png'}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/160/160?random=${idx + 10}`;
                      }}
                    />
                  </div>
                  <div className="lc-product-info">
                    <div className="lc-product-name">{item.name}</div>
                    <div className="lc-product-price-row">
                      <span className="lc-product-sale-price">
                        {item.salePrice ? item.salePrice.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}
                        {item.unit && <span className="lc-product-unit"> / {item.unit}</span>}
                      </span>
                      {item.price && <span className="lc-product-old-price">{item.price.toLocaleString('vi-VN')}đ</span>}
                    </div>
                    <div className="lc-progress-wrap">
                      <div className="lc-progress-bg">
                        <div className="lc-progress-fill" style={{ width: `${Math.max(soldPercent, 5)}%` }} />
                      </div>
                      <div className="lc-progress-lbl">
                        <span className="lc-progress-fire">🔥</span>
                        {soldPercent > 0 ? `Đã bán ${item.sold}/${item.total} suất` : `Mở bán ${item.total} suất`}
                      </div>
                    </div>
                    <button className="lc-btn-chon-mua" onClick={() => alert(`Đã thêm "${item.name}" vào giỏ hàng!`)}>
                      Chọn mua
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 3. CATEGORIES BLOCK ─────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { title: 'Thần kinh não', sub: '50 sản phẩm', img: '/images/Than_kinh_nao_ae09cbf6e8.png', icon: '🧠' },
  { title: 'Vitamin & Khoáng chất', sub: '84 sản phẩm', img: '/images/Vitamin_and_Khoang_chat_a92b3b1672.png', icon: '💊' },
  { title: 'Sinh lý - Nội tiết tố', sub: '38 sản phẩm', img: '/images/Sinh_li_Noi_tiet_to_f9d4faa138.png', icon: '⚕️' },
  { title: 'Tim mạch - Huyết áp', sub: '18 sản phẩm', img: '/images/Suc_khoe_tim_mach_e413362a48.png', icon: '❤️' },
  { title: 'Miễn dịch - Đề kháng', sub: '45 sản phẩm', img: '/images/Tang_suc_de_khang_mien_dich_9926e39ba8.png', icon: '🛡️' },
  { title: 'Tiêu hóa', sub: '68 sản phẩm', img: '/images/da_day_24ef495d10.png', icon: '🌿' },
  { title: 'Giải pháp làn da', sub: '74 sản phẩm', img: '/images/My_pham_trang_diem_8589bc7b93.png', icon: '✨' },
  { title: 'Chăm sóc da mặt', sub: '165 sản phẩm', img: '/images/San_pham_tu_thien_nhien_4435bda613.png', icon: '🧴' },
  { title: 'Hỗ trợ làm đẹp', sub: '17 sản phẩm', img: '/images/Thiet_bi_lam_dep_570678dfac.png', icon: '💄' },
  { title: 'Hỗ trợ tình dục', sub: '48 sản phẩm', img: '/images/Sinh_li_Noi_tiet_to_f9d4faa138.png', icon: '💝' },
  { title: 'Sữa', sub: '44 sản phẩm', img: '/images/Sua_d4a041e21d.png', icon: '🥛' },
  { title: 'Dụng cụ theo dõi', sub: '99 sản phẩm', img: '/images/Tra_cuu_thuoc_3c3dcc9179.png', icon: '🩺' },
];

function CategoriesBlock({ configs = {} }) {
  const cats = (configs.items && configs.items.length > 0) ? configs.items : DEFAULT_CATEGORIES;
  return (
    <div className="lc-section-bg-white">
      <div className="lc-section">
        <div className="lc-section-header">
          <div className="lc-section-title-row">
            <span className="lc-section-icon">🏆</span>
            <h2 className="lc-section-title">{configs.title || 'Danh mục nổi bật'}</h2>
          </div>
          <span className="lc-section-link" onClick={() => alert('Xem tất cả danh mục')}>Xem tất cả ›</span>
        </div>
        <div className="lc-categories-grid">
          {cats.map((cat, i) => (
            <div key={i} className="lc-category-card" onClick={() => alert(`Xem "${cat.title}"`)}>
              <div className="lc-category-icon">
                {cat.img ? (
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="lc-category-img"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'block'); }}
                  />
                ) : (
                  <span>{cat.icon || '💊'}</span>
                )}
              </div>
              <div>
                <div className="lc-category-name">{cat.title}</div>
                {cat.sub && <div className="lc-category-count">{cat.sub}</div>}
                {cat.desc && <div className="lc-category-count">{cat.desc}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 4. HEALTH CHECKS BLOCK ──────────────────────────────────
const DEFAULT_HEALTH_CHECKS = [
  { title: 'Bài kiểm tra trí nhớ và mức độ tập trung chú ý', desc: 'Đánh giá khả năng ghi nhớ, tập trung', icon: '/images/Tra_cuu_thuoc_3c3dcc9179.png', action: 'Bắt đầu' },
  { title: 'Bài kiểm tra sàng lọc nguy cơ tiền đái tháo đường', desc: 'Nhận biết sớm nguy cơ tiểu đường tuýp 2', icon: '/images/ic_tien_dai_thao_duong_688b8d7cde.png', action: 'Bắt đầu' },
  { title: 'Bài kiểm tra khả năng suy giáp', desc: 'Kiểm tra chức năng tuyến giáp', icon: '/images/ic_suy_giap_e30330b206.png', action: 'Bắt đầu' },
];

function HealthChecksBlock({ configs = {} }) {
  const checks = (configs.items && configs.items.length > 0) ? configs.items : DEFAULT_HEALTH_CHECKS;
  return (
    <div className="lc-section-bg-white">
      <div className="lc-section">
        <div className="lc-healthcheck-section">
          <div className="lc-healthcheck-left">
            <h2 className="lc-healthcheck-title">{configs.title || 'Kiểm tra sức khỏe'}</h2>
            <p className="lc-healthcheck-desc">{configs.description || 'Kết quả đánh giá sẽ cho bạn lời khuyên xử trí phù hợp!'}</p>
            <div className="lc-healthcheck-cards">
              {checks.map((item, i) => (
                <div key={i} className="lc-healthcheck-card" onClick={() => alert(`Bắt đầu: "${item.title}"`)}>
                  <div className="lc-healthcheck-card-icon">
                    {item.icon && item.icon.startsWith('/') ? (
                      <img src={item.icon} alt={item.title} onError={(e) => { e.target.parentElement.innerHTML = '🧬'; }} />
                    ) : (
                      <span style={{ fontSize: '20px' }}>{item.icon || '🩺'}</span>
                    )}
                  </div>
                  <div className="lc-healthcheck-card-info">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                    <span className="lc-healthcheck-card-link">{item.action || 'Bắt đầu'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lc-healthcheck-doctor">
            <img
              src="/images/KTSK_icon_bs_Web_de1db59573.png"
              alt="Bác sĩ tư vấn"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 5. AUDIENCES / DISEASES BY GROUP ────────────────────────
const DEFAULT_AUDIENCES = [
  {
    name: 'BỆNH NAM GIỚI',
    img: '/images/san_pham_theo_doi_tuong_d7e7ffa80f.png',
    bgColor: 'linear-gradient(135deg, #e3f0ff, #c5deff)',
    items: ['Loãng xương ở nam', 'Dị tinh, mộng tinh', 'Hẹp bao quy đầu', 'Yếu sinh lý'],
  },
  {
    name: 'BỆNH NỮ GIỚI',
    img: '/images/san_pham_theo_doi_tuong_d7e7ffa80f.png',
    bgColor: 'linear-gradient(135deg, #ffe4ef, #ffc2d6)',
    items: ['Hội chứng tiền kinh nguyệt', 'Hội chứng tiền mãn kinh', 'Chậm kinh', 'Mất kinh'],
  },
  {
    name: 'BỆNH NGƯỜI GIÀ',
    img: '/images/san_pham_theo_doi_tuong_d7e7ffa80f.png',
    bgColor: 'linear-gradient(135deg, #fff8e1, #ffedb0)',
    items: ['Alzheimer', 'Parkinson', 'Parkinson thứ phát', 'Đục thủy tinh thể ở người già'],
  },
  {
    name: 'BỆNH TRẺ EM',
    img: '/images/san_pham_theo_doi_tuong_d7e7ffa80f.png',
    bgColor: 'linear-gradient(135deg, #fce4ec, #f8bbd9)',
    items: ['Bại não trẻ em', 'Tự kỷ', 'Uốn ván', 'Tắc ruột sơ sinh'],
  },
];

function AudiencesBlock({ configs = {} }) {
  const audiences = (configs.items && configs.items.length > 0)
    ? configs.items.map((item, i) => ({ ...DEFAULT_AUDIENCES[i % DEFAULT_AUDIENCES.length], ...item }))
    : DEFAULT_AUDIENCES;

  return (
    <div className="lc-section-bg-light">
      <div className="lc-section">
        <div className="lc-section-header">
          <div className="lc-section-title-row">
            <span className="lc-section-icon">👥</span>
            <h2 className="lc-section-title">{configs.title || 'Bệnh theo đối tượng'}</h2>
          </div>
        </div>
        <div className="lc-audiences-grid">
          {audiences.map((aud, i) => (
            <div key={i} className="lc-audience-card">
              <div className="lc-audience-img-placeholder" style={{ background: aud.bgColor || DEFAULT_AUDIENCES[i % 4].bgColor }}>
                <img
                  src={aud.img || `/images/san_pham_theo_doi_tuong_d7e7ffa80f.png`}
                  alt={aud.name}
                  style={{ height: '110px', objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="lc-audience-body">
                <div className="lc-audience-title">{aud.name}</div>
                <ul className="lc-audience-list">
                  {(aud.items || aud.desc?.split('·') || [aud.desc]).filter(Boolean).map((item, j) => (
                    <li key={j}>{item.trim()}</li>
                  ))}
                </ul>
                <span className="lc-audience-link">{aud.tag || 'Tìm hiểu thêm'} ›</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 6. RECENT POSTS (GÓC SỨC KHỎE) ─────────────────────────
const ARTICLE_THUMBNAILS = [
  '/images/co_nen_dap_khoai_tay_len_vet_tiem_cho_tre_12024ebc0d.jpg',
  '/images/khong_hut_thuoc_la_van_mac_ung_thu_phoi_dau_la_nguyen_nhan_gay_benh_683da4c5a3.png',
  '/images/phan_biet_thuy_dau_va_tay_chan_mieng_af30ed747e.png',
  '/images/benh_thuy_dau_la_gi_da01f24cec.png',
  '/images/nen_tiem_vaccine_hpv_thoi_diem_nao_de_dat_hieu_qua_cd4655ed9a.png',
];

function RecentPostsBlock({ configs = {} }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/posts?status=published&limit=${configs.limit || 6}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setPosts(d?.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [configs.limit]);

  const featured = posts[0];
  const listPosts = posts.slice(1);

  return (
    <div className="lc-section-bg-white">
      <div className="lc-section">
        <div className="lc-section-header">
          <div className="lc-section-title-row">
            <span className="lc-section-icon">📰</span>
            <h2 className="lc-section-title">{configs.title || 'Góc Sức Khỏe'}</h2>
          </div>
          <span className="lc-section-link" onClick={() => alert('Xem tất cả bài viết')}>Xem tất cả ›</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--lc-muted)' }}>Đang tải bài viết...</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--lc-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
            <div>Chưa có bài viết nào. Hãy thêm bài viết trong trang quản trị!</div>
          </div>
        ) : (
          <div className="lc-blog-grid">
            {featured && (
              <div className="lc-blog-featured">
                <img
                  src={featured.image || ARTICLE_THUMBNAILS[0]}
                  alt={featured.title}
                  onError={(e) => { e.target.src = `https://picsum.photos/600/300?random=featured`; }}
                />
                <div className="lc-blog-featured-info">
                  <span className="lc-blog-tag">Bài viết nổi bật</span>
                  <h3 className="lc-blog-featured-title">
                    <Link href={`/posts/${featured.slug}`}>{featured.title}</Link>
                  </h3>
                  <p className="lc-blog-featured-excerpt">
                    {featured.summary || (featured.content || '').replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                  </p>
                </div>
              </div>
            )}
            <div className="lc-blog-list">
              {listPosts.map((post, i) => (
                <div key={i} className="lc-blog-row">
                  <div className="lc-blog-row-img">
                    <img
                      src={post.image || ARTICLE_THUMBNAILS[i + 1] || `https://picsum.photos/100/75?random=${i}`}
                      alt={post.title}
                      onError={(e) => { e.target.src = `https://picsum.photos/100/75?random=${i + 20}`; }}
                    />
                  </div>
                  <div className="lc-blog-row-info">
                    <h4><Link href={`/posts/${post.slug}`}>{post.title}</Link></h4>
                    <span>Dược sĩ Long Châu · {new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 7. BRANDS BLOCK ─────────────────────────────────────────
const DEFAULT_BRANDS = [
  { name: 'JpanWell', logoImg: '/images/Jpanwell_63bc1e4aea.png', productImg: '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png', discount: 'Giảm đến 35%' },
  { name: 'New Nordic', logoImg: '/images/NEW_NORDIC_1_3ef22172fd.png', productImg: '/images/vien_uong_giam_vet_tham_sam_tan_nhang_giup_da_sang_min_skin_care_pigment_clear_60v_new_nordic_00011057_2_d86c2004d6.jpg', discount: 'Giảm đến 20%' },
  { name: 'Vitamins For Life', logoImg: '/images/Vitamins_For_Life_1_0783ec2683.png', productImg: '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png', discount: 'Giảm đến 26%' },
  { name: 'Brauer', logoImg: '/images/Vitabiotics_1_8d1424372d.png', productImg: '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png', discount: 'Giảm đến 20%' },
  { name: 'Vitabiotics', logoImg: '/images/Vitabiotics_1_8d1424372d.png', productImg: '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png', discount: 'Giảm đến 15%' },
];

function BrandsBlock({ configs = {} }) {
  const brands = (configs.items && configs.items.length > 0)
    ? configs.items.map((item, i) => ({ ...DEFAULT_BRANDS[i % DEFAULT_BRANDS.length], name: item.name, logoImg: item.logo || DEFAULT_BRANDS[i % DEFAULT_BRANDS.length].logoImg }))
    : DEFAULT_BRANDS;

  return (
    <div className="lc-section-bg-white">
      <div className="lc-section">
        <div className="lc-section-header">
          <div className="lc-section-title-row">
            <span className="lc-section-icon">🏅</span>
            <h2 className="lc-section-title">{configs.title || 'Thương hiệu yêu thích'}</h2>
          </div>
          <span className="lc-section-link" onClick={() => alert('Xem tất cả thương hiệu')}>Xem tất cả ›</span>
        </div>
        <div className="lc-brands-grid">
          {brands.map((brand, i) => (
            <div key={i} className="lc-brand-card" onClick={() => alert(`Xem thương hiệu "${brand.name}"`)}>
              <img
                className="lc-brand-product-img"
                src={brand.productImg}
                alt={brand.name}
                onError={(e) => { e.target.src = `https://picsum.photos/100/90?random=${i + 50}`; }}
              />
              <img
                className="lc-brand-logo-img"
                src={brand.logoImg}
                alt={`${brand.name} logo`}
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.appendChild(Object.assign(document.createElement('span'), { textContent: brand.name, style: 'font-weight:700;font-size:13px;color:var(--lc-text)' })); }}
              />
              <span className="lc-brand-discount">{brand.discount || ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 8. HTML BLOCK ───────────────────────────────────────────
function HtmlBlock({ configs = {} }) {
  return (
    <div className="lc-section-bg-white">
      <div className="lc-section">
        <div dangerouslySetInnerHTML={{ __html: configs.html || '' }} />
      </div>
    </div>
  );
}
