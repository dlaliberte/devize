import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './src/testing/vitest.setup.ts',
      // './src/testing/setup.ts', not used, yet
      './src/test/setup.ts'
    ],
    include: [
      './test/**/*.{test,spec}.{js,ts,jsx,tsx}',
      './src/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    exclude: ['**/node_modules/**', '**/dist/**']
  }
});
