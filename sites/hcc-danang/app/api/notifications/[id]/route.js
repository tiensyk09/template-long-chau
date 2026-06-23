import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function PUT(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    const body = await request.json();
    const fields = [];
    const vals = [];
    if (body.text_content !== undefined) { fields.push('text_content=?'); vals.push(body.text_content); }
    if (body.active !== undefined) { fields.push('active=?'); vals.push(body.active ? 1 : 0); }
    if (body.priority !== undefined) { fields.push('priority=?'); vals.push(body.priority); }
    if (!fields.length) return NextResponse.json({ error: 'Không có dữ liệu cập nhật' }, { status: 400 });

    vals.push(id);
    await query(`UPDATE notifications SET ${fields.join(',')} WHERE id=?`, vals);
    const updated = await query('SELECT * FROM notifications WHERE id=?', [id]);
    return NextResponse.json({ notification: updated[0] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'admin');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    await query('DELETE FROM notifications WHERE id=?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
