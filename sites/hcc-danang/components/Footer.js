'use client';
import Link from 'next/link';
import { useSettings } from './SettingsProvider';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer>
      <div className="container">
        <nav className="footer-nav">
          <Link href="/">Trang chủ</Link>
          <Link href="#">Cấu trúc trang</Link>
          <Link href="#">Liên hệ</Link>
          <Link href="#">Đăng nhập</Link>
        </nav>
        <div className="footer-info">
          <p className="site-name">{settings.header_main_title || 'TRƯỜNG TIỂU HỌC NGÔ QUYỀN'}</p>
          <p>Hiệu trưởng / Người đại diện: {settings.footer_principal || 'Trịnh Thị Hồng'}</p>
          <p>Địa chỉ: {settings.footer_address || 'Khối phố Phú Phong, Phường Quảng Phú, TP Đà Nẵng, Việt Nam'}</p>
          <p>Mã số thuế: {settings.footer_tax_code || '4000601537'} &nbsp;|&nbsp; Tình trạng: {settings.footer_status || 'Đang hoạt động'} &nbsp;|&nbsp; Ngày hoạt động: {settings.footer_date_active || '15/04/2009'}</p>
          <p>Điện thoại: {settings.header_phone || '0510 3506281'} &nbsp;|&nbsp; Email: <a href={`mailto:${settings.header_email || 'thngoquyen@danang.edu.vn'}`}>{settings.header_email || 'thngoquyen@danang.edu.vn'}</a></p>
        </div>
      </div>
      <div className="footer-bottom" />
    </footer>
  );
}
