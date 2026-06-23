import { NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { key } = await params;

  // 1. Thử đọc từ R2 (trên Cloudflare)
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const ctx = getCloudflareContext();
    if (ctx?.env?.R2_BUCKET) {
      const object = await ctx.env.R2_BUCKET.get(key);
      if (object) {
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        // Cache cho 1 năm
        headers.set('cache-control', 'public, max-age=31536000, immutable');
        return new Response(object.body, { headers });
      }
    }
  } catch (err) {
    console.error('R2 get error:', err.message);
  }

  // 2. Fallback đọc từ file cục bộ (local dev)
  try {
    const filePath = path.join(process.cwd(), 'public', 'uploads', key);
    if (existsSync(filePath)) {
      const fileBuffer = readFileSync(filePath);
      const ext = key.split('.').pop()?.toLowerCase() || '';
      let mimeType = 'image/jpeg';
      if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'gif') mimeType = 'image/gif';
      else if (ext === 'webp') mimeType = 'image/webp';
      else if (ext === 'svg') mimeType = 'image/svg+xml';
      
      return new Response(fileBuffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      });
    }
  } catch (fsErr) {
    console.error('Local file fallback read error:', fsErr.message);
  }

  return new Response('Not Found', { status: 404 });
}
