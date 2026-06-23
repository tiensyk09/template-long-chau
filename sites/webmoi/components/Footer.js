'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [logoIcon, setLogoIcon] = useState('⚡');
  const [logoText, setLogoText] = useState('Command Code');
  const [copyright, setCopyright] = useState('© 2026 Command Code, 2261 Market St #5698, San Francisco, CA 94114. All rights reserved.');
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    async function loadFooterData() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const s = await res.json();
          if (s.settings) {
            setLogoIcon(s.settings.header_logo_icon || '⚡');
            setLogoText(s.settings.header_logo_text || 'Command Code');
            setCopyright(s.settings.footer_copyright || '© 2026 Command Code. All rights reserved.');
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
      title: "Product",
      links: [
        { label: "Docs", href: "/#docs" },
        { label: "Features", href: "/#features" },
        { label: "Pricing", href: "/#pricing" },
        { label: "Posts", href: "/#posts" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" }
      ]
    }
  ];

  const colsToRender = columns.length > 0 ? columns : defaultColumns;

  return (
    <footer className="footer app-container" style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', paddingBottom: '30px', marginTop: '60px' }}>
      <div className="footer-grid">
        <div className="footer-col">
          <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>{logoIcon} {logoText}</h4>
          <p style={{ lineHeight: '1.7', color: 'var(--muted)' }}>
            The first coding agent that learns your conventions and taste. Powered by taste-1 Reinforcement Learning harness.
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

      <div className="footer-bottom" style={{ marginTop: '40px' }}>
        <p>{copyright}</p>
      </div>
    </footer>
  );
}
