// HIER IST DER MAGISCHE IMPORT: Wir laden defineConfig jetzt aus 'vitest/config' statt 'vite'
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  optimizeDeps: {
    include: ['dompurify']
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupTests.js'
  }
});