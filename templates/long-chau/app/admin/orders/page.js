'use client';
import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import '@/app/admin/admin.css';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  
  // Search and filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form, setForm] = useState({
    status: 'pending',
    payment_status: 'pending',
    admin_note: ''
  });

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  async function loadOrders() {
    setLoading(true);
    try {
      const url = `/api/orders?limit=50&status=${statusFilter}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        setMsg({ type: 'error', text: 'Không thể tải danh sách đơn hàng' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const openEditModal = async (orderSummary) => {
    try {
      // Fetch full details
      const res = await fetch(`/api/orders/${orderSummary.order_code}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data.order);
        setForm({
          status: data.order.status || 'pending',
          payment_status: data.order.payment_status || 'pending',
          admin_note: data.order.admin_note || ''
        });
        setIsModalOpen(true);
      } else {
        setMsg({ type: 'error', text: 'Không thể lấy thông tin chi tiết đơn hàng' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/orders/${selectedOrder.order_code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'Cập nhật trạng thái đơn hàng thành công' });
        setIsModalOpen(false);
        loadOrders();
      } else {
        setMsg({ type: 'error', text: data.error || 'Cập nhật thất bại' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      pending: { text: 'Chờ xác nhận', class: 'badge-yellow' },
      confirmed: { text: 'Đã xác nhận', class: 'badge-blue' },
      shipping: { text: 'Đang giao', class: 'badge-blue' },
      completed: { text: 'Đã giao xong', class: 'badge-green' },
      cancelled: { text: 'Đã hủy', class: 'badge-red' }
    };
    return map[status] || { text: status, class: '' };
  };

  return (
    <AdminShell title="Quản lý Đơn hàng">
      {msg && (
        <div className={`adm-alert adm-alert-${msg.type === 'success' ? 'success' : 'error'}`}>
          {msg.text}
        </div>
      )}

      {/* Filter toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flex: 1, maxWidth: '600px' }}>
          <input
            type="text"
            className="adm-filter-select"
            placeholder="Tìm mã đơn hàng, tên khách hàng, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '6px' }}
          />
          <select
            className="adm-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '6px' }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="shipping">Đang giao hàng</option>
            <option value="completed">Đã giao xong</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <button type="submit" className="btn btn-secondary">Lọc</button>
        </form>
      </div>

      {/* Table list */}
      <div className="adm-card">
        <div className="adm-table-wrap">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-muted)' }}>Đang tải danh sách đơn hàng...</div>
          ) : orders.length === 0 ? (
            <div className="adm-empty">
              <div className="adm-empty-icon">📦</div>
              <div className="adm-empty-text">Không tìm thấy đơn hàng nào</div>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Số điện thoại</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => {
                  const statusInfo = getStatusLabel(ord.status);
                  return (
                    <tr key={ord.id}>
                      <td style={{ fontWeight: '700', color: 'var(--admin-primary)' }}>{ord.order_code}</td>
                      <td>{ord.customer_name}</td>
                      <td>{ord.customer_phone}</td>
                      <td style={{ fontWeight: 700, color: 'var(--lc-orange, #f57c00)' }}>
                        {ord.total.toLocaleString('vi-VN')}đ
                      </td>
                      <td>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', marginRight: '6px', fontWeight: 'bold' }}>
                          {ord.payment_method}
                        </span>
                        <span className={`badge ${ord.payment_status === 'paid' ? 'badge-green' : 'badge-yellow'}`}>
                          {ord.payment_status === 'paid' ? 'Đã thu' : 'Chờ'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${statusInfo.class}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td style={{ color: 'var(--admin-muted)', fontSize: '12px' }}>
                        {new Date(ord.created_at).toLocaleString('vi-VN')}
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(ord)}>
                          👁️ Chi tiết / Xử lý
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Order Modal */}
      {isModalOpen && selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', borderBottom: '1px solid #27272a', paddingBottom: '12px', marginBottom: '20px' }}>
              Xử lý Đơn hàng: {selectedOrder.order_code}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '20px' }}>
              {/* Customer Details */}
              <div style={{ background: '#27272a', padding: '16px', borderRadius: '8px', border: '1px solid #3f3f46', fontSize: '13.5px', color: '#e4e4e7' }}>
                <h4 style={{ margin: '0 0 12px 0', borderBottom: '1px solid #3f3f46', paddingBottom: '6px', color: '#fff' }}>
                  Thông tin giao nhận
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>Khách hàng: <strong>{selectedOrder.customer_name}</strong></div>
                  <div>Điện thoại: <strong>{selectedOrder.customer_phone}</strong></div>
                  {selectedOrder.customer_email && <div>Email: {selectedOrder.customer_email}</div>}
                  <div>Địa chỉ: {selectedOrder.shipping_address}, {selectedOrder.shipping_province}</div>
                  {selectedOrder.shipping_note && <div style={{ color: 'var(--lc-orange)' }}>Ghi chú: {selectedOrder.shipping_note}</div>}
                  <div>Phương thức thanh toán: <strong style={{ textTransform: 'uppercase' }}>{selectedOrder.payment_method}</strong></div>
                </div>
              </div>

              {/* Items Summary */}
              <div style={{ background: '#27272a', padding: '16px', borderRadius: '8px', border: '1px solid #3f3f46', fontSize: '13px', color: '#e4e4e7' }}>
                <h4 style={{ margin: '0 0 12px 0', borderBottom: '1px solid #3f3f46', paddingBottom: '6px', color: '#fff' }}>
                  Sản phẩm đã mua
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #3f3f46', paddingBottom: '4px' }}>
                      <span>{it.product_name} ({it.variant_name}) x{it.quantity}</span>
                      <span style={{ fontWeight: 600 }}>{it.line_total?.toLocaleString('vi-VN') || (it.unit_price * it.quantity).toLocaleString('vi-VN')}đ</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px', borderTop: '1px solid #3f3f46', paddingTop: '8px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tạm tính:</span>
                    <span>{selectedOrder.subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}>
                      <span>Mã giảm giá:</span>
                      <span>-{selectedOrder.discount_amount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Phí ship:</span>
                    <span>{selectedOrder.shipping_fee.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px', color: '#fff', marginTop: '4px' }}>
                    <span>Tổng tiền:</span>
                    <span style={{ color: 'var(--lc-orange, #f57c00)' }}>{selectedOrder.total.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Editing Form */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>
                    Trạng thái Đơn hàng *
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <option value="pending">Chờ xác nhận (Pending)</option>
                    <option value="confirmed">Đã xác nhận (Confirmed)</option>
                    <option value="shipping">Đang giao hàng (Shipping)</option>
                    <option value="completed">Đã giao xong (Completed)</option>
                    <option value="cancelled">Đã hủy (Cancelled)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>
                    Trạng thái Thanh toán *
                  </label>
                  <select
                    value={form.payment_status}
                    onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <option value="pending">Chờ thanh toán (Pending)</option>
                    <option value="paid">Đã thanh toán (Paid)</option>
                    <option value="refunded">Đã hoàn tiền (Refunded)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>
                  Ghi chú của Admin / Cửa hàng
                </label>
                <textarea
                  rows="3"
                  value={form.admin_note}
                  onChange={(e) => setForm({ ...form, admin_note: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px', resize: 'vertical' }}
                  placeholder="Ghi chú nội bộ: Mã vận đơn, lý do hủy đơn..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #27272a', paddingTop: '16px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Đóng</button>
                <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
