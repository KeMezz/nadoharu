import { ExecutionContext, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let warnSpy: jest.SpiedFunction<Logger['warn']>;

  beforeEach(() => {
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    guard = new JwtAuthGuard();
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe('getRequest', () => {
    it('GqlExecutionContext에서 req를 반환한다', () => {
      const mockRequest = { headers: { authorization: 'Bearer token' } };
      const mockContext = {} as ExecutionContext;

      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
        getContext: () => ({ req: mockRequest }),
      } as unknown as GqlExecutionContext);

      const result = guard.getRequest(mockContext);

      expect(result).toBe(mockRequest);
    });
  });

  describe('handleRequest', () => {
    it('인증된 사용자는 그대로 반환한다', () => {
      const user = { id: 'user-id-1', accountId: 'user_1' };

      const result = guard.handleRequest(null, user);

      expect(result).toBe(user);
    });

    it('사용자가 없으면 UNAUTHORIZED GraphQL 에러를 던진다', () => {
      expect(() => guard.handleRequest(null, null)).toThrow(GraphQLError);
      expect(warnSpy).toHaveBeenCalledWith(
        'JWT authentication failed: missing user',
      );

      try {
        guard.handleRequest(null, null);
      } catch (error) {
        const gqlError = error as GraphQLError;
        expect(gqlError.message).toBe('UNAUTHORIZED');
        expect(gqlError.extensions.code).toBe('UNAUTHORIZED');
      }
    });

    it('전달된 에러가 있으면 UNAUTHORIZED GraphQL 에러를 던진다', () => {
      expect(() => guard.handleRequest(new Error('jwt expired'), null)).toThrow(
        GraphQLError,
      );
      expect(warnSpy).toHaveBeenCalledWith(
        'JWT authentication failed: jwt expired',
      );
    });
  });
});
