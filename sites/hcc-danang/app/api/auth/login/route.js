import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { signToken, createAuthCookie, clearAuthCookie, getAuthUser, verifyPassword } from '@/lib/auth';

// POST /api/auth/login
export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin' }, { status: 400 });
    }

    let users = [];
    let dbError = null;
    try {
      users = await query(
        'SELECT id, username, password, display_name, email, role, active FROM users WHERE username = ?',
        [username]
      );
    } catch (err) {
      dbError = err.message;
    }

    // 1. Trường hợp lỗi kết nối CSDL hoặc chưa có bảng users
    if (dbError) {
      console.warn('Lỗi cơ sở dữ liệu khi đăng nhập, kiểm tra tài khoản khẩn cấp:', dbError);
      if (username === 'admin' && password === 'admin123') {
        const payload = {
          id: 0,
          username: 'admin',
          displayName: 'Emergency Admin (Lỗi CSDL)',
          email: 'emergency@ngo-quyen.edu.vn',
          role: 'admin',
          emergency: true,
          dbError
        };

        const token = await signToken(payload);
        const response = NextResponse.json({ success: true, user: payload, isEmergency: true });
        const cookie = createAuthCookie(token);
        response.cookies.set(cookie);
        return response;
      }
      return NextResponse.json({ error: 'Lỗi kết nối cơ sở dữ liệu: ' + dbError }, { status: 500 });
    }

    // 2. Trường hợp kết nối được nhưng bảng users hoàn toàn trống (chưa seed)
    if (users.length === 0) {
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
          displayName: 'Emergency Admin (CSDL Rỗng)',
          email: 'emergency@ngo-quyen.edu.vn',
          role: 'admin',
          emergency: true
        };

        const token = await signToken(payload);
        const response = NextResponse.json({ success: true, user: payload, isEmergency: true });
        const cookie = createAuthCookie(token);
        response.cookies.set(cookie);
        return response;
      }

      return NextResponse.json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' }, { status: 401 });
    }

    const user = users[0];
    if (!user.active) {
      return NextResponse.json({ error: 'Tài khoản đã bị khóa' }, { status: 403 });
    }

    // Sử dụng verifyPassword hỗ trợ cả PBKDF2 và bcryptjs
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' }, { status: 401 });
    }

    const payload = {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      email: user.email,
      role: user.role,
    };

    const token = await signToken(payload);
    const response = NextResponse.json({ success: true, user: payload });
    const cookie = createAuthCookie(token);
    response.cookies.set(cookie);
    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Lỗi server: ' + err.message }, { status: 500 });
  }
}

// DELETE /api/auth/login — logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(clearAuthCookie());
  return response;
}

// GET /api/auth/login — get current user
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user });
}
