import { InfographicContent, StyleConfig } from '@/types';

const AUTHOR_CREDIT = 'Minfy Technologies Private Limited';

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

  return `Create a vertical infographic in a premium hand-drawn technical illustration style.

Title: ${content.title}

Content:
${sections}
${content.additionalNotes ? `\nAdditional context: ${content.additionalNotes}` : ''}

Visual style:
- Sketchy cartoon aesthetic with confident ink lines, subtle watercolor-like fills, and a professional whiteboard feel
- Background: pure white (#FFFFFF). Line work: dark gray (#2A2A2A), not pure black
- Color palette: 90% grayscale base with selective color pops — use ${style.primaryColor} and ${style.secondaryColor} as accent highlights only, not dominant fills
- Subtle gradient washes where the two accent colors meet
- Hand-lettered titles in Switzer font style; smaller annotations in clean handwriting style
- Clean geometric shapes with organic edges for that sketchy-but-crisp look
- Small hand-drawn arrows and connectors between elements
- Subtle drop shadows under main elements; subtle grain texture for premium feel
- Clear visual hierarchy with generous white space
- Aspect ratio ${style.aspectRatio}
- Style reference: "Notion's illustration style but more technical" — premium tech startup explainer meets hand-sketched designer
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

/**
 * Detects if a line starts with a short title phrase followed by its description.
 * Pattern: "TitleWords Description sentence..." where the title is 1–5 words,
 * each capitalised, and the rest is a longer description.
 * Returns { heading, description } or null.
 */
function detectInlineHeading(line: string): { heading: string; description: string } | null {
  // Match 1–5 title-cased words at the start, followed by a space and more text
  const match = line.match(/^((?:[A-Z][a-zA-Z0-9\-]*(?:\s+[A-Z][a-zA-Z0-9\-]*){0,4}))\s{1,2}([A-Z].{20,})$/);
  if (!match) return null;
  const heading = match[1].trim();
  const description = match[2].trim();
  // Avoid treating normal sentences as headings (heading must be < 60 chars)
  if (heading.length > 60) return null;
  // If description starts with the same heading text (repeated title), strip it
  const descStripped = description.startsWith(heading + ' ')
    ? description.slice(heading.length + 1).trim()
    : description;
  return { heading, description: descStripped };
}

export function parseUserContent(rawText: string): InfographicContent {
  const lines = rawText.trim().split('\n').filter(l => l.trim());
  let title = 'Infographic';
  const sections: InfographicContent['sections'] = [];
  let currentSection: InfographicContent['sections'][0] | null = null;
  let additionalNotes = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // First non-bullet line becomes the title
    if (title === 'Infographic' && trimmed && !trimmed.startsWith('•') && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
      title = trimmed;
      continue;
    }

    // Explicit heading: ends with colon, or is ALL CAPS (short)
    if (trimmed.endsWith(':') || (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 50)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { heading: trimmed.replace(/:$/, ''), points: [] };
      continue;
    }

    // Bullet point
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const point = trimmed.replace(/^[•\-*]\s*/, '');
      if (currentSection) {
        currentSection.points.push(point);
      } else {
        currentSection = { heading: 'Key Points', points: [point] };
      }
      continue;
    }

    // Inline heading pattern: "SectionName Description text..."
    const inline = detectInlineHeading(trimmed);
    if (inline) {
      if (currentSection) sections.push(currentSection);
      currentSection = { heading: inline.heading, points: [inline.description] };
      continue;
    }

    // Plain text — append to current section as a point, or to notes
    if (trimmed.length > 0) {
      if (currentSection) {
        currentSection.points.push(trimmed);
      } else {
        additionalNotes += (additionalNotes ? ' ' : '') + trimmed;
      }
    }
  }

  if (currentSection) sections.push(currentSection);

  // Deduplicate sections by heading (case-insensitive)
  const seen = new Set<string>();
  const dedupedSections = sections.filter(s => {
    const key = s.heading.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (dedupedSections.length === 0) {
    dedupedSections.push({
      heading: 'Overview',
      points: lines.filter(l => l.trim()).map(l => l.replace(/^[•\-*]\s*/, '')),
    });
  }

  return { title, sections: dedupedSections, additionalNotes: additionalNotes || undefined };
}

export function generateBatchPrompts(content: InfographicContent, style: StyleConfig, variations = 3): string[] {
  return Array.from({ length: variations }, (_, i) => {
    const base = buildInfographicPrompt(content, style);
    if (i === 0) return base;
    if (i === 1) return base + '\n\nVariation: use a slightly more colorful palette with stronger color contrast';
    return base + '\n\nVariation: emphasize visual hierarchy with larger icons and bolder section dividers';
  });
}
