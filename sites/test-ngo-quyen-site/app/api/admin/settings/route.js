import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

// Tạo bảng settings nếu chưa tồn tại (chạy on-the-fly đề phòng trường hợp chưa reseed DB)
async function ensureSettingsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS settings (
      \`key\` VARCHAR(100) PRIMARY KEY,
      \`value\` TEXT
    )
  `);
}

export async function GET() {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod'); // Ít nhất mod được xem cấu hình
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    await ensureSettingsTable();
    const rows = await query('SELECT * FROM settings');
    
    const config = {
      cf_account_id: '',
      cf_api_token: '',
      cf_d1_database_id: '',
      cf_r2_bucket_name: '',
      cf_r2_public_url: '',
    };

    rows.forEach(r => {
      if (r.key === 'cf_api_token' && r.value) {
        // Mask token bảo mật, chỉ chừa 4 ký tự cuối
        config[r.key] = '••••••••' + r.value.slice(-4);
      } else if (r.key in config) {
        config[r.key] = r.value || '';
      }
    });

    return NextResponse.json({ settings: config });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'admin'); // Chỉ admin mới được sửa cấu hình
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    await ensureSettingsTable();
    const body = await request.json();
    const allowedKeys = [
      'cf_account_id',
      'cf_api_token',
      'cf_d1_database_id',
      'cf_r2_bucket_name',
      'cf_r2_public_url'
    ];

    for (const key of allowedKeys) {
      if (key in body) {
        const newValue = (body[key] || '').trim();

        // Nếu là token và chứa dấu mask (tức là người dùng không sửa trường này) thì bỏ qua
        if (key === 'cf_api_token' && newValue.startsWith('••••••••')) {
          continue;
        }

        // Tương thích cả SQLite và MySQL bằng kiểm tra trước khi insert/update
        const existing = await query('SELECT 1 FROM settings WHERE \`key\` = ?', [key]);
        if (existing.length > 0) {
          await query('UPDATE settings SET \`value\` = ? WHERE \`key\` = ?', [newValue, key]);
        } else {
          await query('INSERT INTO settings (\`key\`, \`value\`) VALUES (?, ?)', [key, newValue]);
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Đã lưu cấu hình thành công' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
