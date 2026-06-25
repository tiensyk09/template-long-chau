'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartContext';

export default function CartPageClient() {
  const router = useRouter();
  const { items, subtotal, updateQty, removeItem, clearCart, hydrated } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Auto-recalculate discount if subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      if (subtotal < (appliedCoupon.min_order || 0)) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponError(`Mã giảm giá yêu cầu đơn hàng tối thiểu từ ${(appliedCoupon.min_order || 0).toLocaleString('vi-VN')}đ`);
      } else {
        let disc = 0;
        if (appliedCoupon.discount_type === 'percent') {
          disc = (subtotal * appliedCoupon.discount_value) / 100;
          if (appliedCoupon.max_discount && disc > appliedCoupon.max_discount) {
            disc = appliedCoupon.max_discount;
          }
        } else {
          disc = appliedCoupon.discount_value;
        }
        setCouponDiscount(disc);
      }
    }
  }, [subtotal, appliedCoupon]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon(data.coupon);
        // Save coupon code to localStorage to carry over to checkout page
        localStorage.setItem('lc_applied_coupon', JSON.stringify(data.coupon));
        setCouponError('');
      } else {
        setCouponError(data.error || 'Mã giảm giá không hợp lệ');
        setAppliedCoupon(null);
        setCouponDiscount(0);
      }
    } catch {
      setCouponError('Lỗi kiểm tra mã giảm giá');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    localStorage.removeItem('lc_applied_coupon');
  };

  // Shipping Fee Logic: free if subtotal >= 150k, otherwise 30k
  const shippingFee = subtotal >= 150000 ? 0 : 30000;
  const finalTotal = Math.max(0, subtotal - couponDiscount + shippingFee);

  const handleCheckout = () => {
    // Save pricing details to localStorage for checkout usage
    localStorage.setItem('lc_checkout_pricing', JSON.stringify({
      subtotal,
      discount: couponDiscount,
      shippingFee,
      total: finalTotal,
      couponCode: appliedCoupon?.code || ''
    }));
    router.push('/checkout');
  };

  if (!hydrated) {
    return (
      <div className="lc-page-wrapper">
        <Header />
        <main style={{ background: '#f4f6f9', padding: '100px 0', textAlign: 'center' }}>
          <div style={{ color: 'var(--lc-muted)', fontSize: '15px', fontWeight: 500 }}>Đang tải thông tin giỏ hàng...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="lc-page-wrapper">
      <Header />

      <main style={{ background: '#f4f6f9', padding: '24px 0 60px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          {/* Breadcrumbs */}
          <div style={{ fontSize: '13px', color: 'var(--lc-muted)', marginBottom: '16px', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Link href="/" style={{ color: 'var(--lc-text)', textDecoration: 'none' }}>Trang chủ</Link>
            <span>/</span>
            <span style={{ color: 'var(--lc-blue)', fontWeight: 600 }}>Giỏ hàng</span>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--lc-blue-dark)', marginBottom: '20px' }}>
            Giỏ Hàng Của Bạn ({items.length} sản phẩm)
          </h1>

          {items.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', border: '1px solid var(--lc-border)' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--lc-text)' }}>Giỏ hàng trống</h3>
              <p style={{ color: 'var(--lc-muted)', fontSize: '14px', marginTop: '6px' }}>Bạn chưa chọn sản phẩm nào.</p>
              <Link
                href="/products"
                style={{ display: 'inline-block', marginTop: '20px', background: 'var(--lc-blue)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '30px', fontWeight: 700, textDecoration: 'none' }}
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--lc-border)', overflow: 'hidden' }}>
                  {items.map((item) => (
                    <div
                      key={item.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        padding: '20px',
                        borderBottom: '1px solid #eee'
                      }}
                    >
                      {/* Image */}
                      <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', borderRadius: '8px', padding: '6px', overflow: 'hidden', flexShrink: 0 }}>
                        <img
                          src={item.thumbnail || '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png'}
                          alt={item.product_name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.src = 'https://picsum.photos/100/100?random=' + item.product_id;
                          }}
                        />
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--lc-text)', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.product_name}
                        </h4>
                        <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', color: 'var(--lc-muted)', fontWeight: 500 }}>
                          DVT: {item.variant_name}
                        </span>
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--lc-blue-dark)' }}>
                            {item.unit_price.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>

                      {/* Qty Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '6px', overflow: 'hidden', background: '#fff', flexShrink: 0 }}>
                        <button
                          onClick={() => updateQty(item.key, item.quantity - 1)}
                          style={{ width: '28px', height: '28px', border: 'none', background: '#f4f6f9', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <span style={{ width: '32px', textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.key, item.quantity + 1)}
                          style={{ width: '28px', height: '28px', border: 'none', background: '#f4f6f9', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          +
                        </button>
                      </div>

                      {/* Line Total */}
                      <div style={{ width: '110px', textAlign: 'right', fontWeight: 700, color: 'var(--lc-blue-dark)', fontSize: '15px', flexShrink: 0 }}>
                        {(item.unit_price * item.quantity).toLocaleString('vi-VN')}đ
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeItem(item.key)}
                        style={{ border: 'none', background: 'transparent', color: '#ff4d4f', cursor: 'pointer', fontSize: '16px', padding: '4px', flexShrink: 0 }}
                        title="Xóa sản phẩm"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link href="/products" style={{ color: 'var(--lc-blue)', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                    ← Tiếp tục chọn sản phẩm khác
                  </Link>
                  <button
                    onClick={clearCart}
                    style={{ border: 'none', background: 'transparent', color: 'var(--lc-muted)', fontSize: '13.5px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Xóa sạch giỏ hàng
                  </button>
                </div>
              </div>

              {/* Order Summary Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Coupon Box */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid var(--lc-border)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--lc-blue-dark)', margin: '0 0 12px 0' }}>
                    Mã Giảm Giá
                  </h3>
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Ví dụ: LONGCHAU10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={!!appliedCoupon}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '13.5px',
                        outline: 'none',
                        textTransform: 'uppercase'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!!appliedCoupon || !couponCode.trim()}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        background: (appliedCoupon || !couponCode.trim()) ? '#ccc' : 'var(--lc-blue)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Áp dụng
                    </button>
                  </form>
                  {couponError && <p style={{ color: '#ff4d4f', fontSize: '12px', margin: '6px 0 0 0' }}>{couponError}</p>}
                  {appliedCoupon && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f6ffed', border: '1px solid #b7eb8f', padding: '8px 12px', borderRadius: '6px', marginTop: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#389e0d', fontWeight: 600 }}>
                        ✓ Đã áp dụng mã: {appliedCoupon.code} (-{appliedCoupon.discount_type === 'percent' ? `${appliedCoupon.discount_value}%` : `${appliedCoupon.discount_value.toLocaleString('vi-VN')}đ`})
                      </span>
                      <span
                        onClick={handleRemoveCoupon}
                        style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                      >
                        Gỡ bỏ
                      </span>
                    </div>
                  )}
                </div>

                {/* Pricing Summary */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid var(--lc-border)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--lc-blue-dark)', margin: '0 0 16px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    Chi Tiết Thanh Toán
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14.5px', color: 'var(--lc-text)' }}>
                    <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between' }}>
                      <span>Tạm tính</span>
                      <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between', color: 'var(--lc-green)' }}>
                        <span>Giảm giá</span>
                        <span>-{couponDiscount.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between' }}>
                      <span>Phí vận chuyển</span>
                      <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}đ`}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--lc-muted)', margin: 0, fontStyle: 'italic' }}>
                      * Miễn phí vận chuyển cho đơn hàng từ 150k.
                    </p>
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '4px', display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', color: 'var(--lc-blue-dark)' }}>
                      <span>Tổng cộng</span>
                      <span style={{ fontSize: '20px', color: 'var(--lc-orange)' }}>{finalTotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    style={{
                      width: '100%',
                      marginTop: '20px',
                      padding: '14px',
                      borderRadius: '30px',
                      border: 'none',
                      background: 'var(--lc-orange)',
                      color: '#fff',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    Tiến hành đặt hàng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
