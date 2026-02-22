import { NextRequest, NextResponse } from 'next/server';

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

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(
    new URL('/login', resolveRequestOrigin(request)),
  );
  response.cookies.set('accessToken', '', { maxAge: 0, path: '/' });
  return response;
}
