import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/testing/vitest.setup.ts'],

    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/']
    }
  },

});
