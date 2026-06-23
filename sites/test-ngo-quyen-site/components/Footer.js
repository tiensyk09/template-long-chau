import Link from 'next/link';

export default function Footer() {
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
          <p className="site-name">TRƯỜNG TIỂU HỌC NGÔ QUYỀN</p>
          <p>Hiệu trưởng / Người đại diện: Trịnh Thị Hồng</p>
          <p>Địa chỉ: Khối phố Phú Phong, Phường Quảng Phú, TP Đà Nẵng, Việt Nam</p>
          <p>Mã số thuế: 4000601537 &nbsp;|&nbsp; Tình trạng: Đang hoạt động &nbsp;|&nbsp; Ngày hoạt động: 15/04/2009</p>
          <p>Điện thoại: 0510 3506281 &nbsp;|&nbsp; Email: <a href="mailto:thngoquyen@danang.edu.vn">thngoquyen@danang.edu.vn</a></p>
        </div>
      </div>
      <div className="footer-bottom" />
    </footer>
  );
}
