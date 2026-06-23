import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

// GET /api/posts — Retrieve published/all posts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.max(1, Math.min(500, parseInt(searchParams.get('limit') || '10')));

    let sql = 'SELECT id, slug, title, summary, content, image, status, views, author_name, created_at, meta_title, meta_description, meta_keywords FROM posts WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR summary LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY created_at DESC LIMIT ${limit}`;

    const posts = await query(sql, params);
    return NextResponse.json({ posts });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/posts — Create new post
export async function POST(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod'); // Mod or Admin
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const body = await request.json();
    const { title, summary, content, image, status, meta_title, meta_description, meta_keywords } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const slug = title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim().replace(/\s+/g, '-')
      + '-' + Date.now();

    const result = await query(
      `INSERT INTO posts (slug, title, summary, content, image, status, author_id, author_name, meta_title, meta_description, meta_keywords)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [slug, title, summary || '', content || '', image || '', status || 'draft', user.id, user.displayName, meta_title || '', meta_description || '', meta_keywords || '']
    );

    const newPost = await query('SELECT * FROM posts WHERE id = ?', [result.insertId]);
    return NextResponse.json({ post: newPost[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
