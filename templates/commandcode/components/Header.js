'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [logoText, setLogoText] = useState('Command Code');
  const [logoIcon, setLogoIcon] = useState('⚡');
  const [links, setLinks] = useState([]);
  const [pagesList, setPagesList] = useState([]);

  useEffect(() => {
    async function loadNavbarData() {
      try {
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const s = await settingsRes.json();
          if (s.settings) {
            setLogoText(s.settings.header_logo_text || 'Command Code');
            setLogoIcon(s.settings.header_logo_icon || '⚡');
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
          // Filter out the 'index' page from navbar links as it is the homepage
          const customPages = (p.pages || []).filter(item => item.slug !== 'index');
          setPagesList(customPages);
        }
      } catch (err) {
        console.error('Navbar pages load error:', err);
      }
    }
    loadNavbarData();
  }, []);

  return (
    <header className="navbar">
      <Link href="/" className="logo-section">
        <span className="icon">{logoIcon}</span>
        <span>{logoText}</span>
      </Link>
      <ul className="nav-links">
        {/* Render custom configuration links */}
        {links.map((link, idx) => (
          <li key={idx}>
            {link.href.startsWith('/') ? (
              <Link href={link.href}>{link.label}</Link>
            ) : (
              <a href={link.href}>{link.label}</a>
            )}
          </li>
        ))}
        {/* Render dynamic pages */}
        {pagesList.map(p => (
          <li key={p.id}>
            <Link href={`/${p.slug}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
      <div className="nav-actions">
        <Link href="/login" className="btn btn-secondary">Login</Link>
        <Link href="/register" className="btn btn-primary">Sign Up</Link>
      </div>
    </header>
  );
}
