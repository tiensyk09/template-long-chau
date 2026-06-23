import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

// GET /api/banners/all — lấy tất cả banner kể cả inactive (admin)
export async function GET(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const banners = await query('SELECT * FROM banners ORDER BY sort_order ASC, id ASC');
    return NextResponse.json({ banners });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
