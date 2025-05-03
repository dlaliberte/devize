import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'src/client'),
  build: {
    outDir: resolve(__dirname, 'dist/client'),
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/client/index.html'),
      },
    },
  },
  server: {
    port: 3000,
  },
});
