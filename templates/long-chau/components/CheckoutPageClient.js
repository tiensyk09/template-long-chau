'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartContext';

export default function CheckoutPageClient() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    province: 'Hồ Chí Minh',
    note: '',
    paymentMethod: 'cod'
  });

  const [pricing, setPricing] = useState({
    subtotal: 0,
    discount: 0,
    shippingFee: 30000,
    total: 0,
    couponCode: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    // Read cart pricing state from localStorage
    const savedPricing = localStorage.getItem('lc_checkout_pricing');
    if (savedPricing) {
      setPricing(JSON.parse(savedPricing));
    } else {
      // Fallback
      const shipping = subtotal >= 150000 ? 0 : 30000;
      setPricing({
        subtotal,
        discount: 0,
        shippingFee: shipping,
        total: subtotal + shipping,
        couponCode: ''
      });
    }
  }, [subtotal]);

  // Redirect if cart is empty and order hasn't been placed successfully yet
  useEffect(() => {
    if (items.length === 0 && !orderSuccess) {
      router.push('/cart');
    }
  }, [items, orderSuccess, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!form.name || !form.phone || !form.address) {
      setErrorMsg('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.');
      setLoading(false);
      return;
    }

    const payload = {
      customer_name: form.name,
      customer_phone: form.phone,
      customer_email: form.email,
      shipping_address: form.address,
      shipping_province: form.province,
      shipping_note: form.note,
      items: items.map(i => ({
        product_id: i.product_id,
        variant_id: i.variant_id,
        quantity: i.quantity
      })),
      coupon_code: pricing.couponCode,
      payment_method: form.paymentMethod
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderSuccess(data);
        clearCart();
        localStorage.removeItem('lc_checkout_pricing');
        localStorage.removeItem('lc_applied_coupon');
      } else {
        if (data.requireLogin) {
          setErrorMsg('Bạn cần đăng nhập để tiến hành đặt hàng.');
          setTimeout(() => {
            router.push(`/login?redirect=/checkout`);
          }, 1500);
        } else {
          setErrorMsg(data.error || 'Đặt hàng thất bại. Vui lòng kiểm tra lại.');
        }
      }
    } catch {
      setErrorMsg('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    const { order, paymentInfo } = orderSuccess;
    return (
      <div className="lc-page-wrapper">
        <Header />
        <main style={{ background: '#f4f6f9', padding: '40px 0 80px' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', textAlign: 'center', border: '1px solid var(--lc-border)' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--lc-blue-dark)', margin: '0 0 8px 0' }}>
                Đặt Hàng Thành Công!
              </h2>
              <p style={{ color: 'var(--lc-muted)', fontSize: '15px', marginBottom: '24px' }}>
                Mã đơn hàng của bạn là: <strong style={{ color: 'var(--lc-orange)', fontSize: '18px' }}>{order.order_code}</strong>
              </p>

              {paymentInfo ? (
                /* Bank Transfer Payment Info */
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', margin: '0 auto 24px auto', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--lc-blue-dark)', margin: '0 0 16px 0', borderBottom: '1px solid #eee', paddingBottom: '10px', textAlign: 'center' }}>
                    Thông Tin Chuyển Khoản Ngân Hàng
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: '20px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14.5px' }}>
                      <div>Ngân hàng: <strong>{paymentInfo.bankName}</strong></div>
                      <div>Số tài khoản: <strong style={{ fontSize: '16px', color: 'var(--lc-blue)' }}>{paymentInfo.bankAccount || 'Đang tải...'}</strong></div>
                      <div>Chủ tài khoản: <strong>{paymentInfo.bankOwner}</strong></div>
                      <div>Số tiền: <strong style={{ fontSize: '16px', color: 'var(--lc-orange)' }}>{paymentInfo.amount.toLocaleString('vi-VN')}đ</strong></div>
                      <div>Nội dung CK: <strong style={{ color: '#d32f2f' }}>{paymentInfo.description}</strong></div>
                    </div>
                    {paymentInfo.qrUrl && (
                      <div style={{ textAlign: 'center' }}>
                        <img
                          src={paymentInfo.qrUrl}
                          alt="VietQR code"
                          style={{ width: '150px', height: '150px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '8px', padding: '4px' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div style={{ fontSize: '11px', color: 'var(--lc-muted)', marginTop: '4px' }}>Quét mã QR để trả</div>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--lc-muted)', margin: '16px 0 0 0', lineHeight: '1.5', fontStyle: 'italic', borderTop: '1px dashed #ccc', paddingTop: '12px' }}>
                    * Hệ thống sẽ tự động xác nhận đơn hàng sau khi nhận được chuyển khoản. Quý khách vui lòng điền chính xác nội dung chuyển khoản ở trên.
                  </p>
                </div>
              ) : (
                /* COD Info */
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', margin: '0 auto 24px auto', fontSize: '14.5px', textAlign: 'left' }}>
                  <p style={{ margin: 0, lineHeight: '1.6' }}>
                    ✓ Phương thức thanh toán: <strong>Thanh toán khi nhận hàng (COD)</strong>.
                  </p>
                  <p style={{ margin: '8px 0 0 0', lineHeight: '1.6' }}>
                    ✓ Nhân viên nhà thuốc sẽ liên hệ điện thoại với quý khách để xác nhận đơn hàng trước khi giao.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <Link
                  href="/orders"
                  style={{ display: 'block', padding: '12px 24px', borderRadius: '30px', background: 'var(--lc-blue)', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: '14.5px' }}
                >
                  Tra cứu đơn hàng
                </Link>
                <Link
                  href="/products"
                  style={{ display: 'block', padding: '12px 24px', borderRadius: '30px', border: '1.5px solid var(--lc-blue)', color: 'var(--lc-blue)', fontWeight: 700, textDecoration: 'none', fontSize: '14.5px' }}
                >
                  Tiếp tục mua thuốc
                </Link>
              </div>
            </div>
          </div>
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
            <Link href="/cart" style={{ color: 'var(--lc-text)', textDecoration: 'none' }}>Giỏ hàng</Link>
            <span>/</span>
            <span style={{ color: 'var(--lc-blue)', fontWeight: 600 }}>Đặt hàng</span>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--lc-blue-dark)', marginBottom: '20px' }}>
            Thông Tin Đặt Hàng & Thanh Toán
          </h1>

          {errorMsg && (
            <div style={{ background: '#fff2e8', border: '1px solid #ffbb96', color: '#d4380d', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: '24px', alignItems: 'start' }}>
            {/* Delivery Info */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid var(--lc-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--lc-blue-dark)', margin: 0, borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                Thông Tin Nhận Hàng
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13.5px', outline: 'none' }}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13.5px', outline: 'none' }}
                    placeholder="09xx xxx xxx"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Địa chỉ Email (Nhận hóa đơn)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13.5px', outline: 'none' }}
                  placeholder="name@example.com"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Địa chỉ nhận hàng *</label>
                  <input
                    type="text"
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13.5px', outline: 'none' }}
                    placeholder="Số nhà, ngõ, tên đường, phường/xã, quận/huyện"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Tỉnh/Thành phố *</label>
                  <select
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13.5px', outline: 'none', background: '#fff', cursor: 'pointer' }}
                  >
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Bình Dương">Bình Dương</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Khác">Tỉnh khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Ghi chú đơn hàng</label>
                <textarea
                  rows="3"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13.5px', outline: 'none', resize: 'vertical' }}
                  placeholder="Ghi chú về thời gian giao hàng, hướng dẫn tìm nhà..."
                />
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--lc-blue-dark)', margin: '12px 0 0 0', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                Phương Thức Thanh Toán
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', background: form.paymentMethod === 'cod' ? '#f0f7ff' : '#fff', borderColor: form.paymentMethod === 'cod' ? 'var(--lc-blue)' : '#ccc' }}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={form.paymentMethod === 'cod'}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  />
                  <div>
                    <strong>Thanh toán khi nhận hàng (COD)</strong>
                    <div style={{ fontSize: '12px', color: 'var(--lc-muted)', marginTop: '2px' }}>Quý khách trả tiền mặt cho shipper khi nhận hàng</div>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', background: form.paymentMethod === 'bank' ? '#f0f7ff' : '#fff', borderColor: form.paymentMethod === 'bank' ? 'var(--lc-blue)' : '#ccc' }}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={form.paymentMethod === 'bank'}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  />
                  <div>
                    <strong>Chuyển khoản ngân hàng (VietQR quét mã chuyển khoản nhanh)</strong>
                    <div style={{ fontSize: '12px', color: 'var(--lc-muted)', marginTop: '2px' }}>Hiển thị thông tin tài khoản và mã QR VietQR sau khi đặt hàng</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Review Column */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid var(--lc-border)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--lc-blue-dark)', margin: '0 0 16px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                Đơn Hàng Của Bạn
              </h3>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '200px', overflowY: 'auto', paddingRight: '6px' }}>
                {items.map((item) => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13.5px', borderBottom: '1px dashed #eee', paddingBottom: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--lc-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.product_name}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--lc-muted)' }}>
                        Đơn vị: {item.variant_name} x {item.quantity}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--lc-blue-dark)' }}>
                      {(item.unit_price * item.quantity).toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between' }}>
                  <span>Tạm tính</span>
                  <span>{pricing.subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                {pricing.discount > 0 && (
                  <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between', color: 'var(--lc-green)' }}>
                    <span>Giảm giá</span>
                    <span>-{pricing.discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between' }}>
                  <span>Phí vận chuyển</span>
                  <span>{pricing.shippingFee === 0 ? 'Miễn phí' : `${pricing.shippingFee.toLocaleString('vi-VN')}đ`}</span>
                </div>
                <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '4px', display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between', fontWeight: 700, fontSize: '15px', color: 'var(--lc-blue-dark)' }}>
                  <span>Tổng tiền thanh toán</span>
                  <span style={{ fontSize: '18px', color: 'var(--lc-orange)' }}>{pricing.total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: '24px',
                  padding: '14px',
                  borderRadius: '30px',
                  border: 'none',
                  background: 'var(--lc-orange)',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {loading ? 'Đang đặt hàng...' : `Đặt hàng (${pricing.total.toLocaleString('vi-VN')}đ)`}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
