import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function DELETE(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'admin');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    await query('DELETE FROM files WHERE id=?', [id]);
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
    const { name, folder, description, is_public } = body;

    if (!name) {
      return NextResponse.json({ error: 'Tên file không được để trống' }, { status: 400 });
    }

    await query(
      `UPDATE files 
       SET name = ?, folder = ?, description = ?, is_public = ? 
       WHERE id = ?`,
      [name, folder || 'general', description || '', is_public !== undefined ? is_public : 1, id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
