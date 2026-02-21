import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  TokenPayload,
  TokenService,
} from '../../application/ports/token-service.interface';
import { UnauthorizedError } from '../../domain/errors/auth.error';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: Pick<TokenPayload, 'sub' | 'accountId'>): string {
    return this.jwtService.sign(
      {
        sub: String(payload.sub),
        accountId: payload.accountId,
      },
      {
        algorithm: 'HS256',
      },
    );
  }

  verify(token: string): TokenPayload {
    try {
      const payload = this.jwtService.verify<TokenPayload>(token, {
        algorithms: ['HS256'],
      });

      if (!payload || typeof payload.sub !== 'string') {
        throw new UnauthorizedError();
      }

      if (typeof payload.accountId !== 'string') {
        throw new UnauthorizedError();
      }

      return payload;
    } catch {
      throw new UnauthorizedError();
    }
  }
}
