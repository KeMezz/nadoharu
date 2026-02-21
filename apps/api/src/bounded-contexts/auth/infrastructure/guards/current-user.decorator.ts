import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticatedUser } from '../jwt/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (
    _data: unknown,
    context: ExecutionContext,
  ): AuthenticatedUser | undefined => {
    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext().req?.user as AuthenticatedUser | undefined;
  },
);
