import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await query('SELECT * FROM file_categories ORDER BY name ASC');
    return NextResponse.json({ categories });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { name, slug } = await request.json();
    if (!name || !slug) {
      return NextResponse.json({ error: 'Thiếu tên hoặc slug danh mục' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    const existing = await query('SELECT id FROM file_categories WHERE slug = ?', [cleanSlug]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Slug danh mục đã tồn tại' }, { status: 400 });
    }

    const result = await query(
      'INSERT INTO file_categories (name, slug) VALUES (?, ?)',
      [name, cleanSlug]
    );

    const newCat = await query('SELECT * FROM file_categories WHERE id = ?', [result.insertId]);
    return NextResponse.json({ category: newCat[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
