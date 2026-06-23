'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [copied, setCopied] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [email, setEmail] = useState('');
  const [signupStatus, setSignupStatus] = useState({ type: '', message: '' });
  const [signupLoading, setSignupLoading] = useState(false);
  const [changelogs, setChangelogs] = useState([]);

  // Terminal animation simulation state
  const [terminalLineIndex, setTerminalLineIndex] = useState(0);
  const [terminalLines, setTerminalLines] = useState([
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

  useEffect(() => {
    async function fetchChangelogs() {
      try {
        const res = await fetch('/api/posts?status=published&limit=5');
        if (res.ok) {
          const data = await res.json();
          setChangelogs(data.posts || []);
        }
      } catch (err) {
        console.error('Failed to fetch changelogs:', err);
      }
    }
    fetchChangelogs();
  }, []);

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

  return (
    <div className="relative">
      <div className="glow-bg"></div>
      <div className="noise-overlay"></div>

      <div className="app-container">
        {/* Navigation */}
        <header className="navbar">
          <div className="logo-section">
            <span className="icon">⚡</span>
            <span>Command Code</span>
          </div>
          <ul className="nav-links">
            <li><a href="#">Docs</a></li>
            <li><a href="#">Features</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Provider API</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
          <div className="nav-actions">
            <Link href="/login" className="btn btn-secondary">Login</Link>
            <Link href="/register" className="btn btn-primary">Sign Up</Link>
          </div>
        </header>

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
            {/* Without Taste */}
            <div className="console-box">
              <div className="console-header">
                <div className="console-dots">
                  <span className="dot-red"></span>
                  <span className="dot-yellow"></span>
                  <span className="dot-green"></span>
                </div>
                <div className="console-title">other-agents.log</div>
                <span></span>
              </div>
              <div className="console-body">
                <span className="text-prompt">[ PROMPT ] &gt; Build a cli to tell date</span>
                <span className="text-prompt">✳ Building...</span>
                <span className="text-wrong">[ WRONG ] Interrupted: no, please use typescript</span>
                <span className="text-prompt">✳ Blabbering... Adding tsc config</span>
                <span className="text-wrong">[ WRONG ] Interrupted: use tsup, not raw tsc</span>
                <span className="text-prompt">✳ Stuck in loops... adding Mocha tests</span>
                <span className="text-wrong">[ WRONG ] Interrupted: I prefer vitest</span>
                <span className="text-wrong">Sloppy AI: "Leave it, I will do it myself!"</span>
              </div>
            </div>

            {/* With Taste */}
            <div className="console-box with-taste">
              <div className="console-header">
                <div className="console-dots">
                  <span className="dot-red"></span>
                  <span className="dot-yellow"></span>
                  <span className="dot-green"></span>
                </div>
                <div className="console-title">command-code.log</div>
                <span className="text-success">active</span>
              </div>
              <div className="console-body">
                {terminalLines.slice(0, terminalLineIndex).map((line, i) => (
                  <span
                    key={i}
                    className={
                      line.type === 'input'
                        ? 'text-prompt'
                        : line.type === 'success'
                        ? 'text-success'
                        : line.type === 'highlight'
                        ? 'text-highlight'
                        : ''
                    }
                  >
                    {line.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="features-section">
          <div className="section-tag">// features</div>
          <h2 className="section-title">A mode for every developer</h2>
          <p className="section-desc">Built out of the box to fit your architecture, conventions, and style.</p>

          <div className="grid-features">
            <div className="feature-card">
              <span className="feature-num">01</span>
              <h3>Always learning</h3>
              <p>Every accept, reject, and edit is a signal — auto-generates into project-level convention skills.</p>
            </div>
            <div className="feature-card">
              <span className="feature-num">02</span>
              <h3>Modes for moments</h3>
              <p>Interactive CLI, Headless runs via `-p`, `--yolo`, and sandboxed background runners.</p>
            </div>
            <div className="feature-card">
              <span className="feature-num">03</span>
              <h3>Pro tools built in</h3>
              <p>File operations, ripgrep searches, sandbox shell runs, and multi-file code editing integrations.</p>
            </div>
            <div className="feature-card">
              <span className="feature-num">04</span>
              <h3>Memory carryover</h3>
              <p>Custom `/agents` profiles and persistent `/memory` context settings preserved across coding sessions.</p>
            </div>
            <div className="feature-card">
              <span className="feature-num">05</span>
              <h3>Highly Hackable</h3>
              <p>Supports reusable custom skills, custom terminal commands, MCP servers, and editor plugins.</p>
            </div>
            <div className="feature-card">
              <span className="feature-num">06</span>
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

            <div className="changelog-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '40px', maxWidth: '800px', margin: '40px auto 0' }}>
              {changelogs.map((post) => (
                <div key={post.id} className="feature-card" style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr',
                  gap: '24px',
                  textAlign: 'left',
                  alignItems: 'start',
                  padding: '24px 32px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                      By {post.author_name}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff', marginTop: 0 }}>
                      <Link href={`/changelog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = '#fff'}>
                        {post.title}
                      </Link>
                    </h3>
                    <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                      {post.summary || post.content.substring(0, 180) + '...'}
                    </p>
                  </div>
                </div>
              ))}
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
        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-col">
              <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>⚡ Command Code</h4>
              <p style={{ lineHeight: '1.7', color: 'var(--muted)' }}>
                The first coding agent that learns your conventions and taste. Powered by taste-1 Reinforcement Learning harness.
              </p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#">Docs</a></li>
                <li><a href="#">Features</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Changelog</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Security</a></li>
                <li><a href="#">Blog</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Community</h4>
              <ul>
                <li><a href="#">GitHub</a></li>
                <li><a href="#">X (Twitter)</a></li>
                <li><a href="#">LinkedIn</a></li>
                <li><a href="#">Discord</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 Command Code, 2261 Market St #5698, San Francisco, CA 94114. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
