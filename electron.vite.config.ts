import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'electron-vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: resolve(__dirname, 'electron/main.ts'),
      },
      outDir: 'dist-electron/main',
    },
  },
  preload: {
    build: {
      lib: {
        entry: resolve(__dirname, 'electron/preload.ts'),
        fileName: () => 'preload.cjs',
      },
      rollupOptions: {
        output: {
          format: 'cjs',
        },
      },
      outDir: 'dist-electron/preload',
    },
  },
  renderer: {
    root: resolve(__dirname, '.'),
    build: {
      outDir: 'dist-electron/renderer',
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    plugins: [react()],
  },
});
