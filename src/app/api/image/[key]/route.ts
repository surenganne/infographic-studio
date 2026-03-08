import { getObjectStream } from '@/lib/storage';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const decodedKey = decodeURIComponent(key);
    const { body, contentType } = await getObjectStream(decodedKey);

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[image route] Error:', error);
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}
