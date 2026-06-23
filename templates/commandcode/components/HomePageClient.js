'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import BlockRenderer from '@/components/BlockRenderer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePageClient({ initialLayout, initialChangelogs }) {
  const [copied, setCopied] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [email, setEmail] = useState('');
  const [signupStatus, setSignupStatus] = useState({ type: '', message: '' });
  const [signupLoading, setSignupLoading] = useState(false);
  
  const [changelogs] = useState(initialChangelogs || []);
  const [indexLayout] = useState(initialLayout || null);

  // Terminal animation simulation state
  const [terminalLineIndex, setTerminalLineIndex] = useState(0);
  const [terminalLines] = useState([
    { type: 'input', text: '> Build a cli to tell date' },
    { type: 'info', text: 'Building date-cli, checking your taste... [ npx taste pull ]' },
    { type: 'highlight', text: 'Using your taste, I see you prefer:' },
    { type: 'highlight', text: '  ◻ TypeScript for CLI' },
    { type: 'highlight', text: '  ◻ Commander and tsup' },
    { type: 'highlight', text: '  ◻ Vitest for unit tests' },
    { type: 'info', text: 'Applying preferences and building...' },
    { type: 'success', text: '✓ Done! Created CLI linked using npm link.' },
    { type: 'success', text: '✓ Run date-cli in your shell to try it out!' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalLineIndex(prev => {
        if (prev < terminalLines.length) {
          return prev + 1;
        }
        return 1; // loop simulation
      });
    }, 2200);

    return () => clearInterval(timer);
  }, [terminalLines.length]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText('npm i -g command-code');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setSignupStatus({ type: 'error', message: 'Please enter a valid email address!' });
      return;
    }

    setSignupLoading(true);
    setSignupStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSignupStatus({ type: 'success', message: 'Subscription successful! Welcome to Command Code.' });
        setEmail('');
      } else {
        setSignupStatus({ type: 'error', message: data.error || 'An error occurred.' });
      }
    } catch (err) {
      setSignupStatus({ type: 'error', message: 'Server connection error.' });
    } finally {
      setSignupLoading(false);
    }
  };

  const faqs = [
    {
      q: "How is Command Code different from Cursor or Copilot?",
      a: "Command Code is a frontier coding agent that lives in your terminal and continuously learns your coding taste. Powered by taste-1, it ships, fixes, tests, and refactors with the patterns you keep — and forgets the ones you delete."
    },
    {
      q: "What does 'learns my taste' actually mean?",
      a: "Every accept, reject, and edit is a signal. Command Code distills those into project-level /skills and personal /memory, so the next session opens with the conventions you already prefer. No rules to write, no prompts to maintain."
    },
    {
      q: "Which models can I use? Can I bring my own?",
      a: "Every model listed in our docs ships out of the box — Anthropic, OpenAI, Google, xAI, DeepSeek, Qwen, Kimi, GLM, MiniMax, and more. New vendors land regularly."
    },
    {
      q: "Is my code used for training?",
      a: "No. Never. Your code, your skills, and your memory stay on your machine. Command Code never trains on your work. See our Privacy Policy."
    },
    {
      q: "How do teams share taste?",
      a: "npx taste push to publish a project skill, npx taste pull to install one. Skills are open files in your repo — review them in PRs like any other code."
    },
    {
      q: "What does it cost?",
      a: "We offer a Free tier for solo developers. Pro and Team plans add seats, more compute credits, and shared team taste registries. See Pricing for details."
    }
  ];

  if (indexLayout) {
    return (
      <div className="relative">
        <div className="glow-bg"></div>
        <div className="noise-overlay"></div>

        <div className="app-container">
          {/* Navigation Header */}
          <Header />

          <BlockRenderer blocks={indexLayout} />

          {/* Footer */}
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="glow-bg"></div>
      <div className="noise-overlay"></div>

      <div className="app-container">
        {/* Navigation Header */}
        <Header />

        {/* Hero Section */}
        <section className="hero">
          <div className="hero-banner">
            <span>🎉</span>
            <span>Command Code raised $5M seed.</span>
            <a href="#">Read article →</a>
          </div>
          <h1>Command Code with your taste</h1>
          <p className="hero-desc">
            The coding agent that does it all. Learns the way you code. Until coding feels like thinking.
            Powered by taste-1 meta neuro-symbolic AI.
          </p>

          <div className="hero-cta">
            <button className="cli-command" onClick={copyToClipboard} title="Click to copy">
              {copied ? '✓ Copied!' : 'npm i -g command-code'} 📋
            </button>
            <button className="btn btn-secondary" style={{ padding: '12px 24px' }}>Video Demo</button>
          </div>

          <div className="hero-metrics">
            <span>Code <strong>10×</strong> faster</span>
            <span>•</span>
            <span>Reviews <strong>2×</strong> quicker</span>
            <span>•</span>
            <span>Bugs <strong>5×</strong> fewer</span>
          </div>
        </section>

        {/* Console Demo Section */}
        <section className="comparison-section">
          <div className="section-tag">// stop patching AI slop</div>
          <h2 className="section-title">Coding agent that learns you</h2>
          <p className="section-desc">
            Code you don't fix. The best DX for coding with AI. Command continuously learns your conventions and forgets what you delete.
          </p>

          <div className="comparison-grid">
            <div className="terminal-card shadow-lg">
              <div className="terminal-header-custom">
                <div className="terminal-dots-custom">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <span className="terminal-title">other-agents.log</span>
              </div>
              <div className="terminal-body-custom">
                <div style={{ color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span>&gt; Build a cli to tell date</span>
                  <span style={{ color: '#ef4444' }}>✗ Failed: missing Commander package in package.json</span>
                  <span>&gt; npm install commander --save</span>
                  <span>&gt; Build a cli to tell date</span>
                  <span style={{ color: '#eab308' }}>! Warning: using JavaScript, no types defined.</span>
                  <span>&gt; Rewrite in typescript and tsup build...</span>
                  <span style={{ color: '#10b981' }}>✓ Completed. Writing vitest spec files...</span>
                </div>
              </div>
            </div>

            <div className="terminal-card active shadow-xl">
              <div className="terminal-header-custom">
                <div className="terminal-dots-custom">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <span className="terminal-title">command-code.log</span>
              </div>
              <div className="terminal-body-custom">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {terminalLines.slice(0, terminalLineIndex).map((line, idx) => (
                    <span
                      key={idx}
                      style={{
                        color: line.type === 'input' ? 'var(--foreground)'
                          : line.type === 'highlight' ? 'var(--primary)'
                            : line.type === 'success' ? '#10b981'
                              : 'var(--muted)'
                      }}
                    >
                      {line.text}
                    </span>
                  ))}
                  {terminalLineIndex < terminalLines.length && (
                    <span className="animate-pulse" style={{ color: 'var(--primary)' }}>▋</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="features-section">
          <div className="section-tag">// features</div>
          <h2 className="section-title">A mode for every developer</h2>
          <p className="section-desc">
            Built out of the box to fit your architecture, conventions, and style.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <h3>Always learning</h3>
              <p>Every accept, reject, and edit is a signal — auto-generates into project-level convention skills.</p>
            </div>
            <div className="feature-card">
              <h3>Modes for moments</h3>
              <p>Interactive CLI, Headless runs via `-p`, `--yolo`, and sandboxed background runners.</p>
            </div>
            <div className="feature-card">
              <h3>Pro tools built in</h3>
              <p>File operations, ripgrep searches, sandbox shell runs, and multi-file code editing integrations.</p>
            </div>
            <div className="feature-card">
              <h3>Memory carryover</h3>
              <p>Custom `/agents` profiles and persistent `/memory` context settings preserved across coding sessions.</p>
            </div>
            <div className="feature-card">
              <h3>Highly Hackable</h3>
              <p>Supports reusable custom skills, custom terminal commands, MCP servers, and editor plugins.</p>
            </div>
            <div className="feature-card">
              <h3>Better together</h3>
              <p>Share sessions with team members easily. Run `npx taste push` or `pull` to sync developer conventions.</p>
            </div>
          </div>
        </section>

        {/* Value Metrics Math */}
        <section className="metrics-section">
          <div className="section-header-row">
            <div>
              <div className="section-tag">// metrics</div>
              <h2 className="section-title">The math of developer DX</h2>
            </div>
            <p className="section-desc" style={{ marginBottom: 0 }}>
              Faster code, cleaner reviews, and fewer bugs for a dollar plan.
            </p>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-val">10×</div>
              <div className="metric-lbl">Faster Code</div>
              <div className="metric-desc">Keystroke to pull request in a fraction of the time.</div>
            </div>
            <div className="metric-card">
              <div className="metric-val">2×</div>
              <div className="metric-lbl">Quicker Reviews</div>
              <div className="metric-desc">Cleaner diffs without chasing formatting nits.</div>
            </div>
            <div className="metric-card">
              <div className="metric-val">5×</div>
              <div className="metric-lbl">Fewer Bugs</div>
              <div className="metric-desc">Code compiles and builds safely on the first merge.</div>
            </div>
          </div>
        </section>

        {/* Pricing Plan */}
        <section className="pricing-section">
          <div className="pricing-card">
            <div className="section-tag">// pricing</div>
            <h2 style={{ fontSize: '36px', marginBottom: '8px' }}>Go Plan</h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Everything unlocked. For a dollar.</p>

            <div className="price">$1<span style={{ fontSize: '20px', fontWeight: '400', color: 'var(--muted)' }}>/mo</span></div>
            <p className="price-sub">Cancel any time · $10 in free startup API credits included</p>

            {/* Email Signup Form */}
            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '420px', margin: '0 auto 24px' }}>
              <input
                type="email"
                placeholder="Enter your email address..."
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '100px',
                  padding: '10px 20px',
                  color: 'var(--foreground)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }} disabled={signupLoading}>
                {signupLoading ? 'Sending...' : 'Subscribe'}
              </button>
            </form>

            {signupStatus.message && (
              <div
                style={{
                  fontSize: '13px',
                  color: signupStatus.type === 'success' ? '#10b981' : '#f43f5e',
                  marginBottom: '16px'
                }}
              >
                {signupStatus.message}
              </div>
            )}

            <div className="price-credits">
              DeepSeek V4 Pro 4× · Nemotron 3 Ultra 2.3× · Qwen 3.7 Max 2× · MiniMax M3 20×
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials-section">
          <div className="section-tag">// community</div>
          <h2 className="section-title">Loved by engineers and founders</h2>

          <div className="testimonial-grid">
            <div className="testimonial-card">
              <p className="quote">
                “ Command Code learns my taste. After a week, it stopped making the mistakes I kept fixing in other agents. The diffs feel like a senior engineer who already read the codebase. ”
              </p>
              <div className="author">Zeno Rocha <span>Founder & CEO · Resend</span></div>
            </div>
            <div className="testimonial-card">
              <p className="quote">
                “ Command Code is the first agent where I trust open models in production. The harness is so solid I had to double check I was still on DeepSeek Flash. Shipped multiple CLIs for $2. ”
              </p>
              <div className="author">David Thyresson <span>RedwoodSDK Contributor</span></div>
            </div>
          </div>
        </section>

        {/* Product Updates / Changelog Section */}
        {changelogs.length > 0 && (
          <section className="features-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '60px' }}>
            <div className="section-tag">// product updates</div>
            <h2 className="section-title">What's new in Command Code</h2>
            <p className="section-desc">Latest improvements, models updates, and feature releases.</p>

            <div className="changelog-container">
              {changelogs.map((post) => {
                const stripHtml = (html) => html ? html.replace(/<[^>]*>/g, '') : '';
                const plainTextContent = stripHtml(post.content);
                const fallbackSummary = plainTextContent.length > 180 ? plainTextContent.substring(0, 180) + '...' : plainTextContent;

                const getThumbnailUrl = (imageUrl) => {
                  if (!imageUrl) return '';
                  if (imageUrl.startsWith('data:') || !imageUrl.includes('.')) return imageUrl;
                  return imageUrl.replace(/\.[^.]+$/, '') + '_thumb.webp';
                };

                return (
                  <div key={post.id} className="changelog-item">
                    <div className="changelog-info">
                      <div className="changelog-meta">
                        <span className="changelog-date">
                          {new Date(post.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </span>
                        <span>•</span>
                        <span className="changelog-author">By {post.author_name}</span>
                      </div>
                      <h3 className="changelog-title">
                        <Link href={`/posts/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      <p className="changelog-excerpt">
                        {post.summary || fallbackSummary}
                      </p>
                    </div>

                    {post.image && (
                      <div className="changelog-thumb">
                        <Link href={`/posts/${post.slug}`}>
                          <img 
                            src={getThumbnailUrl(post.image)} 
                            alt={post.title} 
                            loading="lazy" 
                            decoding="async" 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = post.image;
                            }}
                          />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* FAQ Accordion */}
        <section className="faq-section">
          <div className="faq-layout">
            <div>
              <div className="section-tag">// faq</div>
              <h2>Questions, answered.</h2>
              <p className="section-desc" style={{ marginTop: '12px' }}>
                Everything that usually comes up before a developer team installs.
              </p>
            </div>

            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className={`faq-item ${activeFaq === index ? 'active' : ''}`}>
                  <button className="faq-question" onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
                    {faq.q}
                  </button>
                  {activeFaq === index && (
                    <div className="faq-answer">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
