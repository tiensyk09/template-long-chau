import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

// PUT /api/banners/[id]
export async function PUT(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, caption, big_text, image_url, link, bg_color, active, sort_order } = body;

    await query(
      `UPDATE banners SET title=?, caption=?, big_text=?, image_url=?, link=?, bg_color=?, active=?, sort_order=? WHERE id=?`,
      [
        title || '',
        caption || '',
        big_text || '',
        image_url || '',
        link || '#',
        bg_color || 'linear-gradient(135deg,#c8001a,#e31837)',
        active ? 1 : 0,
        sort_order || 0,
        id,
      ]
    );
    const updated = await query('SELECT * FROM banners WHERE id = ?', [id]);
    return NextResponse.json({ banner: updated[0] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/banners/[id]
export async function DELETE(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    await query('DELETE FROM banners WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/banners/[id] — toggle active
export async function PATCH(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    const { active } = await request.json();
    await query('UPDATE banners SET active = ? WHERE id = ?', [active ? 1 : 0, id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
