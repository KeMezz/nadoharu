import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case';
import { AuthenticateUserUseCase } from '../../../application/use-cases/authenticate-user.use-case';
import {
  AccountTemporarilyLockedError,
  InvalidCredentialsError,
} from '../../../domain/errors/auth.error';
import { User } from '../../../domain/entities/user.entity';
import { toAuthGraphQLError } from '../auth-error.mapper';
import {
  AuthPayload,
  CreateUserInput,
  LoginInput,
  UserType,
} from '../types/auth.types';
import { LoginRateLimitService } from '../../security/login-rate-limit.service';
import { parseDurationToMs } from '../../jwt/jwt-config';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    private readonly loginRateLimitService: LoginRateLimitService,
  ) {}

  @Mutation(() => UserType)
  async createUser(@Args('input') input: CreateUserInput): Promise<UserType> {
    try {
      const user = await this.registerUserUseCase.execute(input);
      return this.toUserType(user);
    } catch (error) {
      throw toAuthGraphQLError(error);
    }
  }

  @Mutation(() => AuthPayload)
  async login(
    @Args('input') input: LoginInput,
    @Context('req') request: Request,
    @Context('res') response: Response,
  ): Promise<AuthPayload> {
    const ip = this.extractIp(request);

    try {
      this.loginRateLimitService.assertNotLocked(input.accountId, ip);

      const result = await this.authenticateUserUseCase.execute(input);

      this.loginRateLimitService.reset(input.accountId, ip);
      response.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
        maxAge: parseDurationToMs(process.env.JWT_EXPIRES_IN?.trim() || '15m'),
      });

      return {
        user: this.toUserType(result.user),
      };
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        const result = this.loginRateLimitService.recordFailure(
          input.accountId,
          ip,
        );
        if (result.locked) {
          throw toAuthGraphQLError(new AccountTemporarilyLockedError());
        }
      }

      throw toAuthGraphQLError(error);
    }
  }

  private extractIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0].trim();
    }

    return request.ip || 'unknown';
  }

  private toUserType(user: User): UserType {
    return {
      id: user.getId(),
      accountId: user.getAccountId().getValue(),
      email: user.getEmail().getValue(),
      name: user.getName(),
      createdAt: user.getCreatedAt(),
    };
  }
}
