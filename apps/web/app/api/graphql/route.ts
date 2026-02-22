import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_GRAPHQL_UPSTREAM_URL = 'http://localhost:3001/graphql';

function getUpstreamUrl(): string {
  return (
    process.env.GRAPHQL_UPSTREAM_URL ??
    process.env.NEXT_PUBLIC_GRAPHQL_URL ??
    DEFAULT_GRAPHQL_UPSTREAM_URL
  );
}

function getProxyHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'content-type': request.headers.get('content-type') ?? 'application/json',
  };

  const cookie = request.headers.get('cookie');
  if (cookie) {
    headers.cookie = cookie;
  }

  return headers;
}

function copySetCookieHeader(
  upstream: Response,
  downstream: NextResponse,
): void {
  const setCookie = upstream.headers.get('set-cookie');
  if (setCookie) {
    downstream.headers.set('set-cookie', setCookie);
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
