import { getObjectStream } from '@/lib/storage';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

  try {
    const { body, contentType } = await getObjectStream(decodeURIComponent(key));
    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="infographic-${Date.now()}.png"`,
      },
    });
  } catch (error) {
    console.error('[download route] Error:', error);
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}
