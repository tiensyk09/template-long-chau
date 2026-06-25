import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET/POST /api/coupons (admin)
export async function GET() {
  try {
    const coupons = await query('SELECT * FROM coupons ORDER BY created_at DESC');
    return NextResponse.json({ coupons });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { code, discount_type, discount_value, min_order, max_discount, usage_limit, expires_at } = await request.json();
    if (!code || !discount_type || !discount_value) {
      return NextResponse.json({ error: 'Thiếu thông tin mã giảm giá' }, { status: 400 });
    }
    await query(
      'INSERT INTO coupons (code, discount_type, discount_value, min_order, max_discount, usage_limit, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [code.toUpperCase(), discount_type, discount_value, min_order || 0, max_discount || null, usage_limit || null, expires_at || null]
    );
    const coupon = await query('SELECT * FROM coupons WHERE code = ?', [code.toUpperCase()]);
    return NextResponse.json({ success: true, coupon: coupon[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/coupons (admin toggle status)
export async function PUT(request) {
  try {
    const { id, is_active } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Thiếu coupon ID' }, { status: 400 });
    }
    await query('UPDATE coupons SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/coupons?id=... (admin delete)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Thiếu coupon ID' }, { status: 400 });
    }
    await query('DELETE FROM coupons WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
