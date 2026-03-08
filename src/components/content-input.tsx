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
        <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
          Content
        </label>
        <button
          type="button"
          onClick={() => setShowTips(!showTips)}
          style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 11, color: 'var(--text-muted)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          Format tips {showTips ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
      </div>

      {showTips && (
        <div className="tips-box">
          <p>• First line becomes the title</p>
          <p>• Lines ending with <code style={{ background: '#dbeafe', padding: '0 3px', borderRadius: 3 }}>:</code> become section headings</p>
          <p>• Lines starting with <code style={{ background: '#dbeafe', padding: '0 3px', borderRadius: 3 }}>•</code> or <code style={{ background: '#dbeafe', padding: '0 3px', borderRadius: 3 }}>-</code> become bullet points</p>
        </div>
      )}

      <textarea
        className="content-textarea"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={`Your Title\n\nSection One:\n• Key point here\n• Another point\n\nSection Two:\n• More details`}
        rows={12}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        <button
          type="button"
          onClick={() => onChange(EXAMPLE)}
          style={{
            fontSize: 11, color: 'var(--text-muted)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            textDecoration: 'underline', textUnderlineOffset: 2,
          }}
        >
          Load example
        </button>
        {value.length > 0 && (
          <span style={{ fontSize: 11, color: 'var(--text-light)' }}>{value.length} chars</span>
        )}
      </div>
    </div>
  );
}
