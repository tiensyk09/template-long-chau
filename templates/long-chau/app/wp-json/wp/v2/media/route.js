import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateApiKey, getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Helper to format bytes to human readable format
function formatSize(bytes) {
  if (!bytes) return '0 B';
  const size = parseInt(bytes);
  if (isNaN(size)) return bytes;
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
  return (size / (1024 * 1024)).toFixed(1) + ' MB';
}

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

// GET /wp-json/wp/v2/media — Retrieve media files list
export async function GET(request) {
  try {
    const host = request.headers.get('host') || 'localhost:3000';
    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('per_page') || '10')));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const offset = (page - 1) * limit;

    const files = await query(
      `SELECT * FROM files 
       ORDER BY uploaded_at DESC 
       LIMIT ${limit} OFFSET ${offset}`
    );

    const formatted = files.map(f => formatWpMedia(f, host));
    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json(
      { code: 'rest_error', message: err.message, data: { status: 500 } },
      { status: 500 }
    );
  }
}

// POST /wp-json/wp/v2/media — Upload a new file (Auth Required)
export async function POST(request) {
  const user = await authenticateApiKey(request) || await getAuthUser();
  if (!user || (user.role !== 'admin' && user.role !== 'mod')) {
    return NextResponse.json(
      { code: 'rest_cannot_create', message: 'Sorry, you are not allowed to upload media as this user.', data: { status: 401 } },
      { status: 401 }
    );
  }

  try {
    const host = request.headers.get('host') || 'localhost:3000';
    const contentType = request.headers.get('content-type') || '';
    let buffer;
    let filename = '';
    let mimeType = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file) {
        return NextResponse.json(
          { code: 'rest_upload_no_file', message: 'No file was uploaded.', data: { status: 400 } },
          { status: 400 }
        );
      }
      filename = file.name;
      mimeType = file.type;
      buffer = Buffer.from(await file.arrayBuffer());
    } else {
      // Raw binary upload
      const contentDisposition = request.headers.get('content-disposition') || '';
      const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
      filename = filenameMatch ? filenameMatch[1] : `upload_${Date.now()}`;
      mimeType = contentType.split(';')[0].trim();
      buffer = Buffer.from(await request.arrayBuffer());
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json(
        { code: 'rest_upload_empty', message: 'Uploaded file is empty.', data: { status: 400 } },
        { status: 400 }
      );
    }

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueName = `${Date.now()}_${safeName}`;

    // Detect file type category
    let fileType = 'other';
    if (mimeType.startsWith('image/')) {
      fileType = 'image';
    } else if (mimeType.startsWith('video/')) {
      fileType = 'video';
    } else if (mimeType.startsWith('audio/')) {
      fileType = 'audio';
    } else if (mimeType === 'application/pdf') {
      fileType = 'pdf';
    } else if (
      mimeType.includes('word') || 
      mimeType.includes('officedocument.wordprocessingml')
    ) {
      fileType = 'word';
    } else if (
      mimeType.includes('excel') || 
      mimeType.includes('officedocument.spreadsheetml') ||
      mimeType.includes('csv')
    ) {
      fileType = 'excel';
    } else if (
      mimeType.includes('powerpoint') || 
      mimeType.includes('officedocument.presentationml')
    ) {
      fileType = 'powerpoint';
    } else if (
      mimeType.includes('zip') || 
      mimeType.includes('rar') || 
      mimeType.includes('tar') || 
      mimeType.includes('compressed')
    ) {
      fileType = 'archive';
    } else if (mimeType.startsWith('text/')) {
      fileType = 'text';
    }

    let finalUrl = '';
    let uploaded = false;

    // 1. Try Cloudflare R2
    try {
      const { getCloudflareContext } = await import('@opennextjs/cloudflare');
      const ctx = getCloudflareContext();
      if (ctx?.env?.R2_BUCKET) {
        await ctx.env.R2_BUCKET.put(uniqueName, buffer, {
          httpMetadata: { contentType: mimeType }
        });
        const r2PublicUrl = process.env.NEXT_PUBLIC_R2_URL || '';
        finalUrl = r2PublicUrl ? `${r2PublicUrl}/${uniqueName}` : `/api/uploads/${uniqueName}`;
        uploaded = true;
      }
    } catch (r2Err) {
      console.warn('R2 upload failed, fallback to FS:', r2Err.message);
    }

    // 2. Fallback to Local FS
    if (!uploaded) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadsDir, uniqueName), buffer);
        finalUrl = `/uploads/${uniqueName}`;
        uploaded = true;
      } catch (fsErr) {
        console.warn('FS write failed, inline base64 fallback:', fsErr.message);
        finalUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
      }
    }

    // 3. Save into `files` table
    const result = await query(
      `INSERT INTO files (name, file_type, url, file_size, folder, uploaded_by, description, is_public) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [filename, fileType, finalUrl, formatSize(buffer.length), 'images', user.id, '', 1]
    );

    const insertedRows = await query('SELECT * FROM files WHERE id = ?', [result.insertId]);
    if (insertedRows.length === 0) {
      throw new Error('Failed to retrieve uploaded file details from DB');
    }

    const responsePayload = formatWpMedia(insertedRows[0], host);
    return NextResponse.json(responsePayload, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { code: 'rest_error', message: err.message, data: { status: 500 } },
      { status: 500 }
    );
  }
}
