import { InfographicContent, StyleConfig } from '@/types';

export function buildInfographicPrompt(content: InfographicContent, style: StyleConfig): string {
  const sections = content.sections
    .map((s, i) => `${i + 1}. ${s.heading}:\n${s.points.map(p => `   • ${p}`).join('\n')}`)
    .join('\n\n');

  const notes = content.additionalNotes ? `\nAdditional context: ${content.additionalNotes}` : '';

  switch (style.diagramStyle) {
    case 'technical':
      return buildTechnicalDiagram(content.title, sections, notes, style);
    case 'flowchart':
      return buildFlowchart(content.title, sections, notes, style);
    case 'comparison':
      return buildComparison(content.title, sections, notes, style);
    default:
      return buildInfographic(content.title, sections, notes, style);
  }
}

function buildInfographic(title: string, sections: string, notes: string, style: StyleConfig): string {
  return `Create a professional infographic poster with this exact content:

Title: "${title}"

Sections:
${sections}
${notes}

Visual style:
- Hand-drawn technical illustration, confident ink lines, subtle watercolor fills
- Whiteboard/sketchnote aesthetic — "premium startup explainer meets hand-sketched designer"
- Primary accent: ${style.primaryColor}, Secondary accent: ${style.secondaryColor}
- Background: ${style.backgroundColor}, Line work: ${style.lineWorkColor}
- 90% grayscale base with selective color pops on key elements
- ${style.aspectRatio} layout with clear visual hierarchy and generous white space
- Mix of icons, diagrams, and text — hand-drawn arrows and connectors
- Clean geometric shapes with organic edges, subtle grain texture
- Font style: ${getFontDescription(style.fontStyle)}
- Each section gets its own visual zone with a distinct icon or illustration
- Avoid: corporate stiffness, too many colors, cluttered composition`;
}

function buildTechnicalDiagram(title: string, sections: string, notes: string, style: StyleConfig): string {
  return `Create a clean technical architecture diagram / explainer poster with this content:

Title: "${title}"

Content sections (each becomes a labeled panel or zone in the diagram):
${sections}
${notes}

Visual style — match this exact aesthetic:
- Clean whiteboard-style diagram on a white or very light background
- Rounded rectangle boxes with thin borders for each component/concept
- Color-coded sections: use ${style.primaryColor} and ${style.secondaryColor} as accent colors for borders and headers
- Directional arrows with labels showing relationships and data flow between components
- Small icons or simple illustrations inside each box to represent concepts
- Bold, clear sans-serif title at the top
- Section labels in colored header bars inside each panel
- Numbered steps or flow indicators where sequence matters
- Dashed borders for grouping related components (like "MCP Host" grouping in the reference)
- Clean typography — labels inside boxes, annotations along arrows
- ${style.aspectRatio} layout, portrait or landscape depending on content depth
- White space between panels, no clutter
- Professional technical documentation aesthetic — like a well-designed architecture whitepaper diagram`;
}

function buildFlowchart(title: string, sections: string, notes: string, style: StyleConfig): string {
  return `Create a clear process flowchart / step-by-step diagram with this content:

Title: "${title}"

Steps and decision points:
${sections}
${notes}

Visual style:
- Clean flowchart with standard shapes: rectangles for steps, diamonds for decisions, rounded rects for start/end
- Primary color ${style.primaryColor} for main flow path, ${style.secondaryColor} for alternate paths
- Numbered steps with clear directional arrows
- Each step has a short label and optional sub-text annotation
- Background: ${style.backgroundColor}
- Consistent spacing between nodes, left-to-right or top-to-bottom flow
- ${style.aspectRatio} layout
- Minimal, professional — no decorative elements, just clear process visualization
- Font: ${getFontDescription(style.fontStyle)}`;
}

function buildComparison(title: string, sections: string, notes: string, style: StyleConfig): string {
  return `Create a side-by-side comparison infographic with this content:

Title: "${title}"

Items to compare (each section = one column):
${sections}
${notes}

Visual style:
- Multi-column layout, one column per section/concept being compared
- Each column has a colored header using ${style.primaryColor} or ${style.secondaryColor} alternating
- Rows of comparison criteria with checkmarks, icons, or values
- Clean table-like structure but visually designed, not a plain table
- Background: ${style.backgroundColor}
- ${style.aspectRatio} layout
- Bold column headers, readable row labels
- Use icons to represent each comparison point
- Font: ${getFontDescription(style.fontStyle)}
- Professional, magazine-style comparison chart aesthetic`;
}

function getFontDescription(fontStyle: StyleConfig['fontStyle']): string {
  switch (fontStyle) {
    case 'handwritten': return 'casual handwritten / marker style';
    case 'modern': return 'clean modern sans-serif';
    case 'classic': return 'classic serif';
    default: return 'clean geometric sans-serif (Switzer-like)';
  }
}

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
      currentSection = { heading: trimmed.replace(':', ''), points: [] };
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
    sections.push({ heading: 'Overview', points: lines.filter(l => l.trim()).map(l => l.replace(/^[•\-*]\s*/, '')) });
  }

  return { title, sections, additionalNotes: additionalNotes || undefined };
}

export function generateBatchPrompts(content: InfographicContent, style: StyleConfig, variations = 3): string[] {
  return Array.from({ length: variations }, (_, i) => {
    const base = buildInfographicPrompt(content, style);
    if (i === 0) return base;
    if (i === 1) return base + '\n\nVariation: slightly more colorful palette';
    return base + '\n\nVariation: emphasize diagrams and flowcharts over text';
  });
}
