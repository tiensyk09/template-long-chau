import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Helper: Sinh mã SQL INSERT
function generateSqlBackup(table, rows) {
  if (!rows || rows.length === 0) return `-- No data for table ${table}\n\n`;
  
  const columns = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
  let sql = `-- ------------------------------------------------------\n`;
  sql += `-- Backup data for table \`${table}\`\n`;
  sql += `-- ------------------------------------------------------\n\n`;
  
  for (const row of rows) {
    const values = Object.values(row).map(val => {
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return val;
      const escaped = String(val).replace(/'/g, "''").replace(/\\/g, "\\\\");
      return `'${escaped}'`;
    }).join(', ');
    sql += `INSERT INTO \`${table}\` (${columns}) VALUES (${values});\n`;
  }
  return sql + '\n\n';
}

export async function GET(request) {
  const user = await getAuthUser();
  const authErr = requireAuth(user, 'admin'); // Chỉ admin mới được xuất backup
  if (authErr) return NextResponse.json({ error: authErr.error }, { status: authErr.status });

  try {
    const { searchParams } = new URL(request.url);
    const includeDb = searchParams.get('include_db') !== 'false';
    const includeFiles = searchParams.get('include_files') !== 'false';

    const dbData = {};
    let fullSql = `-- ------------------------------------------------------\n`;
    fullSql += `-- Truong TH Ngo Quyen - Auto generated SQL Backup\n`;
    fullSql += `-- Generated at: ${new Date().toISOString()}\n`;
    fullSql += `-- ------------------------------------------------------\n\n`;

    // 1. Lấy dữ liệu cơ sở dữ liệu nếu yêu cầu
    if (includeDb) {
      const tables = [
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

      for (const table of tables) {
        try {
          const rows = await query(`SELECT * FROM \`${table}\``);
          dbData[table] = rows;
          fullSql += generateSqlBackup(table, rows);
        } catch (tableErr) {
          console.warn(`Could not backup table ${table}:`, tableErr.message);
          dbData[table] = [];
        }
      }
    }

    // 2. Lấy danh sách URL tệp tin nếu yêu cầu
    const filesRows = [];
    if (includeFiles) {
      try {
        const filesResult = await query('SELECT url FROM files');
        const attachmentsResult = await query('SELECT url FROM post_attachments');
        
        filesResult.forEach(f => { if (f.url) filesRows.push(f.url); });
        attachmentsResult.forEach(f => { if (f.url) filesRows.push(f.url); });
      } catch (dbErr) {
        console.warn('Could not query files list for backup:', dbErr.message);
      }
    }

    // Lọc các liên kết trùng lặp và liên kết ngoài
    const uniqueUrls = [...new Set(filesRows)].filter(url => {
      if (url.startsWith('http') && !url.includes('/api/uploads/') && !url.includes('/uploads/')) {
        return false;
      }
      return true;
    });

    // Trả về dữ liệu kết xuất JSON cho phía Client nén để tránh lỗi CPU Limit 1102 của Cloudflare Workers
    return NextResponse.json({
      success: true,
      database_backup_json: includeDb ? {
        metadata: {
          version: '1.0',
          exported_at: new Date().toISOString(),
          tables: Object.keys(dbData)
        },
        data: dbData
      } : null,
      database_backup_sql: includeDb ? fullSql : null,
      files: includeFiles ? uniqueUrls : []
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

