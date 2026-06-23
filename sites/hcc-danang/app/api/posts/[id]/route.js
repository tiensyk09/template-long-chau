import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

// GET /api/posts/[id]
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const posts = await query('SELECT * FROM posts WHERE id = ? OR slug = ?', [id, id]);
    if (!posts.length) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
    // Increment views
    await query('UPDATE posts SET views = views + 1 WHERE id = ?', [posts[0].id]);
    return NextResponse.json({ post: posts[0] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/posts/[id]
export async function PUT(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, summary, content, category_id, category_name, tags, image, author, status, featured, seo_title, seo_description } = body;

    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await query(
      `UPDATE posts SET
        title=?, summary=?, content=?, category_id=?, category_name=?, tags=?,
        image=?, author=?, status=?, featured=?, updated_at=?, seo_title=?, seo_description=?
       WHERE id=?`,
      [title, summary || '', content || '', category_id || null, category_name || '', tags || '',
       image || '', author || '', status || 'draft', featured ? 1 : 0, nowStr, seo_title || null, seo_description || null, id]
    );

    const updated = await query('SELECT * FROM posts WHERE id = ?', [id]);
    return NextResponse.json({ post: updated[0] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/posts/[id]
export async function DELETE(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'admin');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    await query('DELETE FROM posts WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
