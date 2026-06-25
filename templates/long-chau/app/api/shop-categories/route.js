import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/shop-categories
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentOnly = searchParams.get('parent_only') === 'true';

    let sql = 'SELECT * FROM shop_categories WHERE is_active = 1';
    if (parentOnly) sql += ' AND parent_id IS NULL';
    sql += ' ORDER BY sort_order ASC, name ASC';

    const cats = await query(sql);
    return NextResponse.json({ categories: cats });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/shop-categories  (admin)
export async function POST(request) {
  try {
    const { name, slug, parent_id, icon, image, description, sort_order } = await request.json();
    if (!name || !slug) return NextResponse.json({ error: 'Thiếu tên hoặc slug' }, { status: 400 });

    await query(
      'INSERT INTO shop_categories (name, slug, parent_id, icon, image, description, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, slug, parent_id || null, icon || null, image || null, description || null, sort_order || 0]
    );
    const cat = await query('SELECT * FROM shop_categories WHERE slug = ?', [slug]);
    return NextResponse.json({ success: true, category: cat[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
