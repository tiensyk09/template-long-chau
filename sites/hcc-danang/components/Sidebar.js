'use client';
import { useState } from 'react';

const menuItems = [
  { label: 'Giới thiệu nhà trường', href: '/gioi-thieu' },
  { label: 'Tin Tức - Sự kiện', href: '/news?cat=hoat-dong-dang-uy' },
  { label: 'Hoạt động chuyên môn', href: '/news?cat=chinh-quyen-nha-nuoc' },
  { label: 'Phong trào Đoàn - Đội', href: '/news?cat=mat-tran-doan-the' },
  { label: 'Tuyển sinh lớp 1', href: '/news?cat=cai-cach-hanh-chinh' },
  { label: 'Tài nguyên học tập', href: '/news?cat=kinh-te-moi-truong' },
  { label: 'Góc phụ huynh học sinh', href: '/news?cat=van-hoa-xa-hoi', active: true },
];

const scheduleItems = [
  { label: 'Lịch công tác tuần của Ban Giám hiệu Trường TH Ngô Quyền', href: '/news?cat=lich-lam-viec' },
  { label: 'Thông báo lịch kiểm tra cuối học kỳ II', href: '/news?cat=chi-dao-dieu-hanh' },
];

const newsTinChiDao = [
  {
    imgSrc: '',
    title: 'Đẩy mạnh ứng dụng công nghệ thông tin và số hóa học bạ tại nhà trường',
    href: '/news?cat=chuyen-doi-so',
  },
];

const newsListChiDao = [
  { label: 'Trường Tiểu học Ngô Quyền triển khai chuyên đề STEM sáng tạo', href: '/news?cat=chinh-quyen-nha-nuoc' },
  { label: 'Hội thi Giáo viên dạy giỏi cấp trường đạt kết quả xuất sắc', href: '/news?cat=hoat-dong-dang-uy' },
  { label: 'Kế hoạch tổ chức sinh hoạt ngoại khóa giáo dục kỹ năng sống', href: '/news?cat=chinh-quyen-nha-nuoc' },
];

const newsChinhSach = [
  {
    imgSrc: '',
    title: 'Hướng dẫn quy trình chi tiết đăng ký hồ sơ tuyển sinh lớp 1 trực tuyến',
    href: '/news?cat=cai-cach-hanh-chinh',
  },
];

const newsListChinhSach = [
  { label: 'Tập huấn giáo viên sử dụng bài giảng điện tử tương tác thông minh', href: '/news?cat=chuyen-doi-so' },
  { label: 'Các hoạt động chào mừng Đại hội Liên đội nhiệm kỳ mới', href: '/news?cat=mat-tran-doan-the' },
  { label: 'Bữa ăn bán trú dinh dưỡng và an toàn vệ sinh thực phẩm', href: '/news?cat=van-hoa-xa-hoi' },
];

const sidebarBanners = [
  {
    id: 'cong-thong-tin',
    imgSrc: 'https://cdn.dongnai.gov.vn/uploads/dongnai/logo_cttdt.png',
    href: 'https://danang.edu.vn',
    alt: 'Cổng thông tin Sở GD&ĐT Đà Nẵng',
  },
  {
    id: 'tro-ly-ao',
    imgSrc: '',
    href: '#',
    alt: 'Hệ thống Quản lý Học sinh & Học bạ điện tử',
  },
  {
    id: 'cong-dvc-quocgia',
    imgSrc: 'https://cdn.dongnai.gov.vn/uploads/dongnai/logo_dvc.png',
    href: 'https://dichvucong.gov.vn/',
    alt: 'Cổng dịch vụ công Quốc gia',
  },
];

export default function Sidebar() {
  const [surveyVote, setSurveyVote] = useState('rat-hai-long');

  return (
    <aside className="sidebar" aria-label="Sidebar">
      {/* Search */}
      <div className="sidebar-search">
        <input type="text" id="sidebar-search-input" placeholder="Tìm kiếm..." aria-label="Tìm kiếm" />
        <button type="button" aria-label="Nút tìm kiếm">Tìm</button>
      </div>

      {/* Main navigation menu */}
      <nav className="sidebar-menu" aria-label="Menu bên">
        {menuItems.map((item, i) => (
          <ul key={i}>
            <li className={item.active ? 'active' : ''}>
              <a href={item.href}>{item.label}</a>
            </li>
          </ul>
        ))}
      </nav>

      {/* News: Tin chuyên môn */}
      <div className="news-section">
        <div className="section-header">
          TIN CHUYÊN MÔN - GIẢNG DẠY
        </div>
        <div className="news-featured">
          <a href={newsTinChiDao[0].href}>
            <img
              src={newsTinChiDao[0].imgSrc}
              alt={newsTinChiDao[0].title}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <p>{newsTinChiDao[0].title}</p>
          </a>
        </div>
        <ul className="news-list">
          {newsListChiDao.map((item, i) => (
            <li key={i}><a href={item.href}>{item.label}</a></li>
          ))}
        </ul>
      </div>

      {/* News: Hoạt động học tập */}
      <div className="news-section">
        <div className="section-header">
          TIN HOẠT ĐỘNG - PHONG TRÀO
        </div>
        <div className="news-featured">
          <a href={newsChinhSach[0].href}>
            <img
              src={newsChinhSach[0].imgSrc}
              alt={newsChinhSach[0].title}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <p>{newsChinhSach[0].title}</p>
          </a>
        </div>
        <ul className="news-list">
          {newsListChinhSach.map((item, i) => (
            <li key={i}><a href={item.href}>{item.label}</a></li>
          ))}
        </ul>
      </div>

      {/* Schedule */}
      <div className="sidebar-schedule">
        <div className="section-header">LỊCH CÔNG TÁC</div>
        <div className="schedule-content">
          <ul>
            {scheduleItems.map((item, i) => (
              <li key={i}><a href={item.href}>{item.label}</a></li>
            ))}
          </ul>
        </div>
      </div>

      {/* Thông báo */}
      <div className="sidebar-schedule">
        <div className="section-header">THÔNG BÁO MỚI</div>
        <div className="schedule-content">
          <p style={{ fontSize: '12px', color: '#999' }}>Chưa có thông báo khẩn mới trong ngày.</p>
        </div>
      </div>

      {/* Stats counter */}
      <div className="sidebar-stats">
        <div className="section-header">THỐNG KÊ TRUY CẬP</div>
        <div className="stats-content">
          <p className="stat-label">Hôm nay</p>
          <p className="stat-number">3,293</p>
          <hr className="stat-divider" />
          <p className="stat-total-label">Tổng lượt truy cập</p>
          <p className="stat-total">1,067,367</p>
        </div>
      </div>

      {/* Survey */}
      <div className="sidebar-survey">
        <div className="section-header">THĂM DÒ Ý KIẾN</div>
        <div className="survey-content">
          <p className="survey-question">Khảo sát ý kiến phụ huynh về các hoạt động bán trú</p>
          {['Rất hài lòng', 'Hài lòng', 'Ý kiến khác'].map((opt, i) => (
            <label key={i} className="radio-option">
              <input
                type="radio"
                name="survey"
                value={opt.toLowerCase().replace(' ', '-')}
                checked={surveyVote === opt.toLowerCase().replace(' ', '-')}
                onChange={() => setSurveyVote(opt.toLowerCase().replace(' ', '-'))}
              />
              {opt}
            </label>
          ))}
          <div className="survey-buttons">
            <button id="survey-vote-btn" className="btn-vote" type="button">Bình chọn</button>
            <button id="survey-result-btn" className="btn-result" type="button">Kết quả</button>
          </div>
        </div>
      </div>

      {/* Sidebar banners */}
      {sidebarBanners.map((banner) => (
        <div key={banner.id} className="sidebar-banner">
          <a href={banner.href} target="_blank" rel="noopener noreferrer">
            <img
              src={banner.imgSrc}
              alt={banner.alt}
              onError={(e) => {
                e.target.parentElement.parentElement.style.display = 'none';
              }}
            />
          </a>
        </div>
      ))}
    </aside>
  );
}
