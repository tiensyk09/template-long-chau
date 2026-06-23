'use client';
import { useState, useEffect } from 'react';

export default function ImageGridLightbox({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(null);

  if (!images || images.length === 0) return null;

  const count = images.length;

  const openLightbox = (idx) => {
    setCurrentIndex(idx);
  };

  const closeLightbox = () => {
    setCurrentIndex(null);
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % count);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  };

  // Lắng nghe phím bấm từ bàn phím
  useEffect(() => {
    if (currentIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextImage();
      else if (e.key === 'ArrowLeft') prevImage();
      else if (e.key === 'Escape') closeLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  // Ngăn cuộn trang khi mở Lightbox
  useEffect(() => {
    if (currentIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [currentIndex]);

  // Xác định cấu trúc lưới dựa trên số lượng hình ảnh
  const renderGrid = () => {
    if (count === 1) {
      return (
        <div className="fb-grid fb-grid-1">
          <div className="fb-img-item" onClick={() => openLightbox(0)}>
            <img src={images[0].url} alt={images[0].name || 'Image'} />
          </div>
        </div>
      );
    }

    if (count === 2) {
      return (
        <div className="fb-grid fb-grid-2">
          {images.slice(0, 2).map((img, idx) => (
            <div key={img.id || idx} className="fb-img-item" onClick={() => openLightbox(idx)}>
              <img src={img.url} alt={img.name || 'Image'} />
            </div>
          ))}
        </div>
      );
    }

    if (count === 3) {
      return (
        <div className="fb-grid fb-grid-3">
          <div className="fb-img-col-main" onClick={() => openLightbox(0)}>
            <img src={images[0].url} alt={images[0].name || 'Image'} />
          </div>
          <div className="fb-img-col-sub">
            {images.slice(1, 3).map((img, idx) => (
              <div key={img.id || idx} className="fb-img-item" onClick={() => openLightbox(idx + 1)}>
                <img src={img.url} alt={img.name || 'Image'} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Bố cục 4 ảnh (2x2 giống Facebook) hoặc 5+ ảnh
    const limit = 4;
    const remaining = count - limit;

    return (
      <div className="fb-grid fb-grid-4">
        {images.slice(0, limit).map((img, idx) => {
          const isLast = idx === limit - 1;
          const showOverlay = isLast && remaining > 0;
          return (
            <div
              key={img.id || idx}
              className="fb-img-item"
              onClick={() => openLightbox(idx)}
              style={{ position: 'relative' }}
            >
              <img src={img.url} alt={img.name || 'Image'} />
              {showOverlay && (
                <div className="fb-grid-overlay">
                  <span>+{remaining}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fb-gallery-container" style={{ marginTop: '24px' }}>
      {renderGrid()}

      {/* Lightbox Modal */}
      {currentIndex !== null && (
        <div className="fb-lightbox" onClick={closeLightbox}>
          {/* Top Bar */}
          <div className="lightbox-top-bar" onClick={(e) => e.stopPropagation()}>
            <span className="lightbox-index">{currentIndex + 1} / {count}</span>
            <button className="lightbox-close-btn" onClick={closeLightbox}>×</button>
          </div>

          {/* Navigation Controls */}
          {count > 1 && (
            <>
              <button className="lightbox-nav-btn prev-btn" onClick={prevImage}>◀</button>
              <button className="lightbox-nav-btn next-btn" onClick={nextImage}>▶</button>
            </>
          )}

          {/* Big Image Content */}
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[currentIndex].url}
              alt={images[currentIndex].name || 'Enlarged Image'}
              className="lightbox-active-img"
            />
            {images[currentIndex].name && (
              <div className="lightbox-caption">{images[currentIndex].name}</div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .fb-gallery-container {
          width: 100%;
        }
        .fb-grid {
          display: grid;
          gap: 6px;
          border-radius: 8px;
          overflow: hidden;
          background: #f8fafc;
          border: 1px solid #edf2f7;
        }
        .fb-img-item {
          cursor: pointer;
          overflow: hidden;
          position: relative;
          background: #f1f5f9;
        }
        .fb-img-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
          display: block;
        }
        .fb-img-item:hover img {
          transform: scale(1.03);
        }

        /* 1 ảnh */
        .fb-grid-1 {
          grid-template-columns: 1fr;
          max-height: 500px;
        }
        .fb-grid-1 .fb-img-item img {
          max-height: 500px;
          object-fit: contain;
          background: #0f172a;
        }

        /* 2 ảnh */
        .fb-grid-2 {
          grid-template-columns: 1fr 1fr;
          aspect-ratio: 16 / 10;
        }

        /* 3 ảnh */
        .fb-grid-3 {
          grid-template-columns: 2fr 1fr;
          aspect-ratio: 16 / 10;
        }
        .fb-img-col-main {
          cursor: pointer;
          overflow: hidden;
          background: #f1f5f9;
        }
        .fb-img-col-main img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }
        .fb-img-col-main:hover img {
          transform: scale(1.03);
        }
        .fb-img-col-sub {
          display: grid;
          grid-template-rows: 1fr 1fr;
          gap: 6px;
        }

        /* 4 ảnh hoặc nhiều hơn */
        .fb-grid-4 {
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, 1fr);
          aspect-ratio: 1 / 1;
        }
        .fb-grid-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 28px;
          font-weight: 700;
          pointer-events: none;
        }

        /* Lightbox CSS */
        .fb-lightbox {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lightbox-top-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 60px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
          z-index: 10000;
        }
        .lightbox-index {
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 600;
        }
        .lightbox-close-btn {
          background: none;
          border: none;
          color: #fff;
          font-size: 36px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .lightbox-close-btn:hover {
          transform: scale(1.15);
        }
        .lightbox-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 20px;
          padding: 16px 12px;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s, transform 0.2s;
          z-index: 10000;
        }
        .lightbox-nav-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-50%) scale(1.05);
        }
        .prev-btn { left: 24px; }
        .next-btn { right: 24px; }
        
        .lightbox-content {
          max-width: 90%;
          max-height: 85%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .lightbox-active-img {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
          border-radius: 4px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          animation: zoomIn 0.25s ease-out;
        }
        .lightbox-caption {
          margin-top: 14px;
          color: #f1f5f9;
          font-size: 13px;
          background: rgba(0, 0, 0, 0.6);
          padding: 6px 16px;
          border-radius: 20px;
          text-align: center;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 768px) {
          .lightbox-nav-btn {
            padding: 10px 8px;
            font-size: 16px;
          }
          .prev-btn { left: 10px; }
          .next-btn { right: 10px; }
        }
      `}</style>
    </div>
  );
}
