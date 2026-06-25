import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getAuthUser, requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit

export async function POST(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const body = await request.json();
    const { dataUrl, filename, thumbDataUrl } = body;

    if (!dataUrl || !filename) {
      return NextResponse.json({ error: 'Thiếu dữ liệu' }, { status: 400 });
    }

    // Parse base64
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: 'Định dạng không hợp lệ' }, { status: 400 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({
        error: `File quá lớn (${(buffer.length / 1024 / 1024).toFixed(1)}MB). Tối đa 10MB cho ảnh.`
      }, { status: 413 });
    }

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueName = `${Date.now()}_${safeName}`;

    // 1. Thử tải lên Cloudflare R2
    try {
      const { getCloudflareContext } = await import('@opennextjs/cloudflare');
      const ctx = getCloudflareContext();
      if (ctx?.env?.R2_BUCKET) {
        await ctx.env.R2_BUCKET.put(uniqueName, buffer, {
          httpMetadata: { contentType: mimeType }
        });

        if (thumbDataUrl) {
          const thumbMatches = thumbDataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (thumbMatches) {
            const thumbBuffer = Buffer.from(thumbMatches[2], 'base64');
            const thumbName = uniqueName.replace(/\.[^.]+$/, '') + '_thumb.webp';
            await ctx.env.R2_BUCKET.put(thumbName, thumbBuffer, {
              httpMetadata: { contentType: 'image/webp' }
            });
          }
        }

        const r2PublicUrl = process.env.NEXT_PUBLIC_R2_URL || '';
        const url = r2PublicUrl ? `${r2PublicUrl}/${uniqueName}` : `/api/uploads/${uniqueName}`;
        return NextResponse.json({ url, size: buffer.length });
      }
    } catch (r2Err) {
      console.warn('R2 upload failed, falling back to filesystem/base64:', r2Err.message);
    }

    // 2. Fallback ghi file cục bộ (local dev) hoặc base64
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, uniqueName);
      await writeFile(filePath, buffer);

      if (thumbDataUrl) {
        const thumbMatches = thumbDataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (thumbMatches) {
          const thumbBuffer = Buffer.from(thumbMatches[2], 'base64');
          const thumbName = uniqueName.replace(/\.[^.]+$/, '') + '_thumb.webp';
          await writeFile(path.join(uploadsDir, thumbName), thumbBuffer);
        }
      }

      const url = `/uploads/${uniqueName}`;
      return NextResponse.json({ url, size: buffer.length });
    } catch (fsErr) {
      console.warn('Filesystem write failed, falling back to database storage:', fsErr.message);
      try {
        await query(
          'INSERT INTO stored_files (`key`, `content`, `mime_type`) VALUES (?, ?, ?)',
          [uniqueName, base64Data, mimeType]
        );
        if (thumbDataUrl) {
          const thumbMatches = thumbDataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (thumbMatches) {
            const thumbName = uniqueName.replace(/\.[^.]+$/, '') + '_thumb.webp';
            await query(
              'INSERT INTO stored_files (`key`, `content`, `mime_type`) VALUES (?, ?, ?)',
              [thumbName, thumbMatches[2], 'image/webp']
            );
          }
        }
        const url = `/api/uploads/${uniqueName}`;
        return NextResponse.json({ url, size: buffer.length });
      } catch (dbErr) {
        console.error('Database storage fallback failed, using base64 inline:', dbErr.message);
        return NextResponse.json({ url: dataUrl, size: buffer.length });
      }
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
