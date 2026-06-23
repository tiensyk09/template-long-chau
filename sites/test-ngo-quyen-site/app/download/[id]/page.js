import Link from 'next/link';
import { query } from '../../../lib/db';
import { notFound } from 'next/navigation';
import { decodeId, generateDownloadToken } from '../../../lib/obfuscator';

export const dynamic = 'force-dynamic';

const FILE_ICONS = {
  image: '🖼️',
  video: '🎬',
  pdf: '📕',
  word: '📘',
  excel: '📊',
  powerpoint: '📙',
  archive: '📦',
  audio: '🎵',
  text: '📄',
  other: '📎'
};

const FILE_NAMES = {
  image: 'Hình ảnh',
  video: 'Video clip',
  pdf: 'Tài liệu PDF',
  word: 'Văn bản Word',
  excel: 'Bảng tính Excel',
  powerpoint: 'Trình chiếu PowerPoint',
  archive: 'Tệp nén',
  audio: 'Âm thanh',
  text: 'Tệp văn bản',
  other: 'Tài nguyên khác'
};

function formatSize(bytes) {
  if (!bytes) return 'N/A';
  const size = parseInt(bytes);
  if (isNaN(size)) return bytes; // In case it is already formatted like "48KB"
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
  return (size / (1024 * 1024)).toFixed(1) + ' MB';
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const decoded = decodeId(id);
  if (!decoded) return { title: 'Tài liệu không tồn tại' };

  let file = null;
  if (decoded.type === 'f') {
    const rows = await query('SELECT * FROM files WHERE id = ?', [decoded.id]);
    file = rows[0];
  } else if (decoded.type === 'a') {
    const rows = await query('SELECT * FROM post_attachments WHERE id = ?', [decoded.id]);
    file = rows[0];
  }

  if (!file || file.is_public === 0) {
    return { title: 'Tài liệu không tồn tại' };
  }

  return {
    title: `Tải về: ${file.name} | Trường Tiểu học Ngô Quyền`,
    description: file.description || `Tải xuống tệp tin ${file.name} từ hệ thống tài nguyên trường Tiểu học Ngô Quyền, Đà Nẵng.`
  };
}

export default async function DownloadPage({ params }) {
  const { id } = await params;
  const decoded = decodeId(id);
  if (!decoded) {
    notFound();
  }

  // eslint-disable-next-line react-hooks/purity
  const expires = Date.now() + 5 * 60 * 1000; // 5 phút hết hạn
  const token = generateDownloadToken(decoded.id, expires);

  let file = null;
  let isAttachment = false;

  if (decoded.type === 'f') {
    const rows = await query('SELECT * FROM files WHERE id = ?', [decoded.id]);
    if (rows.length > 0) file = rows[0];
  } else if (decoded.type === 'a') {
    isAttachment = true;
    const rows = await query(
      `SELECT a.*, p.title as post_title, p.slug as post_slug 
       FROM post_attachments a 
       LEFT JOIN posts p ON a.post_id = p.id 
       WHERE a.id = ?`,
      [decoded.id]
    );
    if (rows.length > 0) file = rows[0];
  }

  if (!file) {
    notFound();
  }

  if (file.is_public === 0) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#374151' }}>Tài nguyên giới hạn quyền truy cập</h2>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>Tệp tin này đã được chuyển sang chế độ riêng tư hoặc ngừng chia sẻ công khai.</p>
          <Link href="/" className="btn-back-home" style={{ marginTop: '24px', display: 'inline-block' }}>
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Sidebar news
  const sidebarNews = await query(
    `SELECT * FROM posts 
     WHERE status = 'published' 
     ORDER BY created_at DESC 
     LIMIT 5`
  );

  const fileType = file.file_type || 'other';
  const fileIcon = FILE_ICONS[fileType] || '📎';
  const fileTypeName = FILE_NAMES[fileType] || 'Tài nguyên';
  const sizeStr = isAttachment ? formatSize(file.file_size) : file.file_size;
  const uploadDate = file.uploaded_at || file.created_at;

  return (
    <div className="page-container">
      <div className="page-layout">
        {/* ─── MAIN COLUMN ─── */}
        <main className="page-main">
          {/* Breadcrumb */}
          <nav className="breadcrumb-bar" aria-label="Breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span>›</span>
            <span style={{ color: '#718096' }}>Tải tài nguyên</span>
          </nav>

          {/* Download card container */}
          <div className="download-card">
            <div className="download-icon-box">
              <span className="download-emoji">{fileIcon}</span>
            </div>
            
            <h1 className="download-filename" title={file.name}>
              {file.name}
            </h1>
            
            <div className="download-badge-row">
              <span className="dl-badge file-badge">{fileTypeName}</span>
              <span className="dl-badge size-badge">{sizeStr}</span>
            </div>

            {/* Description */}
            {file.description && (
              <div className="download-desc">
                <strong>Mô tả tệp tin:</strong>
                <p>{file.description}</p>
              </div>
            )}

            {/* Attachment context details */}
            {isAttachment && file.post_title && (
              <div className="download-context">
                <span>📌 Đính kèm trong bài viết: </span>
                <Link href={`/news/${file.post_slug}`} style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'underline' }}>
                  {file.post_title}
                </Link>
              </div>
            )}

            {/* Meta Table */}
            <table className="download-meta-table">
              <tbody>
                <tr>
                  <td>Ngày đăng tải</td>
                  <td>{uploadDate ? new Date(uploadDate).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</td>
                </tr>
                <tr>
                  <td>Lượt tải về</td>
                  <td><strong style={{ color: '#16a34a' }}>{(file.downloads || 0).toLocaleString()}</strong> lượt</td>
                </tr>
                <tr>
                  <td>Trạng thái</td>
                  <td><span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>✓ Chia sẻ công khai</span></td>
                </tr>
              </tbody>
            </table>

            <div className="download-action-section">
              <a href={`/api/download/${id}?token=${token}&expires=${expires}`} className="btn-dl-premium">
                Tải Xuống Tệp Tin
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
              <span className="download-note">Đường truyền tốc độ cao, hoàn toàn an toàn và miễn phí.</span>
            </div>
          </div>
        </main>

        {/* ─── SIDEBAR ─── */}
        <aside className="page-sidebar">
          {/* Latest news */}
          <div className="sidebar-widget">
            <div className="sidebar-widget-header"><span>TIN MỚI NHẤT</span></div>
            <div className="sidebar-widget-body" style={{ padding: '10px 14px' }}>
              {sidebarNews.map(item => (
                <Link key={item.id} href={`/news/${item.slug}`} className="sidebar-news-link">
                  {item.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="sidebar-widget" style={{ marginTop: 16 }}>
            <div className="sidebar-widget-header"><span>THỐNG KÊ TRUY CẬP</span></div>
            <div className="sidebar-widget-body">
              <div className="stat-row"><span>Hôm nay</span><span className="stat-num">3,293</span></div>
              <div className="stat-row"><span>Tháng này</span><span className="stat-num">28,541</span></div>
              <div className="stat-row"><span>Tổng lượt truy cập</span><span className="stat-num">1,067,367</span></div>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .download-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 32px;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          margin-bottom: 24px;
        }
        .download-icon-box {
          width: 80px;
          height: 80px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          border: 4px solid #f8fafc;
        }
        .download-emoji {
          font-size: 38px;
        }
        .download-filename {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.4;
          margin-bottom: 12px;
          word-break: break-all;
        }
        .download-badge-row {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .dl-badge {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 9999px;
        }
        .file-badge {
          background: #eff6ff;
          color: #2563eb;
        }
        .size-badge {
          background: #f0fdf4;
          color: #16a34a;
        }
        .download-desc {
          background: #f8fafc;
          border: 1px solid #edf2f7;
          border-radius: 8px;
          padding: 14px 16px;
          text-align: left;
          margin-bottom: 20px;
          font-size: 13.5px;
          color: #475569;
        }
        .download-desc strong {
          color: #334155;
          display: block;
          margin-bottom: 4px;
        }
        .download-desc p {
          margin: 0;
          line-height: 1.5;
        }
        .download-context {
          background: #fffcf0;
          border: 1px solid #fffae0;
          border-radius: 8px;
          padding: 10px 16px;
          text-align: left;
          margin-bottom: 20px;
          font-size: 13.5px;
          color: #854d0e;
        }
        .download-meta-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0 24px;
          font-size: 13.5px;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
        }
        .download-meta-table td {
          padding: 10px 14px;
          text-align: left;
          color: #64748b;
        }
        .download-meta-table td:last-child {
          text-align: right;
          color: #1e293b;
          font-weight: 500;
        }
        .download-meta-table tr:not(:last-child) {
          border-bottom: 1px dashed #edf2f7;
        }
        .download-action-section {
          padding-top: 10px;
        }
        .btn-dl-premium {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 36px;
          background: var(--primary);
          color: #ffffff !important;
          font-size: 15.5px;
          font-weight: 700;
          border-radius: 8px;
          text-decoration: none;
          box-shadow: 0 4px 10px rgba(192, 0, 26, 0.2);
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }
        .btn-dl-premium:hover {
          background: #a00014;
          box-shadow: 0 6px 14px rgba(192, 0, 26, 0.3);
          transform: translateY(-2px);
        }
        .btn-dl-premium:active {
          transform: translateY(0);
        }
        .download-note {
          display: block;
          font-size: 11.5px;
          color: #94a3b8;
          margin-top: 10px;
        }
        .btn-back-home {
          padding: 10px 20px;
          background: #f1f5f9;
          color: #475569;
          font-size: 13.5px;
          font-weight: 600;
          border-radius: 6px;
          text-decoration: none;
          transition: background 0.2s;
        }
        .btn-back-home:hover {
          background: #e2e8f0;
          color: #1e293b;
        }
      `}</style>
    </div>
  );
}
