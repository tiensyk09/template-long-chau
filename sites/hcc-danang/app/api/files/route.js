import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const files = await query(
      `SELECT f.*, u.display_name as uploader_name
       FROM files f LEFT JOIN users u ON f.uploaded_by = u.id
       ORDER BY f.uploaded_at DESC`
    );
    return NextResponse.json({ files });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'mod');
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const body = await request.json();
    const { name, file_type, url, file_size, folder, description, is_public } = body;
    if (!url || !name) return NextResponse.json({ error: 'Thiếu thông tin file' }, { status: 400 });

    let finalUrl = url;
    if (url.startsWith('data:')) {
      const matches = url.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const uniqueName = `${Date.now()}_${name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

        let uploaded = false;

        // 1. Thử tải lên Cloudflare R2
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
          console.warn('R2 upload failed, trying local filesystem fallback:', r2Err.message);
        }

        // 2. Ghi file cục bộ (local dev) nếu chưa được tải lên Cloudflare
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
          } catch (fsErr) {
            console.warn('R2/Local upload failed for file, keeping base64:', fsErr.message);
          }
        }
      }
    }

    const result = await query(
      'INSERT INTO files (name, file_type, url, file_size, folder, uploaded_by, description, is_public) VALUES (?,?,?,?,?,?,?,?)',
      [name, file_type || 'file', finalUrl, file_size || '', folder || 'general', user.id, description || '', is_public !== undefined ? is_public : 1]
    );

    const newFile = await query('SELECT * FROM files WHERE id=?', [result.insertId]);
    return NextResponse.json({ file: newFile[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
