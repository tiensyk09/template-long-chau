import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function DELETE(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    await query('DELETE FROM post_attachments WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    const body = await request.json();
    const { post_id, name, is_public } = body;

    const rows = await query('SELECT * FROM post_attachments WHERE id = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy tệp đính kèm' }, { status: 404 });
    }
    const current = rows[0];

    const finalPostId = post_id !== undefined ? post_id : current.post_id;
    const finalName = name !== undefined ? name : current.name;
    const finalIsPublic = is_public !== undefined ? is_public : (current.is_public !== undefined ? current.is_public : 1);

    await query(
      `UPDATE post_attachments 
       SET post_id = ?, name = ?, is_public = ? 
       WHERE id = ?`,
      [finalPostId, finalName, finalIsPublic, id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
