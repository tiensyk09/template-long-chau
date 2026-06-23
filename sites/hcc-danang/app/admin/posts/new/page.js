'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import AdminShell from '../../../../components/admin/AdminShell';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MAX_SIZE_MB = 200;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const FILE_ICONS = {
  image:'🖼️', video:'🎬', pdf:'📕', word:'📘', excel:'📊',
  powerpoint:'📙', archive:'📦', audio:'🎵', text:'📄', other:'📎'
};

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 ** 2) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 ** 3) return (bytes / 1024 ** 2).toFixed(1) + ' MB';
  return (bytes / 1024 ** 3).toFixed(2) + ' GB';
}

function convertToWebP(file, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = ev => resolve(ev.target.result);
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1920;
        let width = img.width;
        let height = img.height;
        if (width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        resolve(webpDataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = event.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function renameToWebp(filename) {
  if (filename.toLowerCase().endsWith('.svg')) return filename;
  const dotIdx = filename.lastIndexOf('.');
  const baseName = dotIdx !== -1 ? filename.substring(0, dotIdx) : filename;
  return baseName + '.webp';
}

export default function NewPostPage() {
  return <PostEditor isNew={true} />;
}

export function PostEditor({ isNew = true, postId = null }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imgPreview, setImgPreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showHtml, setShowHtml] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragOver, setDragOver] = useState(false);

  const imgRef = useRef(null);
  const attachRef = useRef(null);
  const editorRef = useRef(null);

  const [form, setForm] = useState({
    title: '', summary: '', content: '',
    category_id: '', category_name: '', tags: '', image: '',
    author: 'Trường TH Ngô Quyền', status: 'draft', featured: false,
  });

  useEffect(() => {
    let active = true;
    async function init() {
      // 1. loadCategories
      const catRes = await fetch('/api/categories');
      if (catRes.ok && active) {
        const d = await catRes.json();
        setCategories(d.categories);
      }
      
      // 2. loadPost & loadAttachments
      if (!isNew && postId && active) {
        const postRes = await fetch(`/api/posts/${postId}`);
        if (postRes.ok && active) {
          const { post: p } = await postRes.json();
          setForm({
            title: p.title || '', summary: p.summary || '', content: p.content || '',
            category_id: p.category_id || '', category_name: p.category_name || '',
            tags: p.tags || '',
            image: p.image || '', author: p.author || 'Trường TH Ngô Quyền',
            status: p.status || 'draft', featured: !!p.featured,
          });
          if (p.image) setImgPreview(p.image);
          setTimeout(() => {
            if (editorRef.current) editorRef.current.innerHTML = p.content || '';
          }, 100);
        }
        
        const attachRes = await fetch(`/api/attachments?post_id=${postId}`);
        if (attachRes.ok && active) {
          const d = await attachRes.json();
          setAttachments(d.attachments || []);
        }
      }
    }
    init();
    return () => { active = false; };
  }, [isNew, postId]);

  function handleCategoryChange(e) {
    const catId = e.target.value;
    const cat = categories.find(c => c.id === catId);
    setForm({ ...form, category_id: catId, category_name: cat?.name || '' });
  }

  // execCommand-based toolbar — hoạt động với contenteditable
  function execCmd(cmd, value = null) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    syncContent();
  }

  function insertHTML(html) {
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, html);
    syncContent();
  }

  function insertTag(tag) {
    const map = {
      b: () => execCmd('bold'),
      i: () => execCmd('italic'),
      u: () => execCmd('underline'),
      h2: () => execCmd('formatBlock', 'h2'),
      h3: () => execCmd('formatBlock', 'h3'),
      p:  () => execCmd('formatBlock', 'p'),
      ul: () => execCmd('insertUnorderedList'),
      ol: () => execCmd('insertOrderedList'),
      a:  () => {
        const href = prompt('Nhập URL liên kết:');
        if (href) execCmd('createLink', href);
      },
      img: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            setError('');
            const dataUrl = await convertToWebP(file);
            const filename = renameToWebp(file.name);
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dataUrl, filename }),
            });
            const data = await res.json();
            if (res.ok) {
              insertHTML(`<img src="${data.url}" alt="${file.name}" style="max-width:100%;border-radius:8px;margin:8px 0" />`);
            } else {
              setError('Lỗi tải ảnh lên: ' + (data.error || 'Upload error'));
            }
          } catch (err) {
            setError('Lỗi kết nối upload ảnh: ' + err.message);
          }
        };
        input.click();
      },
      table: () => insertHTML(`<table border="1" style="border-collapse:collapse;width:100%;margin:8px 0"><tr><th style="padding:6px 12px">À 1</th><th style="padding:6px 12px">À 2</th></tr><tr><td style="padding:6px 12px">Nội dung</td><td style="padding:6px 12px">Nội dung</td></tr></table>`),
      hr:  () => insertHTML('<hr />'),
      br:  () => insertHTML('<br />'),
    };
    map[tag]?.();
  }

  // Đồng bộ innerHTML vào form.content
  function syncContent() {
    if (editorRef.current) {
      setForm(prev => ({ ...prev, content: editorRef.current.innerHTML }));
    }
  }

  // Xử lý paste — giữ HTML và ảnh từ clipboard
  function handlePaste(e) {
    const clipData = e.clipboardData;

    // Ư u tiên: paste ảnh từ clipboard (screenshot, copy ảnh)
    const imageItem = Array.from(clipData.items || []).find(item => item.type.startsWith('image/'));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      const reader = new FileReader();
      reader.onload = ev => {
        insertHTML(`<img src="${ev.target.result}" alt="Ảnh dán" style="max-width:100%;border-radius:8px;margin:8px 0" />`);
      };
      reader.readAsDataURL(file);
      return;
    }

    // Nếu có HTML (copy từ web) — giữ nguyên HTML gồm cả <img>
    if (clipData.types.includes('text/html')) {
      e.preventDefault();
      let html = clipData.getData('text/html');
      // Lấy nội dung trong body nếu có wrapper
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) html = bodyMatch[1];
      // Xóa style, script, meta ngoại lệ
      html = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                 .replace(/<style[\s\S]*?<\/style>/gi, '')
                 .replace(/<!--[\s\S]*?-->/g, '')
                 .replace(/\sclass="[^"]*"/gi, '')
                 .replace(/\sid="[^"]*"/gi, '');
      document.execCommand('insertHTML', false, html);
      syncContent();
      return;
    }

    // Fallback: plain text
    e.preventDefault();
    const text = clipData.getData('text/plain');
    document.execCommand('insertText', false, text);
    syncContent();
  }

  // Image upload
  async function handleImgFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('Ảnh đại diện tối đa 10MB'); return; }

    // Upload lên server để lấy URL thật
    try {
      const dataUrl = await convertToWebP(file);
      const filename = renameToWebp(file.name);
      setImgPreview(dataUrl);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, filename }),
      });
      const data = await res.json();
      if (res.ok) {
        // Lưu URL file thật (không phải base64)
        setForm(prev => ({ ...prev, image: data.url }));
        setImgPreview(data.url);
      } else {
        // Fallback: lưu base64 nếu upload lỗi
        setForm(prev => ({ ...prev, image: dataUrl }));
        setError('Cảnh báo: ' + (data.error || 'Upload lỗi, dùng base64'));
      }
    } catch (err) {
      setError('Lỗi upload ảnh: ' + err.message);
    }
  }

  // File attachment upload
  const processFiles = useCallback(async (files) => {
    const fileList = Array.from(files);
    const oversized = fileList.filter(f => f.size > MAX_SIZE_BYTES);
    if (oversized.length > 0) {
      setError(`File quá lớn: ${oversized.map(f => `${f.name} (${formatSize(f.size)})`).join(', ')} — Giới hạn ${MAX_SIZE_MB}MB`);
      return;
    }
    setError('');
    setUploading(true);

    for (const file of fileList) {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      const reader = new FileReader();
      const dataUrl = await new Promise(resolve => {
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
      setUploadProgress(prev => ({ ...prev, [file.name]: 80 }));

      try {
        const res = await fetch('/api/attachments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            url: dataUrl,
            post_id: postId || null,
            file_size_bytes: file.size,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setAttachments(prev => [data.attachment, ...prev]);
          setUploadProgress(prev => { const next = { ...prev }; delete next[file.name]; return next; });
        } else {
          setError(data.error || 'Upload thất bại');
          setUploadProgress(prev => { const next = { ...prev }; delete next[file.name]; return next; });
        }
      } catch (err) {
        setError('Lỗi upload: ' + err.message);
        setUploadProgress(prev => { const next = { ...prev }; delete next[file.name]; return next; });
      }
    }
    setUploading(false);
  }, [postId]);

  function handleAttachFiles(e) { processFiles(e.target.files); }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    processFiles(e.dataTransfer.files);
  }

  async function removeAttachment(id) {
    await fetch(`/api/attachments/${id}`, { method: 'DELETE' });
    setAttachments(prev => prev.filter(a => a.id !== id));
  }

  async function handleSave(status) {
    if (!form.title.trim()) { setError('Vui lòng nhập tiêu đề'); return; }
    setSaving(true); setError('');
    try {
      const url = isNew ? '/api/posts' : `/api/posts/${postId}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Lỗi lưu bài'); return; }

      // Link pending attachments to the new post
      if (isNew && attachments.length > 0) {
        const newPostId = data.post?.id;
        if (newPostId) {
          await Promise.all(attachments.map(a =>
            fetch(`/api/attachments/${a.id}`, {
              method: 'PATCH', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ post_id: newPostId }),
            })
          ));
        }
      }

      setSuccess(status === 'published' ? '✅ Đã xuất bản bài viết!' : '✅ Đã lưu bản nháp!');
      if (isNew) setTimeout(() => router.push('/admin/posts'), 1200);
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  const TOOLBAR = [
    {tag:'b',label:'B',title:'Đậm',style:{fontWeight:700}},
    {tag:'i',label:'I',title:'Nghiêng',style:{fontStyle:'italic'}},
    {tag:'u',label:'U',title:'Gạch chân',style:{textDecoration:'underline'}},
    null, // separator
    {tag:'h2',label:'H2',title:'Tiêu đề lớn'},
    {tag:'h3',label:'H3',title:'Tiêu đề nhỏ'},
    {tag:'p',label:'¶',title:'Đoạn văn'},
    null,
    {tag:'ul',label:'• —',title:'Danh sách chấm'},
    {tag:'ol',label:'1. —',title:'Danh sách số'},
    {tag:'table',label:'⊞',title:'Bảng'},
    null,
    {tag:'a',label:'🔗',title:'Liên kết'},
    {tag:'img',label:'🖼',title:'Chèn ảnh'},
    {tag:'hr',label:'─',title:'Đường kẻ ngang'},
    {tag:'br',label:'↵',title:'Xuống dòng'},
  ];

  const pendingUploads = Object.entries(uploadProgress);
  const totalAttachSize = attachments.reduce((s, a) => s + (a.file_size || 0), 0);

  return (
    <AdminShell title={isNew ? 'Viết bài mới' : 'Chỉnh sửa bài viết'}>
      <div className="post-editor-layout">
        {/* ─── MAIN COLUMN ─── */}
        <div className="post-editor-main">
          {error && <div className="adm-alert adm-alert-error">⚠️ {error}</div>}
          {success && <div className="adm-alert adm-alert-success">{success}</div>}

          {/* Tiêu đề + Tóm tắt */}
          <div className="adm-card">
            <div className="adm-card-body" style={{display:'flex',flexDirection:'column',gap:12}}>
              <div className="adm-form-group" style={{marginBottom:0}}>
                <input
                  className="adm-input post-title-input"
                  type="text"
                  placeholder="Nhập tiêu đề bài viết..."
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="adm-form-group" style={{marginBottom:0}}>
                <textarea
                  className="adm-input adm-textarea"
                  style={{minHeight:64,fontSize:13,resize:'vertical'}}
                  placeholder="Tóm tắt ngắn về bài viết (hiện trên trang chủ)..."
                  value={form.summary}
                  onChange={e => setForm({ ...form, summary: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Nội dung */}
          <div className="adm-card">
            <div className="adm-card-header" style={{padding:'10px 16px'}}>
              <div className="adm-card-title" style={{fontSize:13}}>📝 Nội dung bài viết</div>
              <button
                type="button"
                className={`btn btn-sm ${showPreview ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowPreview(v => !v)}
              >
                {showPreview ? '✏️ Soạn thảo' : '👁️ Xem trước'}
              </button>
            </div>

            {!showPreview ? (
              <div style={{padding:'0 0 0'}}>
                {/* Toolbar */}
                <div className="editor-toolbar" style={{borderTop:'none',borderBottom:'1px solid var(--adm-border)',flexWrap:'wrap'}}>
                  {TOOLBAR.map((t, i) =>
                    t === null
                      ? <span key={`sep-${i}`} style={{width:1,height:20,background:'#e2e8f0',margin:'0 2px'}} />
                      : (
                        <button key={t.tag} type="button" className="editor-btn"
                          title={t.title} style={t.style}
                          onMouseDown={e => { e.preventDefault(); insertTag(t.tag); }}>
                          {t.label}
                        </button>
                      )
                  )}
                  <span style={{flex:1}} />
                  {/* Toggle HTML source */}
                  <button type="button" className="editor-btn" title="Xem HTML"
                    style={{fontSize:10,padding:'2px 6px',background: showHtml ? '#e2e8f0' : 'transparent'}}
                    onMouseDown={e => {
                      e.preventDefault();
                      if (!showHtml && editorRef.current) {
                        setShowHtml(true);
                      } else {
                        setShowHtml(false);
                        setTimeout(() => {
                          if (editorRef.current) editorRef.current.innerHTML = form.content;
                        }, 0);
                      }
                    }}>
                    &lt;/&gt; HTML
                  </button>
                </div>

                {/* HTML source textarea */}
                {showHtml && (
                  <textarea
                    className="editor-textarea"
                    style={{minHeight:320,borderTop:'none',borderRadius:0,fontFamily:'monospace',fontSize:12}}
                    value={form.content}
                    onChange={e => {
                      setForm({ ...form, content: e.target.value });
                    }}
                  />
                )}

                {/* Contenteditable WYSIWYG */}
                {!showHtml && (
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="editor-content"
                    onInput={syncContent}
                    onPaste={handlePaste}
                    onBlur={syncContent}
                    data-placeholder="Bắt đầu viết nội dung hoặc dán (Ctrl+V) từ nguồn khác..."
                    style={{
                      minHeight:340,
                      padding:'14px 16px',
                      lineHeight:1.8,
                      outline:'none',
                      borderRadius:'0 0 8px 8px',
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="adm-card-body"
                style={{minHeight:200,lineHeight:1.8,color:'#374151'}}
                dangerouslySetInnerHTML={{ __html: form.content || '<p style="color:#9ca3af">Chưa có nội dung...</p>' }}
              />
            )}
          </div>

          {/* File đính kèm */}
          <div className="adm-card">
            <div className="adm-card-header" style={{padding:'10px 16px'}}>
              <div className="adm-card-title" style={{fontSize:13}}>
                📎 Tệp đính kèm
                {attachments.length > 0 && (
                  <span className="badge badge-blue" style={{marginLeft:8}}>
                    {attachments.length} file · {formatSize(totalAttachSize)}
                  </span>
                )}
              </div>
              <button type="button" className="btn btn-secondary btn-sm"
                onClick={() => attachRef.current?.click()}>
                + Chọn file
              </button>
            </div>

            {/* Drop zone */}
            <div
              className={`attach-dropzone${dragOver ? ' dragover' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => attachRef.current?.click()}
            >
              <input ref={attachRef} type="file" multiple style={{display:'none'}} onChange={handleAttachFiles} />
              <div style={{textAlign:'center',padding:'18px 0',color:'#9ca3af',fontSize:13}}>
                <div style={{fontSize:28,marginBottom:4}}>📁</div>
                <div>Kéo thả file vào đây hoặc <span style={{color:'var(--adm-primary)',cursor:'pointer'}}>click để chọn</span></div>
                <div style={{fontSize:11,marginTop:4,color:'#cbd5e1'}}>Tất cả định dạng · Tối đa <strong>{MAX_SIZE_MB}MB</strong> / file</div>
              </div>
            </div>

            {/* Uploading progress */}
            {pendingUploads.length > 0 && (
              <div style={{padding:'8px 16px',display:'flex',flexDirection:'column',gap:6}}>
                {pendingUploads.map(([name, pct]) => (
                  <div key={name} style={{display:'flex',alignItems:'center',gap:10,fontSize:12}}>
                    <div style={{flex:1,background:'#f1f5f9',borderRadius:4,height:6}}>
                      <div style={{width:`${pct}%`,background:'var(--adm-primary)',borderRadius:4,height:'100%',transition:'width .3s'}} />
                    </div>
                    <span style={{color:'#6b7280',whiteSpace:'nowrap',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis'}}>{name}</span>
                    <span style={{color:'#9ca3af'}}>{pct}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Attached files list */}
            {attachments.length > 0 && (
              <div style={{borderTop:'1px solid var(--adm-border)'}}>
                {attachments.map(file => (
                  <div key={file.id} className="attach-item">
                    <span style={{fontSize:20,flexShrink:0}}>{FILE_ICONS[file.file_type] || '📎'}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {file.name}
                      </div>
                      <div style={{fontSize:11,color:'#9ca3af'}}>
                        {file.file_size_label} · {file.file_type?.toUpperCase()}
                      </div>
                    </div>
                    <div style={{display:'flex',gap:4,flexShrink:0}}>
                      <button type="button" className="btn btn-success btn-sm btn-icon" title="Chèn vào bài viết"
                        onClick={() => {
                          if (file.file_type === 'image') {
                            insertHTML(`<img src="${file.url}" alt="${file.name}" style="max-width:100%;border-radius:8px;margin:8px 0" />`);
                          } else {
                            insertHTML(`<a href="${file.url}" target="_blank" class="attachment-link" style="color:var(--adm-primary);text-decoration:underline">📎 ${file.name}</a>`);
                          }
                        }}>📥</button>
                      <a href={file.url} target="_blank" className="btn btn-secondary btn-sm btn-icon" title="Xem">👁️</a>
                      <button type="button" className="btn btn-danger btn-sm btn-icon" title="Xóa"
                        onClick={() => removeAttachment(file.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── SIDEBAR ─── */}
        <div className="post-editor-sidebar">
          {/* Xuất bản */}
          <div className="adm-card">
            <div className="adm-card-body" style={{display:'flex',flexDirection:'column',gap:8}}>
              <button className="btn btn-primary" onClick={() => handleSave('published')}
                disabled={saving} style={{width:'100%',justifyContent:'center'}}>
                {saving ? '⏳ Đang lưu...' : '🚀 Xuất bản ngay'}
              </button>
              <button className="btn btn-secondary" onClick={() => handleSave('draft')}
                disabled={saving} style={{width:'100%',justifyContent:'center'}}>
                💾 Lưu nháp
              </button>
              <Link href="/admin/posts" className="btn btn-secondary"
                style={{width:'100%',justifyContent:'center',textDecoration:'none'}}>
                ← Quay lại
              </Link>
            </div>
          </div>

          {/* Danh mục */}
          <div className="adm-card">
            <div className="adm-card-header" style={{padding:'10px 16px'}}>
              <div className="adm-card-title" style={{fontSize:13}}>🗂️ Danh mục</div>
            </div>
            <div className="adm-card-body" style={{paddingTop:8}}>
              <select className="adm-input adm-select" value={form.category_id} onChange={handleCategoryChange}>
                <option value="">— Chọn danh mục —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Ảnh đại diện */}
          <div className="adm-card">
            <div className="adm-card-header" style={{padding:'10px 16px'}}>
              <div className="adm-card-title" style={{fontSize:13}}>🖼️ Ảnh đại diện</div>
            </div>
            <div className="adm-card-body" style={{paddingTop:8,display:'flex',flexDirection:'column',gap:8}}>
              {imgPreview ? (
                <div className="img-preview" style={{margin:0}}>
                  <img src={imgPreview} alt="Preview" onError={() => setImgPreview('')} />
                  <button className="img-preview-remove"
                    onClick={() => { setImgPreview(''); setForm({ ...form, image: '' }); }}>×</button>
                </div>
              ) : (
                <div className="img-upload-zone" onClick={() => imgRef.current?.click()}
                  style={{padding:'16px 12px'}}>
                  <div style={{textAlign:'center',color:'#9ca3af',fontSize:12}}>
                    <div style={{fontSize:24}}>📷</div>
                    <div>Click để chọn ảnh</div>
                    <div style={{fontSize:10,marginTop:2}}>JPG, PNG, WebP — tối đa 5MB</div>
                  </div>
                </div>
              )}
              <input ref={imgRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImgFile} />
              <input className="adm-input" type="text" placeholder="Hoặc dán URL ảnh..."
                style={{fontSize:12}} value={form.image}
                onChange={e => { setForm({ ...form, image: e.target.value }); setImgPreview(e.target.value); }} />
            </div>
          </div>

          {/* Thẻ (Tags) */}
          <div className="adm-card">
            <div className="adm-card-header" style={{padding:'10px 16px'}}>
              <div className="adm-card-title" style={{fontSize:13}}>🏷️ Thẻ (Tags)</div>
            </div>
            <div className="adm-card-body" style={{paddingTop:8,display:'flex',flexDirection:'column',gap:8}}>
              <input
                className="adm-input"
                type="text"
                placeholder="Ví dụ: tin-tuc, giao-duc..."
                style={{fontSize:12}}
                value={form.tags || ''}
                onChange={e => setForm({ ...form, tags: e.target.value })}
              />
              <span style={{fontSize:11,color:'#9ca3af'}}>Phân tách các thẻ bằng dấu phẩy (,)</span>
            </div>
          </div>

          {/* Cài đặt */}
          <div className="adm-card">
            <div className="adm-card-header" style={{padding:'10px 16px'}}>
              <div className="adm-card-title" style={{fontSize:13}}>⚙️ Cài đặt</div>
            </div>
            <div className="adm-card-body" style={{paddingTop:8,display:'flex',flexDirection:'column',gap:10}}>
              <div className="adm-form-group" style={{marginBottom:0}}>
                <label className="adm-label" style={{fontSize:12}}>Tác giả</label>
                <input className="adm-input" style={{fontSize:13}} value={form.author}
                  onChange={e => setForm({ ...form, author: e.target.value })} />
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10,justifyContent:'space-between'}}>
                <span style={{fontSize:13,color:'#374151',fontWeight:500}}>⭐ Bài nổi bật</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={form.featured}
                    onChange={e => setForm({ ...form, featured: e.target.checked })} />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .post-editor-layout {
          display: grid;
          grid-template-columns: 1fr 270px;
          gap: 16px;
          align-items: flex-start;
        }
        .post-editor-main { display: flex; flex-direction: column; gap: 14px; }
        .post-editor-sidebar { display: flex; flex-direction: column; gap: 12px; }
        .post-title-input { font-size: 17px !important; font-weight: 700 !important; }
        .attach-dropzone {
          margin: 0 16px 10px;
          border: 2px dashed var(--adm-border);
          border-radius: 8px;
          cursor: pointer;
          transition: all .2s;
        }
        .attach-dropzone:hover, .attach-dropzone.dragover {
          border-color: var(--adm-primary);
          background: rgba(192,0,26,0.03);
        }
        .attach-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px;
          border-top: 1px solid var(--adm-border);
          transition: background .15s;
        }
        .attach-item:hover { background: var(--adm-hover); }
        @media (max-width: 768px) {
          .post-editor-layout { grid-template-columns: 1fr; }
          .post-editor-sidebar { order: -1; }
        }
      `}</style>
    </AdminShell>
  );
}
