import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function PUT(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    const { name, slug } = await request.json();
    if (!name || !slug) {
      return NextResponse.json({ error: 'Thiếu tên hoặc slug danh mục' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    const oldCats = await query('SELECT slug FROM file_categories WHERE id = ?', [id]);
    if (oldCats.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy danh mục' }, { status: 404 });
    }
    const oldSlug = oldCats[0].slug;

    if (oldSlug === 'general' && cleanSlug !== 'general') {
      return NextResponse.json({ error: 'Không được thay đổi slug của danh mục mặc định' }, { status: 400 });
    }

    const existing = await query('SELECT id FROM file_categories WHERE slug = ? AND id != ?', [cleanSlug, id]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Slug danh mục đã tồn tại' }, { status: 400 });
    }

    await query('UPDATE file_categories SET name = ?, slug = ? WHERE id = ?', [name, cleanSlug, id]);

    // Update references in files
    if (oldSlug !== cleanSlug) {
      await query('UPDATE files SET folder = ? WHERE folder = ?', [cleanSlug, oldSlug]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    const cats = await query('SELECT slug FROM file_categories WHERE id = ?', [id]);
    if (cats.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy danh mục' }, { status: 404 });
    }
    const slug = cats[0].slug;

    if (slug === 'general') {
      return NextResponse.json({ error: 'Không được xóa danh mục mặc định' }, { status: 400 });
    }

    await query('DELETE FROM file_categories WHERE id = ?', [id]);

    // Reset files in deleted category to general
    await query('UPDATE files SET folder = "general" WHERE folder = ?', [slug]);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
