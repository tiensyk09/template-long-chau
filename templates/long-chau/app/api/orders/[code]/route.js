import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET /api/orders/[code]
export async function GET(request, { params }) {
  try {
    const { code } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const user = token ? await verifyToken(token) : null;

    const orders = await query('SELECT * FROM orders WHERE order_code = ?', [code]);
    if (!orders.length) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    const order = orders[0];

    // Only allow owner or admin to see full details
    if (user && (user.role === 'admin' || user.role === 'mod' || user.id === order.user_id)) {
      // Full access
    } else if (!user) {
      // Guest: only show order_code, status, totals (no sensitive info)
      return NextResponse.json({
        order: {
          order_code: order.order_code,
          status: order.status,
          payment_status: order.payment_status,
          payment_method: order.payment_method,
          total: order.total,
          shipping_fee: order.shipping_fee,
          discount_amount: order.discount_amount,
          created_at: order.created_at,
          items: JSON.parse(order.items || '[]'),
        }
      });
    }

    const parsed = { ...order, items: JSON.parse(order.items || '[]') };
    return NextResponse.json({ order: parsed });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/orders/[code]  — Update status (admin)
export async function PUT(request, { params }) {
  try {
    const { code } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user || (user.role !== 'admin' && user.role !== 'mod')) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const { status, payment_status, admin_note } = await request.json();
    
    const updates = [];
    const vals = [];
    if (status) { updates.push('status = ?'); vals.push(status); }
    if (payment_status) { updates.push('payment_status = ?'); vals.push(payment_status); }
    if (admin_note !== undefined) { updates.push('admin_note = ?'); vals.push(admin_note); }
    updates.push("updated_at = datetime('now')");
    vals.push(code);

    await query(`UPDATE orders SET ${updates.join(', ')} WHERE order_code = ?`, vals);
    const order = await query('SELECT * FROM orders WHERE order_code = ?', [code]);
    return NextResponse.json({ success: true, order: order[0] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
