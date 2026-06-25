'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from './CartContext';

const QUICK_TAGS = ['Canxi', 'Omega 3', 'Kẽm', 'Sắt', 'Kem chống nắng', 'Thuốc nhỏ mắt', 'Sữa rửa mặt', 'Men vi sinh', 'Dung dịch vệ sinh', 'Vitamin C'];

const NAV_ITEMS = [
  { label: 'Thực phẩm chức năng', href: '/products?category=thuc-pham-chuc-nang' },
  { label: 'Dược mỹ phẩm', href: '/products?category=duoc-my-pham' },
  { label: 'Thuốc', href: '/products?category=thuoc-ke-don' },
  { label: 'Chăm sóc cá nhân', href: '/products?category=cham-soc-ca-nhan' },
  { label: 'Thiết bị y tế', href: '/products?category=thiet-bi-y-te' },
  { label: 'Tiêm chủng', href: '/#healthchecks' },
  { label: 'Bệnh & Góc sức khỏe', href: '/#posts' },
  { label: 'Hệ thống nhà thuốc', href: '/#stores' },
];

export default function Header() {
  const router = useRouter();
  const [logoText, setLogoText] = useState('LONG CHÂU');
  const [logoIcon, setLogoIcon] = useState('');
  const [links, setLinks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart();

  useEffect(() => {
    async function loadNavbarData() {
      try {
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const s = await settingsRes.json();
          if (s.settings) {
            setLogoText(s.settings.header_logo_text || 'LONG CHÂU');
            setLogoIcon(s.settings.header_logo_icon || '');
            if (s.settings.header_links) {
              try { setLinks(JSON.parse(s.settings.header_links)); } catch {}
            }
          }
        }
      } catch (err) {}
    }
    loadNavbarData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      {/* Topbar */}
      <div className="lc-topbar">
        <div className="lc-topbar-inner">
          <a href="#" onClick={(e) => e.preventDefault()}>
            📱 Tải ứng dụng
          </a>
          <a href="tel:18006928">
            📞 Tư vấn ngay: <strong>1800 6928</strong>
          </a>
        </div>
      </div>

      {/* Main Header */}
      <header className="lc-header">
        <div className="lc-header-inner">
          {/* Logo */}
          <Link href="/" className="lc-logo">
            <div className="lc-logo-badge">
              <span>FPT Retail</span>
              <img src="/images/logo_default_web_78584a5cc6.png" alt="Long Châu Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <div>
              <div className="lc-logo-name">{logoText}</div>
              <div className="lc-logo-sub">NHÀ THUỐC</div>
            </div>
          </Link>

          {/* Search */}
          <form className="lc-search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Freeship qua ứng dụng"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">🔍 Tìm kiếm</button>
          </form>

          {/* Actions */}
          <div className="lc-header-actions">
            <Link href="/login" className="lc-btn-login">
              👤 Đăng nhập
            </Link>
            <Link href="/cart" className="lc-btn-cart" style={{ position: 'relative', textDecoration: 'none' }}>
              🛒 Giỏ hàng
              {totalItems > 0 && (
                <span className="lc-cart-badge" style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: 'var(--lc-orange, #f57c00)',
                  color: '#fff',
                  borderRadius: '50%',
                  minWidth: '18px',
                  height: '18px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  border: '1.5px solid #fff'
                }}>
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Quick tags below header */}
        <div className="lc-quick-tags">
          <div className="lc-quick-tags-inner">
            {QUICK_TAGS.map((tag, i) => (
              <span key={i} className="lc-quick-tag">{tag}</span>
            ))}
          </div>
        </div>
      </header>

      {/* Navbar */}
      <nav className="lc-navbar">
        <div className="lc-navbar-inner">
          {NAV_ITEMS.map((item, i) => (
            <Link key={i} href={item.href} className="lc-nav-item">
              {item.label}
              {i < 5 && <span style={{ fontSize: '10px' }}>▾</span>}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
