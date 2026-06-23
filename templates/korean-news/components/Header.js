'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [logoText, setLogoText] = useState('DAILY KOREAN NEWS');
  const [logoIcon, setLogoIcon] = useState('📰');
  const [links, setLinks] = useState([]);
  const [pagesList, setPagesList] = useState([]);
  const [dateTimeStr, setDateTimeStr] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // 1. Set current date & time on client side
    const updateTime = () => {
      const now = new Date();
      const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setDateTimeStr(now.toLocaleDateString('ko-KR', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // 2. Load theme settings from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark-mode');
      setIsDarkMode(true);
    } else {
      document.body.classList.remove('dark-mode');
      setIsDarkMode(false);
    }

    // 3. Load settings & navbar data
    async function loadNavbarData() {
      try {
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const s = await settingsRes.json();
          if (s.settings) {
            setLogoText(s.settings.header_logo_text || 'DAILY KOREAN NEWS');
            setLogoIcon(s.settings.header_logo_icon || '📰');
            if (s.settings.header_links) {
              try {
                setLinks(JSON.parse(s.settings.header_links));
              } catch (e) {
                setLinks([]);
              }
            }
          }
        }
      } catch (err) {
        console.error('Navbar settings load error:', err);
      }

      try {
        const pagesRes = await fetch('/api/pages?status=published');
        if (pagesRes.ok) {
          const p = await pagesRes.json();
          const customPages = (p.pages || []).filter(item => item.slug !== 'index');
          setPagesList(customPages);
        }
      } catch (err) {
        console.error('Navbar pages load error:', err);
      }
    }
    loadNavbarData();

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <>
      {/* 1. Top Red/Dark Bar */}
      <div className="top-bar">
        <div className="app-container top-bar-content">
          <div className="top-bar-left">
            <span>📅 {dateTimeStr || 'Tue, Jun 23, 2026'}</span>
          </div>
          <div className="top-bar-right">
            <span>Subscribe to our newsletter &amp; never miss our best posts.</span>
            <a href="#newsletter">Subscribe Now!</a>
          </div>
        </div>
      </div>

      {/* 2. Main Header */}
      <header className="main-header">
        <div className="app-container header-content">
          {/* Social media icons on left */}
          <div className="social-links">
            <a href="#" aria-label="Facebook">🔵</a>
            <a href="#" aria-label="X">⚫</a>
            <a href="#" aria-label="Telegram">✈️</a>
            <a href="#" aria-label="Instagram">📸</a>
            <a href="#" aria-label="YouTube">🔴</a>
          </div>

          {/* Logo in center */}
          <div className="logo-area">
            <Link href="/">
              <h1 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '32px' }}>{logoIcon}</span> {logoText}
              </h1>
            </Link>
            <p>글로벌 최신 뉴스와 신뢰할 수 있는 정보.</p>
          </div>

          {/* Theme switcher and user icon on right */}
          <div className="header-right">
            <button className="theme-toggle-btn" onClick={toggleTheme} title="다크 모드 전환">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <Link href="/login" className="user-btn" title="로그인 / 회원가입">
              👤
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Navigation menu bar */}
      <nav className="nav-menu-bar">
        <div className="app-container nav-menu-content">
          <div className="menu-left">
            <span className="menu-trigger">☰</span>
            <ul className="menu-links">
              <li>
                <Link href="/" className="active">홈</Link>
              </li>
              {links.map((link, idx) => (
                <li key={idx}>
                  {link.href.startsWith('/') ? (
                    <Link href={link.href}>{link.label}</Link>
                  ) : (
                    <a href={link.href}>{link.label}</a>
                  )}
                </li>
              ))}
              {pagesList.map(p => (
                <li key={p.id}>
                  <Link href={`/${p.slug}`}>{p.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="menu-right">
            <a href="#newsletter" className="subscribe-btn">🔔 Subscribe</a>
            <span className="search-trigger" title="검색">🔍</span>
          </div>
        </div>
      </nav>
    </>
  );
}
