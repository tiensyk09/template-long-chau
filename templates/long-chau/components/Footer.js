'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const FOOTER_COLS = [
  {
    title: 'VỀ CHÚNG TÔI',
    links: [
      { label: 'Giới thiệu', href: '/about' },
      { label: 'Hệ thống cửa hàng', href: '#' },
      { label: 'Giấy phép kinh doanh', href: '#' },
      { label: 'Quy chế hoạt động', href: '#' },
      { label: 'Chính sách đặt cọc', href: '#' },
      { label: 'Chính sách nội dung', href: '#' },
    ]
  },
  {
    title: 'DANH MỤC',
    links: [
      { label: 'Thực phẩm chức năng', href: '#' },
      { label: 'Dược mỹ phẩm', href: '#' },
      { label: 'Thuốc', href: '#' },
      { label: 'Chăm sóc cá nhân', href: '#' },
      { label: 'Trang thiết bị y tế', href: '#' },
      { label: 'Tiêm chủng Long Châu', href: '#' },
    ]
  },
  {
    title: 'TÌM HIỂU THÊM',
    links: [
      { label: 'Góc sức khỏe', href: '/#posts' },
      { label: 'Tra cứu thuốc', href: '#' },
      { label: 'Tra cứu dược chất', href: '#' },
      { label: 'Tra cứu dược liệu', href: '#' },
      { label: 'Bệnh thường gặp', href: '#' },
      { label: 'Bệnh viện', href: '#' },
    ]
  },
];

const PAYMENT_ICONS = [
  { name: 'VISA', file: 'VISA_c4890cfae5.png' },
  { name: 'Mastercard', file: 'MASTERCARD_ac415285f7.png' },
  { name: 'JCB', file: 'JCB_064cae0070.png' },
  { name: 'NAPAS', file: 'NAPAS_acbb2137b1.png' },
  { name: 'MOMO', file: 'MOMO_e3029ab45b.png' },
  { name: 'ZaloPay', file: 'ZALOPAY_68ca85ebd3.png' },
  { name: 'VNPAY', file: 'VNPAY_6b0be38227.png' },
];

export default function Footer() {
  const [copyright, setCopyright] = useState('© 2026 FPT Long Châu. Thành viên Tập đoàn FPT. GPDKKD số 0314811806 do Sở KHĐT TP.HCM cấp ngày 28/12/2017.');

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.settings?.footer_copyright) setCopyright(d.settings.footer_copyright);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Trust badges */}
      <div className="lc-trust-bar">
        <div className="lc-trust-inner">
          {[
            { icon: '🛡️', title: 'Thuốc chính hãng', sub: 'đa dạng và chuyên sâu' },
            { icon: '📦', title: 'Đổi trả trong 30 ngày', sub: 'kể từ ngày mua hàng' },
            { icon: '👍', title: 'Cam kết 100%', sub: 'chất lượng sản phẩm' },
            { icon: '🚚', title: 'Miễn phí vận chuyển', sub: 'theo chính sách giao hàng' },
          ].map((item, i) => (
            <div key={i} className="lc-trust-item">
              <span className="lc-trust-icon">{item.icon}</span>
              <div className="lc-trust-info">
                <strong>{item.title}</strong>
                <span>{item.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Store locator banner */}
      <div className="lc-store-banner">
        <div className="lc-store-inner">
          <div className="lc-store-text">
            📍 Xem hệ thống nhà thuốc trên toàn quốc
          </div>
          <button className="lc-store-btn">Xem danh sách nhà thuốc</button>
        </div>
      </div>

      {/* Main Footer */}
      <footer className="lc-footer">
        <div className="lc-footer-inner">
          <div className="lc-footer-grid">
            {/* Logo + hotlines column */}
            <div className="lc-footer-logo-col">
              <div className="lc-footer-logo">
                <div className="lc-footer-logo-badge">
                  <span>FPT Retail</span>
                  <img src="/images/logo_default_web_78584a5cc6.png" alt="Long Châu" style={{ height: '20px', filter: 'brightness(0) invert(1)' }} onError={(e) => e.target.style.display='none'} />
                </div>
                <span className="lc-footer-logo-name">Long Châu</span>
              </div>
              <div className="lc-footer-hotlines">
                <div className="lc-footer-hotline-row">
                  <div>Tổng đài (8:00–22:00)</div>
                  <div>Tư vấn mua hàng</div>
                  <strong>1800 6928 <span style={{ fontWeight: 400, fontSize: '11px' }}>(Nhánh 1)</span></strong>
                </div>
                <div className="lc-footer-hotline-row">
                  <div>Tư vấn Tiêm chủng</div>
                  <strong>1800 6928 <span style={{ fontWeight: 400, fontSize: '11px' }}>(Nhánh 2)</span></strong>
                </div>
                <div className="lc-footer-hotline-row">
                  <div>Tư vấn Xét nghiệm</div>
                  <strong>1800 6928 <span style={{ fontWeight: 400, fontSize: '11px' }}>(Nhánh 3)</span></strong>
                </div>
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_COLS.map((col, i) => (
              <div key={i}>
                <div className="lc-footer-section-title">{col.title}</div>
                <div className="lc-footer-links">
                  {col.links.map((link, j) => (
                    <Link key={j} href={link.href}>{link.label}</Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Social + payments */}
            <div>
              <div className="lc-footer-section-title">KẾT NỐI VỚI CHÚNG TÔI</div>
              <div className="lc-footer-social">
                <div className="lc-social-btn" title="Facebook">
                  <img src="/images/facebook_logo_3152b9bb16.svg" alt="Facebook" style={{ width: '18px' }} onError={(e) => { e.target.parentElement.innerHTML = '👤'; }} />
                </div>
                <div className="lc-social-btn" title="Zalo">
                  <img src="/images/Logo_Zalo_979d41d52b.svg" alt="Zalo" style={{ width: '18px' }} onError={(e) => { e.target.parentElement.innerHTML = '💬'; }} />
                </div>
              </div>
              <div className="lc-footer-section-title" style={{ marginTop: '16px' }}>PHƯƠNG THỨC THANH TOÁN</div>
              <div className="lc-footer-payments">
                {PAYMENT_ICONS.map((p, i) => (
                  <img key={i} src={`/images/${p.file}`} alt={p.name} className="lc-payment-icon" onError={(e) => e.target.style.display='none'} />
                ))}
              </div>
              <div style={{ marginTop: '16px' }}>
                <img src="/images/bo_cong_thuong_a8e5750f57.svg" alt="Bộ Công Thương" style={{ height: '32px' }} onError={(e) => e.target.style.display='none'} />
              </div>
            </div>
          </div>

          <div className="lc-footer-bottom">
            {copyright}
          </div>
        </div>
      </footer>
    </>
  );
}
