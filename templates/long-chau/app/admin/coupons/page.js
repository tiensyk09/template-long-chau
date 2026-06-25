'use client';
import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import '@/app/admin/admin.css';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: 0,
    min_order: 0,
    max_discount: '',
    usage_limit: '',
    expires_at: ''
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    setLoading(true);
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      } else {
        setMsg({ type: 'error', text: 'Không thể tải danh sách coupon' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setLoading(false);
    }
  }

  const openAddModal = () => {
    setForm({
      code: '',
      discount_type: 'percent',
      discount_value: 10,
      min_order: 100000,
      max_discount: '',
      usage_limit: '',
      expires_at: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discount_value) return;

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          code: form.code.toUpperCase(),
          discount_value: parseFloat(form.discount_value),
          min_order: parseFloat(form.min_order || 0),
          max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
          usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
          expires_at: form.expires_at || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: 'Thêm mã giảm giá thành công' });
        setIsModalOpen(false);
        loadCoupons();
      } else {
        setMsg({ type: 'error', text: data.error || 'Thao tác thất bại' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleToggleActive = async (coupon) => {
    const nextActive = coupon.is_active ? 0 : 1;
    try {
      const res = await fetch('/api/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: coupon.id, is_active: nextActive })
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Cập nhật trạng thái thành công' });
        loadCoupons();
      } else {
        setMsg({ type: 'error', text: 'Không thể cập nhật trạng thái' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;
    try {
      const res = await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Xóa mã giảm giá thành công' });
        loadCoupons();
      } else {
        setMsg({ type: 'error', text: 'Xóa mã giảm giá thất bại' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <AdminShell title="Quản lý Mã giảm giá (Coupons)">
      {msg && (
        <div className={`adm-alert adm-alert-${msg.type === 'success' ? 'success' : 'error'}`}>
          {msg.text}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button onClick={openAddModal} className="btn btn-primary">
          ➕ Tạo mã giảm giá mới
        </button>
      </div>

      {/* Coupons Table */}
      <div className="adm-card">
        <div className="adm-table-wrap">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-muted)' }}>Đang tải danh sách coupon...</div>
          ) : coupons.length === 0 ? (
            <div className="adm-empty">
              <div className="adm-empty-icon">🎟️</div>
              <div className="adm-empty-text">Chưa có mã giảm giá nào được tạo</div>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Mã giảm giá</th>
                  <th>Loại giảm</th>
                  <th>Giá trị giảm</th>
                  <th>Đơn tối thiểu</th>
                  <th>Giảm tối đa</th>
                  <th>Đã dùng / Giới hạn</th>
                  <th>Ngày hết hạn</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: '700', color: 'var(--admin-primary)', fontFamily: 'var(--admin-mono-font)' }}>{c.code}</td>
                    <td>
                      <span className={`badge ${c.discount_type === 'percent' ? 'badge-blue' : 'badge-green'}`}>
                        {c.discount_type === 'percent' ? 'Phần trăm (%)' : 'Số tiền cố định'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {c.discount_type === 'percent' ? `${c.discount_value}%` : `${c.discount_value.toLocaleString('vi-VN')}đ`}
                    </td>
                    <td>{c.min_order ? `${c.min_order.toLocaleString('vi-VN')}đ` : 'Không yêu cầu'}</td>
                    <td>{c.max_discount ? `${c.max_discount.toLocaleString('vi-VN')}đ` : 'Không giới hạn'}</td>
                    <td>
                      <strong>{c.usage_count || 0}</strong> / {c.usage_limit || '∞'}
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--admin-muted)' }}>
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString('vi-VN') : 'Vĩnh viễn'}
                    </td>
                    <td>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={!!c.is_active}
                          onChange={() => handleToggleActive(c)}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(c.id)} title="Xóa">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Coupon Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', width: '100%', maxWidth: '600px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', borderBottom: '1px solid #27272a', paddingBottom: '12px', marginBottom: '20px' }}>
              Tạo Mã Giảm Giá Mới
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Mã giảm giá *</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="SALE20"
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px', textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Loại giảm giá *</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (đ)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Giá trị giảm *</label>
                  <input
                    type="number"
                    required
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Đơn hàng tối thiểu</label>
                  <input
                    type="number"
                    value={form.min_order}
                    onChange={(e) => setForm({ ...form, min_order: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Giảm tối đa (Fixed)</label>
                  <input
                    type="number"
                    disabled={form.discount_type !== 'percent'}
                    value={form.max_discount}
                    onChange={(e) => setForm({ ...form, max_discount: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px' }}
                    placeholder="Không giới hạn"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Giới hạn lượt dùng</label>
                  <input
                    type="number"
                    value={form.usage_limit}
                    onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px' }}
                    placeholder="Không giới hạn"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Ngày hết hạn</label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #27272a', paddingTop: '16px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
