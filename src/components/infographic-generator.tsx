'use client';

import { buildInfographicPrompt, parseUserContent } from '@/lib/prompt-builder';
import { DEFAULT_STYLE_CONFIG, GeneratedImage, InfographicContent, StyleConfig } from '@/types';
import { AlertCircle, Loader2, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { ContentInput } from './content-input';
import { Gallery } from './gallery';
import { StyleConfigPanel } from './style-config';

export function InfographicGenerator() {
  const [content, setContent] = useState('');
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(DEFAULT_STYLE_CONFIG);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (prompt: string, resolution: string, aspect_ratio: string, parsedContent: InfographicContent, style: StyleConfig) => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, resolution, aspect_ratio, output_format: 'png' }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Generation failed');
    return { id: Date.now().toString(), url: data.imageUrl, prompt, createdAt: new Date(), content: parsedContent, style };
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>

      {/* ── Left sidebar ── */}
      <aside style={{
        width: 340,
        minWidth: 340,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--border)',
        background: 'var(--card)',
      }}>
        {/* Logo */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #f97316, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Sparkles size={14} color="white" />
          </div>
          <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' }}>Infographic Studio</span>
        </div>

        {/* Scrollable form area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <div style={{ marginBottom: 20 }}>
            <ContentInput value={content} onChange={setContent} />
          </div>
          <StyleConfigPanel config={styleConfig} onChange={setStyleConfig} />
        </div>

        {/* Sticky generate button */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'var(--card)' }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              padding: '10px 12px', borderRadius: 10, marginBottom: 12,
              background: '#fff5f5', border: '1px solid #fecaca',
            }}>
              <AlertCircle size={14} color="#ef4444" style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#b91c1c', flex: 1, lineHeight: 1.4 }}>{error}</span>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#b91c1c' }}>
                <X size={13} />
              </button>
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !content.trim()}
            style={{
              width: '100%',
              height: 44,
              borderRadius: 10,
              border: 'none',
              cursor: isGenerating || !content.trim() ? 'not-allowed' : 'pointer',
              background: isGenerating || !content.trim()
                ? '#d1d5db'
                : 'linear-gradient(135deg, #f97316 0%, #3b82f6 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'opacity 0.15s',
            }}
          >
            {isGenerating
              ? <><Loader2 size={15} className="animate-spin" /> Generating…</>
              : <><Sparkles size={15} /> Generate Infographic</>
            }
          </button>
          {isGenerating && (
            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
              Usually takes 20–40 seconds
            </p>
          )}
        </div>
      </aside>

      {/* ── Right panel ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
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
