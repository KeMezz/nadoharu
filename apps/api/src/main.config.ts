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
