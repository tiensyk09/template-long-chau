import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function ensureTableExists() {
  await query(`
    CREATE TABLE IF NOT EXISTS user_application_passwords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_used_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

// GET /api/admin/app-passwords — List all application passwords for current user
export async function GET() {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    await ensureTableExists();
    const passwords = await query(
      'SELECT id, name, created_at, last_used_at FROM user_application_passwords WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );
    return NextResponse.json({ passwords });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/app-passwords — Generate new application password
export async function POST(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    await ensureTableExists();
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Vui lòng điền tên mật khẩu ứng dụng' }, { status: 400 });
    }

    // Generate random 24 character password
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let rawPass = '';
    for (let i = 0; i < 24; i++) {
      rawPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Format: xxxx xxxx xxxx xxxx xxxx xxxx for visual compatibility with WordPress UI
    const formattedPass = rawPass.match(/.{4}/g).join(' ');

    const hashed = await hashPassword(rawPass);

    await query(
      'INSERT INTO user_application_passwords (user_id, name, password_hash) VALUES (?, ?, ?)',
      [user.id, name, hashed]
    );

    return NextResponse.json({
      password: formattedPass,
      message: 'Mật khẩu ứng dụng đã được tạo thành công. Vui lòng copy mật khẩu này vì nó chỉ xuất hiện một lần duy nhất!'
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/app-passwords — Revoke application password
export async function DELETE(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    await ensureTableExists();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID mật khẩu cần xoá' }, { status: 400 });
    }

    await query(
      'DELETE FROM user_application_passwords WHERE id = ? AND user_id = ?',
      [id, user.id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
