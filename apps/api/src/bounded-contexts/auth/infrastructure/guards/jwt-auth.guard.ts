import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  override getRequest(context: ExecutionContext): unknown {
    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext().req;
  }

  override handleRequest<TUser = unknown>(error: unknown, user: TUser): TUser {
    if (error || !user) {
      const reason = error instanceof Error ? error.message : 'missing user';
      this.logger.warn(`JWT authentication failed: ${reason}`);

      throw new GraphQLError('UNAUTHORIZED', {
        extensions: {
          code: 'UNAUTHORIZED',
        },
      });
    }

    return user;
  }
}
