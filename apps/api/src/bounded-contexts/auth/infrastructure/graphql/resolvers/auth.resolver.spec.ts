import { GraphQLError } from 'graphql';
import { Request, Response } from 'express';
import { User } from '../../../domain/entities/user.entity';
import {
  AccountTemporarilyLockedError,
  InvalidCredentialsError,
} from '../../../domain/errors/auth.error';
import { AuthenticateUserUseCase } from '../../../application/use-cases/authenticate-user.use-case';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case';
import { LoginRateLimitService } from '../../security/login-rate-limit.service';
import { JwtConfig } from '../../jwt/jwt-config';
import { AuthResolver } from './auth.resolver';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let registerUserUseCase: jest.Mocked<RegisterUserUseCase>;
  let authenticateUserUseCase: jest.Mocked<AuthenticateUserUseCase>;
  let loginRateLimitService: jest.Mocked<LoginRateLimitService>;
  let jwtConfig: JwtConfig;

  const mockUser = User.reconstitute({
    id: '550e8400-e29b-41d4-a716-446655440000',
    accountId: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: '$2b$10$hashed',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  });

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    jwtConfig = {
      secret: '12345678901234567890123456789012',
      expiresIn: '15m',
      expiresInMs: 900000,
    };

    registerUserUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<RegisterUserUseCase>;

    authenticateUserUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<AuthenticateUserUseCase>;

    loginRateLimitService = {
      createKey: jest.fn(),
      assertNotLocked: jest.fn(),
      isLocked: jest.fn(),
      recordFailure: jest.fn(),
      reset: jest.fn(),
    } as unknown as jest.Mocked<LoginRateLimitService>;

    resolver = new AuthResolver(
      registerUserUseCase,
      authenticateUserUseCase,
      loginRateLimitService,
      jwtConfig,
    );
  });

  describe('createUser', () => {
    it('회원가입 성공 시 User를 반환한다', async () => {
      registerUserUseCase.execute.mockResolvedValue(mockUser);

      const result = await resolver.createUser({
        accountId: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
      });

      expect(result).toEqual({
        id: mockUser.getId(),
        accountId: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      });
    });

    it('회원가입 실패 시 GraphQL 에러 코드로 변환한다', async () => {
      registerUserUseCase.execute.mockRejectedValue(new Error('NAME_REQUIRED'));

      await expect(
        resolver.createUser({
          accountId: 'testuser',
          email: 'test@example.com',
          name: '',
          password: 'Password123!',
        }),
      ).rejects.toMatchObject({
        message: 'NAME_REQUIRED',
        extensions: { code: 'NAME_REQUIRED' },
      });
    });

    it('이미 GraphQLError인 경우 그대로 전달한다', async () => {
      registerUserUseCase.execute.mockRejectedValue(
        new GraphQLError('UNAUTHORIZED', {
          extensions: { code: 'UNAUTHORIZED' },
        }),
      );

      await expect(
        resolver.createUser({
          accountId: 'testuser',
          email: 'test@example.com',
          name: 'Test User',
          password: 'Password123!',
        }),
      ).rejects.toMatchObject({
        message: 'UNAUTHORIZED',
        extensions: { code: 'UNAUTHORIZED' },
      });
    });
  });

  describe('login', () => {
    it('로그인 성공 시 쿠키를 설정하고 사용자 정보를 반환한다', async () => {
      authenticateUserUseCase.execute.mockResolvedValue({
        accessToken: 'jwt.token.value',
        user: mockUser,
      });

      const request = {
        ip: '127.0.0.1',
        headers: {},
      } as unknown as Request;
      const response = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await resolver.login(
        {
          accountId: 'testuser',
          password: 'Password123!',
        },
        request,
        response,
      );

      expect(loginRateLimitService.assertNotLocked).toHaveBeenCalledWith(
        'testuser',
        '127.0.0.1',
      );
      expect(loginRateLimitService.reset).toHaveBeenCalledWith(
        'testuser',
        '127.0.0.1',
      );

      expect(response.cookie).toHaveBeenCalledWith(
        'accessToken',
        'jwt.token.value',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
          secure: false,
          sameSite: 'lax',
          maxAge: 900000,
        }),
      );

      expect(result.user.id).toBe(mockUser.getId());
    });

    it('쿠키 maxAge는 주입된 JwtConfig 값을 사용한다', async () => {
      jwtConfig.expiresInMs = 120000;
      process.env.JWT_EXPIRES_IN = '1h';

      authenticateUserUseCase.execute.mockResolvedValue({
        accessToken: 'jwt.token.value',
        user: mockUser,
      });

      const request = {
        ip: '127.0.0.1',
        headers: {},
      } as unknown as Request;
      const response = {
        cookie: jest.fn(),
      } as unknown as Response;

      await resolver.login(
        {
          accountId: 'testuser',
          password: 'Password123!',
        },
        request,
        response,
      );

      expect(response.cookie).toHaveBeenCalledWith(
        'accessToken',
        'jwt.token.value',
        expect.objectContaining({
          maxAge: 120000,
        }),
      );
    });

    it('x-forwarded-for 헤더가 있어도 request.ip를 우선 사용한다', async () => {
      authenticateUserUseCase.execute.mockResolvedValue({
        accessToken: 'jwt.token.value',
        user: mockUser,
      });

      const request = {
        ip: '127.0.0.1',
        headers: { 'x-forwarded-for': '10.1.1.1, 10.1.1.2' },
      } as unknown as Request;
      const response = {
        cookie: jest.fn(),
      } as unknown as Response;

      await resolver.login(
        {
          accountId: 'testuser',
          password: 'Password123!',
        },
        request,
        response,
      );

      expect(loginRateLimitService.assertNotLocked).toHaveBeenCalledWith(
        'testuser',
        '127.0.0.1',
      );
    });

    it('프로덕션 환경에서는 secure/sameSite=strict 쿠키를 설정한다', async () => {
      process.env.NODE_ENV = 'production';

      authenticateUserUseCase.execute.mockResolvedValue({
        accessToken: 'jwt.token.value',
        user: mockUser,
      });

      const request = {
        ip: '127.0.0.1',
        headers: {},
      } as unknown as Request;
      const response = {
        cookie: jest.fn(),
      } as unknown as Response;

      await resolver.login(
        {
          accountId: 'testuser',
          password: 'Password123!',
        },
        request,
        response,
      );

      expect(response.cookie).toHaveBeenCalledWith(
        'accessToken',
        'jwt.token.value',
        expect.objectContaining({
          secure: true,
          sameSite: 'strict',
        }),
      );
    });

    it('ip 정보가 없으면 unknown으로 처리한다', async () => {
      authenticateUserUseCase.execute.mockResolvedValue({
        accessToken: 'jwt.token.value',
        user: mockUser,
      });

      const request = {
        headers: {},
      } as unknown as Request;
      const response = {
        cookie: jest.fn(),
      } as unknown as Response;

      await resolver.login(
        {
          accountId: 'testuser',
          password: 'Password123!',
        },
        request,
        response,
      );

      expect(loginRateLimitService.assertNotLocked).toHaveBeenCalledWith(
        'testuser',
        'unknown',
      );
    });

    it('인증 외 예외는 실패 카운트 없이 INTERNAL_SERVER_ERROR로 변환한다', async () => {
      authenticateUserUseCase.execute.mockRejectedValue(
        new Error('UNEXPECTED_ERROR'),
      );

      const request = {
        ip: '127.0.0.1',
        headers: {},
      } as unknown as Request;
      const response = {
        cookie: jest.fn(),
      } as unknown as Response;

      await expect(
        resolver.login(
          {
            accountId: 'testuser',
            password: 'Password123!',
          },
          request,
          response,
        ),
      ).rejects.toMatchObject({
        message: 'INTERNAL_SERVER_ERROR',
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });

      expect(loginRateLimitService.recordFailure).not.toHaveBeenCalled();
    });

    it('인증 실패 시 실패 카운트를 증가시키고 INVALID_CREDENTIALS를 반환한다', async () => {
      authenticateUserUseCase.execute.mockRejectedValue(
        new InvalidCredentialsError(),
      );
      loginRateLimitService.recordFailure.mockReturnValue({ locked: false });

      const request = {
        ip: '127.0.0.1',
        headers: {},
      } as unknown as Request;
      const response = {
        cookie: jest.fn(),
      } as unknown as Response;

      await expect(
        resolver.login(
          {
            accountId: 'testuser',
            password: 'WrongPassword!',
          },
          request,
          response,
        ),
      ).rejects.toMatchObject({
        message: 'INVALID_CREDENTIALS',
        extensions: { code: 'INVALID_CREDENTIALS' },
      });

      expect(loginRateLimitService.recordFailure).toHaveBeenCalledWith(
        'testuser',
        '127.0.0.1',
      );
    });

    it('실패 카운트가 임계치에 도달하면 ACCOUNT_TEMPORARILY_LOCKED를 반환한다', async () => {
      authenticateUserUseCase.execute.mockRejectedValue(
        new InvalidCredentialsError(),
      );
      loginRateLimitService.recordFailure.mockReturnValue({ locked: true });

      const request = {
        ip: '127.0.0.1',
        headers: {},
      } as unknown as Request;
      const response = {
        cookie: jest.fn(),
      } as unknown as Response;

      await expect(
        resolver.login(
          {
            accountId: 'testuser',
            password: 'WrongPassword!',
          },
          request,
          response,
        ),
      ).rejects.toMatchObject({
        message: 'ACCOUNT_TEMPORARILY_LOCKED',
        extensions: { code: 'ACCOUNT_TEMPORARILY_LOCKED' },
      });
    });

    it('이미 잠긴 계정으로 요청 시 ACCOUNT_TEMPORARILY_LOCKED를 반환한다', async () => {
      loginRateLimitService.assertNotLocked.mockImplementation(() => {
        throw new AccountTemporarilyLockedError();
      });

      const request = {
        ip: '127.0.0.1',
        headers: {},
      } as unknown as Request;
      const response = {
        cookie: jest.fn(),
      } as unknown as Response;

      await expect(
        resolver.login(
          {
            accountId: 'testuser',
            password: 'Password123!',
          },
          request,
          response,
        ),
      ).rejects.toBeInstanceOf(GraphQLError);

      await expect(
        resolver.login(
          {
            accountId: 'testuser',
            password: 'Password123!',
          },
          request,
          response,
        ),
      ).rejects.toMatchObject({
        message: 'ACCOUNT_TEMPORARILY_LOCKED',
        extensions: { code: 'ACCOUNT_TEMPORARILY_LOCKED' },
      });
    });
  });
});
