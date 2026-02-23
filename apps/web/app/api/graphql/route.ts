import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_GRAPHQL_UPSTREAM_URL = 'http://localhost:3001/graphql';
const TRUSTED_CLIENT_IP_HEADERS = [
  'x-vercel-forwarded-for',
  'cf-connecting-ip',
  'fly-client-ip',
] as const;

function getUpstreamUrl(): string {
  return process.env.GRAPHQL_UPSTREAM_URL ?? DEFAULT_GRAPHQL_UPSTREAM_URL;
}

function getFirstIp(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const ip = value.split(',')[0]?.trim();
  return ip && ip.length > 0 ? ip : null;
}

function getTrustedClientIp(request: NextRequest): string | null {
  const requestWithIp = request as NextRequest & { ip?: string | null };
  const requestIp = requestWithIp.ip?.trim();
  if (requestIp && requestIp.length > 0) {
    return requestIp;
  }

  for (const headerName of TRUSTED_CLIENT_IP_HEADERS) {
    const ip = getFirstIp(request.headers.get(headerName));
    if (ip) {
      return ip;
    }
  }

  return null;
}

function getProxyHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'content-type': request.headers.get('content-type') ?? 'application/json',
  };

  const cookie = request.headers.get('cookie');
  if (cookie) {
    headers.cookie = cookie;
  }

  const clientIp = getTrustedClientIp(request);
  if (clientIp) {
    headers['x-forwarded-for'] = clientIp;
    headers['x-real-ip'] = clientIp;
  }

  return headers;
}

function getSetCookieHeaders(upstream: Response): string[] {
  const headers = upstream.headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headers.getSetCookie === 'function') {
    return headers.getSetCookie();
  }

  const setCookie = upstream.headers.get('set-cookie');
  return setCookie ? [setCookie] : [];
}

function copySetCookieHeader(
  upstream: Response,
  downstream: NextResponse,
): void {
  for (const setCookie of getSetCookieHeaders(upstream)) {
    downstream.headers.append('set-cookie', setCookie);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.text();
    const upstream = await fetch(getUpstreamUrl(), {
      method: 'POST',
      headers: getProxyHeaders(request),
      body,
      cache: 'no-store',
    });

    const response = new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: {
        'content-type':
          upstream.headers.get('content-type') ??
          'application/json; charset=utf-8',
      },
    });

    copySetCookieHeader(upstream, response);
    return response;
  } catch {
    return NextResponse.json(
      {
        errors: [
          {
            message: 'NETWORK_ERROR',
            extensions: {
              code: 'NETWORK_ERROR',
            },
          },
        ],
      },
      { status: 200 },
    );
  }
}
