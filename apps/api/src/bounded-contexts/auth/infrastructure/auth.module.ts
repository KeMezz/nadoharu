import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '.prisma/client';
import { AuthenticateUserUseCase } from '../application/use-cases/authenticate-user.use-case';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';
import { PasswordService } from '../domain/services/password.service';
import { AuthResolver } from './graphql/resolvers/auth.resolver';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtTokenService } from './jwt/jwt-token.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { validateJwtConfig } from './jwt/jwt-config';
import { PrismaUserRepository } from './persistence/prisma-user.repository';
import { LoginRateLimitService } from './security/login-rate-limit.service';

const prismaProvider = {
  provide: 'PrismaClient',
  useFactory: () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required');
    }

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  },
};

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => {
        const config = validateJwtConfig(process.env);
        return {
          secret: config.secret,
          signOptions: {
            algorithm: 'HS256',
            expiresIn: config.expiresIn,
          },
          verifyOptions: {
            algorithms: ['HS256'],
          },
        };
      },
    }),
  ],
  providers: [
    prismaProvider,
    PasswordService,
    PrismaUserRepository,
    RegisterUserUseCase,
    AuthenticateUserUseCase,
    JwtTokenService,
    JwtStrategy,
    JwtAuthGuard,
    LoginRateLimitService,
    AuthResolver,
    {
      provide: 'UserRepository',
      useExisting: PrismaUserRepository,
    },
    {
      provide: 'TokenService',
      useExisting: JwtTokenService,
    },
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
