import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

// Helper: Đảm bảo bảng settings hoạt động tốt
async function ensureSettingsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS settings (
      \`key\` VARCHAR(100) PRIMARY KEY,
      \`value\` TEXT
    )
  `);
}

// GET /api/admin/theme-layout — Đọc cấu hình giao diện (Công khai để trang chủ đọc bố cục blocks)
export async function GET() {
  try {
    await ensureSettingsTable();
    const rows = await query(
      'SELECT * FROM settings WHERE \`key\` IN ("theme_preset", "theme_custom_colors", "homepage_layout", "main_menu")'
    );

    const config = {
      theme_preset: 'cyan',
      theme_custom_colors: {},
      homepage_layout: { left: [], right: [] },
      main_menu: null
    };

    let rawLayout = null;

    rows.forEach(r => {
      if (r.key === 'theme_preset') {
        config.theme_preset = r.value || 'cyan';
      } else if (r.key === 'theme_custom_colors') {
        try {
          config.theme_custom_colors = JSON.parse(r.value || '{}');
        } catch {
          config.theme_custom_colors = {};
        }
      } else if (r.key === 'homepage_layout') {
        try {
          rawLayout = JSON.parse(r.value || 'null');
        } catch {
          rawLayout = null;
        }
      } else if (r.key === 'main_menu') {
        try {
          config.main_menu = JSON.parse(r.value || 'null');
        } catch {
          config.main_menu = null;
        }
      }
    });

    const defaultLeft = [
      { id: 'block_tabbed_news', type: 'tabbed_news', title: 'Tin tức nổi bật', visible: true },
      { id: 'block_shortcuts', type: 'shortcuts', title: 'Liên kết nhanh', visible: true },
      { id: 'block_banner_slider', type: 'banner_slider', title: 'Banner giới thiệu', visible: true },
      { id: 'block_categories', type: 'categories', title: 'Danh mục tin tức', visible: true, configs: [
          { title: 'TIN TỨC - SỰ KIỆN', cat: 'hoat-dong-dang-uy', color: 'red' },
          { title: 'THÔNG BÁO NHÀ TRƯỜNG', cat: 'chi-dao-dieu-hanh', color: 'blue' },
          { title: 'HOẠT ĐỘNG CHUYÊN MÔN', cat: 'chinh-quyen-nha-nuoc', color: 'red' },
          { title: 'PHONG TRÀO ĐOÀN - ĐỘI', cat: 'mat-tran-doan-the', color: 'blue' },
          { title: 'TUYỂN SINH ĐẦU CẤP', cat: 'cai-cach-hanh-chinh', color: 'red' },
          { title: 'ỨNG DỤNG CNTT - CHUYỂN ĐỔI SỐ', cat: 'chuyen-doi-so', color: 'blue' },
          { title: 'TÀI NGUYÊN HỌC TẬP', cat: 'kinh-te-moi-truong', color: 'red' },
          { title: 'GÓC PHỤ HUYNH', cat: 'van-hoa-xa-hoi', color: 'blue' }
        ]
      }
    ];

    const defaultRight = [
      { id: 'block_search', type: 'search', title: 'Tìm kiếm', visible: true },
      { id: 'block_quick_links', type: 'quick_links', title: 'Liên kết nhanh', visible: true },
      { id: 'block_schedule', type: 'schedule', title: 'LỊCH CÔNG TÁC', visible: true },
      { id: 'block_notices', type: 'notices', title: 'THÔNG BÁO MỚI', visible: true },
      { id: 'block_sidebar_banners', type: 'sidebar_banners', title: 'Banner liên kết', visible: true, configs: [
          { label: 'Cổng thông tin Sở GD&ĐT Đà Nẵng', icon: '🏛️', href: 'https://danang.edu.vn', bg: 'linear-gradient(135deg,#0d5bb5,#1a7ddb)' },
          { label: 'Trường Tiểu học Ngô Quyền - Góc Phụ huynh', icon: '🏫', href: '/news?cat=van-hoa-xa-hoi', bg: 'linear-gradient(135deg,#c8001a,#e31837)' },
          { label: 'Hộp thư điện tử nhà trường', icon: '📧', href: 'mailto:thngoquyen@danang.edu.vn', bg: 'linear-gradient(135deg,#e8a000,#f0b800)' },
          { label: 'Sơ đồ khuôn viên nhà trường', icon: '🗺️', href: '#', bg: 'linear-gradient(135deg,#059669,#22c55e)' }
        ]
      },
      { id: 'block_survey', type: 'survey', title: 'THĂM DÒ Ý KIẾN', visible: true },
      { id: 'block_stats', type: 'stats', title: 'THỐNG KÊ TRUY CẬP', visible: true }
    ];

    let finalLayout = { left: [], right: [] };
    if (rawLayout && typeof rawLayout === 'object' && !Array.isArray(rawLayout)) {
      finalLayout.left = rawLayout.left || [];
      finalLayout.right = rawLayout.right || [];
    } else if (Array.isArray(rawLayout)) {
      finalLayout.left = rawLayout;
      finalLayout.right = [];
    }

    if (finalLayout.left.length === 0) finalLayout.left = defaultLeft;
    if (finalLayout.right.length === 0) finalLayout.right = defaultRight;

    config.homepage_layout = finalLayout;

    return NextResponse.json({ success: true, config });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/theme-layout — Lưu cấu hình giao diện
export async function POST(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'admin'); // Chỉ Admin mới được lưu cấu hình
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    await ensureSettingsTable();
    const body = await request.json();

    const saveSetting = async (key, val) => {
      const existing = await query('SELECT 1 FROM settings WHERE \`key\` = ?', [key]);
      if (existing.length > 0) {
        await query('UPDATE settings SET \`value\` = ? WHERE \`key\` = ?', [val, key]);
      } else {
        await query('INSERT INTO settings (\`key\`, \`value\`) VALUES (?, ?)', [key, val]);
      }
    };

    if ('theme_preset' in body) {
      await saveSetting('theme_preset', body.theme_preset);
    }
    if ('theme_custom_colors' in body) {
      await saveSetting('theme_custom_colors', JSON.stringify(body.theme_custom_colors));
    }
    if ('homepage_layout' in body) {
      await saveSetting('homepage_layout', JSON.stringify(body.homepage_layout));
    }
    if ('main_menu' in body) {
      await saveSetting('main_menu', JSON.stringify(body.main_menu));
    }

    return NextResponse.json({ success: true, message: 'Đã lưu cấu hình thiết lập giao diện thành công!' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
