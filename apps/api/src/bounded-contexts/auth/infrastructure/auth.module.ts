import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthenticateUserUseCase } from '../application/use-cases/authenticate-user.use-case';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';
import { PasswordService } from '../domain/services/password.service';
import { AuthResolver } from './graphql/resolvers/auth.resolver';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtTokenService } from './jwt/jwt-token.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { JwtConfig, validateJwtConfig } from './jwt/jwt-config';
import { PrismaClientProvider } from './persistence/prisma-client.provider';
import { PrismaUserRepository } from './persistence/prisma-user.repository';
import { LoginRateLimitService } from './security/login-rate-limit.service';

const buildJwtConfig = (): JwtConfig => validateJwtConfig(process.env);

const jwtConfigProvider = {
  provide: 'JwtConfig',
  useFactory: buildJwtConfig,
};

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => {
        const config = buildJwtConfig();
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
    PrismaClientProvider,
    {
      provide: 'PrismaClient',
      useExisting: PrismaClientProvider,
    },
    jwtConfigProvider,
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
