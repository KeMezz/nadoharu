import path from 'path';
import { resolveGraphqlSchemaFilePath } from './graphql-schema-path';

describe('resolveGraphqlSchemaFilePath', () => {
  it('현재 작업 디렉터리 기준 schema.graphql 경로를 반환한다', () => {
    expect(resolveGraphqlSchemaFilePath()).toBe(
      path.join(process.cwd(), 'schema.graphql'),
    );
  });
});
