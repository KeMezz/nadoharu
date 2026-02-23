import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ONLY_ROUTES = ['/login', '/sign-up'];
const PROTECTED_ROUTES = ['/me', '/posts'];

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
