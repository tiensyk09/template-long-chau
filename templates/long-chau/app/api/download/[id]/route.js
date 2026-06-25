import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { decodeId, verifyDownloadToken } from '@/lib/obfuscator';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse('Missing file ID', { status: 400 });
    }

    const decoded = decodeId(id);
    if (!decoded) {
      return new NextResponse('File not found', { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const expires = searchParams.get('expires');

    if (!token || !expires || !verifyDownloadToken(decoded.id, expires, token)) {
      return new NextResponse('Lượt tải đã hết hạn hoặc liên kết không hợp lệ. Vui lòng tải lại trang tải tài nguyên để lấy liên kết mới.', { status: 403 });
    }

    // Clean expired tokens
    try {
      await query('DELETE FROM download_tokens WHERE expires_at < ?', [Date.now()]);
    } catch (e) {}

    // Rate limit check (max 3 downloads per token)
    const tokenUsage = await query('SELECT use_count FROM download_tokens WHERE token = ?', [token]);
    if (tokenUsage.length > 0) {
      const count = tokenUsage[0].use_count;
      if (count >= 3) {
        return new NextResponse('Liên kết tải này đã hết lượt sử dụng (tối đa 3 lần). Vui lòng tải lại trang để lấy liên kết mới.', { status: 403 });
      }
      await query('UPDATE download_tokens SET use_count = use_count + 1 WHERE token = ?', [token]);
    } else {
      await query('INSERT INTO download_tokens (token, use_count, expires_at) VALUES (?, 1, ?)', [token, expires]);
    }

    let file = null;
    let table = '';

    if (decoded.type === 'f') {
      const rows = await query('SELECT * FROM files WHERE id = ?', [decoded.id]);
      if (rows.length > 0) {
        file = rows[0];
        table = 'files';
      }
    } else if (decoded.type === 'a') {
      const rows = await query('SELECT * FROM post_attachments WHERE id = ?', [decoded.id]);
      if (rows.length > 0) {
        file = rows[0];
        table = 'post_attachments';
      }
    }

    if (!file) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Increment downloads count
    if (table === 'files') {
      await query('UPDATE files SET downloads = COALESCE(downloads, 0) + 1 WHERE id = ?', [decoded.id]);
    } else if (table === 'post_attachments') {
      await query('UPDATE post_attachments SET downloads = COALESCE(downloads, 0) + 1 WHERE id = ?', [decoded.id]);
    }

    // 1. Local filesystem stream
    if (file.url.startsWith('/') || file.url.startsWith('public/')) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const cleanUrl = file.url.startsWith('/') ? file.url : `/${file.url}`;
        const localPath = path.join(process.cwd(), 'public', cleanUrl);

        if (fs.existsSync(localPath)) {
          const fileBuffer = fs.readFileSync(localPath);
          const ext = file.name.split('.').pop()?.toLowerCase() || '';

          let mimeType = 'application/octet-stream';
          if (ext === 'pdf') mimeType = 'application/pdf';
          else if (ext === 'zip') mimeType = 'application/zip';
          else if (ext === 'rar') mimeType = 'application/x-rar-compressed';
          else if (ext === '7z') mimeType = 'application/x-7z-compressed';
          else if (ext === 'png') mimeType = 'image/png';
          else if (ext === 'gif') mimeType = 'image/gif';
          else if (ext === 'webp') mimeType = 'image/webp';
          else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
          else if (ext === 'svg') mimeType = 'image/svg+xml';
          else if (ext === 'mp4') mimeType = 'video/mp4';
          else if (ext === 'mp3') mimeType = 'audio/mpeg';

          return new Response(fileBuffer, {
            headers: {
              'Content-Type': mimeType,
              'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
              'X-Content-Type-Options': 'nosniff'
            }
          });
        }
      } catch (fsErr) {
        console.error('Lỗi stream tệp cục bộ:', fsErr.message);
      }
    }

    // 2. Cloudflare R2 stream
    try {
      const { getCloudflareContext } = await import('@opennextjs/cloudflare');
      const ctx = getCloudflareContext();
      if (ctx?.env?.R2_BUCKET) {
        const key = file.url.split('/').pop();
        const object = await ctx.env.R2_BUCKET.get(key);
        if (object) {
          const headers = new Headers();
          object.writeHttpMetadata(headers);
          headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
          headers.set('X-Content-Type-Options', 'nosniff');
          return new Response(object.body, { headers });
        }
      }
    } catch (cfErr) {
      // Local dev environment
    }

    // 3. Remote URL Proxy fallback
    try {
      const { origin } = new URL(request.url);
      const targetUrl = file.url.startsWith('http') ? file.url : `${origin}${file.url.startsWith('/') ? '' : '/'}${file.url}`;
      const remoteRes = await fetch(targetUrl);
      if (remoteRes.ok) {
        return new Response(remoteRes.body, {
          headers: {
            'Content-Type': remoteRes.headers.get('Content-Type') || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
            'X-Content-Type-Options': 'nosniff'
          }
        });
      }
    } catch (remoteErr) {
      console.error('Lỗi stream tệp từ xa:', remoteErr.message);
    }

    return new NextResponse('Không thể tải xuống tệp tin', { status: 500 });
  } catch (err) {
    return new NextResponse(`Error: ${err.message}`, { status: 500 });
  }
}
