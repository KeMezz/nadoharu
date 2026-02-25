import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ONLY_ROUTES = ['/login', '/sign-up'];
const PROTECTED_ROOT_ROUTES = ['/me'];

function isProtectedRoute(pathname: string): boolean {
  if (PROTECTED_ROOT_ROUTES.some((route) => pathname.startsWith(route))) {
    return true;
  }

  if (pathname === '/posts/new') {
    return true;
  }

  return /^\/posts\/[^/]+\/edit$/.test(pathname);
}

function createRedirectUrl(request: NextRequest, pathname: string): URL {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';
  return url;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has('accessToken');

  if (PUBLIC_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    if (hasToken) {
      return NextResponse.redirect(createRedirectUrl(request, '/me'));
    }
    return NextResponse.next();
  }

  if (isProtectedRoute(pathname)) {
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
