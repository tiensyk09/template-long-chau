import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

// GET /api/notifications
export async function GET() {
  try {
    const notifs = await query('SELECT * FROM notifications ORDER BY priority ASC, created_at DESC');
    return NextResponse.json({ notifications: notifs });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/notifications
export async function POST(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { text_content } = await request.json();
    if (!text_content) return NextResponse.json({ error: 'Nội dung không được trống' }, { status: 400 });

    const maxPriority = await query('SELECT COALESCE(MAX(priority),0)+1 as next_p FROM notifications');
    const result = await query(
      'INSERT INTO notifications (text_content, active, priority, created_by) VALUES (?,1,?,?)',
      [text_content, maxPriority[0].next_p, user.id]
    );

    const newNotif = await query('SELECT * FROM notifications WHERE id=?', [result.insertId]);
    return NextResponse.json({ notification: newNotif[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
