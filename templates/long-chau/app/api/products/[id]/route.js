import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/products/[id]  (by id or slug)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const isNumeric = /^\d+$/.test(id);

    const products = await query(
      `SELECT p.*, sc.name as category_name, sc.slug as category_slug
       FROM products p 
       LEFT JOIN shop_categories sc ON p.category_id = sc.id
       WHERE ${isNumeric ? 'p.id = ?' : 'p.slug = ?'}`,
      [id]
    );

    if (!products.length) {
      return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
    }

    const product = products[0];
    
    // Increment view count
    await query('UPDATE products SET view_count = view_count + 1 WHERE id = ?', [product.id]).catch(() => {});

    // Get variants
    const variants = await query(
      'SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order ASC, price ASC',
      [product.id]
    );

    // Get reviews
    const reviews = await query(
      'SELECT * FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC LIMIT 10',
      [product.id]
    );

    // Parse JSON fields
    if (product.images && typeof product.images === 'string') {
      try { product.images = JSON.parse(product.images); } catch { product.images = []; }
    }
    if (product.tags && typeof product.tags === 'string') {
      try { product.tags = JSON.parse(product.tags); } catch { product.tags = []; }
    }

    return NextResponse.json({ product: { ...product, variants, reviews } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/products/[id]  (admin)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      category_id, name, short_description, description,
      price, original_price, thumbnail, images, brand, origin,
      unit, stock, is_featured, is_flash_sale, flash_sale_price,
      flash_sale_end, tags, meta_title, meta_description, status
    } = body;

    await query(
      `UPDATE products SET 
        category_id = ?, name = ?, short_description = ?, description = ?,
        price = ?, original_price = ?, thumbnail = ?, images = ?,
        brand = ?, origin = ?, unit = ?, stock = ?,
        is_featured = ?, is_flash_sale = ?, flash_sale_price = ?, flash_sale_end = ?,
        tags = ?, meta_title = ?, meta_description = ?, status = ?,
        updated_at = datetime('now')
       WHERE id = ?`,
      [
        category_id || null, name, short_description || null, description || null,
        price, original_price || null, thumbnail || null,
        images ? JSON.stringify(images) : null,
        brand || null, origin || null, unit || 'Hộp',
        stock || 0, is_featured ? 1 : 0, is_flash_sale ? 1 : 0,
        flash_sale_price || null, flash_sale_end || null,
        tags ? JSON.stringify(tags) : null,
        meta_title || null, meta_description || null,
        status || 'active',
        id
      ]
    );

    const product = await query('SELECT * FROM products WHERE id = ?', [id]);
    return NextResponse.json({ success: true, product: product[0] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/products/[id]  (admin)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await query('DELETE FROM product_variants WHERE product_id = ?', [id]);
    await query('DELETE FROM products WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
