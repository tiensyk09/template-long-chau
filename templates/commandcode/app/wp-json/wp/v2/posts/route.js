import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateApiKey, getAuthUser } from '@/lib/auth';

// Helper to format database post to WordPress REST API compatible JSON
function formatWpPost(post, host) {
  const scheme = host.includes('localhost') ? 'http' : 'https';
  const postUrl = `${scheme}://${host}/posts/${post.slug}`;
  return {
    id: post.id,
    date: post.created_at ? new Date(post.created_at).toISOString() : new Date().toISOString(),
    date_gmt: post.created_at ? new Date(post.created_at).toISOString() : new Date().toISOString(),
    guid: { rendered: postUrl },
    modified: post.updated_at ? new Date(post.updated_at).toISOString() : new Date().toISOString(),
    modified_gmt: post.updated_at ? new Date(post.updated_at).toISOString() : new Date().toISOString(),
    slug: post.slug,
    status: post.status === 'published' ? 'publish' : 'draft',
    type: 'post',
    link: postUrl,
    title: { rendered: post.title },
    content: { rendered: post.content || '', protected: false },
    excerpt: { rendered: post.summary || '', protected: false },
    author: post.author_id || 1,
    featured_media: post.featured_media_id || 0,
    comment_status: 'closed',
    ping_status: 'closed',
    sticky: false,
    template: '',
    format: 'standard',
    meta: {
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      meta_keywords: post.meta_keywords || ''
    },
    categories: [],
    tags: []
  };
}

// GET /wp-json/wp/v2/posts — Retrieve posts
export async function GET(request) {
  try {
    const host = request.headers.get('host') || 'localhost:3000';
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('per_page') || '10')));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const offset = (page - 1) * limit;

    let sql = 'SELECT *, (SELECT id FROM files WHERE url = image LIMIT 1) as featured_media_id FROM posts WHERE 1=1';
    const params = [];

    // Default to published if not authorized
    const user = await authenticateApiKey(request) || await getAuthUser();
    if (!user) {
      sql += " AND status = 'published'";
    } else if (status) {
      const dbStatus = status === 'publish' ? 'published' : status;
      sql += ' AND status = ?';
      params.push(dbStatus);
    }

    if (search) {
      sql += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const posts = await query(sql, params);
    const formatted = posts.map(p => formatWpPost(p, host));

    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json(
      { code: 'rest_error', message: err.message, data: { status: 500 } },
      { status: 500 }
    );
  }
}

// POST /wp-json/wp/v2/posts — Create post (Auth Required)
export async function POST(request) {
  // Try API key basic auth first, then fallback to session cookies
  const user = await authenticateApiKey(request) || await getAuthUser();
  if (!user || (user.role !== 'admin' && user.role !== 'mod')) {
    return NextResponse.json(
      { code: 'rest_cannot_create', message: 'Sorry, you are not allowed to create posts as this user.', data: { status: 401 } },
      { status: 401 }
    );
  }

  try {
    const host = request.headers.get('host') || 'localhost:3000';
    
    // Parse body safely supporting both JSON and Form Data
    let body = {};
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      for (const [k, v] of formData.entries()) {
        body[k] = v;
      }
    }

    // Standardize input fields (support both raw string and nested object format)
    let titleText = '';
    if (typeof body.title === 'object' && body.title !== null) {
      titleText = body.title.rendered || '';
    } else {
      titleText = body.title || '';
    }

    let contentText = '';
    if (typeof body.content === 'object' && body.content !== null) {
      contentText = body.content.rendered || '';
    } else {
      contentText = body.content || '';
    }

    let excerptText = '';
    if (typeof body.excerpt === 'object' && body.excerpt !== null) {
      excerptText = body.excerpt.rendered || '';
    } else {
      excerptText = body.excerpt || body.summary || '';
    }

    if (!titleText) {
      return NextResponse.json(
        { code: 'rest_missing_callback_param', message: 'Missing parameter(s): title', data: { status: 400 } },
        { status: 400 }
      );
    }

    let slug = body.slug;
    if (!slug) {
      slug = titleText.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim().replace(/\s+/g, '-')
        + '-' + Date.now();
    }

    // WordPress status 'publish' corresponds to our 'published' status
    const dbStatus = body.status === 'publish' ? 'published' : (body.status || 'draft');

    // Extract meta fields
    const metaTitle = body.meta_title || '';
    const metaDesc = body.meta_description || '';
    const metaKeys = body.meta_keywords || '';

    // Handle featured media mapping
    let imageUrl = body.image || '';
    if (body.featured_media) {
      const mediaRows = await query('SELECT url FROM files WHERE id = ?', [parseInt(body.featured_media)]);
      if (mediaRows.length > 0) {
        imageUrl = mediaRows[0].url;
      }
    }

    const result = await query(
      `INSERT INTO posts (slug, title, summary, content, status, author_id, author_name, image, meta_title, meta_description, meta_keywords)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [slug, titleText, excerptText, contentText, dbStatus, user.id, user.displayName || user.username, imageUrl, metaTitle, metaDesc, metaKeys]
    );

    const newPosts = await query(
      `SELECT *, (SELECT id FROM files WHERE url = image LIMIT 1) as featured_media_id 
       FROM posts WHERE id = ?`, 
      [result.insertId]
    );
    if (newPosts.length === 0) {
      throw new Error('Failed to retrieve newly created post');
    }

    return NextResponse.json(formatWpPost(newPosts[0], host), { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { code: 'rest_error', message: err.message, data: { status: 500 } },
      { status: 500 }
    );
  }
}
