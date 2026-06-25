import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

// PUT /api/members/[id] — Update member role, tier, or active status (admin only)
export async function PUT(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'admin');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    const body = await request.json();
    const { display_name, email, role, tier, active } = body;

    const members = await query('SELECT id, username FROM users WHERE id = ?', [id]);
    if (members.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const targetUser = members[0];
    // Prevent admin from deactivating or demoting themselves
    if (Number(id) === user.id && (active === 0 || role !== 'admin')) {
      return NextResponse.json({ error: 'You cannot demote or deactivate your own admin account.' }, { status: 400 });
    }

    const fields = [];
    const vals = [];

    if (display_name !== undefined) { fields.push('display_name = ?'); vals.push(display_name); }
    if (email !== undefined) { fields.push('email = ?'); vals.push(email); }
    if (role !== undefined && ['member', 'mod', 'admin'].includes(role)) { fields.push('role = ?'); vals.push(role); }
    if (tier !== undefined && ['Free', 'Pro', 'Enterprise'].includes(tier)) { fields.push('tier = ?'); vals.push(tier); }
    if (active !== undefined) { fields.push('active = ?'); vals.push(active ? 1 : 0); }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    vals.push(id);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, vals);

    const updated = await query(
      'SELECT id, username, display_name, email, role, tier, active, created_at FROM users WHERE id = ?',
      [id]
    );

    return NextResponse.json({ member: updated[0] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/members/[id] — Delete a member account (admin only)
export async function DELETE(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'admin');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    const members = await query('SELECT id, username FROM users WHERE id = ?', [id]);
    if (members.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (Number(id) === user.id) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
    }

    await query('DELETE FROM users WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
