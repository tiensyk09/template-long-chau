import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const cats = await query('SELECT * FROM categories ORDER BY sort_order ASC');
    // Đếm posts theo category
    for (const cat of cats) {
      const cnt = await query('SELECT COUNT(*) as cnt FROM posts WHERE category_id=?', [cat.id]);
      cat.post_count = cnt[0].cnt;
    }
    return NextResponse.json({ categories: cats });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'admin');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: 'Tên danh mục không được trống' }, { status: 400 });

    const slug = name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim().replace(/\s+/g, '-');

    const id = slug + '-' + Date.now();
    const maxOrder = await query('SELECT COALESCE(MAX(sort_order),0)+1 as next_o FROM categories');

    await query(
      'INSERT INTO categories (id, name, slug, sort_order, active) VALUES (?,?,?,?,1)',
      [id, name, slug, maxOrder[0].next_o]
    );

    const newCat = await query('SELECT * FROM categories WHERE id=?', [id]);
    return NextResponse.json({ category: newCat[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
