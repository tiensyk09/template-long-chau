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

// GET /wp-json/wp/v2/posts/[id] — Retrieve single post details
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const host = request.headers.get('host') || 'localhost:3000';
    const posts = await query('SELECT *, (SELECT id FROM files WHERE url = image LIMIT 1) as featured_media_id FROM posts WHERE id = ?', [id]);
    
    if (posts.length === 0) {
      return NextResponse.json(
        { code: 'rest_post_invalid_id', message: 'Invalid post ID.', data: { status: 404 } },
        { status: 404 }
      );
    }
    
    const post = posts[0];
    
    // Check access
    if (post.status !== 'published') {
      const user = await authenticateApiKey(request) || await getAuthUser();
      if (!user) {
        return NextResponse.json(
          { code: 'rest_cannot_read', message: 'Sorry, you are not allowed to view this post.', data: { status: 401 } },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(formatWpPost(post, host));
  } catch (err) {
    return NextResponse.json(
      { code: 'rest_error', message: err.message, data: { status: 500 } },
      { status: 500 }
    );
  }
}

// POST/PUT/PATCH /wp-json/wp/v2/posts/[id] — Edit post (Auth Required)
export async function POST(request, { params }) {
  const { id } = await params;
  const user = await authenticateApiKey(request) || await getAuthUser();
  if (!user || (user.role !== 'admin' && user.role !== 'mod')) {
    return NextResponse.json(
      { code: 'rest_cannot_edit', message: 'Sorry, you are not allowed to edit this post.', data: { status: 401 } },
      { status: 401 }
    );
  }

  try {
    const host = request.headers.get('host') || 'localhost:3000';
    
    // Fetch post first
    const posts = await query('SELECT * FROM posts WHERE id = ?', [id]);
    if (posts.length === 0) {
      return NextResponse.json(
        { code: 'rest_post_invalid_id', message: 'Invalid post ID.', data: { status: 404 } },
        { status: 404 }
      );
    }
    const currentPost = posts[0];

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
    let titleText = undefined;
    if (body.title !== undefined) {
      titleText = typeof body.title === 'object' && body.title !== null ? (body.title.rendered || '') : body.title;
    }

    let contentText = undefined;
    if (body.content !== undefined) {
      contentText = typeof body.content === 'object' && body.content !== null ? (body.content.rendered || '') : body.content;
    }

    let excerptText = undefined;
    if (body.excerpt !== undefined || body.summary !== undefined) {
      const val = body.excerpt || body.summary;
      excerptText = typeof val === 'object' && val !== null ? (val.rendered || '') : val;
    }

    // Build dynamic UPDATE query
    const fields = [];
    const dbParams = [];

    if (titleText !== undefined) {
      fields.push('title = ?');
      dbParams.push(titleText);
    }
    if (contentText !== undefined) {
      fields.push('content = ?');
      dbParams.push(contentText);
    }
    if (excerptText !== undefined) {
      fields.push('summary = ?');
      dbParams.push(excerptText);
    }
    if (body.status !== undefined) {
      const dbStatus = body.status === 'publish' ? 'published' : body.status;
      fields.push('status = ?');
      dbParams.push(dbStatus);
    }
    if (body.slug !== undefined) {
      fields.push('slug = ?');
      dbParams.push(body.slug);
    }
    if (body.meta_title !== undefined) {
      fields.push('meta_title = ?');
      dbParams.push(body.meta_title);
    }
    if (body.meta_description !== undefined) {
      fields.push('meta_description = ?');
      dbParams.push(body.meta_description);
    }
    if (body.meta_keywords !== undefined) {
      fields.push('meta_keywords = ?');
      dbParams.push(body.meta_keywords);
    }

    // Handle featured media mapping if provided
    if (body.featured_media !== undefined) {
      let imageUrl = '';
      if (parseInt(body.featured_media) > 0) {
        const mediaRows = await query('SELECT url FROM files WHERE id = ?', [parseInt(body.featured_media)]);
        if (mediaRows.length > 0) {
          imageUrl = mediaRows[0].url;
        }
      }
      fields.push('image = ?');
      dbParams.push(imageUrl);
    } else if (body.image !== undefined) {
      fields.push('image = ?');
      dbParams.push(body.image);
    }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      const sql = `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`;
      dbParams.push(id);
      await query(sql, dbParams);
    }

    const updatedPosts = await query('SELECT *, (SELECT id FROM files WHERE url = image LIMIT 1) as featured_media_id FROM posts WHERE id = ?', [id]);
    return NextResponse.json(formatWpPost(updatedPosts[0], host));
  } catch (err) {
    return NextResponse.json(
      { code: 'rest_error', message: err.message, data: { status: 500 } },
      { status: 500 }
    );
  }
}

// Support PUT as an alias to POST for edit
export async function PUT(request, context) {
  return POST(request, context);
}

// Support PATCH as an alias to POST for edit
export async function PATCH(request, context) {
  return POST(request, context);
}

// DELETE /wp-json/wp/v2/posts/[id] — Delete post (Auth Required)
export async function DELETE(request, { params }) {
  const { id } = await params;
  const user = await authenticateApiKey(request) || await getAuthUser();
  if (!user || (user.role !== 'admin' && user.role !== 'mod')) {
    return NextResponse.json(
      { code: 'rest_cannot_delete', message: 'Sorry, you are not allowed to delete this post.', data: { status: 401 } },
      { status: 401 }
    );
  }

  try {
    const host = request.headers.get('host') || 'localhost:3000';
    
    // Fetch post first to return it
    const posts = await query('SELECT * FROM posts WHERE id = ?', [id]);
    if (posts.length === 0) {
      return NextResponse.json(
        { code: 'rest_post_invalid_id', message: 'Invalid post ID.', data: { status: 404 } },
        { status: 404 }
      );
    }
    const postToDelete = posts[0];

    // Execute delete query
    await query('DELETE FROM posts WHERE id = ?', [id]);
    
    // Format deleted post as 'trash' status
    const wpFormat = formatWpPost(postToDelete, host);
    wpFormat.status = 'trash';
    
    return NextResponse.json({
      deleted: true,
      previous: wpFormat
    });
  } catch (err) {
    return NextResponse.json(
      { code: 'rest_error', message: err.message, data: { status: 500 } },
      { status: 500 }
    );
  }
}
