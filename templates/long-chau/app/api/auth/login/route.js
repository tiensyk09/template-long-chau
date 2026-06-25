import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { signToken, createAuthCookie, clearAuthCookie, getAuthUser, verifyPassword } from '@/lib/auth';

// POST /api/auth/login — Authenticate credentials
export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Please enter all required fields' }, { status: 400 });
    }

    let users = [];
    let dbError = null;
    try {
      users = await query(
        'SELECT id, username, password, display_name, email, role, tier, active FROM users WHERE username = ?',
        [username]
      );
    } catch (err) {
      dbError = err.message;
    }

    // DB offline / not initialized rescue pathway
    if (dbError) {
      console.warn('Database offline on login check:', dbError);
      if (username === 'admin' && password === 'admin123') {
        const payload = {
          id: 0,
          username: 'admin',
          displayName: 'Emergency Admin (Offline DB)',
          email: 'emergency@commandcode.ai',
          role: 'admin',
          tier: 'Enterprise',
          emergency: true,
          dbError
        };

        const token = await signToken(payload);
        const response = NextResponse.json({ success: true, user: payload, isEmergency: true });
        const cookie = createAuthCookie(token);
        response.cookies.set(cookie);
        return response;
      }
      return NextResponse.json({ error: 'Database connection failed: ' + dbError }, { status: 500 });
    }

    if (users.length === 0) {
      // Empty users fallback rescue pathway
      let isUsersEmpty = false;
      try {
        const countRes = await query('SELECT COUNT(*) as count FROM users');
        if (countRes && countRes[0] && countRes[0].count === 0) {
          isUsersEmpty = true;
        }
      } catch {}

      if (isUsersEmpty && username === 'admin' && password === 'admin123') {
        const payload = {
          id: 0,
          username: 'admin',
          displayName: 'Emergency Admin (Unseeded DB)',
          email: 'emergency@commandcode.ai',
          role: 'admin',
          tier: 'Enterprise',
          emergency: true
        };

        const token = await signToken(payload);
        const response = NextResponse.json({ success: true, user: payload, isEmergency: true });
        const cookie = createAuthCookie(token);
        response.cookies.set(cookie);
        return response;
      }

      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const user = users[0];
    if (!user.active) {
      return NextResponse.json({ error: 'This account has been deactivated' }, { status: 403 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const payload = {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      email: user.email,
      role: user.role,
      tier: user.tier,
    };

    const token = await signToken(payload);
    const response = NextResponse.json({ success: true, user: payload });
    const cookie = createAuthCookie(token);
    response.cookies.set(cookie);
    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 });
  }
}

// DELETE /api/auth/login — Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(clearAuthCookie());
  return response;
}

// GET /api/auth/login — Retrieve current user session details
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user });
}
