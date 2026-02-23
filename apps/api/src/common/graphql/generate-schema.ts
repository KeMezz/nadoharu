import { existsSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { resolveGraphqlSchemaFilePath } from './graphql-schema-path';

const DEFAULT_DATABASE_URL =
  'postgresql://nadoharu:nadoharu_dev@localhost:5432/nadoharu';
const DEFAULT_JWT_SECRET = 'nadoharu-dev-jwt-secret-at-least-32-characters';

async function generateSchema(): Promise<void> {
  process.env.DATABASE_URL ??= DEFAULT_DATABASE_URL;
  process.env.JWT_SECRET ??= DEFAULT_JWT_SECRET;

  const app = await NestFactory.create(AppModule, { logger: false });
  await app.init();
  await app.close();

  const schemaFilePath = resolveGraphqlSchemaFilePath();
  if (!existsSync(schemaFilePath)) {
    throw new Error(`GraphQL schema file was not generated: ${schemaFilePath}`);
  }
}

void generateSchema();
