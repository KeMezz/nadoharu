import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../api/schema.graphql',
  documents: ['src/lib/graphql/**/*.graphql'],
  generates: {
    'src/lib/graphql/generated.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        scalars: {
          DateTime: 'string',
          Date: 'string',
        },
      },
    },
  },
};

export default config;
