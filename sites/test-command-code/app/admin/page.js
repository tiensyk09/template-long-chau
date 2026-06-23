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
          const statsRes = await fetch('/api/admin/stats');
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
      const res = await fetch('/api/admin/init');
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

            <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '20px', marginTop: '10px' }}>
              {user?.tier === 'Free' && (
                <div style={{ padding: '20px', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '12px' }}>
                  <h4 style={{ color: '#c084fc', marginBottom: '8px' }}>⚡ Upgrade to Pro for just $1/mo</h4>
                  <p style={{ color: 'var(--admin-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                    Unlock full taste-1 meta-reinforcement learning, shared git registries (`npx taste push`), unlimited agent compute time, and custom prompts configuration storage.
                  </p>
                  <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => alert('Subscription integration coming soon!')}>Upgrade to Pro</button>
                </div>
              )}
              {user?.tier === 'Pro' && (
                <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px' }}>
                  <h4 style={{ color: '#34d399', marginBottom: '8px' }}>🎉 Pro Taste Plan Active</h4>
                  <p style={{ color: 'var(--admin-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                    Thank you for subscribing! Your CLI client has full access to taste-1 model endpoints. Run <code>npm i -g command-code</code> and authenticate with your account credentials.
                  </p>
                </div>
              )}
              {user?.tier === 'Enterprise' && (
                <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--admin-border)', borderRadius: '12px' }}>
                  <h4 style={{ color: '#fff', marginBottom: '8px' }}>🏢 Enterprise Plan Active</h4>
                  <p style={{ color: 'var(--admin-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                    Dedicated compute resources, private registries, and SLA guarantees are fully unlocked for your company team members.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminShell>
    );
  }

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
              <div className="stat-card-icon-admin purple">📝</div>
              <div className="stat-card-info-admin">
                <div className="stat-card-val-admin">{stats?.posts?.total || 0}</div>
                <div className="stat-card-lbl-admin">Changelog Posts</div>
                <div className="stat-card-sub-admin">{stats?.posts?.published || 0} active · {stats?.posts?.draft || 0} drafts</div>
              </div>
            </div>

            <div className="stat-card-admin">
              <div className="stat-card-icon-admin green">✉️</div>
              <div className="stat-card-info-admin">
                <div className="stat-card-val-admin">{stats?.newsletter?.total || 0}</div>
                <div className="stat-card-lbl-admin">Newsletter Subscribers</div>
                <div className="stat-card-sub-admin">Subscribed via forms</div>
              </div>
            </div>

            <div className="stat-card-admin">
              <div className="stat-card-icon-admin danger">👥</div>
              <div className="stat-card-info-admin">
                <div className="stat-card-val-admin">{stats?.members?.total || 0}</div>
                <div className="stat-card-lbl-admin">Registered Members</div>
                <div className="stat-card-sub-admin">{stats?.members?.pro || 0} Pro · {stats?.members?.enterprise || 0} Enterprise</div>
              </div>
            </div>
          </div>

          <div className="grid-split-admin">
            {/* Recent Posts */}
            <div className="adm-card" style={{ marginBottom: 0 }}>
              <div className="adm-card-header">
                <div className="adm-card-title">🕐 Recent Updates / Changelogs</div>
                <Link href="/admin/posts" className="btn btn-secondary btn-sm">Manage All</Link>
              </div>
              <div className="adm-card-body" style={{ padding: 0 }}>
                {stats?.recentPosts?.length === 0 ? (
                  <div className="adm-empty">
                    <div className="adm-empty-text">No posts available</div>
                  </div>
                ) : (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {stats?.recentPosts?.map((p, i) => (
                      <li key={p.id} style={{
                        padding: '16px 24px',
                        borderBottom: i < stats.recentPosts.length - 1 ? '1px solid var(--admin-border)' : 'none',
                        display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '16px'
                      }}>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginTop: '4px' }}>
                            {new Date(p.created_at).toLocaleDateString()} · {p.views} views
                          </div>
                        </div>
                        <span className={`badge ${p.status === 'published' ? 'badge-green' : 'badge-yellow'}`}>
                          {p.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Recent Subscribers */}
            <div className="adm-card" style={{ marginBottom: 0 }}>
              <div className="adm-card-header">
                <div className="adm-card-title">📩 Recent Subscribers</div>
              </div>
              <div className="adm-card-body" style={{ padding: 0 }}>
                {stats?.recentSignups?.length === 0 ? (
                  <div className="adm-empty">
                    <div className="adm-empty-text">No subscribers yet</div>
                  </div>
                ) : (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {stats?.recentSignups?.map((s, i) => (
                      <li key={s.id} style={{
                        padding: '16px 24px',
                        borderBottom: i < stats.recentSignups.length - 1 ? '1px solid var(--admin-border)' : 'none',
                        display: 'flex', flexDirection: 'column'
                      }}>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>{s.email}</span>
                        <span style={{ fontSize: '11px', color: 'var(--admin-muted)', marginTop: '4px' }}>Joined: {new Date(s.created_at).toLocaleString()}</span>
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
              <div className="adm-card-title">⚡ Quick Actions</div>
            </div>
            <div className="adm-card-body" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/admin/posts/new" className="btn btn-primary">📝 Create Changelog</Link>
              {user.role === 'admin' && (
                <Link href="/admin/members" className="btn btn-secondary">👥 Manage Members</Link>
              )}
              <button className="btn btn-secondary" onClick={initDb}>🔄 Re-seed Schema</button>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
