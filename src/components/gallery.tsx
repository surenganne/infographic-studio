'use client';

import { GeneratedImage } from '@/types';
import { Download, ExternalLink, ImageIcon, Loader2, RefreshCw, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GalleryProps {
  images: GeneratedImage[];
  onRegenerate: (image: GeneratedImage) => void;
  onDelete: (id: string) => void;
  isGenerating?: boolean;
}

export function Gallery({ images, onRegenerate, onDelete, isGenerating }: GalleryProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleDownload = async (image: GeneratedImage) => {
    setDownloadingId(image.id);
    try {
      const key = image.url.replace('/api/image/', '');
      const res = await fetch(`/api/download?key=${key}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `infographic-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed:', e);
    } finally {
      setDownloadingId(null);
    }
  };

  if (images.length === 0) {
    return (
      <div className="empty-state">
        {isGenerating ? (
          <>
            <div className="empty-icon" style={{ background: 'linear-gradient(135deg, #fff4ec, #eff6ff)' }}>
              <Loader2 size={28} color="#f97316" className="animate-spin" />
            </div>
            <div>
              <p className="empty-title">Creating your infographic</p>
              <p className="empty-sub">The AI is working on it. This usually takes 20–40 seconds.</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#f97316',
                    animation: 'pulse-dot 1.2s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="empty-icon" style={{ background: 'var(--bg-subtle)' }}>
              <ImageIcon size={28} color="var(--text-muted)" />
            </div>
            <div>
              <p className="empty-title">No infographics yet</p>
              <p className="empty-sub">Enter your content on the left and hit Generate to create your first infographic.</p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 20,
              background: 'var(--accent-soft)', border: '1px solid #fed7aa',
            }}>
              <Sparkles size={12} color="var(--accent-text)" />
              <span style={{ fontSize: 12, color: 'var(--accent-text)', fontWeight: 500 }}>
                Powered by KIE AI
              </span>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="gallery-header">
        <div>
          <h2 className="gallery-title">Gallery</h2>
          <p className="gallery-count">
            {images.length} {images.length === 1 ? 'infographic' : 'infographics'} generated
          </p>
        </div>
        {isGenerating && (
          <div className="generating-badge">
            <Loader2 size={12} color="var(--accent-text)" className="animate-spin" />
            <span>Generating&hellip;</span>
          </div>
        )}
      </div>

      <div className="gallery-grid">
        {images.map(image => (
          <ImageCard
            key={image.id}
            image={image}
            isDownloading={downloadingId === image.id}
            onDownload={() => handleDownload(image)}
            onRegenerate={() => onRegenerate(image)}
            onDelete={() => onDelete(image.id)}
            onPreview={() => setLightbox(image)}
          />
        ))}
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox__close" onClick={() => setLightbox(null)} aria-label="Close">
            <X size={18} />
          </button>
          <img
            src={lightbox.url}
            alt={lightbox.content.title}
            className="lightbox__img"
            onClick={e => e.stopPropagation()}
          />
          <div className="lightbox__bar" onClick={e => e.stopPropagation()}>
            <span className="lightbox__bar-title">{lightbox.content.title}</span>
            <span className="lightbox__bar-sep" />
            <button
              className="lightbox__bar-btn"
              onClick={() => handleDownload(lightbox)}
              disabled={downloadingId === lightbox.id}
            >
              {downloadingId === lightbox.id
                ? <Loader2 size={13} className="animate-spin" />
                : <Download size={13} />}
              Download
            </button>
            <button
              className="lightbox__bar-btn"
              onClick={() => window.open(lightbox.url, '_blank')}
            >
              <ExternalLink size={13} />
              Open
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ImageCard({ image, isDownloading, onDownload, onRegenerate, onDelete, onPreview }: {
  image: GeneratedImage;
  isDownloading: boolean;
  onDownload: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
  onPreview: () => void;
}) {
  const [, setHovered] = useState(false);
  const aspectStyle = { aspectRatio: image.style.aspectRatio.replace(':', '/') };

  return (
    <div
      className="image-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="image-card__thumb" style={aspectStyle} onClick={onPreview}>
        <img
          src={image.url}
          alt={image.content.title}
          className="image-card__img"
          style={aspectStyle}
        />
        <div className="image-card__overlay">
          <button
            className="overlay-btn overlay-btn--default"
            onClick={e => { e.stopPropagation(); onDownload(); }}
            disabled={isDownloading}
            title="Download"
          >
            {isDownloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          </button>
          <button
            className="overlay-btn overlay-btn--default"
            onClick={e => { e.stopPropagation(); onRegenerate(); }}
            title="Regenerate"
          >
            <RefreshCw size={15} />
          </button>
          <button
            className="overlay-btn overlay-btn--default"
            onClick={e => { e.stopPropagation(); window.open(image.url, '_blank'); }}
            title="Open in new tab"
          >
            <ExternalLink size={15} />
          </button>
          <button
            className="overlay-btn overlay-btn--danger"
            onClick={e => { e.stopPropagation(); onDelete(); }}
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="image-card__meta">
        <p className="image-card__title">{image.content.title}</p>
        <div className="image-card__info">
          <span>{image.style.diagramStyle ?? 'infographic'}</span>
          <span className="image-card__dot" />
          <span>{image.style.aspectRatio}</span>
          <span className="image-card__dot" />
          <span>{image.style.resolution}</span>
          <span className="image-card__dot" />
          <span>{new Date(image.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
}
