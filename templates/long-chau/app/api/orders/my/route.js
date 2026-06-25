import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET /api/orders/my — User's order history
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập', requireLogin: true }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const total = await query('SELECT COUNT(*) as cnt FROM orders WHERE user_id = ?', [user.id]);
    const orders = await query(
      `SELECT id, order_code, customer_name, total, status, payment_method, payment_status, created_at, items
       FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [user.id, limit, offset]
    );

    const parsed = orders.map(o => ({ ...o, items: JSON.parse(o.items || '[]') }));

    return NextResponse.json({
      orders: parsed,
      pagination: { page, limit, total: total[0].cnt, totalPages: Math.ceil(total[0].cnt / limit) }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
