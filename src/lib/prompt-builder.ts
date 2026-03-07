import { InfographicContent, StyleConfig } from '@/types';

export function buildInfographicPrompt(
  content: InfographicContent,
  style: StyleConfig
): string {
  const contentSections = content.sections
    .map((section, index) => {
      const points = section.points.map((point) => `• ${point}`).join('\n');
      return `${index + 1}. ${section.heading}:\n${points}`;
    })
    .join('\n\n');

  const prompt = `Create a technical infographic in a clean, sketchy cartoon style with these exact specifications:

Style: Hand-drawn technical illustration with confident ink lines, subtle watercolor-like fills, and professional whiteboard aesthetic. Think "premium tech startup explainer" meets "hand-sketched by a designer"

Color palette:
- Primary: ${style.primaryColor} (Orange) as accent highlight
- Secondary: ${style.secondaryColor} (Blue) as accent highlight
- Base: 90% grayscale with selective color pops
- Background: ${style.backgroundColor}
- Line work: ${style.lineWorkColor} not pure black
- Subtle gradient washes where orange meets blue

Layout: ${style.aspectRatio} infographic with clear hierarchy, generous white space, hand-lettered titles in ${getFontDescription(style.fontStyle)} style, smaller annotations in clean handwriting style

Title: ${content.title}

Content to visualize:
${contentSections}
${content.additionalNotes ? `\nAdditional Notes: ${content.additionalNotes}` : ''}

Technical details:
- Mix of diagrams, icons, and text hierarchy
- Include small hand-drawn arrows and connectors
- Add subtle shadows under main elements
- Professional but approachable, like expensive consulting deck meets approachable teacher
- Avoid: Corporate stiffness, too many colors, cluttered composition, generic icons
- Clean geometric shapes with organic edges for sketchy-but-crisp look
- Subtle grain texture for premium feel`;

  return prompt;
}

function getFontDescription(fontStyle: StyleConfig['fontStyle']): string {
  switch (fontStyle) {
    case 'switzer':
      return 'Switzer font style';
    case 'handwritten':
      return 'casual handwritten';
    case 'modern':
      return 'modern sans-serif';
    case 'classic':
      return 'classic serif';
    default:
      return 'Switzer font style';
  }
}

export function parseUserContent(rawText: string): InfographicContent {
  const lines = rawText.trim().split('\n').filter((line) => line.trim());
  
  let title = 'Infographic';
  const sections: InfographicContent['sections'] = [];
  let currentSection: InfographicContent['sections'][0] | null = null;
  let additionalNotes = '';

  for (const line of lines) {
    const trimmed = line.trim();
    
    // First non-empty line that's not a bullet becomes the title
    if (!title || title === 'Infographic') {
      if (trimmed && !trimmed.startsWith('•') && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
        title = trimmed;
        continue;
      }
    }

    // Check for section headers (lines ending with colon or all caps)
    if (trimmed.endsWith(':') || (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 50)) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        heading: trimmed.replace(':', ''),
        points: [],
      };
      continue;
    }

    // Check for bullet points
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const point = trimmed.replace(/^[•\-*]\s*/, '');
      if (currentSection) {
        currentSection.points.push(point);
      } else {
        // Create a default section if none exists
        currentSection = {
          heading: 'Key Points',
          points: [point],
        };
      }
      continue;
    }

    // Otherwise, it's additional notes or continuation
    if (trimmed.length > 0) {
      additionalNotes += (additionalNotes ? ' ' : '') + trimmed;
    }
  }

  // Push the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  // If no sections were created, create one with all content
  if (sections.length === 0) {
    sections.push({
      heading: 'Overview',
      points: lines.filter((l) => l.trim()).map((l) => l.replace(/^[•\-*]\s*/, '')),
    });
  }

  return {
    title,
    sections,
    additionalNotes: additionalNotes || undefined,
  };
}

export function generateBatchPrompts(
  content: InfographicContent,
  style: StyleConfig,
  variations: number = 3
): string[] {
  const basePrompt = buildInfographicPrompt(content, style);
  
  const variationsList = [
    '',
    ' with a slightly more colorful palette',
    ' with emphasis on diagrams and flowcharts',
  ];

  return Array.from({ length: variations }, (_, i) => {
    if (i === 0 || !variationsList[i]) {
      return basePrompt;
    }
    return basePrompt + '\n\nVariation:' + variationsList[i];
  });
}
