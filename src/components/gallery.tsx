'use client';

import { GeneratedImage } from '@/types';
import { ChevronDown, ChevronRight, Download, ExternalLink, ImageIcon, Loader2, RefreshCw, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// ─── Date grouping helpers ────────────────────────────────────────────────────

function toDateKey(date: Date | string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayKey(): string {
  return toDateKey(new Date());
}

function formatGroupLabel(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (key === toDateKey(today)) return 'Today';
  if (key === toDateKey(yesterday)) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

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
            <div className="empty-icon" style={{ background: 'linear-gradient(135deg, #eeeefd, #f5f3ff)' }}>
              <Loader2 size={28} color="#4c4ae0" className="animate-spin" />
            </div>
            <div>
              <p className="empty-title">Creating your infographic</p>
              <p className="empty-sub">The AI is working on it. This usually takes 20–40 seconds.</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#4c4ae0',
                  animation: 'pulse-dot 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }} />
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
              background: 'var(--primary-soft)', border: '1px solid #c7c7f8',
            }}>
              <Sparkles size={12} color="var(--primary-text)" />
              <span style={{ fontSize: 12, color: 'var(--primary-text)', fontWeight: 500 }}>Powered by KIE AI</span>
            </div>
          </>
        )}
      </div>
    );
  }

  // Group images by date, sorted newest first
  const groups: { key: string; items: GeneratedImage[] }[] = [];
  const seen = new Map<string, GeneratedImage[]>();
  for (const img of images) {
    const k = toDateKey(img.createdAt);
    if (!seen.has(k)) { seen.set(k, []); groups.push({ key: k, items: seen.get(k)! }); }
    seen.get(k)!.push(img);
  }
  groups.sort((a, b) => b.key.localeCompare(a.key));

  return (
    <div>
      {/* Header */}
      <div className="gallery-header">
        <div>
          <h2 className="gallery-title">Gallery</h2>
          <p className="gallery-count">
            {images.length} {images.length === 1 ? 'infographic' : 'infographics'} generated
          </p>
        </div>
        {isGenerating && (
          <div className="generating-badge">
            <Loader2 size={12} color="var(--primary-text)" className="animate-spin" />
            <span>Generating&hellip;</span>
          </div>
        )}
      </div>

      {/* Date groups */}
      {groups.map(group => (
        <DateGroup
          key={group.key}
          dateKey={group.key}
          images={group.items}
          defaultOpen={group.key === todayKey()}
          downloadingId={downloadingId}
          onDownload={handleDownload}
          onRegenerate={onRegenerate}
          onDelete={onDelete}
          onPreview={setLightbox}
        />
      ))}

      {/* Lightbox */}
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
            <button className="lightbox__bar-btn" onClick={() => handleDownload(lightbox)} disabled={downloadingId === lightbox.id}>
              {downloadingId === lightbox.id ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              Download
            </button>
            <button className="lightbox__bar-btn" onClick={() => window.open(lightbox.url, '_blank')}>
              <ExternalLink size={13} />
              Open
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Date Group ───────────────────────────────────────────────────────────────

function DateGroup({ dateKey, images, defaultOpen, downloadingId, onDownload, onRegenerate, onDelete, onPreview }: {
  dateKey: string;
  images: GeneratedImage[];
  defaultOpen: boolean;
  downloadingId: string | null;
  onDownload: (img: GeneratedImage) => void;
  onRegenerate: (img: GeneratedImage) => void;
  onDelete: (id: string) => void;
  onPreview: (img: GeneratedImage) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isToday = dateKey === todayKey();

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Group header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          marginBottom: open ? 14 : 0,
          borderRadius: 10,
          border: `1px solid ${isToday ? '#c7c7f8' : 'var(--border)'}`,
          background: isToday ? 'var(--primary-soft)' : 'var(--bg-subtle)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {open
          ? <ChevronDown size={14} color={isToday ? 'var(--primary)' : 'var(--text-muted)'} />
          : <ChevronRight size={14} color={isToday ? 'var(--primary)' : 'var(--text-muted)'} />
        }
        <span style={{
          flex: 1,
          fontSize: 12,
          fontWeight: 700,
          color: isToday ? 'var(--primary-text)' : 'var(--text-muted)',
          letterSpacing: '0.01em',
        }}>
          {formatGroupLabel(dateKey)}
        </span>
        <span style={{
          fontSize: 11,
          color: isToday ? 'var(--primary-text)' : 'var(--text-muted)',
          background: isToday ? '#ddddfb' : 'var(--border)',
          padding: '2px 8px',
          borderRadius: 20,
          fontWeight: 600,
        }}>
          {images.length}
        </span>
      </button>

      {/* Masonry grid */}
      {open && (
        <div style={{ columns: '2 300px', columnGap: 16 }}>
          {images.map((image, index) => (
            <ImageCard
              key={image.id}
              image={image}
              index={index}
              isDownloading={downloadingId === image.id}
              onDownload={() => onDownload(image)}
              onRegenerate={() => onRegenerate(image)}
              onDelete={() => onDelete(image.id)}
              onPreview={() => onPreview(image)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Accent palettes — each card gets a unique accent based on its index
const ACCENTS = [
  { border: '#c7c7f8', headerBg: 'linear-gradient(135deg, #4c4ae0, #7c3aed)', headerText: '#fff' },
  { border: '#bbf7d0', headerBg: 'linear-gradient(135deg, #059669, #10b981)', headerText: '#fff' },
  { border: '#fed7aa', headerBg: 'linear-gradient(135deg, #ea580c, #f97316)', headerText: '#fff' },
  { border: '#e9d5ff', headerBg: 'linear-gradient(135deg, #7c3aed, #a855f7)', headerText: '#fff' },
  { border: '#bfdbfe', headerBg: 'linear-gradient(135deg, #2563eb, #3b82f6)', headerText: '#fff' },
  { border: '#fde68a', headerBg: 'linear-gradient(135deg, #d97706, #f59e0b)', headerText: '#fff' },
];

const TYPE_BADGE: Record<string, { bg: string; color: string }> = {
  infographic: { bg: '#eeeefd', color: '#3730a3' },
  technical:   { bg: '#f0fdf4', color: '#166534' },
  flowchart:   { bg: '#fff7ed', color: '#9a3412' },
  comparison:  { bg: '#fdf4ff', color: '#6b21a8' },
};

function ImageCard({ image, index, isDownloading, onDownload, onRegenerate, onDelete, onPreview }: {
  image: GeneratedImage;
  index: number;
  isDownloading: boolean;
  onDownload: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
  onPreview: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const accent = ACCENTS[index % ACCENTS.length];
  const badge = TYPE_BADGE[image.style.diagramStyle ?? 'infographic'] ?? TYPE_BADGE.infographic;
  const diagramType = image.style.diagramStyle ?? 'infographic';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        breakInside: 'avoid',
        marginBottom: 16,
        borderRadius: 16,
        border: `1.5px solid ${hovered ? accent.border : 'var(--border)'}`,
        background: 'var(--bg-card)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
        boxShadow: hovered
          ? '0 10px 32px rgba(76,74,224,0.16)'
          : '0 1px 4px rgba(76,74,224,0.06)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      {/* Colored accent header strip */}
      <div style={{
        background: accent.headerBg,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: accent.headerText,
          textTransform: 'capitalize', letterSpacing: '0.03em',
        }}>
          {diagramType}
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
          {new Date(image.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Thumbnail */}
      <div
        onClick={onPreview}
        style={{ position: 'relative', cursor: 'zoom-in', overflow: 'hidden', background: 'var(--bg-subtle)' }}
      >
        <img
          src={image.url}
          alt={image.content.title}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            transition: 'transform 0.35s ease',
            transform: hovered ? 'scale(1.03)' : 'scale(1)',
          }}
        />

        {/* Hover overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(30,27,75,0.52)',
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
          <OverlayBtn onClick={e => { e.stopPropagation(); window.open(image.url, '_blank'); }} title="Open in new tab">
            <ExternalLink size={15} />
          </OverlayBtn>
          <OverlayBtn onClick={e => { e.stopPropagation(); onDelete(); }} title="Delete" danger>
            <Trash2 size={15} />
          </OverlayBtn>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
          background: badge.bg, color: badge.color,
          textTransform: 'capitalize', flexShrink: 0,
        }}>
          {image.style.aspectRatio}
        </span>
        <p style={{
          flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--text)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0,
        }}>
          {image.content.title}
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
        width: 36, height: 36, borderRadius: 8, border: 'none',
        background: danger ? 'rgba(220,38,38,0.85)' : 'rgba(255,255,255,0.92)',
        color: danger ? 'white' : '#1e1b4b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        backdropFilter: 'blur(4px)',
        transition: 'transform 0.1s',
      }}
    >
      {children}
    </button>
  );
}
