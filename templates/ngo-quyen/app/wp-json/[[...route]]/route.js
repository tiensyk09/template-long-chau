import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Helper to add CORS headers
function sendResponse(data, status = 200, headers = {}) {
  const res = NextResponse.json(data, { status });
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Disposition, X-WP-Nonce');
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  for (const [key, val] of Object.entries(headers)) {
    res.headers.set(key, val);
  }
  return res;
}

// Stable hashing function to map string category ID to a positive 32-bit integer
function getNumericId(str) {
  if (!str) return 0;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash) % 1000000;
}

// Basic Authentication helper
async function authenticate(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return null;
  }
  if (!authHeader.startsWith('Basic ')) {
    return { error: 'Invalid authentication method', status: 401 };
  }
  try {
    const base64Credentials = authHeader.substring(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
    const [username, password] = credentials.split(':');
    if (!username || !password) {
      return { error: 'Invalid authentication header structure', status: 401 };
    }

    const users = await query('SELECT * FROM users WHERE username = ? AND active = 1', [username]);
    if (!users.length) {
      return { error: 'Invalid username or password', status: 401 };
    }

    const user = users[0];
    
    // 1. Try primary password verification
    let isPasswordValid = await verifyPassword(password, user.password);

    // 2. Fallback to api_keys / application passwords verification if primary password fails
    if (!isPasswordValid) {
      try {
        const apiKeys = await query('SELECT * FROM api_keys WHERE user_id = ? AND api_key = ?', [user.id, password]);
        if (apiKeys.length > 0) {
          isPasswordValid = true;
        } else {
          // Fallback to old user_application_passwords table if it exists
          const appPasses = await query('SELECT * FROM user_application_passwords WHERE user_id = ?', [user.id]);
          const cleanPassword = password.replace(/\s+/g, '');
          for (const appPass of appPasses) {
            if (await verifyPassword(cleanPassword, appPass.password_hash)) {
              isPasswordValid = true;
              const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
              await query('UPDATE user_application_passwords SET last_used_at = ? WHERE id = ?', [nowStr, appPass.id]);
              break;
            }
          }
        }
      } catch (dbErr) {
        console.warn('Failed to query fallback credentials:', dbErr.message);
      }
    }

    if (!isPasswordValid) {
      return { error: 'Invalid username or password', status: 401 };
    }

    // Must be mod or admin to use publishing API
    if (user.role !== 'admin' && user.role !== 'mod') {
      return { error: 'Forbidden', status: 403 };
    }

    return { user };
  } catch (err) {
    console.error('Basic Auth error:', err);
    return { error: 'Authentication processing failed', status: 401 };
  }
}

// Map database post to WordPress REST API post schema
function mapPostToWordPress(post, baseUrl) {
  let publishedDate = post.created_at || new Date().toISOString();
  if (publishedDate instanceof Date) {
    publishedDate = publishedDate.toISOString();
  } else {
    publishedDate = String(publishedDate);
  }

  let updatedDate = post.updated_at || publishedDate;
  if (updatedDate instanceof Date) {
    updatedDate = updatedDate.toISOString();
  } else {
    updatedDate = String(updatedDate);
  }

  const wpStatus = post.status === 'published' ? 'publish' : post.status;
  const imageMediaId = post.image ? getNumericId(post.image) : 0;

  return {
    id: post.id,
    date: publishedDate.replace(' ', 'T'),
    date_gmt: publishedDate.replace(' ', 'T'),
    guid: { rendered: `${baseUrl}/posts/${post.slug}` },
    modified: updatedDate.replace(' ', 'T'),
    modified_gmt: updatedDate.replace(' ', 'T'),
    slug: post.slug,
    status: wpStatus,
    type: 'post',
    link: `${baseUrl}/posts/${post.slug}`,
    title: { rendered: post.title },
    content: { rendered: post.content },
    excerpt: { rendered: post.summary || '' },
    author: post.created_by || 1,
    featured_media: imageMediaId,
    categories: post.category_id ? [getNumericId(post.category_id)] : [],
    tags: [],
    format: 'standard',
    _embedded: post.image ? {
      'wp:featuredmedia': [
        {
          id: imageMediaId,
          source_url: post.image.startsWith('http') || post.image.startsWith('/') ? (post.image.startsWith('/') ? `${baseUrl}${post.image}` : post.image) : post.image
        }
      ]
    } : undefined
  };
}

// Find category by numeric hash
async function findCategoryByNumericId(numericId) {
  const categories = await query('SELECT * FROM categories');
  for (const cat of categories) {
    if (getNumericId(cat.id) === numericId) {
      return cat;
    }
  }
  return null;
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return sendResponse(null, 200);
}

// GET requests: Read actions
export async function GET(request, { params }) {
  const baseUrl = new URL(request.url).origin;
  const { route } = await params;
  const routePath = route ? route.join('/') : '';

  // Optional authentication check (updates last_used_at if authorization headers are supplied)
  const auth = await authenticate(request);
  if (auth && auth.error) {
    return sendResponse({ code: 'rest_cannot_access', message: auth.error, data: { status: auth.status } }, auth.status);
  }
  const user = auth ? auth.user : null;

  // 1. Discovery Index /wp-json/
  if (routePath === '') {
    return sendResponse({
      name: "Trường Tiểu học Ngô Quyền",
      description: "Cổng thông tin Trường Tiểu học Ngô Quyền",
      url: baseUrl,
      namespaces: ["wp/v2"],
      routes: {
        "/wp-json/": { methods: ["GET"] },
        "/wp-json/wp/v2": { methods: ["GET"] },
        "/wp-json/wp/v2/posts": { methods: ["GET", "POST"] },
        "/wp-json/wp/v2/posts/(?P<id>\\d+)": { methods: ["GET", "POST", "PUT", "DELETE"] },
        "/wp-json/wp/v2/categories": { methods: ["GET", "POST"] },
        "/wp-json/wp/v2/media": { methods: ["POST"] }
      }
    });
  }

  // 2. Namespace Index /wp-json/wp/v2
  if (routePath === 'wp/v2') {
    return sendResponse({
      namespace: "wp/v2",
      routes: {
        "/wp-json/wp/v2/posts": { methods: ["GET", "POST"] },
        "/wp-json/wp/v2/posts/(?P<id>\\d+)": { methods: ["GET", "POST", "PUT", "DELETE"] },
        "/wp-json/wp/v2/categories": { methods: ["GET", "POST"] },
        "/wp-json/wp/v2/media": { methods: ["POST"] }
      }
    });
  }

  // 3. List posts: /wp-json/wp/v2/posts
  if (routePath === 'wp/v2/posts') {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') || '10')));
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const categoriesParam = searchParams.get('categories');

    let sql = 'SELECT * FROM posts WHERE 1=1';
    const dbParams = [];

    if (search) {
      sql += ' AND (title LIKE ? OR summary LIKE ?)';
      dbParams.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      const mappedStatus = status === 'publish' ? 'published' : status;
      sql += ' AND status = ?';
      dbParams.push(mappedStatus);
    }

    if (categoriesParam) {
      const numericIds = categoriesParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (numericIds.length > 0) {
        const allCats = await query('SELECT * FROM categories');
        const matchingCatIds = allCats
          .filter(cat => numericIds.includes(getNumericId(cat.id)))
          .map(cat => cat.id);
        
        if (matchingCatIds.length > 0) {
          sql += ` AND category_id IN (${matchingCatIds.map(() => '?').join(',')})`;
          dbParams.push(...matchingCatIds);
        } else {
          return sendResponse([]);
        }
      }
    }

    const offset = (page - 1) * perPage;
    sql += ` ORDER BY created_at DESC LIMIT ${perPage} OFFSET ${offset}`;

    const posts = await query(sql, dbParams);
    
    // Total pagination metadata headers
    const countResult = await query('SELECT COUNT(*) as cnt FROM posts');
    const totalCount = countResult[0].cnt;
    const totalPages = Math.ceil(totalCount / perPage);

    return sendResponse(
      posts.map(p => mapPostToWordPress(p, baseUrl)),
      200,
      {
        'X-WP-Total': totalCount.toString(),
        'X-WP-TotalPages': totalPages.toString()
      }
    );
  }

  // 4. List categories: /wp-json/wp/v2/categories
  if (routePath === 'wp/v2/categories') {
    const cats = await query('SELECT * FROM categories ORDER BY sort_order ASC');
    const wpCats = cats.map(cat => ({
      id: getNumericId(cat.id),
      name: cat.name,
      slug: cat.slug || cat.id,
      taxonomy: 'category',
      parent: 0,
      count: 0,
      description: ''
    }));
    return sendResponse(wpCats);
  }

  // 5. Get single post: /wp-json/wp/v2/posts/<id>
  const postMatch = routePath.match(/^wp\/v2\/posts\/(\d+)$/);
  if (postMatch) {
    const postId = parseInt(postMatch[1]);
    const posts = await query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (!posts.length) {
      return sendResponse({ code: 'rest_post_invalid_id', message: 'Invalid post ID.', data: { status: 404 } }, 404);
    }
    return sendResponse(mapPostToWordPress(posts[0], baseUrl));
  }

  return sendResponse({ code: 'rest_no_route', message: 'No route was found matching the URL and request method.', data: { status: 404 } }, 404);
}

// POST requests: Write actions (require Basic Auth)
export async function POST(request, { params }) {
  const baseUrl = new URL(request.url).origin;
  const { route } = await params;
  const routePath = route ? route.join('/') : '';

  // Auth validation
  const auth = await authenticate(request);
  if (!auth || auth.error) {
    const status = auth ? auth.status : 401;
    const msg = auth ? auth.error : 'Xin lỗi, bạn không có quyền thực hiện hành động này.';
    return sendResponse({ code: 'rest_cannot_create', message: msg, data: { status } }, status);
  }
  const user = auth.user;

  // 1. Create new post: /wp-json/wp/v2/posts
  if (routePath === 'wp/v2/posts') {
    try {
      const body = await request.json();
      
      const rawTitle = typeof body.title === 'object' ? (body.title.raw || body.title.rendered || '') : (body.title || '');
      const rawContent = typeof body.content === 'object' ? (body.content.raw || body.content.rendered || '') : (body.content || '');
      const rawExcerpt = typeof body.excerpt === 'object' ? (body.excerpt.raw || body.excerpt.rendered || '') : (body.excerpt || '');
      
      if (!rawTitle) {
        return sendResponse({ code: 'rest_missing_callback_param', message: 'Thiếu tiêu đề bài viết.', data: { status: 400 } }, 400);
      }

      let slug = body.slug;
      if (!slug) {
        slug = rawTitle.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim().replace(/\s+/g, '-')
          + '-' + Date.now();
      }

      // Map status
      const status = body.status === 'publish' ? 'published' : (body.status || 'draft');

      // Map featured media
      let imageUrl = '';
      if (body.featured_media) {
        const mediaId = parseInt(body.featured_media);
        if (!isNaN(mediaId)) {
          const files = await query('SELECT url FROM files WHERE id = ?', [mediaId]);
          if (files.length > 0) {
            imageUrl = files[0].url;
          }
        }
      }

      // Map category ID
      let categoryId = null;
      let categoryName = '';
      if (body.categories && Array.isArray(body.categories) && body.categories.length > 0) {
        const catObj = await findCategoryByNumericId(body.categories[0]);
        if (catObj) {
          categoryId = catObj.id;
          categoryName = catObj.name;
        }
      }

      const today = new Date().toISOString().split('T')[0];
      const dateDisplay = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
      });

      const result = await query(
        `INSERT INTO posts
          (slug, title, summary, content, category_id, category_name, image, author, status, featured, views, post_date, date_display, created_by)
         VALUES (?,?,?,?,?,?,?,?,?,?,0,?,?,?)`,
        [slug, rawTitle, rawExcerpt, rawContent, categoryId, categoryName, imageUrl, user.display_name, status, 0, today, dateDisplay, user.id]
      );

      const newPost = await query('SELECT * FROM posts WHERE id = ?', [result.insertId]);
      return sendResponse(mapPostToWordPress(newPost[0], baseUrl), 201);
    } catch (err) {
      return sendResponse({ code: 'rest_server_error', message: err.message, data: { status: 500 } }, 500);
    }
  }

  // 2. Update existing post: /wp-json/wp/v2/posts/<id>
  const postMatch = routePath.match(/^wp\/v2\/posts\/(\d+)$/);
  if (postMatch) {
    try {
      const postId = parseInt(postMatch[1]);
      const posts = await query('SELECT * FROM posts WHERE id = ?', [postId]);
      if (!posts.length) {
        return sendResponse({ code: 'rest_post_invalid_id', message: 'Cần một ID bài viết hợp lệ.', data: { status: 404 } }, 404);
      }

      const currentPost = posts[0];
      const body = await request.json();

      const rawTitle = typeof body.title === 'object' ? (body.title.raw || body.title.rendered || '') : (body.title || currentPost.title);
      const rawContent = typeof body.content === 'object' ? (body.content.raw || body.content.rendered || '') : (body.content || currentPost.content);
      const rawExcerpt = typeof body.excerpt === 'object' ? (body.excerpt.raw || body.excerpt.rendered || '') : (body.excerpt || currentPost.summary);

      let status = currentPost.status;
      if (body.status) {
        status = body.status === 'publish' ? 'published' : body.status;
      }

      let imageUrl = currentPost.image;
      if (body.hasOwnProperty('featured_media')) {
        const mediaId = parseInt(body.featured_media);
        if (!isNaN(mediaId) && mediaId > 0) {
          const files = await query('SELECT url FROM files WHERE id = ?', [mediaId]);
          if (files.length > 0) {
            imageUrl = files[0].url;
          }
        } else if (mediaId === 0) {
          imageUrl = '';
        }
      }

      let categoryId = currentPost.category_id;
      let categoryName = currentPost.category_name;
      if (body.categories && Array.isArray(body.categories) && body.categories.length > 0) {
        const catObj = await findCategoryByNumericId(body.categories[0]);
        if (catObj) {
          categoryId = catObj.id;
          categoryName = catObj.name;
        }
      }

      const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

      await query(
        `UPDATE posts SET
          title=?, summary=?, content=?, category_id=?, category_name=?,
          image=?, status=?, updated_at=?
         WHERE id=?`,
        [rawTitle, rawExcerpt, rawContent, categoryId, categoryName, imageUrl, status, nowStr, postId]
      );

      const updated = await query('SELECT * FROM posts WHERE id = ?', [postId]);
      return sendResponse(mapPostToWordPress(updated[0], baseUrl));
    } catch (err) {
      return sendResponse({ code: 'rest_server_error', message: err.message, data: { status: 500 } }, 500);
    }
  }

  // 3. Upload media attachment: /wp-json/wp/v2/media
  if (routePath === 'wp/v2/media') {
    try {
      let fileBuffer;
      let filename = 'file.jpg';
      let mimeType = 'image/jpeg';

      const contentType = request.headers.get('Content-Type') || '';
      if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) {
          return sendResponse({ code: 'rest_upload_no_file', message: 'No file was uploaded.', data: { status: 400 } }, 400);
        }
        fileBuffer = Buffer.from(await file.arrayBuffer());
        filename = file.name;
        mimeType = file.type;
      } else {
        // Raw binary body upload
        fileBuffer = Buffer.from(await request.arrayBuffer());
        const contentDisposition = request.headers.get('Content-Disposition') || '';
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
        mimeType = contentType.split(';')[0] || 'image/jpeg';
      }

      if (!fileBuffer || fileBuffer.length === 0) {
        return sendResponse({ code: 'rest_upload_empty', message: 'Empty upload body.', data: { status: 400 } }, 400);
      }

      const uniqueName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      let fileUrl = '';

      // 1. Cloudflare R2 Upload
      try {
        const { getCloudflareContext } = await import('@opennextjs/cloudflare');
        const ctx = getCloudflareContext();
        if (ctx?.env?.R2_BUCKET) {
          await ctx.env.R2_BUCKET.put(uniqueName, fileBuffer, {
            httpMetadata: { contentType: mimeType }
          });
          const r2PublicUrl = process.env.NEXT_PUBLIC_R2_URL || '';
          fileUrl = r2PublicUrl ? `${r2PublicUrl}/${uniqueName}` : `/api/uploads/${uniqueName}`;
        }
      } catch (r2Err) {
        console.warn('R2 upload failed in WP API, falling back:', r2Err.message);
      }

      // 2. Filesystem local fallback
      if (!fileUrl) {
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          
          try {
            await fs.access(uploadsDir);
          } catch {
            await fs.mkdir(uploadsDir, { recursive: true });
          }

          const filePath = path.join(uploadsDir, uniqueName);
          await fs.writeFile(filePath, fileBuffer);
          fileUrl = `/uploads/${uniqueName}`;
        } catch (fsErr) {
          // Fall back to base64 data URL if filesystem is read-only (Edge Workers)
          const base64Data = fileBuffer.toString('base64');
          fileUrl = `data:${mimeType};base64,${base64Data}`;
        }
      }

      // Save database record
      const fileResult = await query(
        `INSERT INTO files (name, file_type, url, file_size, folder, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)`,
        [uniqueName, mimeType.split('/')[0], fileUrl, `${(fileBuffer.length / 1024).toFixed(0)}KB`, 'general', user.id]
      );
      
      const fileId = fileResult.insertId;

      return sendResponse({
        id: fileId,
        date: new Date().toISOString(),
        slug: uniqueName,
        type: 'attachment',
        link: fileUrl,
        title: { rendered: filename },
        author: user.id,
        source_url: fileUrl,
        mime_type: mimeType,
        media_details: {
          file: uniqueName,
          sizes: {
            thumbnail: { source_url: fileUrl },
            medium: { source_url: fileUrl },
            full: { source_url: fileUrl }
          }
        }
      }, 201);

    } catch (err) {
      return sendResponse({ code: 'rest_server_error', message: err.message, data: { status: 500 } }, 500);
    }
  }

  // 4. Create category: /wp-json/wp/v2/categories
  if (routePath === 'wp/v2/categories') {
    try {
      const body = await request.json();
      const name = body.name;
      if (!name) {
        return sendResponse({ code: 'rest_missing_callback_param', message: 'Missing category name.', data: { status: 400 } }, 400);
      }

      let slug = body.slug || name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim().replace(/\s+/g, '-');

      const id = slug;
      await query(
        'INSERT OR IGNORE INTO categories (id, name, slug, sort_order, active) VALUES (?,?,?,?,1)',
        [id, name, slug, 99]
      );

      return sendResponse({
        id: getNumericId(id),
        name,
        slug,
        taxonomy: 'category',
        parent: 0,
        count: 0
      }, 201);
    } catch (err) {
      return sendResponse({ code: 'rest_server_error', message: err.message, data: { status: 500 } }, 500);
    }
  }

  return sendResponse({ code: 'rest_no_route', message: 'No route was found matching the URL and request method.', data: { status: 404 } }, 404);
}

// DELETE requests: Delete actions (require Basic Auth)
export async function DELETE(request, { params }) {
  const { route } = await params;
  const routePath = route ? route.join('/') : '';

  // Auth validation
  const auth = await authenticate(request);
  if (!auth || auth.error) {
    const status = auth ? auth.status : 401;
    const msg = auth ? auth.error : 'Xin lỗi, bạn không có quyền thực hiện hành động này.';
    return sendResponse({ code: 'rest_cannot_delete', message: msg, data: { status } }, status);
  }
  const user = auth.user;

  // Delete post: /wp-json/wp/v2/posts/<id>
  const postMatch = routePath.match(/^wp\/v2\/posts\/(\d+)$/);
  if (postMatch) {
    try {
      const postId = parseInt(postMatch[1]);
      const posts = await query('SELECT * FROM posts WHERE id = ?', [postId]);
      if (!posts.length) {
        return sendResponse({ code: 'rest_post_invalid_id', message: 'Invalid post ID.', data: { status: 404 } }, 404);
      }

      await query('DELETE FROM posts WHERE id = ?', [postId]);
      return sendResponse({
        success: true,
        deleted: true,
        previous: mapPostToWordPress(posts[0], new URL(request.url).origin)
      });
    } catch (err) {
      return sendResponse({ code: 'rest_server_error', message: err.message, data: { status: 500 } }, 500);
    }
  }

  return sendResponse({ code: 'rest_no_route', message: 'No route was found matching the URL and request method.', data: { status: 404 } }, 404);
}
