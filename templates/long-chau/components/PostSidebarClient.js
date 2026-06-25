'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartContext';

export default function PostSidebarClient({ recentUpdates = [], suggestedProducts = [] }) {
  const { addItem, showToast } = useCart();
  const [addingId, setAddingId] = useState(null);

  const handleAddToCart = (product) => {
    setAddingId(product.id);
    addItem(product, null, 1);
    setTimeout(() => {
      setAddingId(null);
    }, 800);
  };

  const handleConsultClick = () => {
    showToast('Tổng đài tư vấn miễn phí 1800 6928 luôn sẵn sàng hỗ trợ bạn 24/7!', 'info');
  };

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '130px', alignSelf: 'flex-start' }}>
      
      {/* 1. Pharmacist Consultation CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #005bcd 0%, #003d9e 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 24px rgba(0, 91, 205, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '72px', opacity: 0.15, pointerEvents: 'none' }}>
          👨‍⚕️
        </div>
        <h4 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Tư vấn Dược sĩ 24/7
        </h4>
        <p style={{ fontSize: '13px', lineHeight: 1.5, opacity: 0.9, margin: '0 0 16px 0' }}>
          Bạn cần tư vấn đơn thuốc hoặc tìm hiểu cách điều trị? Kết nối ngay với Dược sĩ Long Châu hoàn toàn miễn phí.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a
            href="tel:18006928"
            style={{
              background: '#ffffff',
              color: '#005bcd',
              textAlign: 'center',
              padding: '10px',
              borderRadius: '24px',
              fontWeight: 700,
              fontSize: '13.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            📞 Gọi 1800 6928
          </a>
          <button
            onClick={handleConsultClick}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: '1.5px solid rgba(255,255,255,0.4)',
              borderRadius: '24px',
              padding: '9px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
          >
            💬 Chat tư vấn
          </button>
        </div>
      </div>

      {/* 2. Suggested Products */}
      {suggestedProducts.length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--lc-text)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f0f5ff', paddingBottom: '8px' }}>
            <span>💊</span> Gợi ý dành cho bạn
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {suggestedProducts.map(prod => {
              const discountPercent = prod.original_price
                ? Math.round(((prod.original_price - prod.price) / prod.original_price) * 100)
                : 0;

              return (
                <div key={prod.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ width: '64px', height: '64px', flexShrink: 0, border: '1px solid #f3f4f6', borderRadius: '8px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={prod.thumbnail || '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png'}
                        alt={prod.name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.target.src = `https://picsum.photos/64/64?random=${prod.id}`; }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                      <Link href={`/products/${prod.slug}`} style={{ textDecoration: 'none' }}>
                        <h4 style={{
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: 'var(--lc-text)',
                          margin: 0,
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordBreak: 'break-word'
                        }}
                        className="hover-blue-transition"
                        >
                          {prod.name}
                        </h4>
                      </Link>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--lc-blue-dark)' }}>
                            {prod.price.toLocaleString('vi-VN')}đ
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--lc-muted)' }}>
                            / {prod.unit || 'Hộp'}
                          </span>
                        </div>
                        {discountPercent > 0 && (
                          <span style={{ fontSize: '10px', textDecoration: 'line-through', color: 'var(--lc-muted)' }}>
                            {prod.original_price.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(prod)}
                    disabled={addingId === prod.id}
                    style={{
                      width: '100%',
                      padding: '6px',
                      borderRadius: '16px',
                      border: 'none',
                      background: addingId === prod.id ? '#10b981' : 'var(--lc-blue-light)',
                      color: addingId === prod.id ? '#fff' : 'var(--lc-blue)',
                      fontWeight: 700,
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (addingId !== prod.id) {
                        e.currentTarget.style.background = 'var(--lc-blue)';
                        e.currentTarget.style.color = '#fff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (addingId !== prod.id) {
                        e.currentTarget.style.background = 'var(--lc-blue-light)';
                        e.currentTarget.style.color = 'var(--lc-blue)';
                      }
                    }}
                  >
                    {addingId === prod.id ? '✓ Đã thêm' : 'Chọn mua'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Recent Articles List */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--lc-text)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f0f5ff', paddingBottom: '8px' }}>
          <span>📰</span> Bài viết mới nhất
        </h3>
        
        {recentUpdates.length === 0 ? (
          <div style={{ fontSize: '13px', color: 'var(--lc-muted)', textAlign: 'center', padding: '12px 0' }}>Không có bài viết khác.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recentUpdates.map(u => (
              <div key={u.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '45px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                  <img
                    src={u.image || '/images/co_nen_dap_khoai_tay_len_vet_tiem_cho_tre_12024ebc0d.jpg'}
                    alt={u.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = `https://picsum.photos/60/45?random=${u.id}`; }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <Link href={`/posts/${u.slug}`} style={{ textDecoration: 'none' }}>
                    <h4 style={{
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: 'var(--lc-text)',
                      margin: 0,
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      wordBreak: 'break-word'
                    }}
                    className="hover-blue-transition"
                    >
                      {u.title}
                    </h4>
                  </Link>
                  <span style={{ fontSize: '10px', color: 'var(--lc-muted)', marginTop: '3px' }}>
                    📅 {new Date(u.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        .hover-blue-transition {
          transition: color 0.15s ease;
        }
        .hover-blue-transition:hover {
          color: var(--lc-blue) !important;
        }
      `}</style>
    </aside>
  );
}
