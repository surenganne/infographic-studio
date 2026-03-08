'use client';

import { DEFAULT_STYLE_CONFIG, StyleConfig } from '@/types';

interface StyleConfigProps {
  config: StyleConfig;
  onChange: (config: StyleConfig) => void;
}

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '1:1',  label: '1:1'  },
  { value: '4:3',  label: '4:3'  },
] as const;

const RESOLUTIONS = ['1K', '2K', '4K'] as const;

const FONT_STYLES = [
  { value: 'switzer',     label: 'Switzer'     },
  { value: 'handwritten', label: 'Handwritten' },
  { value: 'modern',      label: 'Modern'      },
  { value: 'classic',     label: 'Classic'     },
] as const;

const DIAGRAM_STYLES = [
  { value: 'infographic', label: '🎨 Infographic', desc: 'Illustrated poster'   },
  { value: 'technical',   label: '🔧 Technical',   desc: 'Architecture diagram' },
  { value: 'flowchart',   label: '🔀 Flowchart',   desc: 'Process / steps'      },
  { value: 'comparison',  label: '⚖️ Comparison',  desc: 'Side-by-side table'   },
] as const;

function SectionLabel({ text }: { text: string }) {
  return <p className="section-label">{text}</p>;
}

// Active style using the indigo primary
const activeStyle = {
  border: '1.5px solid var(--primary)',
  background: 'var(--primary-soft)',
  color: 'var(--primary-text)',
};

const inactiveStyle = {
  border: '1.5px solid var(--border)',
  background: 'var(--bg)',
  color: 'var(--text-muted)',
};

export function StyleConfigPanel({ config, onChange }: StyleConfigProps) {
  const update = (u: Partial<StyleConfig>) => onChange({ ...config, ...u });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>Style</span>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_STYLE_CONFIG)}
          style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', textUnderlineOffset: 2 }}
        >
          Reset
        </button>
      </div>

      {/* Diagram type */}
      <div style={{ marginBottom: 18 }}>
        <SectionLabel text="Diagram Type" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {DIAGRAM_STYLES.map(d => {
            const active = config.diagramStyle === d.value;
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => update({ diagramStyle: d.value })}
                style={{
                  padding: '9px 10px', borderRadius: 8,
                  ...(active ? activeStyle : inactiveStyle),
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.12s', textAlign: 'left',
                }}
              >
                <div>{d.label}</div>
                <div style={{ fontSize: 10, color: active ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 400, marginTop: 2 }}>
                  {d.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div style={{ marginBottom: 18 }}>
        <SectionLabel text="Colors" />
        <div className="color-row">
          {([['Primary', 'primaryColor'], ['Secondary', 'secondaryColor']] as const).map(([lbl, key]) => (
            <div key={key} className="color-swatch">
              <input type="color" value={config[key]} onChange={e => update({ [key]: e.target.value })} title={`${lbl} color`} />
              <div>
                <div className="color-swatch__label">{lbl}</div>
                <div className="color-swatch__hex">{config[key]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aspect ratio */}
      <div style={{ marginBottom: 18 }}>
        <SectionLabel text="Aspect Ratio" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {ASPECT_RATIOS.map(r => {
            const active = config.aspectRatio === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => update({ aspectRatio: r.value })}
                style={{ padding: '8px 4px', borderRadius: 8, ...(active ? activeStyle : inactiveStyle), fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s' }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resolution */}
      <div style={{ marginBottom: 18 }}>
        <SectionLabel text="Resolution" />
        <div style={{ display: 'flex', gap: 6 }}>
          {RESOLUTIONS.map(res => {
            const active = config.resolution === res;
            return (
              <button
                key={res}
                type="button"
                onClick={() => update({ resolution: res })}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 8,
                  border: `1.5px solid ${active ? 'var(--purple)' : 'var(--border)'}`,
                  background: active ? 'var(--purple-soft)' : 'var(--bg)',
                  color: active ? 'var(--purple-text)' : 'var(--text-muted)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s',
                }}
              >
                {res}
              </button>
            );
          })}
        </div>
      </div>

      {/* Font */}
      <div>
        <SectionLabel text="Font Style" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {FONT_STYLES.map(f => {
            const active = config.fontStyle === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => update({ fontStyle: f.value })}
                style={{ padding: '8px 4px', borderRadius: 8, ...(active ? activeStyle : inactiveStyle), fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s' }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
