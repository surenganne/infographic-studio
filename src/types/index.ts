export interface StyleConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  lineWorkColor: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  resolution: '1K' | '2K' | '4K';
  fontStyle: 'switzer' | 'handwritten' | 'modern' | 'classic';
  diagramStyle: 'infographic' | 'technical' | 'flowchart' | 'comparison';
}

export interface InfographicContent {
  title: string;
  sections: ContentSection[];
  additionalNotes?: string;
}

export interface ContentSection {
  heading: string;
  points: string[];
}

export interface GenerationRequest {
  content: InfographicContent;
  style: StyleConfig;
}

export interface GenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  generationId?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: Date;
  content: InfographicContent;
  style: StyleConfig;
}

export interface KeiApiRequest {
  prompt: string;
  resolution: '1K' | '2K' | '4K';
  aspect_ratio: string;
  output_format: 'png' | 'jpg';
  usePro?: boolean;
}

export interface KeiApiResponse {
  image_url?: string;
  images?: string[];
  error?: string;
}

export const DEFAULT_STYLE_CONFIG: StyleConfig = {
  primaryColor: '#FF8000',
  secondaryColor: '#2B7EF9',
  backgroundColor: '#FFFFFF',
  lineWorkColor: '#2A2A2A',
  aspectRatio: '16:9',
  resolution: '2K',
  fontStyle: 'switzer',
  diagramStyle: 'infographic',
};
