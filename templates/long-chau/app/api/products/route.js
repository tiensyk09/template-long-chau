import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/products?category=&search=&sort=&featured=&flash_sale=&page=&limit=
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search') || searchParams.get('q');
    const sort = searchParams.get('sort') || 'newest';
    const featured = searchParams.get('featured');
    const flashSale = searchParams.get('flash_sale');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let conditions = ["p.status = 'active'"];
    let params = [];

    if (category) {
      conditions.push('(sc.slug = ? OR sc.id = ?)');
      params.push(category, category);
    }
    if (search) {
      conditions.push('(p.name LIKE ? OR p.brand LIKE ? OR p.short_description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (featured === 'true') {
      conditions.push('p.is_featured = 1');
    }
    if (flashSale === 'true') {
      conditions.push('p.is_flash_sale = 1');
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const sortMap = {
      newest: 'p.created_at DESC',
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      popular: 'p.sold_count DESC',
      rating: 'p.rating DESC',
    };
    const orderBy = `ORDER BY ${sortMap[sort] || 'p.created_at DESC'}`;

    const countSql = `
      SELECT COUNT(*) as total 
      FROM products p 
      LEFT JOIN shop_categories sc ON p.category_id = sc.id 
      ${where}
    `;
    const totalResult = await query(countSql, params);
    const total = totalResult[0]?.total || 0;

    const productsSql = `
      SELECT p.*, sc.name as category_name, sc.slug as category_slug
      FROM products p 
      LEFT JOIN shop_categories sc ON p.category_id = sc.id 
      ${where}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;
    const products = await query(productsSql, [...params, limit, offset]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/products  (admin)
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      category_id, name, slug, short_description, description,
      price, original_price, thumbnail, images, brand, origin,
      unit, stock, is_featured, is_flash_sale, flash_sale_price,
      flash_sale_end, tags, meta_title, meta_description, status
    } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Thiếu tên hoặc giá sản phẩm' }, { status: 400 });
    }

    // Auto-generate slug from name if not provided
    const finalSlug = slug || name.toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100) + '-' + Date.now().toString().slice(-6);

    await query(
      `INSERT INTO products (category_id, name, slug, short_description, description, price, original_price, thumbnail, images, brand, origin, unit, stock, is_featured, is_flash_sale, flash_sale_price, flash_sale_end, tags, meta_title, meta_description, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id || null, name, finalSlug,
        short_description || null, description || null,
        price, original_price || null, thumbnail || null,
        images ? JSON.stringify(images) : null,
        brand || null, origin || null, unit || 'Hộp',
        stock || 0, is_featured ? 1 : 0, is_flash_sale ? 1 : 0,
        flash_sale_price || null, flash_sale_end || null,
        tags ? JSON.stringify(tags) : null,
        meta_title || null, meta_description || null,
        status || 'active'
      ]
    );

    const product = await query('SELECT * FROM products WHERE slug = ?', [finalSlug]);
    return NextResponse.json({ success: true, product: product[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
