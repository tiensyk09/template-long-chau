import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateApiKey, getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Helper to guess mime type from file extension
function getMimeType(filename, defaultMime = 'application/octet-stream') {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
    'zip': 'application/zip',
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json'
  };
  return mimeTypes[ext] || defaultMime;
}

// Format database file object into WordPress-compatible Media REST API object
function formatWpMedia(file, host) {
  const scheme = host.includes('localhost') ? 'http' : 'https';
  const fileUrl = file.url.startsWith('http') || file.url.startsWith('data:') 
    ? file.url 
    : `${scheme}://${host}${file.url}`;
  
  return {
    id: file.id,
    date: file.uploaded_at ? new Date(file.uploaded_at).toISOString() : new Date().toISOString(),
    date_gmt: file.uploaded_at ? new Date(file.uploaded_at).toISOString() : new Date().toISOString(),
    guid: { rendered: fileUrl },
    modified: file.uploaded_at ? new Date(file.uploaded_at).toISOString() : new Date().toISOString(),
    modified_gmt: file.uploaded_at ? new Date(file.uploaded_at).toISOString() : new Date().toISOString(),
    slug: file.name.split('.')[0] || 'media-file',
    status: 'inherit',
    type: 'attachment',
    link: fileUrl,
    title: { rendered: file.name },
    author: file.uploaded_by || 1,
    comment_status: 'closed',
    ping_status: 'closed',
    template: '',
    alt_text: file.description || '',
    caption: { rendered: '' },
    description: { rendered: file.description || '' },
    media_type: file.file_type === 'image' ? 'image' : 'file',
    mime_type: getMimeType(file.name),
    media_details: {
      width: 800,
      height: 600,
      file: file.name,
      sizes: {
        thumbnail: {
          file: file.name,
          width: 150,
          height: 150,
          mime_type: getMimeType(file.name),
          source_url: fileUrl
        },
        medium: {
          file: file.name,
          width: 300,
          height: 300,
          mime_type: getMimeType(file.name),
          source_url: fileUrl
        },
        full: {
          file: file.name,
          width: 800,
          height: 600,
          mime_type: getMimeType(file.name),
          source_url: fileUrl
        }
      },
      image_meta: {}
    },
    post: 0,
    source_url: fileUrl
  };
}

// GET /wp-json/wp/v2/media/[id] — Retrieve single media info
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const host = request.headers.get('host') || 'localhost:3000';

    const files = await query('SELECT * FROM files WHERE id = ?', [id]);
    if (files.length === 0) {
      return NextResponse.json(
        { code: 'rest_post_invalid_id', message: 'Invalid media ID.', data: { status: 404 } },
        { status: 404 }
      );
    }

    return NextResponse.json(formatWpMedia(files[0], host));
  } catch (err) {
    return NextResponse.json(
      { code: 'rest_error', message: err.message, data: { status: 500 } },
      { status: 500 }
    );
  }
}

// DELETE /wp-json/wp/v2/media/[id] — Delete media file (Auth Required)
export async function DELETE(request, { params }) {
  const { id } = await params;
  const user = await authenticateApiKey(request) || await getAuthUser();
  if (!user || (user.role !== 'admin' && user.role !== 'mod')) {
    return NextResponse.json(
      { code: 'rest_cannot_delete', message: 'Sorry, you are not allowed to delete this media.', data: { status: 401 } },
      { status: 401 }
    );
  }

  try {
    const host = request.headers.get('host') || 'localhost:3000';

    // 1. Fetch file first to return info and get URL
    const files = await query('SELECT * FROM files WHERE id = ?', [id]);
    if (files.length === 0) {
      return NextResponse.json(
        { code: 'rest_post_invalid_id', message: 'Invalid media ID.', data: { status: 404 } },
        { status: 404 }
      );
    }

    const file = files[0];

    // 2. Delete database entry
    await query('DELETE FROM files WHERE id = ?', [id]);

    // 3. Delete physical/R2 file
    if (file.url.startsWith('/uploads/')) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const localPath = path.join(process.cwd(), 'public', file.url);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      } catch (fsErr) {
        console.warn('Failed to delete local file:', fsErr.message);
      }
    } else {
      try {
        const { getCloudflareContext } = await import('@opennextjs/cloudflare');
        const ctx = getCloudflareContext();
        if (ctx?.env?.R2_BUCKET) {
          const key = file.url.split('/').pop();
          if (key) {
            await ctx.env.R2_BUCKET.delete(key);
          }
        }
      } catch (r2Err) {
        console.warn('Failed to delete from R2:', r2Err.message);
      }
    }

    const wpFormat = formatWpMedia(file, host);
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
