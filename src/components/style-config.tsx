'use client';

import { DEFAULT_STYLE_CONFIG, StyleConfig } from '@/types';

interface StyleConfigProps {
  config: StyleConfig;
  onChange: (config: StyleConfig) => void;
}

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
] as const;

const RESOLUTIONS = ['1K', '2K', '4K'] as const;

const FONT_STYLES = [
  { value: 'switzer', label: 'Switzer' },
  { value: 'handwritten', label: 'Handwritten' },
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
] as const;

const label = (text: string) => (
  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{text}</p>
);

export function StyleConfigPanel({ config, onChange }: StyleConfigProps) {
  const update = (u: Partial<StyleConfig>) => onChange({ ...config, ...u });

  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>Style</span>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_STYLE_CONFIG)}
          style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', textUnderlineOffset: 2 }}
        >
          Reset
        </button>
      </div>

      {/* Colors */}
      <div style={{ marginBottom: 16 }}>
        {label('Colors')}
        <div style={{ display: 'flex', gap: 8 }}>
          {([['Primary', 'primaryColor'], ['Secondary', 'secondaryColor']] as const).map(([lbl, key]) => (
            <div key={key} style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--background)',
            }}>
              <input
                type="color"
                value={config[key]}
                onChange={e => update({ [key]: e.target.value })}
                style={{ width: 24, height: 24, borderRadius: 6, border: 'none', padding: 0, cursor: 'pointer', background: 'none' }}
              />
              <div>
                <p style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1 }}>{lbl}</p>
                <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--foreground)', marginTop: 2 }}>{config[key]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aspect ratio */}
      <div style={{ marginBottom: 16 }}>
        {label('Aspect Ratio')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {ASPECT_RATIOS.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => update({ aspectRatio: r.value })}
              style={{
                padding: '7px 4px',
                borderRadius: 8,
                border: `1px solid ${config.aspectRatio === r.value ? '#f97316' : 'var(--border)'}`,
                background: config.aspectRatio === r.value ? '#fff7ed' : 'var(--background)',
                color: config.aspectRatio === r.value ? '#c2410c' : 'var(--muted)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resolution */}
      <div style={{ marginBottom: 16 }}>
        {label('Resolution')}
        <div style={{ display: 'flex', gap: 6 }}>
          {RESOLUTIONS.map(res => (
            <button
              key={res}
              type="button"
              onClick={() => update({ resolution: res })}
              style={{
                flex: 1,
                padding: '7px 4px',
                borderRadius: 8,
                border: `1px solid ${config.resolution === res ? '#3b82f6' : 'var(--border)'}`,
                background: config.resolution === res ? '#eff6ff' : 'var(--background)',
                color: config.resolution === res ? '#1d4ed8' : 'var(--muted)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* Font */}
      <div>
        {label('Font Style')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {FONT_STYLES.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => update({ fontStyle: f.value })}
              style={{
                padding: '7px 4px',
                borderRadius: 8,
                border: `1px solid ${config.fontStyle === f.value ? '#f97316' : 'var(--border)'}`,
                background: config.fontStyle === f.value ? '#fff7ed' : 'var(--background)',
                color: config.fontStyle === f.value ? '#c2410c' : 'var(--muted)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
