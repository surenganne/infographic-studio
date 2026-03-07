'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ContentInputProps {
  value: string;
  onChange: (value: string) => void;
}

const EXAMPLE = `How AI is Transforming Healthcare

Diagnosis:
• AI-powered imaging detects diseases earlier
• Machine learning predicts patient health risks
• NLP transcribes and organizes medical notes

Treatment:
• Personalized medicine via genetic analysis
• Robot-assisted surgeries with greater precision
• Drug discovery accelerated by AI simulations

Future:
• AI enables preventive healthcare
• Remote monitoring becomes standard
• Healthcare costs decrease significantly`;

export function ContentInput({ value, onChange }: ContentInputProps) {
  const [showTips, setShowTips] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>Content</label>
        <button
          type="button"
          onClick={() => setShowTips(!showTips)}
          style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Tips {showTips ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
      </div>

      {showTips && (
        <div style={{ padding: '8px 10px', borderRadius: 8, background: '#eff6ff', marginBottom: 8, fontSize: 11, color: '#1d4ed8', lineHeight: 1.6 }}>
          <p>• First line → title</p>
          <p>• Lines ending with <code>:</code> → sections</p>
          <p>• Lines with <code>•</code> / <code>-</code> → bullets</p>
        </div>
      )}

      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={`Your Title\n\nSection:\n• Key point\n• Another point`}
        rows={11}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--background)',
          color: 'var(--foreground)',
          fontSize: 12,
          fontFamily: 'var(--font-geist-mono), monospace',
          lineHeight: 1.6,
          resize: 'none',
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => (e.target.style.borderColor = '#f97316')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <button
          type="button"
          onClick={() => onChange(EXAMPLE)}
          style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', textUnderlineOffset: 2 }}
        >
          Load example
        </button>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{value.length} chars</span>
      </div>
    </div>
  );
}
