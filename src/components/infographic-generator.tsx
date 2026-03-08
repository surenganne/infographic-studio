'use client';

import { buildInfographicPrompt, parseUserContent } from '@/lib/prompt-builder';
import { DEFAULT_STYLE_CONFIG, GeneratedImage, InfographicContent, StyleConfig } from '@/types';
import { AlertCircle, Loader2, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ContentInput } from './content-input';
import { Gallery } from './gallery';
import { StyleConfigPanel } from './style-config';

export function InfographicGenerator() {
  const [content, setContent] = useState('');
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(DEFAULT_STYLE_CONFIG);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load persisted images from localStorage and verify they still exist in S3
  useEffect(() => {
    try {
      const saved = localStorage.getItem('infographic-gallery');
      if (!saved) return;
      const parsed: GeneratedImage[] = JSON.parse(saved);
      if (!parsed.length) return;

      // Verify each image URL is still accessible (S3 may have been wiped on container restart)
      Promise.all(
        parsed.map(img =>
          fetch(img.url, { method: 'HEAD' })
            .then(r => r.ok ? img : null)
            .catch(() => null)
        )
      ).then(results => {
        const valid = results.filter(Boolean) as GeneratedImage[];
        setImages(valid);
        localStorage.setItem('infographic-gallery', JSON.stringify(valid));
      });
    } catch { /* ignore */ }
  }, []);

  // Persist images to localStorage on every change
  useEffect(() => {
    if (images.length > 0)
      try { localStorage.setItem('infographic-gallery', JSON.stringify(images)); } catch { /* quota */ }
  }, [images]);

  const generate = async (
    prompt: string,
    resolution: string,
    aspect_ratio: string,
    parsedContent: InfographicContent,
    style: StyleConfig
  ) => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, resolution, aspect_ratio, output_format: 'png' }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Generation failed');
    return {
      id: Date.now().toString(),
      url: data.imageUrl,
      prompt,
      createdAt: new Date(),
      content: parsedContent,
      style,
    };
  };

  const handleGenerate = async () => {
    if (!content.trim()) { setError('Please enter some content first'); return; }
    setIsGenerating(true);
    setError(null);
    try {
      const parsedContent = parseUserContent(content);
      const prompt = buildInfographicPrompt(parsedContent, styleConfig);
      const img = await generate(prompt, styleConfig.resolution, styleConfig.aspectRatio, parsedContent, styleConfig);
      setImages(prev => [img, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (image: GeneratedImage) => {
    setIsGenerating(true);
    setError(null);
    try {
      const img = await generate(image.prompt, image.style.resolution, image.style.aspectRatio, image.content, image.style);
      setImages(prev => [img, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id: string) => setImages(prev => prev.filter(img => img.id !== id));

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Sparkles size={15} color="white" />
          </div>
          <div>
            <div className="brand-name">Infographic Studio</div>
            <div className="brand-sub">AI-powered visual design</div>
          </div>
        </div>

        {/* Scrollable form */}
        <div className="sidebar-body">
          <ContentInput value={content} onChange={setContent} />
          <div className="divider" />
          <StyleConfigPanel config={styleConfig} onChange={setStyleConfig} />
        </div>

        {/* Footer: error + generate */}
        <div className="sidebar-footer">
          {error && (
            <div className="error-banner">
              <AlertCircle size={13} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
              <span className="error-text">{error}</span>
              <button className="error-close" onClick={() => setError(null)} aria-label="Dismiss">
                <X size={12} />
              </button>
            </div>
          )}

          <button
            className={`generate-btn${isGenerating || !content.trim() ? ' generate-btn--disabled' : ''}`}
            onClick={handleGenerate}
            disabled={isGenerating || !content.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Generating…</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Generate Infographic</span>
              </>
            )}
          </button>

          {isGenerating && (
            <p className="generate-hint">Usually takes 20–40 seconds</p>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-panel">
        <Gallery
          images={images}
          onRegenerate={handleRegenerate}
          onDelete={handleDelete}
          isGenerating={isGenerating}
        />
      </main>
    </div>
  );
}
