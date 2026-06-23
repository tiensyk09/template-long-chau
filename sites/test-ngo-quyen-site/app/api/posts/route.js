import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

// GET /api/posts — list posts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.max(1, Math.min(500, parseInt(searchParams.get('limit') || '100')));
    const featured = searchParams.get('featured');

    let sql = 'SELECT * FROM posts WHERE 1=1';
    const params = [];

    if (category) { sql += ' AND category_id = ?'; params.push(category); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (featured === '1') { sql += ' AND featured = 1'; }
    if (search) { sql += ' AND (title LIKE ? OR summary LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    sql += ` ORDER BY created_at DESC LIMIT ${limit}`;

    const posts = await query(sql, params);
    return NextResponse.json({ posts });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/posts — create post
export async function POST(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const body = await request.json();
    const { title, summary, content, category_id, category_name, image, author, status, featured } = body;

    if (!title) return NextResponse.json({ error: 'Tiêu đề không được trống' }, { status: 400 });

    const slug = title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim().replace(/\s+/g, '-')
      + '-' + Date.now();

    const today = new Date().toISOString().split('T')[0];
    const dateDisplay = new Date().toLocaleDateString('vi-VN', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const result = await query(
      `INSERT INTO posts
        (slug, title, summary, content, category_id, category_name, image, author, status, featured, views, post_date, date_display, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,0,?,?,?)`,
      [slug, title, summary || '', content || '', category_id || null, category_name || '',
       image || '', author || user.displayName, status || 'draft',
       featured ? 1 : 0, today, dateDisplay, user.id]
    );

    const newPost = await query('SELECT * FROM posts WHERE id = ?', [result.insertId]);
    return NextResponse.json({ post: newPost[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
