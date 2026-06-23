'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSettings } from './SettingsProvider';

export default function Header() {
  const { settings } = useSettings();
  const [lang, setLang] = useState('vi');

  useEffect(() => {
    const match = document.cookie.match(/site_lang=([^;]+)/);
    if (match) setLang(match[1]);
  }, []);

  const headerBgStyle = settings.header_banner_url
    ? { backgroundImage: `url(${settings.header_banner_url})`, backgroundSize: 'cover' }
    : {};

  const handleLangChange = (newLang) => {
    document.cookie = `site_lang=${newLang}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <header className="site-header" style={headerBgStyle}>
      {/* Top bar */}
      <div className="header-topbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="header-contact">
            <span>📞 {settings.header_phone || '0510 3506281'}</span>
            <span>✉️ <a href={`mailto:${settings.header_email || 'thngoquyen@danang.edu.vn'}`}>{settings.header_email || 'thngoquyen@danang.edu.vn'}</a></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link href="/admin/login" className="login-link">
              👤 {lang === 'en' ? 'Admin Login' : 'Đăng nhập quản trị'}
            </Link>
            <div className="lang-switcher" style={{ display: 'flex', gap: '6px' }}>
              <button 
                onClick={() => handleLangChange('vi')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '15px',
                  padding: '2px',
                  opacity: lang === 'vi' ? 1 : 0.45,
                  transform: lang === 'vi' ? 'scale(1.15)' : 'none',
                  transition: 'all 0.15s'
                }}
                title="Tiếng Việt"
              >
                🇻🇳
              </button>
              <button 
                onClick={() => handleLangChange('en')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '15px',
                  padding: '2px',
                  opacity: lang === 'en' ? 1 : 0.45,
                  transform: lang === 'en' ? 'scale(1.15)' : 'none',
                  transition: 'all 0.15s'
                }}
                title="English"
              >
                🇬🇧
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="header-main-row">
        <div className="container">
          <div className="header-inner">
            <Link href="/" className="header-logo">
              <img
                src={settings.header_logo_url || "/logos/logo_ngo_quyen.png"}
                alt="Logo Trường Tiểu học Ngô Quyền"
                onError={(e) => { 
                  e.target.src = "https://upload.wikimedia.org/wikipedia/commons/4/47/Logo_TH_Ngo_Quyen.png"; 
                }}
              />
            </Link>
            <div className="header-text">
              <span className="sub">{settings.header_upper_title || 'SỞ GIÁO DỤC VÀ ĐÀO TẠO ĐÀ NẴNG'}</span>
              <h1 className="main">{settings.header_main_title || 'TRƯỜNG TIỂU HỌC NGÔ QUYỀN'}</h1>
              <p className="description">{settings.header_description || 'CỔNG THÔNG TIN ĐIỆN TỬ CHÍNH THỨC'}</p>
            </div>
            <div className="header-decor">
              {/* Modern subtle vector pattern container styled in CSS */}
              <div className="decor-circle"></div>
              <div className="decor-circle-inner"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

