'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlockRenderer from '@/components/BlockRenderer';

export default function PageClient({ page }) {
  const parsedBlocks = page.layout ? JSON.parse(page.layout) : [];

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-between">
      <div className="glow-bg"></div>
      <div className="noise-overlay"></div>

      <div className="app-container">
        {/* Shared Navbar */}
        <Header />

        {/* Dynamic Page Header */}
        <main style={{ padding: '60px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{ fontSize: '38px', fontWeight: '800', letterSpacing: '-0.03em', color: '#fff' }}>
              {page.title}
            </h1>
            {page.description && (
              <p style={{ color: 'var(--muted)', fontSize: '15px', marginTop: '10px', maxWidth: '600px', margin: '10px auto 0' }}>
                {page.description}
              </p>
            )}
          </div>

          <BlockRenderer blocks={parsedBlocks} />
        </main>
      </div>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}
