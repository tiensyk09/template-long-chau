import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';
import JSZip from 'jszip';

export const dynamic = 'force-dynamic';

// Helper: Lưu file vào R2 hoặc Local Disk
async function writeUploadedFile(name, buffer, r2Bucket) {
  // 1. Ghi vào Cloudflare R2 (nếu có bucket được truyền vào)
  if (r2Bucket) {
    try {
      const ext = name.split('.').pop()?.toLowerCase() || '';
      let mimeType = 'application/octet-stream';
      if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
        mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext === 'svg' ? 'svg+xml' : ext}`;
      } else if (ext === 'pdf') {
        mimeType = 'application/pdf';
      }
      await r2Bucket.put(name, buffer, {
        httpMetadata: { contentType: mimeType }
      });
      return true;
    } catch (err) {
      console.warn('R2 put failed in import:', err.message);
    }
  }

  // 2. Ghi vào thư mục local (Local dev)
  try {
    const fs = await import('fs');
    const path = await import('path');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(uploadsDir, name), Buffer.from(buffer));
    return true;
  } catch (err) {
    console.warn('Local disk write failed in import:', err.message);
  }

  return false;
}

export async function POST(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'admin'); // Chỉ admin mới được import phục hồi
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy tệp tải lên' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Lấy R2 bucket một lần duy nhất trước khi khôi phục ảnh
    let r2Bucket = null;
    try {
      const { getCloudflareContext } = await import('@opennextjs/cloudflare');
      const ctx = getCloudflareContext();
      if (ctx?.env?.R2_BUCKET) {
        r2Bucket = ctx.env.R2_BUCKET;
      }
    } catch (cfErr) {
      // Không chạy trên Cloudflare (Local dev)
    }

    // 1. Tìm và đọc file CSDL database_backup.json
    const dbBackupFile = zip.file('database_backup.json');
    if (!dbBackupFile) {
      return NextResponse.json({ error: 'Định dạng ZIP không hợp lệ. Thiếu file database_backup.json' }, { status: 400 });
    }

    const dbJsonText = await dbBackupFile.async('text');
    const backupData = JSON.parse(dbJsonText);

    if (!backupData || !backupData.data) {
      return NextResponse.json({ error: 'Dữ liệu sao lưu trống hoặc không hợp lệ' }, { status: 400 });
    }

    const dbData = backupData.data;

    // Thứ tự xoá bảng (tránh lỗi khoá ngoại)
    const deleteOrder = [
      'post_attachments',
      'poll_options',
      'polls',
      'posts',
      'notifications',
      'files',
      'banners',
      'categories',
      'users',
      'settings'
    ];

    // Thứ tự thêm dữ liệu (theo thứ tự dependency)
    const insertOrder = [
      'users',
      'categories',
      'posts',
      'notifications',
      'polls',
      'poll_options',
      'files',
      'post_attachments',
      'banners',
      'settings'
    ];

    const stats = {
      cleared: [],
      inserted: {},
      filesRestored: 0
    };

    // Thực hiện xoá dữ liệu cũ
    for (const table of deleteOrder) {
      try {
        await query(`DELETE FROM \`${table}\``);
        stats.cleared.push(table);
      } catch (tableErr) {
        console.warn(`Xoá bảng ${table} thất bại hoặc bảng chưa có:`, tableErr.message);
      }
    }

    // Thực hiện chèn dữ liệu sao lưu
    for (const table of insertOrder) {
      const rows = dbData[table];
      if (Array.isArray(rows) && rows.length > 0) {
        stats.inserted[table] = 0;
        
        for (const row of rows) {
          try {
            const keys = Object.keys(row);
            const cols = keys.map(k => `\`${k}\``).join(', ');
            const placeholders = keys.map(() => '?').join(', ');
            const vals = Object.values(row);

            await query(`INSERT INTO \`${table}\` (${cols}) VALUES (${placeholders})`, vals);
            stats.inserted[table]++;
          } catch (rowErr) {
            console.error(`Lỗi chèn dòng vào bảng ${table}:`, rowErr.message);
          }
        }
      } else {
        stats.inserted[table] = 0;
      }
    }

    // 2. Khôi phục các tệp tin trong uploads/
    const uploadsFolder = zip.folder('uploads');
    if (uploadsFolder) {
      const fileEntries = [];
      uploadsFolder.forEach((relativePath, fileEntry) => {
        if (!fileEntry.dir) {
          fileEntries.push({ name: relativePath, file: fileEntry });
        }
      });

      for (const entry of fileEntries) {
        const buffer = await entry.file.async('uint8array');
        const restored = await writeUploadedFile(entry.name, buffer, r2Bucket);
        if (restored) {
          stats.filesRestored++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Khôi phục cơ sở dữ liệu và tệp tin thành công!',
      stats
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
