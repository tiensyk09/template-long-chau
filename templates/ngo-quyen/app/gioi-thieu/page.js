import Link from 'next/link';

export const metadata = {
  title: 'Giới thiệu | Trường Tiểu học Ngô Quyền',
  description: 'Giới thiệu về Trường Tiểu học Ngô Quyền, Phường Quảng Phú, TP Đà Nẵng',
};

export default function GioiThieuPage() {
  return (
    <div className="page-container">
      <div className="page-layout">
        <main className="page-main">
          <nav className="breadcrumb-bar">
            <Link href="/">Trang nhất</Link> › <span>Giới thiệu</span>
          </nav>
          <div className="article-card">
            <h1 className="article-heading">GIỚI THIỆU TRƯỜNG TIỂU HỌC NGÔ QUYỀN</h1>
            <div className="article-meta-bar">
              <span style={{ fontSize: 12, color: '#5a6478' }}>🕐 Ngày hoạt động chính thức: 15/04/2009</span>
            </div>
            <div className="article-body">
              <h2>TỔNG QUAN VỀ NHÀ TRƯỜNG</h2>
              <p>Trường Tiểu học Ngô Quyền là một cơ sở giáo dục tiểu học công lập chính thức thuộc hệ thống giáo dục quốc dân Việt Nam, phục vụ giảng dạy và giáo dục học sinh tiểu học tại khu vực.</p>
              <p>Trường luôn nỗ lực xây dựng môi trường sư phạm thân thiện, tích cực, nâng cao chất lượng giáo dục toàn diện cả về văn hóa, đạo đức, thể chất và kỹ năng sống cho học sinh.</p>

              <h2>THÔNG TIN PHÁP LÝ & LIÊN HỆ</h2>
              <ul>
                <li><strong>Tên đơn vị:</strong> Trường Tiểu học Ngô Quyền</li>
                <li><strong>Mã số thuế:</strong> 4000601537</li>
                <li><strong>Tình trạng hoạt động:</strong> Đang hoạt động</li>
                <li><strong>Địa chỉ đăng ký:</strong> Khối phố Phú Phong, Phường Quảng Phú, TP Đà Nẵng, Việt Nam</li>
                <li><strong>Điện thoại liên hệ:</strong> 0510 3506281</li>
                <li><strong>Người đại diện pháp luật:</strong> Trịnh Thị Hồng (Hiệu trưởng)</li>
              </ul>

              <h2>CƠ CẤU BAN GIÁM HIỆU & HỘI ĐỒNG SƯ PHẠM</h2>
              <table className="org-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Họ và tên</th>
                    <th>Chức vụ / Tổ chuyên môn</th>
                    <th>Nhiệm vụ chính</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td><strong>Trịnh Thị Hồng</strong></td>
                    <td>Hiệu trưởng / Đại diện pháp luật</td>
                    <td>Quản lý điều hành chung toàn bộ hoạt động nhà trường</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>---</td>
                    <td>Phó Hiệu trưởng phụ trách chuyên môn</td>
                    <td>Chỉ đạo dạy học và khảo sát chất lượng giảng dạy</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>---</td>
                    <td>Tổng phụ trách Đội</td>
                    <td>Quản lý hoạt động Đội Thiếu niên Tiền phong Hồ Chí Minh</td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>---</td>
                    <td>Tổ trưởng chuyên môn các Khối 1 - 5</td>
                    <td>Phụ trách sinh hoạt chuyên môn khối lớp giảng dạy</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
        <aside className="page-sidebar">
          <div className="sidebar-widget">
            <div className="sidebar-widget-header"><span>DANH MỤC GIỚI THIỆU</span></div>
            <div className="sidebar-widget-body">
              <Link href="/gioi-thieu" className="sidebar-news-link">Tổng quan chung</Link>
              <Link href="/gioi-thieu" className="sidebar-news-link">Thông tin liên hệ</Link>
              <Link href="/gioi-thieu" className="sidebar-news-link">Cơ cấu tổ chức</Link>
              <Link href="/gioi-thieu" className="sidebar-news-link">Lịch sử nhà trường</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
