import { NextRequest, NextResponse } from 'next/server';

function createLoginRedirectUrl(request: NextRequest): URL {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  return url;
}

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(createLoginRedirectUrl(request));
  response.cookies.set('accessToken', '', { maxAge: 0, path: '/' });
  return response;
}
