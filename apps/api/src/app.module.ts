import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Request, Response } from 'express';
import { AuthModule } from './bounded-contexts/auth/infrastructure/auth.module';
import { PostModule } from './bounded-contexts/post/infrastructure/post.module';
import { formatGraphQLError } from './common/graphql/format-graphql-error';
import { resolveGraphqlSchemaFilePath } from './common/graphql/graphql-schema-path';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: resolveGraphqlSchemaFilePath(),
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
      formatError: formatGraphQLError,
    }),
    AuthModule,
    PostModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
