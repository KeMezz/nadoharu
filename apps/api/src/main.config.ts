export function resolveCorsOrigin(env: NodeJS.ProcessEnv): string | boolean {
  if (env.NODE_ENV !== 'production') {
    return true;
  }

  const corsOrigin = env.CORS_ORIGIN?.trim();
  if (!corsOrigin) {
    throw new Error(
      'CORS_ORIGIN environment variable is required in production',
    );
  }

  return corsOrigin;
}

const DEFAULT_PRODUCTION_TRUST_PROXY_HOPS = 1;

export function resolveTrustProxy(env: NodeJS.ProcessEnv): number | null {
  const trustProxyHops = env.TRUST_PROXY_HOPS?.trim();

  if (!trustProxyHops) {
    return env.NODE_ENV === 'production'
      ? DEFAULT_PRODUCTION_TRUST_PROXY_HOPS
      : null;
  }

  const parsedHops = Number(trustProxyHops);
  if (!Number.isInteger(parsedHops) || parsedHops < 0) {
    throw new Error('TRUST_PROXY_HOPS must be a non-negative integer');
  }

  return parsedHops;
}
