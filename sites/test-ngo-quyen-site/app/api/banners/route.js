import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

// GET /api/banners — public, lấy banner active, sắp xếp theo sort_order
export async function GET() {
  try {
    const banners = await query(
      'SELECT * FROM banners WHERE active = 1 ORDER BY sort_order ASC, id ASC'
    );
    return NextResponse.json({ banners });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/banners — admin tạo banner mới
export async function POST(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const body = await request.json();
    const { title, caption, big_text, image_url, link, bg_color, active, sort_order } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Tiêu đề không được để trống' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO banners (title, caption, big_text, image_url, link, bg_color, active, sort_order)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        title.trim(),
        caption || '',
        big_text || '',
        image_url || '',
        link || '#',
        bg_color || 'linear-gradient(135deg,#c8001a,#e31837)',
        active !== false ? 1 : 0,
        sort_order || 0,
      ]
    );
    const newBanner = await query('SELECT * FROM banners WHERE id = ?', [result.insertId]);
    return NextResponse.json({ banner: newBanner[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
