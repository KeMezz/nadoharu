import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override getRequest(context: ExecutionContext): unknown {
    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext().req;
  }

  override handleRequest<TUser = unknown>(error: unknown, user: TUser): TUser {
    if (error || !user) {
      throw new GraphQLError('UNAUTHORIZED', {
        extensions: {
          code: 'UNAUTHORIZED',
        },
      });
    }

    return user;
  }
}
