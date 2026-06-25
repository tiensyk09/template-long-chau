import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST /api/coupons/validate
export async function POST(request) {
  try {
    const { code, subtotal } = await request.json();
    if (!code) return NextResponse.json({ error: 'Vui lòng nhập mã giảm giá' }, { status: 400 });

    const coupons = await query(
      `SELECT * FROM coupons WHERE code = ? AND is_active = 1
       AND (expires_at IS NULL OR expires_at > datetime('now'))
       AND (usage_limit IS NULL OR usage_count < usage_limit)`,
      [code.toUpperCase()]
    );

    if (!coupons.length) {
      return NextResponse.json({ valid: false, error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
    }

    const coupon = coupons[0];
    const orderTotal = parseFloat(subtotal) || 0;

    if (orderTotal < coupon.min_order) {
      return NextResponse.json({
        valid: false,
        error: `Đơn hàng tối thiểu ${coupon.min_order.toLocaleString('vi-VN')}đ để sử dụng mã này`
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percent') {
      discount = Math.floor(orderTotal * (coupon.discount_value / 100));
      if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
    } else {
      discount = Math.min(coupon.discount_value, orderTotal);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discount,
      },
      discount_amount: discount,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
