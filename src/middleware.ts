import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from './lib/session';

// In-memory sliding window rate limiter map for API endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Rate Limiting for API routes
  if (path.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const clientData = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + RATE_LIMIT_WINDOW_MS;
    } else {
      clientData.count += 1;
    }

    rateLimitMap.set(ip, clientData);

    if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
      return new NextResponse(
        JSON.stringify({ error: 'Too Many Requests', message: 'API rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Define protected dashboard routes
  const isAdminRoute = path.startsWith('/dashboard/admin');
  const isMakerRoute = path.startsWith('/dashboard/maker');
  const isInspectorRoute = path.startsWith('/dashboard/inspector');
  const isBuyerRoute = path.startsWith('/dashboard/buyer');
  const isCeoRoute = path.startsWith('/dashboard/ceo');

  if (isAdminRoute || isMakerRoute || isInspectorRoute || isBuyerRoute || isCeoRoute) {
    const sessionCookie = request.cookies.get('britsync_session')?.value;

    if (!sessionCookie) {
      // Redirect to login page if no session cookie exists
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const session = await verifySessionToken(sessionCookie);

    if (!session) {
      // Clear invalid session cookie and redirect
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('britsync_session');
      return response;
    }

    // Role-based authorization check
    if (isAdminRoute && !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.redirect(new URL('/login?error=UnauthorizedAdmin', request.url));
    }

    if (isMakerRoute && session.role !== 'MAKER') {
      return NextResponse.redirect(new URL('/login?error=UnauthorizedMaker', request.url));
    }

    if (isInspectorRoute && session.role !== 'INSPECTOR') {
      return NextResponse.redirect(new URL('/login?error=UnauthorizedInspector', request.url));
    }

    if (isCeoRoute && !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.redirect(new URL('/login?error=UnauthorizedCeo', request.url));
    }
  }

  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*'
  ]
};
