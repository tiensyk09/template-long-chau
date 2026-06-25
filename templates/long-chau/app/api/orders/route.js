import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

function generateOrderCode() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `LC-${date}-${rand}`;
}

// POST /api/orders  — Place an order (requires login)
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để đặt hàng', requireLogin: true }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Phiên đăng nhập hết hạn', requireLogin: true }, { status: 401 });
    }

    const body = await request.json();
    const {
      customer_name, customer_phone, customer_email,
      shipping_address, shipping_province, shipping_note,
      items, coupon_code, payment_method
    } = body;

    if (!customer_name || !customer_phone || !shipping_address || !items?.length) {
      return NextResponse.json({ error: 'Thiếu thông tin đặt hàng' }, { status: 400 });
    }

    // Validate and calculate totals
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const { product_id, variant_id, quantity = 1 } = item;
      
      const products = await query('SELECT * FROM products WHERE id = ? AND status = ?', [product_id, 'active']);
      if (!products.length) {
        return NextResponse.json({ error: `Sản phẩm ID ${product_id} không còn bán` }, { status: 400 });
      }
      const product = products[0];

      let unitPrice = product.price;
      let variantName = product.unit;

      if (variant_id) {
        const variants = await query('SELECT * FROM product_variants WHERE id = ? AND product_id = ?', [variant_id, product_id]);
        if (variants.length) {
          unitPrice = variants[0].price;
          variantName = variants[0].name;
        }
      }

      // Check stock
      if (product.stock < quantity) {
        return NextResponse.json({ error: `Sản phẩm "${product.name}" không đủ tồn kho (còn ${product.stock})` }, { status: 400 });
      }

      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;

      validatedItems.push({
        product_id,
        variant_id: variant_id || null,
        product_name: product.name,
        variant_name: variantName,
        thumbnail: product.thumbnail,
        unit_price: unitPrice,
        quantity,
        line_total: lineTotal,
      });
    }

    // Apply coupon
    let discountAmount = 0;
    let appliedCoupon = null;

    if (coupon_code) {
      const coupons = await query(
        `SELECT * FROM coupons WHERE code = ? AND is_active = 1 
         AND (expires_at IS NULL OR expires_at > datetime('now'))
         AND (usage_limit IS NULL OR usage_count < usage_limit)`,
        [coupon_code.toUpperCase()]
      );

      if (coupons.length) {
        const coupon = coupons[0];
        if (subtotal >= coupon.min_order) {
          appliedCoupon = coupon;
          if (coupon.discount_type === 'percent') {
            discountAmount = Math.floor(subtotal * (coupon.discount_value / 100));
            if (coupon.max_discount) {
              discountAmount = Math.min(discountAmount, coupon.max_discount);
            }
          } else {
            discountAmount = Math.min(coupon.discount_value, subtotal);
          }
        } else {
          return NextResponse.json({ error: `Đơn hàng tối thiểu ${coupon.min_order.toLocaleString('vi-VN')}đ để dùng mã này` }, { status: 400 });
      }
      } else {
        return NextResponse.json({ error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' }, { status: 400 });
      }
    }

    // Shipping fee
    const shippingFee = subtotal - discountAmount >= 150000 ? 0 : 20000;
    const total = subtotal - discountAmount + shippingFee;

    // Generate order code
    let orderCode = generateOrderCode();
    // Ensure uniqueness
    let attempts = 0;
    while (attempts < 5) {
      const existing = await query('SELECT id FROM orders WHERE order_code = ?', [orderCode]);
      if (!existing.length) break;
      orderCode = generateOrderCode();
      attempts++;
    }

    // Create order
    await query(
      `INSERT INTO orders (order_code, user_id, customer_name, customer_phone, customer_email, shipping_address, shipping_province, shipping_note, items, subtotal, discount_amount, shipping_fee, total, coupon_code, payment_method, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        orderCode, user.id, customer_name, customer_phone, customer_email || null,
        shipping_address, shipping_province || null, shipping_note || null,
        JSON.stringify(validatedItems),
        subtotal, discountAmount, shippingFee, total,
        appliedCoupon ? coupon_code.toUpperCase() : null,
        payment_method || 'cod'
      ]
    );

    // Deduct stock
    for (const item of validatedItems) {
      await query(
        'UPDATE products SET stock = stock - ?, sold_count = sold_count + ? WHERE id = ?',
        [item.quantity, item.quantity, item.product_id]
      );
    }

    // Increment coupon usage
    if (appliedCoupon) {
      await query('UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?', [appliedCoupon.id]);
    }

    const order = await query('SELECT * FROM orders WHERE order_code = ?', [orderCode]);

    // Build payment info for bank transfer
    const settings = await query(`SELECT \`value\` FROM settings WHERE \`key\` IN ('bank_name','bank_account','bank_owner')`)
      .then(rows => Object.fromEntries(rows.map(r => [r.key, r.value]))).catch(() => ({}));

    return NextResponse.json({
      success: true,
      order: {
        ...order[0],
        items: validatedItems,
      },
      paymentInfo: payment_method === 'bank' ? {
        bankName: settings.bank_name || 'Vietcombank',
        bankAccount: settings.bank_account || '',
        bankOwner: settings.bank_owner || 'Nhà Thuốc Long Châu',
        amount: total,
        description: `Thanh toan don hang ${orderCode}`,
        qrUrl: `https://qr.sepay.vn/img?bank=${settings.bank_name || 'VCB'}&acc=${settings.bank_account || ''}&amount=${total}&des=Thanh toan ${orderCode}`,
      } : null,
    }, { status: 201 });

  } catch (err) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/orders  — Admin list all orders
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const search = searchParams.get('search');

    let conditions = [];
    let params = [];

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(order_code LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const total = await query(`SELECT COUNT(*) as cnt FROM orders ${where}`, params);
    const orders = await query(
      `SELECT id, order_code, customer_name, customer_phone, total, status, payment_method, payment_status, created_at 
       FROM orders ${where} 
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      orders,
      pagination: { page, limit, total: total[0].cnt, totalPages: Math.ceil(total[0].cnt / limit) }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
