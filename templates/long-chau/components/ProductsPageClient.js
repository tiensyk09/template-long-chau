'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartContext';

export default function ProductsPageClient({
  categories = [],
  products = [],
  activeCategory = null,
  searchQ = '',
  sort = 'newest',
  pagination = {}
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [addingId, setAddingId] = useState(null);

  const handleSortChange = (newSort) => {
    const params = new URLSearchParams(window.location.search);
    params.set('sort', newSort);
    params.set('page', '1'); // reset page
    router.push(`/products?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const params = new URLSearchParams(window.location.search);
    params.set('page', newPage.toString());
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/products');
  };

  const handleAddToCart = (product) => {
    setAddingId(product.id);
    addItem(product, null, 1);
    setTimeout(() => {
      setAddingId(null);
    }, 800);
  };

  return (
    <div className="lc-page-wrapper">
      <Header />

      <main style={{ background: '#f4f6f9', padding: '24px 0 60px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          {/* Breadcrumbs */}
          <div style={{ fontSize: '13px', color: 'var(--lc-muted)', marginBottom: '16px', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Link href="/" style={{ color: 'var(--lc-text)', textDecoration: 'none' }}>Trang chủ</Link>
            <span>/</span>
            <Link href="/products" style={{ color: 'var(--lc-text)', textDecoration: 'none' }}>Sản phẩm</Link>
            {activeCategory && (
              <>
                <span>/</span>
                <span style={{ color: 'var(--lc-blue)', fontWeight: 600 }}>{activeCategory.name}</span>
              </>
            )}
            {searchQ && (
              <>
                <span>/</span>
                <span>Tìm kiếm: "{searchQ}"</span>
              </>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
            {/* Sidebar Filters */}
            <aside style={{ background: '#fff', borderRadius: '12px', padding: '20px', alignSelf: 'start', border: '1px solid var(--lc-border)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px', color: 'var(--lc-blue-dark)' }}>
                Danh Mục Sản Phẩm
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <Link
                    href="/products"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      color: !activeCategory ? '#fff' : 'var(--lc-text)',
                      background: !activeCategory ? 'var(--lc-blue)' : 'transparent',
                      fontWeight: !activeCategory ? 600 : 400
                    }}
                  >
                    <span>💊 Tất cả</span>
                  </Link>
                </li>
                {categories.map((cat) => {
                  const isActive = activeCategory?.slug === cat.slug;
                  return (
                    <li key={cat.id}>
                      <Link
                        href={`/products?category=${cat.slug}${searchQ ? `&q=${encodeURIComponent(searchQ)}` : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontSize: '14px',
                          color: isActive ? '#fff' : 'var(--lc-text)',
                          background: isActive ? 'var(--lc-blue)' : 'transparent',
                          fontWeight: isActive ? 600 : 400,
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>{cat.icon || '📦'} {cat.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* Product List Section */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Toolbar */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--lc-border)' }}>
                <div style={{ fontSize: '14px', color: 'var(--lc-text)' }}>
                  Tìm thấy <strong>{pagination.total}</strong> sản phẩm
                  {(activeCategory || searchQ) && (
                    <span
                      onClick={clearFilters}
                      style={{ marginLeft: '12px', color: 'var(--lc-orange)', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                    >
                      ❌ Xóa bộ lọc
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--lc-muted)' }}>Sắp xếp:</span>
                  <select
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                      fontSize: '13.5px',
                      outline: 'none',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="price_asc">Giá tăng dần</option>
                    <option value="price_desc">Giá giảm dần</option>
                    <option value="popular">Bán chạy nhất</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              {products.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '60px 20px', textAlign: 'center', border: '1px solid var(--lc-border)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--lc-text)' }}>Không tìm thấy sản phẩm</h3>
                  <p style={{ color: 'var(--lc-muted)', fontSize: '14px', marginTop: '6px' }}>Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.</p>
                  <button
                    onClick={clearFilters}
                    style={{ marginTop: '16px', background: 'var(--lc-blue)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Xem tất cả sản phẩm
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                    {products.map((prod) => {
                      const discountPercent = prod.original_price
                        ? Math.round(((prod.original_price - prod.price) / prod.original_price) * 100)
                        : 0;

                      return (
                        <div
                          key={prod.id}
                          className="lc-product-card"
                          style={{
                            background: '#fff',
                            borderRadius: '12px',
                            border: '1px solid var(--lc-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {discountPercent > 0 && (
                            <div className="lc-product-discount" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2 }}>
                              -{discountPercent}%
                            </div>
                          )}
                          <Link href={`/products/${prod.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '16px' }}>
                            <div style={{ width: '100%', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                              <img
                                src={prod.thumbnail || '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png'}
                                alt={prod.name}
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                onError={(e) => {
                                  e.target.src = 'https://picsum.photos/160/160?random=' + prod.id;
                                }}
                              />
                            </div>
                            <div style={{ minHeight: '84px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                              <div>
                                {prod.brand && (
                                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--lc-blue)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                                    {prod.brand}
                                  </span>
                                )}
                                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--lc-text)', margin: 0, lineBreak: 'anywhere', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '38px', lineHeight: '1.4' }}>
                                  {prod.name}
                                </h4>
                              </div>
                            </div>
                            <div style={{ marginTop: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--lc-blue-dark)' }}>
                                  {prod.price.toLocaleString('vi-VN')}đ
                                </span>
                                <span style={{ fontSize: '12px', color: 'var(--lc-muted)' }}>
                                  / {prod.unit || 'Hộp'}
                                </span>
                              </div>
                              {prod.original_price && (
                                <div style={{ fontSize: '12px', color: 'var(--lc-muted)', textDecoration: 'line-through', marginTop: '2px' }}>
                                  {prod.original_price.toLocaleString('vi-VN')}đ
                                </div>
                              )}
                            </div>
                          </Link>
                          <div style={{ padding: '0 16px 16px', marginTop: 'auto' }}>
                            <button
                              onClick={() => handleAddToCart(prod)}
                              disabled={addingId === prod.id}
                              className="lc-btn-chon-mua"
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '20px',
                                border: 'none',
                                background: addingId === prod.id ? 'var(--lc-green, #2e7d32)' : 'var(--lc-blue)',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '13.5px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                            >
                              {addingId === prod.id ? '✓ Đã thêm!' : 'Chọn mua'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '30px' }}>
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid #ccc',
                          background: '#fff',
                          cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                          opacity: pagination.page === 1 ? 0.5 : 1,
                          fontSize: '13.5px'
                        }}
                      >
                        « Trước
                      </button>
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        const isCurrent = pagination.page === pageNum;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              border: isCurrent ? 'none' : '1px solid #ccc',
                              background: isCurrent ? 'var(--lc-blue)' : '#fff',
                              color: isCurrent ? '#fff' : 'var(--lc-text)',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '13.5px'
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid #ccc',
                          background: '#fff',
                          cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                          opacity: pagination.page === pagination.totalPages ? 0.5 : 1,
                          fontSize: '13.5px'
                        }}
                      >
                        Sau »
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
