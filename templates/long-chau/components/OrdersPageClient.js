'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function OrdersPageClient() {
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const [myOrders, setMyOrders] = useState([]);
  const [myOrdersLoading, setMyOrdersLoading] = useState(false);
  const [requireLogin, setRequireLogin] = useState(false);

  // Load user order history on mount
  useEffect(() => {
    async function loadHistory() {
      setMyOrdersLoading(true);
      try {
        const res = await fetch('/api/orders/my');
        if (res.ok) {
          const data = await res.json();
          setMyOrders(data.orders || []);
          setRequireLogin(false);
        } else if (res.status === 401) {
          setRequireLogin(true);
        }
      } catch {
        // Silent fail
      } finally {
        setMyOrdersLoading(false);
      }
    }
    loadHistory();
  }, []);

  const handleLookup = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);
    if (!searchCode.trim()) return;

    setSearchLoading(true);
    try {
      const res = await fetch(`/api/orders/${searchCode.trim()}`);
      const data = await res.json();
      if (res.ok && data.order) {
        setSearchResult(data.order);
      } else {
        setSearchError(data.error || 'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã.');
      }
    } catch {
      setSearchError('Đã xảy ra lỗi khi tra cứu đơn hàng.');
    } finally {
      setSearchLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { text: 'Chờ xác nhận', color: '#faad14', bg: '#fffbe6', border: '#ffe58f' },
      confirmed: { text: 'Đã xác nhận', color: '#1890ff', bg: '#e6f7ff', border: '#91d5ff' },
      shipping: { text: 'Đang giao hàng', color: '#722ed1', bg: '#f9f0ff', border: '#d3adf7' },
      completed: { text: 'Đã giao hàng', color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f' },
      cancelled: { text: 'Đã hủy', color: '#f5222d', bg: '#fff1f0', border: '#ffa39e' }
    };
    const s = map[status] || { text: status, color: '#555', bg: '#f5f5f5', border: '#d9d9d9' };
    return (
      <span style={{
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 600
      }}>
        {s.text}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const map = {
      pending: { text: 'Chưa thanh toán', color: '#fa8c16', bg: '#fff7e6', border: '#ffd591' },
      paid: { text: 'Đã thanh toán', color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f' },
      refunded: { text: 'Đã hoàn tiền', color: '#eb2f96', bg: '#fff0f6', border: '#ffadd2' }
    };
    const s = map[status] || { text: status, color: '#555', bg: '#f5f5f5', border: '#d9d9d9' };
    return (
      <span style={{
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 600,
        marginLeft: '6px'
      }}>
        {s.text}
      </span>
    );
  };

  return (
    <div className="lc-page-wrapper">
      <Header />

      <main style={{ background: '#f4f6f9', padding: '24px 0 60px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
          {/* Breadcrumbs */}
          <div style={{ fontSize: '13px', color: 'var(--lc-muted)', marginBottom: '16px', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Link href="/" style={{ color: 'var(--lc-text)', textDecoration: 'none' }}>Trang chủ</Link>
            <span>/</span>
            <span style={{ color: 'var(--lc-blue)', fontWeight: 600 }}>Đơn hàng của tôi</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'start' }}>
            {/* Left: Quick Lookup Form */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid var(--lc-border)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--lc-blue-dark)', margin: '0 0 12px 0' }}>
                Tra Cứu Đơn Hàng Nhanh
              </h3>
              <p style={{ color: 'var(--lc-muted)', fontSize: '13px', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                Nhập mã đơn hàng (ví dụ: LC-xxxxxxxxxx) để kiểm tra tình trạng xử lý và vận chuyển.
              </p>

              <form onSubmit={handleLookup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  required
                  placeholder="Mã đơn hàng (LC-...)"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    fontSize: '14px',
                    outline: 'none',
                    width: '100%'
                  }}
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  style={{
                    padding: '10px',
                    borderRadius: '20px',
                    border: 'none',
                    background: 'var(--lc-orange)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {searchLoading ? 'Đang tra cứu...' : 'Tra cứu ngay'}
                </button>
              </form>

              {searchError && (
                <div style={{ background: '#fff1f0', border: '1px solid #ffa39e', color: '#f5222d', padding: '10px', borderRadius: '6px', marginTop: '12px', fontSize: '13px' }}>
                  {searchError}
                </div>
              )}

              {/* Single Search Result */}
              {searchResult && (
                <div style={{ borderTop: '1px solid #eee', marginTop: '20px', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--lc-blue-dark)', margin: '0 0 12px 0' }}>
                    Kết quả tra cứu đơn {searchResult.order_code}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Trạng thái:</span>
                      {getStatusBadge(searchResult.status)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Thanh toán:</span>
                      <div>
                        <span style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 'bold' }}>{searchResult.payment_method}</span>
                        {getPaymentStatusBadge(searchResult.payment_status)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tổng tiền:</span>
                      <strong style={{ color: 'var(--lc-orange)' }}>{searchResult.total.toLocaleString('vi-VN')}đ</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Ngày đặt:</span>
                      <span>{new Date(searchResult.created_at).toLocaleString('vi-VN')}</span>
                    </div>

                    <div style={{ marginTop: '12px', borderTop: '1px dashed #eee', paddingTop: '12px' }}>
                      <span style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Sản phẩm đã chọn:</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {searchResult.items.map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--lc-text)' }}>
                            <span>{it.product_name} ({it.variant_name}) x{it.quantity}</span>
                            <span>{it.line_total?.toLocaleString('vi-VN') || (it.unit_price * it.quantity).toLocaleString('vi-VN')}đ</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Personal Order History (Requires login) */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid var(--lc-border)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--lc-blue-dark)', margin: '0 0 16px 0' }}>
                Lịch Sử Đơn Hàng Của Bạn
              </h3>

              {requireLogin ? (
                <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
                  <p style={{ color: 'var(--lc-muted)', fontSize: '13.5px', marginBottom: '16px' }}>
                    Vui lòng đăng nhập để xem lịch sử mua hàng cá nhân.
                  </p>
                  <Link
                    href="/login?redirect=/orders"
                    style={{ display: 'inline-block', background: 'var(--lc-blue)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '20px', fontWeight: 700, textDecoration: 'none', fontSize: '13.5px' }}
                  >
                    Đăng nhập tài khoản
                  </Link>
                </div>
              ) : myOrdersLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--lc-muted)', fontSize: '14px' }}>
                  Đang tải danh sách đơn hàng...
                </div>
              ) : myOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--lc-muted)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
                  <p style={{ fontSize: '13.5px' }}>Bạn chưa có đơn hàng nào.</p>
                  <Link href="/products" style={{ color: 'var(--lc-blue)', fontWeight: 600, fontSize: '13.5px', textDecoration: 'none' }}>
                    Đi xem sản phẩm ngay ➔
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {myOrders.map((ord) => (
                    <div key={ord.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px', background: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--lc-blue-dark)', fontSize: '14.5px' }}>
                          {ord.order_code}
                        </span>
                        <span>
                          {new Date(ord.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', marginBottom: '12px' }}>
                        {ord.items.map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--lc-text)' }}>
                            <span>{it.product_name} ({it.variant_name}) x{it.quantity}</span>
                            <span>{it.line_total?.toLocaleString('vi-VN') || (it.unit_price * it.quantity).toLocaleString('vi-VN')}đ</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #eee', paddingTop: '10px' }}>
                        <div>
                          <span>Trạng thái: </span>
                          {getStatusBadge(ord.status)}
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--lc-orange)', fontSize: '15px' }}>
                          {ord.total.toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
