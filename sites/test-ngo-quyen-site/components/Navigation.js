'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const defaultMainMenu = [
  { label: 'Trang chủ', href: '/', active: true },
  {
    label: 'Giới thiệu', href: '/gioi-thieu',
    children: [
      { label: 'Tổng quan nhà trường', href: '/gioi-thieu' },
      { label: 'Ban Giám Hiệu', href: '/gioi-thieu' },
      { label: 'Hội đồng Sư phạm', href: '/gioi-thieu' },
      { label: 'Thành tích nổi bật', href: '/gioi-thieu' },
    ],
  },
  {
    label: 'Tin tức - Sự kiện', href: '/news',
    children: [
      { label: 'Tin tức - Sự kiện trường', href: '/news?cat=hoat-dong-dang-uy' },
      { label: 'Thông báo nhà trường', href: '/news?cat=chi-dao-dieu-hanh' },
      { label: 'Hoạt động chuyên môn', href: '/news?cat=chinh-quyen-nha-nuoc' },
      { label: 'Phong trào Đoàn - Đội', href: '/news?cat=mat-tran-doan-the' },
    ],
  },
  {
    label: 'Hoạt động giáo dục', href: '#',
    children: [
      { label: 'Tuyển sinh lớp 1', href: '/news?cat=cai-cach-hanh-chinh' },
      { label: 'Chuyển đổi số học đường', href: '/news?cat=chuyen-doi-so' },
      { label: 'Tài nguyên & Góc học tập', href: '/news?cat=kinh-te-moi-truong' },
      { label: 'Góc phụ huynh học sinh', href: '/news?cat=van-hoa-xa-hoi' },
    ],
  },
  {
    label: 'Lịch công tác', href: '/news?cat=lich-lam-viec',
    children: [
      { label: 'Lịch công tác tuần', href: '/news?cat=lich-lam-viec' },
      { label: 'Lịch thi & Kiểm tra', href: '/news?cat=chi-dao-dieu-hanh' },
    ],
  },
  {
    label: 'Ảnh đẹp học đường', href: '#',
    children: [
      { label: 'Khuôn viên nhà trường', href: '#' },
      { label: 'Hoạt động ngoại khóa', href: '#' },
    ],
  },
];

export default function Navigation() {
  const [menuItems, setMenuItems] = useState(defaultMainMenu);

  useEffect(() => {
    let active = true;
    async function loadMenu() {
      try {
        const res = await fetch('/api/admin/theme-layout');
        const data = await res.json();
        if (active && data?.config?.main_menu && Array.isArray(data.config.main_menu)) {
          setMenuItems(data.config.main_menu);
        }
      } catch (err) {
        console.error('Lỗi khi tải menu:', err);
      }
    }
    loadMenu();
    return () => {
      active = false;
    };
  }, []);

  return (
    <nav className="main-nav" role="navigation" aria-label="Menu chính">
      <div className="container">
        <ul>
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link href={item.href || '#'} className={item.active ? 'active' : ''}>
                {item.label} {item.children && item.children.length > 0 ? '▾' : ''}
              </Link>
              {item.children && item.children.length > 0 && (
                <ul>
                  {item.children.map((child) => (
                    <li key={child.label}>
                      <Link href={child.href || '#'}>{child.label}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
