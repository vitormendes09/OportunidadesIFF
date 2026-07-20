import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from './lib/session-constants';

// Next.js 16 renomeou Middleware para Proxy (mesma função/API, ver
// node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md).
// Isto é uma checagem OTIMISTA (só decodifica o payload do JWT, não valida
// assinatura) — a autorização real continua sendo sempre feita no backend
// (RolesGuard). Ver "Optimistic checks with Proxy" na doc de authentication.

const PUBLIC_ROUTES = ['/login', '/register'];

interface SessionPayload {
  sub: string;
  role: 'admin' | 'student';
  exp: number;
}

function decodeSession(token: string): SessionPayload | null {
  try {
    const payloadSegment = token.split('.')[1];
    const json = Buffer.from(payloadSegment, 'base64url').toString('utf8');
    const payload = JSON.parse(json) as SessionPayload;
    if (!payload.exp || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? decodeSession(token) : null;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAdminRoute = pathname.startsWith('/admin');

  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (session && isAdminRoute && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
