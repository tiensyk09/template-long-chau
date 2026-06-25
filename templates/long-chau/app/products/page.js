import { query } from '@/lib/db';
import ProductsPageClient from '@/components/ProductsPageClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const categorySlug = params.category || '';
  const searchQ = params.q || '';
  
  let title = 'Tất cả sản phẩm | FPT Long Châu';
  if (categorySlug) {
    const cats = await query('SELECT name FROM shop_categories WHERE slug = ?', [categorySlug]);
    if (cats.length > 0) {
      title = `${cats[0].name} | FPT Long Châu`;
    }
  } else if (searchQ) {
    title = `Tìm kiếm: "${searchQ}" | FPT Long Châu`;
  }
  
  return {
    title,
    description: 'Mua thực phẩm chức năng, thuốc kê đơn, dược mỹ phẩm chính hãng tại FPT Long Châu.'
  };
}

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const categorySlug = params.category || '';
  const searchQ = params.q || '';
  const sort = params.sort || 'newest';
  const page = parseInt(params.page || '1');
  const limit = 16;
  const offset = (page - 1) * limit;

  // Fetch all active categories
  const categories = await query('SELECT * FROM shop_categories WHERE is_active = 1 ORDER BY sort_order ASC');

  // Build conditions
  let conditions = ["p.status = 'active'"];
  let queryParams = [];

  if (categorySlug) {
    conditions.push('sc.slug = ?');
    queryParams.push(categorySlug);
  }

  if (searchQ) {
    conditions.push('(p.name LIKE ? OR p.brand LIKE ? OR p.short_description LIKE ?)');
    queryParams.push(`%${searchQ}%`, `%${searchQ}%`, `%${searchQ}%`);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const sortMap = {
    newest: 'p.created_at DESC',
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC',
    popular: 'p.sold_count DESC',
  };
  const orderBy = `ORDER BY ${sortMap[sort] || 'p.created_at DESC'}`;

  // Count total matching products
  const countSql = `
    SELECT COUNT(*) as total 
    FROM products p 
    LEFT JOIN shop_categories sc ON p.category_id = sc.id 
    ${where}
  `;
  const countResult = await query(countSql, queryParams);
  const total = countResult[0]?.total || 0;

  // Fetch products
  const productsSql = `
    SELECT p.*, sc.name as category_name, sc.slug as category_slug
    FROM products p 
    LEFT JOIN shop_categories sc ON p.category_id = sc.id 
    ${where}
    ${orderBy}
    LIMIT ? OFFSET ?
  `;
  const products = await query(productsSql, [...queryParams, limit, offset]);

  // Get current active category if filtered
  const activeCategory = categories.find(c => c.slug === categorySlug) || null;

  return (
    <ProductsPageClient
      categories={categories}
      products={products}
      activeCategory={activeCategory}
      searchQ={searchQ}
      sort={sort}
      pagination={{
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }}
    />
  );
}
