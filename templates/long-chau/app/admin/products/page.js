'use client';
import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import '@/app/admin/admin.css';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  
  // Search and filter state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    short_description: '',
    description: '',
    price: 0,
    original_price: '',
    thumbnail: '',
    brand: '',
    origin: '',
    unit: 'Hộp',
    stock: 0,
    is_featured: false,
    is_flash_sale: false,
    flash_sale_price: '',
    status: 'active'
  });

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [categoryFilter]);

  async function loadCategories() {
    try {
      const res = await fetch('/api/shop-categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }

  async function loadProducts() {
    setLoading(true);
    try {
      const url = `/api/products?limit=50&category=${categoryFilter}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      } else {
        setMsg({ type: 'error', text: 'Không thể tải danh sách sản phẩm' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      category_id: categories[0]?.id || '',
      short_description: '',
      description: '',
      price: 0,
      original_price: '',
      thumbnail: '',
      brand: '',
      origin: '',
      unit: 'Hộp',
      stock: 50,
      is_featured: false,
      is_flash_sale: false,
      flash_sale_price: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setForm({
      name: prod.name,
      category_id: prod.category_id || '',
      short_description: prod.short_description || '',
      description: prod.description || '',
      price: prod.price,
      original_price: prod.original_price || '',
      thumbnail: prod.thumbnail || '',
      brand: prod.brand || '',
      origin: prod.origin || '',
      unit: prod.unit || 'Hộp',
      stock: prod.stock || 0,
      is_featured: !!prod.is_featured,
      is_flash_sale: !!prod.is_flash_sale,
      flash_sale_price: prod.flash_sale_price || '',
      status: prod.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const isEdit = !!editingProduct;
    const url = isEdit ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          original_price: form.original_price ? parseFloat(form.original_price) : null,
          flash_sale_price: form.flash_sale_price ? parseFloat(form.flash_sale_price) : null,
          stock: parseInt(form.stock)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: isEdit ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công' });
        setIsModalOpen(false);
        loadProducts();
      } else {
        setMsg({ type: 'error', text: data.error || 'Thao tác thất bại' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Xóa sản phẩm thành công' });
        loadProducts();
      } else {
        setMsg({ type: 'error', text: 'Xóa sản phẩm thất bại' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <AdminShell title="Quản lý Sản phẩm">
      {msg && (
        <div className={`adm-alert adm-alert-${msg.type === 'success' ? 'success' : 'error'}`}>
          {msg.text}
        </div>
      )}

      {/* Toolbar controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flex: 1, maxWidth: '500px' }}>
          <input
            type="text"
            className="adm-filter-select"
            placeholder="Tìm theo tên sản phẩm, thương hiệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '6px' }}
          />
          <select
            className="adm-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '8px 12px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '6px' }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-secondary">Tìm</button>
        </form>

        <button onClick={openAddModal} className="btn btn-primary">
          ➕ Thêm sản phẩm mới
        </button>
      </div>

      {/* Main product table */}
      <div className="adm-card">
        <div className="adm-table-wrap">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-muted)' }}>Đang tải danh sách...</div>
          ) : products.length === 0 ? (
            <div className="adm-empty">
              <div className="adm-empty-icon">🛍️</div>
              <div className="adm-empty-text">Không tìm thấy sản phẩm nào</div>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Thương hiệu</th>
                  <th>Giá bán</th>
                  <th>Tồn kho</th>
                  <th>Nổi bật</th>
                  <th>Flash Sale</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <img
                        src={prod.thumbnail || '/images/Vien_ho_tro_phat_trien_nao_bo_suc_khoe_cho_mat_Brauer_Baby_and_Kids_Ultra_Pure_DHA_00033687_79d080f5b6.png'}
                        alt={prod.name}
                        style={{ width: '40px', height: '40px', objectFit: 'contain', border: '1px solid #3f3f46', borderRadius: '4px', background: '#fff' }}
                        onError={(e) => { e.target.src = 'https://picsum.photos/40/40'; }}
                      />
                    </td>
                    <td style={{ fontWeight: '600', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={prod.name}>
                      {prod.name}
                    </td>
                    <td>{prod.brand || '—'}</td>
                    <td style={{ color: 'var(--admin-primary)', fontWeight: 700 }}>
                      {prod.price.toLocaleString('vi-VN')}đ / {prod.unit || 'Hộp'}
                    </td>
                    <td>{prod.stock}</td>
                    <td>
                      <span className={`badge ${prod.is_featured ? 'badge-green' : 'badge-yellow'}`}>
                        {prod.is_featured ? 'Có' : 'Không'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${prod.is_flash_sale ? 'badge-green' : 'badge-yellow'}`}>
                        {prod.is_flash_sale ? `Có (${prod.flash_sale_price?.toLocaleString('vi-VN')}đ)` : 'Không'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${prod.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                        {prod.status === 'active' ? 'Bán' : 'Ẩn'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEditModal(prod)} title="Sửa">✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(prod.id)} title="Xóa">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', borderBottom: '1px solid #27272a', paddingBottom: '12px', marginBottom: '20px' }}>
              {editingProduct ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm mới'}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Danh mục *</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Thương hiệu</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Xuất xứ</label>
                  <input
                    type="text"
                    value={form.origin}
                    onChange={(e) => setForm({ ...form, origin: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Đơn vị tính</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px' }}
                    placeholder="Hộp, Vỉ, Chai..."
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Tồn kho</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Giá bán *</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Giá gốc (so sánh)</label>
                  <input
                    type="number"
                    value={form.original_price}
                    onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Ảnh (URL)</label>
                  <input
                    type="text"
                    value={form.thumbnail}
                    onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px' }}
                    placeholder="/images/..."
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Mô tả ngắn</label>
                <input
                  type="text"
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a1a1aa', marginBottom: '6px' }}>Mô tả chi tiết (HTML)</label>
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  />
                  Sản phẩm nổi bật
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.is_flash_sale}
                    onChange={(e) => setForm({ ...form, is_flash_sale: e.target.checked })}
                  />
                  Flash sale hoạt động
                </label>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '4px' }}>Giá Flash sale</label>
                  <input
                    type="number"
                    disabled={!form.is_flash_sale}
                    value={form.flash_sale_price}
                    onChange={(e) => setForm({ ...form, flash_sale_price: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '4px' }}>Trạng thái</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: '#27272a', border: '1px solid #3f3f46', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <option value="active">Bán công khai (Active)</option>
                    <option value="draft">Ẩn lưu trữ (Draft)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #27272a', paddingTop: '16px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu sản phẩm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
