// TODO: Next.js 16에서 middleware → proxy 컨벤션 전환 검토
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ONLY_ROUTES = ['/login', '/sign-up'];
const PROTECTED_ROUTES = ['/me', '/posts'];

function getFirstHeaderValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .split(',')
    .map((token) => token.trim())
    .find((token) => token.length > 0);

  return normalized ?? null;
}

function resolveRequestOrigin(request: NextRequest): string {
  const forwardedHost = getFirstHeaderValue(
    request.headers.get('x-forwarded-host'),
  );
  const forwardedProto = getFirstHeaderValue(
    request.headers.get('x-forwarded-proto'),
  );

  if (forwardedHost) {
    return `${forwardedProto ?? 'https'}://${forwardedHost}`;
  }

  const host = getFirstHeaderValue(request.headers.get('host'));
  if (host) {
    const protocol =
      forwardedProto ?? request.nextUrl.protocol.replace(':', '') ?? 'http';
    return `${protocol}://${host}`;
  }

  return request.nextUrl.origin;
}

function createRedirectUrl(request: NextRequest, pathname: string): URL {
  return new URL(pathname, resolveRequestOrigin(request));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has('accessToken');

  if (PUBLIC_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    if (hasToken) {
      return NextResponse.redirect(createRedirectUrl(request, '/me'));
    }
    return NextResponse.next();
  }

  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!hasToken) {
      return NextResponse.redirect(createRedirectUrl(request, '/login'));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/sign-up', '/me/:path*', '/posts/:path*'],
};
