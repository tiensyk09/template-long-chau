import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const defaults = {
  header_phone: '0510 3506281',
  header_email: 'thngoquyen@danang.edu.vn',
  header_upper_title: 'SỞ GIÁO DỤC VÀ ĐÀO TẠO ĐÀ NẴNG',
  header_main_title: 'TRƯỜNG TIỂU HỌC NGÔ QUYỀN',
  header_description: 'CỔNG THÔNG TIN ĐIỆN TỬ CHÍNH THỨC',
  footer_principal: 'Trịnh Thị Hồng',
  footer_address: 'Khối phố Phú Phong, Phường Quảng Phú, TP Đà Nẵng, Việt Nam',
  footer_tax_code: '4000601537',
  footer_status: 'Đang hoạt động',
  footer_date_active: '15/04/2009',
  homepage_seo_title: 'Trường Tiểu học Ngô Quyền - Đà Nẵng',
  homepage_seo_description: 'Cổng thông tin điện tử chính thức của Trường Tiểu học Ngô Quyền, Phường Quảng Phú, TP Đà Nẵng',
  catalogue_seo_title: 'Tin tức & Sự kiện | Trường Tiểu học Ngô Quyền',
  catalogue_seo_description: 'Cập nhật tin tức mới nhất, thông báo hoạt động dạy và học, phong trào Đoàn Đội của Trường Tiểu học Ngô Quyền',
  header_logo_url: '',
  header_banner_url: '',
};

// GET /api/admin/general-settings — Load layout and SEO settings
export async function GET() {
  try {
    const rows = await query('SELECT * FROM settings');
    const settings = { ...defaults };
    rows.forEach(r => {
      settings[r.key] = r.value || '';
    });
    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/general-settings — Save general layout and SEO settings
export async function POST(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'admin'); // Only admin can update global site configs
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const body = await request.json();
    const keysToSave = Object.keys(body);

    for (const key of keysToSave) {
      const value = String(body[key] || '').trim();
      const existing = await query('SELECT 1 FROM settings WHERE `key` = ?', [key]);
      if (existing.length > 0) {
        await query('UPDATE settings SET `value` = ? WHERE `key` = ?', [value, key]);
      } else {
        await query('INSERT INTO settings (`key`, `value`) VALUES (?, ?)', [key, value]);
      }
    }

    return NextResponse.json({ success: true, message: 'Đã lưu cấu hình Website thành công' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
