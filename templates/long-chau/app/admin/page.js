'use client';
import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import '@/app/admin/admin.css';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);
  const [initMsg, setInitMsg] = useState('');

  useEffect(() => {
    loadUserAndStats();
  }, []);

  async function loadUserAndStats() {
    try {
      const userRes = await fetch('/api/auth/login');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
        
        // If staff, load stats
        if (userData.user.role === 'admin' || userData.user.role === 'mod') {
          const statsRes = await fetch('/api/admin/dashboard');
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData);
            setDbReady(true);
          } else {
            setDbReady(false);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function initDb() {
    setInitMsg('Initializing...');
    try {
      const res = await fetch('/api/admin/init?force=true');
      const data = await res.json();
      if (res.ok) {
        setInitMsg('✅ Initialized successfully! Reloading...');
        setTimeout(() => {
          loadUserAndStats();
          setInitMsg('');
        }, 1500);
      } else {
        setInitMsg('❌ Error: ' + data.error);
      }
    } catch (err) {
      setInitMsg('❌ Connection error: ' + err.message);
    }
  }

  if (loading) {
    return (
      <AdminShell title="Loading Dashboard...">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(139, 92, 246, 0.2)', borderTopColor: 'var(--admin-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </AdminShell>
    );
  }

  const isStaff = user?.role === 'admin' || user?.role === 'mod';

  if (!isStaff) {
    // Renders user tier/rank dashboard for customer accounts
    return (
      <AdminShell title="Customer Dashboard">
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-card-title">👤 Account Profile Details</div>
          </div>
          <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--admin-muted)', display: 'block' }}>Username</span>
                <strong style={{ fontSize: '18px' }}>{user?.username}</strong>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--admin-muted)', display: 'block' }}>Display Name</span>
                <strong style={{ fontSize: '18px' }}>{user?.displayName}</strong>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--admin-muted)', display: 'block' }}>Email Address</span>
                <strong style={{ fontSize: '18px' }}>{user?.email}</strong>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--admin-muted)', display: 'block' }}>Account Rank / Tier</span>
                <span className="tier-tag" style={{ fontSize: '12px', padding: '4px 8px', marginTop: '4px', display: 'inline-block' }}>{user?.tier}</span>
              </div>
            </div>
          </div>
        </div>
      </AdminShell>
    );
  }

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

  // Staff (Admins and Mods) dashboard stats
  return (
    <AdminShell title="System Dashboard">
      {!dbReady && (
        <div className="adm-alert adm-alert-info">
          🗄️ Database tables or tables check failed. Press button to inspect/create schema tables.
          <button className="btn btn-primary btn-sm" style={{ marginLeft: '12px' }} onClick={initDb}>
            Run Schema Initialization
          </button>
          {initMsg && <span style={{ marginLeft: '10px' }}>{initMsg}</span>}
        </div>
      )}

      {dbReady && (
        <>
          <div className="stat-grid-admin">
            <div className="stat-card-admin">
              <div className="stat-card-icon-admin purple">💵</div>
              <div className="stat-card-info-admin">
                <div className="stat-card-val-admin">{(stats?.revenue?.month || 0).toLocaleString('vi-VN')}đ</div>
                <div className="stat-card-lbl-admin">Doanh thu 30 ngày</div>
                <div className="stat-card-sub-admin">Hôm nay: {(stats?.revenue?.today || 0).toLocaleString('vi-VN')}đ</div>
              </div>
            </div>

            <div className="stat-card-admin">
              <div className="stat-card-icon-admin green">📦</div>
              <div className="stat-card-info-admin">
                <div className="stat-card-val-admin">{stats?.orders?.total || 0}</div>
                <div className="stat-card-lbl-admin">Tổng đơn hàng</div>
                <div className="stat-card-sub-admin">Chờ xử lý: <strong style={{ color: 'var(--lc-orange, #f57c00)' }}>{stats?.orders?.pending || 0}</strong> đơn</div>
              </div>
            </div>

            <div className="stat-card-admin">
              <div className="stat-card-icon-admin danger">💊</div>
              <div className="stat-card-info-admin">
                <div className="stat-card-val-admin">{stats?.products?.total || 0}</div>
                <div className="stat-card-lbl-admin">Sản phẩm đang bán</div>
                <div className="stat-card-sub-admin">Sắp hết hàng (tồn &lt;= 5): <strong style={{ color: '#ff4d4f' }}>{stats?.products?.lowStock || 0}</strong></div>
              </div>
            </div>
          </div>

          <div className="grid-split-admin">
            {/* Recent Orders */}
            <div className="adm-card" style={{ marginBottom: 0 }}>
              <div className="adm-card-header">
                <div className="adm-card-title">🕐 Đơn hàng mới nhất</div>
                <Link href="/admin/orders" className="btn btn-secondary btn-sm">Xem tất cả</Link>
              </div>
              <div className="adm-card-body" style={{ padding: 0 }}>
                {stats?.recentOrders?.length === 0 ? (
                  <div className="adm-empty">
                    <div className="adm-empty-text">Chưa có đơn hàng nào</div>
                  </div>
                ) : (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {stats?.recentOrders?.map((ord, i) => {
                      const statusInfo = getStatusLabel(ord.status);
                      return (
                        <li key={ord.order_code} style={{
                          padding: '16px 24px',
                          borderBottom: i < stats.recentOrders.length - 1 ? '1px solid var(--admin-border)' : 'none',
                          display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '16px'
                        }}>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>
                              {ord.order_code} — {ord.customer_name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginTop: '4px' }}>
                              {new Date(ord.created_at).toLocaleString('vi-VN')} · <strong style={{ color: 'var(--admin-primary)' }}>{ord.total.toLocaleString('vi-VN')}đ</strong>
                            </div>
                          </div>
                          <span className={`badge ${statusInfo.class}`}>
                            {statusInfo.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="adm-card" style={{ marginBottom: 0 }}>
              <div className="adm-card-header">
                <div className="adm-card-title">🔥 Top sản phẩm bán chạy</div>
                <Link href="/admin/products" className="btn btn-secondary btn-sm">Quản lý sản phẩm</Link>
              </div>
              <div className="adm-card-body" style={{ padding: 0 }}>
                {stats?.topProducts?.length === 0 ? (
                  <div className="adm-empty">
                    <div className="adm-empty-text">Chưa có sản phẩm nào được bán</div>
                  </div>
                ) : (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {stats?.topProducts?.map((p, i) => (
                      <li key={p.id} style={{
                        padding: '12px 24px',
                        borderBottom: i < stats.topProducts.length - 1 ? '1px solid var(--admin-border)' : 'none',
                        display: 'flex', alignItems: 'center', gap: '12px'
                      }}>
                        <img
                          src={p.thumbnail || '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png'}
                          alt={p.name}
                          style={{ width: '36px', height: '36px', objectFit: 'contain', background: '#fff', border: '1px solid #3f3f46', borderRadius: '4px' }}
                          onError={(e) => { e.target.src = 'https://picsum.photos/36/36'; }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '13.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Giá bán: {p.price.toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>Đã bán:</span>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#4ade80' }}>{p.sold_count || 0}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="adm-card">
            <div className="adm-card-header">
              <div className="adm-card-title">⚡ Thao tác nhanh</div>
            </div>
            <div className="adm-card-body" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/admin/products" className="btn btn-primary">🛍️ Quản lý sản phẩm</Link>
              <Link href="/admin/orders" className="btn btn-secondary">📦 Quản lý đơn hàng</Link>
              <Link href="/admin/coupons" className="btn btn-secondary">🎟️ Quản lý Coupon</Link>
              <button className="btn btn-secondary" onClick={initDb}>🔄 Khởi tạo lại Dữ liệu mẫu (Seed)</button>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
