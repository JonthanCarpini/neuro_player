import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://192.168.100.10',
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // webOS apps run from file:// or null origin
  if (origin === 'null' || origin.startsWith('file://')) return true;
  // Allow same domain
  if (origin.includes('neuroplay.vp1.officex.site')) return true;
  return false;
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && isAllowedOrigin(origin) ? origin : '*';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin');

  // Handle preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
  }

  // Add CORS headers to all API responses
  const res = NextResponse.next();
  const headers = corsHeaders(origin);
  for (const [key, value] of Object.entries(headers)) {
    res.headers.set(key, value);
  }

  // Security headers
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');

  return res;
}

export const config = {
  matcher: '/api/:path*',
};
