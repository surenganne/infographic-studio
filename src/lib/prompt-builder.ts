import { InfographicContent, StyleConfig } from '@/types';

const AUTHOR_CREDIT = 'Surendra Ganne';

export function buildInfographicPrompt(content: InfographicContent, style: StyleConfig): string {
  switch (style.diagramStyle) {
    case 'technical':  return buildTechnicalDiagram(content, style);
    case 'flowchart':  return buildFlowchart(content, style);
    case 'comparison': return buildComparison(content, style);
    default:           return buildInfographic(content, style);
  }
}

// ─── Infographic ─────────────────────────────────────────────────────────────

function buildInfographic(content: InfographicContent, style: StyleConfig): string {
  const sections = content.sections
    .map(s => `${s.heading}:\n${s.points.map(p => `  - ${p}`).join('\n')}`)
    .join('\n\n');

  return `Design a beautiful, professional infographic poster with the following content:

Title: ${content.title}

${sections}
${content.additionalNotes ? `\nNote: ${content.additionalNotes}` : ''}

Visual style:
- Clean editorial layout with ${content.sections.length} distinct sections, each in a card with a colored header
- Primary color ${style.primaryColor}, secondary color ${style.secondaryColor}, background ${style.backgroundColor}
- ${getFontDescription(style.fontStyle)} typography
- Small icons next to each section heading
- Aspect ratio ${style.aspectRatio}
- High quality, print-ready design
- Add a small subtle credit line at the bottom: "Created by ${AUTHOR_CREDIT}"`;
}

// ─── Technical Diagram ───────────────────────────────────────────────────────

function buildTechnicalDiagram(content: InfographicContent, style: StyleConfig): string {
  const components = content.sections
    .map(s => `${s.heading}: ${s.points.join(', ')}`)
    .join('\n');

  return `Create a clean technical architecture diagram:

Title: ${content.title}

Components and connections:
${components}
${content.additionalNotes ? `\nContext: ${content.additionalNotes}` : ''}

Style:
- Boxes connected by labeled arrows showing data/request flow
- Left-to-right or top-to-bottom layout
- Primary color ${style.primaryColor} for main components, ${style.secondaryColor} for secondary
- White background, clean sans-serif labels
- Aspect ratio ${style.aspectRatio}
- Add a small subtle credit line at the bottom: "Created by ${AUTHOR_CREDIT}"`;
}

// ─── Flowchart ────────────────────────────────────────────────────────────────

function buildFlowchart(content: InfographicContent, style: StyleConfig): string {
  const steps = content.sections
    .map((s, i) => `Step ${i + 1} — ${s.heading}: ${s.points.join('; ')}`)
    .join('\n');

  return `Create a clear process flowchart:

Title: ${content.title}

Steps in order:
${steps}
${content.additionalNotes ? `\nNotes: ${content.additionalNotes}` : ''}

Style:
- Rectangles for process steps, diamonds for decisions, rounded pills for start/end
- Arrows connecting steps top-to-bottom
- Step numbers in circles, primary color ${style.primaryColor}
- Clean white background, ${getFontDescription(style.fontStyle)} font
- Aspect ratio ${style.aspectRatio}
- Add a small subtle credit line at the bottom: "Created by ${AUTHOR_CREDIT}"`;
}

// ─── Comparison ───────────────────────────────────────────────────────────────

function buildComparison(content: InfographicContent, style: StyleConfig): string {
  const columns = content.sections
    .map((s, i) => `Column ${i + 1} "${s.heading}": ${s.points.join(' | ')}`)
    .join('\n');

  return `Create a side-by-side comparison chart:

Title: ${content.title}

${columns}
${content.additionalNotes ? `\nFooter: ${content.additionalNotes}` : ''}

Style:
- ${content.sections.length} equal columns with colored headers
- Column 1 header: ${style.primaryColor}, Column 2 header: ${style.secondaryColor}
- Alternating row backgrounds for readability
- Checkmarks or icons where appropriate
- Background ${style.backgroundColor}, ${getFontDescription(style.fontStyle)} font
- Aspect ratio ${style.aspectRatio}
- Add a small subtle credit line at the bottom: "Created by ${AUTHOR_CREDIT}"`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getFontDescription(fontStyle: StyleConfig['fontStyle']): string {
  switch (fontStyle) {
    case 'handwritten': return 'casual handwritten marker style';
    case 'modern':      return 'clean modern sans-serif';
    case 'classic':     return 'classic serif';
    default:            return 'clean geometric sans-serif';
  }
}

// ─── Content parser ───────────────────────────────────────────────────────────

export function parseUserContent(rawText: string): InfographicContent {
  const lines = rawText.trim().split('\n').filter(l => l.trim());
  let title = 'Infographic';
  const sections: InfographicContent['sections'] = [];
  let currentSection: InfographicContent['sections'][0] | null = null;
  let additionalNotes = '';

  for (const line of lines) {
    const trimmed = line.trim();

    if (title === 'Infographic' && trimmed && !trimmed.startsWith('•') && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
      title = trimmed;
      continue;
    }

    if (trimmed.endsWith(':') || (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 50)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { heading: trimmed.replace(/:$/, ''), points: [] };
      continue;
    }

    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const point = trimmed.replace(/^[•\-*]\s*/, '');
      if (currentSection) {
        currentSection.points.push(point);
      } else {
        currentSection = { heading: 'Key Points', points: [point] };
      }
      continue;
    }

    if (trimmed.length > 0) additionalNotes += (additionalNotes ? ' ' : '') + trimmed;
  }

  if (currentSection) sections.push(currentSection);

  if (sections.length === 0) {
    sections.push({
      heading: 'Overview',
      points: lines.filter(l => l.trim()).map(l => l.replace(/^[•\-*]\s*/, '')),
    });
  }

  return { title, sections, additionalNotes: additionalNotes || undefined };
}

export function generateBatchPrompts(content: InfographicContent, style: StyleConfig, variations = 3): string[] {
  return Array.from({ length: variations }, (_, i) => {
    const base = buildInfographicPrompt(content, style);
    if (i === 0) return base;
    if (i === 1) return base + '\n\nVariation: use a slightly more colorful palette with stronger color contrast';
    return base + '\n\nVariation: emphasize visual hierarchy with larger icons and bolder section dividers';
  });
}
