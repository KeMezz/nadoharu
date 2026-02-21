const DEFAULT_JWT_EXPIRES_IN = '15m';
const MIN_SECRET_LENGTH = 32;

type JwtExpiresIn = `${number}${'ms' | 's' | 'm' | 'h' | 'd'}`;

export interface JwtConfig {
  secret: string;
  expiresIn: JwtExpiresIn;
  expiresInMs: number;
}

export function parseDurationToMs(value: string): number {
  const normalized = value.trim();

  const match = /^(\d+)(ms|s|m|h|d)$/.exec(normalized);
  if (!match) {
    throw new Error(`INVALID_JWT_EXPIRES_IN_FORMAT: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'ms':
      return amount;
    case 's':
      return amount * 1000;
    case 'm':
      return amount * 60 * 1000;
    case 'h':
      return amount * 60 * 60 * 1000;
    case 'd':
      return amount * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`INVALID_JWT_EXPIRES_IN_FORMAT: ${value}`);
  }
}

export function validateJwtConfig(env: NodeJS.ProcessEnv): JwtConfig {
  const secret = env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters`,
    );
  }

  const expiresIn = env.JWT_EXPIRES_IN?.trim() || DEFAULT_JWT_EXPIRES_IN;
  const expiresInMs = parseDurationToMs(expiresIn);

  return {
    secret,
    expiresIn: expiresIn as JwtExpiresIn,
    expiresInMs,
  };
}
