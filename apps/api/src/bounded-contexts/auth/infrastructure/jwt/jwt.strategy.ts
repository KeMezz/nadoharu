import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../../application/ports/token-service.interface';
import { UnauthorizedError } from '../../domain/errors/auth.error';
import { validateJwtConfig } from './jwt-config';

export interface AuthenticatedUser {
  id: string;
  accountId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const config = validateJwtConfig(process.env);

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        JwtStrategy.extractTokenFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.secret,
      algorithms: ['HS256'],
    });
  }

  static extractTokenFromCookie(request: {
    headers?: { cookie?: string };
  }): string | null {
    const cookieHeader = request?.headers?.cookie;
    if (!cookieHeader) {
      return null;
    }

    const accessTokenCookie = cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith('accessToken='));

    if (!accessTokenCookie) {
      return null;
    }

    const value = accessTokenCookie.split('=').slice(1).join('=');
    return value || null;
  }

  validate(payload: TokenPayload): AuthenticatedUser {
    if (!payload || typeof payload.sub !== 'string') {
      throw new UnauthorizedError();
    }

    if (typeof payload.accountId !== 'string') {
      throw new UnauthorizedError();
    }

    return {
      id: payload.sub,
      accountId: payload.accountId,
    };
  }
}
