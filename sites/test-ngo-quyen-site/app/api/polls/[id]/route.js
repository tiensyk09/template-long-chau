import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

// PUT /api/polls/[id] — toggle active, update
export async function PUT(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    const body = await request.json();
    if (body.active !== undefined) {
      await query('UPDATE polls SET active=? WHERE id=?', [body.active ? 1 : 0, id]);
    }
    if (body.question) {
      await query('UPDATE polls SET question=? WHERE id=?', [body.question, id]);
    }
    const updated = await query('SELECT * FROM polls WHERE id=?', [id]);
    if (!updated.length) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
    updated[0].options = await query('SELECT * FROM poll_options WHERE poll_id=? ORDER BY sort_order', [id]);
    return NextResponse.json({ poll: updated[0] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/polls/[id]
export async function DELETE(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'admin');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    await query('DELETE FROM polls WHERE id=?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
