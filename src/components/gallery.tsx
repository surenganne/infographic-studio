'use client';

import { GeneratedImage } from '@/types';
import { Download, ExternalLink, ImageIcon, Loader2, RefreshCw, Trash2, X } from 'lucide-react';
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
      const res = await fetch(image.url);
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
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        {isGenerating ? (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #fff7ed, #eff6ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Loader2 size={24} color="#f97316" className="animate-spin" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>Generating your infographic</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Usually takes 20–40 seconds</p>
            </div>
            <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#f97316',
                  animation: 'bounce 1s infinite',
                  animationDelay: `${i * 0.15}s`,
                }} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: 'var(--muted-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ImageIcon size={24} color="var(--muted)" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>No infographics yet</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Enter content and hit Generate</p>
            </div>
          </>
        )}
        <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>Gallery</h2>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {images.length} {images.length === 1 ? 'infographic' : 'infographics'} generated
          </p>
        </div>
        {isGenerating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: '#fff7ed', border: '1px solid #fed7aa' }}>
            <Loader2 size={12} color="#f97316" className="animate-spin" />
            <span style={{ fontSize: 12, color: '#c2410c', fontWeight: 500 }}>Generating…</span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {images.map(image => (
          <ImageCard
            key={image.id}
            image={image}
            isDownloading={downloadingId === image.id}
            onDownload={() => handleDownload(image)}
            onRegenerate={() => onRegenerate(image)}
            onDelete={() => onDelete(image.id)}
            onPreview={() => setLightbox(image)}
            onOpen={() => window.open(image.url, '_blank')}
          />
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
            backdropFilter: 'blur(6px)',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 36, height: 36, borderRadius: 8,
              background: 'rgba(255,255,255,0.15)', border: 'none',
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>

          {/* Image */}
          <img
            src={lightbox.url}
            alt={lightbox.content.title}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '100%',
              maxHeight: '90vh',
              borderRadius: 12,
              objectFit: 'contain',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            }}
          />

          {/* Caption + actions */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', bottom: 24,
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px', borderRadius: 12,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>
              {lightbox.content.title}
            </span>
            <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }} />
            <button
              onClick={() => handleDownload(lightbox)}
              disabled={downloadingId === lightbox.id}
              title="Download"
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}
            >
              {downloadingId === lightbox.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Download
            </button>
            <button
              onClick={() => window.open(lightbox.url, '_blank')}
              title="Open original"
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}
            >
              <ExternalLink size={14} />
              Original
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ImageCard({ image, isDownloading, onDownload, onRegenerate, onDelete, onPreview, onOpen }: {
  image: GeneratedImage;
  isDownloading: boolean;
  onDownload: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
  onPreview: () => void;
  onOpen: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        borderRadius: 12,
        border: '1px solid var(--border)',
        background: 'var(--card)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        boxShadow: hovered ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image with overlay */}
      <div style={{ position: 'relative', background: '#f0f0ee', cursor: 'zoom-in' }} onClick={onPreview}>
        <img
          src={image.url}
          alt={image.content.title}
          style={{
            width: '100%',
            aspectRatio: image.style.aspectRatio.replace(':', '/'),
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.3s',
            transform: hovered ? 'scale(1.02)' : 'scale(1)',
          }}
        />
        {/* Hover overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.2s',
        }}>
          <OverlayBtn onClick={e => { e.stopPropagation(); onDownload(); }} disabled={isDownloading} title="Download">
            {isDownloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          </OverlayBtn>
          <OverlayBtn onClick={e => { e.stopPropagation(); onRegenerate(); }} title="Regenerate">
            <RefreshCw size={15} />
          </OverlayBtn>
          <OverlayBtn onClick={e => { e.stopPropagation(); onOpen(); }} title="Open in new tab">
            <ExternalLink size={15} />
          </OverlayBtn>
          <OverlayBtn onClick={e => { e.stopPropagation(); onDelete(); }} title="Delete" danger>
            <Trash2 size={15} />
          </OverlayBtn>
        </div>
      </div>

      {/* Meta */}
      <div style={{ padding: '10px 12px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {image.content.title}
        </p>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
          {image.style.aspectRatio} · {image.style.resolution} · {new Date(image.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

function OverlayBtn({ children, onClick, disabled, title, danger }: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  title?: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 34, height: 34,
        borderRadius: 8,
        border: 'none',
        background: danger ? 'rgba(239,68,68,0.85)' : 'rgba(255,255,255,0.9)',
        color: danger ? 'white' : '#111',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        backdropFilter: 'blur(4px)',
      }}
    >
      {children}
    </button>
  );
}
