import Link from 'next/link';
import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import { decodeId, generateDownloadToken } from '@/lib/obfuscator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
  image: 'Image File',
  video: 'Video Clip',
  pdf: 'PDF Document',
  word: 'Word Document',
  excel: 'Excel Spreadsheet',
  powerpoint: 'PowerPoint Slide',
  archive: 'Compressed Archive',
  audio: 'Audio Track',
  text: 'Plain Text File',
  other: 'Other Asset'
};

function formatSize(bytes) {
  if (!bytes) return 'N/A';
  const size = parseInt(bytes);
  if (isNaN(size)) return bytes;
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
  return (size / (1024 * 1024)).toFixed(1) + ' MB';
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const decoded = decodeId(id);
  if (!decoded) return { title: 'Asset Not Found | Command Code' };

  let file = null;
  if (decoded.type === 'f') {
    const rows = await query('SELECT * FROM files WHERE id = ?', [decoded.id]);
    file = rows[0];
  } else if (decoded.type === 'a') {
    const rows = await query('SELECT * FROM post_attachments WHERE id = ?', [decoded.id]);
    file = rows[0];
  }

  if (!file || file.is_public === 0) {
    return { title: 'Asset Restricted | Command Code' };
  }

  return {
    title: `Download: ${file.name} | Command Code`,
    description: file.description || `Download asset ${file.name} securely from Command Code.`
  };
}

export default async function DownloadPage({ params }) {
  const { id } = await params;
  const decoded = decodeId(id);
  if (!decoded) {
    notFound();
  }

  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes expiration token
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
      <div className="relative" style={{ minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '120px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>Restricted Resource Access</h2>
          <p style={{ color: 'var(--muted)', marginTop: '8px' }}>This asset has been set to private or is no longer shared publicly.</p>
          <Link href="/" className="btn btn-secondary" style={{ marginTop: '24px', display: 'inline-block', textDecoration: 'none' }}>
            Back to Homepage
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Latest updates
  const latestUpdates = await query(
    `SELECT id, title, slug, created_at FROM posts 
     WHERE status = 'published' 
     ORDER BY created_at DESC 
     LIMIT 5`
  );

  const fileType = file.file_type || 'other';
  const fileIcon = FILE_ICONS[fileType] || '📎';
  const fileTypeName = FILE_NAMES[fileType] || 'Resource Asset';
  const sizeStr = isAttachment ? formatSize(file.file_size) : file.file_size;
  const uploadDate = file.uploaded_at || file.created_at;

  return (
    <div className="relative" style={{ minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="glow-bg"></div>
      <div className="noise-overlay"></div>

      <div className="app-container">
        <Header />

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '48px',
          padding: '60px 0 100px',
          textAlign: 'left'
        }}>
          {/* Main area */}
          <main style={{ minWidth: 0 }}>
            {/* Breadcrumb */}
            <div style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--muted)' }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
              <span style={{ margin: '0 8px' }}>/</span>
              <span>Download Center</span>
            </div>

            {/* Download Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              backdropFilter: 'blur(8px)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '90px',
                height: '90px',
                background: 'rgba(139, 92, 246, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <span style={{ fontSize: '42px' }}>{fileIcon}</span>
              </div>

              <h1 style={{
                fontSize: '22px',
                fontWeight: '800',
                color: '#fff',
                lineHeight: '1.4',
                marginBottom: '16px',
                wordBreak: 'break-all'
              }}>
                {file.name}
              </h1>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                <span className="badge badge-blue">{fileTypeName}</span>
                <span className="badge badge-green" style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>{sizeStr}</span>
              </div>

              {/* Description */}
              {file.description && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'left',
                  marginBottom: '24px',
                  fontSize: '14px',
                  color: '#d4d4d8',
                  lineHeight: '1.6'
                }}>
                  <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>File Description:</strong>
                  <p style={{ margin: 0 }}>{file.description}</p>
                </div>
              )}

              {/* Attachment Context */}
              {isAttachment && file.post_title && (
                <div style={{
                  background: 'rgba(139, 92, 246, 0.04)',
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  textAlign: 'left',
                  marginBottom: '24px',
                  fontSize: '13.5px',
                  color: '#c084fc'
                }}>
                  <span>📌 Attached to Changelog update: </span>
                  <Link href={`/posts/${file.post_slug}`} style={{ color: '#fff', fontWeight: '600', textDecoration: 'underline' }}>
                    {file.post_title}
                  </Link>
                </div>
              )}

              {/* Meta Table */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                margin: '12px 0 32px',
                fontSize: '13.5px',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)'
              }}>
                <tbody>
                  <tr style={{ borderBottom: '1px dashed var(--border)' }}>
                    <td style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted)' }}>Uploaded Date</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#fff', fontWeight: '500' }}>
                      {uploadDate ? new Date(uploadDate).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted)' }}>Downloads Count</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#34d399', fontWeight: '700' }}>
                      {(file.downloads || 0).toLocaleString()} times
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: '16px' }}>
                <a
                  href={`/api/download/${id}?token=${token}&expires=${expires}`}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 40px',
                    fontSize: '15px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    borderRadius: '100px',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
                  }}
                >
                  Download File
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </a>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: '10px' }}>
                  Secure, verified link valid for 5 minutes. Max 3 downloads.
                </span>
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Latest Updates
              </h3>
              
              {latestUpdates.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>No updates published.</div>
              ) : (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', margin: 0, padding: 0 }}>
                  {latestUpdates.map(u => (
                    <li key={u.id}>
                      <Link href={`/posts/${u.slug}`} style={{ fontSize: '13.5px', color: '#f3f4f6', textDecoration: 'none', display: 'block', fontWeight: '600' }} className="recent-update-link">
                        {u.title}
                      </Link>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>

        <Footer />
      </div>
    </div>
  );
}
