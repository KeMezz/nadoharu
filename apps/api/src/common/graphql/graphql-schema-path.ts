import path from 'path';

export function resolveGraphqlSchemaFilePath(): string {
  return path.join(process.cwd(), 'schema.graphql');
}
