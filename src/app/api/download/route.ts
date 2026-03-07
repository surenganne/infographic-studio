import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  const response = await fetch(url);
  if (!response.ok) return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });

  const blob = await response.blob();
  return new NextResponse(blob, {
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'image/png',
      'Content-Disposition': 'attachment; filename="infographic.png"',
    },
  });
}
