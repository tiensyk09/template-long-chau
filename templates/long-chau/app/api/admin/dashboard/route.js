import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/admin/dashboard - E-Commerce stats
export async function GET() {
  try {
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippingOrders,
      deliveredOrders,
      cancelledOrders,
      revenueToday,
      revenueWeek,
      revenueMonth,
      totalProducts,
      lowStockProducts,
      totalCoupons,
      topProducts,
      recentOrders,
    ] = await Promise.all([
      query("SELECT COUNT(*) as cnt FROM orders"),
      query("SELECT COUNT(*) as cnt FROM orders WHERE status = 'pending'"),
      query("SELECT COUNT(*) as cnt FROM orders WHERE status = 'confirmed'"),
      query("SELECT COUNT(*) as cnt FROM orders WHERE status = 'shipping'"),
      query("SELECT COUNT(*) as cnt FROM orders WHERE status = 'delivered'"),
      query("SELECT COUNT(*) as cnt FROM orders WHERE status = 'cancelled'"),
      query("SELECT COALESCE(SUM(total),0) as revenue FROM orders WHERE status != 'cancelled' AND date(created_at) = date('now')"),
      query("SELECT COALESCE(SUM(total),0) as revenue FROM orders WHERE status != 'cancelled' AND created_at >= datetime('now', '-7 days')"),
      query("SELECT COALESCE(SUM(total),0) as revenue FROM orders WHERE status != 'cancelled' AND created_at >= datetime('now', '-30 days')"),
      query("SELECT COUNT(*) as cnt FROM products WHERE status = 'active'"),
      query("SELECT COUNT(*) as cnt FROM products WHERE stock <= 5 AND status = 'active'"),
      query("SELECT COUNT(*) as cnt FROM coupons WHERE is_active = 1"),
      query("SELECT id, name, thumbnail, sold_count, price FROM products ORDER BY sold_count DESC LIMIT 5"),
      query("SELECT order_code, customer_name, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 10"),
    ]);

    return NextResponse.json({
      orders: {
        total: totalOrders[0].cnt,
        pending: pendingOrders[0].cnt,
        confirmed: confirmedOrders[0].cnt,
        shipping: shippingOrders[0].cnt,
        delivered: deliveredOrders[0].cnt,
        cancelled: cancelledOrders[0].cnt,
      },
      revenue: {
        today: revenueToday[0].revenue,
        week: revenueWeek[0].revenue,
        month: revenueMonth[0].revenue,
      },
      products: {
        total: totalProducts[0].cnt,
        lowStock: lowStockProducts[0].cnt,
      },
      coupons: { active: totalCoupons[0].cnt },
      topProducts,
      recentOrders,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
