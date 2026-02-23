import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../api/schema.graphql',
  documents: ['app/**/*.graphql', 'src/**/*.graphql'],
  generates: {
    'src/lib/graphql/generated.ts': {
      plugins: ['typescript'],
      config: {
        scalars: {
          DateTime: 'string',
          Date: 'string',
        },
      },
    },
    '.': {
      preset: 'near-operation-file',
      presetConfig: {
        extension: '.generated.ts',
        baseTypesPath: 'src/lib/graphql/generated.ts',
      },
      plugins: ['typescript-operations'],
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
