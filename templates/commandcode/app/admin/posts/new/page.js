'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import '@/app/admin/admin.css';

const MAX_SIZE_MB = 100;
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

function convertToWebP(file, maxW = 1920, quality = 0.85) {
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
  const [loading, setLoading] = useState(!isNew);

  const imgRef = useRef(null);
  const attachRef = useRef(null);
  const editorRef = useRef(null);

  const [form, setForm] = useState({
    title: '', summary: '', content: '', image: '',
    status: 'draft', meta_title: '', meta_description: '', meta_keywords: ''
  });

  useEffect(() => {
    let active = true;
    async function init() {
      if (!isNew && postId && active) {
        setLoading(true);
        const postRes = await fetch(`/api/posts/${postId}`);
        if (postRes.ok && active) {
          const data = await postRes.json();
          const p = data.post;
          setForm({
            title: p.title || '', summary: p.summary || '', content: p.content || '',
            image: p.image || '', status: p.status || 'draft',
            meta_title: p.meta_title || '', meta_description: p.meta_description || '', meta_keywords: p.meta_keywords || ''
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
        setLoading(false);
      }
    }
    init();
    return () => { active = false; };
  }, [isNew, postId]);

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
        const href = prompt('Enter link URL:');
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
              setError('Failed to upload image: ' + (data.error || 'Upload error'));
            }
          } catch (err) {
            setError('Upload connection failed: ' + err.message);
          }
        };
        input.click();
      },
      table: () => insertHTML(`<table border="1" style="border-collapse:collapse;width:100%;margin:8px 0"><tr><th style="padding:6px 12px">Header 1</th><th style="padding:6px 12px">Header 2</th></tr><tr><td style="padding:6px 12px">Data 1</td><td style="padding:6px 12px">Data 2</td></tr></table>`),
      hr:  () => insertHTML('<hr />'),
      br:  () => insertHTML('<br />'),
    };
    map[tag]?.();
  }

  function syncContent() {
    if (editorRef.current) {
      setForm(prev => ({ ...prev, content: editorRef.current.innerHTML }));
    }
  }

  function handlePaste(e) {
    const clipData = e.clipboardData;

    const imageItem = Array.from(clipData.items || []).find(item => item.type.startsWith('image/'));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const dataUrl = await convertToWebP(file);
          const filename = `clipboard_${Date.now()}.webp`;
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUrl, filename }),
          });
          const data = await res.json();
          if (res.ok) {
            insertHTML(`<img src="${data.url}" alt="Pasted Image" style="max-width:100%;border-radius:8px;margin:8px 0" />`);
          } else {
            insertHTML(`<img src="${dataUrl}" alt="Pasted Image" style="max-width:100%;border-radius:8px;margin:8px 0" />`);
          }
        } catch {
          insertHTML(`<img src="${ev.target.result}" alt="Pasted Image" style="max-width:100%;border-radius:8px;margin:8px 0" />`);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    if (clipData.types.includes('text/html')) {
      e.preventDefault();
      let html = clipData.getData('text/html');
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) html = bodyMatch[1];
      html = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                 .replace(/<style[\s\S]*?<\/style>/gi, '')
                 .replace(/<!--[\s\S]*?-->/g, '')
                 .replace(/\sclass="[^"]*"/gi, '')
                 .replace(/\sid="[^"]*"/gi, '');
      document.execCommand('insertHTML', false, html);
      syncContent();
      return;
    }

    e.preventDefault();
    const text = clipData.getData('text/plain');
    document.execCommand('insertText', false, text);
    syncContent();
  }

  async function handleImgFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('Featured image size must be under 10MB'); return; }

    try {
      const dataUrl = await convertToWebP(file, 1920, 0.85);
      const thumbDataUrl = await convertToWebP(file, 400, 0.8);
      const filename = renameToWebp(file.name);
      setImgPreview(dataUrl);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, filename, thumbDataUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm(prev => ({ ...prev, image: data.url }));
        setImgPreview(data.url);
      } else {
        setForm(prev => ({ ...prev, image: dataUrl }));
        setError('Warning: ' + (data.error || 'Server error, using base64 preview'));
      }
    } catch (err) {
      setError('Featured image upload failed: ' + err.message);
    }
  }

  const processFiles = useCallback(async (files) => {
    const fileList = Array.from(files);
    const oversized = fileList.filter(f => f.size > MAX_SIZE_BYTES);
    if (oversized.length > 0) {
      setError(`Files too large: ${oversized.map(f => `${f.name} (${formatSize(f.size)})`).join(', ')} — Max Limit ${MAX_SIZE_MB}MB`);
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
          setError(data.error || 'Upload failed');
          setUploadProgress(prev => { const next = { ...prev }; delete next[file.name]; return next; });
        }
      } catch (err) {
        setError('Upload failed: ' + err.message);
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
    if (!form.title.trim()) { setError('Please enter a post title'); return; }
    setSaving(true); setError('');
    try {
      const url = isNew ? '/api/posts' : `/api/posts/${postId}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save post'); return; }

      // Link attachments to newly created post
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

      setSuccess(status === 'published' ? '🚀 Post published successfully!' : '💾 Draft saved successfully!');
      if (isNew) setTimeout(() => router.push('/admin/posts'), 1200);
    } catch (err) {
      setError('Connection failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  const TOOLBAR = [
    {tag:'b',label:'B',title:'Bold',style:{fontWeight:700}},
    {tag:'i',label:'I',title:'Italic',style:{fontStyle:'italic'}},
    {tag:'u',label:'U',title:'Underline',style:{textDecoration:'underline'}},
    null,
    {tag:'h2',label:'H2',title:'Heading 2'},
    {tag:'h3',label:'H3',title:'Heading 3'},
    {tag:'p',label:'¶',title:'Paragraph'},
    null,
    {tag:'ul',label:'• —',title:'Unordered List'},
    {tag:'ol',label:'1. —',title:'Ordered List'},
    {tag:'table',label:'⊞',title:'Table'},
    null,
    {tag:'a',label:'🔗',title:'Link'},
    {tag:'img',label:'🖼',title:'Insert Image'},
    {tag:'hr',label:'─',title:'Horizontal Line'},
    {tag:'br',label:'↵',title:'Line Break'},
  ];

  const pendingUploads = Object.entries(uploadProgress);

  if (loading) {
    return (
      <AdminShell title="Loading post editor...">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(139, 92, 246, 0.2)', borderTopColor: 'var(--admin-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title={isNew ? 'Write New Changelog' : 'Edit Changelog Post'}>
      <div className="post-editor-layout">
        {/* ─── MAIN COLUMN ─── */}
        <div className="post-editor-main">
          {error && <div className="adm-alert adm-alert-error">⚠️ {error}</div>}
          {success && <div className="adm-alert adm-alert-success">{success}</div>}

          {/* Title & Summary */}
          <div className="adm-card">
            <div className="adm-card-body" style={{display:'flex',flexDirection:'column',gap:12, padding: 20}}>
              <div className="adm-form-group" style={{marginBottom:0}}>
                <label className="adm-label">Title *</label>
                <input
                  className="adm-input post-title-input"
                  type="text"
                  placeholder="Enter update title..."
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="adm-form-group" style={{marginBottom:0}}>
                <label className="adm-label">Short Summary</label>
                <textarea
                  className="adm-input adm-textarea"
                  style={{minHeight:64,fontSize:13,resize:'vertical'}}
                  placeholder="Enter a brief summary..."
                  value={form.summary}
                  onChange={e => setForm({ ...form, summary: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="adm-card">
            <div className="adm-card-header" style={{padding:'12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div className="adm-card-title" style={{fontSize:13}}>📝 Changelog Body Content</div>
              <button
                type="button"
                className={`btn btn-sm ${showPreview ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowPreview(v => !v)}
              >
                {showPreview ? '✏️ Edit Mode' : '👁️ Preview'}
              </button>
            </div>

            {!showPreview ? (
              <div style={{padding:'0 0 0'}}>
                {/* Editor Toolbar */}
                <div className="editor-toolbar" style={{borderTop:'none',borderBottom:'1px solid var(--admin-border)',flexWrap:'wrap'}}>
                  {TOOLBAR.map((t, i) =>
                    t === null
                      ? <span key={`sep-${i}`} style={{width:1,height:20,background:'var(--admin-border)',margin:'0 4px'}} />
                      : (
                        <button key={t.tag} type="button" className="editor-btn"
                          title={t.title} style={t.style}
                          onMouseDown={e => { e.preventDefault(); insertTag(t.tag); }}>
                          {t.label}
                        </button>
                      )
                  )}
                  <span style={{flex:1}} />
                  {/* HTML Source Toggle */}
                  <button type="button" className="editor-btn" title="View Source Code"
                    style={{fontSize:10,width:'auto',padding:'2px 8px',background: showHtml ? 'var(--admin-primary)' : 'transparent'}}
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
                    &lt;/&gt; HTML Source
                  </button>
                </div>

                {/* Plain Text Source Mode */}
                {showHtml && (
                  <textarea
                    className="editor-textarea"
                    style={{minHeight:340,borderTop:'none',borderRadius:0}}
                    value={form.content}
                    onChange={Sync => {
                      setForm({ ...form, content: Sync.target.value });
                    }}
                  />
                )}

                {/* WYSIWYG Content Editable Area */}
                {!showHtml && (
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="editor-content"
                    onInput={syncContent}
                    onPaste={handlePaste}
                    onBlur={syncContent}
                    data-placeholder="Start writing changelog body. Screenshots/Images can be pasted directly (Ctrl+V)..."
                    style={{
                      minHeight:340,
                      padding:'16px',
                      lineHeight:1.8,
                      outline:'none',
                      borderRadius:'0 0 8px 8px',
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="adm-card-body"
                style={{minHeight:200,lineHeight:1.8,color:'var(--admin-text)', padding: 20}}
                dangerouslySetInnerHTML={{ __html: form.content || '<p style="color:var(--admin-muted)">No content written yet...</p>' }}
              />
            )}
          </div>

          {/* SEO Options */}
          <div className="adm-card" style={{ padding: 20 }}>
            <h4 style={{ fontSize: '14px', color: '#fff', marginBottom: '12px', fontWeight: '700' }}>🔍 Post SEO Configuration</h4>
            
            <div className="adm-form-group">
              <label className="adm-label">Meta Title</label>
              <input
                type="text"
                className="adm-input"
                placeholder="Custom metadata browser tab title..."
                value={form.meta_title}
                onChange={e => setForm({ ...form, meta_title: e.target.value })}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Meta Description</label>
              <textarea
                className="adm-textarea"
                rows={3}
                placeholder="Google index snippet snippet description..."
                value={form.meta_description}
                onChange={e => setForm({ ...form, meta_description: e.target.value })}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Meta Keywords</label>
              <input
                type="text"
                className="adm-input"
                placeholder="Comma separated search keywords..."
                value={form.meta_keywords}
                onChange={e => setForm({ ...form, meta_keywords: e.target.value })}
              />
            </div>
          </div>

          {/* Post Attachments */}
          <div className="adm-card">
            <div className="adm-card-header" style={{padding:'12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div className="adm-card-title" style={{fontSize:13}}>
                📎 Linked Attachments ({attachments.length})
              </div>
              <button type="button" className="btn btn-secondary btn-sm"
                onClick={() => attachRef.current?.click()}>
                + Add Attachment File
              </button>
            </div>

            <div
              className={`attach-dropzone${dragOver ? ' dragover' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => attachRef.current?.click()}
              style={{ padding: '20px 0', border: '1px dashed var(--admin-border)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', margin: '14px' }}
            >
              <input ref={attachRef} type="file" multiple style={{display:'none'}} onChange={handleAttachFiles} />
              <div style={{color:'var(--admin-muted)',fontSize:13}}>
                <div style={{fontSize:28,marginBottom:4}}>📁</div>
                <div>Drag & drop asset files here or <span style={{color:'var(--admin-primary)',cursor:'pointer'}}>click to browse</span></div>
                <div style={{fontSize:11,marginTop:4}}>Max limit: <strong>{MAX_SIZE_MB}MB</strong> per file</div>
              </div>
            </div>

            {pendingUploads.length > 0 && (
              <div style={{padding:'8px 20px',display:'flex',flexDirection:'column',gap:6}}>
                {pendingUploads.map(([name, pct]) => (
                  <div key={name} style={{display:'flex',alignItems:'center',gap:10,fontSize:12}}>
                    <div style={{flex:1,background:'rgba(255,255,255,0.05)',borderRadius:4,height:6}}>
                      <div style={{width:`${pct}%`,background:'var(--admin-primary)',borderRadius:4,height:'100%',transition:'width .3s'}} />
                    </div>
                    <span style={{color:'var(--admin-muted)',whiteSpace:'nowrap',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis'}}>{name}</span>
                    <span style={{color:'var(--admin-muted)'}}>{pct}%</span>
                  </div>
                ))}
              </div>
            )}

            {attachments.length > 0 && (
              <div style={{borderTop:'1px solid var(--admin-border)'}}>
                {attachments.map(file => (
                  <div key={file.id} className="attach-item">
                    <span style={{fontSize:20,flexShrink:0}}>{FILE_ICONS[file.file_type] || '📎'}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap', color: 'var(--admin-text)'}}>
                        {file.name}
                      </div>
                      <div style={{fontSize:11,color:'var(--admin-muted)'}}>
                        {file.file_size_label} · {file.file_type?.toUpperCase()}
                      </div>
                    </div>
                    <div style={{display:'flex',gap:4,flexShrink:0}}>
                      <button type="button" className="btn btn-secondary btn-sm btn-icon" title="Insert download link into editor body"
                        onClick={() => {
                          if (file.file_type === 'image') {
                            insertHTML(`<img src="${file.url}" alt="${file.name}" style="max-width:100%;border-radius:8px;margin:8px 0" />`);
                          } else {
                            insertHTML(`<a href="${file.url}" target="_blank" style="color:var(--admin-primary);text-decoration:underline">📎 ${file.name}</a>`);
                          }
                          showMsg('success', 'Inserted asset tag to post content');
                        }}>📥 Insert</button>
                      <a href={file.url} target="_blank" className="btn btn-secondary btn-sm btn-icon" title="View File">👁️</a>
                      <button type="button" className="btn btn-danger btn-sm btn-icon" title="Delete"
                        onClick={() => removeAttachment(file.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── SIDEBAR COLUMN ─── */}
        <div className="post-editor-sidebar">
          {/* Action Actions Panel */}
          <div className="adm-card">
            <div className="adm-card-body" style={{display:'flex',flexDirection:'column',gap:8, padding: 20}}>
              <button className="btn btn-primary" onClick={() => handleSave('published')}
                disabled={saving} style={{width:'100%',justifyContent:'center'}}>
                {saving ? '⏳ Saving...' : '🚀 Publish Now'}
              </button>
              <button className="btn btn-secondary" onClick={() => handleSave('draft')}
                disabled={saving} style={{width:'100%',justifyContent:'center'}}>
                💾 Save as Draft
              </button>
              <Link href="/admin/posts" className="btn btn-secondary"
                style={{width:'100%',justifyContent:'center',textDecoration:'none', textAlign: 'center'}}>
                ← Cancel & Back
              </Link>
            </div>
          </div>

          {/* Featured Image Thumbnail Panel */}
          <div className="adm-card">
            <div className="adm-card-header" style={{padding:'12px 20px'}}>
              <div className="adm-card-title" style={{fontSize:13}}>🖼️ Featured Thumbnail Image</div>
            </div>
            <div className="adm-card-body" style={{padding: 20, display:'flex',flexDirection:'column',gap:8}}>
              {imgPreview ? (
                <div className="img-preview" style={{margin:0}}>
                  <img src={imgPreview} alt="Preview" onError={() => setImgPreview('')} />
                  <button className="img-preview-remove"
                    onClick={() => { setImgPreview(''); setForm({ ...form, image: '' }); }}>×</button>
                </div>
              ) : (
                <div className="img-upload-zone" onClick={() => imgRef.current?.click()}
                  style={{padding:'20px 12px'}}>
                  <div style={{textAlign:'center',color:'var(--admin-muted)',fontSize:12}}>
                    <div style={{fontSize:24}}>📷</div>
                    <div>Click to select image file</div>
                    <div style={{fontSize:10,marginTop:2}}>PNG, JPG, WebP — Max 10MB</div>
                  </div>
                </div>
              )}
              <input ref={imgRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImgFile} />
              <input className="adm-input" type="text" placeholder="Or paste absolute image URL..."
                style={{fontSize:12}} value={form.image}
                onChange={e => { setForm({ ...form, image: e.target.value }); setImgPreview(e.target.value); }} />
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
