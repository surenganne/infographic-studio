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

  return `TYPOGRAPHY REQUIREMENT: Use ${getFontDescription(style.fontStyle)}. This applies to every single piece of text in the image without exception.

Create a vertical infographic in a premium hand-drawn technical illustration style.

Title: ${content.title}

Content:
${sections}
${content.additionalNotes ? `\nAdditional context: ${content.additionalNotes}` : ''}

Visual style:
- Sketchy cartoon aesthetic with confident ink lines, subtle watercolor-like fills, and a professional whiteboard feel
- Background: pure white (#FFFFFF). Line work: dark gray (#2A2A2A), not pure black
- Color palette: 90% grayscale base with selective color pops — use ${style.primaryColor} and ${style.secondaryColor} as accent highlights only, not dominant fills
- Subtle gradient washes where the two accent colors meet
- Clean geometric shapes with organic edges for that sketchy-but-crisp look
- Small hand-drawn arrows and connectors between elements
- Subtle drop shadows under main elements; subtle grain texture for premium feel
- Clear visual hierarchy with generous white space
- Aspect ratio ${style.aspectRatio}
- Style reference: "Notion's illustration style but more technical"
- Add a small subtle credit line at the bottom: "Created by ${AUTHOR_CREDIT}"`;
}

// ─── Technical Diagram ───────────────────────────────────────────────────────

function buildTechnicalDiagram(content: InfographicContent, style: StyleConfig): string {
  const components = content.sections
    .map(s => `${s.heading}: ${s.points.join(', ')}`)
    .join('\n');

  return `TYPOGRAPHY REQUIREMENT: Use ${getFontDescription(style.fontStyle)}. This applies to every single piece of text in the image without exception.

Create a clean technical architecture diagram:

Title: ${content.title}

FONT: ${getFontDescription(style.fontStyle)}. Apply this font style to ALL labels and text.

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

  return `TYPOGRAPHY REQUIREMENT: Use ${getFontDescription(style.fontStyle)}. This applies to every single piece of text in the image without exception.

Create a clear process flowchart:

Title: ${content.title}

FONT: ${getFontDescription(style.fontStyle)}. Apply this font style to ALL text.

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

  return `TYPOGRAPHY REQUIREMENT: Use ${getFontDescription(style.fontStyle)}. This applies to every single piece of text in the image without exception.

Create a side-by-side comparison chart:

Title: ${content.title}

FONT: ${getFontDescription(style.fontStyle)}. Apply this font style to ALL text.

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
    case 'switzer':
      return 'clean geometric sans-serif typography — precise, modern, evenly-spaced letterforms with uniform stroke weight';
    case 'handwritten':
      return 'entirely hand-lettered typography — every word looks hand-drawn with a marker or brush pen, irregular baseline, natural ink variation, like a whiteboard or sketchbook';
    case 'modern':
      return 'rounded friendly sans-serif typography — soft terminals, open apertures, warm and approachable letterforms';
    case 'classic':
      return 'elegant serif typography — high contrast thick/thin strokes, bracketed serifs, editorial and authoritative feel';
    default:
      return 'clean geometric sans-serif typography';
  }
}

// ─── Content parser ───────────────────────────────────────────────────────────

/**
 * Splits a raw text blob into logical lines.
 * Handles both newline-separated and single-blob inputs where sections are
 * separated by a pattern like "HeadingWords Description..." run together.
 * Inserts a newline before each detected section boundary so the line parser works.
 */
function normalizeLines(rawText: string): string[] {
  // Insert newline before patterns like: "Word Word Word Capital-sentence..."
  // i.e. 1–5 title-cased words immediately followed by a capital letter + long text
  // This splits "...end of prev section.NextHeading Description..." correctly.
  const split = rawText
    .replace(/([.!?])\s+((?:[A-Z][a-zA-Z0-9\-]*\s+){1,4}[A-Z][a-zA-Z0-9\-]*)\s+([A-Z])/g,
      (_, punct, heading, nextCap) => `${punct}\n${heading} ${nextCap}`)
    // Also split on newlines that already exist
    .split('\n');

  return split.map(l => l.trim()).filter(Boolean);
}

/**
 * Given a single line, detect if it starts with a short heading followed by its description.
 * Returns { heading, description } or null.
 */
function detectInlineHeading(line: string): { heading: string; description: string } | null {
  const match = line.match(/^((?:[A-Z][a-zA-Z0-9\-]*(?:\s+[A-Z][a-zA-Z0-9\-]*){0,4}))\s+([A-Z].{15,})$/);
  if (!match) return null;
  const heading = match[1].trim();
  const description = match[2].trim();
  if (heading.length > 60) return null;
  // Strip repeated heading at start of description (e.g. "Patient360 Patient360 is a...")
  const descStripped = description.toLowerCase().startsWith(heading.toLowerCase() + ' ')
    ? description.slice(heading.length + 1).trim()
    : description;
  return { heading, description: descStripped };
}

export function parseUserContent(rawText: string): InfographicContent {
  const lines = normalizeLines(rawText);
  let title = 'Infographic';
  const sections: InfographicContent['sections'] = [];
  let currentSection: InfographicContent['sections'][0] | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // First non-bullet line becomes the overall title
    if (title === 'Infographic' && !trimmed.startsWith('•') && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
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

    // Inline heading: "SectionName Description..."
    const inline = detectInlineHeading(trimmed);
    if (inline) {
      if (currentSection) sections.push(currentSection);
      currentSection = { heading: inline.heading, points: [inline.description] };
      continue;
    }

    // Plain continuation text — add to current section or start a generic one
    if (currentSection) {
      currentSection.points.push(trimmed);
    } else {
      currentSection = { heading: 'Overview', points: [trimmed] };
    }
  }

  if (currentSection) sections.push(currentSection);

  // Deduplicate sections by heading (case-insensitive), keep first occurrence
  const seen = new Set<string>();
  const deduped = sections.filter(s => {
    const key = s.heading.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (deduped.length === 0) {
    deduped.push({ heading: 'Overview', points: lines });
  }

  return { title, sections: deduped };
}

export function generateBatchPrompts(content: InfographicContent, style: StyleConfig, variations = 3): string[] {
  return Array.from({ length: variations }, (_, i) => {
    const base = buildInfographicPrompt(content, style);
    if (i === 0) return base;
    if (i === 1) return base + '\n\nVariation: use a slightly more colorful palette with stronger color contrast';
    return base + '\n\nVariation: emphasize visual hierarchy with larger icons and bolder section dividers';
  });
}
