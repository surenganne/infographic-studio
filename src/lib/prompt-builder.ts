import { InfographicContent, StyleConfig } from '@/types';

export function buildInfographicPrompt(content: InfographicContent, style: StyleConfig): string {
  switch (style.diagramStyle) {
    case 'technical':  return buildTechnicalDiagram(content, style);
    case 'flowchart':  return buildFlowchart(content, style);
    case 'comparison': return buildComparison(content, style);
    default:           return buildInfographic(content, style);
  }
}

// ─── Infographic ────────────────────────────────────────────────────────────

function buildInfographic(content: InfographicContent, style: StyleConfig): string {
  const sectionList = content.sections
    .map((s, i) => `  Section ${i + 1} — "${s.heading}":\n${s.points.map(p => `    • ${p}`).join('\n')}`)
    .join('\n\n');

  return `Create a professional illustrated infographic poster. Every piece of text below MUST appear verbatim in the final image.

TITLE (large, top-center): "${content.title}"

SECTIONS — render each as a distinct visual card with an icon, heading, and bullet list:
${sectionList}
${content.additionalNotes ? `\nFOOTER NOTE: "${content.additionalNotes}"` : ''}

LAYOUT RULES:
- ${content.sections.length} cards arranged in a ${getGridLayout(content.sections.length)} grid
- Each card: rounded rectangle, thin border, section heading in a colored header bar, bullets below
- Primary accent color ${style.primaryColor} and secondary ${style.secondaryColor} used alternately on card headers
- Background ${style.backgroundColor}, body text color ${style.lineWorkColor}
- Small relevant icon top-left of each card header
- Generous padding inside cards, clear whitespace between cards
- Aspect ratio ${style.aspectRatio}

TYPOGRAPHY: ${getFontDescription(style.fontStyle)} — bold title, medium section headings, regular body text
STYLE: Clean editorial infographic — think high-quality tech blog or consulting slide deck
DO NOT omit any bullet point. DO NOT paraphrase — use the exact words provided.`;
}

// ─── Technical Diagram ──────────────────────────────────────────────────────

function buildTechnicalDiagram(content: InfographicContent, style: StyleConfig): string {
  const components = content.sections.map((s, i) => {
    const connections = s.points.map(p => `      → ${p}`).join('\n');
    return `  Component ${i + 1}: "${s.heading}"\n    Connections / details:\n${connections}`;
  }).join('\n\n');

  const arrowDescriptions = content.sections.flatMap((s, i) =>
    s.points.map(p => `  • Box "${s.heading}" → labeled arrow → "${p}"`)
  ).join('\n');

  return `Create a precise technical architecture diagram. Render EVERY component and connection listed below exactly as specified.

DIAGRAM TITLE (bold, top-center, large font): "${content.title}"

COMPONENTS AND THEIR CONNECTIONS:
${components}
${content.additionalNotes ? `\nADDITIONAL CONTEXT: ${content.additionalNotes}` : ''}

REQUIRED ARROWS (draw each one with a label):
${arrowDescriptions}

VISUAL SPECIFICATION:
- White or very light gray (#f8f8f8) background
- Each component = rounded rectangle box, 2px border
  • Use ${style.primaryColor} border for primary/source components (left side)
  • Use ${style.secondaryColor} border for secondary/target components (right side)
  • Use dashed border for grouping/container boxes
- Component label centered inside box, bold sans-serif, dark text
- Arrows: solid lines with filled arrowheads, short descriptive label along the arrow
- Group related components inside a larger dashed-border container with a label
- Layout: left-to-right data flow OR top-to-bottom hierarchy — choose whichever fits the content
- Aspect ratio: ${style.aspectRatio}
- Consistent spacing: equal gaps between all boxes, aligned on a grid
- NO decorative elements — purely functional diagram
- Small monochrome icon inside each box representing its role (server, database, user, API, etc.)

TYPOGRAPHY: Clean sans-serif throughout. Box labels 14–16px bold. Arrow labels 11–12px regular. Title 24px bold.
CRITICAL: Every single component name and arrow label from the list above must appear in the diagram. Do not omit or merge any.`;
}

// ─── Flowchart ───────────────────────────────────────────────────────────────

function buildFlowchart(content: InfographicContent, style: StyleConfig): string {
  const steps = content.sections.map((s, i) => {
    const isDecision = s.heading.includes('?') || s.points.some(p => p.toLowerCase().startsWith('if ') || p.toLowerCase().startsWith('yes') || p.toLowerCase().startsWith('no'));
    const shape = isDecision ? 'DIAMOND (decision)' : 'RECTANGLE (process step)';
    return `  Step ${i + 1}: ${shape}\n    Label: "${s.heading}"\n    Sub-text / branches:\n${s.points.map(p => `      • ${p}`).join('\n')}`;
  }).join('\n\n');

  return `Create an accurate process flowchart diagram. Render every step exactly as listed.

FLOWCHART TITLE (top-center, bold): "${content.title}"

STEPS IN ORDER (top to bottom):
${steps}
${content.additionalNotes ? `\nNOTES: ${content.additionalNotes}` : ''}

SHAPE RULES:
- Rounded rectangle (pill shape) = START and END nodes
- Rectangle = process / action step
- Diamond = decision / branch point (Yes/No or condition)
- Parallelogram = input or output

VISUAL SPECIFICATION:
- White background
- Main flow path: boxes filled with light ${style.primaryColor}15 tint, ${style.primaryColor} border
- Alternate/branch path: ${style.secondaryColor} border
- Arrows: solid lines, filled arrowheads, labeled where branching occurs
- Step number badge (circle) top-left of each box
- Consistent vertical spacing between steps — align all boxes on center axis
- Aspect ratio: ${style.aspectRatio}
- Each step label is bold, sub-text is smaller regular weight below it

TYPOGRAPHY: ${getFontDescription(style.fontStyle)}
CRITICAL: Steps must appear in the EXACT ORDER listed. Do not reorder, merge, or omit any step.`;
}

// ─── Comparison ──────────────────────────────────────────────────────────────

function buildComparison(content: InfographicContent, style: StyleConfig): string {
  const colCount = content.sections.length;
  const columns = content.sections.map((s, i) => {
    const color = i % 2 === 0 ? style.primaryColor : style.secondaryColor;
    return `  Column ${i + 1} — header color ${color}:\n    Title: "${s.heading}"\n    Points:\n${s.points.map((p, j) => `      Row ${j + 1}: "${p}"`).join('\n')}`;
  }).join('\n\n');

  // Build row labels from the first section's points as reference
  const rowLabels = content.sections[0]?.points.map((_, i) => `Row ${i + 1}`) ?? [];

  return `Create a clean side-by-side comparison chart. Render every column and row exactly as listed.

CHART TITLE (top-center, large bold): "${content.title}"

COLUMNS (${colCount} total, equal width, side by side):
${columns}
${content.additionalNotes ? `\nFOOTER: "${content.additionalNotes}"` : ''}

LAYOUT SPECIFICATION:
- ${colCount} equal-width columns side by side
- Row 0 (header row): each column's title in a colored rounded header badge
  ${content.sections.map((s, i) => `Column ${i + 1} header: "${s.heading}" with background ${i % 2 === 0 ? style.primaryColor : style.secondaryColor}`).join(', ')}
- Rows 1–N: alternating white / light gray (#f5f5f5) row backgrounds for readability
- Each cell: centered text, consistent padding
- Thin vertical dividers between columns
- Left-most column can optionally show a row label / criterion name
- Checkmark ✓ or ✗ icons where values are yes/no
- Aspect ratio: ${style.aspectRatio}
- Background: ${style.backgroundColor}

TYPOGRAPHY: ${getFontDescription(style.fontStyle)} — bold column headers, regular cell text
CRITICAL: Every row value must appear in its correct column. Do not swap, omit, or merge any cell.`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGridLayout(count: number): string {
  if (count <= 2) return '1×2';
  if (count <= 3) return '1×3';
  if (count <= 4) return '2×2';
  if (count <= 6) return '2×3';
  return '3×3';
}

function getFontDescription(fontStyle: StyleConfig['fontStyle']): string {
  switch (fontStyle) {
    case 'handwritten': return 'casual handwritten marker style (like a whiteboard)';
    case 'modern':      return 'clean modern sans-serif (Inter / Helvetica style)';
    case 'classic':     return 'classic serif (Georgia / Times style)';
    default:            return 'clean geometric sans-serif (Switzer / Futura style)';
  }
}

// ─── Content parser ──────────────────────────────────────────────────────────

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
