'use client';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="site-header">
      {/* Top bar */}
      <div className="header-topbar">
        <div className="container">
          <div className="header-contact">
            <span>📞 0510 3506281</span>
            <span>✉️ <a href="mailto:thngoquyen@danang.edu.vn">thngoquyen@danang.edu.vn</a></span>
          </div>
          <a href="/admin/login" className="login-link">👤 Đăng nhập quản trị</a>
        </div>
      </div>

      {/* Main header */}
      <div className="header-main-row">
        <div className="container">
          <div className="header-inner">
            <Link href="/" className="header-logo">
              <img
                src="/logos/logo_ngo_quyen.png"
                alt="Logo Trường Tiểu học Ngô Quyền"
                onError={(e) => { 
                  e.target.src = "https://upload.wikimedia.org/wikipedia/commons/4/47/Logo_TH_Ngo_Quyen.png"; 
                }}
              />
            </Link>
            <div className="header-text">
              <span className="sub">SỞ GIÁO DỤC VÀ ĐÀO TẠO ĐÀ NẴNG</span>
              <h1 className="main">TRƯỜNG TIỂU HỌC NGÔ QUYỀN</h1>
              <p className="description">CỔNG THÔNG TIN ĐIỆN TỬ CHÍNH THỨC</p>
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

