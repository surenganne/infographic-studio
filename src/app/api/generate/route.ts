import { KeiApiClient } from '@/lib/kei-api';
import { KeiApiRequest, KeiApiResponse } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body: KeiApiRequest = await request.json();
    const { prompt, resolution, aspect_ratio, output_format, usePro } = body;

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.KEI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'KEI_API_KEY environment variable is not configured' },
        { status: 500 }
      );
    }

    const client = new KeiApiClient(apiKey);

    const apiRequest: KeiApiRequest = {
      prompt,
      resolution: resolution || '2K',
      aspect_ratio: aspect_ratio || '16:9',
      output_format: output_format || 'png',
    };

    let response: KeiApiResponse;

    if (usePro) {
      response = await client.generateImagePro(apiRequest);
    } else {
      response = await client.generateImage(apiRequest);
    }

    if (response.error) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: response.image_url,
      images: response.images,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[generate route] Error:', errorMessage, error);

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
