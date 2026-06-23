import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

// GET /api/posts/[id] — Fetch single post
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Check if ID is numeric or a slug string
    const isId = /^\d+$/.test(id);
    const sql = isId 
      ? 'SELECT * FROM posts WHERE id = ?' 
      : 'SELECT * FROM posts WHERE slug = ?';
    
    const posts = await query(sql, [id]);
    if (posts.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = posts[0];
    
    // Increment views
    try {
      await query('UPDATE posts SET views = views + 1 WHERE id = ?', [post.id]);
    } catch (err) {
      console.error('Failed to update views count:', err);
    }

    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/posts/[id] — Update post
export async function PUT(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, summary, content, image, status, meta_title, meta_description, meta_keywords } = body;

    const posts = await query('SELECT id FROM posts WHERE id = ?', [id]);
    if (posts.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await query(
      `UPDATE posts 
       SET title = ?, summary = ?, content = ?, image = ?, status = ?, meta_title = ?, meta_description = ?, meta_keywords = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [title, summary || '', content || '', image || '', status || 'draft', meta_title || '', meta_description || '', meta_keywords || '', id]
    );

    const updatedPost = await query('SELECT * FROM posts WHERE id = ?', [id]);
    return NextResponse.json({ post: updatedPost[0] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/posts/[id] — Delete post
export async function DELETE(request, { params }) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod'); // Mod or admin
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { id } = await params;
    const posts = await query('SELECT id FROM posts WHERE id = ?', [id]);
    if (posts.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await query('DELETE FROM posts WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
