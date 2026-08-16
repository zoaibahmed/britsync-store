import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, STAFF_ROLES, MAKER_ROLES } from './lib/session';

// In-memory sliding window rate limiter map for API endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 200;

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
  const isOperationsRoute = path.startsWith('/dashboard/operations');
  const isAdminRoute = path.startsWith('/dashboard/admin');
  const isCeoRoute = path.startsWith('/dashboard/ceo');
  const isMakerRoute = path.startsWith('/dashboard/maker');
  const isInspectorRoute = path.startsWith('/dashboard/inspector');
  const isBuyerRoute = path.startsWith('/dashboard/buyer');

  if (isOperationsRoute || isAdminRoute || isCeoRoute || isMakerRoute || isInspectorRoute || isBuyerRoute) {
    const sessionCookie = request.cookies.get('britsync_session')?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const session = await verifySessionToken(sessionCookie);

    if (!session) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('britsync_session');
      return response;
    }

    // Role-based authorization checks
    if ((isOperationsRoute || isCeoRoute || isAdminRoute) && !STAFF_ROLES.includes(session.role)) {
      return NextResponse.redirect(new URL('/login?error=UnauthorizedStaff', request.url));
    }

    if (isMakerRoute && !MAKER_ROLES.includes(session.role)) {
      return NextResponse.redirect(new URL('/login?error=UnauthorizedMaker', request.url));
    }

    if (isInspectorRoute && !['INSPECTOR', 'CEO', 'SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.redirect(new URL('/login?error=UnauthorizedInspector', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*'
  ]
};
