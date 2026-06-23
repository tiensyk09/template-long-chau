'use client';
import { useState, useEffect } from 'react';

const BLOCK_TYPES = [
  { type: 'hero', label: '⚡ Hero Section', defaultConfigs: { title: 'New Hero Headline', description: 'Enter sub-headline text here...', buttonText: 'Get Started', buttonLink: '#' } },
  { type: 'terminal', label: '💻 Mock Terminal', defaultConfigs: { tag: '// stop patching AI slop', title: 'Coding agent that learns you', description: 'Code you don\'t fix. The best DX for coding with AI.', leftTitle: 'other-agents.log', rightTitle: 'command-code.log' } },
  { type: 'features', label: '⚙️ Features Grid', defaultConfigs: { tag: '// features', title: 'A title for features', description: 'Brief introduction...', items: [{ title: 'Feature 1', desc: 'Description of feature 1' }, { title: 'Feature 2', desc: 'Description of feature 2' }] } },
  { type: 'cta', label: '📢 Call to Action', defaultConfigs: { title: 'Ready to build?', buttonText: 'Sign Up', buttonLink: '/register' } },
  { type: 'faq', label: '❓ FAQ Accordion', defaultConfigs: { title: 'Questions, answered.', description: 'Common inquiries...', items: [{ q: 'Example Question?', a: 'Example Answer.' }] } },
  { type: 'signup', label: '📧 Newsletter Signup', defaultConfigs: { title: 'Join our updates list', description: 'Enter your email for announcements.' } },
  { type: 'posts', label: '📰 Recent Posts Feed', defaultConfigs: { title: 'What\'s new', limit: 3, layoutStyle: 'list' } },
  { type: 'pricing', label: '💎 Pricing Tiers', defaultConfigs: { title: 'Simple Pricing', plans: [{ name: 'Free', price: '$0', desc: 'For individuals' }, { name: 'Pro', price: '$19', desc: 'For teams' }] } },
  { type: 'testimonials', label: '💬 Testimonials Grid', defaultConfigs: { tag: '// community', title: 'Loved by engineers and founders', items: [{ quote: '“ Excellent tool, saved me days! ”', author: 'Jane Doe', title: 'CEO at Startup' }] } },
  { type: 'stats', label: '📊 Statistics Cards', defaultConfigs: { items: [{ val: '10x', lbl: 'Faster' }, { val: '2x', lbl: 'Cleaner' }] } },
  { type: 'html', label: '📝 Custom HTML / Text', defaultConfigs: { html: '<p style="color:#94a3b8;">Enter custom HTML or plain text here...</p>' } }
];

export default function PageBuilder({ initialBlocks = [], onSave, saving = false }) {
  const [blocks, setBlocks] = useState([]);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setBlocks(Array.isArray(initialBlocks) ? JSON.parse(JSON.stringify(initialBlocks)) : []);
  }, [initialBlocks]);

  const handleAddBlock = (typeObj) => {
    const newBlock = {
      id: 'b_' + Date.now(),
      type: typeObj.type,
      visible: true,
      configs: JSON.parse(JSON.stringify(typeObj.defaultConfigs))
    };
    setBlocks([...blocks, newBlock]);
    setExpandedId(newBlock.id);
  };

  const handleRemoveBlock = (id) => {
    if (confirm('Are you sure you want to remove this block?')) {
      setBlocks(blocks.filter(b => b.id !== id));
      if (expandedId === id) setExpandedId(null);
    }
  };

  const handleToggleVisibility = (id) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, visible: !b.visible } : b));
  };

  // --- HTML5 Drag & Drop ---
  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedIdx(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;

    const list = [...blocks];
    const draggedItem = list[draggedIdx];
    list.splice(draggedIdx, 1);
    list.splice(index, 0, draggedItem);

    setDraggedIdx(index);
    setBlocks(list);
  };

  // Move block fallback button
  const handleMove = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const list = [...blocks];
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setBlocks(list);
  };

  // --- Config update helpers ---
  const handleUpdateConfig = (id, field, value) => {
    setBlocks(blocks.map(b => {
      if (b.id === id) {
        return {
          ...b,
          configs: {
            ...b.configs,
            [field]: value
          }
        };
      }
      return b;
    }));
  };

  const handleUpdateItems = (id, index, itemField, value) => {
    setBlocks(blocks.map(b => {
      if (b.id === id) {
        const items = [...(b.configs.items || b.configs.plans || [])];
        items[index] = { ...items[index], [itemField]: value };
        const key = b.configs.items ? 'items' : 'plans';
        return {
          ...b,
          configs: {
            ...b.configs,
            [key]: items
          }
        };
      }
      return b;
    }));
  };

  const handleAddItem = (id, defaultObj) => {
    setBlocks(blocks.map(b => {
      if (b.id === id) {
        const key = b.configs.items ? 'items' : 'plans';
        const items = [...(b.configs[key] || [])];
        items.push(defaultObj);
        return { ...b, configs: { ...b.configs, [key]: items } };
      }
      return b;
    }));
  };

  const handleRemoveItem = (id, index) => {
    setBlocks(blocks.map(b => {
      if (b.id === id) {
        const key = b.configs.items ? 'items' : 'plans';
        const items = (b.configs[key] || []).filter((_, i) => i !== index);
        return { ...b, configs: { ...b.configs, [key]: items } };
      }
      return b;
    }));
  };

  return (
    <div className="builder-container">
      {/* Save panel */}
      <div className="builder-header-panel">
        <div className="builder-header-info">
          <h4>Page Layout Composer</h4>
          <p>Drag and drop blocks to design your custom landing page.</p>
        </div>
        <button
          onClick={() => onSave(blocks)}
          disabled={saving}
          className="btn btn-primary"
          style={{ minWidth: '120px' }}
        >
          {saving ? 'Saving...' : 'Save Layout'}
        </button>
      </div>

      <div className="builder-grid">
        {/* Available Blocks Palette */}
        <div className="builder-sidebar">
          <div className="builder-sidebar-title">// Add Blocks</div>
          {BLOCK_TYPES.map(typeObj => (
            <button
              key={typeObj.type}
              onClick={() => handleAddBlock(typeObj)}
              className="builder-palette-btn"
            >
              <span>{typeObj.label}</span>
              <span className="add-tag">+ Add</span>
            </button>
          ))}
        </div>

        {/* Current Blocks Layout (Canvas) */}
        <div className="builder-canvas">
          <div className="builder-canvas-title">// Layout Canvas</div>
          
          {blocks.length === 0 ? (
            <div className="builder-canvas-empty">
              <div className="builder-canvas-empty-icon">📂</div>
              <p>Your canvas is empty.</p>
              <span>Select blocks from the left sidebar to start building.</span>
            </div>
          ) : (
            <div className="builder-block-list">
              {blocks.map((block, idx) => {
                const labelObj = BLOCK_TYPES.find(t => t.type === block.type) || { label: block.type };
                const isExpanded = expandedId === block.id;

                return (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    className={`builder-block-item ${block.visible ? '' : 'builder-block-item-hidden'} ${draggedIdx === idx ? 'dragging' : ''}`}
                  >
                    {/* Header */}
                    <div className="builder-block-header">
                      <div className="builder-block-title-area">
                        {/* Drag Handle Icon */}
                        <div className="builder-block-drag-handle">☰</div>
                        <span className="builder-block-title">
                          {labelObj.label}
                        </span>
                        {!block.visible && (
                          <span className="badge badge-red" style={{ fontSize: '9px', padding: '2px 6px', textTransform: 'uppercase' }}>
                            Hidden
                          </span>
                        )}
                      </div>

                      <div className="builder-block-actions">
                        {/* Move fallbacks */}
                        <button
                          onClick={() => handleMove(idx, -1)}
                          disabled={idx === 0}
                          className="builder-action-icon-btn"
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMove(idx, 1)}
                          disabled={idx === blocks.length - 1}
                          className="builder-action-icon-btn"
                          title="Move Down"
                        >
                          ▼
                        </button>

                        {/* Visibility Toggle */}
                        <button
                          onClick={() => handleToggleVisibility(block.id)}
                          className="builder-action-icon-btn"
                          title={block.visible ? 'Hide Block' : 'Show Block'}
                        >
                          {block.visible ? '👁️' : '👁️‍QUrl'}
                        </button>

                        {/* Expand Config */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : block.id)}
                          className="builder-action-text-btn"
                        >
                          {isExpanded ? 'Collapse' : 'Configure'}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleRemoveBlock(block.id)}
                          className="builder-action-icon-btn delete"
                          title="Remove Block"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Block Editors */}
                    {isExpanded && (
                      <div className="builder-block-body">
                        {/* Hero Block Config */}
                        {block.type === 'hero' && (
                          <>
                            <div className="builder-field-row">
                              <div className="builder-field">
                                <label className="builder-field-label">Banner Emoji Tag (e.g. 🎉)</label>
                                <input type="text" value={block.configs.tag || ''} onChange={e => handleUpdateConfig(block.id, 'tag', e.target.value)} className="adm-input" />
                              </div>
                              <div className="builder-field">
                                <label className="builder-field-label">Banner Announcement Text</label>
                                <input type="text" value={block.configs.tagText || ''} onChange={e => handleUpdateConfig(block.id, 'tagText', e.target.value)} className="adm-input" />
                              </div>
                              <div className="builder-field">
                                <label className="builder-field-label">Banner Announcement Link</label>
                                <input type="text" value={block.configs.tagLink || ''} onChange={e => handleUpdateConfig(block.id, 'tagLink', e.target.value)} className="adm-input" />
                              </div>
                            </div>
                            <div className="builder-field">
                              <label className="builder-field-label">Headline Title</label>
                              <input type="text" value={block.configs.title || ''} onChange={e => handleUpdateConfig(block.id, 'title', e.target.value)} className="adm-input" />
                            </div>
                            <div className="builder-field">
                              <label className="builder-field-label">Sub-headline Description</label>
                              <textarea value={block.configs.description || ''} onChange={e => handleUpdateConfig(block.id, 'description', e.target.value)} className="adm-textarea" style={{ height: '80px', resize: 'none' }} />
                            </div>
                            <div className="builder-field-row">
                              <div className="builder-field">
                                <label className="builder-field-label">Primary CTA Button Text / Command</label>
                                <input type="text" value={block.configs.buttonText || ''} onChange={e => handleUpdateConfig(block.id, 'buttonText', e.target.value)} className="adm-input" />
                              </div>
                              <div className="builder-field">
                                <label className="builder-field-label">Primary CTA Link (or blank for copy CLI)</label>
                                <input type="text" value={block.configs.buttonLink || ''} onChange={e => handleUpdateConfig(block.id, 'buttonLink', e.target.value)} className="adm-input" />
                              </div>
                            </div>
                            <div className="builder-field-row">
                              <div className="builder-field">
                                <label className="builder-field-label">Secondary Button Text</label>
                                <input type="text" value={block.configs.secondaryButtonText || ''} onChange={e => handleUpdateConfig(block.id, 'secondaryButtonText', e.target.value)} className="adm-input" />
                              </div>
                              <div className="builder-field">
                                <label className="builder-field-label">Secondary Button Link</label>
                                <input type="text" value={block.configs.secondaryButtonLink || ''} onChange={e => handleUpdateConfig(block.id, 'secondaryButtonLink', e.target.value)} className="adm-input" />
                              </div>
                            </div>
                            <div className="builder-field">
                              <label className="builder-field-label">Metrics/Subtext (e.g. Code 10× faster • Reviews 2× quicker)</label>
                              <input type="text" value={block.configs.metricsText || ''} onChange={e => handleUpdateConfig(block.id, 'metricsText', e.target.value)} className="adm-input" />
                            </div>
                          </>
                        )}

                        {/* Terminal Block Config */}
                        {block.type === 'terminal' && (
                          <>
                            <div className="builder-field-row">
                              <div className="builder-field">
                                <label className="builder-field-label">Section Tag</label>
                                <input type="text" value={block.configs.tag || ''} onChange={e => handleUpdateConfig(block.id, 'tag', e.target.value)} className="adm-input" />
                              </div>
                              <div className="builder-field">
                                <label className="builder-field-label">Section Title</label>
                                <input type="text" value={block.configs.title || ''} onChange={e => handleUpdateConfig(block.id, 'title', e.target.value)} className="adm-input" />
                              </div>
                            </div>
                            <div className="builder-field">
                              <label className="builder-field-label">Section Description</label>
                              <textarea value={block.configs.description || ''} onChange={e => handleUpdateConfig(block.id, 'description', e.target.value)} className="adm-textarea" style={{ height: '60px', resize: 'none' }} />
                            </div>
                            <div className="builder-field-row">
                              <div className="builder-field">
                                <label className="builder-field-label">Left Console Title (e.g. other-agents.log)</label>
                                <input type="text" value={block.configs.leftTitle || ''} onChange={e => handleUpdateConfig(block.id, 'leftTitle', e.target.value)} className="adm-input" />
                              </div>
                              <div className="builder-field">
                                <label className="builder-field-label">Right Console Title (e.g. command-code.log)</label>
                                <input type="text" value={block.configs.rightTitle || ''} onChange={e => handleUpdateConfig(block.id, 'rightTitle', e.target.value)} className="adm-input" />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Features Block Config */}
                        {block.type === 'features' && (
                          <>
                            <div className="builder-field-row">
                              <div className="builder-field">
                                <label className="builder-field-label">Block Tag</label>
                                <input type="text" value={block.configs.tag || ''} onChange={e => handleUpdateConfig(block.id, 'tag', e.target.value)} className="adm-input" />
                              </div>
                              <div className="builder-field">
                                <label className="builder-field-label">Block Header Title</label>
                                <input type="text" value={block.configs.title || ''} onChange={e => handleUpdateConfig(block.id, 'title', e.target.value)} className="adm-input" />
                              </div>
                            </div>
                            <div className="builder-field">
                              <label className="builder-field-label">Introduction Description</label>
                              <input type="text" value={block.configs.description || ''} onChange={e => handleUpdateConfig(block.id, 'description', e.target.value)} className="adm-input" />
                            </div>
                            <div>
                              <div className="builder-subitems-header">
                                <span className="builder-subitems-title">Features Grid Items ({block.configs.items?.length || 0})</span>
                                <button type="button" onClick={() => handleAddItem(block.id, { title: 'New Feature', desc: 'Description details...' })} className="builder-subitems-add-btn">+ Add Card</button>
                              </div>
                              <div>
                                {(block.configs.items || []).map((item, itemIdx) => (
                                  <div key={itemIdx} className="builder-subitem-card">
                                    <div className="builder-subitem-fields">
                                      <input type="text" value={item.title} onChange={e => handleUpdateItems(block.id, itemIdx, 'title', e.target.value)} placeholder="Feature Title" className="adm-input" style={{ padding: '6px 10px', fontSize: '13px' }} />
                                      <input type="text" value={item.desc} onChange={e => handleUpdateItems(block.id, itemIdx, 'desc', e.target.value)} placeholder="Feature Description" className="adm-input" style={{ padding: '6px 10px', fontSize: '13px' }} />
                                    </div>
                                    <button type="button" onClick={() => handleRemoveItem(block.id, itemIdx)} className="builder-action-icon-btn delete" style={{ marginTop: '4px' }}>✕</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {/* CTA Block Config */}
                        {block.type === 'cta' && (
                          <>
                            <div className="builder-field">
                              <label className="builder-field-label">Headline Heading</label>
                              <input type="text" value={block.configs.title || ''} onChange={e => handleUpdateConfig(block.id, 'title', e.target.value)} className="adm-input" />
                            </div>
                            <div className="builder-field-row">
                              <div className="builder-field">
                                <label className="builder-field-label">Button Text</label>
                                <input type="text" value={block.configs.buttonText || ''} onChange={e => handleUpdateConfig(block.id, 'buttonText', e.target.value)} className="adm-input" />
                              </div>
                              <div className="builder-field">
                                <label className="builder-field-label">Button Link Target</label>
                                <input type="text" value={block.configs.buttonLink || ''} onChange={e => handleUpdateConfig(block.id, 'buttonLink', e.target.value)} className="adm-input" />
                              </div>
                            </div>
                          </>
                        )}

                        {/* FAQ Block Config */}
                        {block.type === 'faq' && (
                          <>
                            <div className="builder-field-row">
                              <div className="builder-field">
                                <label className="builder-field-label">FAQ Header Title</label>
                                <input type="text" value={block.configs.title || ''} onChange={e => handleUpdateConfig(block.id, 'title', e.target.value)} className="adm-input" />
                              </div>
                              <div className="builder-field">
                                <label className="builder-field-label">Introduction Subtitle</label>
                                <input type="text" value={block.configs.description || ''} onChange={e => handleUpdateConfig(block.id, 'description', e.target.value)} className="adm-input" />
                              </div>
                            </div>
                            <div>
                              <div className="builder-subitems-header">
                                <span className="builder-subitems-title">Questions ({block.configs.items?.length || 0})</span>
                                <button type="button" onClick={() => handleAddItem(block.id, { q: 'New Question?', a: 'Answer content...' })} className="builder-subitems-add-btn">+ Add FAQ</button>
                              </div>
                              <div>
                                {(block.configs.items || []).map((faqItem, itemIdx) => (
                                  <div key={itemIdx} className="builder-subitem-card">
                                    <div className="builder-subitem-fields">
                                      <input type="text" value={faqItem.q} onChange={e => handleUpdateItems(block.id, itemIdx, 'q', e.target.value)} placeholder="Question text" className="adm-input" style={{ padding: '6px 10px', fontSize: '13px' }} />
                                      <input type="text" value={faqItem.a} onChange={e => handleUpdateItems(block.id, itemIdx, 'a', e.target.value)} placeholder="Answer text" className="adm-input" style={{ padding: '6px 10px', fontSize: '13px' }} />
                                    </div>
                                    <button type="button" onClick={() => handleRemoveItem(block.id, itemIdx)} className="builder-action-icon-btn delete" style={{ marginTop: '4px' }}>✕</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Newsletter Signup Config */}
                        {block.type === 'signup' && (
                          <>
                            <div className="builder-field">
                              <label className="builder-field-label">Signup Title</label>
                              <input type="text" value={block.configs.title || ''} onChange={e => handleUpdateConfig(block.id, 'title', e.target.value)} className="adm-input" />
                            </div>
                            <div className="builder-field">
                              <label className="builder-field-label">Signup Description</label>
                              <input type="text" value={block.configs.description || ''} onChange={e => handleUpdateConfig(block.id, 'description', e.target.value)} className="adm-input" />
                            </div>
                          </>
                        )}

                        {/* Recent Posts Config */}
                        {block.type === 'posts' && (
                          <>
                            <div className="builder-field-row">
                              <div className="builder-field">
                                <label className="builder-field-label">Section Title</label>
                                <input type="text" value={block.configs.title || ''} onChange={e => handleUpdateConfig(block.id, 'title', e.target.value)} className="adm-input" />
                              </div>
                              <div className="builder-field">
                                <label className="builder-field-label">Introduction Description</label>
                                <input type="text" value={block.configs.description || ''} onChange={e => handleUpdateConfig(block.id, 'description', e.target.value)} className="adm-input" />
                              </div>
                            </div>
                            <div className="builder-field-row">
                              <div className="builder-field">
                                <label className="builder-field-label">Max Count of Posts</label>
                                <input type="number" min="1" max="10" value={block.configs.limit || 3} onChange={e => handleUpdateConfig(block.id, 'limit', parseInt(e.target.value) || 3)} className="adm-input" />
                              </div>
                              <div className="builder-field">
                                <label className="builder-field-label">Display Layout Style</label>
                                <select value={block.configs.layoutStyle || 'list'} onChange={e => handleUpdateConfig(block.id, 'layoutStyle', e.target.value)} className="adm-input" style={{ background: '#0a0a0a', color: '#fff' }}>
                                  <option value="list">List Row (Standard Changelog)</option>
                                  <option value="grid">Grid Card (Multi-column Feature Images)</option>
                                </select>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Pricing Block Config */}
                        {block.type === 'pricing' && (
                          <>
                            <div className="builder-field-row">
                              <div className="builder-field">
                                <label className="builder-field-label">Section Tag</label>
                                <input type="text" value={block.configs.tag || ''} onChange={e => handleUpdateConfig(block.id, 'tag', e.target.value)} className="adm-input" />
                              </div>
                              <div className="builder-field">
                                <label className="builder-field-label">Section Title</label>
                                <input type="text" value={block.configs.title || ''} onChange={e => handleUpdateConfig(block.id, 'title', e.target.value)} className="adm-input" />
                              </div>
                            </div>
                            <div className="builder-field">
                              <label className="builder-field-label">Section Description</label>
                              <input type="text" value={block.configs.description || ''} onChange={e => handleUpdateConfig(block.id, 'description', e.target.value)} className="adm-input" />
                            </div>

                            <div style={{ border: '1px dashed var(--border)', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
                              <div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '8px', color: 'var(--primary)' }}>Prominent Single Card Layout (Leave plans empty to activate)</div>
                              <div className="builder-field-row">
                                <div className="builder-field">
                                  <label className="builder-field-label">Price text (e.g. $1)</label>
                                  <input type="text" value={block.configs.price || ''} onChange={e => handleUpdateConfig(block.id, 'price', e.target.value)} className="adm-input" />
                                </div>
                                <div className="builder-field">
                                  <label className="builder-field-label">Period text (e.g. /mo)</label>
                                  <input type="text" value={block.configs.period || ''} onChange={e => handleUpdateConfig(block.id, 'period', e.target.value)} className="adm-input" />
                                </div>
                              </div>
                              <div className="builder-field">
                                <label className="builder-field-label">Subtext info (e.g. Cancel any time)</label>
                                <input type="text" value={block.configs.subtext || ''} onChange={e => handleUpdateConfig(block.id, 'subtext', e.target.value)} className="adm-input" />
                              </div>
                              <div className="builder-field">
                                <label className="builder-field-label">Credits footer details</label>
                                <input type="text" value={block.configs.credits || ''} onChange={e => handleUpdateConfig(block.id, 'credits', e.target.value)} className="adm-input" />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                <input type="checkbox" id={`chk_signup_${block.id}`} checked={!!block.configs.showSignup} onChange={e => handleUpdateConfig(block.id, 'showSignup', e.target.checked)} />
                                <label htmlFor={`chk_signup_${block.id}`} style={{ fontSize: '12px', cursor: 'pointer' }}>Embed newsletter email signup form inside this pricing card</label>
                              </div>
                            </div>

                            <div>
                              <div className="builder-subitems-header">
                                <span className="builder-subitems-title">Plans/Tiers ({block.configs.plans?.length || 0})</span>
                                <button type="button" onClick={() => handleAddItem(block.id, { name: 'Tier', price: '$9', desc: 'Custom plan...' })} className="builder-subitems-add-btn">+ Add Plan</button>
                              </div>
                              <div>
                                {(block.configs.plans || []).map((plan, planIdx) => (
                                  <div key={planIdx} className="builder-subitem-card">
                                    <div className="builder-subitem-fields">
                                      <div className="builder-field-row">
                                        <input type="text" value={plan.name} onChange={e => handleUpdateItems(block.id, planIdx, 'name', e.target.value)} placeholder="Plan Name" className="adm-input" style={{ padding: '6px 10px', fontSize: '13px' }} />
                                        <input type="text" value={plan.price} onChange={e => handleUpdateItems(block.id, planIdx, 'price', e.target.value)} placeholder="Plan Price" className="adm-input" style={{ padding: '6px 10px', fontSize: '13px' }} />
                                      </div>
                                      <input type="text" value={plan.desc} onChange={e => handleUpdateItems(block.id, planIdx, 'desc', e.target.value)} placeholder="Plan Description" className="adm-input" style={{ padding: '6px 10px', fontSize: '13px' }} />
                                    </div>
                                    <button type="button" onClick={() => handleRemoveItem(block.id, planIdx)} className="builder-action-icon-btn delete" style={{ marginTop: '4px' }}>✕</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Testimonials Block Config */}
                        {block.type === 'testimonials' && (
                          <>
                            <div className="builder-field-row">
                              <div className="builder-field">
                                <label className="builder-field-label">Block Tag</label>
                                <input type="text" value={block.configs.tag || ''} onChange={e => handleUpdateConfig(block.id, 'tag', e.target.value)} className="adm-input" />
                              </div>
                              <div className="builder-field">
                                <label className="builder-field-label">Block Header Title</label>
                                <input type="text" value={block.configs.title || ''} onChange={e => handleUpdateConfig(block.id, 'title', e.target.value)} className="adm-input" />
                              </div>
                            </div>
                            <div>
                              <div className="builder-subitems-header">
                                <span className="builder-subitems-title">Testimonial Items ({block.configs.items?.length || 0})</span>
                                <button type="button" onClick={() => handleAddItem(block.id, { quote: '“ Quote here... ”', author: 'Author Name', title: 'Role/Company' })} className="builder-subitems-add-btn">+ Add Quote</button>
                              </div>
                              <div>
                                {(block.configs.items || []).map((item, itemIdx) => (
                                  <div key={itemIdx} className="builder-subitem-card">
                                    <div className="builder-subitem-fields">
                                      <textarea value={item.quote} onChange={e => handleUpdateItems(block.id, itemIdx, 'quote', e.target.value)} placeholder="Quote text" className="adm-textarea" style={{ height: '60px', padding: '6px 10px', fontSize: '13px', resize: 'none' }} />
                                      <div className="builder-field-row" style={{ marginTop: '8px' }}>
                                        <input type="text" value={item.author} onChange={e => handleUpdateItems(block.id, itemIdx, 'author', e.target.value)} placeholder="Author" className="adm-input" style={{ padding: '6px 10px', fontSize: '13px' }} />
                                        <input type="text" value={item.title} onChange={e => handleUpdateItems(block.id, itemIdx, 'title', e.target.value)} placeholder="Role / Company" className="adm-input" style={{ padding: '6px 10px', fontSize: '13px' }} />
                                      </div>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveItem(block.id, itemIdx)} className="builder-action-icon-btn delete" style={{ marginTop: '4px' }}>✕</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Statistics Config */}
                        {block.type === 'stats' && (
                          <>
                            <div>
                              <div className="builder-subitems-header">
                                <span className="builder-subitems-title">Stat Cards ({block.configs.items?.length || 0})</span>
                                <button type="button" onClick={() => handleAddItem(block.id, { val: '100%', lbl: 'Faster' })} className="builder-subitems-add-btn">+ Add Card</button>
                              </div>
                              <div>
                                {(block.configs.items || []).map((stat, statIdx) => (
                                  <div key={statIdx} className="builder-subitem-card">
                                    <div className="builder-subitem-fields">
                                      <div className="builder-field-row">
                                        <input type="text" value={stat.val} onChange={e => handleUpdateItems(block.id, statIdx, 'val', e.target.value)} placeholder="Metric (e.g. 10x)" className="adm-input" style={{ padding: '6px 10px', fontSize: '13px' }} />
                                        <input type="text" value={stat.lbl} onChange={e => handleUpdateItems(block.id, statIdx, 'lbl', e.target.value)} placeholder="Label (e.g. Faster Code)" className="adm-input" style={{ padding: '6px 10px', fontSize: '13px' }} />
                                      </div>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveItem(block.id, statIdx)} className="builder-action-icon-btn delete" style={{ marginTop: '4px' }}>✕</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Custom HTML/Text Config */}
                        {block.type === 'html' && (
                          <div className="builder-field">
                            <label className="builder-field-label">Custom HTML / Markdown Text Markup</label>
                            <textarea
                              value={block.configs.html || ''}
                              onChange={e => handleUpdateConfig(block.id, 'html', e.target.value)}
                              className="adm-textarea"
                              style={{ height: '120px', fontFamily: 'var(--admin-mono-font)', fontSize: '12px' }}
                            />
                            <p style={{ fontSize: '10px', color: 'var(--admin-muted)', marginTop: '4px' }}>Supports raw HTML markup (divs, headings, styling classes).</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
