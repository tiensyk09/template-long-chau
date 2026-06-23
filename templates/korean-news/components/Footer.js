'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [logoIcon, setLogoIcon] = useState('📰');
  const [logoText, setLogoText] = useState('DAILY KOREAN NEWS');
  const [copyright, setCopyright] = useState('© 2026 DAILY KOREAN NEWS. All rights reserved.');
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    async function loadFooterData() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const s = await res.json();
          if (s.settings) {
            setLogoIcon(s.settings.header_logo_icon || '📰');
            setLogoText(s.settings.header_logo_text || 'DAILY KOREAN NEWS');
            setCopyright(s.settings.footer_copyright || '© 2026 DAILY KOREAN NEWS. All rights reserved.');
            if (s.settings.footer_columns) {
              try {
                setColumns(JSON.parse(s.settings.footer_columns));
              } catch (e) {
                setColumns([]);
              }
            }
          }
        }
      } catch (err) {
        console.error('Footer settings load error:', err);
      }
    }
    loadFooterData();
  }, []);

  const defaultColumns = [
    {
      title: "뉴스 카테고리",
      links: [
        { label: "정치", href: "/#category-politics" },
        { label: "경제", href: "/#category-economy" },
        { label: "사회", href: "/#category-society" },
        { label: "문화", href: "/#category-culture" }
      ]
    },
    {
      title: "회사소개",
      links: [
        { label: "회사 소개", href: "/about" },
        { label: "개인정보처리방침", href: "#" },
        { label: "이용약관", href: "#" }
      ]
    }
  ];

  const colsToRender = columns.length > 0 ? columns : defaultColumns;

  return (
    <footer className="main-footer">
      <div className="app-container">
        <div className="footer-grid">
          <div className="footer-logo">
            <h4 style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span>{logoIcon}</span> {logoText}
            </h4>
            <p style={{ lineHeight: '1.6', color: 'var(--muted)', marginTop: '8px', fontSize: '13px' }}>
              글로벌 최신 뉴스와 신뢰할 수 있는 정보를 성실하고 정확하게 전달하는 독립 언론사입니다.
            </p>
          </div>
          {colsToRender.map((col, idx) => (
            <div className="footer-col" key={idx}>
              <h4>{col.title}</h4>
              <ul>
                {col.links?.map((link, lIdx) => (
                  <li key={lIdx}>
                    {link.href.startsWith('/') ? (
                      <Link href={link.href}>{link.label}</Link>
                    ) : (
                      <a href={link.href}>{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <p>{copyright}</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#newsletter">구독 신청</a>
            <span>•</span>
            <a href="#top">맨 위로 ▲</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
