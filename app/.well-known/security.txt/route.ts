import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Serve security.txt at /.well-known/security.txt
 * RFC 9116 compliant
 */
export async function GET() {
  const filePath = join(process.cwd(), 'public', '.well-known', 'security.txt');

  try {
    const content = readFileSync(filePath, 'utf-8');
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new NextResponse('security.txt not found', { status: 404 });
  }
}
