import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'graphql-raw-loader',
      enforce: 'pre',
      transform(code, id) {
        if (!id.endsWith('.graphql')) {
          return null;
        }

        return {
          code: `export default ${JSON.stringify(code)};`,
          map: null,
        };
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
});
