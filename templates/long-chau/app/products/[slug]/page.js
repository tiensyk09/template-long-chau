import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const products = await query('SELECT * FROM products WHERE slug = ? AND status = ?', [slug, 'active']);
  const product = products[0];
  if (!product) return { title: 'Sản phẩm không tìm thấy' };

  return {
    title: product.meta_title || `${product.name} - Giá tốt, chính hãng | FPT Long Châu`,
    description: product.meta_description || product.short_description || product.description?.substring(0, 150) || ''
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;

  const products = await query(
    `SELECT p.*, sc.name as category_name, sc.slug as category_slug
     FROM products p 
     LEFT JOIN shop_categories sc ON p.category_id = sc.id
     WHERE p.slug = ? AND p.status = 'active'`,
    [slug]
  );

  const product = products[0];
  if (!product) {
    notFound();
  }

  // Fetch variants
  const variants = await query(
    'SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order ASC, price ASC',
    [product.id]
  );

  // Fetch reviews
  const reviews = await query(
    'SELECT * FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC LIMIT 10',
    [product.id]
  );

  // Fetch related products in the same category
  const related = await query(
    `SELECT p.*, sc.name as category_name, sc.slug as category_slug
     FROM products p 
     LEFT JOIN shop_categories sc ON p.category_id = sc.id
     WHERE p.category_id = ? AND p.id != ? AND p.status = 'active'
     LIMIT 4`,
    [product.category_id, product.id]
  );

  return (
    <ProductDetailClient
      product={product}
      variants={variants}
      reviews={reviews}
      related={related}
    />
  );
}
