import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

// PUT /api/file-categories/[id] — Cập nhật danh mục file
export async function PUT(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    const { name, slug } = await request.json();
    if (!name || !slug) {
      return NextResponse.json({ error: 'Thiếu thông tin danh mục' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    // Lấy slug cũ
    const oldCats = await query('SELECT slug FROM file_categories WHERE id = ?', [id]);
    if (oldCats.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy danh mục' }, { status: 404 });
    }
    const oldSlug = oldCats[0].slug;

    if (oldSlug === 'general' && cleanSlug !== 'general') {
      return NextResponse.json({ error: 'Không thể thay đổi slug của danh mục mặc định' }, { status: 400 });
    }

    // Kiểm tra trùng slug nếu thay đổi slug
    if (cleanSlug !== oldSlug) {
      const existing = await query('SELECT id FROM file_categories WHERE slug = ? AND id != ?', [cleanSlug, id]);
      if (existing.length > 0) {
        return NextResponse.json({ error: 'Slug danh mục đã tồn tại' }, { status: 400 });
      }
    }

    await query('UPDATE file_categories SET name = ?, slug = ? WHERE id = ?', [name, cleanSlug, id]);

    // Cập nhật tất cả các file cũ có folder trùng với slug cũ sang slug mới
    if (cleanSlug !== oldSlug) {
      await query('UPDATE files SET folder = ? WHERE folder = ?', [cleanSlug, oldSlug]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/file-categories/[id] — Xóa danh mục file
export async function DELETE(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;

    // Lấy slug của danh mục sắp xóa
    const cats = await query('SELECT slug FROM file_categories WHERE id = ?', [id]);
    if (cats.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy danh mục' }, { status: 404 });
    }
    const slug = cats[0].slug;

    if (slug === 'general') {
      return NextResponse.json({ error: 'Không thể xóa danh mục mặc định' }, { status: 400 });
    }

    // Tiến hành xóa danh mục
    await query('DELETE FROM file_categories WHERE id = ?', [id]);

    // Chuyển tất cả file thuộc danh mục này về 'general' (Chưa phân loại)
    await query('UPDATE files SET folder = ? WHERE folder = ?', ['general', slug]);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
