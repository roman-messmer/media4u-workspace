import { defineConfig } from 'vitest/config'; 
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5175, strictPort: true },
  preview: { port: 5176 },
  base: '/',  
  
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './setupTests.js'
  }
});