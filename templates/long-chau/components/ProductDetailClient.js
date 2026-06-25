'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartContext';

export default function ProductDetailClient({
  product = {},
  variants = [],
  reviews = [],
  related = []
}) {
  const router = useRouter();
  const { addItem, showToast } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [adding, setAdding] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [localReviews, setLocalReviews] = useState(reviews);

  const displayPrice = selectedVariant
    ? selectedVariant.price
    : (product.flash_sale_price || product.price);

  const originalPrice = product.original_price;

  const handleQtyChange = (val) => {
    const newQty = quantity + val;
    if (newQty >= 1) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = (redirect = false) => {
    setAdding(true);
    addItem(product, selectedVariant, quantity);
    setTimeout(() => {
      setAdding(false);
      if (redirect) {
        router.push('/cart');
      }
    }, 500);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) return;

    const newRev = {
      id: Date.now(),
      reviewer_name: reviewForm.name,
      rating: parseInt(reviewForm.rating),
      comment: reviewForm.comment,
      is_verified: 1,
      created_at: new Date().toISOString()
    };

    setLocalReviews([newRev, ...localReviews]);
    setReviewForm({ name: '', rating: 5, comment: '' });
    showToast('Cảm ơn bạn đã gửi đánh giá!', 'success');
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
            <span>/</span>
            <Link href={`/products?category=${product.category_slug}`} style={{ color: 'var(--lc-text)', textDecoration: 'none' }}>
              {product.category_name}
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--lc-blue)', fontWeight: 600 }}>{product.name}</span>
          </div>

          {/* Product Info Card */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', display: 'grid', gridTemplateColumns: '460px 1fr', gap: '40px', border: '1px solid var(--lc-border)', marginBottom: '24px' }}>
            {/* Image Gallery */}
            <div>
              <div style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', borderRadius: '12px', padding: '20px', overflow: 'hidden' }}>
                <img
                  src={product.thumbnail || '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png'}
                  alt={product.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.src = 'https://picsum.photos/400/400?random=' + product.id;
                  }}
                />
              </div>
            </div>

            {/* Product Meta Details */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {product.brand && (
                <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--lc-blue)', fontWeight: 800, marginBottom: '8px', display: 'block' }}>
                  Thương hiệu: {product.brand} | Xuất xứ: {product.origin || 'Đang cập nhật'}
                </span>
              )}
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--lc-blue-dark)', margin: '0 0 12px 0', lineHeight: '1.3' }}>
                {product.name}
              </h1>

              {/* Ratings Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', color: 'var(--lc-yellow)', fontSize: '16px' }}>
                  {'★'.repeat(Math.round(product.rating || 5))}
                  {'☆'.repeat(5 - Math.round(product.rating || 5))}
                </div>
                <span style={{ fontSize: '13.5px', color: 'var(--lc-muted)' }}>
                  ({localReviews.length} đánh giá)
                </span>
                <span style={{ color: '#eee' }}>|</span>
                <span style={{ fontSize: '13.5px', color: 'var(--lc-green)', fontWeight: 600 }}>
                  ✓ Còn hàng (Còn {selectedVariant ? selectedVariant.stock : product.stock} {selectedVariant ? selectedVariant.name : (product.unit || 'Hộp')})
                </span>
              </div>

              {/* Price row */}
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--lc-blue-dark)' }}>
                  {displayPrice.toLocaleString('vi-VN')}đ
                </span>
                <span style={{ fontSize: '14px', color: 'var(--lc-muted)' }}>
                  / {selectedVariant ? selectedVariant.name : (product.unit || 'Hộp')}
                </span>
                {originalPrice && originalPrice > displayPrice && (
                  <span style={{ fontSize: '16px', color: 'var(--lc-muted)', textDecoration: 'line-through' }}>
                    {originalPrice.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>

              {/* Variant Selector */}
              {variants.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--lc-text)' }}>
                    Chọn Đơn Vị Tính:
                  </span>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid var(--lc-blue)' : '1px solid #ccc',
                            background: isSelected ? '#eef6ff' : '#fff',
                            color: isSelected ? 'var(--lc-blue)' : 'var(--lc-text)',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '13.5px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {v.name} - {v.price.toLocaleString('vi-VN')}đ
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--lc-text)' }}>Số lượng:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                  <button
                    onClick={() => handleQtyChange(-1)}
                    style={{ width: '36px', height: '36px', border: 'none', background: '#f4f6f9', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ width: '48px', textAlign: 'center', fontSize: '15px', fontWeight: 600 }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQtyChange(1)}
                    style={{ width: '36px', height: '36px', border: 'none', background: '#f4f6f9', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  onClick={() => handleAddToCart(false)}
                  disabled={adding}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    borderRadius: '30px',
                    border: '1.5px solid var(--lc-blue)',
                    background: '#fff',
                    color: 'var(--lc-blue)',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {adding ? 'Đang xử lý...' : 'Thêm vào giỏ hàng'}
                </button>
                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={adding}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    borderRadius: '30px',
                    border: 'none',
                    background: 'var(--lc-orange)',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Mua ngay
                </button>
              </div>
            </div>
          </div>

          {/* Description & Reviews Tabs */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--lc-border)', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#f8fafc' }}>
              <button
                onClick={() => setActiveTab('description')}
                style={{
                  padding: '16px 24px',
                  border: 'none',
                  background: activeTab === 'description' ? '#fff' : 'transparent',
                  borderBottom: activeTab === 'description' ? '3px solid var(--lc-blue)' : 'none',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: activeTab === 'description' ? 'var(--lc-blue)' : 'var(--lc-text)',
                  cursor: 'pointer'
                }}
              >
                Mô tả sản phẩm
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                style={{
                  padding: '16px 24px',
                  border: 'none',
                  background: activeTab === 'reviews' ? '#fff' : 'transparent',
                  borderBottom: activeTab === 'reviews' ? '3px solid var(--lc-blue)' : 'none',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: activeTab === 'reviews' ? 'var(--lc-blue)' : 'var(--lc-text)',
                  cursor: 'pointer'
                }}
              >
                Đánh giá từ khách hàng ({localReviews.length})
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {activeTab === 'description' ? (
                <div style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--lc-text)' }}>
                  {product.short_description && (
                    <p style={{ fontWeight: 600, fontSize: '16px', color: 'var(--lc-blue-dark)', marginBottom: '16px' }}>
                      {product.short_description}
                    </p>
                  )}
                  <div
                    dangerouslySetInnerHTML={{ __html: product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.' }}
                    style={{ whiteSpace: 'pre-line' }}
                  />
                </div>
              ) : (
                <div>
                  {/* Reviews List */}
                  {localReviews.length === 0 ? (
                    <p style={{ color: 'var(--lc-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                      Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                      {localReviews.map((rev) => (
                        <div key={rev.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '14.5px', color: 'var(--lc-text)' }}>{rev.reviewer_name}</strong>
                            <span style={{ fontSize: '12px', color: 'var(--lc-muted)' }}>
                              {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div style={{ display: 'flex', color: 'var(--lc-yellow)', fontSize: '13px', marginBottom: '6px' }}>
                            {'★'.repeat(rev.rating)}
                            {'☆'.repeat(5 - rev.rating)}
                          </div>
                          <p style={{ margin: 0, fontSize: '14px', color: 'var(--lc-text)', lineHeight: '1.5' }}>
                            {rev.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Review Form */}
                  <form onSubmit={handleReviewSubmit} style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--lc-blue-dark)', margin: '0 0 16px 0' }}>
                      Viết đánh giá của bạn
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Tên của bạn *</label>
                        <input
                          type="text"
                          required
                          value={reviewForm.name}
                          onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13.5px', outline: 'none' }}
                          placeholder="Nhập tên"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Đánh giá sao *</label>
                        <select
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13.5px', outline: 'none', background: '#fff', cursor: 'pointer' }}
                        >
                          <option value="5">5 sao (Rất tốt)</option>
                          <option value="4">4 sao (Tốt)</option>
                          <option value="3">3 sao (Bình thường)</option>
                          <option value="2">2 sao (Kém)</option>
                          <option value="1">1 sao (Rất kém)</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Bình luận của bạn *</label>
                      <textarea
                        required
                        rows="4"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13.5px', outline: 'none', resize: 'vertical' }}
                        placeholder="Chia sẻ nhận xét của bạn về sản phẩm..."
                      />
                    </div>
                    <button
                      type="submit"
                      style={{ background: 'var(--lc-blue)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                    >
                      Gửi đánh giá
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--lc-blue-dark)', marginBottom: '16px' }}>
                Sản phẩm liên quan
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {related.map((prod) => (
                  <div key={prod.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--lc-border)', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                    <Link href={`/products/${prod.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ width: '100%', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                        <img
                          src={prod.thumbnail || '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png'}
                          alt={prod.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          onError={(e) => { e.target.src = 'https://picsum.photos/150/150?random=' + prod.id; }}
                        />
                      </div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--lc-text)', margin: 0, height: '36px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4' }}>
                        {prod.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '8px' }}>
                        <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--lc-blue-dark)' }}>
                          {prod.price.toLocaleString('vi-VN')}đ
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--lc-muted)' }}>
                          / {prod.unit || 'Hộp'}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
