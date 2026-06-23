import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

const MAX_SIZE = 200 * 1024 * 1024; // 200MB limit

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function getFileType(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return 'image';
  if (['mp4','mov','avi','webm'].includes(ext)) return 'video';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc','docx'].includes(ext)) return 'word';
  if (['xls','xlsx','csv'].includes(ext)) return 'excel';
  if (['ppt','pptx'].includes(ext)) return 'powerpoint';
  if (['zip','rar','7z'].includes(ext)) return 'archive';
  if (['mp3','wav','ogg'].includes(ext)) return 'audio';
  if (['txt','md'].includes(ext)) return 'text';
  return 'other';
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');
    const all = searchParams.get('all') === 'true';

    let sql;
    let params = [];

    if (postId) {
      sql = 'SELECT * FROM post_attachments WHERE post_id = ? ORDER BY uploaded_at DESC';
      params = [postId];
    } else if (all) {
      sql = `
        SELECT a.*, p.title as post_title, p.slug as post_slug
        FROM post_attachments a
        LEFT JOIN posts p ON a.post_id = p.id
        ORDER BY a.uploaded_at DESC
      `;
    } else {
      sql = 'SELECT * FROM post_attachments ORDER BY uploaded_at DESC LIMIT 50';
    }

    const attachments = await query(sql, params);
    return NextResponse.json({ attachments });
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
    const { name, url, post_id, file_size_bytes } = body;

    if (!name || !url) {
      return NextResponse.json({ error: 'Thiếu tên file hoặc URL' }, { status: 400 });
    }

    const sizeBytes = file_size_bytes || 0;
    if (sizeBytes > MAX_SIZE) {
      return NextResponse.json({
        error: `File quá lớn (${formatSize(sizeBytes)}). Giới hạn tối đa 200MB.`
      }, { status: 413 });
    }

    const fileType = getFileType(name);
    const sizeLabel = formatSize(sizeBytes);

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
            console.warn('R2/Local upload failed for attachment, falling back to database storage:', fsErr.message);
            try {
              await query(
                'INSERT INTO stored_files (`key`, `content`, `mime_type`) VALUES (?, ?, ?)',
                [uniqueName, base64Data, mimeType]
              );
              finalUrl = `/api/uploads/${uniqueName}`;
            } catch (dbErr) {
              console.error('Database backup storage failed for attachment:', dbErr.message);
            }
          }
        }
      }
    }

    const result = await query(
      `INSERT INTO post_attachments (post_id, name, original_name, file_type, file_size, file_size_label, url, uploaded_by)
       VALUES (?,?,?,?,?,?,?,?)`,
      [post_id || null, name, name, fileType, sizeBytes, sizeLabel, finalUrl, user.id]
    );

    const newFile = await query('SELECT * FROM post_attachments WHERE id = ?', [result.insertId]);
    return NextResponse.json({ attachment: newFile[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
